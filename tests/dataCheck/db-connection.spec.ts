import { test, expect } from '@playwright/test';
import { db } from '../../utils/db';

test('connect to PostgreSQL and verify tables', async () => {
  try {
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'bookings_api',
          'bookings_report'
        )
      ORDER BY table_name;
    `);

    const tableNames = result.rows.map(
      (row) => row.table_name
    );

    expect(tableNames).toEqual([
      'bookings_api',
      'bookings_report',
    ]);

    console.log('PostgreSQL connection successful');
    console.log('Tables found:', tableNames);
  } finally {
    await db.end();
  }
});