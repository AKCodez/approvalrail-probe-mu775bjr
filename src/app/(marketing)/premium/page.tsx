import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { CheckoutButton } from "@/components/checkout-button";
import { Faq, Pricing, Section } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { faqs, plans, pricingNote, type Plan } from "@/content/marketing";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { canCheckout } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing",
  description: "One paid plan. Cancel from the billing portal whenever you like.",
};

export default async function PremiumPage(): Promise<ReactElement> {
  const user = await getCurrentUser();

  const subscription =
    user && features.db
      ? await db.subscription.findUnique({
          where: { userId: user.id },
          select: { status: true, currentPeriodEnd: true },
        })
      : null;

  const active = subscription?.status === "active" || subscription?.status === "trialing";
  const freePlan = plans.find((plan) => !plan.featured);

  /* The free plan links to sign-up; the paid one opens Stripe Checkout, or says
     plainly that it is already active. The amount always comes from Stripe. */
  function actionFor(plan: Plan): ReactNode {
    if (!plan.featured) {
      return (
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link href="/sign-up">Start free</Link>
        </Button>
      );
    }
    if (active) {
      return <Badge tone="positive">Active on your account</Badge>;
    }
    return <CheckoutButton enabled={canCheckout} />;
  }

  return (
    <>
      <Pricing
        plans={plans}
        note={pricingNote}
        eyebrow="Pricing"
        as="h1"
        title="One plan, one price"
        description="Start free. Upgrade when the free plan stops being enough."
        action={actionFor}
      />

      <Section width="content" space="tight">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex flex-col gap-3">
            <h2 className="text-h3 text-ink">What the free tier includes</h2>
            <ul className="flex flex-col gap-2">
              {freePlan?.features.map((line) => (
                <li key={line} className="flex items-start gap-2 text-small text-muted">
                  <CheckIcon
                    aria-hidden="true"
                    weight="regular"
                    className="mt-0.5 size-4 shrink-0 text-accent"
                  />
                  {line}
                </li>
              ))}
            </ul>
            <p className="text-caption text-faint">
              No card, and no limit on reading. The gate is on drafting runs, never on an approval
              that is already on the record.
            </p>
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className="text-h3 text-ink">Manage billing</h2>
            <p className="text-small text-muted">
              The Agency plan is $19 per month, charged by Stripe. Change the card or cancel from
              the Stripe billing portal, linked in every receipt Stripe emails you. A cancellation
              runs to the end of the month you have already paid for.
            </p>
            <p className="text-caption text-faint">
              {active
                ? "Your plan is active. Nothing here expires while it is."
                : "Nothing to manage until there is a subscription on the account."}
            </p>
          </Card>
        </div>
      </Section>

      <Faq items={faqs} title="Questions about billing and everything else" />
    </>
  );
}
