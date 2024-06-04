import {
  Node,
  angleBetweenVectors,
  changeVectorZeroPoint,
  getDegreeFromRadian,
  getDotProduct,
  getMagnitude,
  findNearestNodes,
  findThirdNode,
  findFurthestNodes,
} from "@/app/server/GrafGeneratorData";
import { group } from "console";

describe("math", () => {
  it("finding the nearest points", () => {
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

    expect(findNearestNodes(nodes, nodeA, 10)).toStrictEqual([
      { group: 0, id: "node1", x: 10, y: 10 },
      { group: 0, id: "node2", x: 15, y: 15 },
      { group: 0, id: "node6", x: 18, y: 15 },
      { group: 0, id: "node3", x: 28, y: 16 },
      { group: 0, id: "node4", x: 35, y: 28 },
      { group: 0, id: "node5", x: 5, y: 64 },
    ]);
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

  it("correctly changes zero point of vector", () => {
    const node1: Node = {
      id: "1",
      group: 0,
      x: 15,
      y: 10,
    };

    const node2: Node = {
      id: "2",
      group: 0,
      x: 10,
      y: 10,
    };

    const newVector = changeVectorZeroPoint(node1, node2);
    expect(newVector.x).toBe(5);
    expect(newVector.y).toBe(0);
  });

  it("calculates dot product", () => {
    const node1: Node = {
      id: "1",
      group: 0,
      x: 15,
      y: 12,
    };

    const node2: Node = {
      id: "2",
      group: 0,
      x: 10,
      y: 10,
    };

    const node3: Node = {
      id: "3",
      group: 0,
      x: 12,
      y: 20,
    };

    const v1 = changeVectorZeroPoint(node1, node2);
    const v2 = changeVectorZeroPoint(node3, node2);
    const dotProduct = getDotProduct(v1, v2);
    expect(dotProduct).toBe(30);
  });

  it("calculates magnitude", () => {
    const node1: Node = {
      id: "1",
      group: 0,
      x: 15,
      y: 12,
    };

    const node2: Node = {
      id: "2",
      group: 0,
      x: 10,
      y: 10,
    };

    const v1 = changeVectorZeroPoint(node1, node2);
    const magnitude = getMagnitude(v1);
    expect(magnitude.toFixed(3)).toBe("5.385");
  });

  it("correctly converts radians to degrees", () => {
    expect(getDegreeFromRadian(0)).toBeCloseTo(0);
    expect(getDegreeFromRadian(Math.PI / 6)).toBeCloseTo(30);
    expect(getDegreeFromRadian(Math.PI / 4)).toBeCloseTo(45);
    expect(getDegreeFromRadian(Math.PI / 3)).toBeCloseTo(60);
    expect(getDegreeFromRadian(Math.PI / 2)).toBeCloseTo(90);
    expect(getDegreeFromRadian((2 * Math.PI) / 3)).toBeCloseTo(120);
    expect(getDegreeFromRadian((3 * Math.PI) / 4)).toBeCloseTo(135);
    expect(getDegreeFromRadian((5 * Math.PI) / 6)).toBeCloseTo(150);
    expect(getDegreeFromRadian(Math.PI)).toBeCloseTo(180);
  });

  it("correctly calculates angle between three points", () => {
    const node1: Node = {
      id: "1",
      group: 0,
      x: 15,
      y: 12,
    };

    const node2: Node = {
      id: "2",
      group: 0,
      x: 10,
      y: 10,
    };

    const node3: Node = {
      id: "3",
      group: 0,
      x: 12,
      y: 20,
    };

    expect(
      getDegreeFromRadian(angleBetweenVectors(node1, node2, node3)),
    ).toBeCloseTo(56.89);
  });

  it("correct operation find the third node", () => {
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
        x: 11,
        y: 11,
      },
      {
        id: "node3",
        group: 0,
        x: 14,
        y: 12,
      },
      {
        id: "node4",
        group: 0,
        x: 15,
        y: 11,
      },
      {
        id: "node5",
        group: 0,
        x: 9,
        y: 9,
      },
      {
        id: "node6",
        group: 0,
        x: 12,
        y: 10,
      },
      {
        id: "node7",
        group: 0,
        x: 11,
        y: 8,
      },
      {
        id: "node8",
        group: 0,
        x: 14,
        y: 7,
      },
      {
        id: "node9",
        group: 0,
        x: 16,
        y: 9,
      },
      {
        id: "node10",
        group: 0,
        x: 12,
        y: 7,
      },
      {
        id: "nodes11",
        group: 0,
        x: 14,
        y: 10,
      },
      {
        id: "nodes12",
        group: 0,
        x: 15,
        y: 10,
      },
      {
        id: "nodes13",
        group: 0,
        x: 11,
        y: 6,
      },
    ];
    const finalNodes: Node[] = [
      {
        id: "nodes11",
        group: 0,
        x: 14,
        y: 10,
      },
      {
        id: "nodes12",
        group: 0,
        x: 15,
        y: 10,
      },
      {
        id: "nodes13",
        group: 0,
        x: 11,
        y: 6,
      },
    ];
    const nodeA: Node = finalNodes[0];
    const nodeB: Node = findNearestNodes(nodes, nodeA, 10)[0];
    expect(findThirdNode(nodes, finalNodes, nodeA, nodeB, 10)).toStrictEqual({
      group: 0,
      id: "node7",
      x: 11,
      y: 8,
    });
  });
});
