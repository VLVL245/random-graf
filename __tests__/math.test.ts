import {
  Node,
  findFurthestNodes,
  distance,
} from "@/app/server/GrafGeneratorData";

describe("math", () => {
  it("calc distance", () => {
    const nodeA: Node = {
      id: "node1",
      group: 0,
      x: 10,
      y: 20,
    };
    const nodeB: Node = {
      id: "node2",
      group: 0,
      x: 15,
      y: 15,
    };
    expect(distance(nodeA, nodeB)).toBeCloseTo(7, 0);
  });
  it("finding the furthest points", () => {
    const nodes: Node[] = [
      {
        id: "node1",
        group: 0,
        x: 10,
        y: 10,
      },
      {
        id: "node2",
        group: 0,
        x: 15,
        y: 15,
      },
      {
        id: "node3",
        group: 0,
        x: 28,
        y: 16,
      },
      {
        id: "node4",
        group: 0,
        x: 35,
        y: 28,
      },
      {
        id: "node5",
        group: 0,
        x: 5,
        y: 64,
      },
      {
        id: "node6",
        group: 0,
        x: 18,
        y: 15,
      },
    ];

    const nodeA: Node = {
      id: "node7",
      group: 0,
      x: 5,
      y: 5,
    };
    expect(findFurthestNodes(nodes, nodeA, 10)).toStrictEqual([
      { group: 0, id: "node5", x: 5, y: 64 },
      { group: 0, id: "node4", x: 35, y: 28 },
      { group: 0, id: "node3", x: 28, y: 16 },
      { group: 0, id: "node6", x: 18, y: 15 },
      { group: 0, id: "node2", x: 15, y: 15 },
      { group: 0, id: "node1", x: 10, y: 10 },
    ]);
  });
});
