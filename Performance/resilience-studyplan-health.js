import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL;
const TOKEN = __ENV.TOKEN;
const VUS = Number(__ENV.VUS || 1);
const DURATION = __ENV.DURATION || "1m";

export const options = {
  vus: VUS,
  duration: DURATION,
};

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

const payload = JSON.stringify({
  topic: __ENV.TOPIC || "Java",
  difficulty: __ENV.DIFFICULTY || "Beginner",
  durationDays: Number(__ENV.DAYS || 7),
});

const status200 = new Counter("study_plans_status_200_total");
const status429 = new Counter("study_plans_status_429_total");
const status503 = new Counter("study_plans_status_503_total");
const statusOther = new Counter("study_plans_status_other_total");

export default function () {
  const res = http.post(`${BASE_URL}/api/study-plans/generate`, payload, { headers });

  if (res.status === 200) status200.add(1);
  else if (res.status === 429) status429.add(1);
  else if (res.status === 503) status503.add(1);
  else statusOther.add(1);

  // Keep this permissive so runs complete and we can inspect status mix.
  check(res, {
    "study-plans status expected set": (r) =>
      r.status === 200 || r.status === 429 || r.status === 503 || r.status === 403,
  });

  sleep(Number(__ENV.SLEEP_SECONDS || 0.5));
}
