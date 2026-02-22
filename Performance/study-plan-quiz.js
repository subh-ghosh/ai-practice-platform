import http from "k6/http";
import { sleep } from "k6";
import { options, BASE_URL, authHeaders, assert200 } from "./common.js";

export { options };

const PLAN_ID = __ENV.PLAN_ID;
const ITEM_ID = __ENV.ITEM_ID;

export default function () {
  if (!PLAN_ID || !ITEM_ID) {
    throw new Error("PLAN_ID and ITEM_ID env vars are required for study-plan-quiz.js");
  }
  const res = http.get(`${BASE_URL}/api/study-plans/${PLAN_ID}/items/${ITEM_ID}/quiz`, { headers: authHeaders });
  assert200(res, "study-plan-quiz");
  sleep(1);
}
