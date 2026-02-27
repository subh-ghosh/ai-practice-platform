import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL;
const TOKEN = __ENV.TOKEN;
const VUS = Number(__ENV.VUS || 5);
const DURATION = __ENV.DURATION || "3m";

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

export default function () {
  const res = http.post(`${BASE_URL}/api/study-plans/generate`, payload, { headers });
  check(res, {
    "study-plans-generate status 200/403/429/503": (r) =>
      r.status === 200 || r.status === 403 || r.status === 429 || r.status === 503,
  });
  sleep(0.5);
}
