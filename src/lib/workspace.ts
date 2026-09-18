import { cache } from "react";
import { db } from "@/lib/db";
import { features } from "@/lib/env";

/**
 * The one workspace an account owns.
 *
 * Every queue row, ledger row and meter hangs off it, so a page or an action
 * reads it once and scopes every query by its id. A brand new account gets an
 * empty workspace with no client accounts in it: the empty states are what
 * teach it what to do next, not seeded rows nobody asked for.
 */
export type WorkspaceRecord = {
  id: string;
  name: string;
  clients: string[];
};

export const getWorkspace = cache(async (userId: string): Promise<WorkspaceRecord | null> => {
  if (!features.db) return null;
  const found = await db.workspace.findFirst({
    where: { ownerId: userId },
    select: { id: true, name: true, clients: true },
    orderBy: { createdAt: "asc" },
  });
  return found;
});

/** The same workspace, created on first use. Only actions that write call it. */
export async function getOrCreateWorkspace(userId: string): Promise<WorkspaceRecord | null> {
  const found = await getWorkspace(userId);
  if (found) return found;
  if (!features.db) return null;
  return db.workspace.create({
    data: { ownerId: userId, name: "Your workspace", clients: [] },
    select: { id: true, name: true, clients: true },
  });
}
