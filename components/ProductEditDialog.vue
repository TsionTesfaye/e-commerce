<script setup>

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["update"])

const dialog = ref(false)
const editedProduct = ref({})

watch(() => props.product, (newProduct) => {
  editedProduct.value = { ...newProduct }
}, { immediate: true })

function close() {
  dialog.value = false
}

function save() {
  emit("update", editedProduct.value)
  close()
}

// Expose open method to parent comp
defineExpose({
  open: () => {
    dialog.value = true
  },
})
</script>

<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template #activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
      >
        Edit Product
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span class="text-h5">Edit Product</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedProduct.name"
                label="Product Name"
                required
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="blue-darken-1" variant="text" @click="close">
          Cancel
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="save">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
