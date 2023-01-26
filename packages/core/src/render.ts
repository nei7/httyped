import { Graph } from "./Graph";
import { isObjectType, ObjectType, Type } from "./Type";

export default function render(graph: Graph, indent = 2): string {
  const indentStr = " ".repeat(indent);

  let output = "";

  function renderObject(obj: ObjectType): string {
    let output = `interface ${obj.stringify()} { \n`;
    output += Array.from(obj.properties).reduce(
      (acc, [key, type]) =>
        acc +
        `${indentStr}${key}${
          type.isOptional ? "?" : ""
        }: ${type.stringify()};\n`,
      ""
    );
    output += "}\n\n";
    return output;
  }

  for (const type of graph.nodes.values()) {
    output += renderObject(type);
  }

  return output;
}
