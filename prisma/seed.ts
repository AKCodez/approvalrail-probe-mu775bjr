import "dotenv/config";
import {
  demoApprovalItemsWithDates,
  demoAuditEventsWithDates,
  demoClients,
  demoPersona,
} from "../src/content/demo";
import { DEMO_LOGIN } from "../src/design/types";
import { auth } from "../src/lib/auth";
import { db } from "../src/lib/db";

/**
 * Seeds the demo account, its workspace and the approval ledger behind every
 * screenshot.
 *
 * The content comes from `src/content/demo.ts`, which the landing page reads
 * too, so the marketing frame and the signed-in queue show the same rows. No
 * model is called here: every generated draft is already written out.
 *
 * Safe to run twice. The demo user is created once through Better Auth so the
 * password is hashed its way, each item is matched on its review token and
 * updated rather than duplicated, and the audit rows for an item are rewritten
 * so re-seeding an old preview slides every timestamp forward.
 */
async function main(): Promise<void> {
  const existing = await db.user.findUnique({ where: { email: DEMO_LOGIN.email } });

  if (!existing) {
    await auth.api.signUpEmail({
      body: { email: DEMO_LOGIN.email, password: DEMO_LOGIN.password, name: demoPersona.name },
    });
    console.log(`Created demo user ${DEMO_LOGIN.email}`);
  } else {
    console.log(`Demo user ${DEMO_LOGIN.email} already exists`);
  }

  const user = await db.user.findUniqueOrThrow({ where: { email: DEMO_LOGIN.email } });
  const clients = demoClients.map((client) => client.name);

  const found = await db.workspace.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });

  const workspace = found
    ? await db.workspace.update({
        where: { id: found.id },
        data: { name: demoPersona.workspaceName, clients },
      })
    : await db.workspace.create({
        data: { ownerId: user.id, name: demoPersona.workspaceName, clients },
      });

  let created = 0;
  let updated = 0;

  for (const item of demoApprovalItemsWithDates()) {
    const fields = {
      workspaceId: workspace.id,
      clientName: item.clientName,
      platform: item.platform,
      body: item.body,
      sourceAssetTitle: item.sourceAssetTitle,
      scheduledFor: item.scheduledFor,
      state: item.state,
      reviewerName: item.reviewerName,
      decidedAt: item.decidedAt,
      decisionNote: item.decisionNote,
      releasedAt: item.releasedAt,
      createdAt: item.createdAt,
    };

    const row = await db.approvalItem.findUnique({
      where: { reviewToken: item.reviewToken },
      select: { id: true },
    });

    if (row) {
      await db.approvalItem.update({ where: { id: row.id }, data: fields });
      updated += 1;
    } else {
      await db.approvalItem.create({ data: { reviewToken: item.reviewToken, ...fields } });
      created += 1;
    }
  }

  const byToken = new Map<string, string>();
  for (const row of await db.approvalItem.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, reviewToken: true },
  })) {
    byToken.set(row.reviewToken, row.id);
  }

  await db.auditEvent.deleteMany({ where: { itemId: { in: [...byToken.values()] } } });

  const events = demoAuditEventsWithDates().flatMap((event) => {
    const itemId = byToken.get(event.reviewToken);
    if (!itemId) return [];
    return [
      {
        itemId,
        action: event.action,
        actor: event.actor,
        note: event.note,
        createdAt: event.createdAt,
      },
    ];
  });

  await db.auditEvent.createMany({ data: events });

  console.log(
    `Seeded ${workspace.name}: ${created} item(s) created, ${updated} refreshed, ${events.length} ledger row(s)`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void db.$disconnect();
  });
