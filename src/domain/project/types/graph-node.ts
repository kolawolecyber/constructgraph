export interface GraphNodeDetails {
  id: string;
  label: string;
  type: "task" | "material" | "supplier";
  properties: {
    priority?: string;
    category?: string;
    unit?: string;
    reliabilityScore?: number;
  };
  relationships: {
    id: string;
    label: string;
    direction: "incoming" | "outgoing";
    nodeId: string;
    nodeLabel: string;
    nodeType: "task" | "material" | "supplier";
  }[];
}