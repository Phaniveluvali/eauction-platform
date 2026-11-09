import { Vehicle, UserStats } from '../../types';
import { CATALOG_BASE, getAuthHeader } from './common';

export const catalogApi = {
  async getVehicles(type?: string, make?: string): Promise<Vehicle[]> {
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    if (make) q.set('make', make);
    const qs = q.toString() ? `?${q.toString()}` : '';

    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles${qs}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${id}`);
    if (!res.ok) throw new Error('Vehicle not found');
    return res.json();
  },

  async createVehicle(payload: {
    vin?: string;
    registrationNumber?: string;
    engineNumber?: string;
    vehicleType?: string;
    make: string;
    model: string;
    manufacturingYear: number;
    mileageKm?: number;
    odometerReadingKm?: number;
    fuelType?: string;
    mediaPaths?: string[];
    inspectionReportUrl?: string;
    lotNo?: number;
    branch?: string;
    noOfKeys?: string;
    color?: string;
    targetSellingPrice?: number;
    minimumSellingPrice?: number;
    previousNumberplate?: string;
    clientName?: string;
    mulkiyaDocumentUrl?: string;
    wfActivityId?: string;
    status?: string;
    transmission?: string;
    conditionGrade?: string;
    images?: string[];
    reservePrice?: number;
    startPrice?: number;
    emirate?: string;
    minBidIncrement?: number;
    auctionDurationDays?: number;
  }): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to register vehicle');
    }
    return res.json();
  },

  async approveVehicle(vehicleId: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Failed to approve vehicle');
    return res.json();
  },

  async sendToWash(vehicleId: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/send-to-wash`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Failed to send vehicle to wash bay');
    return res.json();
  },

  async markWashingComplete(vehicleId: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/wash-complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Failed to mark washing complete');
    return res.json();
  },

  async submitPhotoVehicle(vehicleId: string, mediaPaths: string[]): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/submit-photo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ mediaPaths: mediaPaths || [] }),
    });
    if (!res.ok) throw new Error('Failed to submit vehicle photos');
    return res.json();
  },

  async updateTechnicalReport(vehicleId: string, reportUrl: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/technical-report`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ reportUrl }),
    });
    if (!res.ok) throw new Error('Failed to update technical report');
    return res.json();
  },

  async submitTechnicalTest(vehicleId: string, comment?: string): Promise<Vehicle> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/${vehicleId}/technical-test`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ comment: comment || '' }),
    });
    if (!res.ok) throw new Error('Failed to submit technical inspection');
    return res.json();
  },

  async batchApproveVehicles(vehicleIds: string[]): Promise<Vehicle[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/batch-approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(vehicleIds),
    });
    if (!res.ok) throw new Error('Failed to batch approve vehicles');
    return res.json();
  },

  async batchArchiveVehicles(vehicleIds: string[]): Promise<Vehicle[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/batch-archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(vehicleIds),
    });
    if (!res.ok) throw new Error('Failed to batch archive vehicles');
    return res.json();
  },

  async batchCreateVehicles(vehicles: any[]): Promise<Vehicle[]> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(vehicles),
    });
    if (!res.ok) throw new Error('Failed to batch upload vehicles');
    return res.json();
  },

  async getUserStats(): Promise<UserStats> {
    const res = await fetch(`${CATALOG_BASE}/api/v1/catalog/vehicles/stats/users`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch user stats');
    return res.json();
  },
};
