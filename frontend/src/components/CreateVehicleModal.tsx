import React, { useState } from 'react';
import { X, Truck, Car, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { Vehicle, User } from '../types';
import { VEHICLE_MAKES_AND_MODELS, UAE_EMIRATES_BRANCHES } from '../data/vehicleData';

interface CreateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (vehicle: Vehicle) => void;
  currentUser?: User | null;
}

export const CreateVehicleModal: React.FC<CreateVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const makes = Object.keys(VEHICLE_MAKES_AND_MODELS);

  const [vehicleType, setVehicleType] = useState<'TRUCK' | 'CAR'>('CAR');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [vin, setVin] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [manufacturingYear, setManufacturingYear] = useState<number>(2024);
  const [odometerReadingKm, setOdometerReadingKm] = useState<number | ''>('');
  const [fuelType, setFuelType] = useState('PETROL');
  const [branch, setBranch] = useState('Sharjah Central Hub');
  const [color, setColor] = useState('');
  const [targetSellingPrice, setTargetSellingPrice] = useState<number | ''>('');
  const [minimumSellingPrice, setMinimumSellingPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [launchAuctionImmediately, setLaunchAuctionImmediately] = useState(false);
  const [startPrice, setStartPrice] = useState<number | ''>('');
  const [reservePrice, setReservePrice] = useState<number | ''>('');
  const [minBidIncrement, setMinBidIncrement] = useState<number>(1000);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // D10 Check: Seller contract must be approved
  const isSeller = currentUser?.role === 'SELLER';
  const isContractApproved = currentUser?.contractStatus === 'APPROVED' || currentUser?.isSuperAdmin || currentUser?.role === 'ADMIN';

  const modelsForMake = VEHICLE_MAKES_AND_MODELS[make] || [];

  const handleMakeChange = (newMake: string) => {
    setMake(newMake);
    setModel('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSeller && !isContractApproved) {
      setError('Your Seller Account is pending contract approval by AJ Auctions administration. You must have an approved contract to list vehicles.');
      return;
    }

    // D28: 17-character VIN validation (ISO 3779 standard, excluding I, O, Q)
    const cleanVin = vin.trim().toUpperCase();
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(cleanVin)) {
      setError('Invalid VIN / Chassis Number. Must be exactly 17 alphanumeric characters (excluding letters I, O, and Q).');
      return;
    }

    if (!model.trim()) {
      setError('Please select or enter the vehicle model.');
      return;
    }

    // D31: Selling Price Validation
    const targetPriceNum = Number(targetSellingPrice);
    const minPriceNum = Number(minimumSellingPrice);
    if (!targetPriceNum || targetPriceNum <= 0) {
      setError('Target Selling Price must be greater than 0 AED.');
      return;
    }
    if (!minPriceNum || minPriceNum <= 0) {
      setError('Minimum Selling Price must be greater than 0 AED.');
      return;
    }
    if (targetPriceNum < minPriceNum) {
      setError('Target Selling Price must be greater than or equal to Minimum Selling Price.');
      return;
    }

    setLoading(true);

    try {
      const created = await api.createVehicle({
        vehicleType,
        make,
        model: model.trim(),
        vin: cleanVin,
        registrationNumber: registrationNumber.trim().toUpperCase(),
        engineNumber: engineNumber.trim().toUpperCase() || undefined,
        manufacturingYear: Number(manufacturingYear),
        odometerReadingKm: Number(odometerReadingKm || 0),
        fuelType,
        branch,
        color: color.trim() || 'White',
        targetSellingPrice: targetPriceNum,
        minimumSellingPrice: minPriceNum,
        mediaPaths: imageUrl ? [imageUrl] : [],
      });

      if (launchAuctionImmediately) {
        const startTime = new Date().toISOString();
        const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const startBid = Number(startPrice) || Math.round(targetPriceNum * 0.7);
        const resPrice = Number(reservePrice) || minPriceNum;

        await api.createAuction({
          vehicleId: created.id,
          startPrice: startBid,
          reservePrice: resPrice,
          minBidIncrement: Number(minBidIncrement) || 1000,
          startTime,
          endTime,
        });
      }

      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to list vehicle. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>List Vehicle for Auction</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Register your vehicle into the AJ Auctions inventory pool with UAE RTO plate and VIN validation.
          </p>
        </div>

        {/* Contract Pending Warning (D10) */}
        {isSeller && !isContractApproved && (
          <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200">Seller Contract Under Review</p>
              <p className="mt-0.5 text-amber-300/90 leading-relaxed">
                Your consignment seller contract is currently pending administrative approval. Vehicle listing permissions will activate as soon as compliance verification completes.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Vehicle Category Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Vehicle Classification</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVehicleType('CAR')}
                className={`py-2 px-3 text-xs rounded-lg border text-center font-medium transition flex items-center justify-center space-x-2 ${
                  vehicleType === 'CAR'
                    ? 'border-[#059669] bg-[#059669]/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Passenger Car / SUV</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('TRUCK')}
                className={`py-2 px-3 text-xs rounded-lg border text-center font-medium transition flex items-center justify-center space-x-2 ${
                  vehicleType === 'TRUCK'
                    ? 'border-[#059669] bg-[#059669]/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Commercial / Truck</span>
              </button>
            </div>
          </div>

          {/* Make and Model (Cascading D32) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Vehicle Make *</label>
              <select
                value={make}
                onChange={(e) => handleMakeChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {makes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Model *</label>
              {modelsForMake.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Model --</option>
                    {modelsForMake.map((mod) => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Land Cruiser GXR"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>
          </div>

          {/* Chassis / VIN (17-char validation D28) and Plate Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                VIN / Chassis Number (17 Chars) *
              </label>
              <input
                type="text"
                required
                maxLength={17}
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="e.g. 1HGCR2F83HA123456"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                {vin.length}/17 characters
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">UAE Plate / Reg. No</label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                placeholder="e.g. DXB-A-12345 or SHJ-99887"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Mfg Year, Odometer, Fuel */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
              <input
                type="number"
                min={1990}
                max={2030}
                value={manufacturingYear}
                onChange={(e) => setManufacturingYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Odometer (KM)</label>
              <input
                type="number"
                min={0}
                value={odometerReadingKm}
                onChange={(e) => setOdometerReadingKm(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ELECTRIC">Electric (EV)</option>
              </select>
            </div>
          </div>

          {/* Branch & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Yard / Hub Location</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {UAE_EMIRATES_BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Exterior Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Pearl White"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pricing Parameters (D31: targetPrice >= minPrice > 0) */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Selling Price (AED) *</label>
              <input
                type="number"
                required
                min={1}
                value={targetSellingPrice}
                onChange={(e) => setTargetSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 150000"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Minimum Reserve Price (AED) *</label>
              <input
                type="number"
                required
                min={1}
                value={minimumSellingPrice}
                onChange={(e) => setMinimumSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 135000"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Primary Inspection Photo URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Buttons */}
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
              disabled={loading || (isSeller && !isContractApproved)}
              className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting to Catalog...' : 'Submit Vehicle for Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
