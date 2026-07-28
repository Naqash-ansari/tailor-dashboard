"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { emptyCustomerForm, type CustomerFormValues } from "@/types/customer";
import { fetchCustomer, saveCustomerRecord } from "@/lib/customerApi";
import { MeasurementPreview } from "@/components/MeasurementPreview";

type TextField = keyof Omit<CustomerFormValues, "sidePocket" | "frontPocket" | "elastic" | "zip">;
type CheckboxField = "sidePocket" | "frontPocket" | "elastic" | "zip";
type FormErrors = Partial<Record<keyof CustomerFormValues, string>>;

const menOutfitTypes = [
  "Normal suit",
  "Complete men's three piece suit - jacket, pants, tie, and shirt",
  "Two piece suit - jacket and pants",
  "Shirt and trouser",
  "Pant coat",
  "Waistcoat",
  "Sherwani",
  "Salwar kameez",
  "Kurta pajama",
  "Kurta salwar",
  "Prince coat",
  "Blazer",
  "Dress shirt",
  "Dress pants",
  "Waistcoat with shalwar kameez"
];

const ladiesOutfitTypes = [
  "Ladies normal suit",
  "Ladies three piece suit - shirt, trouser, dupatta",
  "Kameez shalwar",
  "Kameez trouser",
  "Patiala suit",
  "Ladies pants",
  "Kurti",
  "Long shirt",
  "Frock",
  "Gown",
  "Maxi",
  "Lehenga",
  "Sharara",
  "Gharara",
  "Abaya",
  "Blouse",
  "Ladies waistcoat",
  "Ladies coat / blazer"
];

const requiredFields: Array<keyof CustomerFormValues> = [
  "customerName",
  "phoneNumber",
  "customerCategory",
  "outfitType",
  "measurementType",
  "qameezLength",
  "chestWidth",
  "shoulder",
  "sleeveLength",
  "stitchingPrice"
];

const textInputClass =
  "mt-1 w-full rounded-md border border-[#d8ccb9] bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-[#0d6b5f] focus:ring-2 focus:ring-[#0d6b5f]/15";

const sectionClass =
  "dashboard-card rounded-lg border border-[#e1d6c4] bg-white p-5 shadow-sm";

const numericFields: Array<keyof CustomerFormValues> = [
  "qameezLength",
  "blouseLength",
  "ghairaBottom",
  "waistWidth",
  "shoulder",
  "shoulderDown",
  "shoulderStrap",
  "shoulderToApexPoint",
  "frontChest",
  "upperChest",
  "underChest",
  "upperBack",
  "crossBack",
  "sideFittingSeem",
  "sleeveLength",
  "armHole",
  "bicep",
  "elbow",
  "forearm",
  "wristCuff",
  "neckSize",
  "collarHeight",
  "damanWidth",
  "skirtLength",
  "choliFrillLength",
  "waistBelt",
  "shalwarLength",
  "shalwarWaist",
  "hip",
  "crotchRise",
  "frontRise",
  "backRise",
  "rightThigh",
  "leftThigh",
  "thigh",
  "inseamLength",
  "knees",
  "calf",
  "rightCalf",
  "leftCalf",
  "ankleBottom",
  "bottomPoncha",
  "stitchingPrice",
  "advancePayment",
  "remainingPayment"
];

function sanitizeDecimal(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [first, ...rest] = cleaned.split(".");
  return rest.length ? `${first}.${rest.join("")}` : first;
}

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function parseAmount(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

function formatAmountInput(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function calculateRemainingPayment(stitchingPrice: string, advancePayment: string) {
  if (!stitchingPrice.trim()) {
    return "";
  }

  return formatAmountInput(
    Math.max(parseAmount(stitchingPrice) - parseAmount(advancePayment), 0)
  );
}

function Field({
  label,
  name,
  value,
  error,
  type = "text",
  required = false,
  numeric = false,
  readOnly = false,
  onChange
}: {
  label: string;
  name: TextField;
  value: string;
  error?: string;
  type?: string;
  required?: boolean;
  numeric?: boolean;
  readOnly?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      <input
        className={`${textInputClass} ${readOnly ? "bg-slate-50 text-slate-600" : ""}`}
        name={name}
        type={numeric ? "text" : type}
        inputMode={numeric ? "decimal" : name === "phoneNumber" ? "numeric" : undefined}
        pattern={numeric ? "[0-9]*[.]?[0-9]*" : name === "phoneNumber" ? "[0-9]*" : undefined}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function ToggleField({
  label,
  name,
  checked,
  onChange
}: {
  label: string;
  name: CheckboxField;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-md border border-[#e1d6c4] bg-[#fbfaf7] px-3 py-2.5 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[#d8ccb9] text-[#0d6b5f] focus:ring-[#0d6b5f]"
      />
    </label>
  );
}

function SectionTitle({
  eyebrow,
  title,
  note
}: {
  eyebrow: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#0d6b5f]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2>
      </div>
      {note ? <p className="text-sm text-slate-500">{note}</p> : null}
    </div>
  );
}

export function CustomerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id") ?? undefined;
  const sourceCustomerId = searchParams.get("customerId") ?? undefined;
  const [values, setValues] = useState<CustomerFormValues>(emptyCustomerForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadedEditRecord, setLoadedEditRecord] = useState(false);
  const [loadedSourceCustomer, setLoadedSourceCustomer] = useState(false);
  const [saveError, setSaveError] = useState("");

  const isEditing = Boolean(editId);
  const outfitOptions =
    values.customerCategory === "Ladies" ? ladiesOutfitTypes : menOutfitTypes;

  useEffect(() => {
    if (!editId || loadedEditRecord) {
      return;
    }

    fetchCustomer(editId)
      .then((customer) => {
        if (customer) {
          const { id: _id, createdAt: _createdAt, ...formValues } = customer;
          setValues({
            ...emptyCustomerForm,
            ...formValues,
            advancePayment: formValues.advancePayment || "0",
            measurementUnit: formValues.measurementUnit ?? "inch"
          });
        }
      })
      .finally(() => {
        setLoadedEditRecord(true);
      });
  }, [editId, loadedEditRecord]);

  useEffect(() => {
    if (editId || !sourceCustomerId || loadedSourceCustomer) {
      return;
    }

    fetchCustomer(sourceCustomerId)
      .then((customer) => {
        if (!customer) {
          return;
        }

        setValues({
          ...emptyCustomerForm,
          customerName: customer.customerName,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          notes: customer.notes,
          customerCategory: customer.customerCategory ?? "Men",
          advancePayment: "0",
          outfitType:
            customer.customerCategory === "Ladies"
              ? ladiesOutfitTypes[0]
              : menOutfitTypes[0],
          measurementUnit: customer.measurementUnit ?? "inch",
          orderDate: new Date().toISOString().slice(0, 10)
        });
      })
      .finally(() => {
        setLoadedSourceCustomer(true);
      });
  }, [editId, sourceCustomerId, loadedSourceCustomer]);

  const title = useMemo(
    () => {
      if (isEditing) {
        return "Edit order measurements";
      }

      if (sourceCustomerId) {
        return "Add new order for customer";
      }

      return "New customer and first order";
    },
    [isEditing, sourceCustomerId]
  );

  const handleTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const fieldName = event.target.name as keyof CustomerFormValues;
    let nextValue = event.target.value;

    if (fieldName === "phoneNumber") {
      nextValue = sanitizeDigits(nextValue);
    }

    if (numericFields.includes(fieldName)) {
      nextValue = sanitizeDecimal(nextValue);
    }

    setValues((current) => {
      if (fieldName === "customerCategory") {
        const nextOptions =
          nextValue === "Ladies" ? ladiesOutfitTypes : menOutfitTypes;

        return {
          ...current,
          customerCategory: nextValue as CustomerFormValues["customerCategory"],
          outfitType: nextOptions[0]
        };
      }

      const nextValues = { ...current, [fieldName]: nextValue };

      if (fieldName === "stitchingPrice" || fieldName === "advancePayment") {
        return {
          ...nextValues,
          remainingPayment: calculateRemainingPayment(
            nextValues.stitchingPrice,
            nextValues.advancePayment
          )
        };
      }

      return nextValues;
    });
    setErrors((current) => ({ ...current, [fieldName]: undefined }));
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setValues((current) => ({ ...current, [name]: checked }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    requiredFields.forEach((field) => {
      if (!String(values[field]).trim()) {
        nextErrors[field] = "Required";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError("");

    if (!validate()) {
      return;
    }

    try {
      await saveCustomerRecord(values, editId);
      router.push("/customers");
    } catch {
      setSaveError("Unable to save customer. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 sm:px-8 lg:px-12">
      <form className="mx-auto max-w-6xl" onSubmit={handleSubmit}>
        <header className="mb-6 overflow-hidden rounded-lg border border-[#e1d6c4] bg-[#122b2a] shadow-xl">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-32 items-center justify-center overflow-hidden rounded-md border border-white/20 bg-white p-2">
                  <object
                    aria-label="Aans Fabrics & Tailors Ltd logo"
                    className="h-full w-full"
                    data="/brand/aans-fabric-logo.pdf#toolbar=0&navpanes=0&scrollbar=0"
                    type="application/pdf"
                  >
                    <span className="brand-name text-sm font-bold text-[#122b2a]">
                      Aans Fabrics & Tailors Ltd
                    </span>
                  </object>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-[#d8b05b]">
                    Tailor measurement form
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                    {title}
                  </h1>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#e8dfd2]">
                Save customer details, suit measurements, trouser measurements,
                payment information, and order status in a clean tailor workflow.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-[#f7d98b]">
                  Numeric measurements
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-[#f7d98b]">
                  CM / Inch
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-[#f7d98b]">
                  Customer orders
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Dashboard
              </Link>
              <Link
                href="/customers"
                className="rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Saved customers
              </Link>
              <button
                type="submit"
                className="rounded-md bg-[#d8b05b] px-5 py-2.5 text-sm font-bold text-[#122b2a] shadow-sm transition hover:bg-[#e4c171]"
              >
                {isEditing ? "Update order" : "Save order"}
              </button>
            </div>
          </div>
        </header>

        {saveError ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {saveError}
          </div>
        ) : null}

        <section className={sectionClass}>
          <SectionTitle
            eyebrow="Step 01"
            title="Customer profile"
            note="Fields marked * are required"
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Customer name" name="customerName" value={values.customerName} error={errors.customerName} required onChange={handleTextChange} />
            <Field label="Gender" name="customerCategory" value={values.customerCategory} error={errors.customerCategory} required onChange={handleTextChange} />
            <Field label="ID / Reference" name="customerIdNumber" value={values.customerIdNumber} onChange={handleTextChange} />
            <Field label="Phone number" name="phoneNumber" value={values.phoneNumber} error={errors.phoneNumber} required onChange={handleTextChange} />
            <Field label="Address" name="address" value={values.address} onChange={handleTextChange} />
            <Field label="Measurement type" name="measurementType" value={values.measurementType} onChange={handleTextChange} />
            <Field label="Order date" name="orderDate" type="date" value={values.orderDate} onChange={handleTextChange} />
            <Field label="Delivery date" name="deliveryDate" type="date" value={values.deliveryDate} onChange={handleTextChange} />
            <label className="block md:col-span-2 lg:col-span-3">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <textarea
                className={`${textInputClass} min-h-24`}
                name="notes"
                value={values.notes}
                onChange={handleTextChange}
              />
            </label>
          </div>
        </section>

        <section className={`mt-6 ${sectionClass}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle
              eyebrow="Step 02"
              title="Order / outfit type"
              note="Same customer can have multiple separate orders"
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Customer type <span className="text-red-600">*</span>
              </span>
              <select
                className={textInputClass}
                name="customerCategory"
                value={values.customerCategory}
                onChange={handleTextChange}
              >
                <option value="Men">Men</option>
                <option value="Ladies">Ladies</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Outfit / suit type <span className="text-red-600">*</span>
              </span>
              <select
                className={textInputClass}
                name="outfitType"
                value={values.outfitType}
                onChange={handleTextChange}
              >
                {outfitOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className={`mt-6 ${sectionClass}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle
              eyebrow="Step 03"
              title="Suit / Qameez measurements"
            />
            <div className="inline-flex w-fit rounded-md border border-[#d8ccb9] bg-[#fbfaf7] p-1">
              {(["inch", "cm"] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() =>
                    setValues((current) => ({ ...current, measurementUnit: unit }))
                  }
                  className={
                    values.measurementUnit === unit
                      ? "rounded bg-[#0d6b5f] px-4 py-1.5 text-sm font-bold uppercase text-white shadow-sm"
                      : "rounded px-4 py-1.5 text-sm font-bold uppercase text-slate-700 hover:bg-white"
                  }
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label={`Qameez length / height (${values.measurementUnit})`} name="qameezLength" value={values.qameezLength} error={errors.qameezLength} required numeric onChange={handleTextChange} />
            <Field label={`Blouse length (${values.measurementUnit})`} name="blouseLength" value={values.blouseLength} numeric onChange={handleTextChange} />
            <Field label={`Ghaira / Bottom (${values.measurementUnit})`} name="ghairaBottom" value={values.ghairaBottom} numeric onChange={handleTextChange} />
            <Field label={`Shoulder (${values.measurementUnit})`} name="shoulder" value={values.shoulder} error={errors.shoulder} required numeric onChange={handleTextChange} />
            <Field label={`Shoulder down (${values.measurementUnit})`} name="shoulderDown" value={values.shoulderDown} numeric onChange={handleTextChange} />
            <Field label={`Shoulder strap (${values.measurementUnit})`} name="shoulderStrap" value={values.shoulderStrap} numeric onChange={handleTextChange} />
            <Field label={`Shoulder to apex point (${values.measurementUnit})`} name="shoulderToApexPoint" value={values.shoulderToApexPoint} numeric onChange={handleTextChange} />
            <Field label={`Front chest (${values.measurementUnit})`} name="frontChest" value={values.frontChest} numeric onChange={handleTextChange} />
            <Field label={`Upper chest (${values.measurementUnit})`} name="upperChest" value={values.upperChest} numeric onChange={handleTextChange} />
            <Field label={`Chest width (${values.measurementUnit})`} name="chestWidth" value={values.chestWidth} error={errors.chestWidth} required numeric onChange={handleTextChange} />
            <Field label={`Under chest (${values.measurementUnit})`} name="underChest" value={values.underChest} numeric onChange={handleTextChange} />
            <Field label={`Upper back (${values.measurementUnit})`} name="upperBack" value={values.upperBack} numeric onChange={handleTextChange} />
            <Field label={`Cross back (${values.measurementUnit})`} name="crossBack" value={values.crossBack} numeric onChange={handleTextChange} />
            <Field label={`Waist width (${values.measurementUnit})`} name="waistWidth" value={values.waistWidth} numeric onChange={handleTextChange} />
            <Field label={`Side fitting seam (${values.measurementUnit})`} name="sideFittingSeem" value={values.sideFittingSeem} numeric onChange={handleTextChange} />
            <Field label={`Sleeve length (${values.measurementUnit})`} name="sleeveLength" value={values.sleeveLength} error={errors.sleeveLength} required numeric onChange={handleTextChange} />
            <Field label={`Arm hole (${values.measurementUnit})`} name="armHole" value={values.armHole} numeric onChange={handleTextChange} />
            <Field label={`Bicep (${values.measurementUnit})`} name="bicep" value={values.bicep} numeric onChange={handleTextChange} />
            <Field label={`Elbow (${values.measurementUnit})`} name="elbow" value={values.elbow} numeric onChange={handleTextChange} />
            <Field label={`Forearm (${values.measurementUnit})`} name="forearm" value={values.forearm} numeric onChange={handleTextChange} />
            <Field label={`Wrist / cuff (${values.measurementUnit})`} name="wristCuff" value={values.wristCuff} numeric onChange={handleTextChange} />
            <Field label={`Neck size (${values.measurementUnit})`} name="neckSize" value={values.neckSize} numeric onChange={handleTextChange} />
            <Field label={`Collar height (${values.measurementUnit})`} name="collarHeight" value={values.collarHeight} numeric onChange={handleTextChange} />
            <Field label="Collar design" name="collarDesign" value={values.collarDesign} onChange={handleTextChange} />
            <Field label={`Daman width (${values.measurementUnit})`} name="damanWidth" value={values.damanWidth} numeric onChange={handleTextChange} />
            <ToggleField label="Side pocket" name="sidePocket" checked={values.sidePocket} onChange={handleCheckboxChange} />
            <ToggleField label="Front pocket" name="frontPocket" checked={values.frontPocket} onChange={handleCheckboxChange} />
          </div>
        </section>

        <section className={`mt-6 ${sectionClass}`}>
          <SectionTitle
            eyebrow="Step 04"
            title="Shalwar / Trouser measurements"
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label={`Skirt length (${values.measurementUnit})`} name="skirtLength" value={values.skirtLength} numeric onChange={handleTextChange} />
            <Field label={`Choli / frill length (${values.measurementUnit})`} name="choliFrillLength" value={values.choliFrillLength} numeric onChange={handleTextChange} />
            <Field label={`Waist / belt (${values.measurementUnit})`} name="waistBelt" value={values.waistBelt} numeric onChange={handleTextChange} />
            <Field label={`Shalwar length (${values.measurementUnit})`} name="shalwarLength" value={values.shalwarLength} numeric onChange={handleTextChange} />
            <Field label={`Waist (${values.measurementUnit})`} name="shalwarWaist" value={values.shalwarWaist} numeric onChange={handleTextChange} />
            <Field label={`Hip (${values.measurementUnit})`} name="hip" value={values.hip} numeric onChange={handleTextChange} />
            <Field label={`Right thigh (${values.measurementUnit})`} name="rightThigh" value={values.rightThigh} numeric onChange={handleTextChange} />
            <Field label={`Left thigh (${values.measurementUnit})`} name="leftThigh" value={values.leftThigh} numeric onChange={handleTextChange} />
            <Field label={`Crotch / rise (${values.measurementUnit})`} name="crotchRise" value={values.crotchRise} numeric onChange={handleTextChange} />
            <Field label={`Front rise (${values.measurementUnit})`} name="frontRise" value={values.frontRise} numeric onChange={handleTextChange} />
            <Field label={`Back rise (${values.measurementUnit})`} name="backRise" value={values.backRise} numeric onChange={handleTextChange} />
            <Field label={`Inseam length (${values.measurementUnit})`} name="inseamLength" value={values.inseamLength} numeric onChange={handleTextChange} />
            <Field label={`Knees (${values.measurementUnit})`} name="knees" value={values.knees} numeric onChange={handleTextChange} />
            <Field label={`Calf (${values.measurementUnit})`} name="calf" value={values.calf} numeric onChange={handleTextChange} />
            <Field label={`Right calf (${values.measurementUnit})`} name="rightCalf" value={values.rightCalf} numeric onChange={handleTextChange} />
            <Field label={`Left calf (${values.measurementUnit})`} name="leftCalf" value={values.leftCalf} numeric onChange={handleTextChange} />
            <Field label={`Ankle / bottom (${values.measurementUnit})`} name="ankleBottom" value={values.ankleBottom} numeric onChange={handleTextChange} />
            <Field label={`Thigh (${values.measurementUnit})`} name="thigh" value={values.thigh} numeric onChange={handleTextChange} />
            <Field label={`Bottom / poncha (${values.measurementUnit})`} name="bottomPoncha" value={values.bottomPoncha} numeric onChange={handleTextChange} />
            <ToggleField label="Elastic" name="elastic" checked={values.elastic} onChange={handleCheckboxChange} />
            <ToggleField label="Zip" name="zip" checked={values.zip} onChange={handleCheckboxChange} />
          </div>
        </section>

        <section className={`mt-6 ${sectionClass}`}>
          <SectionTitle
            eyebrow="Step 05"
            title="Designing & stitching detail"
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Fitting style" name="fittingStyle" value={values.fittingStyle} onChange={handleTextChange} />
            <Field label="Seam style" name="seamStyle" value={values.seamStyle} onChange={handleTextChange} />
            <Field label="Neck" name="neckDesign" value={values.neckDesign} onChange={handleTextChange} />
            <Field label="Front strip" name="frontStrip" value={values.frontStrip} onChange={handleTextChange} />
            <Field label="Shoulder strap" name="shoulderStrapDetail" value={values.shoulderStrapDetail} onChange={handleTextChange} />
            <Field label="Pocket flaps" name="pocketFlaps" value={values.pocketFlaps} onChange={handleTextChange} />
            <Field label="Sleeve" name="sleeveStyle" value={values.sleeveStyle} onChange={handleTextChange} />
            <Field label="Wrist / cuff" name="wristCuffStyle" value={values.wristCuffStyle} onChange={handleTextChange} />
            <Field label="Ghaira / bottom" name="ghairaBottomDetail" value={values.ghairaBottomDetail} onChange={handleTextChange} />
            <Field label="Side chaak / slit" name="sideChaakSlit" value={values.sideChaakSlit} onChange={handleTextChange} />
            <Field label="Plates / darts" name="platesDarts" value={values.platesDarts} onChange={handleTextChange} />
            <Field label="Button" name="buttonDetails" value={values.buttonDetails} onChange={handleTextChange} />
            <Field label="Piping" name="piping" value={values.piping} onChange={handleTextChange} />
            <Field label="Dupatta / veil" name="dupattaVeil" value={values.dupattaVeil} onChange={handleTextChange} />
            <Field label="Shalwar style" name="shalwarStyle" value={values.shalwarStyle} onChange={handleTextChange} />
            <Field label="Pant / trouser" name="pantTrouserStyle" value={values.pantTrouserStyle} onChange={handleTextChange} />
            <Field label="Ankle / pancha" name="anklePancha" value={values.anklePancha} onChange={handleTextChange} />
          </div>
        </section>

        <section className={`mt-6 ${sectionClass}`}>
          <SectionTitle eyebrow="Step 06" title="Order details" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Fabric type" name="fabricType" value={values.fabricType} onChange={handleTextChange} />
            <Field label="Suit design" name="suitDesign" value={values.suitDesign} onChange={handleTextChange} />
            <Field label="Stitching price" name="stitchingPrice" value={values.stitchingPrice} error={errors.stitchingPrice} required numeric onChange={handleTextChange} />
            <Field label="Advance payment" name="advancePayment" value={values.advancePayment} numeric onChange={handleTextChange} />
            <Field label="Remaining payment" name="remainingPayment" value={values.remainingPayment} numeric readOnly onChange={handleTextChange} />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Order status</span>
              <select
                className={textInputClass}
                name="orderStatus"
                value={values.orderStatus}
                onChange={handleTextChange}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Delivered</option>
              </select>
            </label>
          </div>
        </section>

        <div className="mt-6">
          <MeasurementPreview customer={values} />
        </div>

        <div className="sticky bottom-4 z-10 mt-6 rounded-lg border border-[#e1d6c4] bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-700">
              Save this order under the customer profile.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/customers"
                className="rounded-md border border-[#d8ccb9] px-4 py-2 text-sm font-bold text-slate-800 hover:bg-[#fbfaf7]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="rounded-md bg-[#122b2a] px-5 py-2 text-sm font-bold text-white hover:bg-[#183936]"
              >
                {isEditing ? "Update order" : "Save order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
