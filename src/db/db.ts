import type { Entry, Snapshot, OutboxItem } from "./types";
import Dexie from "dexie";
import type { Table } from "dexie";



class RiskLedgerDB extends Dexie {
  entries!: Table<Entry, string>;
  snapshots!: Table<Snapshot, string>;
  outbox!: Table<OutboxItem, string>;

  constructor() {
    super("risk_ledger_db");
    this.version(1).stores({
      entries: "id, category, weekStart, createdAt, pendingSync",
      snapshots: "id, category, weekStart, createdAt, pendingSync",
      outbox: "id, type, createdAt"
    });
  }
}

export const db = new RiskLedgerDB();
