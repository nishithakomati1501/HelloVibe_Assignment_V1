# Test Strategy

## 1. Objective

Validate the assignment project across three layers:

1. UI workflows in Sauce Demo
2. REST API behavior in Restful Booker
3. Consistency between booking API data and PostgreSQL report data

The strategy prioritizes business-critical user journeys, contract validation,
negative behavior, and evidence-based defect reporting.

## 2. Scope

### In scope

- Login success and locked-account behavior
- Product inventory and product selection
- Cart contents, quantities, and prices
- Checkout information, totals, and order completion
- Booking creation, retrieval, update, and deletion
- API authentication and authorization
- Malformed payload and invalid date validation
- PostgreSQL connectivity and required tables
- Missing bookings and API/report field mismatches

### Out of scope

- Load, stress, and endurance testing
- Cross-browser coverage beyond configured Chromium and WebKit projects
- Database schema migration testing
- Payment-provider integration
- Security penetration testing

## 3. Test levels and approach

### UI tests

UI tests use Playwright page objects and stable `data-test` selectors. Each
test starts from a known login state and validates user-visible outcomes such
as URL, page title, cart contents, checkout totals, and error messages.

The primary UI browsers are:

- Chromium
- WebKit

The main user profiles are:

- `standard_user` for successful workflows
- `problem_user` for defect comparison
- `locked_out_user` for authentication rejection

### API tests

API tests use Playwright's `APIRequestContext` against the Restful Booker API.
They validate status codes, response bodies, authentication requirements, and
booking lifecycle behavior.

The lifecycle test creates its own booking and uses the returned booking ID
for subsequent operations. Negative tests use intentionally invalid
credentials, tokens, payloads, and date ranges.

### Database checks

Database checks use the shared PostgreSQL pool in `helpers/db.ts` and execute
SQL from the `sql/` directory. They validate:

- Database connectivity
- Required table availability
- Bookings missing from the report
- Differences between API-derived and report-derived fields

Database credentials are supplied through a local `.env` file and must not be
committed.

## 4. Test data strategy

- Keep reusable users, products, and booking data in `data/`.
- Keep API request bodies in `tests/api/test_data/`.
- Create API records during the lifecycle test instead of relying on fixed
  booking IDs.
- Use deterministic dates and amounts for repeatable assertions.
- Keep invalid data explicit in the negative tests so the failure reason is
  clear.
- Do not store passwords or database credentials in source control.

## 5. Environment strategy

The default endpoints are:

```text
UI:  https://www.saucedemo.com
API: https://restful-booker.herokuapp.com
```

They can be overridden with `UI_BASE_URL` and `API_BASE_URL`.

The data-check project requires:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

## 6. Assertions and defect handling

- Assert observable business outcomes, not implementation details.
- Use exact messages where the application contract defines an exact error.
- Keep negative tests strict; do not change expected status codes to make a
  known defect pass.
- Mark reproducible known defects with Playwright `test.fail()` and include
  the observed behavior in the reason.
- Record reproduction input, expected behavior, actual behavior, and impact in
  [DEFECTS.md](./DEFECTS.md).
- Treat environment-dependent public-demo behavior as subject to revalidation.

## 7. Execution plan

Install dependencies and browsers:

```powershell
npm ci
npx playwright install
```

Run the focused suites:

```powershell
npx playwright test --project=ui-chromium
npx playwright test --project=ui-webkit
npx playwright test --project=api
npx playwright test --project=data-check
```

Run a targeted test file:

```powershell
npx playwright test tests/ui/login.spec.ts --project=ui-chromium
```

Before a broader run, list the discovered tests:

```powershell
npx playwright test --list
```

## 8. Reporting

Playwright produces:

- An HTML report in `playwright-report/`
- Screenshots and traces in `test-results/`
- JUnit output at `test-results/junit.xml`

On failure, retain the test output and update [DEFECTS.md](./DEFECTS.md) when
the behavior is reproducible and represents a product or contract issue.

## 9. Completion criteria

Testing is complete when:

- All in-scope test projects have been executed.
- Expected failures correspond to documented known defects.
- Unexpected failures have been investigated.
- API and UI evidence is recorded for confirmed defects.
- Database checks pass against the intended report date and dataset.
- The final test report and defect log are available for review.
