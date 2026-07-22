"use client";

import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FileSpreadsheet, Download } from "lucide-react";

type PeriodType = "monthly" | "quarterly" | "annual";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

function PeriodReportCard({
  title,
  description,
  endpoint,
}: {
  title: string;
  description: string;
  endpoint: string;
}) {
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);

    const params = new URLSearchParams({
      type: periodType,
      year: String(year),
    });

    if (periodType === "monthly") params.set("month", String(month));
    if (periodType === "quarterly") params.set("quarter", String(quarter));

    try {
      const res = await fetch(`${endpoint}?${params.toString()}`);

      if (!res.ok) {
        alert("Unable to generate report.");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match ? match[1] : "Report.xlsx";

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card title={title}>
      <p className="text-[13.5px] text-slate-500 -mt-2 mb-5">{description}</p>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block mb-1.5 text-[12.5px] font-medium text-slate-600">
            Period
          </label>
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value as PeriodType)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
        </div>

        {periodType === "monthly" && (
          <div>
            <label className="block mb-1.5 text-[12.5px] font-medium text-slate-600">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {periodType === "quarterly" && (
          <div>
            <label className="block mb-1.5 text-[12.5px] font-medium text-slate-600">
              Quarter
            </label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value={1}>Q1 (Jan - Mar)</option>
              <option value={2}>Q2 (Apr - Jun)</option>
              <option value={3}>Q3 (Jul - Sep)</option>
              <option value={4}>Q4 (Oct - Dec)</option>
            </select>
          </div>
        )}

        <div>
          <label className="block mb-1.5 text-[12.5px] font-medium text-slate-600">
            Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <Button onClick={handleDownload} disabled={downloading}>
          <span className="flex items-center gap-2">
            <Download size={15} />
            {downloading ? "Preparing..." : "Download Excel"}
          </span>
        </Button>
      </div>
    </Card>
  );
}

function DirectoryReportCard({
  title,
  description,
  endpoint,
  filename,
}: {
  title: string;
  description: string;
  endpoint: string;
  filename: string;
}) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);

    try {
      const res = await fetch(endpoint);

      if (!res.ok) {
        alert("Unable to generate report.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card title={title}>
      <p className="text-[13.5px] text-slate-500 -mt-2 mb-5">{description}</p>

      <Button onClick={handleDownload} disabled={downloading}>
        <span className="flex items-center gap-2">
          <Download size={15} />
          {downloading ? "Preparing..." : "Download Excel"}
        </span>
      </Button>
    </Card>
  );
}

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FileSpreadsheet size={24} className="text-emerald-600" />
          Reports
        </h1>
        <p className="text-[13.5px] text-slate-500 mt-0.5">
          Export sales, purchase, buyer, and supplier data as Excel files
        </p>
      </div>

      <div className="space-y-6">
        <PeriodReportCard
          title="Sales Report"
          description="Invoice-level sales for the selected period, with a totals row."
          endpoint="/api/reports/sales"
        />

        <PeriodReportCard
          title="Purchases Report"
          description="Raw material intake for the selected period, with a totals row."
          endpoint="/api/reports/purchases"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DirectoryReportCard
            title="Buyers Report"
            description="Full buyer directory with lifetime invoice count and total business."
            endpoint="/api/reports/buyers"
            filename="Buyers-Report.xlsx"
          />

          <DirectoryReportCard
            title="Suppliers Report"
            description="Full supplier directory with lifetime delivery count and total quantity."
            endpoint="/api/reports/suppliers"
            filename="Suppliers-Report.xlsx"
          />
        </div>
      </div>
    </MainLayout>
  );
}
