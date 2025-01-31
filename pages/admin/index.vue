<script lang="ts" setup>
definePageMeta({
  layout: "admin",
})

type size = {
  metric?: string | undefined
  sizeValue?: number | undefined
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
  size: size | undefined | string
  color: color[] | color | undefined | string
  price: number | undefined
  stock_quantity: number | undefined
}

type Product = {
  name: string
  description: string
  brand: string | undefined
  sub_category_id: string
  material: string | undefined
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
import { useToast } from "~/components/ui/toast"


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const imageSchema = z
  .instanceof(File)
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Only .jpg, .jpeg, .png, and .webp formats are supported",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "Each image must be less than 5MB",
  });


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
  images: z.array(imageSchema).max(5, "You can upload up to 5 images").optional(),
})

const { toast } = useToast()
const areVariantsValid = ref<boolean[]>([false])
const finalProduct = ref<Product >({
  name: "",
  description: "",
  brand: "",
  sub_category_id: "",
  material: "",
  returnPolicy: false,
  variants: [],
})
const { values, handleSubmit, setFieldValue } = useForm(
  {
    validationSchema: toTypedSchema(schema),
    initialValues: {
      variant: 1,
      returnPolicy: "non-returnable",
     

    },
  },

)

const computedUrl = computed(() => {
  return values.category
    ? `https://online-shop-1-afra.onrender.com/sub-category/category-name/${values.category}`
    : "" // Return an empty string or a fallback URL if no category is selected
})

const { data: doneSubmitting, execute: sendProduct, error: submitError } = useFetch("https://online-shop-1-afra.onrender.com/product", {
  method: "post",
  immediate: false,
  body: finalProduct, // Use a function to get the latest value
})

const { data: subCategoriesList, execute: fetchSubCategories } = useFetch(
  computedUrl,
  {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
    immediate: false, // Make sure fetch happens when required
  },
)

watch(() => values.category, async (newCategory) => {
  if (newCategory) {
    // Ensure the category is updated before making the fetch cal
    fetchSubCategories() // Now fetch with the updated category value
  }
})

const isTotalTrue = computed(() => areVariantsValid.value.every(v => v === true))
watch(() => values.variant, (value) => {
  if (typeof value === "number" && areVariantsValid.value.length !== value) {
    areVariantsValid.value = Array.from({ length: value }, () => false)
  }
  finalProduct.value.variants = Array.from({ length: Number(value) }, () => ({
    size: undefined,
    color: [],
    price: undefined,
    stock_quantity: undefined,
  }))
})

const submitForm = handleSubmit(async (values) => {
  finalProduct.value.name = values.name;
  finalProduct.value.description = values.description;
  finalProduct.value.brand = values.brand;
  finalProduct.value.sub_category_id = values.subCategory;
  finalProduct.value.material = values.material;
  finalProduct.value.returnPolicy = values.returnPolicy === "returnable";

  const newVariants: variant[] = [];

  for (const variant of finalProduct.value.variants) {
    const colors = Array.isArray(variant.color) ? variant.color : [variant.color];

    for (const color of colors) {
      if (typeof color === "object" && color !== null && !color.name.trim()) {
        return toast({
          title: "Error",
          description: "Color name is required",
          variant: "destructive",
        });
      }

      // Convert size and color to JSON strings
      const serializedSize = variant.size ? JSON.stringify(variant.size) : null;
      const serializedColor = color ? JSON.stringify(color) : null;

      newVariants.push({
        size: serializedSize!,
        color: serializedColor!,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
      });
    }
  }

  finalProduct.value.variants = newVariants;

  await sendProduct();

  if (submitError.value) {
    toast({
      title: "Error",
      description: submitError.value.message || "Something went wrong. Please try again.",
      variant: "destructive",
    });
  } else if (doneSubmitting.value) {
    toast({
      title: "Success",
      description: "Product has been posted successfully.",
    });
    window.location.reload();
  }
});


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
  images: [] as { file: File; url: string }[],
  returnable: true,
})

function handleImageUpload(event: Event) {
  const files = Array.from((event.target as HTMLInputElement)?.files || []);
  
  // Validate file count
  if (files.length + product.value.images.length > 5) {
    return toast({
      title: "Error",
      description: "You can only upload a maximum of 5 images",
      variant: "destructive",
    });
  }

  // Update images in state with both file objects (for backend) and URLs (for preview)
  const newImages = files.map(file => ({
    file, // Keep the original file object
    url: URL.createObjectURL(file) // Generate the URL for preview
  }));

  // Add to the existing images, limiting to 5 images
  product.value.images = [
    ...product.value.images, 
    ...newImages
  ].slice(0, 5);  // Ensure no more than 5 images
}

function removeImage(index: number) {
  product.value.images.splice(index, 1)
  
  if(product.value.images.length === 0){
    console.log('yeth')
    setFieldValue('images', undefined)
  }
  
  
}

function variantValidation(isValid: boolean, data: { errors: Record<string, string[]>, values: { sizes: size, price: number | undefined, stock: number | undefined, colors: color[], index: number | undefined } }) {
  if (data.values.index !== undefined) {
    areVariantsValid.value[data.values.index] = isValid
  }

  if (data.values.index !== undefined) {
    if (isValid) {
      finalProduct.value.variants[data.values.index] = {
        size: data.values.sizes,
        color: data.values.colors,
        price: data.values.price || 0,
        stock_quantity: data.values.stock || 0,
      }
    } else {
      finalProduct.value.variants[data.values.index] = {
        size: data.values.sizes,
        color: undefined,
        price: undefined,
        stock_quantity: undefined,
      }
    }
  }
}
</script>

<template>
  <div class=" bg-gray-100 p-8 ">
    <form class="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-md">
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
          <FormField v-slot="{ componentField }" name="category" validate-on-mount>
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
                    <SelectItem value="CLOTHING">
                      Clothing
                    </SelectItem>
                    <SelectItem value="SHOES">
                      Shoes
                    </SelectItem>
                    <SelectItem value="ACCESSORIES">
                      Accessories
                    </SelectItem>
                    <SelectItem value="COSMETICS">
                      Cosmetic
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
                    <SelectItem v-for="(subCat, index) in subCategoriesList" :key="index" :value="subCat.id">
                      {{ subCat.name }}
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
                <img :src="image.url" :alt="`Product ${index + 1}`" class="h-32 w-full rounded object-cover">
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
      <button :disabled="!isTotalTrue" class="rouded-lg  bg-blue-500 p-2 text-white disabled:cursor-not-allowed disabled:bg-opacity-50" @click="submitForm">
        Submit
      </button>
    </div>
  </div>
</template>

<style>

</style>
