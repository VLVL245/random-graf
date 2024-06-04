//================================================================
// Изменение нулевой точки
export function changeVectorZeroPoint(
  vector: Vector2,
  newZero: Vector2,
): Vector2 {
  return { x: vector.x - newZero.x, y: vector.y - newZero.y };
}

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

  for (const node of nearestNodes.filter(
    (n) => ![node1.id, node2.id].includes(n.id),
  )) {
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

export function nodeIsNotFinal(
  node: Node,
  nodes: Node[],
  links: Link[],
): boolean {
  return !getFinalNodes(nodes, links)
    .map((n) => n.id)
    .includes(node.id);
}

export function getConvexHull(nodes: Node[], links: Link[], centroid: Node) {
  let hull: Node[] = [];
  const nonFinalNodes = nodes.filter((n) => nodeIsNotFinal(n, nodes, links));

  let nodes1: Node = centroid;
  let nodes2: Node = findNearestNodes(nodes, nodes1, 20)[0];
  let nodes3: Node | null = findThirdNode(nonFinalNodes, nodes1, nodes2, 30);

  let endNode = nodes2;

  if (nodes3 !== null) {
    const hullSegment: Node[] = [nodes2, nodes3];
    const maxIterations = 100;
    let iterations = 0;

    while (iterations < maxIterations) {
      nodes1 = nodes2;
      nodes2 = nodes3;
      nodes3 = findThirdNode(
        nonFinalNodes.filter(
          (n) => !hull.map((n) => n.id).includes(n.id) && n.id !== centroid.id,
        ),
        nodes1,
        nodes2,
        30,
      );

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

    hull = [...hull, ...hullSegment];
  } else {
    // Если не найден nodes3, добавляем только nodes1 и nodes2, чтобы сохранить структуру
    hull = [...hull, nodes1, nodes2];
  }

  return hull.slice(0, 3);
}
