export function formatSize(size: any, categoryName: string): string {
  if (!size) {
    return "N/A"
  }

  const category = categoryName?.toUpperCase()

  switch (category) {
    case "SHOES": {
      return `${size.size || ""} ${size.metric || ""}`.trim() || "N/A"
    }
    case "CLOTHING": {
      const measurements = []
      if (size.fit) {
        measurements.push(`Fit: ${size.fit}`)
      }
      if (size.bust) {
        measurements.push(`Bust: ${size.bust}cm`)
      }
      if (size.waist) {
        measurements.push(`Waist: ${size.waist}cm`)
      }
      if (size.hips) {
        measurements.push(`Hips: ${size.hips}cm`)
      }
      if (size.length) {
        measurements.push(`Length: ${size.length}cm`)
      }
      if (size.sleeve) {
        measurements.push(`Sleeve: ${size.sleeve}cm`)
      }
      if (size.customSize) {
        measurements.push(`Custom: ${size.customSize}`)
      }
      return measurements.length > 0 ? measurements.join(", ") : size.sizeLetter || "N/A"
    }
    case "ACCESSORIES": {
      return size.customSize || "N/A"
    }
    default:
      return "N/A"
  }
}
