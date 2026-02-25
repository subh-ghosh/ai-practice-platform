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
  difficulty: __ENV.DIFFICULTY || "Beginner",
  topic: __ENV.SUBTOPIC || "OOP",
});

const hintPayload = JSON.stringify({
  questionText: "Explain polymorphism in Java.",
  topic: __ENV.SUBTOPIC || "OOP",
  subject: __ENV.TOPIC || "Java",
  difficulty: __ENV.DIFFICULTY || "Beginner",
});

const answerPayload = JSON.stringify({
  questionText: "What is inheritance in Java?",
  userAnswer: "Inheritance lets one class reuse properties and methods of another class.",
  subject: __ENV.TOPIC || "Java",
  difficulty: __ENV.DIFFICULTY || "Beginner",
  topic: __ENV.SUBTOPIC || "OOP",
});

export default function () {
  const q = http.post(`${BASE_URL}/api/ai/generate-question`, questionPayload, { headers });
  check(q, {
    "ai-generate-question status 200/429": (r) => r.status === 200 || r.status === 429,
  });

  const h = http.post(`${BASE_URL}/api/ai/get-hint`, hintPayload, { headers });
  check(h, {
    "ai-get-hint status 200/429": (r) => r.status === 200 || r.status === 429,
  });

  const a = http.post(`${BASE_URL}/api/ai/get-answer`, answerPayload, { headers });
  check(a, {
    "ai-get-answer status 200/429": (r) => r.status === 200 || r.status === 429,
  });

  sleep(0.2);
}
