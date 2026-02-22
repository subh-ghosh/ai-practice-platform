import http from "k6/http";
import { sleep, check } from "k6";
import { options, BASE_URL } from "./common.js";

export { options };

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { "health status 200": (r) => r.status === 200 });
  sleep(1);
}
