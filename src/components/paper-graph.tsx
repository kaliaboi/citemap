import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Paper, PaperLink, GraphData } from "@/types/paper";

interface PaperGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (paper: Paper) => void;
}

export function PaperGraph({
  data,
  width = 800,
  height = 600,
  onNodeClick,
}: PaperGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<Paper | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("class", "paper-graph");

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        graphGroup.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create a group for the graph
    const graphGroup = svg.append("g");

    // Initialize simulation
    const simulation = d3
      .forceSimulation<Paper, PaperLink>(data.nodes)
      .force(
        "link",
        d3
          .forceLink<Paper, PaperLink>(data.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create arrow markers
    svg
      .append("defs")
      .selectAll("marker")
      .data(["references", "related", "opposes"] as const)
      .join("marker")
      .attr("id", (d) => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", (d) => {
        switch (d) {
          case "references":
            return "#666";
          case "related":
            return "#38a169";
          case "opposes":
            return "#e53e3e";
        }
      })
      .attr("d", "M0,-5L10,0L0,5");

    // Create links
    const link = graphGroup
      .append("g")
      .selectAll<SVGLineElement, PaperLink>("line")
      .data(data.links)
      .join("line")
      .attr("stroke", (d) => {
        switch (d.type) {
          case "references":
            return "#666";
          case "related":
            return "#38a169";
          case "opposes":
            return "#e53e3e";
        }
      })
      .attr("stroke-width", 2)
      .attr("marker-end", (d) => `url(#arrow-${d.type})`);

    // Create nodes
    const node = graphGroup
      .append("g")
      .selectAll<SVGGElement, Paper>("g")
      .data(data.nodes)
      .join("g")
      .attr("class", "node")
      .call(drag(simulation));

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", 10)
      .attr("fill", (d) => {
        switch (d.type) {
          case "main":
            return "#3182ce";
          case "reference":
            return "#666";
          case "related":
            return "#38a169";
          case "opposing":
            return "#e53e3e";
        }
      });

    // Add labels to nodes
    node
      .append("text")
      .text((d) => d.title)
      .attr("x", 15)
      .attr("y", 5)
      .attr("class", "node-label");

    // Add title tooltips
    node.append("title").text((d) => d.title);

    // Add click handler
    node.on("click", (_event, d) => {
      setSelectedNode(d);
      onNodeClick?.(d);
    });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Paper).x!)
        .attr("y1", (d) => (d.source as Paper).y!)
        .attr("x2", (d) => (d.target as Paper).x!)
        .attr("y2", (d) => (d.target as Paper).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, width, height, onNodeClick]);

  function drag(simulation: d3.Simulation<Paper, PaperLink>) {
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Paper, Paper>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Paper, Paper>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Paper, Paper>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag<SVGGElement, Paper>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      {selectedNode && (
        <div className="absolute bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg">
          <h3 className="font-bold">{selectedNode.title}</h3>
          {selectedNode.authors && (
            <p className="text-sm text-gray-600">
              {selectedNode.authors.join(", ")}
            </p>
          )}
          {selectedNode.abstract && (
            <p className="text-sm mt-2">{selectedNode.abstract}</p>
          )}
        </div>
      )}
    </div>
  );
}
