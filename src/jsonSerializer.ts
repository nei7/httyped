type InterfaceTypes =
  | "null"
  | "string"
  | "number"
  | "undefined"
  | "bigint"
  | "boolean"
  | "object";

function isArray(value: object): value is Array<unknown> {
  return Array.isArray(value) && typeof value === "object";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getTypeOf(value: unknown): InterfaceTypes {
  if (value === null) {
    return "null";
  }
  return typeof value as InterfaceTypes;
}

const DEFAULT_INTEND = 2;

const tsTypeAnnotations = {
  any: "any",
  anyArray: "any[]",
};

export default function jsonSerializer(
  json: any,
  interfaceName = "",
  intend?: number
) {
  let additionalTypes = "\n";

  if (isArray(json)) {
    return `export type ${interfaceName} = ${convertArray(
      json,
      interfaceName
    )}`.concat(additionalTypes);
  }

  const interfaceType = convertJsonToInterface(json, intend, interfaceName);

  function convertJsonToInterface(
    _json: any,
    _intend = DEFAULT_INTEND,
    interfaceName = ""
  ): string {
    const space = " ".repeat(_intend);
    let outString = `${
      !interfaceName ? "" : `export interface ${interfaceName} `
    }{ \n`;

    const join = (key: string, value: string) =>
      space + key + ": " + value + "\n";

    for (const key in _json) {
      const value = _json[key];

      if (isObject(value)) {
        outString += join(key, convertJsonToInterface(value, _intend * 2));
        continue;
      }
      if (isArray(value)) {
        outString += join(key, convertArray(value, key));
        continue;
      }

      outString += join(key, getTypeOf(value));
    }

    return outString.concat(space.slice(0, -DEFAULT_INTEND), "}");
  }

  function convertArray(arr: any[], fieldName: string): string {
    let fieldTypes: string[] = [];

    const insertType = (type: string) =>
      !fieldTypes.includes(type) && fieldTypes.push(type);

    for (let value of arr) {
      if (isObject(value)) {
        const objType = convertJsonToInterface(
          value,
          DEFAULT_INTEND,
          fieldName
        );

        additionalTypes += objType;
        insertType(fieldName);

        continue;
      }
      if (isArray(value)) {
        insertType(tsTypeAnnotations.anyArray);
        continue;
      }
      insertType(getTypeOf(value));
    }
    const unionType = fieldTypes.join(" | ");
    return fieldTypes.length === 1
      ? unionType.concat("[]")
      : `(${unionType})[]`;
  }

  return additionalTypes.concat(interfaceType);
}
