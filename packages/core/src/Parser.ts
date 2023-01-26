import { Graph } from "./Graph";
import render from "./render";
import {
  ArrayType,
  ObjectType,
  PrimitiveType,
  PrimitiveTypeKind,
  Type,
  UnionType,
} from "./Type";
import { isArray, isObject, isPrimitive } from "./utils";

class Parser {
  private _graph = new Graph();

  parse(input: any): Graph {
    this.visit("root", typeof input === "string" ? JSON.parse(input) : input);
    return this._graph;
  }

  private visit(name: string, data: any, isOptional = false): Type {
    switch (true) {
      case isPrimitive(data):
        return this.parsePrimitive(name, data, isOptional);

      case isObject(data):
        return this._graph.addNewNode(this.parseObject(name, data, isOptional));

      case isArray(data):
        return this.parseArray(name, data, isOptional);

      default:
        throw new Error();
    }
  }

  private parseObject(
    name: string,
    data: Record<string, any>,
    isOptional = false
  ): ObjectType {
    return new ObjectType(
      name,
      new Map(
        Object.entries(data).map(([key, value]) => [
          key,
          this.visit(key, value),
        ])
      ),
      isOptional
    );
  }

  private parsePrimitive(name: string, data: any, isOptional = false) {
    return new PrimitiveType(
      name,
      typeof data as PrimitiveTypeKind,
      isOptional
    );
  }

  private parseArray(name: string, data: any[], isOptional = false): ArrayType {
    const members = new Set<Type>();
    const properties: Map<string, Type> = new Map();

    data.forEach((type) => {
      if (isObject(type)) {
        Object.entries(type).forEach(([key, value]) => {
          properties.set(key, this.visit(key, value));
          for (const [k, value] of properties) {
            if (k !== key) {
              value.isOptional = true;
            }
          }
        });
        return;
      }

      members.add(this.visit(name, type));
    });

    let type: Type;
    if (properties.size > 0) {
      const objType = new ObjectType(name, properties);
      this._graph.addNewNode(objType);
      members.add(objType);
    }

    if (members.size > 1) {
      type = new UnionType(name, members);
    } else {
      type = members.values().next().value;
    }

    const arrayType = new ArrayType(name, type, isOptional);

    return arrayType;
  }
}

export default function parse(input: any) {
  const parser = new Parser();
  const output = parser.parse(input);

  return render(output);
}
