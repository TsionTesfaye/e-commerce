<script lang="ts" setup>
definePageMeta({
  layout: "admin",
})

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import * as z from "zod"
import accessory from "~/components/size/accessory.vue"
import clothing from "~/components/size/clothing.vue"
import cosmetic from "~/components/size/cosmetic.vue"
import shoes from "~/components/size/shoes.vue"

const schema = z.object({
  name: z.string({required_error: "Name of the product is required"}),
  // price: z.union([
  //     z.number({
  //       invalid_type_error: 'Price must be a number',
  //     })
  //       .positive('Price must be a positive number')
  //       .optional(),
  //     z.literal(""),
  //   ]),
  variant: z.union([
      z.number({
        invalid_type_error: 'Variant must be a number',
      })
        .positive('Variant must be a positive number')
        .optional(),
      z.literal(""),
    ]),
  desciption: z.string({required_error: "Description is required"}),
  brand: z.string().optional(),
  category: z.string({required_error: "Category is required"}),
  subCategory: z.string({required_error: "Sub Category is required"})
})
const { values } = useForm(
  {
    validationSchema: toTypedSchema(schema), initialValues: {
      variant: 1,
    }
  },

)

const sizeComponent = computed(() => {
  switch (values.category) {
    case "clothing":
      return clothing
    case "shoes":
      return shoes
    case "cosmetic":
      return cosmetic
    case "accessory":
      return accessory
    default:
      return null
  }
})

const subCategories = computed(() => {
  switch (values.category) {
    case "shoes":
      return ["Sneakers", "Boots", "Heels", "Flats", "Sandals", "Loafers", "Slippers", "Wedges", "Others"]
    case "clothing":
      return ["Dresses", "Tops", "Bottoms", "Sweatshirts & Hoodies", "Outerwear", "Sports", "Swimwear", "Sleepwear", "Undergarments", "Others"]
    case "accessories":
      return ["Jewelry", "Bags", "Hats", "Belts", "Scarves", "Sunglasses", "Watches", "Hair Accessories", "Others"]
    case "cosmetics":
      return ["Face", "Eyes", "Lips", "Nails", "Skincare", "Haircare", "Tools", "Others"]
    default:
      return []
  }
})

function submitForm() {
  // k
}
const product = ref({
  name: "",
  price: null,
  description: "",
  brand: "",
  type: "shoes",
  subCategory: "",
  color: "#000000",
  colorName: "",
  patternName: "",
  size: {
    standard: "EU",
    value: "",
    letter: "",
    measurements: {
      bust: null,
      waist: null,
      hips: null,
      length: null,
      sleeveLength: null,
    },
    custom: "",
    type: "mL",
  },
  images: [] as string[],
  returnable: true,
})

function handleImageUpload(event: Event) {
  const files = Array.from((event.target as HTMLInputElement)?.files || [])
  if (files.length > 5) {
    alert("You can only upload up to 5 images")
    return
  }
  product.value.images = [...product.value.images, ...files.map(file => URL.createObjectURL(file))].slice(0, 5)
}

function removeImage(index: number) {
  product.value.images.splice(index, 1)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8 ">
    <form class="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-md" @submit.prevent="submitForm">
      <div class="p-8">
        <h1 class="mb-8 text-3xl font-bold">
          Add New Product
        </h1>
        <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem class="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl class="w-full">
                <Input type="text" placeholder="Enter the name of the product" v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <FormField v-slot="{ componentField }" name="descripion" class="">
            <FormItem class="flex flex-col md:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the product"
                  class="w-full resize-none"
                  v-bind="componentField"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="brand">
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Enter the Brand of the product" v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="category">
            <FormItem>
              <FormLabel>Category</FormLabel>

              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the category of the product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="clothing">
                      Clothing
                    </SelectItem>
                    <SelectItem value="shoes">
                      Shoes
                    </SelectItem>
                    <SelectItem value="accessories">
                      Accessories
                    </SelectItem>
                    <SelectItem value="cosmetic">
                      Cosmetics
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="subCategory">
            <FormItem>
              <FormLabel>Sub Category</FormLabel>

              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory of the product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="(subCat, index) in subCategories" :key="index" :value="subCat.toLowerCase()">
                      {{ subCat }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-if="values.category === 'clothing' || values.category === 'shoes'" v-slot="{ componentField }" name="material">
            <FormItem class="w-full">
              <FormLabel>Material</FormLabel>
              <FormControl class="w-full">
                <Input type="text" placeholder="Enter the material of the product" v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <div class="mb-8">
          <FormField v-slot="{ componentField }" name="variant">
            
          <FormItem>
              <FormLabel>Variants</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter the variants"  v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
            <Variant v-for="index in values.variant" :key="index" :index="index" />
          
          
          <component :is="sizeComponent" />
          <div class="mb-8">
            <h2 class="mb-4 text-xl font-semibold">
              Product Images
            </h2>
            <FormField v-slot="{ componentField }" name="images">
              <FormItem class="max-w-[400px]">
                <FormControl class="max-w-[400px]">
                  <Input type="file" accept="image/*" multiple class="mb-4 " v-bind="componentField" @change="handleImageUpload" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            
            <div class="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div v-for="(image, index) in product.images" :key="index" class="relative">
                <img :src="image" :alt="`Product ${index + 1}`" class="h-32 w-full rounded object-cover">
                <button class="absolute right-0 top-0 flex size-6 items-center justify-center rounded-full bg-red-500 text-white" @click="removeImage(index)">
                  &times;
                </button>
              </div>
            </div>
          </div>
          <div class="mb-8">
            <h2 class="mb-4 text-xl font-semibold">
              Return Policy
            </h2>
            <div class="mb-4 flex space-x-4">
              <FormField v-slot="{ componentField }" type="radio" name="returnPolicy">
                <FormItem class="space-y-3">
                  <FormControl>
                    <RadioGroup
                      class="flex  space-y-1"
                      v-bind="componentField"
                    >
                      <FormItem class="flex items-center gap-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="returnable" />
                        </FormControl>
                        <FormLabel class="font-normal">
                          Returnable
                        </FormLabel>
                      </FormItem>
                      <FormItem class="flex items-center gap-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="non-returnable" />
                        </FormControl>
                        <FormLabel class="font-normal">
                          Non-returnable
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style>

</style>
