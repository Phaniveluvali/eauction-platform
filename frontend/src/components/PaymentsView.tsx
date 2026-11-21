import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  FileText,
  Building2,
  DollarSign,
  Receipt
} from 'lucide-react';
import { useTranslation, Language } from './i18n';

interface PaymentInvoice {
  id: string;
  invoiceNo: string;
  lotNo: string;
  title: string;
  date: string;
  amountAed: number;
  vatAed: number;
  totalAed: number;
  method: string;
  status: 'PAID' | 'PENDING' | 'PROCESSING';
}

interface PaymentsViewProps {
  lang?: Language;
  onOpenDepositModal?: () => void;
}

const MOCK_INVOICES: PaymentInvoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-DXB-2026-8812',
    lotNo: 'LOT-DXB-9021',
    title: '2023 Mercedes-Benz G63 AMG 4MATIC V8',
    date: '20 Nov 2026',
    amountAed: 685000,
    vatAed: 35962.50,
    totalAed: 720962.50,
    method: 'UAE Central Bank Wire (ENBD)',
    status: 'PAID'
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-DXB-2026-8790',
    lotNo: 'LOT-AUH-7734',
    title: '2022 Porsche 911 Carrera S Coupe',
    date: '19 Nov 2026',
    amountAed: 430000,
    vatAed: 22575.00,
    totalAed: 452575.00,
    method: 'Emirates NBD Instant Transfer',
    status: 'PAID'
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-DXB-2026-8715',
    lotNo: 'LOT-SHJ-3012',
    title: '2021 Toyota Land Cruiser VXR 5.7L',
    date: '18 Nov 2026',
    amountAed: 265000,
    vatAed: 13912.50,
    totalAed: 278912.50,
    method: 'Pending Wire / Card',
    status: 'PENDING'
  },
  {
    id: 'inv-4',
    invoiceNo: 'INV-DXB-2026-8600',
    lotNo: 'DEP-SEC-0041',
    title: 'Buyer Bidding Security Deposit',
    date: '01 Nov 2026',
    amountAed: 50000,
    vatAed: 0,
    totalAed: 50000,
    method: 'Visa Corporate Card (UAE)',
    status: 'PAID'
  }
];

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  lang = 'EN',
  onOpenDepositModal
}) => {
  const { t, formatAed } = useTranslation(lang);
  const [invoices] = useState<PaymentInvoice[]>(MOCK_INVOICES);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + i.totalAed, 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((acc, i) => acc + i.totalAed, 0);
  const depositAmount = 50000;

  const handleDownloadInvoice = (inv: PaymentInvoice) => {
    setDownloadingId(inv.id);
    setTimeout(() => {
      setDownloadingId(null);
      const content = `AJ AUCTIONS - OFFICIAL TAX INVOICE\n` +
        `-----------------------------------------\n` +
        `Tax Invoice No: ${inv.invoiceNo}\n` +
        `Description: ${inv.title}\n` +
        `Lot / Ref: ${inv.lotNo}\n` +
        `Date: ${inv.date}\n` +
        `Amount (Excl. VAT): AED ${inv.amountAed.toLocaleString()}\n` +
        `VAT (5%): AED ${inv.vatAed.toLocaleString()}\n` +
        `TOTAL SETTLEMENT: AED ${inv.totalAed.toLocaleString()}\n` +
        `Payment Method: ${inv.method}\n` +
        `Status: ${inv.status}\n` +
        `Entity: AJ Auctions FZ-LLC, Dubai, UAE\n` +
        `TRN: 100482910400003\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${inv.invoiceNo}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Receipt className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                {lang === 'AR' ? 'الفواتير والحسابات المالية' : 'Financial Ledger & Invoices'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'AR' ? 'سجل المدفوعات والفواتير الضريبية' : 'Payments & UAE Tax Invoices'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {lang === 'AR'
                ? 'جميع المبالغ مسعرة بالدرهم الإماراتي (AED) ومتوافقة مع متطلبات الهيئة الاتحادية للضرائب (FTA).'
                : 'All transactions settled in UAE Dirham (AED) compliant with UAE Federal Tax Authority (FTA).'}
            </p>
          </div>

          {onOpenDepositModal && (
            <button
              onClick={onOpenDepositModal}
              className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{lang === 'AR' ? 'إدارة مبلغ التأمين' : 'Manage Deposit'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Settled */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'AR' ? 'إجمالي المدفوعات المسددة' : 'Total Settled (AED)'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              {formatAed(totalPaid)}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'AR' ? 'حوالات معتمدة' : 'Cleared Payments'}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Settlement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'AR' ? 'مبالغ مستحقة السداد' : 'Pending Settlement (AED)'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
              {formatAed(totalPending)}
            </div>
            <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === 'AR' ? 'مهلة السداد: 48 ساعة' : 'Settlement window: 48h'}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Active Deposit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'AR' ? 'رصيد التأمين المحتجز' : 'Active Deposit (AED)'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {formatAed(depositAmount)}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'AR' ? 'يمنح سقف مزايدة حتى 10,000,000 درهم' : 'Unlocks 10M AED Bidding Limit'}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tax Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {lang === 'AR' ? 'الفواتير الضريبية وإيصالات السداد' : 'Tax Invoices & Official Receipts'}
            </h3>
            <p className="text-xs text-slate-500">
              TRN: 100482910400003 • AJ Auctions FZ-LLC
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{lang === 'AR' ? 'رقم الفاتورة' : 'Invoice #'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'البيان / اللوت' : 'Description / Lot'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'التاريخ' : 'Date'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'المبلغ الصافي' : 'Subtotal'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'ضريبة القيمة المضافة 5%' : 'VAT (5%)'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'الإجمالي (درهم)' : 'Total (AED)'}</th>
                <th className="py-3 px-4">{lang === 'AR' ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{lang === 'AR' ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {inv.invoiceNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{inv.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.lotNo} • {inv.method}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {inv.date}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold whitespace-nowrap">
                    {formatAed(inv.amountAed)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatAed(inv.vatAed)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                    {formatAed(inv.totalAed)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {inv.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {lang === 'AR' ? 'مسدد' : 'PAID'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {lang === 'AR' ? 'مستحق' : 'PENDING'}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDownloadInvoice(inv)}
                      disabled={downloadingId === inv.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition text-[11px] cursor-pointer"
                    >
                      <Download className={`w-3 h-3 text-slate-500 ${downloadingId === inv.id ? 'animate-bounce' : ''}`} />
                      <span>{downloadingId === inv.id ? (lang === 'AR' ? 'تحميل...' : 'Downloading...') : (lang === 'AR' ? 'تحميل' : 'Invoice')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UAE Bank Wire Direct Transfer Instructions */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'AR' ? 'بيانات الحساب البنكي للتحويل المباشر في دولة الإمارات' : 'UAE Central Bank Wire & Settlement Account'}</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">{lang === 'AR' ? 'اسم المستفيد' : 'Beneficiary Name'}</div>
            <div className="font-bold text-slate-900 mt-0.5">AJ AUCTIONS FZ-LLC</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">{lang === 'AR' ? 'البنك' : 'Bank'}</div>
            <div className="font-bold text-slate-900 mt-0.5">Emirates NBD (Dubai Main Branch)</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">{lang === 'AR' ? 'رقم الآيبان (IBAN)' : 'IBAN (AED)'}</div>
            <div className="font-mono font-bold text-emerald-700 mt-0.5">AE29 0260 0012 3456 7890 101</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">{lang === 'AR' ? 'سويفت كود' : 'SWIFT Code'}</div>
            <div className="font-mono font-bold text-slate-900 mt-0.5">EBILAEADXXX</div>
          </div>
        </div>
      </div>
    </div>
  );
};
