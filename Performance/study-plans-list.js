import http from "k6/http";
import { sleep } from "k6";
import { options, BASE_URL, authHeaders, assert200 } from "./common.js";

export { options };

export default function () {
  const res = http.get(BASE_URL + "/api/study-plans", { headers: authHeaders });
  assert200(res, "study-plans-list");
  sleep(1);
}
