export type Category = "financial" | "legal" | "health" | "reputation" | "time_energy";
export type ExposureLevel = "low" | "medium" | "high";
export type RiskLevel = "low" | "medium" | "high";

export type Entry = {
  id: string;
  title: string;
  category: Category;
  exposureLevel: ExposureLevel;
  notes?: string;
  tags: string[];
  createdAt: number;      // epoch ms
  weekStart: string;      // YYYY-MM-DD (Monday)
  pendingSync: boolean;
};

export type Snapshot = {
  id: string;             // `${weekStart}:${category}`
  weekStart: string;
  category: Category;
  inputs: unknown;        // store raw inputs (typed in UI layer)
  score: number;
  level: RiskLevel;
  dominantFactor?: string | null;
  createdAt: number;
  pendingSync: boolean;
};

export type OutboxItem = {
  id: string;
  type: "entry" | "snapshot";
  refId: string;          // entry.id or snapshot.id
  createdAt: number;
};
