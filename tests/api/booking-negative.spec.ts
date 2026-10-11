import { APIRequestContext, expect, test } from "@playwright/test";
import fs from "fs";

function readJson(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')); // Read and parse the JSON file content
}

const bookingData = readJson(
    "tests/api/test_data/post_request_body.json"
); // Read the booking data from the JSON file

const negativeBooking = bookingData.find(
    (item: { negativeBooking?: unknown }) => item.negativeBooking 
)?.negativeBooking; // Extract the negativeBooking object from the JSON array

if (!negativeBooking) {
    throw new Error("negativeBooking data was not found"); // Ensure that negativeBooking data exists before proceeding
}

const validUpdate = { // Valid update payload
    ...negativeBooking,
    firstname: "Updated",
};

async function createBooking(request: APIRequestContext) {
    const response = await request.post("/booking", { data: negativeBooking }); // Create a new booking
    expect(response.status()).toBe(200);// Expect the booking creation to succeed
    expect(response.statusText()).toBe("OK")

    const body = await response.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    return body.bookingid as number;
}

test.describe("Booking API negative cases", () => {
    test("rejects an update when authentication is missing", async ({ request }) => {
        const bookingId = await createBooking(request); // Create a new booking to update

        const response = await request.put(`/booking/${bookingId}`, { // Attempt to update without authentication
            data: validUpdate, // Provide the update payload
        });

        expect(response.status()).toBe(403);
        expect(response.statusText()).toBe("Forbidden");
         // Expect the update to be rejected due to missing authentication
    });

    test("rejects an update when the authentication token is wrong", async ({ request }) => { // Attempt to update with an invalid authentication token
        const bookingId = await createBooking(request); // Create a new booking to update with an invalid token

        const response = await request.put(`/booking/${bookingId}`, { // Attempt to update with an invalid authentication token
            headers: {
                Cookie: "token=definitely-not-a-valid-token", // Provide an invalid authentication token
            },
            data: validUpdate, // Provide the update payload
        });

        expect(response.status()).toBe(403); // Expect the update to be rejected due to invalid authentication token
        expect(response.statusText()).toBe("Forbidden");
    });

    test("rejects a malformed booking payload", async ({ request }) => {
        test.fail(true, "The live API currently returns 500 instead of rejecting missing required fields."); // Mark this test as expected to fail due to live API behavior

        const response = await request.post("/booking", { // Attempt to create a booking with a malformed payload
            data: {
                firstname: "Missing fields", // Only provide the firstname field, omitting required fields
            },
        });

        expect(response.status()).toBe(400);
        expect(response.statusText()).toBe("Bad Request"); // Expect the API to reject the malformed booking payload
    });

    test("rejects a booking when checkout is before checkin", async ({ request }) => {
        test.fail(true, "The live API currently creates bookings with a reversed date range."); // Mark this test as expected to fail due to live API behavior

        const response = await request.post("/booking", { // Attempt to create a booking with checkout before checkin
            data: {
                ...negativeBooking,
                bookingdates: {
                    checkin: "2030-06-12",
                    checkout: "2030-06-10",
                },
            },
        });

        expect(response.status()).toBe(400);
        expect(response.statusText()).toBe("Bad Request"); // Expect the API to reject the booking with an invalid date range
    });
});