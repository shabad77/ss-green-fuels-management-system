"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import "../invoice.css";

type Sale = {
  invoiceNo: string;
  invoiceDate: string;
  dueDate?: string | null;
  vehicleNo: string;
  ewayBillNo: string | null;

  itemName?: string | null;
  hsnCode?: string | null;
  unit?: string | null; // e.g. "CFT", "PCS"
  shipToAddress?: string | null;
  quantity: number;
  rate: number;
  amount: number; // taxable value (before tax)
  gstPercent: number;
  gstAmount: number; // total tax (CGST+SGST or IGST)
  isInterState?: boolean; // true => IGST, false/undefined => CGST+SGST split
  roundOff?: number; // signed value added to reach `total`
  receivedAmount?: number;
  total: number; // grand total (after tax + round off)

  buyer: {
    name: string;
    gst: string | null;
    pan?: string | null;
    address: string | null;
    mobile?: string | null;
    placeOfSupply?: string | null;
  };

  company: {
    companyName: string;
    gstNumber: string;
    panNumber?: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    bankName: string | null;
    accountName: string | null;
    accountNumber: string | null;
    ifscCode: string | null;
    branch: string | null;
    upiId: string | null;
    logo: string | null;
    signature: string | null;
    terms: string | null; // optional override for terms & conditions (newline separated)
  };
};

// ---------- Indian-format number-to-words helper ----------
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
}

function threeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return `${hundred ? ONES[hundred] + " Hundred" + (rest ? " " : "") : ""}${
    rest ? twoDigits(rest) : ""
  }`;
}

function numberToWordsIndian(num: number): string {
  num = Math.round(num);
  if (num === 0) return "Zero";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  return parts.join(" ");
}

function formatMoney(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Shows up to 1 decimal place, but drops it when the number is whole
// (2.5 -> "2.5", 9 -> "9") instead of rounding 2.5 up to "3".
function formatPercent(n: number): string {
  return Number(n.toFixed(1)).toString();
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB");
}

// Brand accent color used throughout the invoice.
const BRAND = "#0f5132";

export default function InvoicePage() {
  const { id } = useParams();
  const [sale, setSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadInvoice();
  }, []);

  async function loadInvoice() {
    const res = await fetch(`/api/invoice/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setSale({ ...data.sale, company: data.company });

    if (typeof document !== "undefined") {
      document.title = `Invoice ${data.sale.invoiceNo} - ${data.company.companyName}`;
    }
  }

  if (!sale) {
    return <div className="p-10 text-center text-xl">Loading...</div>;
  }

  const { company, buyer } = sale;

  const isInterState = !!sale.isInterState;
  const cgst = isInterState ? 0 : sale.gstAmount / 2;
  const sgst = isInterState ? 0 : sale.gstAmount / 2;
  const igst = isInterState ? sale.gstAmount : 0;

  const roundOff = sale.roundOff ?? sale.total - (sale.amount + sale.gstAmount);
  const receivedAmount = sale.receivedAmount ?? 0;

  const termsList = (
    company.terms
      ? company.terms.split("\n").filter(Boolean)
      : [
          "Invoice Under New GST Rule ( 7 ) WEF 01-07-2017",
          "Goods once sold are not returnable",
          "Subject to Banswara jurisdiction only",
        ]
  );

  return (
    <div
      className="bg-[#e9e9e9] min-h-screen py-8 print:bg-white print:py-0"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div
        id="invoice"
        className="w-[210mm] min-h-[297mm] mx-auto bg-white text-[12px] text-slate-800 flex flex-col shadow-[0_2px_16px_rgba(0,0,0,0.15)] print:shadow-none"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {/* Top accent bar */}
        <div className="h-[6px] w-full" style={{ backgroundColor: BRAND }} />

        <div className="flex-1 flex flex-col px-10 pt-7">
          {/* ================= HEADER ================= */}
          <div className="flex justify-between items-start gap-6 pb-5">
            {/* LOGO + COMPANY */}
            <div className="flex gap-4">
              {company.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo}
                  alt="logo"
                  className="h-[120px] w-[120px] object-contain shrink-0"
                />
              )}

              <div>
                <h1 className="text-[21px] font-bold uppercase leading-tight tracking-tight text-slate-900">
                  {company.companyName}
                </h1>
                <div className="mt-1.5 leading-[18px] text-[11.5px] text-slate-500">
                  <div>{company.address}</div>
                  <div>
                    {company.city}, {company.state} - {company.pincode}
                  </div>
                  {company.phone && <div>Mobile: {company.phone}</div>}
                  <div className="mt-1 text-slate-700">
                    <span className="font-semibold">GSTIN</span> {company.gstNumber}
                    {company.panNumber && (
                      <>
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="font-semibold">PAN</span> {company.panNumber}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* INVOICE META */}
            <div className="text-right shrink-0">
              <h2
                className="text-[24px] font-bold uppercase tracking-wide leading-none"
                style={{ color: BRAND }}
              >
                Tax Invoice
              </h2>

              <div className="mt-2 inline-block rounded-full border border-slate-300 px-3 py-[3px] text-[8.5px] font-semibold uppercase tracking-wide text-slate-500">
                Original for Recipient
              </div>

              <div className="mt-4 space-y-[5px] text-[11.5px]">
                <div className="flex justify-between gap-8">
                  <span className="text-slate-400">Invoice No.</span>
                  <span className="font-semibold text-slate-800">{sale.invoiceNo}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-slate-400">Invoice Date</span>
                  <span className="font-semibold text-slate-800">{formatDate(sale.invoiceDate)}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-slate-400">Due Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(sale.dueDate ?? sale.invoiceDate)}
                  </span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-slate-400">E-way Bill No.</span>
                  <span className="font-semibold text-slate-800">{sale.ewayBillNo || "-"}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-slate-400">Vehicle No.</span>
                  <span className="font-semibold text-slate-800">{sale.vehicleNo}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-slate-900" />

          {/* ================= BILL TO / SHIP TO ================= */}
          <div className="grid grid-cols-2 gap-10 py-5 border-b border-slate-200">
            <div>
              <div
                className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-[3px] border-b-2 mb-2"
                style={{ borderColor: BRAND }}
              >
                Bill To
              </div>
              <div className="text-[14px] font-bold text-slate-900">{buyer.name}</div>
              <div className="mt-1 text-[11.5px] text-slate-600 leading-[17px]">
                <div>{buyer.address}</div>
                {buyer.mobile && <div>Mobile: {buyer.mobile}</div>}
                {buyer.gst && <div>GSTIN: {buyer.gst}</div>}
                {buyer.pan && <div>PAN: {buyer.pan}</div>}
                {buyer.placeOfSupply && <div>Place of Supply: {buyer.placeOfSupply}</div>}
              </div>
            </div>

            <div>
              <div
                className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-[3px] border-b-2 mb-2"
                style={{ borderColor: BRAND }}
              >
                Ship To
              </div>
              <div className="text-[14px] font-bold text-slate-900">{buyer.name}</div>
              <div className="mt-1 text-[11.5px] text-slate-600 leading-[17px]">
                <div>{sale.shipToAddress || buyer.address}</div>
              </div>
            </div>
          </div>

          {/* ================= ITEMS ================= */}
          <table className="w-full border-collapse text-[12px] mt-1">
            <colgroup>
              <col className="w-[36px]" />
              <col />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[95px]" />
              <col className="w-[110px]" />
            </colgroup>
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">#</th>
                <th className="py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Item</th>
                <th className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">HSN</th>
                <th className="py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Qty</th>
                <th className="py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Rate</th>
                <th className="py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Tax</th>
                <th className="py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3 text-slate-400">1</td>
                <td className="py-3 font-semibold text-slate-800">{sale.itemName ?? "Item"}</td>
                <td className="py-3 text-center text-slate-500">{sale.hsnCode ?? "-"}</td>
                <td className="py-3 text-right text-slate-700">
                  {sale.quantity.toLocaleString("en-IN")}
                  {sale.unit ? ` ${sale.unit}` : ""}
                </td>
                <td className="py-3 text-right text-slate-700">{sale.rate.toLocaleString("en-IN")}</td>
                <td className="py-3 text-right text-slate-700">
                  {formatMoney(sale.gstAmount)}
                  <div className="text-[9.5px] text-slate-400">({sale.gstPercent}%)</div>
                </td>
                <td className="py-3 text-right font-semibold text-slate-900">{formatMoney(sale.amount)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-bold">
                <td className="py-2.5" colSpan={3}>
                  Subtotal
                </td>
                <td className="py-2.5 text-right">{sale.quantity.toLocaleString("en-IN")}</td>
                <td />
                <td className="py-2.5 text-right">{formatMoney(sale.gstAmount)}</td>
                <td className="py-2.5 text-right">{formatMoney(sale.amount)}</td>
              </tr>
            </tfoot>
          </table>

          {/* spacer to keep the sheet visually balanced without an empty grid */}
          <div className="flex-1 min-h-[40px]" />

          {/* ================= BOTTOM ================= */}
          <div className="grid grid-cols-[1fr_290px] gap-10 pt-5 pb-6 border-t-2 border-slate-900">
            {/* LEFT: BANK DETAILS + TERMS */}
            <div className="text-[11.5px]">
              {(company.bankName || company.accountNumber) && (
                <div className="mb-5">
                  <div
                    className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-[3px] border-b-2 mb-2"
                    style={{ borderColor: BRAND }}
                  >
                    Bank Details
                  </div>
                  <div className="text-slate-700 leading-[18px]">
                    {company.accountName && <div>{company.accountName}</div>}
                    {company.accountNumber && <div>A/C: {company.accountNumber}</div>}
                    {company.ifscCode && <div>IFSC: {company.ifscCode}</div>}
                    {(company.bankName || company.branch) && (
                      <div>
                        {company.bankName}
                        {company.branch ? `, ${company.branch}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div
                  className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-[3px] border-b-2 mb-2"
                  style={{ borderColor: BRAND }}
                >
                  Terms and Conditions
                </div>
                <ol className="list-decimal pl-4 text-[10.5px] space-y-[3px] text-slate-500">
                  {termsList.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* RIGHT: TOTALS */}
            <div>
              <div className="space-y-[7px] text-[11.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Taxable Amount</span>
                  <span className="text-slate-800">₹ {formatMoney(sale.amount)}</span>
                </div>

                {isInterState ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">IGST @{sale.gstPercent}%</span>
                    <span className="text-slate-800">₹ {formatMoney(igst)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CGST @{formatPercent(sale.gstPercent / 2)}%</span>
                      <span className="text-slate-800">₹ {formatMoney(cgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SGST @{formatPercent(sale.gstPercent / 2)}%</span>
                      <span className="text-slate-800">₹ {formatMoney(sgst)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-500">Round Off</span>
                  <span className="text-slate-800">₹ {formatMoney(roundOff)}</span>
                </div>
              </div>

              <div
                className="mt-3 flex justify-between items-center rounded px-3 py-2.5"
                style={{ backgroundColor: "#eaf3ee" }}
              >
                <span className="text-[12px] font-bold" style={{ color: BRAND }}>
                  Total Amount
                </span>
                <span className="text-[17px] font-bold" style={{ color: BRAND }}>
                  ₹ {formatMoney(sale.total)}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-[11.5px]">
                <span className="text-slate-500">Received Amount</span>
                <span className="text-slate-800">₹ {formatMoney(receivedAmount)}</span>
              </div>

              <div className="mt-4 text-[10.5px] text-slate-500 italic leading-[15px]">
                {numberToWordsIndian(sale.total)} Rupees Only
              </div>

              <div className="mt-8 flex flex-col items-end">
                {company.signature ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.signature}
                    alt="Authorised signature"
                    className="h-[80px] max-w-[170px] object-contain mb-1"
                  />
                ) : (
                  <div className="h-[56px]" />
                )}
                <div className="w-[170px] border-t border-slate-400 pt-1.5 text-right">
                  <div className="text-[10.5px] font-semibold text-slate-700">
                    Authorised Signature
                  </div>
                  <div className="text-[10px] text-slate-400">for {company.companyName}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-6 text-[10.5px] italic" style={{ color: BRAND }}>
            Thank you for your business.
          </div>
        </div>

        {/* PRINT */}
        <div className="print:hidden mt-5 mx-10 mb-6 flex justify-end">
          <button
            onClick={() => window.print()}
            className="text-white px-6 py-3 rounded font-semibold"
            style={{ backgroundColor: BRAND }}
          >
            🖨 Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
