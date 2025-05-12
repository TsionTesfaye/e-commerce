<script setup lang="ts">
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { z } from "zod"

const props = defineProps<{
  modelValue: {
    customSize?: string
  }
}>()

const emit = defineEmits<{
  "update:modelValue": [value: {
    customSize?: string
  }]
}>()

const formSchema = z.object({
  customSize: z.string().optional(),
})

const form = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: props.modelValue,
})

watch(() => props.modelValue, (newValue) => {
  form.resetForm({ values: newValue })
}, { deep: true })

watch(() => form.values, (newValue) => {
  emit("update:modelValue", newValue)
}, { deep: true })
</script>

<script lang="ts">
export default {
  name: "AccessoriesSize",
}
</script>

<template>
  <Form>
    <form class="grid gap-4">
      <FormField v-slot="{ componentField }" name="customSize">
        <FormItem class="space-y-2">
          <FormLabel>Custom Size</FormLabel>
          <FormControl>
            <Input
              v-bind="componentField"
              placeholder="Enter custom size"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </form>
  </Form>
</template>
