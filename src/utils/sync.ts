import { db } from "../db/db";

export async function enqueueSync(type: "entry" | "snapshot", refId: string) {
  await db.outbox.put({
    id: crypto.randomUUID(),
    type,
    refId,
    createdAt: Date.now()
  });
}

export async function runSync() {
  const items = await db.outbox.toArray();
  if (items.length === 0) return;

  const API_URL = import.meta.env.VITE_API_URL;

  // 1. If we have a real API endpoint, try to sync
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/vault/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: crypto.randomUUID(),
          items
        })
      });

      if (!response.ok) throw new Error("Server error during sync");

      // If success, proceed to clear outbox below
    } catch (e) {
      console.warn("Sync failed: Could not connect to server. Data is still saved on your device.", e);
      return; // Stop here! Don't clear the outbox if the server didn't get it.
    }
  }

  // 2. Reconciliation: Update local state to 'Verified'
  for (const item of items) {
    if (item.type === "entry") {
      await db.entries.update(item.refId, { pendingSync: false });
    } else {
      await db.snapshots.update(item.refId, { pendingSync: false });
    }
  }

  // 3. Clear Processed Queue
  await db.outbox.clear();
  console.log(`Sync complete: ${items.length} entries saved.`);
}

export function setupOnlineSync() {
  window.addEventListener("online", () => { void runSync(); });
}
