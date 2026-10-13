
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { db } from '../../helpers/db';

test('validate missing bookings for the report date', async () => {
  const sqlPath = resolve(
    process.cwd(),
    'sql',
    'missing-bookings.sql'
  );

  const missingBookingsQuery = readFileSync(sqlPath, 'utf-8'); // Read the SQL query from the file

  // Change this to the report date you want to validate.
  const reportDate = '2026-10-12';

  try {
    const result = await db.query(
      missingBookingsQuery,
      [reportDate]
    ); // Execute the SQL query to find missing bookings for the specified report date

    console.log('Report date:', reportDate);
    console.log('Missing booking count:', result.rows.length);// Log the number of missing bookings found

    if (result.rows.length > 0) {
      console.table(result.rows);// Log the detailed missing booking data
    }

    expect(
      result.rows,
      `Missing bookings found for report date ${reportDate}`
    ).toHaveLength(0);
  } finally {
    await db.end(); // Close the database connection
  }
});
