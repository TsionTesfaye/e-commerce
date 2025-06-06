<script lang="ts" setup>
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import * as z from "zod"

const props = defineProps<{
  modelValue?: {
    metric?: string
    size?: number
  }
}>()

const emit = defineEmits<{
  (event: "validated", isValid: boolean, data: { errors: Record<string, string[]>, values: { metric: string | undefined, size: number | undefined } }): void
}>()

const schema = z.object({
  metric: z.string().min(1, "Size standard is required"),
  sizeValue: z
    .union([
      z.number().positive("Size must be a positive number"),
      z.string().min(1, "Size is required"),
    ])
    .transform(val => (typeof val === "string" ? Number(val) || undefined : val)),
}).superRefine((data, ctx) => {
  if (!data.metric && data.sizeValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Size standard is required when size is provided",
      path: ["metric"],
    })
  }
  if (!data.sizeValue && data.metric) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Size is required when size standard is provided",
      path: ["sizeValue"],
    })
  }
})

const { validate, errors, values, handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    metric: props.modelValue?.metric || "",
    sizeValue: props.modelValue?.size?.toString() || "",
  },
})

const submit = handleSubmit(async () => {
  const isValid = await validate()
  emit("validated", isValid?.valid ?? false, {
    errors: Object.fromEntries(Object.entries(errors.value).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])),
    values: {
      metric: values.metric,
      size: typeof values.sizeValue === "string" ? Number(values.sizeValue) || undefined : values.sizeValue,
    },
  })
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    values.metric = newValue.metric || ""
    values.sizeValue = newValue.size?.toString() || ""
  }
}, { deep: true })

watch(() => ({ metric: values.metric, size: values.sizeValue }), async () => {
  const isValid = await validate()
  if (!isValid.valid) {
    emit("validated", isValid?.valid ?? false, {
      errors: Object.fromEntries(Object.entries(errors.value).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])),
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
          <FormField v-slot="{ componentField }" name="sizeValue" validate-on-blur>
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

<style>

</style>
