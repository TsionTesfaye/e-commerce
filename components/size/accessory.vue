<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { accessorySchema } from "~/schemas"

const props = defineProps<{
  modelValue?: {
    customSize?: string
  }
}>()

const emit = defineEmits<{
  (event: "validated", isValid: boolean, data: { errors: Record<string, string[]>,
   values: { customSize: string | undefined } }): void
}>()

const schema = accessorySchema

const { validate, errors, values, handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    customSize: props.modelValue?.customSize,
  },
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    values.customSize = newValue.customSize || ""
  }
}, { deep: true })

const submit = handleSubmit(async () => {
  const isValid = await validate()
  emit("validated", isValid?.valid ?? false, {
    errors: Object.fromEntries(
      Object.entries(errors.value)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)]),
    ),
    values: {
      customSize: values.customSize,
    },
  })
})

watch(() => ({ customSize: values.customSize }), async () => {
  const isValid = await validate()
  if (!isValid.valid) {
    emit("validated", isValid?.valid ?? false, {
      errors: Object.fromEntries(
        Object.entries(errors.value)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)]),
      ),
      values: {
        customSize: undefined,
      },
    })
  }
  submit()
})
</script>

<script lang="ts">
export default {
  name: "AccessorySize",
}
</script>

<template>
  <div>
    <form class="mx-auto max-w-4xl  bg-white ">
      <h2 class="mb-4 text-xl font-semibold">
        Accessory Size
      </h2>
      <FormField v-slot="{ componentField }" name="customSize">
        <FormItem class="w-full">
          <FormLabel>Custom Size</FormLabel>
          <FormControl class="w-full">
            <Input type="text" placeholder="Enter the custom size if any" v-bind="componentField" class="w-full" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </form>
  </div>
</template>

<style>

</style>
