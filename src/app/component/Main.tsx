"use client";

import * as d3 from "d3";
import {useEffect, useMemo, useRef, useState} from "react";
import {Node, Link, GrafGeneratorData, getConvexHull, smallestConvexHullAroundPoint} from "../server/GrafGeneratorData";
import {Delaunay} from "d3";
import Point = Delaunay.Point;

interface MainProps {
  widthFieldSize: number;
  heightFieldSize: number;
  amountPoints: number;
  randomSeed: number;
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
}: MainProps) {
  const d3Container = useRef<SVGSVGElement>(null);
  const { nodes, links }: GrafData = useMemo(() => GrafGeneratorData(
    amountPoints,
    randomSeed,
    widthFieldSize,
    heightFieldSize,
  ), [amountPoints, randomSeed, widthFieldSize, heightFieldSize]);

  const [hull, setHull] = useState<Node[] | undefined>();
  const delaunay = useMemo(() => {
    const points = nodes.map(node => [node.x, node.y] satisfies Point);
    return d3.Delaunay.from(points);
  }, [amountPoints, randomSeed, widthFieldSize, heightFieldSize]);

  useEffect(() => {
    if (!d3Container.current) return;
    // Очистка предыдущего графика
    const svg = d3.select(d3Container.current);

    if (delaunay) {
      svg.selectAll("*").remove();

      svg
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", (d) => d.x || 0)
        .attr("cy", (d) => d.y || 0)
        .attr("r", 5)
        .attr("style", "cursor: pointer;")
        .attr("fill", (d) => {
          if (hull?.map(n => n.id).includes(d.id)) {
            return '#ff0000';
          }
          return d3.schemeCategory10[d.group];
        })
        .on("click", (event, node) => {
          setHull(smallestConvexHullAroundPoint(delaunay, nodes, node));
        });

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
        .attr("stroke", "black");
    }
  }, [amountPoints, heightFieldSize, links, nodes, widthFieldSize, hull, delaunay]);

  return (
    <main className="container mx-auto">
      <svg
        className="mx-auto"
        ref={d3Container}
        width={widthFieldSize}
        height={heightFieldSize}
      ></svg>
    </main>
  );
}
