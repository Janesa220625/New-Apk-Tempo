/**
 * Format a number as Indonesian Rupiah (IDR)
 * @param amount - The amount to format
 * @returns Formatted string in IDR
 */
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
