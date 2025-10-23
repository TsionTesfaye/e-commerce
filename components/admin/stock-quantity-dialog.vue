<script setup lang="ts">
import { useToast } from "@/components/ui/toast"


const props = defineProps({
  variant: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["update"])

const { toast } = useToast()
const isOpen = ref(false)
const isLoading = ref(false)
const stockQuantity = ref(props.variant.stock_quantity)

// reset stock quantity when dialog opens
watch(isOpen, (open) => {
  if (open) {
    stockQuantity.value = props.variant.stock_quantity
  }
})

async function handleSubmit() {
  try {
    isLoading.value = true
    const { buildUrl } = useApi()
    const response = await $fetch(buildUrl(`/products/variants/stock-quantity/${props.variant.id}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stock_quantity: Number(stockQuantity.value),
      }),
    })

    if (response) {
      emit("update", response)
      toast({
        title: "Success",
        description: "Stock quantity updated successfully",
      })
      isOpen.value = false
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.message || "Failed to update stock quantity",
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
      <Button variant="outline" size="sm">
        Edit Stock
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Stock Quantity</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="stock">Stock Quantity</Label>
          <Input
            id="stock"
            v-model="stockQuantity"
            type="number"
            min="0"
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
