
import { formatInTimeZone } from "date-fns-tz";

/**
 * Generates a unique transaction ID with format INV-YYYYMMDD-XXXX
 */
export const generateTransactionId = (): string => {
  return `INV-${formatInTimeZone(new Date(), 'Asia/Jakarta', 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
};
