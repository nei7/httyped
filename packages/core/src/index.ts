type JsonObjArray = string[] | number[] | JsonObj[] | never[];
type JsonObj = Record<string, string | number | null | JsonObjArray | object>;

interface Field {
  fieldName: string;
  typesNames: Set<string>;
  isOptional: boolean;
  isArray: boolean;
}

interface ObjStructure {
  name: string;
  fields: Field[];
}

class ObjStructure implements ObjStructure {
  public fields: Field[];
  constructor(public name: string, fields: Field[] = []) {
    this.fields = fields;
  }

  add = (field: Field) => {
    this.fields.push(field);
  };

  get = (fieldName: string) => {
    return this.fields.find((field) => field.fieldName === fieldName);
  };

  has = (fieldName: string) => {
    return !!this.get(fieldName);
  };

  public toString(): string {
    const fieldsString = this.fields.reduce((s, field) => {
      return s
        .concat("\n")
        .concat(" ".repeat(2))
        .concat(
          `${field.fieldName}${field.isOptional ? "?" : ""}: ${mergeUnion(
            field.typesNames
          )}${field.isArray ? "[]" : ""}`
        );
    }, "");

    return `interface ${this.name} {${fieldsString}\n}`;
  }
}

function mergeUnion(types: Set<string>): string {
  const u = [...types].join(" | ");
  return types.size > 2 ? `(${u})` : u;
}

export function parse(data: string): string {
  const obj = JSON.parse(data) as JsonObj;

  const childObjects = new Map<string, ObjStructure>();

  const parseObject = (obj: JsonObj, name: string): ObjStructure => {
    const structure = new ObjStructure(name);

    for (const key in obj) {
      const value = obj[key];

      if (isArray(value)) {
        structure.add({
          fieldName: key,
          typesNames: parseArray(value, key),
          isOptional: false,
          isArray: true,
        });
        continue;
      }

      if (isObject(value)) {
        let name = pascalCase(key);

        childObjects.set(name, parseObject(value, name));

        structure.add({
          fieldName: key,
          typesNames: new Set([name]),
          isOptional: false,
          isArray: false,
        });

        continue;
      }

      structure.add({
        fieldName: key,
        typesNames: new Set([getTypeOf(value)]),
        isOptional: false,
        isArray: false,
      });
    }

    return structure;
  };

  const parseArray = (array: JsonObjArray, name: string): Set<string> => {
    const types = new Set<string>();
    const obj: ObjStructure = new ObjStructure(pascalCase(name));

    for (const value of array) {
      if (isObject(value)) {
        for (const key in value) {
          const v = value[key];
          if (obj.has(key)) {
            obj.get(key)?.typesNames.add(getTypeOf(v));
            continue;
          }

          if (isObject(v)) {
            const { name } = parseObject(v, pascalCase(key));

            obj.add({
              fieldName: key,
              typesNames: new Set([name]),
              isOptional: false,
              isArray: false,
            });
          }

          if (isArray(v)) {
            obj.add({
              fieldName: key,
              typesNames: parseArray(v, name),
              isOptional: false,
              isArray: true,
            });

            continue;
          }

          obj.add({
            fieldName: key,
            typesNames: new Set([getTypeOf(v)]),
            isOptional: false,
            isArray: false,
          });
        }

        continue;
      }

      if (isArray(value)) {
        const typesSet = parseArray(value, name);
        typesSet.forEach((t) => types.add(t));

        continue;
      }

      types.add(getTypeOf(value));
    }

    types.add(obj.name);

    childObjects.set(obj.name, obj);

    return types;
  };

  const root = parseObject(obj, "Root");

  return transform([...childObjects.values(), root]);
}

function isArray(value: unknown): value is Array<any> {
  return Array.isArray(value) && typeof value === "object";
}

function isObject(value: unknown): value is JsonObj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const getTypeOf = (value: unknown): string => {
  if (value === null) {
    return "null";
  }

  return typeof value;
};

function transform(objs: ObjStructure[]): string {
  return objs.reduce((s, obj) => s.concat(obj.toString().concat("\n\n")), "");
}

function pascalCase(str: string) {
  return str
    .split("_")
    .map((s) => (s[0] ? s[0].toUpperCase() : "") + s.slice(1))
    .join("");
}
