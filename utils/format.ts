export function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? Number.parseFloat(price) : price
  return Number.isInteger(num) ? num.toString() : num.toFixed(2)
}
