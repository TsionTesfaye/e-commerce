<script lang="ts" setup>
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

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm, useFormValues } from "vee-validate"
import * as z from "zod"
import accessory from "~/components/size/accessory.vue"
import clothing from "~/components/size/clothing.vue"
import cosmetic from "~/components/size/cosmetic.vue"
import shoes from "~/components/size/shoes.vue"

const props = defineProps({
  type: {
    type: String,
  },
  index: {
    type: Number,
  },
})

const emit = defineEmits<{
  (event: "validated", isValid: boolean, data: { errors: Record<string, string[]>, values: { sizes: size, price: number | undefined, stock: number | undefined, colors: color[], index: number | undefined } }): void
}>()
const colors = ref<color[]>([{ color: "#000000", name: "" }])
const sizes = ref<size>({
  metric: undefined,
  sizeValue: undefined,
  customSize: undefined,
  sizeLetters: undefined,
  bust: undefined,
  waist: undefined,
  hips: undefined,
  length: undefined,
  sleeve: undefined,
  fit: undefined,
})
const isSizeValid = ref(false)
const schema = z.object({

  colorAmount: z
    .union([
      z.number().positive("Color amount must be a positive number"),
      z.string().trim().length(0), // Allow empty string but check later
    ])
    .refine(value => value !== "", {
      message: "Color amount is required",
    }),
  stock: z
    .union([
      z.number().positive("Stock amount must be a positive number"),
      z.string().trim().length(0), // Allow empty string but check later
    ])
    .refine(value => value !== "", {
      message: "Stock amount is required",
    }),
})

const { values, errors, validate } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: { colorAmount: 1 },
})

watch(values, () => {
  if (typeof values.colorAmount === "number" && values.colorAmount !== colors.value.length) {
    colors.value = Array.from({ length: values.colorAmount }, (_) => {
      return { color: "#000000", name: "" }
    })
  }
}, { immediate: true })

watch(() => ({ price: values.price, stock: values.stock, sizes: sizes.value, colors: [...colors.value] }), async () => {
  const isValid = await validate()
  emit("validated", (isValid?.valid && isSizeValid.value) ?? false, {
    errors: Object.fromEntries(Object.entries(errors.value).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])),
    values: {
      sizes: sizes.value,
      price: typeof values.price === "number" ? values.price : undefined,
      stock: typeof values.stock === "number" ? values.stock : undefined,
      colors: [...colors.value],
      index: props.index,
    },
  })
}, { deep: true })
const sizeComponent = computed(() => {
  switch (props.type) {
    case "CLOTHING":
      return { component: clothing }
    case "SHOES":
      return { component: shoes }
    case "COSMETICS":
      return { component: cosmetic }
    case "ACCESSORIES":
      return { component: accessory }
    default:
      return { component: null }
  }
})

function emitValues(isValid: boolean, data: { errors: Record<string, string>, values: size }) {
  isSizeValid.value = isValid
  sizes.value = data.values
}
</script>

<template>
  <div class="rounded-2xl border border-gray-300 p-2">
    <p class="my-2 text-xl font-semibold">
      Variant {{ index + 1 }}
    </p>
    <form class="mx-auto max-w-4xl  space-y-4 bg-white">
      <div class="mb-8">
        <!-- <h2 class="mb-4 text-xl font-semibold">
            Color / Pattern
          </h2>
          <div class="mb-4 flex space-x-4">
            <FormField v-slot="{ componentField }" type="radio" name="colorOrPattern">
              <FormItem class="space-y-3">
                <FormControl>
                  <RadioGroup
                    class="flex  space-y-1"
                    v-bind="componentField"
                  >
                    <FormItem class="flex items-center gap-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="solidColor" />
                      </FormControl>
                      <FormLabel class="font-normal">
                        Solid Color
                      </FormLabel>
                    </FormItem>
                    <FormItem class="flex items-center gap-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="pattern" />
                      </FormControl>
                      <FormLabel class="font-normal">
                        Pattern thumbnail
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div> -->
        <FormField v-slot="{ componentField }" name="colorAmount" validate-on-blur class="">
          <FormItem>
            <FormLabel>How many colors does the variant have?</FormLabel>

            <FormControl>
              <Input type="number" min="1" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <div v-for="(num, colorIndex) in values.colorAmount" :key="colorIndex" class="  my-4 flex space-x-4">
          <FormField v-slot="{ componentField }" :name="`color${index}`">
            <FormItem class="size-14 rounded ">
              <FormLabel class="w-fit">
                Color {{ colorIndex + 1 }}
              </FormLabel>
              <FormControl class="p-1">
                <Input v-bind="componentField" v-model="colors[colorIndex].color" type="color" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" :name="`colorName${index}`">
            <FormItem class="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl class="w-full">
                <Input v-bind="componentField" v-model="colors[colorIndex].name" type="text" placeholder="Enter the name of the Color" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <FormField v-slot="{ componentField }" name="stock" class="mb-4">
          <FormItem>
            <FormLabel>Stock Amount</FormLabel>
            <FormControl>
              <Input type="number" min="0" placeholder="Enter the stock of the product" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <component :is="sizeComponent.component" class="mt-4" @validated="emitValues" />
      </div>
    </form>
  </div>
</template>

<style>

</style>
