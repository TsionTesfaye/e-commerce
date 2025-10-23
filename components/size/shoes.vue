<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import { shoesSchema } from "~/schemas"

const props = defineProps<{
  modelValue?: {
    metric?: string
    size?: number
  }
}>()

const emit = defineEmits<{
  (event: "validated", isValid: boolean, data: { errors: Record<string, string[]>, 
    values: { metric: string | undefined, size: number | undefined } }): void
}>()

const schema = shoesSchema

const { validate, errors, values, handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    metric: props.modelValue?.metric || "",
    size: props.modelValue?.size?.toString() || "",
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
      size: typeof values.size === "string" ? Number(values.size) || undefined : values.size,
    },
  })
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    values.metric = newValue.metric || ""
    values.size = newValue.size?.toString() || ""
  }
}, { deep: true })

watch(() => ({ metric: values.metric, size: values.size }), async () => {
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
      },
    })
  }

  submit()
})
</script>

<script lang="ts">
export default {
  name: "ShoesSize",
}
</script>

<template>
  <div>
    <form class="mx-auto max-w-4xl  bg-white ">
      <h2 class="mb-4 text-xl font-semibold">
        Shoe Size
      </h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <FormField v-slot="{ componentField }" name="metric" validate-on-blur>
            <FormItem>
              <FormLabel>Size standard</FormLabel>

              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the standard for the size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="uk">
                      UK
                    </SelectItem>
                    <SelectItem value="us">
                      US
                    </SelectItem>
                    <SelectItem value="eu">
                      EU
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <div>
          <FormField v-slot="{ componentField }" name="size" validate-on-blur>
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter the size" v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </div>
    </form>
  </div>
</template>
