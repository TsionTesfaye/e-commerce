import type { Category, SubCategory } from "~/types/api"

// this stuff was for UI demo before we had the API, for the images of categories and not the products, we
// can have it from the api in the future

export const CATEGORIES: Category[] = [
  { id: "shoes", name: "SHOES", displayName: "Shoes", image: "shoes-cat.png" },
  { id: "clothing", name: "CLOTHING", displayName: "Clothing", image: "clothings-cat.png" },
  { id: "accessories", name: "ACCESSORIES", displayName: "Accessories", image: "accessories-cat.png" },
  { id: "cosmetics", name: "COSMETICS", displayName: "Cosmetics", image: "cosmetics-cat.png" },
]

export const SUB_CATEGORIES = {
  SHOES: [
    { id: "heel", name: "Heels", image: "heel.png", displayName: "Heels" },
    { id: "sneaker", name: "Sneakers", image: "sneaker.png", displayName: "Sneakers" },
    { id: "slipper", name: "Slippers", image: "slipper.png", displayName: "Slippers" },
    { id: "sandal", name: "Sandals", image: "sandal.png", displayName: "Sandals" },
    { id: "boots", name: "Boots", image: "boots.png", displayName: "Boots" },
    { id: "flat", name: "Flats", image: "flat.png", displayName: "Flats" },
  ],
  CLOTHING: [
    { id: "dresses", name: "Dresses", image: "women-dresses.webp", displayName: "Dresses" },
    { id: "tops", name: "Tops", image: "women-shirt.webp", displayName: "Tops" },
    { id: "bottoms", name: "Bottoms", image: "women-pants.webp", displayName: "Bottoms" },
    { id: "sweatshirts", name: "Sweatshirts & Hoodies", image: "women-jacket.webp", displayName: "Sweatshirts & Hoodies" },
    { id: "outerwear", name: "Outerwear", image: "women-coat.webp", displayName: "Outerwear" },
    { id: "sports", name: "Sports", image: "women-sports.webp", displayName: "Sports" },
    { id: "swimwear", name: "Swimwear", image: "swimwear.webp", displayName: "Swimwear" },
    { id: "sleepwear", name: "Sleepwear", image: "women-pjs.webp", displayName: "Sleepwear" },
    { id: "undergarments", name: "Undergarments", image: "women-shorts.webp", displayName: "Undergarments" },
    { id: "others", name: "Others", image: "others.webp", displayName: "Others" },
  ],
  ACCESSORIES: [
    { id: "jewelry", name: "Jewelry", image: "jewelry.png", displayName: "Jewelry" },
    { id: "bags", name: "Bags", image: "bag.png", displayName: "Bags" },
    { id: "hats", name: "Hats", image: "hats.png", displayName: "Hats" },
    { id: "belts", name: "Belts", image: "belts.png", displayName: "Belts" },
    { id: "scarves", name: "Scarves", image: "scarves.png", displayName: "Scarves" },
    { id: "sunglasses", name: "Sunglasses", image: "sunglasses.png", displayName: "Sunglasses" },
    { id: "watches", name: "Watches", image: "watches.png", displayName: "Watches" },
    { id: "hair", name: "Hair Accessories", image: "hair.png", displayName: "Hair Accessories" },
    { id: "others", name: "Others", image: "others.png", displayName: "Others" },
  ],
  COSMETICS: [
    { id: "face", name: "Face", image: "face.png", displayName: "Face" },
    { id: "eyes", name: "Eyes", image: "eyes.png", displayName: "Eyes" },
    { id: "lips", name: "Lips", image: "lips.png", displayName: "Lips" },
    { id: "nails", name: "Nails", image: "nails.png", displayName: "Nails" },
    { id: "skincare", name: "Skincare", image: "skincare.png", displayName: "Skincare" },
    { id: "haircare", name: "Haircare", image: "haircare.png", displayName: "Haircare" },
    { id: "tools", name: "Tools", image: "tools.png", displayName: "Tools" },
    { id: "others", name: "Others", image: "others.png", displayName: "Others" },
  ],
} as const

export const FILTER_CATEGORIES = [
  { id: "all", name: "All Categories" }, 
  { id: "SHOES", name: "Shoes" },
  { id: "COSMETICS", name: "Cosmetics" },
  { id: "CLOTHING", name: "Clothing" },
  { id: "ACCESSORIES", name: "Accessories" },
]

export const PRICE_RANGES = [
  { id: "all", name: "All Prices" },
  { id: "0-50", name: "Under 50 Birr", min: undefined, max: 50 },
  { id: "50-100", name: "50 - 100 Birr", min: 50, max: 100 },
  { id: "100-200", name: "100 - 200 Birr", min: 100, max: 200 },
  { id: "200+", name: "Over 200 Birr", min: 200, max: undefined },
]

export const SORT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "newest", label: "Newest", field: "created_at", order: "desc" },
  { value: "oldest", label: "Oldest", field: "created_at", order: "asc" },
  { value: "price-high", label: "Price: High to Low", field: "price", order: "desc" },
  { value: "price-low", label: "Price: Low to High", field: "price", order: "asc" },
]
