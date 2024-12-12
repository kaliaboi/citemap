export interface Paper {
  id: string;
  title: string;
  type: "main" | "reference" | "related" | "opposing";
  authors?: string[];
  abstract?: string;
  year?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface PaperLink {
  source: string | Paper;
  target: string | Paper;
  type: "references" | "related" | "opposes";
}

export interface GraphData {
  nodes: Paper[];
  links: PaperLink[];
}
