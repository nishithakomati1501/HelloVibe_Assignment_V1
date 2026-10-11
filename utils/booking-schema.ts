export type Booking = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export const bookingSchema = {
  firstName: (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0,
  lastName: (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0,
  postalCode: (value: unknown): value is string =>
    typeof value === 'string' && /^\d{6}$/.test(value.trim()),
};

export function isValidBooking(value: unknown): value is Booking {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const booking = value as Record<string, unknown>;

  return (
    bookingSchema.firstName(booking.firstName) &&
    bookingSchema.lastName(booking.lastName) &&
    bookingSchema.postalCode(booking.postalCode)
  );
}
