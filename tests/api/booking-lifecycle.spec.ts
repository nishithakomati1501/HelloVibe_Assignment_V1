// Create booking-->booking id   (post)
// booking id---->Get the booking (Optional) (get)
//token
// booking id + request payload(json)+token ----> partial update the booking (patch)
// booking id + request payload(json)+token ----> full update the booking (put)
// booking id +token ----> delete the booking  (delete)


import { test, expect } from "@playwright/test";
import fs from "fs";

// Utility function to read JSON data from file
function readJson(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

const BASE_URL = "https://restful-booker.herokuapp.com";


test("Update Booking - Create, Get, partial update, Update and delete a Booking Record", async ({ request }) => {

    // Step 1: Create a new booking using POST request
    const createBookingData = readJson("tests/api/test_data/post_request_body.json");
    const validBooking = createBookingData.find(
        (item: { validBooking?: unknown }) => item.validBooking 
    )?.validBooking; // Extract the validBooking object from the JSON array

    if (!validBooking) {
        throw new Error("validBooking data was not found"); // Ensure that validBooking data exists before proceeding
    }
     const createResponse = await request.post(`${BASE_URL}/booking`, { data: validBooking });

    //validate status code/response
    expect(createResponse.status()).toBe(200)
    expect(createResponse.statusText()).toBe("OK")

    const createdBooking = await createResponse.json()
    const bookingId = createdBooking.bookingid  // extracting bookingID from json response body


    // Step 2 (optional): Get the created booking using GET request
    const getResponse = await request.get(`${BASE_URL}/booking/${bookingId}`);

    // //validate status code/response
    // expect(getResponse.status()).toBe(200)
    // expect(getResponse.statusText()).toBe("OK")


    // const bookingDetails = await getResponse.json();
    // console.log("Booking details before update:", bookingDetails);


    //Create token  - this is request for Put/patch/delete request
    const tokenData = readJson("tests/api/test_data/token_request_body.json"); //username, password
    const tokenResponse = await request.post(`${BASE_URL}/auth`, { data: tokenData, });

    //validate status code/response
    expect(tokenResponse.status()).toBe(200)
    expect(tokenResponse.statusText()).toBe("OK")

    const tokenJson = await tokenResponse.json()
    const token = tokenJson.token
    console.log("Token generated:", token);

    // Step 3: Partial Update the booking using PATCH request with token in headers
    const partial_updateData = readJson("tests/api/test_data/patch_request_body.json");

    const partial_updateResponse = await request.patch(`${BASE_URL}/booking/${bookingId}`, {
        headers: {
            "Content-Type": "application/json",
            "Cookie": `token=${token}`,
        },
        data: partial_updateData,
    });

    //validate status code/response
    expect(partial_updateResponse.status()).toBe(200)
    expect(partial_updateResponse.statusText()).toBe("OK")

    const patial_updatedBooking = await partial_updateResponse.json();
    console.log("️ Partial update Booking successfully:", patial_updatedBooking);


    // Step 4: Full Update the booking using PUT request with token in headers
    const updateData = readJson("tests/api/test_data/PUT_request_body.json");

    const updateResponse = await request.put(`${BASE_URL}/booking/${bookingId}`, {
        headers: {
            "Content-Type": "application/json",
            "Cookie": `token=${token}`,
        },
        data: updateData,
    });

    //validate status code/response
    expect(updateResponse.status()).toBe(200)
    expect(updateResponse.statusText()).toBe("OK")

    const updatedBooking = await updateResponse.json();
    console.log("️ Full update Booking successfully:", updatedBooking);


    //Step 5: delete booking
 
    const deleteResponse = await request.delete(`${BASE_URL}/booking/${bookingId}`, {
        headers: {
        "Content-Type": "application/json",
        "Cookie": `token=${token}`,
        }
    });

    expect(deleteResponse.status()).toBe(201)
    expect(deleteResponse.statusText()).toBe("Created")

    // Confirm deletion by verifying the booking can no longer be retrieved
    const confirmationGetResponse = await request.get(`${BASE_URL}/booking/${bookingId}`);
    expect(confirmationGetResponse.status()).toBe(404)
    expect(confirmationGetResponse.statusText()).toBe("Not Found")

    console.log("Booking details are Deleted and confirmed as no longer available...")

})