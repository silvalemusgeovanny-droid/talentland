import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "backup diario a Google Drive",
  { hourUTC: 0, minuteUTC: 0 },
  api.backups.runScheduled,
);

export default crons;
