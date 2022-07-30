export function isArray(value: unknown): value is Array<any> {
  return Array.isArray(value) && typeof value === "object";
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const tsTypeAnnotations = {
  any: "any",
  anyArray: "any[]",
};

export default function jsonSerializer(json: any, interfaceName = "") {
  if (isArray(json)) {
    return `type ${interfaceName} = ${convertArray(json)}`;
  }

  return setTypeDescriptor(interfaceName, convertObject(json));
}

function createUnionType(types: string[]) {
  return types.length > 1 ? `(${types.join(" | ")})` : types.join(" | ");
}

const setTypeDescriptor = (typeName: string, type: string) =>
  `interface ${typeName} ${type}`;

function convertArray(arr: any[], types: string[] = []): string {
  const unionTypes: string[] = [];

  for (const value of arr) {
    if (isObject(value)) {
      const type = convertObject(value);
      !unionTypes.includes(type) && unionTypes.push(type);
      continue;
    }

    const type = getTypeOf(value);
    !unionTypes.includes(type) && unionTypes.push(type);
  }

  return types.join("\n") + createUnionType(unionTypes);
}

function convertObject(obj: any, intend = 2, types: string[] = []): string {
  const space = " ".repeat(intend);
  const outputStr = Object.entries(obj)
    .map(([key, value]) => {
      if (isObject(value)) {
        return `${space}${key}: ${convertObject(value, intend * 2)}`;
      }
      return `${space}${key}: ${getTypeOf(value)}`;
    })
    .join("\n");

  if (outputStr === "") {
    return "object";
  }

  return `${types.join("\n")}{\n${outputStr}\n${space.slice(0, -2)}}`;
}

function getTypeOf(value: unknown): string {
  if (isArray(value)) {
    return convertArray(value);
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}
