#!/bin/bash
set -e

mkdir -p /home/nodejs/whatsapp-gateway/auth_info
cd /home/nodejs/whatsapp-gateway

cat << 'PKGJSON' > package.json
{
  "name": "whatsapp-gateway",
  "version": "1.0.0",
  "description": "Al Wataneya Auctions WhatsApp OTP and Notification Gateway",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.6.0",
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "qrcode": "^1.5.3",
    "pino": "^8.19.0",
    "@hapi/boom": "^10.0.1"
  }
}
PKGJSON

cat << 'DOCKERFILE' > Dockerfile
FROM node:20-alpine
RUN apk add --no-cache git python3 make g++
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8085
CMD ["npm", "start"]
DOCKERFILE

cat << 'SERVERJS' > server.js
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8085;
const AUTH_DIR = path.join(__dirname, 'auth_info');

let sock = null;
let currentQr = null;
let connectionStatus = 'initializing';
let pairedPhone = null;

async function connectToWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`[Baileys] Connecting using WA v${version.join('.')}, isLatest: ${isLatest}`);

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Al Wataneya Auctions', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQr = qr;
        connectionStatus = 'qr_ready';
        console.log('[Baileys] New QR code generated. View at http://202.153.35.221:8085/qrcode');
      }

      if (connection === 'close') {
        currentQr = null;
        const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('[Baileys] Connection closed due to:', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
        connectionStatus = 'disconnected';
        pairedPhone = null;
        if (shouldReconnect) {
          setTimeout(connectToWhatsApp, 5000);
        }
      } else if (connection === 'open') {
        currentQr = null;
        connectionStatus = 'connected';
        pairedPhone = sock.user?.id ? sock.user.id.split(':')[0] : 'Active';
        console.log(`[Baileys] WhatsApp connected successfully! Account: ${pairedPhone}`);
      }
    });

    sock.ev.on('messages.upsert', async (m) => {
      // Message event handler
    });

  } catch (err) {
    console.error('[Baileys] Setup error:', err);
    connectionStatus = 'error: ' + err.message;
    setTimeout(connectToWhatsApp, 10000);
  }
}

// 1. Live QR Code Web Page for Scanning
app.get('/qrcode', async (req, res) => {
  if (connectionStatus === 'connected') {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Al Wataneya Auctions - WhatsApp Gateway</title>
        <meta http-equiv="refresh" content="10">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #f8fafc; }
          .card { max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
          .badge { display: inline-block; padding: 8px 16px; border-radius: 9999px; background: #10b981; color: white; font-weight: bold; margin-bottom: 20px; }
          h2 { color: #f1f5f9; margin-top: 0; }
          p { color: #94a3b8; font-size: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● CONNECTED</div>
          <h2>Al Wataneya WhatsApp Gateway</h2>
          <p>Gateway is actively connected to WhatsApp account: <strong>+${pairedPhone}</strong></p>
          <p>Live OTP and auction notification dispatching is fully active.</p>
        </div>
      </body>
      </html>
    `);
  }

  if (!currentQr) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Al Wataneya Auctions - WhatsApp Gateway</title>
        <meta http-equiv="refresh" content="3">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #f8fafc; }
          .card { max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
          .badge { display: inline-block; padding: 8px 16px; border-radius: 9999px; background: #f59e0b; color: white; font-weight: bold; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● INITIALIZING</div>
          <h2>Generating WhatsApp QR Code...</h2>
          <p>Please wait a few seconds. The page will auto-refresh automatically.</p>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(currentQr, { width: 320, margin: 2 });
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Al Wataneya Auctions - Scan WhatsApp QR</title>
        <meta http-equiv="refresh" content="5">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 30px; background: #0f172a; color: #f8fafc; }
          .card { max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid #334155; }
          .badge { display: inline-block; padding: 8px 16px; border-radius: 9999px; background: #3b82f6; color: white; font-weight: bold; margin-bottom: 16px; }
          h2 { color: #f8fafc; margin-top: 0; font-size: 22px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
          .qr-img { border-radius: 12px; background: white; padding: 12px; margin: 16px 0; }
          .steps { text-align: left; background: #0f172a; padding: 16px; border-radius: 8px; font-size: 13px; color: #cbd5e1; margin-top: 16px; }
          .steps ol { margin: 0; padding-left: 20px; }
          .steps li { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● SCAN TO CONNECT</div>
          <h2>Link WhatsApp to Al Wataneya</h2>
          <p>Scan this QR code with WhatsApp on your phone to activate real-time OTP delivery for auctions.</p>
          <img class="qr-img" src="${qrDataUrl}" alt="WhatsApp QR Code" />
          <div class="steps">
            <ol>
              <li>Open <strong>WhatsApp</strong> on your mobile phone</li>
              <li>Tap <strong>Settings</strong> (iOS) or <strong>⋮ Menu</strong> (Android)</li>
              <li>Select <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong></li>
              <li>Point camera at this screen</li>
            </ol>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 12px;">Auto-refreshes every 5 seconds until connected.</p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error generating QR: ' + err.message);
  }
});

// 2. Health & Status API
app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    pairedPhone: pairedPhone,
    hasActiveSocket: !!sock,
    timestamp: new Date().toISOString()
  });
});

// 3. Message Dispatch Endpoint (Conforming to Evolution API / Baileys standard)
// POST /message/sendText/:instance
app.post('/message/sendText/:instance', async (req, res) => {
  const instance = req.params.instance;
  const { number, phone, textMessage, text, message } = req.body;

  const targetNumber = number || phone;
  const messageContent = (textMessage && textMessage.text) ? textMessage.text : (text || message);

  if (!targetNumber || !messageContent) {
    return res.status(400).json({
      error: 'Missing required fields: number/phone and textMessage/text'
    });
  }

  // Sanitize phone number to international format
  let cleanNumber = targetNumber.replace(/[^0-9]/g, '');
  // Format jid
  const jid = `${cleanNumber}@s.whatsapp.net`;

  console.log(`[DISPATCH REQUEST] Instance: ${instance} | Target: ${jid} | Length: ${messageContent.length}`);

  if (connectionStatus !== 'connected' || !sock) {
    console.warn(`[OFFLINE MOCK RECORD] WhatsApp not paired yet. Message saved for +${cleanNumber}:\n${messageContent}`);
    return res.status(200).json({
      status: 'pending_scan',
      warning: 'WhatsApp account not paired yet. Please scan QR at http://202.153.35.221:8085/qrcode',
      recorded: true,
      target: cleanNumber,
      messagePreview: messageContent.substring(0, 80)
    });
  }

  try {
    const result = await sock.sendMessage(jid, { text: messageContent });
    console.log(`[DISPATCH SUCCESS] Sent to ${cleanNumber}, messageId: ${result.key.id}`);
    res.status(200).json({
      status: 'success',
      messageId: result.key.id,
      target: cleanNumber
    });
  } catch (sendErr) {
    console.error(`[DISPATCH FAILED] Error sending to ${cleanNumber}:`, sendErr);
    res.status(500).json({
      error: 'Failed to transmit message',
      details: sendErr.message
    });
  }
});

// 4. Quick Test Endpoint
app.get('/test-send', async (req, res) => {
  const target = req.query.phone || '9154506870';
  const text = req.query.text || '🚗 Test WhatsApp OTP from Al Wataneya Auctions!';

  let clean = target.replace(/[^0-9]/g, '');
  const jid = `${clean}@s.whatsapp.net`;

  if (connectionStatus !== 'connected' || !sock) {
    return res.json({
      status: 'pending_scan',
      message: 'Please link device first at /qrcode',
      target: clean
    });
  }

  try {
    const result = await sock.sendMessage(jid, { text });
    res.json({ status: 'sent', id: result.key.id, target: clean });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WhatsApp Gateway listening on 0.0.0.0:${PORT}`);
  connectToWhatsApp();
});
SERVERJS

echo 'Files written successfully'
