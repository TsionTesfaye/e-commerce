<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import AccessorySize from "@/components/size/accessory.vue"
import ClothingSize from "@/components/size/clothing.vue"
import CosmeticSize from "@/components/size/cosmetic.vue"
import ShoesSize from "@/components/size/shoes.vue"
import { useToast } from "@/components/ui/toast"
import { variantFormSchema } from "~/schemas/variant-form"

const props = defineProps<{
  variant: {
    id: string
    stock_quantity: number
    size: {
      size?: number
      metric?: string
      sizeLetter?: string
      sizeLetters?: string
      customSize?: string
      fit?: string
      bust?: number
      waist?: number
      hips?: number
      length?: number
      sleeve?: number
    }
    color: {
      name: string
      color: string
    }
  }
  categoryName: string
}>()

const emit = defineEmits<{
  (e: "update", variant: any): void
}>()

const { toast } = useToast()
const isOpen = ref(false)
const isLoading = ref(false)
const sizeData = ref<typeof props.variant.size>({ ...props.variant.size })
const isSizeValid = ref(true)

const formSchema = variantFormSchema

const { values, errors, validate, setErrors, setValues } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    color: props.variant.color.color,
    colorName: props.variant.color.name,
    stock_quantity: props.variant.stock_quantity.toString(),
  },
})

// reset form when dialog opens
watch(isOpen, (open) => {
  if (open) {
    validate()
    // Map sizeLetter to sizeLetters for clothing size component
    if (props.categoryName?.toUpperCase() === "CLOTHING") {
      const { sizeLetter, ...rest } = props.variant.size
      sizeData.value = {
        ...rest,
        sizeLetter,
      }
    } else if (props.categoryName?.toUpperCase() === "SHOES") {
      const { size, metric, ...rest } = props.variant.size
      sizeData.value = {
        ...rest,
        size,
        metric,
      }
    } else if (props.categoryName?.toUpperCase() === "ACCESSORIES") {
      const { customSize, ...rest } = props.variant.size
      sizeData.value = {
        ...rest,
        customSize,
      }
    } else if (props.categoryName?.toUpperCase() === "COSMETICS") {
      const { metric, size, customSize, ...rest } = props.variant.size
      sizeData.value = {
        ...rest,
        metric,
        size,
        customSize,
      }
    } else {
      sizeData.value = { ...props.variant.size }
    }
    isSizeValid.value = true
  }
})

// Watch for changes in the variant prop
watch(() => props.variant, (newVariant) => {
  if (isOpen.value) {
    validate()

    if (props.categoryName?.toUpperCase() === "CLOTHING") {
      const { sizeLetter, ...rest } = newVariant.size
      sizeData.value = {
        ...rest,
        sizeLetter,
      }
    } else if (props.categoryName?.toUpperCase() === "SHOES") {
      const { size, metric, ...rest } = newVariant.size
      sizeData.value = {
        ...rest,
        size,
        metric,
      }
    } else if (props.categoryName?.toUpperCase() === "ACCESSORIES") {
      const { customSize, ...rest } = newVariant.size
      sizeData.value = {
        ...rest,
        customSize,
      }
    } else if (props.categoryName?.toUpperCase() === "COSMETICS") {
      const { metric, size, customSize, ...rest } = newVariant.size
      sizeData.value = {
        ...rest,
        metric,
        size,
        customSize,
      }
    } else {
      sizeData.value = { ...newVariant.size }
    }
  }
}, { deep: true })

watch(() => values, (newValues) => {
  if (newValues.color === undefined) {
    setValues({
      ...newValues,
      color: props.variant.color.color,
    })
  }
  if (newValues.colorName === undefined) {
    setValues({
      ...newValues,
      colorName: props.variant.color.name,
    })
  }
  if (newValues.stock_quantity === undefined) {
    setValues({
      ...newValues,
      stock_quantity: props.variant.stock_quantity.toString(),
    })
  }
}, { deep: true })

function handleSizeValidation(isValid: boolean, data: { errors: Record<string, string | string[]>, values: any }) {
  isSizeValid.value = isValid
  if (!isValid) {
    const formattedErrors = Object.fromEntries(
      Object.entries(data.errors).map(([key, value]) => [key, Array.isArray(value) ? value : [value]]),
    )
    setErrors(formattedErrors)
  } else {
    // (redundant stuff here will figure out later)
    if (props.categoryName?.toUpperCase() === "CLOTHING") {
      const { sizeLetters, ...rest } = data.values
      sizeData.value = {
        ...rest,
        sizeLetter: sizeLetters,
      }
    } else if (props.categoryName?.toUpperCase() === "SHOES") {
      const { size, metric, ...rest } = data.values
      sizeData.value = {
        ...rest,
        size,
        metric,
      }
    } else if (props.categoryName?.toUpperCase() === "ACCESSORIES") {
      const { customSize, ...rest } = data.values
      sizeData.value = {
        ...rest,
        customSize,
      }
    } else if (props.categoryName?.toUpperCase() === "COSMETICS") {
      const { metric, size, customSize, ...rest } = data.values
      sizeData.value = {
        ...rest,
        metric,
        size,
        customSize,
      }
    } else {
      sizeData.value = data.values
    }
  }
}

const isFormValid = computed(() => {
  return Object.keys(errors.value).length === 0 && isSizeValid.value
})

async function handleSubmit() {
  const isValid = await validate()
  if (!isValid.valid || !isSizeValid.value) {
    return
  }

  try {
    isLoading.value = true
    const variant = {
      color: {
        name: values.colorName?.trim() || "",
        color: values.color || "#000000",
      },
      size: sizeData.value,
      stock_quantity: Number(values.stock_quantity),
    }

    const { buildUrl } = useApi()
    const response = await $fetch(buildUrl(`/products/variants/${props.variant.id}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variant),
    })

    if (response) {
      emit("update", response)
      toast({
        title: "Success",
        description: "Variant updated successfully",
      })
      isOpen.value = false
    }
  } catch (error: any) {
    console.error("Error updating variant:", error)
    toast({
      title: "Error",
      description: error?.message || "Failed to update variant",
      variant: "destructive",
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Dialog v-model="isOpen">
    <DialogTrigger as-child>
      <Button variant="outline">
        Edit
      </Button>
    </DialogTrigger>
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Variant</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Color Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">
            Color
          </h3>
          <div class="flex items-start space-x-4">
            <FormField v-slot="{ componentField }" name="color">
              <FormItem class="space-y-2">
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div class="size-14 rounded">
                    <Input
                      v-bind="componentField"
                      type="color"
                      class="w-full p-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <div class="flex-1 space-y-4">
              <FormField v-slot="{ componentField }" name="colorName">
                <FormItem class="space-y-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      placeholder="Enter color name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField v-slot="{ componentField }" name="stock_quantity">
                <FormItem class="space-y-2">
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </div>

        <!-- Size Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium">
            Size
          </h3>
          <ShoesSize
            v-if="categoryName?.toUpperCase() === 'SHOES'"
            :model-value="sizeData"
            @validated="handleSizeValidation"
          />
          <ClothingSize
            v-else-if="categoryName?.toUpperCase() === 'CLOTHING'"
            :model-value="sizeData"
            @validated="handleSizeValidation"
          />
          <CosmeticSize
            v-else-if="categoryName?.toUpperCase() === 'COSMETICS'"
            :model-value="sizeData"
            @validated="handleSizeValidation"
          />
          <AccessorySize
            v-else
            :model-value="sizeData"
            @validated="handleSizeValidation"
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            :disabled="isLoading"
            @click="isOpen = false"
          >
            Cancel
          </Button>
          <Button type="submit" :disabled="isLoading || !isFormValid">
            {{ isLoading ? "Saving..." : "Save Changes" }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
