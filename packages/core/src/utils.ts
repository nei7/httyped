import { TypeKind } from "./Type";

export function isArray(value: unknown): value is Array<any> {
  return Array.isArray(value) && typeof value === "object";
}

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPrimitive(
  value: unknown
): value is string | null | number | boolean {
  if (
    value === null ||
    (typeof value !== "function" && typeof value !== "object")
  ) {
    return true;
  }
  return false;
}

export function getTypeKind(value: unknown): TypeKind {
  switch (true) {
    case isObject(value):
      return "object";
    case isArray(value):
      return "array";
    case isPrimitive(value):
      return typeof value as TypeKind;
    default:
      throw new Error();
  }
}

export function pascalCase(str: string) {
  return str
    .split("_")
    .map((s) => (s[0] ? s[0].toUpperCase() : "") + s.slice(1))
    .join("");
}
