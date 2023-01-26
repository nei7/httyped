import { ObjectType, Type } from "./Type";

export class Graph {
  nodes: Map<string, ObjectType> = new Map<string, ObjectType>();

  /**
   * adds a new node to the graph
   * @param {ObjectType} data
   * @returns {ObjectType}
   */
  addNewNode(data: ObjectType): ObjectType {
    let node = this.nodes.get(data.hash);
    if (node != null) {
      return node;
    }

    this.nodes.set(data.hash, data);

    return data;
  }

  /**
   * remove a node from the graph
   * @param {T} data
   * @returns {Node<T> | null}
   */

  removeNode(key: string) {
    let nodeToRemove = this.nodes.get(key);

    this.nodes.forEach((node) => {
      if (nodeToRemove && node.properties.has(nodeToRemove.name)) {
        node.removeProperty(nodeToRemove);
      }
    });

    this.nodes.delete(key);
    return nodeToRemove;
  }
}
