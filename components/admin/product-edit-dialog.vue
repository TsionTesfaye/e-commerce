<script setup lang="ts">
import type { ProductDetail } from "~/types/product"
import { useToast } from "@/components/ui/toast"


const props = defineProps({
  product: {
    type: Object as () => ProductDetail,
    required: true,
  },
})

const emit = defineEmits(["update"])
const { toast } = useToast()
const isOpen = ref(false)
const isLoading = ref(false)

// Initialize form data with current product values
const formData = ref({
  name: props.product.name,
  brand: props.product.brand,
  description: props.product.description,
  material: props.product.material,
  price: props.product.price,
})

// Reset form data when dialog opens
watch(isOpen, (open) => {
  if (open) {
    formData.value = {
      name: props.product.name,
      brand: props.product.brand,
      description: props.product.description,
      material: props.product.material,
      price: props.product.price,
    }
  }
})

async function handleSubmit() {
  try {
    isLoading.value = true
    const { baseUrl } = useApi()
    const endpoint = props.product.status === "DRAFT"
      ? `${baseUrl}/products/edit/draft/${props.product.id}`
      : `${baseUrl}/products/edit/offline/${props.product.id}`

    const dataToSend = {
      ...formData.value,
      price: Number(formData.value.price),
    }
    const response = await $fetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify(dataToSend),
    })

    if (response) {
      emit("update", response)
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      isOpen.value = false
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.message || "Failed to update product",
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
      <Button variant="outline">
        Edit Product
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Product</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Name -->
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            v-model="formData.name"
            required
          />
        </div>

        <!-- Brand -->
        <div class="space-y-2">
          <Label for="brand">Brand</Label>
          <Input
            id="brand"
            v-model="formData.brand"
            required
          />
        </div>

        <!-- Price -->
        <div class="space-y-2">
          <Label for="price">Price</Label>
          <Input
            id="price"
            v-model="formData.price"
            type="number"
            step="0.01"
            required
          />
        </div>

        <!-- Material -->
        <div class="space-y-2">
          <Label for="material">Material</Label>
          <Input
            id="material"
            v-model="formData.material"
          />
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            required
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            :disabled="isLoading"
            @click="isOpen = false"
          >
            Cancel
          </Button>
          <Button type="submit" :disabled="isLoading">
            <span v-if="isLoading">Saving...</span>
            <span v-else>Save</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
