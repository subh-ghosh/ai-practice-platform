import http from "k6/http";
import { sleep } from "k6";
import { options, BASE_URL, authHeaders, assert200 } from "./common.js";

export { options };

const PLAN_ID = __ENV.PLAN_ID;

export default function () {
  if (!PLAN_ID) {
    throw new Error("PLAN_ID env var is required for study-plan-by-id.js");
  }
  const res = http.get(`${BASE_URL}/api/study-plans/${PLAN_ID}`, { headers: authHeaders });
  assert200(res, "study-plan-by-id");
  sleep(1);
}
