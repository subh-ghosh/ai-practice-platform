import http from "k6/http";
import { sleep } from "k6";
import { options, BASE_URL, authHeaders, assert200 } from "./common.js";

export { options };

export default function () {
    const payload = JSON.stringify({
        firstName: "TestUser",
        lastName: "Updated",
        bio: "Testing Kafka Notifications " + Math.random(),
        headline: "Performance Tester"
    });

    const params = {
        headers: {
            ...authHeaders,
            "Content-Type": "application/json",
        },
    };

    const res = http.put(BASE_URL + "/api/students/profile", payload, params);
    assert200(res, "profile-update");

    sleep(1);
}
