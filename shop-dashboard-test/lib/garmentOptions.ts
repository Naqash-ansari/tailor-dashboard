export type GarmentKind = "upper" | "lower";

export type GarmentOptions = Record<GarmentKind, string[]>;

export const defaultGarmentOptions: GarmentOptions = {
  upper: ["Kurta", "Shirt", "Coat", "Shirt & Coat", "Waistcoat", "Blouse", "Gown", "None"],
  lower: ["Shalwar", "Trouser", "Skirt", "None"]
};

export function cleanGarmentValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

// Used for duplicate checks: "kurta", " KURTA " and "Kurta" are the same option.
export function normalizeGarmentValue(value: string) {
  return cleanGarmentValue(value).toLowerCase();
}

export function isGarmentKind(value: unknown): value is GarmentKind {
  return value === "upper" || value === "lower";
}
