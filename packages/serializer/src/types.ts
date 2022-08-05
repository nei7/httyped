export interface SerializerContext {
  types: TypeStructure[];
}

export interface TypeStructure {
  name: string;
  isUnion?: boolean;
  arrayOfTypes?: string[];
  objType: Record<string, string>;
  depth: number;
}
