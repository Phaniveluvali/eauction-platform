import React, { useState } from 'react';
import { X, Truck, Car, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Vehicle } from '../types';

interface CreateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (vehicle: Vehicle) => void;
}

export const CreateVehicleModal: React.FC<CreateVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [vehicleType, setVehicleType] = useState<'TRUCK' | 'CAR'>('TRUCK');
  const [make, setMake] = useState('Tata Motors');
  const [model, setModel] = useState('');
  const [vin, setVin] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [manufacturingYear, setManufacturingYear] = useState(2023);
  const [odometerReadingKm, setOdometerReadingKm] = useState(45000);
  const [fuelType, setFuelType] = useState('DIESEL');
  const [imageUrl, setImageUrl] = useState('');
  const [startPrice, setStartPrice] = useState(1500000);
  const [reservePrice, setReservePrice] = useState(1800000);
  const [minBidIncrement, setMinBidIncrement] = useState(25000);
  const [launchAuctionImmediately, setLaunchAuctionImmediately] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const created = await api.createVehicle({
        vehicleType,
        make,
        model,
        vin,
        registrationNumber,
        engineNumber,
        manufacturingYear: Number(manufacturingYear),
        odometerReadingKm: Number(odometerReadingKm),
        fuelType,
        mediaPaths: imageUrl ? [imageUrl] : [],
      });

      if (launchAuctionImmediately) {
        const startTime = new Date().toISOString();
        const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const auc = await api.createAuction({
          vehicleId: created.id,
          startPrice: Number(startPrice),
          reservePrice: Number(reservePrice),
          minBidIncrement: Number(minBidIncrement),
          startTime,
          endTime,
        });
        await api.activateAuction(auc.id);
      }

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register vehicle in catalog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">List Vehicle for E-Auction</h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish inventory into PostgreSQL Vehicle Catalog with Indian VIN & RTO Registration numbers.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Vehicle Classification
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setVehicleType('TRUCK'); setMake('Tata Motors'); }}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                  vehicleType === 'TRUCK'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Commercial Truck / Fleet</span>
              </button>

              <button
                type="button"
                onClick={() => { setVehicleType('CAR'); setMake('Mahindra'); }}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold transition ${
                  vehicleType === 'CAR'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Car className="w-4 h-4 text-blue-400" />
                <span>Passenger Car / SUV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Make / Manufacturer</label>
              <input
                type="text"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Tata Motors / Ashok Leyland"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Model & Variant</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Signa 4825.TK Heavy Truck"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Indian Reg. No (RTO)</label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                placeholder="e.g. MH12AB9999"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">VIN / Chassis No</label>
              <input
                type="text"
                required
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="e.g. MAT612345N1234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Engine Number</label>
              <input
                type="text"
                required
                value={engineNumber}
                onChange={(e) => setEngineNumber(e.target.value.toUpperCase())}
                placeholder="ENG998877"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mfg Year</label>
              <input
                type="number"
                min={1990}
                max={2030}
                value={manufacturingYear}
                onChange={(e) => setManufacturingYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Odometer (km)</label>
              <input
                type="number"
                min={0}
                value={odometerReadingKm}
                onChange={(e) => setOdometerReadingKm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="DIESEL">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="PETROL">Petrol</option>
                <option value="ELECTRIC">Electric (EV)</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Photo URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Auction Scheduling & Parameters */}
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200">Launch Live Auction Immediately</span>
                <p className="text-[11px] text-slate-400">Creates live auction room and streams updates via Go WebSockets</p>
              </div>
              <input
                type="checkbox"
                checked={launchAuctionImmediately}
                onChange={(e) => setLaunchAuctionImmediately(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 bg-slate-900 border-slate-700 focus:ring-brand-500 cursor-pointer"
              />
            </div>

            {launchAuctionImmediately && (
              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Start Bid (₹)</label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={startPrice}
                    onChange={(e) => setStartPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Reserve (₹)</label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={reservePrice}
                    onChange={(e) => setReservePrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Min Inc (₹)</label>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={minBidIncrement}
                    onChange={(e) => setMinBidIncrement(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-brand-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {loading ? 'Submitting to Catalog...' : launchAuctionImmediately ? 'Publish Vehicle & Start Auction' : 'Save to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
