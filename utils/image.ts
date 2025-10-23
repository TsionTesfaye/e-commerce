export function getImagePath(item: { image: string, name: string }, category?: string): string {
  // Special case for "Others" subcategory
  if (item.name === "Others") {
    return `/categories/others.png`
  }

  // If no category (main categories view) or category is undefined
  if (!category) {
    return `/categories/${item.image}`
  }

  // For subcategories
  return `/categories/${category.toLowerCase()}/${item.image}`
}



