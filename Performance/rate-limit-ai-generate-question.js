import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL;
const TOKEN = __ENV.TOKEN;
const VUS = Number(__ENV.VUS || 10);
const DURATION = __ENV.DURATION || "5m";

export const options = {
  vus: VUS,
  duration: DURATION,
};

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

const payload = JSON.stringify({
  subject: __ENV.TOPIC || "Java",
  difficulty: __ENV.DIFFICULTY || "Beginner",
  topic: __ENV.SUBTOPIC || "OOP",
});

export default function () {
  const res = http.post(`${BASE_URL}/api/ai/generate-question`, payload, { headers });
  check(res, {
    "ai-generate-question status 200/429": (r) => r.status === 200 || r.status === 429,
  });
  sleep(0.2);
}
