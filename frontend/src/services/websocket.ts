import { BidResponse } from '../types';

const getWsBase = (): string => {
  if (import.meta.env.VITE_BIDDING_WS_URL) {
    return import.meta.env.VITE_BIDDING_WS_URL;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Connect through Nginx reverse proxy on the same host & port (e.g., ws://localhost:3000)
    return `${protocol}//${window.location.host}`;
  }
  return 'ws://localhost:8081';
};

export class AuctionSocket {
  private socket: WebSocket | null = null;
  private auctionId: string;
  private token: string;
  private onMessageCallback: (data: BidResponse) => void;
  private onStatusCallback: (status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED') => void;
  private reconnectTimeout: number | null = null;
  private isExplicitlyClosed = false;

  constructor(
    auctionId: string,
    token: string,
    onMessage: (data: BidResponse) => void,
    onStatus: (status: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED') => void
  ) {
    this.auctionId = auctionId;
    this.token = token;
    this.onMessageCallback = onMessage;
    this.onStatusCallback = onStatus;
  }

  public updateToken(newToken: string): void {
    this.token = newToken;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Re-authenticate if socket is open with old token
      this.disconnect();
      this.connect();
    }
  }

  public connect(): void {
    this.isExplicitlyClosed = false;
    this.onStatusCallback('CONNECTING');

    // Retrieve active token from storage if constructor token was empty
    const activeToken = this.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') || '' : '');
    this.token = activeToken;

    const encodedToken = encodeURIComponent(activeToken);
    const wsBase = getWsBase();
    const wsUrl = `${wsBase}/ws/auction/${this.auctionId}?token=${encodedToken}`;

    console.log(`[WebSocket] Connecting to Go Bidding Engine at ${wsUrl}`);

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`[WebSocket] Connected successfully to auction pool: ${this.auctionId}`);
        this.onStatusCallback('CONNECTED');
      };

      this.socket.onmessage = (event) => {
        try {
          const data: BidResponse = JSON.parse(event.data);
          this.onMessageCallback(data);
        } catch (e) {
          console.error('[WebSocket] Failed to parse message frame:', event.data);
        }
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
      };

      this.socket.onclose = (event) => {
        console.log(`[WebSocket] Connection closed (code: ${event.code}, reason: ${event.reason || 'none'})`);
        this.onStatusCallback('DISCONNECTED');
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('[WebSocket] Setup exception:', err);
      this.onStatusCallback('DISCONNECTED');
      this.scheduleReconnect();
    }
  }

  public sendBid(bidAmount: number, idempotencyKey?: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      // Attempt an immediate reconnect if token is now available
      if (!this.token && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('token');
        if (stored) {
          this.token = stored;
          this.connect();
        }
      }
      throw new Error('WebSocket is not connected to bidding engine. Reconnecting...');
    }

    const key = idempotencyKey || 'idemp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    const payload = {
      auctionId: this.auctionId,
      bidAmount: bidAmount,
      idempotencyKey: key,
    };

    console.log(`[WebSocket] Emitting proposed bid: ${bidAmount} with idempotencyKey: ${key}`);
    this.socket.send(JSON.stringify(payload));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = window.setTimeout(() => {
      console.log('[WebSocket] Attempting auto-reconnect...');
      this.connect();
    }, 2500);
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
