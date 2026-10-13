# Assignment Test Automation Project

This project uses Playwright and TypeScript to validate:

- Sauce Demo UI behavior
- Restful Booker API behavior
- PostgreSQL booking and reporting data

## Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL 14 or later for the data checks
- Database tables populated with booking data:
  - `bookings_api`
  - `bookings_report`

## Installation

Install dependencies and Playwright browsers:

```powershell
npm ci
npx playwright install
```

## Configuration

UI and API tests use these defaults:

```text
UI:  https://www.saucedemo.com
API: https://restful-booker.herokuapp.com
```

Override them in PowerShell when required:

```powershell
$env:UI_BASE_URL = "https://www.saucedemo.com"
$env:API_BASE_URL = "https://restful-booker.herokuapp.com"
```

The database tests load PostgreSQL credentials from a local `.env` file in the
project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookings
DB_USER=postgres
DB_PASSWORD=your_password
```

Do not commit `.env` or real credentials.

## Repository structure

```text
data/
  booking-data.ts              Checkout customer data
  products.ts                  Product data
  users.ts                     UI login credentials

helpers/
  db.ts                        PostgreSQL connection pool

pages/
  login.page.ts                Login page object
  inventory.page.ts            Inventory page object
  cart.page.ts                 Cart page object
  checkout.page.ts             Checkout page object

sql/
  missing-bookings.sql         Finds API bookings missing from the report
  field-mismatches.sql         Compares API and report field values

tests/
  ui/                          Sauce Demo UI tests
  api/                         Restful Booker API tests and JSON data
  dataCheck/                   PostgreSQL validation tests

playwright.config.ts           Browser and test-project configuration
DEFECTS.md                     Evidence-based defect report
```

## Test cases covered

### UI test cases

| Test file | Test case |
| --- | --- |
| `tests/ui/login.spec.ts` | Standard user reaches `/inventory.html` and sees the `Products` title. |
| `tests/ui/login.spec.ts` | Locked-out user sees `Epic sadface: Sorry, this user has been locked out.` |
| `tests/ui/cart.spec.ts` | Standard user adds the Backpack and Bike Light to the cart. |
| `tests/ui/cart.spec.ts` | Cart contains both selected products. |
| `tests/ui/cart.spec.ts` | Cart displays the correct individual product prices. |
| `tests/ui/verifyCart.spec.ts` | Cart displays the expected item count and products. |
| `tests/ui/verifyCart.spec.ts` | Continue Shopping returns to the inventory page. |
| `tests/ui/verifyCart.spec.ts` | Checkout opens the checkout information form. |
| `tests/ui/checkout.spec.ts` | User enters valid checkout information and reaches the overview. |
| `tests/ui/checkout.spec.ts` | Checkout overview contains correct products, prices, tax, total, and completion message. |

UI browser projects:

- `ui-chromium`
- `ui-webkit`

Configured users include `standard_user`, `problem_user`, and
`locked_out_user`.

### API test cases

| Test file | Test case |
| --- | --- |
| `tests/api/booking-lifecycle.spec.ts` | Creates, retrieves, partially updates, fully updates, and deletes a booking. |
| `tests/api/booking-negative.spec.ts` | Rejects an update without authentication. |
| `tests/api/booking-negative.spec.ts` | Rejects an update with an invalid token. |
| `tests/api/booking-negative.spec.ts` | Rejects a malformed booking payload. |
| `tests/api/booking-negative.spec.ts` | Rejects a booking where checkout is before checkin. |
| `tests/api/known-defects.spec.ts` | Records malformed-payload, invalid-date-range, and invalid-authentication defects as expected failures. |

The known defect tests intentionally retain contract assertions and use
Playwright `test.fail()` with reasons. See [DEFECTS.md](./DEFECTS.md).

### Database test cases

| Test file | Test case |
| --- | --- |
| `tests/dataCheck/db-connection.spec.ts` | Connects to PostgreSQL and verifies the required tables exist. |
| `tests/dataCheck/missing-bookings.spec.ts` | Finds bookings present in the API data but missing from the report for the configured date. |
| `tests/dataCheck/booking-mismatch.spec.ts` | Finds mismatched booking fields between API and report data using its configured SQL query. |

The data-check project is named `data-check`. The report date for the missing
booking check is configured in `missing-bookings.spec.ts`.

## Running tests

Run the complete configured suite:

```powershell
npx playwright test
```

Run a project:

```powershell
npx playwright test --project=ui-chromium
npx playwright test --project=ui-webkit
npx playwright test --project=api
npx playwright test --project=data-check
```

Run one file:

```powershell
npx playwright test tests/ui/login.spec.ts --project=ui-chromium
```

List tests without running them:

```powershell
npx playwright test --list
```

Open the HTML report:

```powershell
npx playwright show-report
```

## Reports and artifacts

Playwright writes generated output to:

- `playwright-report/` - HTML report
- `test-results/` - screenshots, traces, and JUnit output

These generated directories are excluded from Git.
