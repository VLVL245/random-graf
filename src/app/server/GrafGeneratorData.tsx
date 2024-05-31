
import { randomLcg } from "d3";


export interface Node {
	id: string,
	group: number,
	x: number,
	y: number
}

export interface Link {
	source: string,
	target: string,
	value: number
}

// Функция вычисляет евклидово расстояние между двумя узлами
function distance(nodeA: Node, nodeB: Node): number {
	return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2)
}

// Функция определяет пересечение двух отрезков на основе метода проверки ориентации треугольников(функция ccw)
function doLinesIntersect(a: Node, b: Node, c: Node, d: Node): boolean {
	function ccw(p1: Node, p2: Node, p3: Node): boolean {
	  return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x)
	}
	return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d)
}

export function GrafGeneratorData(
amountPoints: number,
randomSeed: number,
widthFieldSize: number,
heightFieldSize: number
) : {
nodes: Node[],
links: Link[]
} {
	
	const width = widthFieldSize
	const height = heightFieldSize
	let random = randomLcg(randomSeed)

	const nodes: Node[]  = []

	for (let i = 0; i < amountPoints; i++) {
		let randomX: number
		let randomY: number
		let tooClose: boolean
	
		do {
			tooClose = false;
			randomX = Math.floor(random() * width)
			randomY = Math.floor(random() * height)
	
			if (randomX < 10) randomX = 10
			if (randomY < 10) randomY = 10
			if (randomX > width - 10) randomX = width - 10
			if (randomY > height - 10) randomY = height - 10

			for (const node of nodes) {
				if (distance({ x: randomX, y: randomY, id: '', group: 0 }, node) < 10) {
					tooClose = true
					break
				}
			}
		} while (tooClose)
	
		nodes.push({
			id: `node${i + 1}`,
			group: 0,
			x: randomX,
			y: randomY
		})
	}

	const links: Link[] = []

	const attempts = new Map<string, number>()

	let potentialLinks: { source: Node, target: Node, dist: number }[] = []
	nodes.forEach((nodeA, indexA) => {
		nodes.forEach((nodeB, indexB) => {
			if (indexA !== indexB) {
				potentialLinks.push({
					source: nodeA,
					target: nodeB,
					dist: distance(nodeA, nodeB)
				})
			}
		})
	})
	potentialLinks.sort((a, b) => a.dist - b.dist)

	// Алгоритм Краскала для создания минимального остовного дерева
	function kruskal() {
		const parent = new Map<string, string>()

		function find(node: string): string {
				if (parent.get(node) !== node) {
					parent.set(node, find(parent.get(node)!))
				}
			return parent.get(node)!
		}

		function union(nodeA: string, nodeB: string) {
			const rootA = find(nodeA)
			const rootB = find(nodeB)
			if (rootA !== rootB) {
				parent.set(rootA, rootB)
			}
		}

		nodes.forEach(node => parent.set(node.id, node.id))

		potentialLinks.forEach(linkInfo => {
			const rootSource = find(linkInfo.source.id)
			const rootTarget = find(linkInfo.target.id)

			if (rootSource !== rootTarget) {
				let intersects = links.some(link => {
					const sourceNode = nodes.find(n => n.id === link.source)
					const targetNode = nodes.find(n => n.id === link.target)
					return sourceNode && targetNode && doLinesIntersect(
						linkInfo.source,
						linkInfo.target,
						sourceNode,
						targetNode
					)
				})

				if (!intersects) {
					links.push({
						source: linkInfo.source.id,
						target: linkInfo.target.id,
						value: 0.8
					})
					union(linkInfo.source.id, linkInfo.target.id)
				}
			}
		});
	}

	// Создаем связи с использованием алгоритма Краскала
	kruskal()

	nodes.forEach(node => {
		let foundLink = links.find(link => link.source === node.id || link.target === node.id)
		if (!foundLink) {
			node.group = 3
		}
	})



function findFinalNodes(): string[] {
	const linesNodes: string[] = []

	links.forEach((link) => {
		linesNodes.push(
			link.source,
			link.target
		)
	})
	return linesNodes.filter((node) => linesNodes.indexOf(node) === linesNodes.lastIndexOf(node))
}

const finalNodesListId: string[] = findFinalNodes()

const finalNodes: Node[] = []

finalNodesListId.forEach((finalNode) => {
	nodes.forEach((node) => {
		if(finalNode === node.id) {
			finalNodes.push({
				id: node.id,
				group:node.group,
				x: node.x,
				y: node.y
		})
		}
	})
})

// Функция для вычисления угла между двумя точками
function angle(p1: Node, p2: Node): number {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
 }
 
 // Функция для вычисления векторного произведения
 function cross(o: Node, a: Node, b: Node): number {
	return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
 }
 
 // Функция для построения выпуклой оболочки вокруг одной точки
 function buildConvexHull(points: Node[]): Node[] {
	if (points.length < 3) return points;
 
	// Находим самую нижнюю точку (если несколько, выбираем самую левую)
	const start = points.reduce((prev, curr) => (curr.y < prev.y || (curr.y === prev.y && curr.x < prev.x)) ? curr : prev);
 
	// Сортируем точки по углу и расстоянию от стартовой точки
	const sortedPoints = points.slice().sort((a, b) => {
	  const ang = angle(start, a) - angle(start, b);
	  return ang === 0 ? distance(start, a) - distance(start, b) : ang;
	});
 
	const hull: Node[] = [];
	for (const point of sortedPoints) {
	  while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
		 hull.pop();
	  }
	  hull.push(point);
	}
 
	return hull;
 }
 
 // Основная функция для построения выпуклой оболочки вокруг каждой точки
 function buildAllConvexHulls(points: Node[]): Node[][] {
	const result: Node[][] = [];
 
	for (const point of points) {
	  // Исключаем текущую точку из списка
	  const otherPoints = points.filter(p => p.id !== point.id);
	  const hull = buildConvexHull(otherPoints);
 
	  // Добавляем текущую точку в начало массива
	  result.push([point, ...hull]);
	}
 
	return result;
 }
//============================================================
const hull =  buildAllConvexHulls(finalNodes)

hull.forEach((arr) => {
	arr.forEach(a => {
		a.group = 5
	})
})
hull.forEach(arr => {
	arr.forEach(a => {
		nodes.forEach(node => {
		if (a.id === node.id) {
			node.group = 5
		}
	})
	})
	
})
//=============================================================
console.log(finalNodes)
console.log(hull)

	return { nodes, links }
}