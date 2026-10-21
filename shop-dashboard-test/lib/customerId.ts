// Older orders were saved with an "AANS-" prefix on the customer ID; the shop no longer uses it.
export function stripLegacyIdPrefix(customerId: string) {
  return customerId.replace(/^AANS-/i, "");
}
