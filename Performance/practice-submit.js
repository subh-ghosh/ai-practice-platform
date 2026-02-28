import http from "k6/http";
import { sleep, check } from "k6";
import { options, BASE_URL, TOKEN } from "./common.js";

export { options };

const QUESTION_ID = __ENV.QUESTION_ID || 1;

export default function () {
    const url = `${BASE_URL}/api/practice/submit`;
    const payload = JSON.stringify({
        questionId: parseInt(QUESTION_ID),
        answerText: "This is a performance test answer."
    });

    const params = {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
        },
    };

    const res = http.post(url, payload, params);

    check(res, {
        "is status 201": (r) => r.status === 201,
    });

    sleep(1);
}
