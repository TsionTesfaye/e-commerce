<script lang="ts" setup>
definePageMeta({
  layout: "admin",
})

import type { ProductColor, ProductForm, ProductSize, SubCategory } from "~/types"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "~/components/ui/toast"
import { productFormSchema } from "~/schemas"

const schema = productFormSchema

const { toast } = useToast()
const areVariantsValid = ref<boolean[]>([false])
const fileInput = ref<HTMLInputElement | null>(null)
const isSubmitting = ref(false)
const finalProduct = ref<ProductForm>({
  name: "",
  description: "",
  brand: "",
  sub_category_id: "",
  material: "",
  returnPolicy: false,
  variants: [],
  images: [],
  price: 0,
})

const { values, handleSubmit, setValues } = useForm(
  {
    validationSchema: toTypedSchema(schema),
    initialValues: {
      variant: 1,
      returnPolicy: "non-returnable",
    },
  },
)

const { baseUrl } = useApi()

const computedUrl = computed(() => {
  return values.category
    ? `${baseUrl}/sub-categories/category-name/${values.category}`
    : ""
})
// Unused fetch for now... keeping for future use
// const { data: doneSubmitting, execute: sendProduct, error: submitError } = useFetch(`${baseUrl}/products`, {
//   method: "post",
//   immediate: false,
//   body: finalProduct,
// })

const { data: subCategoriesList, execute: fetchSubCategories } = useFetch<SubCategory[]>(
  computedUrl,
  {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
    immediate: false,
  },
)

watch(() => values.category, async (newCategory) => {
  if (newCategory) {
    fetchSubCategories()
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
    stock_quantity: undefined,
  }))
})

const images = ref<{ file: File, url: string }[]>([])

const submitForm = handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    const formData = new FormData()
    formData.append("name", values.name)
    formData.append("description", values.description)
    formData.append("brand", values.brand || "")
    formData.append("sub_category_id", values.subCategory)
    formData.append("material", values.material || "")
    formData.append("returnable", (values.returnPolicy === "returnable").toString())
    formData.append("price", values.price.toString())

    let variantIndex = 0
    finalProduct.value.variants.forEach((variant: any) => {
      const colors = Array.isArray(variant.color) ? variant.color : [variant.color]
      const sizes = Array.isArray(variant.size) ? variant.size : [variant.size]

      colors.forEach((color: any) => {
        if (typeof color === "object" && color !== null && !color.name.trim()) {
          throw new Error("Color name is required")
        }

        sizes.forEach((size: any) => {
          const serializedSize = size ? JSON.stringify(size) : null
          const serializedColor = color ? JSON.stringify(color) : null

          formData.append(`variants[${variantIndex}][size]`, serializedSize || "")
          formData.append(`variants[${variantIndex}][color]`, serializedColor || "")
          formData.append(`variants[${variantIndex}][stock_quantity]`, variant.stock_quantity?.toString() || "")
          variantIndex++
        })
      })
    })

    images.value.forEach((image) => {
      formData.append(`images`, image.file)
    })

    const { baseUrl } = useApi()
    const { error } = await useFetch(
      `${baseUrl}/products`,
      {
        method: "post",
        body: formData,
      },
    )

    if (error.value) {
      throw error.value
    }

    toast({
      title: "Success",
      description: "Product has been posted successfully.",
    })
    window.location.reload()
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Something went wrong. Please try again.",
      variant: "destructive",
    })
  } finally {
    isSubmitting.value = false
  }
})

const image = ref()

function handleImageUpload(event: Event) {
  const files = Array.from((event.target as HTMLInputElement)?.files || [])

  if (files.length + images.value.length > 5) {
    return toast({
      title: "Error",
      description: "You can only upload a maximum of 5 images",
      variant: "destructive",
    })
  }

  const newImages = files.map(file => ({
    file,
    url: URL.createObjectURL(file),
  }))

  images.value = [
    ...images.value,
    ...newImages,
  ].slice(0, 5)
}

async function triggerFileInput() {
  await nextTick()
  const input = fileInput.value

  if (input instanceof HTMLInputElement) {
    input.click()
  } else {
    console.error("File input is not ready yet.")
  }
}

function removeImage(index: number) {
  const removedImage = images.value[index]
  URL.revokeObjectURL(removedImage.url)
  images.value.splice(index, 1)

  if (images.value.length === 0) {
    setValues({
      images: undefined,
    })
    return image.value = undefined
  }

  setValues({
    images: images.value[images.value.length - 1].file,
  })
}

function variantValidation(isValid: boolean, values: { sizes: ProductSize, stock: number | undefined, colors: ProductColor[], index: number | undefined }) {
  if (values.index !== undefined) {
    areVariantsValid.value[values.index] = isValid
  }

  if (values.index !== undefined) {
    if (isValid) {
      finalProduct.value.variants[values.index] = {
        size: values.sizes,
        color: values.colors,
        stock_quantity: values.stock || 0,
      }
    } else {
      finalProduct.value.variants[values.index] = {
        size: values.sizes,
        color: undefined,
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
                    <SelectItem v-for="(subCat, index) in (subCategoriesList || [])" :key="index" :value="subCat?.id">
                      {{ subCat?.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          </FormField>
          <FormField
            v-if="values.category === 'clothing' || values.category === 'shoes'"
            v-slot="{ componentField }" name="material" validate-on-blur
          >
            <FormItem class="w-full">
              <FormLabel>Material</FormLabel>
              <FormControl class="w-full">
                <Input type="text" placeholder="Enter the material of the product" v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="price" validate-on-blur>
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter the Price of the product" min="0" v-bind="componentField" class="w-full" />
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

          <Variant
            v-for="(num, index) in values.variant" :key="index" :index="Number(index)"
            :type="values.category" class="mt-4" @validated="variantValidation"
          />

          <div class="mb-8 mt-4">
            <h2 class="mb-4 text-xl font-semibold">
              Product Images
            </h2>
            <FormField v-slot="{ componentField, handleBlur }" name="images" validate-on-blur>
              <FormItem class="max-w-[400px]">
                <FormControl class="max-w-[400px]">
                  <!-- using v-model for image input due to shadcn internal issue for file input -->

                  <Input
                    v-bind="componentField" ref="fileInput" type="file" class="mb-4 hidden"
                    @change="handleImageUpload" @blur="handleBlur"
                  />
                  <button
                    type="button"
                    class="mb-8 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    @click.prevent="triggerFileInput"
                  >
                    Upload Images
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="mt-3 grid grid-cols-2 gap-4 md:grid-cols-5">
              <div v-for="(imageprev, index) in images" :key="index" class="relative">
                <img :src="imageprev.url" :alt="`Product ${index + 1}`" class="h-32 w-full rounded object-cover">
                <button
                  type="button" class="absolute right-0 top-0 flex size-6 items-center justify-center
                rounded-full bg-red-500 text-white" @click.prevent="removeImage(index)"
                >
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
      <button
        type="button"
        :disabled="!isTotalTrue || isSubmitting"
        class="flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium
        text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:opacity-70"
        @click="submitForm"
      >
        <span v-if="!isSubmitting">Submit Product</span>
        <span v-else class="flex items-center">
          <Icon name="lucide:loader-2" class="mr-2 size-5 animate-spin text-white" />
          Submitting...
        </span>
      </button>
    </div>
  </div>
</template>

<style>

</style>
