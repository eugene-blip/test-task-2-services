export function getLast30DaysIsoRange(): { startIso: string; endIso: string } {
  const now = new Date();
  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  // Normalize start to 00:00:00Z for clarity in Swagger UI
  start.setUTCHours(0, 0, 0, 0);
  const startIso = start.toISOString();
  const endIso = now.toISOString();
  return { startIso, endIso };
}
