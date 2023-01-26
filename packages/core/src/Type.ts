import { hash } from "ohash";
import { pascalCase } from "./utils";

export type PrimitiveTypeKind = "string" | "number" | "bool" | "null";
export type TypeKind = PrimitiveTypeKind | "object" | "union" | "array";

export abstract class Type {
  abstract readonly kind: TypeKind;
  abstract name: string;
  abstract isOptional: boolean;

  public constructor(public parentNode = null as Type | null) {}

  abstract stringify(): string;
}

export class PrimitiveType extends Type {
  constructor(
    public name: string,
    readonly kind: PrimitiveTypeKind,
    public isOptional: boolean = false
  ) {
    super();
  }

  stringify(): string {
    return this.kind;
  }
}

export class ObjectType extends Type {
  readonly kind: TypeKind = "object";
  properties: Map<string, Type>;

  constructor(
    public name: string,
    properties: Map<string, Type>,
    public isOptional: boolean = false
  ) {
    super();
    this.properties = properties;
  }

  addProperty(key: string, type: Type) {
    this.properties.set(key, type);
  }

  removeProperty(data: Type): boolean {
    return this.properties.delete(data.name);
  }

  setProperites(properties: Map<string, Type>) {
    this.properties = properties;
  }

  get hash(): string {
    return hash(this.properties);
  }

  stringify(): string {
    return pascalCase(this.name);
  }
}

export class ArrayType extends Type {
  readonly kind: TypeKind = "array";

  constructor(
    public name: string,
    public type: Type,
    public isOptional: boolean = false
  ) {
    super();
  }

  stringify(): string {
    const typeString = this.type.stringify();
    return `${
      this.type.kind === "union" ? `(${typeString})` : `${typeString}`
    }[]`;
  }
}

export class UnionType extends Type {
  public readonly kind: TypeKind = "union";

  constructor(
    public name: string,
    private _members: Set<Type>,
    public isOptional: boolean = false
  ) {
    super();
  }

  setMembers(members: Set<Type>) {
    this._members = members;
  }

  get members() {
    return this._members;
  }

  stringify(): string {
    return Array.from(this.members.values())
      .map((member) => member.stringify())
      .join(" | ");
  }
}

export function isObjectType(type: Type): type is ObjectType {
  return type.kind === "object";
}
