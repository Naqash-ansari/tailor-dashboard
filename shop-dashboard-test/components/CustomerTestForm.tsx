"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { fetchCustomer, fetchCustomers, saveCustomerRecord } from "@/lib/customerApi";
import { isValidUkPhone, sanitizePhoneDigits } from "@/lib/ukPhone";
import { emptyCustomerForm, type CustomerFormValues, type TailorCustomer } from "@/types/customer";

type FormState = {
    orderDate: string;
    deliveryDate: string;
    customerCategory: "Men" | "Women";
    id: string;
    name: string;
    number: string;
    address: string;
    measurementUnit: string;
    measurementType: string;
    qameezLength: string;
    shalwarLength: string;
    blouseLength: string;
    ghairaBottom: string;
    shoulder: string;
    shoulderDown: string;
    shoulderStrap: string;
    neck: string;
    shoulderToApexPoint: string;
    frontChest: string;
    upperChest: string;
    chest: string;
    underChest: string;
    upperBack: string;
    crossBack: string;
    waist: string;
    hip: string;
    sideFittingSeam: string;
    sleeveLength: string;
    armHole: string;
    bicep: string;
    elbow: string;
    forearm: string;
    wristCuff: string;
    typeTwo: string;
    skirtLength: string;
    choliFrillLength: string;
    waistBelt: string;
    crotchRise: string;
    frontRise: string;
    backRise: string;
    thigh: string;
    rightThigh: string;
    leftThigh: string;
    inseamLength: string;
    knees: string;
    calf: string;
    rightCalf: string;
    leftCalf: string;
    ankleBottom: string;
    elastic: string;
    fittingStyle: string;
    seamStyle: string;
    neckDetail: string;
    neckDesignValue: string;
    frontStrip: string;
    shoulderStrapDetail: string;
    pocket: string;
    pocketFlaps: string;
    sleeveStyle: string;
    wristCuffStyle: string;
    cuffDesignValue: string;
    ghairaBottomDetail: string;
    sideChaakSlit: string;
    platesDarts: string;
    zip: string;
    button: string;
    piping: string;
    dupattaVeil: string;
    shalwar: string;
    pantTrouser: string;
    anklePancha: string;
    designReference: string;
    totalPayment: string;
    advancePayment: string;
    remainingPayment: string;
    orderStatus: string;
};

const initialState: FormState = {
    orderDate: "",
    deliveryDate: "",
    customerCategory: "Men",
    id: generateCustomerId(),
    name: "",
    number: "",
    address: "",
    measurementUnit: "in",
    measurementType: "",
    qameezLength: "",
    shalwarLength: "",
    blouseLength: "",
    ghairaBottom: "",
    shoulder: "",
    shoulderDown: "",
    shoulderStrap: "",
    neck: "",
    shoulderToApexPoint: "",
    frontChest: "",
    upperChest: "",
    chest: "",
    underChest: "",
    upperBack: "",
    crossBack: "",
    waist: "",
    hip: "",
    sideFittingSeam: "",
    sleeveLength: "",
    armHole: "",
    bicep: "",
    elbow: "",
    forearm: "",
    wristCuff: "",
    typeTwo: "",
    skirtLength: "",
    choliFrillLength: "",
    waistBelt: "",
    crotchRise: "",
    frontRise: "",
    backRise: "",
    thigh: "",
    rightThigh: "",
    leftThigh: "",
    inseamLength: "",
    knees: "",
    calf: "",
    rightCalf: "",
    leftCalf: "",
    ankleBottom: "",
    elastic: "",
    fittingStyle: "",
    seamStyle: "",
    neckDetail: "",
    neckDesignValue: "",
    frontStrip: "",
    shoulderStrapDetail: "",
    pocket: "",
    pocketFlaps: "",
    sleeveStyle: "",
    wristCuffStyle: "",
    cuffDesignValue: "",
    ghairaBottomDetail: "",
    sideChaakSlit: "",
    platesDarts: "",
    zip: "",
    button: "",
    piping: "",
    dupattaVeil: "",
    shalwar: "",
    pantTrouser: "",
    anklePancha: "",
    designReference: "",
    totalPayment: "",
    advancePayment: "",
    remainingPayment: "",
    orderStatus: "Pending"
};

const inputClass =
    "w-full rounded-md border border-[#d8ccb9] bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-[#0d6b5f] focus:ring-2 focus:ring-[#0d6b5f]/15";

const selectClass = `${inputClass} appearance-none`;

const sectionClass =
    "rounded-xl border border-[#e1d6c4] bg-white p-5 shadow-sm";

function generateCustomerId() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    return `AANS-${day}${month}${year}`;
}

async function generateUniqueCustomerId(): Promise<string> {
    const prefix = generateCustomerId();
    let existingCustomers: TailorCustomer[] = [];

    try {
        existingCustomers = await fetchCustomers();
    } catch {
        existingCustomers = [];
    }

    const highestCounter = existingCustomers.reduce((max, customer) => {
        const idValue = customer.customerIdNumber || "";

        if (idValue === prefix) {
            return Math.max(max, 0);
        }

        const suffixMatch = idValue.startsWith(`${prefix}-`)
            ? idValue.slice(prefix.length + 1).match(/^(\d+)$/)
            : null;

        if (!suffixMatch) {
            return max;
        }

        return Math.max(max, Number.parseInt(suffixMatch[1], 10));
    }, 0);

    return `${prefix}-${String(highestCounter + 1).padStart(2, "0")}`;
}

function mapCustomerToFormState(customer: TailorCustomer): FormState {
    return {
        orderDate: customer.orderDate,
        deliveryDate: customer.deliveryDate,
        customerCategory: customer.customerCategory === "Ladies" ? "Women" : "Men",
        id: customer.customerIdNumber || generateCustomerId(),
        name: customer.customerName,
        number: customer.phoneNumber,
        address: customer.address,
        measurementUnit: customer.measurementUnit === "cm" ? "cm" : "in",
        measurementType: customer.measurementType || customer.outfitType,
        qameezLength: customer.qameezLength,
        shalwarLength: customer.shalwarLength,
        blouseLength: customer.blouseLength,
        ghairaBottom: customer.ghairaBottom,
        shoulder: customer.shoulder,
        shoulderDown: customer.shoulderDown,
        shoulderStrap: customer.shoulderStrap,
        neck: customer.neckSize,
        shoulderToApexPoint: customer.shoulderToApexPoint,
        frontChest: customer.frontChest,
        upperChest: customer.upperChest,
        chest: customer.chestWidth,
        underChest: customer.underChest,
        upperBack: customer.upperBack,
        crossBack: customer.crossBack,
        waist: customer.waistWidth || customer.shalwarWaist,
        hip: customer.hip,
        sideFittingSeam: customer.sideFittingSeem,
        sleeveLength: customer.sleeveLength,
        armHole: customer.armHole,
        bicep: customer.bicep,
        elbow: customer.elbow,
        forearm: customer.forearm,
        wristCuff: customer.wristCuff,
        typeTwo: "",
        skirtLength: customer.skirtLength,
        choliFrillLength: customer.choliFrillLength,
        waistBelt: customer.waistBelt,
        crotchRise: customer.crotchRise,
        frontRise: customer.frontRise,
        backRise: customer.backRise,
        thigh: customer.thigh,
        rightThigh: customer.rightThigh,
        leftThigh: customer.leftThigh,
        inseamLength: customer.inseamLength,
        knees: customer.knees,
        calf: customer.calf,
        rightCalf: customer.rightCalf,
        leftCalf: customer.leftCalf,
        ankleBottom: customer.ankleBottom,
        elastic: customer.elastic ? "yes" : "",
        fittingStyle: customer.fittingStyle,
        seamStyle: customer.seamStyle,
        neckDetail: customer.collarDesign || customer.neckDesign,
        neckDesignValue: customer.neckDesignValue,
        frontStrip: customer.frontStrip,
        shoulderStrapDetail: customer.shoulderStrapDetail,
        pocket: "",
        pocketFlaps: customer.pocketFlaps,
        sleeveStyle: customer.sleeveStyle,
        wristCuffStyle: customer.wristCuffStyle,
        cuffDesignValue: customer.cuffDesignValue,
        ghairaBottomDetail: customer.ghairaBottomDetail,
        sideChaakSlit: customer.sideChaakSlit,
        platesDarts: customer.platesDarts,
        zip: customer.zip ? "yes" : "",
        button: customer.buttonDetails,
        piping: customer.piping,
        dupattaVeil: customer.dupattaVeil,
        shalwar: customer.shalwarStyle,
        pantTrouser: customer.pantTrouserStyle,
        anklePancha: customer.anklePancha,
        designReference: customer.suitDesign || customer.fabricType,
        totalPayment: customer.stitchingPrice,
        advancePayment: customer.advancePayment || "0",
        remainingPayment: customer.remainingPayment,
        orderStatus: customer.orderStatus
    };
}

function getGarmentOptions(category: "Men" | "Women") {
    if (category === "Women") {
        return [
            { value: "", label: "Select garment type" },
            { value: "Ladies normal suit", label: "Ladies normal suit" },
            { value: "Ladies three piece suit", label: "Ladies three piece suit" },
            { value: "Kameez shalwar", label: "Kameez shalwar" },
            { value: "Kameez trouser", label: "Kameez trouser" },
            { value: "Patiala suit", label: "Patiala suit" },
            { value: "Ladies pants", label: "Ladies pants" },
            { value: "Kurti", label: "Kurti" },
            { value: "Long shirt", label: "Long shirt" },
            { value: "Frock", label: "Frock" },
            { value: "Gown", label: "Gown" },
            { value: "Maxi", label: "Maxi" },
            { value: "Lehenga", label: "Lehenga" },
            { value: "Sharara", label: "Sharara" },
            { value: "Gharara", label: "Gharara" },
            { value: "Abaya", label: "Abaya" },
            { value: "Blouse", label: "Blouse" },
            { value: "Ladies waistcoat", label: "Ladies waistcoat" },
            { value: "Ladies coat / blazer", label: "Ladies coat / blazer" }
        ];
    }

    return [
        { value: "", label: "Select garment type" },
        { value: "Normal suit", label: "Normal suit" },
        { value: "Three piece suit", label: "Three piece suit" },
        { value: "Two piece suit", label: "Two piece suit" },
        { value: "Shirt and trouser", label: "Shirt and trouser" },
        { value: "Pant coat", label: "Pant coat" },
        { value: "Waistcoat", label: "Waistcoat" },
        { value: "Sherwani", label: "Sherwani" },
        { value: "Salwar kameez", label: "Salwar kameez" },
        { value: "Kurta pajama", label: "Kurta pajama" },
        { value: "Kurta salwar", label: "Kurta salwar" },
        { value: "Prince coat", label: "Prince coat" },
        { value: "Blazer", label: "Blazer" },
        { value: "Dress shirt", label: "Dress shirt" },
        { value: "Dress pants", label: "Dress pants" }
    ];
}

function sanitizeDecimalInput(value: string) {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const [first, ...rest] = cleaned.split(".");
    return rest.length ? `${first}.${rest.join("")}` : first;
}

function Field({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    type = "text",
    readOnly = false,
    inputMode,
    pattern
}: {
    label: string;
    name: keyof FormState;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    type?: string;
    readOnly?: boolean;
    inputMode?: "text" | "search" | "email" | "tel" | "url" | "none" | "numeric" | "decimal";
    pattern?: string;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
            <input
                className={inputClass}
                name={name}
                type={type}
                inputMode={inputMode}
                pattern={pattern}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                readOnly={readOnly}
            />
            {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
        </label>
    );
}

function TextAreaField({
    label,
    name,
    value,
    onChange
}: {
    label: string;
    name: keyof FormState;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
    return (
        <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
            <textarea
                className={`${inputClass} min-h-24`}
                name={name}
                value={value}
                onChange={onChange}
            />
        </label>
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options
}: {
    label: string;
    name: keyof FormState;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    options: Array<{ value: string; label: string }>;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
            <select className={selectClass} name={name} value={value} onChange={onChange}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

type ImageChoiceOption = { value: string; image: string };

const neckDesignOptions: ImageChoiceOption[] = [
    { value: "Straight", image: "/nick/straight-ban.png" },
    { value: "Curved", image: "/nick/curved-ban.png" }
];

const cuffDesignOptions: ImageChoiceOption[] = [
    { value: "Round", image: "/cuf/round-cuff.png" },
    { value: "Angled", image: "/cuf/angled-cuff.png" },
    { value: "Straight", image: "/cuf/straight-cuff.png" }
];

function ImageChoiceField({
    label,
    value,
    onChange,
    options,
    extraField
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: ImageChoiceOption[];
    extraField?: {
        label: string;
        value: string;
        onChange: (value: string) => void;
    };
}) {
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const selected = options.find((option) => option.value === value);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);

        if (!extraField && detailsRef.current) {
            detailsRef.current.open = false;
        }
    };

    return (
        <div className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
            <details ref={detailsRef} className="group relative">
                <summary
                    className={`${inputClass} flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden`}
                >
                    <span>{selected ? selected.value : `Select ${label.toLowerCase()}`}</span>
                    <span className="text-slate-400 transition group-open:rotate-180">▾</span>
                </summary>
                <div className="absolute z-10 mt-2 w-full rounded-md border border-[#d8ccb9] bg-white p-3 shadow-lg">
                    <div
                        className="grid gap-3"
                        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
                    >
                        {options.map((option) => (
                            <label
                                key={option.value}
                                className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border p-2 text-center transition ${
                                    value === option.value
                                        ? "border-[#0d6b5f] bg-[#0d6b5f]/5"
                                        : "border-[#e1d6c4] hover:bg-[#fbfaf7]"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`${label}-choice`}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={() => handleSelect(option.value)}
                                    className="h-4 w-4 accent-[#0d6b5f]"
                                />
                                <Image
                                    src={option.image}
                                    alt={`${option.value} ${label}`}
                                    width={140}
                                    height={70}
                                    className="h-14 w-full object-contain"
                                />
                                <span className="text-xs font-semibold text-slate-700">{option.value}</span>
                            </label>
                        ))}
                    </div>
                    {extraField ? (
                        <label className="mt-3 block border-t border-[#eee4d6] pt-3">
                            <span className="mb-1 block text-xs font-semibold text-slate-700">
                                {extraField.label}
                            </span>
                            <input
                                type="text"
                                className={inputClass}
                                value={extraField.value}
                                onChange={(event) => extraField.onChange(event.target.value)}
                            />
                        </label>
                    ) : null}
                </div>
            </details>
        </div>
    );
}

export function CustomerTestForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id") ?? undefined;
    const sourceCustomerId = searchParams.get("customerId") ?? undefined;
    const [form, setForm] = useState<FormState>(initialState);
    const [saveError, setSaveError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [loadedEditRecord, setLoadedEditRecord] = useState(false);
    const [loadedSourceCustomer, setLoadedSourceCustomer] = useState(false);
    const [generatedFreshId, setGeneratedFreshId] = useState(false);

    const isEditing = Boolean(editId);

    useEffect(() => {
        if (!editId || loadedEditRecord) {
            return;
        }

        fetchCustomer(editId)
            .then((customer) => {
                if (customer) {
                    setForm(mapCustomerToFormState(customer));
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
            .then(async (customer) => {
                if (!customer) {
                    return;
                }

                const sameCustomerId = customer.customerIdNumber || (await generateUniqueCustomerId());

                setForm({
                    ...initialState,
                    id: sameCustomerId,
                    name: customer.customerName,
                    number: customer.phoneNumber,
                    address: customer.address,
                    customerCategory: customer.customerCategory === "Ladies" ? "Women" : "Men",
                    measurementUnit: customer.measurementUnit === "cm" ? "cm" : "in",
                    orderDate: new Date().toISOString().slice(0, 10)
                });
            })
            .finally(() => {
                setLoadedSourceCustomer(true);
            });
    }, [editId, sourceCustomerId, loadedSourceCustomer]);

    useEffect(() => {
        if (editId || sourceCustomerId || generatedFreshId) {
            return;
        }

        generateUniqueCustomerId()
            .then((freshId) => {
                setForm((current) => ({ ...current, id: freshId }));
            })
            .finally(() => {
                setGeneratedFreshId(true);
            });
    }, [editId, sourceCustomerId, generatedFreshId]);

    const pageTitle = isEditing
        ? "Edit order measurements"
        : sourceCustomerId
        ? "Add new order for customer"
        : "Customer measurement entry";

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        const sanitizedValue =
            name === "totalPayment" || name === "advancePayment" || name === "remainingPayment"
                ? sanitizeDecimalInput(value)
                : name === "number"
                ? sanitizePhoneDigits(value)
                : value;

        if (name === "number") {
            setPhoneError("");
        }

        setForm((current) => {
            const nextValues = { ...current, [name]: sanitizedValue };

            if (name === "totalPayment" || name === "advancePayment") {
                const total = Number.parseFloat(nextValues.totalPayment || "0");
                const advance = Number.parseFloat(nextValues.advancePayment || "0");
                const remaining = Math.max(total - advance, 0);
                return {
                    ...nextValues,
                    remainingPayment: remaining.toFixed(2)
                };
            }

            return nextValues;
        });
    };

    const handlePhoneBlur = () => {
        if (form.number && !isValidUkPhone(form.number)) {
            setPhoneError("Enter a valid UK number, e.g. 07911 123456.");
        }
    };

    const buildCustomerPayload = (): CustomerFormValues => ({
        ...emptyCustomerForm,
        customerName: form.name,
        customerIdNumber: form.id,
        phoneNumber: form.number,
        address: form.address,
        orderDate: form.orderDate,
        deliveryDate: form.deliveryDate,
        customerCategory: form.customerCategory === "Women" ? "Ladies" : "Men",
        outfitType: form.measurementType || "Normal suit",
        measurementType: form.measurementType,
        measurementUnit: form.measurementUnit === "cm" ? "cm" : "inch",
        qameezLength: form.qameezLength,
        blouseLength: form.blouseLength,
        ghairaBottom: form.ghairaBottom,
        shoulder: form.shoulder,
        shoulderDown: form.shoulderDown,
        shoulderStrap: form.shoulderStrap,
        frontChest: form.frontChest,
        upperChest: form.upperChest,
        chestWidth: form.chest,
        underChest: form.underChest,
        upperBack: form.upperBack,
        crossBack: form.crossBack,
        waistWidth: form.waist,
        hip: form.hip,
        sideFittingSeem: form.sideFittingSeam,
        sleeveLength: form.sleeveLength,
        armHole: form.armHole,
        bicep: form.bicep,
        elbow: form.elbow,
        forearm: form.forearm,
        wristCuff: form.wristCuff,
        neckSize: form.neck,
        collarDesign: form.neckDetail,
        skirtLength: form.skirtLength,
        choliFrillLength: form.choliFrillLength,
        waistBelt: form.waistBelt,
        shalwarLength: form.shalwarLength,
        shalwarWaist: form.waist,
        crotchRise: form.crotchRise,
        frontRise: form.frontRise,
        backRise: form.backRise,
        rightThigh: form.rightThigh,
        leftThigh: form.leftThigh,
        thigh: form.thigh,
        inseamLength: form.inseamLength,
        knees: form.knees,
        calf: form.calf,
        rightCalf: form.rightCalf,
        leftCalf: form.leftCalf,
        ankleBottom: form.ankleBottom,
        elastic: ["yes", "true", "1"].includes((form.elastic || "").toLowerCase()),
        zip: ["yes", "true", "1"].includes((form.zip || "").toLowerCase()),
        fittingStyle: form.fittingStyle,
        seamStyle: form.seamStyle,
        neckDesign: form.neckDetail,
        neckDesignValue: form.neckDesignValue,
        frontStrip: form.frontStrip,
        shoulderStrapDetail: form.shoulderStrapDetail,
        pocketFlaps: form.pocketFlaps,
        sleeveStyle: form.sleeveStyle,
        wristCuffStyle: form.wristCuffStyle,
        cuffDesignValue: form.cuffDesignValue,
        ghairaBottomDetail: form.ghairaBottomDetail,
        sideChaakSlit: form.sideChaakSlit,
        platesDarts: form.platesDarts,
        buttonDetails: form.button,
        piping: form.piping,
        dupattaVeil: form.dupattaVeil,
        shalwarStyle: form.shalwar,
        pantTrouserStyle: form.pantTrouser,
        anklePancha: form.anklePancha,
        fabricType: form.designReference,
        suitDesign: form.designReference,
        stitchingPrice: form.totalPayment,
        advancePayment: form.advancePayment,
        remainingPayment: form.remainingPayment,
        orderStatus: (form.orderStatus as CustomerFormValues["orderStatus"]) || "Pending"
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaveError("");

        if (form.number && !isValidUkPhone(form.number)) {
            setPhoneError("Enter a valid UK number, e.g. 07911 123456.");
            return;
        }

        setPhoneError("");
        setIsSaving(true);

        try {
            await saveCustomerRecord(buildCustomerPayload(), editId);
            router.push("/customers");
        } catch {
            setSaveError("Unable to save customer. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f7f4ee] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-2xl border border-[#e1d6c4] bg-[#fcfbf8] p-4 shadow-sm sm:p-6">
                <header className="mb-6 rounded-xl bg-[#122b2a] p-6 text-white">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f3d68c]">
                        Tailor measurement form
                    </p>
                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                        {pageTitle}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#e8dfd2]">
                        This page now includes the general information, measurement details, and
                        designing & stitching detail sections from your form.
                    </p>
                </header>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <section className={sectionClass}>
                        <div className="mb-4 border-b border-[#eee4d6] pb-3">
                            <h2 className="text-lg font-bold text-slate-950">General Information</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <Field label="Name" name="name" value={form.name} onChange={handleChange} />
                            <Field
                                label="Number (UK, e.g. 07911 123456)"
                                name="number"
                                value={form.number}
                                onChange={handleChange}
                                onBlur={handlePhoneBlur}
                                error={phoneError}
                                inputMode="numeric"
                            />
                            <Field label="Order date" name="orderDate" type="date" value={form.orderDate} onChange={handleChange} />
                            <Field label="Delivery date" name="deliveryDate" type="date" value={form.deliveryDate} onChange={handleChange} />
                            <SelectField
                                label="Customer Category"
                                name="customerCategory"
                                value={form.customerCategory}
                                onChange={handleChange}
                                options={[
                                    { value: "Men", label: "Men" },
                                    { value: "Women", label: "Women" }
                                ]}
                            />
                            <Field label="ID" name="id" value={form.id} onChange={handleChange} type="text" readOnly />
                            <TextAreaField label="Address" name="address" value={form.address} onChange={handleChange} />
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div className="mb-4 border-b border-[#eee4d6] pb-3">
                            <h2 className="text-lg font-bold text-slate-950">Upper Body Measurements</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Select one unit below. It will apply to all upper and lower body measurements.
                            </p>
                        </div>
                        <div className="mb-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <SelectField
                                label="Measurement Unit (for all measurements)"
                                name="measurementUnit"
                                value={form.measurementUnit}
                                onChange={handleChange}
                                options={[
                                    { value: "in", label: "Inches (in)" },
                                    { value: "cm", label: "Centimetres (cm)" }
                                ]}
                            />
                            {form.customerCategory ? (
                                <SelectField
                                    label="Garment Type"
                                    name="measurementType"
                                    value={form.measurementType}
                                    onChange={handleChange}
                                    options={getGarmentOptions(form.customerCategory)}
                                />
                            ) : null}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <Field label="Length" name="qameezLength" value={form.qameezLength} onChange={handleChange} />
                            <Field label="Blouse Length" name="blouseLength" value={form.blouseLength} onChange={handleChange} />
                            <Field label="Ghaira / Bottom" name="ghairaBottom" value={form.ghairaBottom} onChange={handleChange} />
                            <Field label="Shoulder" name="shoulder" value={form.shoulder} onChange={handleChange} />
                            <Field label="Shoulder Down" name="shoulderDown" value={form.shoulderDown} onChange={handleChange} />
                            <Field label="Shoulder Strap" name="shoulderStrap" value={form.shoulderStrap} onChange={handleChange} />
                            <Field label="Neck" name="neck" value={form.neck} onChange={handleChange} />
                            <Field label="Shoulder to Apex Point" name="shoulderToApexPoint" value={form.shoulderToApexPoint} onChange={handleChange} />
                            <Field label="Front Chest" name="frontChest" value={form.frontChest} onChange={handleChange} />
                            <Field label="Upper Chest" name="upperChest" value={form.upperChest} onChange={handleChange} />
                            <Field label="Chest" name="chest" value={form.chest} onChange={handleChange} />
                            <Field label="Under Chest" name="underChest" value={form.underChest} onChange={handleChange} />
                            <Field label="Upper Back" name="upperBack" value={form.upperBack} onChange={handleChange} />
                            <Field label="Cross Back" name="crossBack" value={form.crossBack} onChange={handleChange} />
                            <Field label="Waist" name="waist" value={form.waist} onChange={handleChange} />
                            <Field label="Hip" name="hip" value={form.hip} onChange={handleChange} />
                            <Field label="Side Fitting Seam" name="sideFittingSeam" value={form.sideFittingSeam} onChange={handleChange} />
                            <Field label="Sleeve Length" name="sleeveLength" value={form.sleeveLength} onChange={handleChange} />
                            <Field label="Arm Hole" name="armHole" value={form.armHole} onChange={handleChange} />
                            <Field label="Bicep" name="bicep" value={form.bicep} onChange={handleChange} />
                            <Field label="Elbow" name="elbow" value={form.elbow} onChange={handleChange} />
                            <Field label="Forearm" name="forearm" value={form.forearm} onChange={handleChange} />
                            <Field label="Wrist / Cuff" name="wristCuff" value={form.wristCuff} onChange={handleChange} />
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div className="mb-4 border-b border-[#eee4d6] pb-3">
                            <h2 className="text-lg font-bold text-slate-950">Lower Body Measurements</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Trouser, shalwar, skirt, and lower-garment measurements.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <Field label="Length" name="shalwarLength" value={form.shalwarLength} onChange={handleChange} />
                            <Field label="Skirt Length" name="skirtLength" value={form.skirtLength} onChange={handleChange} />
                            <Field label="Choli / Frill Length" name="choliFrillLength" value={form.choliFrillLength} onChange={handleChange} />
                            <Field label="Waist / Belt" name="waistBelt" value={form.waistBelt} onChange={handleChange} />
                            <Field label="Hip" name="hip" value={form.hip} onChange={handleChange} />
                            <Field label="Crotch / Rise" name="crotchRise" value={form.crotchRise} onChange={handleChange} />
                            <Field label="Front Rise" name="frontRise" value={form.frontRise} onChange={handleChange} />
                            <Field label="Back Rise" name="backRise" value={form.backRise} onChange={handleChange} />
                            <Field label="Thigh" name="thigh" value={form.thigh} onChange={handleChange} />
                            <Field label="Right Thigh" name="rightThigh" value={form.rightThigh} onChange={handleChange} />
                            <Field label="Left Thigh" name="leftThigh" value={form.leftThigh} onChange={handleChange} />
                            <Field label="Inseam Length" name="inseamLength" value={form.inseamLength} onChange={handleChange} />
                            <Field label="Knees" name="knees" value={form.knees} onChange={handleChange} />
                            <Field label="Calf" name="calf" value={form.calf} onChange={handleChange} />
                            <Field label="Right Calf" name="rightCalf" value={form.rightCalf} onChange={handleChange} />
                            <Field label="Left Calf" name="leftCalf" value={form.leftCalf} onChange={handleChange} />
                            <Field label="Ankle / Bottom" name="ankleBottom" value={form.ankleBottom} onChange={handleChange} />
                            <Field label="Elastic" name="elastic" value={form.elastic} onChange={handleChange} />
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div className="mb-4 border-b border-[#eee4d6] pb-3">
                            <h2 className="text-lg font-bold text-slate-950">Designing &amp; Stitching Details</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Describe garment construction and finishing preferences.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <Field label="Fitting Style" name="fittingStyle" value={form.fittingStyle} onChange={handleChange} />
                            <Field label="Seam Style" name="seamStyle" value={form.seamStyle} onChange={handleChange} />
                            <ImageChoiceField
                                label="Neck"
                                value={form.neckDetail}
                                onChange={(value) => setForm((current) => ({ ...current, neckDetail: value }))}
                                options={neckDesignOptions}
                                extraField={{
                                    label: "Neck Design Value",
                                    value: form.neckDesignValue,
                                    onChange: (value) =>
                                        setForm((current) => ({ ...current, neckDesignValue: value }))
                                }}
                            />
                            <Field label="Front Strip" name="frontStrip" value={form.frontStrip} onChange={handleChange} />
                            <Field label="Shoulder Strap" name="shoulderStrapDetail" value={form.shoulderStrapDetail} onChange={handleChange} />
                            <Field label="Pocket" name="pocket" value={form.pocket} onChange={handleChange} />
                            <Field label="Pocket Flaps" name="pocketFlaps" value={form.pocketFlaps} onChange={handleChange} />
                            <Field label="Sleeve" name="sleeveStyle" value={form.sleeveStyle} onChange={handleChange} />
                            <ImageChoiceField
                                label="Wrist / Cuff"
                                value={form.wristCuffStyle}
                                onChange={(value) => setForm((current) => ({ ...current, wristCuffStyle: value }))}
                                options={cuffDesignOptions}
                                extraField={{
                                    label: "Cuff Design Value",
                                    value: form.cuffDesignValue,
                                    onChange: (value) =>
                                        setForm((current) => ({ ...current, cuffDesignValue: value }))
                                }}
                            />
                            <Field label="Ghaira / Bottom" name="ghairaBottomDetail" value={form.ghairaBottomDetail} onChange={handleChange} />
                            <Field label="Side Chaak / Slit" name="sideChaakSlit" value={form.sideChaakSlit} onChange={handleChange} />
                            <Field label="Plates / Darts" name="platesDarts" value={form.platesDarts} onChange={handleChange} />
                            <Field label="Zip" name="zip" value={form.zip} onChange={handleChange} />
                            <Field label="Button" name="button" value={form.button} onChange={handleChange} />
                            <Field label="Pipping" name="piping" value={form.piping} onChange={handleChange} />
                            <Field label="Dupatta / Veil" name="dupattaVeil" value={form.dupattaVeil} onChange={handleChange} />
                            <Field label="Shalwar" name="shalwar" value={form.shalwar} onChange={handleChange} />
                            <Field label="Pant / Trouser" name="pantTrouser" value={form.pantTrouser} onChange={handleChange} />
                            <Field label="Ankle / Pancha" name="anklePancha" value={form.anklePancha} onChange={handleChange} />
                            <TextAreaField label="Design Reference / Special Instructions" name="designReference" value={form.designReference} onChange={handleChange} />
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <div className="mb-4 border-b border-[#eee4d6] pb-3">
                            <h2 className="text-lg font-bold text-slate-950">Payment Details</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Professional billing summary for each order.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field
                                label="Total Payment (£)"
                                name="totalPayment"
                                value={form.totalPayment}
                                onChange={handleChange}
                                inputMode="decimal"
                                pattern="[0-9]*[.]?[0-9]*"
                            />
                            <Field
                                label="Advance Payment (£)"
                                name="advancePayment"
                                value={form.advancePayment}
                                onChange={handleChange}
                                inputMode="decimal"
                                pattern="[0-9]*[.]?[0-9]*"
                            />
                            <Field
                                label="Remaining Payment (£)"
                                name="remainingPayment"
                                value={form.remainingPayment}
                                onChange={handleChange}
                                readOnly
                                inputMode="decimal"
                                pattern="[0-9]*[.]?[0-9]*"
                            />
                            <div className="md:col-span-3">
                                <SelectField
                                    label="Order Status"
                                    name="orderStatus"
                                    value={form.orderStatus}
                                    onChange={handleChange}
                                    options={[
                                        { value: "Pending", label: "Pending" },
                                        { value: "In Progress", label: "In Progress" },
                                        { value: "Completed", label: "Completed" },
                                        { value: "Delivered", label: "Delivered" }
                                    ]}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-col gap-3 rounded-xl border border-[#e1d6c4] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Ready to save this order?</p>
                            {saveError ? (
                                <p className="mt-1 text-sm text-red-600">{saveError}</p>
                            ) : null}
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-md bg-[#122b2a] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#183936] disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            {isSaving ? "Saving..." : isEditing ? "Update order" : "Save order"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
