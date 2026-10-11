import { expect, test } from "@playwright/test";

const validBooking = {
    firstname: "Known",
    lastname: "Defect",
    totalprice: 100,
    depositpaid: false,
    bookingdates: {
        checkin: "2030-06-10",
        checkout: "2030-06-12",
    },
    additionalneeds: "Breakfast",
};

test.describe("Known Restful Booker API defects", () => {  // Group of tests for known defects in the Restful Booker API
    test("rejects a booking with missing required fields", async ({ request }) => {
        test.fail(true, "Observed evidence: POST /booking returned HTTP 500 for this payload."); // Mark this test as expected to fail due to live API behavior
        const response = await request.post("/booking", { 
            data: { firstname: "Missing fields" }, // Provide a malformed booking payload with missing required fields
      });

        expect(response.status()).toBe(400); // Expect the API to reject the malformed booking payload
        expect(response.statusText()).toBe("Bad Request"); // Expect the API to reject the malformed booking payload
    });

    test("rejects a booking with checkout before checkin", async ({ request }) => { // Test for known defect where API allows checkout before checkin
        test.fail(true, "Observed evidence: POST /booking returned HTTP 200 and created a booking."); // Mark this test as expected to fail due to live API behavior

        const response = await request.post("/booking", { // Attempt to create a booking with checkout before checkin
            data: {
                ...validBooking,
                bookingdates: {
                    checkin: "2030-06-12",
                    checkout: "2030-06-10",
                },
            },
        });

        expect(response.status()).toBe(400); // Expect the API to reject the booking with an invalid date range
        expect(response.statusText()).toBe("Bad Request"); // Expect the API to reject the booking with an invalid date range
    });

    test("rejects invalid authentication credentials", async ({ request }) => { // Test for known defect where API allows invalid authentication credentials
        test.fail(true, "Observed evidence: POST /auth returned HTTP 200 with { reason: 'Bad credentials' }."); // Mark this test as expected to fail due to live API behavior

        const response = await request.post("/auth", {
            data: {
                username: "invalid-user",
                password: "invalid-password",
            },
        });

        expect([401, 403]).toContain(response.status()); // Expect the API to reject the invalid authentication credentials
        expect(response.statusText()).toBe("Unauthorized"); // Expect the status text to indicate unauthorized access
        const body = await response.json();
        expect(body.token).toBeDefined(); // Expect the response to include a token field even for failed authentication attempts
    });
});