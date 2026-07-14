"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [panNumber, setPanNumber] = useState("");
const [website, setWebsite] = useState("");

const [bankName, setBankName] = useState("");
const [accountName, setAccountName] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [ifscCode, setIfscCode] = useState("");
const [branch, setBranch] = useState("");
const [upiId, setUpiId] = useState("");

const [logo, setLogo] = useState("");
const [signature, setSignature] = useState("");

const [terms, setTerms] = useState("");

  async function loadCompany() {
    const res = await fetch("/api/company");

    if (!res.ok) return;

    const data = await res.json();

    setCompanyName(data.companyName);
    setGstNumber(data.gstNumber);
    setAddress(data.address);
    setCity(data.city);
    setState(data.state);
    setPincode(data.pincode);
    setPhone(data.phone || "");
    setEmail(data.email || "");
    setPanNumber(data.panNumber || "");
setWebsite(data.website || "");

setBankName(data.bankName || "");
setAccountName(data.accountName || "");
setAccountNumber(data.accountNumber || "");
setIfscCode(data.ifscCode || "");
setBranch(data.branch || "");
setUpiId(data.upiId || "");

setLogo(data.logo || "");
setSignature(data.signature || "");

setTerms(data.terms || "");
  }

  async function saveCompany() {
    const res = await fetch("/api/company", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyName,
        gstNumber,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        panNumber,
website,

bankName,
accountName,
accountNumber,
ifscCode,
branch,
upiId,

logo,
signature,

terms,
      }),
    });

    if (!res.ok) {
      alert("Unable to save settings.");
      return;
    }

    alert("Settings saved successfully.");
  }

  useEffect(() => {
    loadCompany();
  }, []);

  return (
  <MainLayout>
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Company Settings</h1>

      <div className="bg-white rounded-xl shadow border p-6 space-y-5">

        <div>
          <label className="block text-sm font-medium mb-1">
            Company Name
          </label>

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-black"

          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            GST Number
          </label>

          <input
            type="text"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
            className="w-full border rounded-lg px-4 py-3 text-black"

          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Address
          </label>

          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-black"

          />
        </div>

        <div className="grid grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              City
            </label>

            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-black"

            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              State
            </label>

            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-black"

            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Pincode
            </label>

            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-black"

            />
          </div>

        </div>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-black"

            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 text-black"

            />
          </div>

          <div className="grid grid-cols-2 gap-4">

<div>
<label className="block text-sm font-medium mb-1">PAN Number</label>
<input
value={panNumber}
onChange={(e)=>setPanNumber(e.target.value.toUpperCase())}
className="w-full border rounded-lg px-4 py-3"
/>
</div>

<div>
<label className="block text-sm font-medium mb-1">Website</label>
<input
value={website}
onChange={(e)=>setWebsite(e.target.value)}
className="w-full border rounded-lg px-4 py-3"
/>
</div>

</div>

<div className="border-t pt-6">

<h2 className="text-xl font-bold mb-4">
Bank Details
</h2>

<div className="grid grid-cols-2 gap-4">

<input placeholder="Account Name" value={accountName} onChange={(e)=>setAccountName(e.target.value)} className="border rounded-lg px-4 py-3"/>

<input placeholder="Bank Name" value={bankName} onChange={(e)=>setBankName(e.target.value)} className="border rounded-lg px-4 py-3"/>

<input placeholder="Account Number" value={accountNumber} onChange={(e)=>setAccountNumber(e.target.value)} className="border rounded-lg px-4 py-3"/>

<input placeholder="IFSC Code" value={ifscCode} onChange={(e)=>setIfscCode(e.target.value.toUpperCase())} className="border rounded-lg px-4 py-3"/>

<input placeholder="Branch" value={branch} onChange={(e)=>setBranch(e.target.value)} className="border rounded-lg px-4 py-3"/>

<input placeholder="UPI ID" value={upiId} onChange={(e)=>setUpiId(e.target.value)} className="border rounded-lg px-4 py-3"/>

</div>

</div>

<div className="border-t pt-6">

<h2 className="text-xl font-bold mb-4">
Branding
</h2>

<input
placeholder="Logo URL"
value={logo}
onChange={(e)=>setLogo(e.target.value)}
className="w-full border rounded-lg px-4 py-3 mb-4"
/>

<input
placeholder="Signature URL"
value={signature}
onChange={(e)=>setSignature(e.target.value)}
className="w-full border rounded-lg px-4 py-3"
/>

</div>

<div className="border-t pt-6">

<h2 className="text-xl font-bold mb-4">
Invoice Terms
</h2>

<textarea
rows={6}
value={terms}
onChange={(e)=>setTerms(e.target.value)}
className="w-full border rounded-lg px-4 py-3"
/>

</div>



        </div>

        <button
          onClick={saveCompany}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Save Settings
        </button>

      </div>
        </div>
  </MainLayout>
);
}