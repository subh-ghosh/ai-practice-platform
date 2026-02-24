import { check } from "k6";

export const options = {
    stages: [
      { duration: "30s", target: 5 },   // warmup
      { duration: "90s", target: 20 },  // normal
      { duration: "60s", target: 40 },  // peak
      { duration: "30s", target: 0 },   // cooldown
    ],
  };

export const BASE_URL = __ENV.BASE_URL;
export const TOKEN = __ENV.TOKEN;

export const authHeaders = {
  Authorization: `Bearer ${TOKEN}`,
};

export function assert200(res, name) {
  check(res, {
    [`${name} status 200`]: (r) => r.status === 200,
  });
}
