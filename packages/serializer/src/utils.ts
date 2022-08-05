export function isArray(value: unknown): value is Array<any> {
  return Array.isArray(value) && typeof value === "object";
}

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function arraysContainSameElements(arr1: any[], arr2: any[]): boolean {
  if (arr1 === undefined || arr2 === undefined) return false;

  return arr1.sort().join("") === arr2.sort().join("");
}

export function createUnionType(types: string[]) {
  return types.length > 1 ? `(${types.join(" | ")})` : types.join(" | ");
}

export const isOptional = (key: string) => key.endsWith("?");

export function isUnion(s: string): boolean {
  return s.split("|").length >= 2;
}

export function onlyUnique(value: any, index: number, self: any[]) {
  return self.indexOf(value) === index;
}

export const pascalCase = (str: string) =>
  str
    .split("_")
    .map((s) => (s[0] ? s[0].toUpperCase() : "") + s.slice(1))
    .join("");

export function checkKebabCase(s: string) {
  return s.includes("-") ? `"${s}"` : s;
}

export function compareObjects(obj1: object, obj2: object) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
