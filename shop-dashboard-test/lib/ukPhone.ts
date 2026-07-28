export function sanitizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

function nationalDigits(rawDigits: string) {
  if (rawDigits.startsWith("44")) {
    return rawDigits.slice(2);
  }

  if (rawDigits.startsWith("0")) {
    return rawDigits.slice(1);
  }

  return rawDigits;
}

export function isValidUkPhone(rawDigits: string) {
  return /^[1-9]\d{9}$/.test(nationalDigits(rawDigits));
}

export function toUkInternationalPhone(rawValue: string) {
  const digits = sanitizePhoneDigits(rawValue);
  return `44${nationalDigits(digits)}`;
}
