import Express, { Express as ExpressApp } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import Container from "typedi";
import { Reach360Service } from "../services/reach360.service";
import { ElearningProvisioningStatus } from "../entitites/Course";

interface ReachUserCreatedEvent {
  type: "user.created";
  data: {
    user: {
      id: string;
      email: string;
    };
  };
}

export function verifyReach360WebhookSignature(
  rawBody: Buffer,
  signature: string,
  secret: string,
) {
  const expected = createHmac("sha1", secret).update(rawBody).digest("hex");
  const actualBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function registerReach360Webhook(app: ExpressApp) {
  app.post(
    "/integrations/reach/webhooks",
    Express.raw({ type: "application/json" }),
    async (req, res) => {
      const secret = process.env.REACH_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(503).json({ error: "reach_webhook_not_configured" });
      }

      const signature = req.header("x-hook-signature");
      const rawBody = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(req.body || "");

      if (
        !signature ||
        !verifyReach360WebhookSignature(rawBody, signature.trim(), secret)
      ) {
        return res.status(401).json({ error: "invalid_signature" });
      }

      let event: ReachUserCreatedEvent | { type?: string };
      try {
        event = JSON.parse(rawBody.toString("utf8"));
      } catch {
        return res.status(400).json({ error: "invalid_json" });
      }

      if (event.type !== "user.created") {
        return res.status(200).json({ received: true });
      }

      const user = (event as ReachUserCreatedEvent).data?.user;
      if (!user?.id || !user.email) {
        return res.status(400).json({ error: "invalid_user_created_event" });
      }

      try {
        const results = await Container.get(
          Reach360Service,
        ).handleUserCreated(user);
        const hasFailure = results.some(
          (attendee) =>
            attendee.reachEnrollment?.status ===
            ElearningProvisioningStatus.SyncFailed,
        );

        if (hasFailure) {
          return res.status(503).json({ error: "reach_enrollment_failed" });
        }
        return res.status(200).json({ received: true });
      } catch (error) {
        console.error("Reach 360 webhook processing failed", error);
        return res.status(503).json({ error: "reach_webhook_failed" });
      }
    },
  );
}
