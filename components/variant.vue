<script lang="ts" setup>
import type { ProductColor, ProductSize } from "~/types/product"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import accessory from "~/components/size/accessory.vue"
import clothing from "~/components/size/clothing.vue"
import cosmetic from "~/components/size/cosmetic.vue"
import shoes from "~/components/size/shoes.vue"

import { variantSchema } from "~/schemas"

const props = defineProps({
  type: {
    type: String,
  },
  index: {
    type: Number,
  },
})

const emit = defineEmits<{
  (event: "validated", isValid: boolean, values: { sizes: ProductSize, stock: number | undefined, colors: ProductColor[], index: number | undefined }): void
}>()

const colors = ref<ProductColor[]>([{ color: "#000000", name: "" }])
const sizes = ref<ProductSize>({
  metric: undefined,
  size: undefined,
  customSize: undefined,
  sizeLetter: undefined,
  bust: undefined,
  waist: undefined,
  hips: undefined,
  length: undefined,
  sleeve: undefined,
  fit: undefined,
})
const isSizeValid = ref(false)
const schema = variantSchema

const { values, validate } = useForm({
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

// Price per variant removed for now but we will have "values.price" in the future
watch(() => ({ stock: values.stock, sizes: sizes.value, colors: [...colors.value] }), async () => {
  const isValid = await validate()
  emit("validated", (isValid?.valid && isSizeValid.value) ?? false, {
    sizes: sizes.value,
    stock: typeof values.stock === "number" ? values.stock : undefined,
    colors: [...colors.value],
    index: props.index,
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

function emitValues(isValid: boolean, values: ProductSize) {
  isSizeValid.value = isValid
  sizes.value = values
}
</script>

<template>
  <div class="rounded-2xl border border-gray-300 p-2">
    <p class="my-2 text-xl font-semibold">
      Variant {{ (index ?? 0) + 1 }}
    </p>
    <form class="mx-auto max-w-4xl  space-y-4 bg-white">
      <div class="mb-8">
        <!-- <h2 class="mb-4 text-xl font-semibold">
            Color / Pattern (Not needed for now)
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
                <Input
                  v-bind="componentField" v-model="colors[colorIndex].name" type="text"
                  placeholder="Enter the name of the Color" class="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <FormField v-slot="{ componentField }" name="stock" class="mb-4">
          <FormItem>
            <FormLabel>Stock Amount</FormLabel>
            <FormControl>
              <Input
                type="number" min="0" placeholder="Enter the stock of the product"
                v-bind="componentField" class="w-full"
              />
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
