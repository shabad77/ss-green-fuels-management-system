"use client";

import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { ImagePlus, X } from "lucide-react";

const MAX_FILE_SIZE_MB = 2;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUploadField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    setError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const dataUrl = await fileToBase64(file);
    onChange(dataUrl);
  }

  return (
    <div>
      <label className="block text-[13px] font-medium text-slate-600 mb-1.5">
        {label}
      </label>

      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 overflow-hidden">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="max-h-full max-w-full object-contain" />
          ) : (
            <ImagePlus size={20} className="text-slate-300" />
          )}
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {value ? "Replace" : "Upload from device"}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg border border-slate-200 px-2.5 py-2 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                title="Remove"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <p className="mt-1.5 text-[11.5px] text-slate-400">{hint}</p>
          {error && <p className="mt-1 text-[11.5px] text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [branch, setBranch] = useState("");
  const [upiId, setUpiId] = useState("");
  const [logo, setLogo] = useState("");
  const [signature, setSignature] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadCompany() {
    const res = await fetch("/api/company");

    if (!res.ok) return;

    const data = await res.json();

    setCompanyName(data.companyName);
    setGstNumber(data.gstNumber);
    setPanNumber(data.panNumber || "");
    setAddress(data.address);
    setCity(data.city);
    setState(data.state);
    setPincode(data.pincode);
    setPhone(data.phone || "");
    setEmail(data.email || "");
    setBankName(data.bankName || "");
    setAccountName(data.accountName || "");
    setAccountNumber(data.accountNumber || "");
    setIfscCode(data.ifscCode || "");
    setBranch(data.branch || "");
    setUpiId(data.upiId || "");
    setLogo(data.logo || "");
    setSignature(data.signature || "");
  }

  useEffect(() => {
    loadCompany();
  }, []);

  async function saveCompany() {
    setSaving(true);

    const res = await fetch("/api/company", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyName,
        gstNumber,
        panNumber,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        logo,
        signature,
        bankName,
        accountName,
        accountNumber,
        ifscCode,
        branch,
        upiId,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setMessage("❌ Unable to save settings.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    setMessage("✅ Settings saved successfully.");
    setTimeout(() => setMessage(""), 2500);
  }

  const inputClasses =
    "w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow";
  const labelClasses = "block text-[13px] font-medium text-slate-600 mb-1.5";

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-[13.5px] text-slate-500 mt-0.5">
          Company details used on invoices and documents
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-[13.5px] font-medium border ${
            message.startsWith("❌")
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {message}
        </div>
      )}

      <Card title="Company Details">
        <div className="space-y-5">
          <div>
            <label className={labelClasses}>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClasses}>GST Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>PAN Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Address</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClasses}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClasses}>Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6">
  <Card title="Bank Details">
    <div className="space-y-5">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClasses}>Bank Name</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Account Name</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClasses}>Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>IFSC Code</label>
          <input
            type="text"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClasses}>Branch</label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>UPI ID</label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

    </div>
  </Card>
</div>

      <div className="mt-6">
        <Card title="Branding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageUploadField
              label="Company Logo"
              hint="Shown on the invoice header. PNG or JPG, under 2MB."
              value={logo}
              onChange={setLogo}
            />

            <ImageUploadField
              label="Authorised Signature"
              hint="Shown on the invoice signature line. PNG with transparent background works best."
              value={signature}
              onChange={setSignature}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={saveCompany} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </MainLayout>
  );
}
