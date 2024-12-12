import { PaperGraph } from "./components/paper-graph";
import { GraphData, Paper } from "./types/paper";

// Type-safe sample data
const sampleData: GraphData = {
  nodes: [
    {
      id: "1",
      title: "Main Research Paper",
      type: "main", // Now explicitly one of the allowed types
      authors: ["John Doe", "Jane Smith"],
      abstract: "This is the main paper being analyzed...",
    },
    {
      id: "2",
      title: "Referenced Work",
      type: "reference", // Now explicitly one of the allowed types
      authors: ["Alice Johnson"],
    },
    {
      id: "3",
      title: "Related Study",
      type: "related", // Now explicitly one of the allowed types
      authors: ["Bob Wilson"],
    },
    {
      id: "4",
      title: "Opposing View",
      type: "opposing", // Now explicitly one of the allowed types
      authors: ["Carol Brown"],
    },
  ],
  links: [
    {
      source: "1",
      target: "2",
      type: "references", // Now explicitly one of the allowed types
    },
    {
      source: "1",
      target: "3",
      type: "related",
    },
    {
      source: "1",
      target: "4",
      type: "opposes",
    },
  ],
};

function App() {
  const handleNodeClick = (paper: Paper) => {
    console.log("Selected paper:", paper);
  };

  return (
    <div className="h-screen w-full p-4 bg-gray-100">
      <PaperGraph
        data={sampleData}
        width={1000}
        height={800}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
}

export default App;
