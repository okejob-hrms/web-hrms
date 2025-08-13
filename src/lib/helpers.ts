export const rupiahFormatter = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
};
export function formatDateTime(isoString: string) {
  const dateObj = new Date(isoString);

  const date = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hour = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // change to true if you want AM/PM
  });

  return { date, hour };
}
