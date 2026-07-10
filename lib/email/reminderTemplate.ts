import { CATEGORY_META, type Category } from "@/lib/categories";
import { formatDisplayDate } from "@/lib/dates";

export type ReminderEntry = {
  name: string;
  category: Category;
  expiryDate: string; // ISO yyyy-mm-dd
  daysLeft: number; // 0..n (the lead day being fired)
  quantity: string | null;
};

function expiresPhrase(daysLeft: number): string {
  if (daysLeft === 0) return "expires today";
  if (daysLeft === 1) return "expires tomorrow";
  return `expires in ${daysLeft} days`;
}

export function renderReminder(entries: ReminderEntry[]): {
  subject: string;
  html: string;
  text: string;
} {
  const sorted = [...entries].sort((a, b) => a.daysLeft - b.daysLeft);
  const first = sorted[0];

  const subject =
    sorted.length === 1
      ? `⏰ ${first.name} ${expiresPhrase(first.daysLeft)}`
      : `⏰ ${sorted.length} items expiring soon — soonest ${expiresPhrase(first.daysLeft)}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const rows = sorted
    .map((e) => {
      const meta = CATEGORY_META[e.category];
      return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #eee;">
            <div style="font-weight:600;font-size:15px;color:#111;">${meta.emoji} ${escapeHtml(e.name)}${
              e.quantity ? ` <span style="font-weight:400;color:#777;">· ${escapeHtml(e.quantity)}</span>` : ""
            }</div>
            <div style="font-size:13px;color:#666;margin-top:2px;">
              ${expiresPhrase(e.daysLeft)} — ${formatDisplayDate(e.expiryDate)}
            </div>
          </td>
        </tr>`;
    })
    .join("");

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f6f6f6;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
      <div style="padding:20px 16px 12px;">
        <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#999;">Expiry Tracker</div>
        <h1 style="font-size:18px;margin:6px 0 0;color:#111;">Heads up — ${
          sorted.length === 1 ? "an item is" : `${sorted.length} items are`
        } about to expire</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      ${
        appUrl
          ? `<div style="padding:16px;"><a href="${appUrl}/dashboard" style="display:block;text-align:center;background:#111;color:#fff;text-decoration:none;padding:12px;border-radius:8px;font-size:14px;font-weight:600;">Open Expiry Tracker</a></div>`
          : ""
      }
      <div style="padding:0 16px 16px;font-size:12px;color:#999;">
        You get these based on each item's category cadence. Mark items used or discarded in the app to stop their reminders.
      </div>
    </div>
  </div>`;

  const text = sorted
    .map(
      (e) =>
        `- ${e.name}${e.quantity ? ` (${e.quantity})` : ""}: ${expiresPhrase(e.daysLeft)} (${formatDisplayDate(e.expiryDate)})`,
    )
    .join("\n");

  return { subject, html, text: `Expiring soon:\n\n${text}` };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
