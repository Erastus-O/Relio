/**
 * Outbound messages. In development these are printed to the console.
 * Swap in an email/SMS/push provider here for production.
 */
export async function sendEmail(to: string, subject: string, text: string) {
  console.log(`\n[email] to=${to}\nsubject: ${subject}\n${text}\n`);
}

export async function sendPush(userId: string, title: string, body: string) {
  console.log(`[push] user=${userId} ${title}: ${body}`);
}
