<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { cosmeticSchema } from "~/schemas"

const props = defineProps<{
  modelValue?: {
    metric?: string
    size?: number
    customSize?: string
  }
}>()

const emit = defineEmits<{
  (event: "validated", isValid: boolean, data: { errors: Record<string, string[]>, 
    values: { metric: string | undefined, size: number | undefined, customSize: string | undefined } }): void
}>()

const schema = cosmeticSchema

const { validate, errors, values, handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    metric: props.modelValue?.metric,
    size: props.modelValue?.size,
    customSize: props.modelValue?.customSize,
  },
})

const submit = handleSubmit(async () => {
  const isValid = await validate()
  emit("validated", isValid?.valid ?? false, {
    errors: Object.fromEntries(
      Object.entries(errors.value)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)]),
    ),
    values: {
      metric: values.metric,
      size: values.size === "" ? undefined : values.size,
      customSize: values.customSize,
    },
  })
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    values.metric = newValue.metric
    values.size = newValue.size
    values.customSize = newValue.customSize
  }
}, { immediate: true })

watch(() => ({ metric: values.metric, size: values.size, customSize: values.customSize }), async () => {
  const isValid = await validate()
  if (!isValid.valid) {
    emit("validated", isValid?.valid ?? false, {
      errors: Object.fromEntries(
        Object.entries(errors.value)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)]),
      ),
      values: {
        metric: undefined,
        size: undefined,
        customSize: undefined,
      },
    })
  }
  submit()
})
</script>

<script lang="ts">
export default {
  name: "CosmeticSize",
}
</script>

<template>
  <div>
    <form class="mx-auto max-w-4xl  bg-white ">
      <h2 class="mb-4 text-xl font-semibold">
        Consmetic Size
      </h2>
      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="{ componentField }" name="metric" validate-on-blur>
          <FormItem>
            <FormLabel>Size metric</FormLabel>

            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select the metric of the size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="mL">
                    mL
                  </SelectItem>
                  <SelectItem value="g">
                    g
                  </SelectItem>
                  <SelectItem value="oz">
                    OZ
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="size" validate-on-blur>
          <FormItem>
            <FormLabel>Size Value</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the size" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <FormField v-slot="{ componentField }" name="customSize" validate-on-blur>
        <FormItem class="w-full">
          <FormLabel>Custom Size</FormLabel>
          <FormControl class="w-full">
            <Input type="text" placeholder="Enter custom size if any" v-bind="componentField" class="w-full" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </form>
  </div>
</template>

<style>

</style>
