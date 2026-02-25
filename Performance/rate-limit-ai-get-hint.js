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

const questionPayload = JSON.stringify({
  subject: __ENV.TOPIC || "Java",
  topic: __ENV.SUBTOPIC || "OOP",
  difficulty: __ENV.DIFFICULTY || "Beginner",
});

export function setup() {
  const seed = http.post(`${BASE_URL}/api/ai/generate-question`, questionPayload, { headers });
  let questionId = null;
  try {
    questionId = JSON.parse(seed.body).id;
  } catch (e) {
    questionId = null;
  }
  return { questionId };
}

export default function (data) {
  if (!data || !data.questionId) return;
  const payload = JSON.stringify({ questionId: data.questionId });
  const res = http.post(`${BASE_URL}/api/ai/get-hint`, payload, { headers });
  check(res, {
    "ai-get-hint status 200/429": (r) => r.status === 200 || r.status === 429,
  });
  sleep(0.2);
}
