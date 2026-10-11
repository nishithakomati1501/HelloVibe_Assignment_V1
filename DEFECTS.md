# Defects

API checks were run against the published Restful Booker API documentation at
https://restful-booker.herokuapp.com/apidoc/index.html and the live API on
2026-10-11. The following cases are retained as expected failures in
`tests/api/known-defects.spec.ts` using Playwright's `test.fail()` with
reasons; the tests are not altered to accommodate the observed behavior.

| Test | Documented/expected behavior | Observed evidence |
| --- | --- | --- |
| Updating a booking without authentication is rejected | Booking updates require the documented `token` cookie. | Covered by `rejects an update when authentication is missing`; expected HTTP 403. |
| Updating a booking with an invalid token is rejected | Booking updates require a valid authentication token. | Covered by `rejects an update when the authentication token is wrong`; expected HTTP 403. |
| Creating a booking with missing required fields is rejected | `CreateBooking` documents the booking fields as required; malformed input should be rejected, not cause a server error. | `POST /booking` with `{ "firstname": "Missing fields" }` returned HTTP 500 with body `Internal Server Error`. |
| Creating a booking with an invalid date range is rejected | The booking schema defines `checkin` and `checkout` as dates. A checkout earlier than checkin is an invalid booking range. | `POST /booking` with checkin `2030-06-12` and checkout `2030-06-10` returned HTTP 200 and created booking ID `3670`, echoing the reversed dates. |
| Authentication rejects invalid credentials | The documented successful `POST /auth` response contains a token. Invalid credentials must not be represented as a successful authentication response. | `POST /auth` with invalid username and password returned HTTP 200 with body `{ "reason": "Bad credentials" }` and no token. |

These observed outcomes are environment-dependent and may change as the
public demo API is updated. Re-run the expected-failure tests to check whether
the issues remain present.
