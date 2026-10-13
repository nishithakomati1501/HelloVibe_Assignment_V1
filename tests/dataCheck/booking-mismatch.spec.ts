
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { db } from '../../helpers/db';

test('validate booking data between API and report tables', async () => {
  const sqlPath = resolve(
    process.cwd(),
    'sql',
    'booking-mismatch.sql'
  ); 

  const mismatchQuery = readFileSync(sqlPath, 'utf-8'); // Read the SQL query from the file

  try {
    const result = await db.query(mismatchQuery);// Execute the SQL query to find booking mismatches

    console.log('Mismatch count:', result.rows.length); // Log the number of mismatches found

    if (result.rows.length > 0) {
      console.table(result.rows);// Log the detailed mismatched booking data
    }

    expect(
      result.rows,
      'Booking data mismatches were found'
    ).toHaveLength(0);// Assert that there are no booking data mismatches
  } finally {
    await db.end(); // Close the database connection
  }
});
