SELECT
    a.booking_id,

    -- Name derived from the API first and last names
    CONCAT(a.firstname, ' ', a.lastname) AS api_guest_name,
    r.guest_name AS report_guest_name,

    -- Price compared directly
    a.totalprice AS api_total_price,
    r.total_price AS report_total_price,

    -- Nights derived by subtracting check-in from check-out
    (a.checkout - a.checkin) AS api_nights,
    r.nights AS report_nights,

    -- Boolean converted into the report's text format
    CASE
        WHEN a.depositpaid = TRUE THEN 'PAID'
        ELSE 'NOT PAID'
    END AS api_deposit_status,
    r.deposit_status AS report_deposit_status

FROM bookings_api a
INNER JOIN bookings_report r
    ON a.booking_id = r.booking_id

WHERE
       CONCAT(a.firstname, ' ', a.lastname)
           IS DISTINCT FROM r.guest_name
    OR a.totalprice
           IS DISTINCT FROM r.total_price
    OR (a.checkout - a.checkin)
           IS DISTINCT FROM r.nights
    OR (
        CASE
            WHEN a.depositpaid = TRUE THEN 'PAID'
            ELSE 'NOT PAID'
        END
    ) IS DISTINCT FROM r.deposit_status

ORDER BY a.booking_id;