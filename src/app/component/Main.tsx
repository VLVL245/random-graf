"use client";

import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState /*, useState*/ } from "react";
import {
  Node,
  Link,
  GrafGeneratorData,
  smallestConvexHullAroundPoint,
} from "../server/GrafGeneratorData";
import { Delaunay } from "d3";
import Point = Delaunay.Point;
import { schemeDark2 } from "d3-scale-chromatic";

interface MainProps {
  widthFieldSize: number;
  heightFieldSize: number;
  amountPoints: number;
  randomSeed: number;
  connectionControl: number;
}

interface GrafData {
  nodes: Node[];
  links: Link[];
}

export default function Main({
  widthFieldSize,
  heightFieldSize,
  amountPoints,
  randomSeed,
  connectionControl,
}: MainProps) {
  const d3Container = useRef<SVGSVGElement>(null);
  const { nodes, links }: GrafData = useMemo(
    () =>
      GrafGeneratorData(
        amountPoints,
        randomSeed,
        widthFieldSize,
        heightFieldSize,
        connectionControl,
      ),
    [
      amountPoints,
      randomSeed,
      widthFieldSize,
      heightFieldSize,
      connectionControl,
    ],
  );

  const [hull, setHull] = useState<Node[] | undefined>();
  const delaunay = useMemo(() => {
    const points = nodes.map((node) => [node.x, node.y] satisfies Point);
    return d3.Delaunay.from(points);
  }, [nodes]);

  useEffect(() => {
    if (!d3Container.current) return;
    // Очистка предыдущего графика
    const svg = d3.select(d3Container.current);

    if (delaunay) {
      svg.selectAll("*").remove();

      // Рисуем линии для связей
      svg
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("x1", (d) => nodes.find((node) => node.id === d.source)?.x || 0)
        .attr("y1", (d) => nodes.find((node) => node.id === d.source)?.y || 0)
        .attr("x2", (d) => nodes.find((node) => node.id === d.target)?.x || 0)
        .attr("y2", (d) => nodes.find((node) => node.id === d.target)?.y || 0)
        .attr("stroke-width", "3px")
        .attr("stroke", "rgb(209 213 219)");

      svg
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", (d) => d.x || 0)
        .attr("cy", (d) => d.y || 0)
        .attr("r", 7)
        .attr("style", "cursor: pointer;")
        .attr("fill", (d) => {
          if (hull?.map((n) => n.id).includes(d.id)) {
            return "#ff0000";
          }
          return d3.schemeDark2[d.group];
        })
        .on("click", (event, node) => {
          setHull(smallestConvexHullAroundPoint(delaunay, nodes, node));
        });
    }
  }, [
    amountPoints,
    heightFieldSize,
    links,
    nodes,
    widthFieldSize,
    hull,
    delaunay,
  ]);
  console.log(connectionControl);

  return (
    <main className="container mx-auto ">
      <svg
        className="mx-auto"
        ref={d3Container}
        width={widthFieldSize}
        height={heightFieldSize}
      ></svg>
    </main>
  );
}
