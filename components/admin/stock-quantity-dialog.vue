<script setup lang="ts">
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { ref } from "vue"

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

// Reset stock quantity when dialog opens
watch(isOpen, (open) => {
  if (open) {
    stockQuantity.value = props.variant.stock_quantity
  }
})

async function handleSubmit() {
  try {
    isLoading.value = true
    const response = await $fetch(`https://online-shop-1-afra.onrender.com/products/variants/stock-quantity/${props.variant.id}`, {
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
