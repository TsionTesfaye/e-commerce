<script lang="ts" setup>
definePageMeta({
  layout: "admin",
})

type size = {
  metric: string | undefined
  sizeValue: number | undefined
  customSize: string | undefined
  sizeLetters: string | undefined
  bust: number | undefined
  waist: number | undefined
  hips: number | undefined
  length: number | undefined
  sleeve: number | undefined
  fit: string | undefined

}

type color = {
  color: string
  name: string
}
type variant = {
  size: size
  color: color
  price: number
  stock_quantity: number
}

type product = {
  name: string
  description: string
  brand: string|undefined
  sub_category_id: string
  material: string|undefined
  returnPolicy: boolean
  variants: variant[]
  

}

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

const schema = z.object({
  name: z.string({ required_error: "Name of the product is required" }).nonempty("Name of the product is required"),
  variant: z
    .union([
      z.number().positive("Variant must be a positive number"),
      z.string().trim().length(0), // Allow empty string but check later
    ])
    .refine(value => value !== "", {
      message: "Variant is required",
    }),
  description: z.string({ required_error: "Description is required" }).nonempty("Description is required"),
  brand: z.string().optional(),
  category: z.string({ required_error: "Category is required" }).nonempty("Category is required"),
  subCategory: z.string({ required_error: "Sub Category is required" }).nonempty("Sub Category is required"),
  material: z.string().optional(),
  returnPolicy: z.string({ required_error: "Return Policy is required" }).nonempty("Return Policy is required"),
})
const areVariantsValid = ref<boolean[]>([false])
const finalProduct = ref<product>({
  name: "",
  description: "",
  brand: "",
  sub_category_id: "",
  material: "",
  returnPolicy: true,
  variants: [],
})
const { values } = useForm(
  {
    validationSchema: toTypedSchema(schema),
    initialValues: {
      variant: 1,
      returnPolicy: "non-returnable",

    },
  },

)
const isTotalTrue = computed(() => areVariantsValid.value.every(v => v === true))
watch(() => values.variant, (value) => {
  if (typeof value === "number" && areVariantsValid.value.length !== value) {
    areVariantsValid.value = Array.from({ length: value }, () => false)
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
  //
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

function variantValidation(isValid: boolean, data: { errors: Record<string, string[]>, values: { sizes: size, price: number | undefined, stock: number | undefined, colors: color[], index: number | undefined } }) {
  if (data.values.index !== undefined) {
    areVariantsValid.value[data.values.index] = isValid
  }
  
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8 ">
    <form class="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-md" @submit.prevent="submitForm">
      <div class="w-full p-8">
        <h1 class="mb-8 text-3xl font-bold">
          Add New Product
        </h1>
        <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField v-slot="{ componentField }" name="name" validate-on-blur>
            <FormItem class="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl class="w-full">
                <Input type="text" placeholder="Enter the name of the product" v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="description" class="" validate-on-blur>
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
          <FormField v-slot="{ componentField }" name="brand" validate-on-blur>
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Enter the Brand of the product" v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="category" validate-on-blur>
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
          <FormField v-slot="{ componentField }" name="subCategory" validate-on-blur>
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
          <FormField v-if="values.category === 'clothing' || values.category === 'shoes'" v-slot="{ componentField }" name="material" validate-on-blur>
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
          <FormField v-slot="{ componentField }" name="variant" validate-on-blur>
            <FormItem>
              <FormLabel>Variants</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter the variants" v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Variant v-for="(num, index) in values.variant" :key="index" :index="Number(index)" :type="values.category" class="mt-4" @validated="variantValidation" />

          <div class="mb-8 mt-4">
            <h2 class="mb-4 text-xl font-semibold">
              Product Images
            </h2>
            <FormField v-slot="{ componentField }" name="images" validate-on-blur>
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
              <FormField v-slot="{ componentField }" type="radio" name="returnPolicy" validate-on-blur>
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
    <div class="mt-8 flex w-full justify-center">
      <button :disabled="!isTotalTrue" class="rouded-lg  bg-blue-500 p-2 text-white disabled:bg-opacity-50 disabled:cursor-not-allowed" @click="submitForm">
        Submit
      </button>
    </div>
  </div>
</template>

<style>

</style>
