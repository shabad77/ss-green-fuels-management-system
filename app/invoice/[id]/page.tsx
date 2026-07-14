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

function formatDate(d: string | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB");
}

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
        className="w-[210mm] min-h-[297mm] mx-auto bg-white border border-black text-[12px] text-black flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.15)] print:shadow-none"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {/* ================= HEADER ================= */}
        <div className="grid grid-cols-[1fr_300px] border-b border-black">
          {/* LOGO + COMPANY */}
          <div className="flex gap-4 p-4">
            <div className="w-[72px] h-[72px] shrink-0 flex items-center justify-center">
              {company.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo} alt="logo" className="max-h-[72px] object-contain" />
              ) : (
                <div className="text-center text-[9px] tracking-wide text-gray-500 border border-black w-full h-full flex items-center justify-center">
                  LOGO
                </div>
              )}
            </div>

            <div className="text-black">
              <h1 className="text-[19px] font-bold uppercase leading-tight tracking-tight">
                {company.companyName}
              </h1>
              <div className="mt-1 leading-[19px] text-[11.5px] text-black">
                <div>{company.address}</div>
                <div>
                  {company.city}, {company.state} - {company.pincode}
                </div>
                {company.phone && <div>Mobile : {company.phone}</div>}
                <div className="font-semibold">GSTIN : {company.gstNumber}</div>
                {company.panNumber && (
                  <div className="font-semibold">PAN Number : {company.panNumber}</div>
                )}
              </div>
            </div>
          </div>

          {/* INVOICE META */}
          <div className="border-l border-black p-4">
            <div className="flex justify-between items-start gap-2">
              <h2 className="font-bold text-[21px] uppercase tracking-wide leading-none">
                Tax Invoice
              </h2>
              <div className="border border-black px-2 py-[5px] text-[7.5px] font-bold tracking-wide whitespace-nowrap leading-none self-start">
                ORIGINAL FOR
                <br />
                RECIPIENT
              </div>
            </div>

            <table className="w-full mt-3 text-[11.5px]">
              <tbody>
                <tr>
                  <td className="py-[3px] text-black/70">Invoice No.</td>
                  <td className="py-[3px] text-right font-bold">{sale.invoiceNo}</td>
                </tr>
                <tr>
                  <td className="py-[3px] text-black/70">Invoice Date</td>
                  <td className="py-[3px] text-right font-bold">
                    {formatDate(sale.invoiceDate)}
                  </td>
                </tr>
                <tr>
                  <td className="py-[3px] text-black/70">Due Date</td>
                  <td className="py-[3px] text-right font-bold">
                    {formatDate(sale.dueDate ?? sale.invoiceDate)}
                  </td>
                </tr>
                <tr>
                  <td className="py-[3px] text-black/70">E-way Bill No.</td>
                  <td className="py-[3px] text-right font-bold">
                    {sale.ewayBillNo || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="py-[3px] text-black/70">Vehicle No.</td>
                  <td className="py-[3px] text-right font-bold">{sale.vehicleNo}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= BILL TO / SHIP TO ================= */}
        <div className="grid grid-cols-2 border-b border-black">
          {/* BILL TO */}
          <div className="border-r border-black">
            <div className="bg-[#e5e5e5] border-b border-black px-3 py-[6px] font-bold uppercase text-[10.5px] tracking-wide">
              Bill To
            </div>
            <div className="p-3 leading-[19px] text-[11.5px]">
              <div className="font-bold text-[13.5px] mb-[2px]">{buyer.name}</div>
              <div>{buyer.address}</div>
              {buyer.mobile && <div>Mobile : {buyer.mobile}</div>}
              {buyer.gst && <div>GSTIN : {buyer.gst}</div>}
              {buyer.pan && <div>PAN Number : {buyer.pan}</div>}
              {buyer.placeOfSupply && <div>Place of Supply : {buyer.placeOfSupply}</div>}
            </div>
          </div>

          {/* SHIP TO */}
          <div>
            <div className="bg-[#e5e5e5] border-b border-black px-3 py-[6px] font-bold uppercase text-[10.5px] tracking-wide">
              Ship To
            </div>
            <div className="p-3 leading-[19px] text-[11.5px]">
              <div className="font-bold text-[13.5px] mb-[2px]">{buyer.name}</div>
              <div>{buyer.address}</div>
            </div>
          </div>
        </div>

        {/* ================= ITEMS TABLE (single table incl. subtotal — guarantees column alignment) ================= */}
        <table className="w-full border-collapse text-[12px] flex-1">
          <colgroup>
            <col className="w-[45px]" />
            <col />
            <col className="w-[80px]" />
            <col className="w-[90px]" />
            <col className="w-[70px]" />
            <col className="w-[100px]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead>
            <tr className="bg-[#e5e5e5]">
              <th className="border border-black py-2 font-bold text-[11px] tracking-wide">S.NO.</th>
              <th className="border border-black text-left pl-2 font-bold text-[11px] tracking-wide">
                ITEMS
              </th>
              <th className="border border-black font-bold text-[11px] tracking-wide">HSN</th>
              <th className="border border-black font-bold text-[11px] tracking-wide">QTY.</th>
              <th className="border border-black font-bold text-[11px] tracking-wide">RATE</th>
              <th className="border border-black font-bold text-[11px] tracking-wide">TAX</th>
              <th className="border border-black font-bold text-[11px] tracking-wide">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black text-center align-top py-2">1</td>
              <td className="border border-black px-2 align-top">
                {sale.itemName ?? "Item"}
              </td>
              <td className="border border-black text-center align-top">
                {sale.hsnCode ?? "-"}
              </td>
              <td className="border border-black text-center align-top">
                {sale.quantity.toLocaleString("en-IN")}
                {sale.unit ? ` ${sale.unit}` : ""}
              </td>
              <td className="border border-black text-center align-top">
                {sale.rate.toLocaleString("en-IN")}
              </td>
              <td className="border border-black text-center align-top">
                {formatMoney(sale.gstAmount)}
                <div className="text-[10px] text-black/60">({sale.gstPercent}%)</div>
              </td>
              <td className="border border-black text-right pr-3 align-top">
                {formatMoney(sale.amount)}
              </td>
            </tr>

            {/* blank filler rows so the sheet fills the page like a real invoice book */}
            {Array.from({ length: 9 }).map((_, i) => (
              <tr key={i}>
                <td className="border border-black h-[26px]" />
                <td className="border border-black" />
                <td className="border border-black" />
                <td className="border border-black" />
                <td className="border border-black" />
                <td className="border border-black" />
                <td className="border border-black" />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#e5e5e5] font-bold">
              <td className="border border-black py-2 px-3" colSpan={3}>
                SUBTOTAL
              </td>
              <td className="border border-black text-center py-2">
                {sale.quantity.toLocaleString("en-IN")}
              </td>
              <td className="border border-black" />
              <td className="border border-black text-center py-2">
                {formatMoney(sale.gstAmount)}
              </td>
              <td className="border border-black text-right pr-3 py-2">
                {formatMoney(sale.amount)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ================= BOTTOM ================= */}
        <div className="grid grid-cols-[1fr_300px] border-x border-b border-black flex-none">
          {/* LEFT: BANK DETAILS + TERMS */}
          <div className="border-r border-black p-3 text-[11.5px]">
            {(company.bankName || company.accountNumber) && (
              <div className="mb-4">
                <div className="font-bold mb-1 text-[10.5px] tracking-wide">BANK DETAILS</div>
                {company.accountName && (
                  <div>
                    <span className="text-black/60">Name: </span>
                    {company.accountName}
                  </div>
                )}
                {company.ifscCode && (
                  <div>
                    <span className="text-black/60">IFSC Code: </span>
                    {company.ifscCode}
                  </div>
                )}
                {company.accountNumber && (
                  <div>
                    <span className="text-black/60">Account No: </span>
                    {company.accountNumber}
                  </div>
                )}
                {(company.bankName || company.branch) && (
                  <div>
                    <span className="text-black/60">Bank: </span>
                    {company.bankName}
                    {company.branch ? `, ${company.branch}` : ""}
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="font-bold mb-1 text-[10.5px] tracking-wide">
                TERMS AND CONDITIONS
              </div>
              <ol className="list-decimal pl-4 text-[10.5px] space-y-[3px] text-black/80">
                {termsList.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* RIGHT: TOTALS */}
          <div className="flex flex-col">
            <table className="w-full text-[11.5px]">
              <tbody>
                <tr>
                  <td className="border-b border-black px-3 py-[6px]">Taxable Amount</td>
                  <td className="border-b border-black text-right px-3 py-[6px]">
                    ₹ {formatMoney(sale.amount)}
                  </td>
                </tr>

                {isInterState ? (
                  <tr>
                    <td className="border-b border-black px-3 py-[6px]">
                      IGST @{sale.gstPercent}%
                    </td>
                    <td className="border-b border-black text-right px-3 py-[6px]">
                      ₹ {formatMoney(igst)}
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <td className="border-b border-black px-3 py-[6px]">
                        CGST @{(sale.gstPercent / 2).toFixed(0)}%
                      </td>
                      <td className="border-b border-black text-right px-3 py-[6px]">
                        ₹ {formatMoney(cgst)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-b border-black px-3 py-[6px]">
                        SGST @{(sale.gstPercent / 2).toFixed(0)}%
                      </td>
                      <td className="border-b border-black text-right px-3 py-[6px]">
                        ₹ {formatMoney(sgst)}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <td className="border-b border-black px-3 py-[6px]">Round Off</td>
                  <td className="border-b border-black text-right px-3 py-[6px]">
                    ₹ {formatMoney(roundOff)}
                  </td>
                </tr>

                <tr>
                  <td className="border-b border-black px-3 py-[8px] font-bold text-[14px]">
                    Total Amount
                  </td>
                  <td className="border-b border-black text-right px-3 py-[8px] font-bold text-[14px]">
                    ₹ {formatMoney(sale.total)}
                  </td>
                </tr>

                <tr>
                  <td className="border-b border-black px-3 py-[6px]">Received Amount</td>
                  <td className="border-b border-black text-right px-3 py-[6px]">
                    ₹ {formatMoney(receivedAmount)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="px-3 py-[8px] border-b border-black">
              <div className="font-bold text-[10.5px] tracking-wide">Total Amount (in words)</div>
              <div className="text-[11px] leading-[15px] mt-[2px]">
                {numberToWordsIndian(sale.total)} Rupees
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-end items-end px-3 py-3 min-h-[90px]">

  {company.signature && (
    <img
      src={company.signature}
      alt="Signature"
      className="h-16 object-contain mb-2"
    />
  )}

  <div className="font-bold">
    Authorised Signatory
  </div>

  <div className="text-xs">
    {company.companyName}
  </div>

</div>
          </div>
        </div>

        {/* PRINT */}
        <div className="print:hidden mt-5 flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold"
          >
            🖨 Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
