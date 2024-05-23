
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
	let maxAttemptsPerNode = 3

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
// Дополнительные связи для увеличения количества соединений
	function createAdditionalLinks() {
		potentialLinks.forEach(linkInfo => {
			const attemptsSource = attempts.get(linkInfo.source.id) || 0
			const attemptsTarget = attempts.get(linkInfo.target.id) || 0

			if (attemptsSource < maxAttemptsPerNode && attemptsTarget < maxAttemptsPerNode) {
				let intersects = links.some(link => {
					const sourceNode = nodes.find(n => n.id === link.source)
					const targetNode = nodes.find(n => n.id === link.target)
					return sourceNode && targetNode && doLinesIntersect(
						linkInfo.source,
						linkInfo.target,
						sourceNode,
						targetNode
					);
				});

			if (!intersects) {
				links.push({
					source: linkInfo.source.id,
					target: linkInfo.target.id,
					value: 0.8
				});
			attempts.set(linkInfo.source.id, 0)
			attempts.set(linkInfo.target.id, 0)
			} else {
				attempts.set(linkInfo.source.id, attemptsSource + 1)
				attempts.set(linkInfo.target.id, attemptsTarget + 1)
			}
			}
		})
	}


	createAdditionalLinks()


	nodes.forEach(node => {
		let foundLink = links.find(link => link.source === node.id || link.target === node.id)
		if (!foundLink) {
			node.group = 3
		}
	})

	return { nodes, links }
}