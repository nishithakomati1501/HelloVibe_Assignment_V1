
-- Bookings present in API but missing from the selected report date
SELECT
    a.booking_id,
    'MISSING_IN_REPORT' AS issue
FROM bookings_api a
WHERE NOT EXISTS (
    SELECT 1
    FROM bookings_report r
    WHERE r.booking_id = a.booking_id
      AND r.report_date = $1::date 
)

UNION ALL

-- Bookings present in the report but missing from API
SELECT
    r.booking_id,
    'MISSING_IN_API' AS issue
FROM bookings_report r
WHERE r.report_date = $1::date
  AND NOT EXISTS (
      SELECT 1
      FROM bookings_api a
      WHERE a.booking_id = r.booking_id
  )

ORDER BY booking_id;
