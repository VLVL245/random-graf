import * as d3 from 'd3';
import {Delaunay} from "d3-delaunay";
import Point = Delaunay.Point;

export interface Node {
  id: string;
  group: number;
  x: number;
  y: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Link {
  source: string;
  target: string;
  value: number;
}

// Функция вычисляет евклидово расстояние между двумя узлами
function distance(nodeA: Node, nodeB: Node): number {
  return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
}

// Функция определяет пересечение двух отрезков на основе метода проверки ориентации треугольников(функция ccw)
function doLinesIntersect(a: Node, b: Node, c: Node, d: Node): boolean {
  function ccw(p1: Node, p2: Node, p3: Node): boolean {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  }
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

export function smallestConvexHullAroundPoint(delaunay: d3.Delaunay<Delaunay.Point>, nodes: Node[], givenPoint: Node): Node[] {
  // Extract points from nodes
  const points = nodes.map(node => [node.x, node.y] satisfies Point);
  // const voronoi = delaunay.voronoi([0, 0, 1, 1]);

  // Find the nearest point to the given point
  const nearestIndex = delaunay.find(givenPoint.x, givenPoint.y);

  // Get the neighbors of the nearest point
  const neighbors = new Set<number>();
  // Loop through the triangles
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    if (delaunay.triangles[i] === nearestIndex || delaunay.triangles[i + 1] === nearestIndex || delaunay.triangles[i + 2] === nearestIndex) {
      // If the triangle contains the nearest point, add its vertices to the neighbors set
      neighbors.add(delaunay.triangles[i]);
      neighbors.add(delaunay.triangles[i + 1]);
      neighbors.add(delaunay.triangles[i + 2]);
    }
  }
  // Remove the nearest point itself from the set
  neighbors.delete(nearestIndex);

  // Convert the neighbor indices back to points
  const neighborPoints: [number, number][] = [];
  neighbors.forEach(index => {
    neighborPoints.push(points[index]);
  });

  // TODO: Do this only if we decide that we need a convex hull
  // Compute the convex hull of the neighbor points
  // const hull = d3.polygonHull(neighborPoints);

  // Map the hull points back to the original nodes
  const hullNodes = neighborPoints?.map(([hx, hy]) => nodes.find(node => node.x === hx && node.y === hy)!);

  return hullNodes || [];
}

// Изменение нулевой точки
export function changeVectorZeroPoint(
  vector: Vector2,
  newZero: Vector2,
): Vector2 {
  return { x: vector.x - newZero.x, y: vector.y - newZero.y };
}
//================================================================
export function getDotProduct(v1: Vector2, v2: Vector2) {
  return v1.x * v2.x + v1.y * v2.y;
}

export function getMagnitude(vector: Vector2) {
  return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
}

export function getDegreeFromRadian(radian: number) {
  return radian * (180 / Math.PI);
}

// Функция для вычисления угла между двумя векторами
export function angleBetweenVectors(n1: Node, n2: Node, n3: Node): number {
  const v1 = changeVectorZeroPoint(n1, n2);
  const v2 = changeVectorZeroPoint(n3, n2);
  return Math.acos(
    getDotProduct(v1, v2) / (getMagnitude(v1) * getMagnitude(v2)),
  );
}
//================================================================

// Функция для нахождения ближайших точек
export function findNearestNodes(
  nodes: Node[],
  nodeA: Node,
  nearestCount: number,
): Node[] {
  return nodes
    .filter((node) => node.id !== nodeA.id)
    .sort((a, b) => distance(nodeA, a) - distance(nodeA, b))
    .slice(0, nearestCount);
}

export function findFurthestNodes(
  nodes: Node[],
  nodeA: Node,
  furthestCount: number,
): Node[] {
  return nodes
    .filter((node) => node.id !== nodeA.id)
    .sort((a, b) => distance(b, nodeA) - distance(a, nodeA))
    .slice(0, furthestCount);
}

// Функция для нахождения третьей точки по принципу наименьшего угла среди ближайших точек
export function findThirdNode(
  nodes: Node[],
  node1: Node,
  node2: Node,
  nearestCount: number,
): Node | null {
  const nearestNodes = findNearestNodes(nodes, node2, nearestCount);
  let minAngle = Infinity;
  let thirdNode: Node | null = null;

  for (const node of nearestNodes.filter(n => ![node1.id, node2.id].includes(n.id))) {
    const angle = angleBetweenVectors(node1, node2, node);
    const v1 = changeVectorZeroPoint(node1, node2);
    const v2 = changeVectorZeroPoint(node2, node);
    const crossProduct = v1.x * v2.y - v1.y * v2.x;

    if (crossProduct < 0 && angle < minAngle) {
      minAngle = angle;
      thirdNode = node;
    }
  }

  return thirdNode;
}

export function getFinalNodes(nodes: Node[], links: Link[]) {
  const linesNodes: string[] = [];

  links.forEach((link) => {
    linesNodes.push(link.source, link.target);
  });

  const finalNodesListId: string[] = linesNodes.filter(
    (node) => linesNodes.indexOf(node) === linesNodes.lastIndexOf(node),
  );

  const finalNodes: Node[] = [];
  finalNodesListId.forEach((finalNode) => {
    nodes.forEach((node) => {
      if (finalNode === node.id) {
        finalNodes.push({
          id: node.id,
          group: node.group,
          x: node.x,
          y: node.y,
        });
      }
    });
  });

  return finalNodes;
}

export function nodeIsNotFinal(node: Node, nodes: Node[], links: Link[]): boolean {
  return !getFinalNodes(nodes, links).map(n => n.id).includes(node.id);
}

export function getConvexHull(nodes: Node[], links: Link[], centroid: Node) {
  let hull: Node[] = [];
  const nonFinalNodes = nodes.filter(n => nodeIsNotFinal(n, nodes, links));

  let nodes1: Node = centroid;
  let nodes2: Node = findNearestNodes(nodes, nodes1, 20)[0];
  let nodes3: Node | null = findThirdNode(
    nonFinalNodes,
    nodes1,
    nodes2,
    30,
  );

  let endNode = nodes2;

  if (nodes3 !== null) {
    const hullSegment: Node[] = [nodes2, nodes3];
    const maxIterations = 100;
    let iterations = 0;

    while (iterations < maxIterations) {
      nodes1 = nodes2;
      nodes2 = nodes3;
      nodes3 = findThirdNode(nonFinalNodes.filter(n => !hull.map(n => n.id).includes(n.id) && n.id !== centroid.id), nodes1, nodes2, 30);

      if (nodes3 !== null) {
        if (nodes3.id === endNode.id) {
          hullSegment.push(nodes3); // Замыкаем оболочку
          break;
        }
        if (hullSegment.includes(nodes3)) {
          break; // Прерываем цикл, если узел уже присутствует в сегменте оболочки
        }
        hullSegment.push(nodes3);
      } else {
        break; // Прерываем цикл, если не найден nodes3
      }

      iterations++;
    }

    hull = [...hull, ...hullSegment]
  } else {
    // Если не найден nodes3, добавляем только nodes1 и nodes2, чтобы сохранить структуру
    hull= [...hull, nodes1, nodes2]
  }

  return hull.slice(0, 3);
}

//============================================================================================================================

export function GrafGeneratorData(
  amountPoints: number,
  randomSeed: number,
  widthFieldSize: number,
  heightFieldSize: number,
): {
  nodes: Node[];
  links: Link[];
} {
  const width = widthFieldSize;
  const height = heightFieldSize;
  let random = d3.randomLcg(randomSeed);

  const nodes: Node[] = [];

  for (let i = 0; i < amountPoints; i++) {
    let randomX: number;
    let randomY: number;
    let tooClose: boolean;

    do {
      tooClose = false;
      randomX = Math.floor(random() * width);
      randomY = Math.floor(random() * height);

      if (randomX < 10) randomX = 10;
      if (randomY < 10) randomY = 10;
      if (randomX > width - 10) randomX = width - 10;
      if (randomY > height - 10) randomY = height - 10;

      for (const node of nodes) {
        if (distance({ x: randomX, y: randomY, id: "", group: 0 }, node) < 10) {
          tooClose = true;
          break;
        }
      }
    } while (tooClose);

    nodes.push({
      id: `node${i + 1}`,
      group: 0,
      x: randomX,
      y: randomY,
    });
  }

  const links: Link[] = [];

  let potentialLinks: { source: Node; target: Node; dist: number }[] = [];
  nodes.forEach((nodeA, indexA) => {
    nodes.forEach((nodeB, indexB) => {
      if (indexA !== indexB) {
        potentialLinks.push({
          source: nodeA,
          target: nodeB,
          dist: distance(nodeA, nodeB),
        });
      }
    });
  });
  potentialLinks.sort((a, b) => a.dist - b.dist);

  // Алгоритм Краскала для создания минимального остовного дерева
  function kruskal() {
    const parent = new Map<string, string>();

    function find(node: string): string {
      if (parent.get(node) !== node) {
        parent.set(node, find(parent.get(node)!));
      }
      return parent.get(node)!;
    }

    function union(nodeA: string, nodeB: string) {
      const rootA = find(nodeA);
      const rootB = find(nodeB);
      if (rootA !== rootB) {
        parent.set(rootA, rootB);
      }
    }

    nodes.forEach((node) => parent.set(node.id, node.id));

    potentialLinks.forEach((linkInfo) => {
      const rootSource = find(linkInfo.source.id);
      const rootTarget = find(linkInfo.target.id);

      if (rootSource !== rootTarget) {
        let intersects = links.some((link) => {
          const sourceNode = nodes.find((n) => n.id === link.source);
          const targetNode = nodes.find((n) => n.id === link.target);
          return (
            sourceNode &&
            targetNode &&
            doLinesIntersect(
              linkInfo.source,
              linkInfo.target,
              sourceNode,
              targetNode,
            )
          );
        });

        if (!intersects) {
          links.push({
            source: linkInfo.source.id,
            target: linkInfo.target.id,
            value: 0.8,
          });
          union(linkInfo.source.id, linkInfo.target.id);
        }
      }
    });
  }

  // Создаем связи с использованием алгоритма Краскала
  kruskal();

  nodes.forEach((node) => {
    let foundLink = links.find(
      (link) => link.source === node.id || link.target === node.id,
    );
    if (!foundLink) {
      node.group = 3;
    }
  });

  //finalNodes.forEach((finalNode, index) => {
  //  if (index < hull.length) {
  //    let targetNode = findFurthestNodes(hull[index], finalNode, 1)[0];
  //    if (targetNode) {
  //      // Проверяем, пересекает ли новая линия уже существующие линии
  //      let intersects = links.some((link) => {
  //        const sourceNode = nodes.find((n) => n.id === link.source);
  //        const targetNodeExisting = nodes.find((n) => n.id === link.target);
  //        return (
  //          sourceNode &&
  //          targetNodeExisting &&
  //          doLinesIntersect(
  //            finalNode,
  //            targetNode,
  //            sourceNode,
  //            targetNodeExisting,
  //          )
  //        );
  //      });
  //
  //      // Добавляем линию, только если она не пересекает другие линии
  //      if (!intersects) {
  //        links.push({
  //          source: finalNode.id,
  //          target: targetNode.id,
  //          value: 0.8,
  //        });
  //      }
  //    }
  //  }
  //});

  return { nodes, links };
}
