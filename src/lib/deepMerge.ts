function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Arrays are replaced wholesale (not merged by index) so the admin panel can
// add/remove/reorder list items simply by sending the new full array.
export function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return (patch === undefined ? base : (patch as T));
  }
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch)) {
    const patchValue = patch[key];
    const baseValue = (base as Record<string, unknown>)[key];
    result[key] = isPlainObject(baseValue) && isPlainObject(patchValue)
      ? deepMerge(baseValue, patchValue)
      : patchValue;
  }
  return result as T;
}
