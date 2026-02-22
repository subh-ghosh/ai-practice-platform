import http from "k6/http";
import { sleep } from "k6";
import { options, BASE_URL, authHeaders, assert200 } from "./common.js";

export { options };

export default function () {
  const res = http.get(BASE_URL + "/api/stats/recommendations", { headers: authHeaders });
  assert200(res, "stats-recommendations");
  sleep(1);
}
