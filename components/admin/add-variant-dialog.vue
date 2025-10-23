<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import AccessorySize from "@/components/size/accessory.vue"
import ClothingSize from "@/components/size/clothing.vue"
import CosmeticSize from "@/components/size/cosmetic.vue"
import ShoesSize from "@/components/size/shoes.vue"
import { useToast } from "@/components/ui/toast"
import { variantFormSchema } from "~/schemas"

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(["update"])

const { toast } = useToast()
const isOpen = ref(false)
const isLoading = ref(false)
const sizeData = ref({})
const isSizeValid = ref(false)
const formSchema = variantFormSchema

const { values, errors, validate, setErrors } = useForm({
  validationSchema: toTypedSchema(formSchema),
})

// Reset form when dialog opens
watch(isOpen, async (open) => {
  if (open) {
    await validate()
    sizeData.value = {}
    isSizeValid.value = false
  }
})

function handleSizeValidation(isValid: boolean, data: { errors: Record<string, string | string[]>, values: any }) {
  isSizeValid.value = isValid
  if (!isValid) {
    const formattedErrors = Object.fromEntries(
      Object.entries(data.errors).map(([key, value]) => [key, Array.isArray(value) ? value : [value]]),
    )
    setErrors(formattedErrors)
  } else {
    sizeData.value = data.values
  }
}

const isFormValid = computed(() => {
  return Object.keys(errors.value).length === 0 && isSizeValid.value
})

async function onSubmit() {
  const isValid = await validate()
  if (!isValid.valid || !isSizeValid.value) {
    return
  }

  if (!values.colorName?.trim()) {
    toast({
      title: "Error",
      description: "Color name is required",
      variant: "destructive",
    })
    return
  }

  try {
    isLoading.value = true
    const variant = {
      product_id: props.productId,
      color: {
        name: values.colorName?.trim() || "",
        color: values.color || "#000000",
      },
      size: sizeData.value,
      stock_quantity: Number(values.stock_quantity),
    }

    const { baseUrl } = useApi()
    const response = await $fetch(`${baseUrl}/products/variants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variant),
    })

    if (response) {
      emit("update", response)
      toast({
        title: "Success",
        description: "Variant added successfully",
      })
      isOpen.value = false
    }
  } catch (error: any) {
    console.error("Error adding variant:", error)
    toast({
      title: "Error",
      description: error?.message || "Failed to add variant",
      variant: "destructive",
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <!-- using v-model:open for dialog due to shadcn internal issue for v-model, do not remove before checking if they have fixed -->
    <DialogTrigger as-child>
      <Button variant="default">
        Add Variant
      </Button>
    </DialogTrigger>
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Variant</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit.prevent="onSubmit">
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
            @validated="handleSizeValidation"
          />
          <ClothingSize
            v-else-if="categoryName?.toUpperCase() === 'CLOTHING'"
            @validated="handleSizeValidation"
          />
          <CosmeticSize
            v-else-if="categoryName?.toUpperCase() === 'COSMETICS'"
            @validated="handleSizeValidation"
          />
          <AccessorySize
            v-else
            @validated="handleSizeValidation"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="isOpen = false">
            Cancel
          </Button>
          <Button type="submit" :disabled="isLoading || !isFormValid">
            {{ isLoading ? "Adding..." : "Add Variant" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
