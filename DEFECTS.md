## API defects

API checks were run against the Restful Booker documentation and live API on
2026-10-11. The corresponding contract checks are retained in
[known-defects.spec.ts](./tests/api/known-defects.spec.ts) with
`test.fail()` and an evidence-based reason. The assertions are intentionally
not weakened to match the current responses.

| # | Endpoint and input | Expected behavior | Observed evidence | Impact |
| --- | --- | --- | --- | --- |
| 1 | `POST /booking` with `{ "firstname": "Missing fields" }` | Missing required booking fields should be rejected with a client error such as HTTP 400. | Returned HTTP 500 with plain-text body `Internal Server Error`. | Malformed client input is reported as a server error and does not produce a useful JSON validation response. |
| 2 | `POST /booking` with `checkin=2030-06-12` and `checkout=2030-06-10` | A booking with checkout before checkin should be rejected. | Returned HTTP 200 and created a booking containing the reversed date range. | Invalid booking dates can be stored and used in downstream reporting. |
| 3 | `POST /auth` with invalid username and password | Invalid credentials should return an authentication error such as HTTP 401/403 and should not be represented as a successful authentication response. | Returned HTTP 200 with `{ "reason": "Bad credentials" }` and no token. | Clients that rely on HTTP status codes may treat failed authentication as successful. |

## UI defects

The main path was run against `https://www.saucedemo.com` on 2026-10-12 for
`standard_user` and `problem_user`: login, add Sauce Labs Backpack, open the
cart, enter checkout information, continue to the overview, and finish the
order.

| # | User | Expected behavior | Observed evidence | Impact |
| --- | --- | --- | --- | --- |
| 4 | `problem_user` | Entered first name, last name, and postal code should remain in their respective fields so checkout can continue. | After entering `Sony`, `Chony`, and `500081`, the observed values were `firstName="Chony"`, `lastName=""`, and `postalCode="500081"`. Continue remained on `checkout-step-one.html` with `Error: Last Name is required`. | The user cannot complete checkout. |
| 5 | `problem_user` | Each product should display its corresponding image. | All six inventory products loaded `/assets/sl-404-Cq1a9k9X.jpg`. `standard_user` loaded distinct product image assets. | Product imagery is broken and identical across the catalog. |

## Standard-user baseline

`standard_user` completed the same main path successfully:

- Inventory title: `Products`
- Item total: `$29.99`
- Tax: `$2.40`
- Total: `$32.39`
- Completion message: `Thank you for your order!`

## Expected negative coverage

The following checks are negative contract coverage, not defects observed in
the API:

- Updating a booking without authentication expects HTTP 403.
- Updating a booking with an invalid token expects HTTP 403.

These checks are in
[booking-negative.spec.ts](./tests/api/booking-negative.spec.ts). They protect
the expected authentication behavior and should not be changed to accept a
successful update.

## Revalidation

The public demo applications can change independently of this repository.
Re-run the focused suites before treating any item as resolved:

```powershell
npx playwright test tests/api/known-defects.spec.ts --project=api
npx playwright test tests/ui/login.spec.ts --project=ui-chromium
```
