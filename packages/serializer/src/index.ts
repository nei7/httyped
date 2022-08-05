import { SerializerContext, TypeStructure } from "./types";
import {
  checkKebabCase,
  compareObjects,
  createUnionType,
  isArray,
  isObject,
  isOptional,
  onlyUnique,
  pascalCase,
} from "./utils";

export default function jsonSerializer(json: any, interfaceName = "") {
  const serializerContext: SerializerContext = {
    types: [],
  };

  if (isArray(json)) {
    convertArray(json, interfaceName, serializerContext, 0);
  } else {
    serializerContext.types.push({
      name: interfaceName,
      objType: convertObject(json, serializerContext, 0),
      depth: 0,
    });
  }

  return serializerContext.types
    .map(({ objType, name }, index) => {
      const stringTypeMap = Object.entries(objType || [])
        .map(([key, name]) => `  ${checkKebabCase(key)}: ${name};\n`)
        .reduce((a, b) => (a += b), "");

      let interfaceString = `interface ${name} {\n`;
      interfaceString += stringTypeMap;
      interfaceString += "}";

      return interfaceString;
    })
    .join("\n\n");
}

function pushToContext(
  typeStructure: TypeStructure,
  context: SerializerContext
): string {
  const objWithSameName = context.types.find(
    (type) => type.name === typeStructure.name
  );

  if (
    objWithSameName &&
    compareObjects(typeStructure.objType, objWithSameName.objType)
  ) {
    return typeStructure.name;
  }

  if (objWithSameName) {
    if (typeStructure.depth === objWithSameName.depth) {
      objWithSameName.objType = mergeObjects(
        objWithSameName.objType,
        typeStructure.objType
      );

      return objWithSameName.name;
    }

    typeStructure.name += context.types.filter((type) =>
      type.name.startsWith(typeStructure.name)
    ).length;
  }

  context.types.push(typeStructure);

  return typeStructure.name;
}

function convertObject(
  obj: any,
  context: SerializerContext,
  depth: number
): Record<string, string> {
  const outputObj: Record<string, string> = {};
  for (const key in obj) {
    const value = obj[key];
    if (isObject(value)) {
      const name = pascalCase(key);

      outputObj[key] = pushToContext(
        {
          objType: convertObject(value, context, depth),
          name,
          depth,
        },
        context
      );
      continue;
    }
    if (isArray(value)) {
      const types = convertArray(value, key, context, depth);

      outputObj[key] =
        types.length === 0 ? "[]" : createUnionType(types) + "[]";
      continue;
    }

    outputObj[key] = getTypeOf(value);
  }

  return outputObj;
}

function getTypeOf(value: unknown): string {
  if (value === null) {
    return "null";
  }

  return typeof value;
}

function getTypeStructure(
  structure: any,
  context: SerializerContext,
  depth: number
) {
  if (isObject(structure)) {
    return convertObject(structure, context, depth);
  }

  if (isArray(structure)) {
    return convertArray(structure, "", context, depth);
  }

  return getTypeOf(structure);
}

function convertArray(
  arr: any[],
  keyName: string,
  rootContext: SerializerContext,
  depth: number
): string[] {
  const unionTypes: string[] = [];

  if (arr.length === 0) {
    return unionTypes;
  }

  const detectObjects = arr.filter((_) => isObject(_));
  if (detectObjects.length === 0) {
    return arr
      .map(
        (item) => getTypeStructure(item, rootContext, 0) as string | string[]
      )
      .flatMap((type) => type)
      .filter(onlyUnique);
  }

  const context: SerializerContext = {
    types: [],
  };

  const typesOfArray = detectObjects.map(
    (_) => getTypeStructure(_, context, 0) as Record<string, string>
  );

  const name = pascalCase(keyName);

  unionTypes.push(
    pushToContext(
      {
        name,
        objType: mergeObjects(...typesOfArray),
        depth,
      },
      rootContext
    )
  );

  context.types.forEach((type) => pushToContext(type, rootContext));

  return unionTypes;
}

function mergeObjects(
  ...objects: Record<string, string>[]
): Record<string, string> {
  const obj = objects
    .slice(1)
    .reduce<Record<string, string | string[]>>((acc, current) => {
      Object.entries(current).forEach(([key, value]) => {
        if (isOptional(key)) {
          key = key.slice(0, -1);
        }
        if (!(key in acc)) {
          acc[key + "?"] = value;
          return;
        }

        const accValue = acc[key];
        if (isArray(accValue) && !accValue.includes(value)) {
          accValue.push(value);
          return;
        }
        if (value === accValue) {
          return;
        }

        const values = isArray(accValue) ? accValue : [accValue];
        acc[key] =
          accValue !== value
            ? mergeUnion(value, values).filter(onlyUnique)
            : acc[key];

        return;
      });

      return acc;
    }, objects.at(0)!);

  return getMergedUnion(obj);
}

function mergeUnion(union: string, types: string[]): string[] {
  return [
    ...union.split(" | ").map((_) => _.replaceAll(/((\(|\)))/g, "")),
    ...types
      .map((type) => type.replaceAll(/((\(|\)))/g, "").split(" | "))
      .flatMap((_) => _),
  ].filter(onlyUnique);
}

function getMergedUnion(
  obj: Record<string, string | string[]>
): Record<string, string> {
  for (const key in obj) {
    const value = obj[key];
    if (isArray(value)) {
      obj[key] = createUnionType(value);
    }
  }

  return obj as Record<string, string>;
}
