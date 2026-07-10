// Server-only Resend wrapper.
import { Resend } from "resend";
import { renderReminder, type ReminderEntry } from "@/lib/email/reminderTemplate";

// Until a custom domain is verified with Resend, the test sender below only
// delivers to the Resend account owner's own email. After DNS verification,
// set EMAIL_FROM (e.g. "Expiry Tracker <reminders@yourdomain.tld>") — no code
// change needed. Failed sends release their notification_log claim, so other
// users' reminders start flowing automatically once the domain is live.
const FROM = process.env.EMAIL_FROM ?? "Expiry Tracker <onboarding@resend.dev>";

let client: Resend | null = null;
function resend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  return (client ??= new Resend(process.env.RESEND_API_KEY));
}

// While Resend is in test mode it only delivers to the account owner's
// address. Setting EMAIL_TEST_RECIPIENT reroutes all reminders there (real
// recipient prefixed in the subject). Remove once the domain is verified.
const TEST_RECIPIENT = process.env.EMAIL_TEST_RECIPIENT;

/** Throws on any failure — callers rely on that to release reminder claims. */
export async function sendReminderEmail(
  to: string,
  entries: ReminderEntry[],
): Promise<void> {
  const { subject, html, text } = renderReminder(entries);
  const { error } = await resend().emails.send({
    from: FROM,
    to: TEST_RECIPIENT ?? to,
    subject: TEST_RECIPIENT ? `[for ${to}] ${subject}` : subject,
    html,
    text,
  });
  if (error) throw new Error(`resend ${error.name}: ${error.message}`);
}
