import * as d3 from "d3";
import { Delaunay } from "d3-delaunay";
import Point = Delaunay.Point;
import { sources } from "next/dist/compiled/webpack/webpack";

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

export interface PotentialLinks {
  source: Node;
  target: Node;
  dist: number;
}

// Функция вычисляет евклидово расстояние между двумя узлами
export function distance(nodeA: Node, nodeB: Node): number {
  return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
}

// Функция определяет пересечение двух отрезков на основе метода проверки ориентации треугольников(функция ccw)
function doLinesIntersect(a: Node, b: Node, c: Node, d: Node): boolean {
  function ccw(p1: Node, p2: Node, p3: Node): boolean {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  }
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

// Алгоритм Краскала для создания минимального остовного дерева
function kruskal(
  nodes: Node[],
  potentialLinks: PotentialLinks[],
  links: Link[],
) {
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

export function smallestConvexHullAroundPoint(
  delaunay: d3.Delaunay<Delaunay.Point>,
  nodes: Node[],
  centroid: Node,
): Node[] {
  // Извлечение точек из узлов
  const points = nodes.map((node) => [node.x, node.y] satisfies Point);

  // Найти ближайшую точку к заданной точке
  const nearestIndex = delaunay.find(centroid.x, centroid.y);

  // Получить соседей ближайшей точки
  const neighbors = new Set<number>();
  // Перебираем треугольники
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    if (
      delaunay.triangles[i] === nearestIndex ||
      delaunay.triangles[i + 1] === nearestIndex ||
      delaunay.triangles[i + 2] === nearestIndex
    ) {
      // Если треугольник содержит ближайшую точку, добавьте его вершины в набор соседей
      neighbors.add(delaunay.triangles[i]);
      neighbors.add(delaunay.triangles[i + 1]);
      neighbors.add(delaunay.triangles[i + 2]);
    }
  }
  // Удалить саму ближайшую точку из набора
  neighbors.delete(nearestIndex);

  // Преобразуйте индексы соседей обратно в точки
  const neighborPoints: [number, number][] = [];
  neighbors.forEach((index) => {
    neighborPoints.push(points[index]);
  });

  // TODO: Делайте это только в том случае, если мы решим, что нам нужна выпуклая оболочка.
  // Вычислить выпуклую оболочку соседних точек
  // const hull = d3.polygonHull(neighborPoints);

  // Сопоставьте точки корпуса с исходными узлами
  const hullNodes = neighborPoints?.map(
    ([hx, hy]) => nodes.find((node) => node.x === hx && node.y === hy)!,
  );

  return hullNodes || [];
}

export function findFurthestNodes(
  nodes: Node[],
  nodeA: Node,
  furthestCount: number,
): Node[] {
  return nodes
    .filter((node) => node.id !== nodeA.id)
    .sort((a, b) => distance(b, nodeA) - distance(a, nodeA));
  // .slice(0, furthestCount);
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

//============================================================================================================================

export function GrafGeneratorData(
  amountPoints: number,
  randomSeed: number,
  widthFieldSize: number,
  heightFieldSize: number,
  connectionControl: number,
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

  let potentialLinks: PotentialLinks[] = [];
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

  // Создаем связи с использованием алгоритма Краскала
  kruskal(nodes, potentialLinks, links);

  nodes.forEach((node) => {
    let foundLink = links.find(
      (link) => link.source === node.id || link.target === node.id,
    );
    if (!foundLink) {
      node.group = 3;
    }
  });
  const finalNodes: Node[] = getFinalNodes(nodes, links);
  const points = nodes.map((node) => [node.x, node.y] satisfies Point);
  const delaunay = d3.Delaunay.from(points);

  const maxDistance = 300;
  const lengthFinalNodePercentage = Math.round(100 / finalNodes.length);
  const maxIterationFinalNodes = connectionControl / lengthFinalNodePercentage;

  for (let i = 0; i < finalNodes.length; i++) {
    if (i >= maxIterationFinalNodes) break;
    const hull = smallestConvexHullAroundPoint(delaunay, nodes, finalNodes[i]);
    const finalNode = finalNodes[i];
    let furthestNodes = findFurthestNodes(hull, finalNode, 20);
    let targetNode = furthestNodes.find(
      (node) => !finalNodes.some((fn) => fn.id === node.id), //&&
      // distance(finalNode, node) <= maxDistance,
    );

    if (targetNode) {
      links.push({
        source: finalNode.id,
        target: targetNode.id,
        value: 0.8,
      });
    }
  }

  console.log(maxIterationFinalNodes);
  return { nodes, links };
}
