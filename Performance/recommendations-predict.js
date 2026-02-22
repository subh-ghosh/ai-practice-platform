import http from "k6/http";
import { sleep } from "k6";
import { options, BASE_URL, authHeaders, assert200 } from "./common.js";

export { options };

const TOPIC = __ENV.TOPIC || "Java";
const DIFFICULTY = __ENV.DIFFICULTY || "Beginner";

export default function () {
  const url = `${BASE_URL}/api/recommendations/predict?topic=${encodeURIComponent(TOPIC)}&difficulty=${encodeURIComponent(DIFFICULTY)}`;
  const res = http.get(url, { headers: authHeaders });
  assert200(res, "recommendations-predict");
  sleep(1);
}
