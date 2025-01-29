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

const schema = z.object({
  metric: z.string().nonempty(),
  sizeValue: z
    .union([
      z.number().positive("Size must be a positive number"),
      z.string().trim().length(0), // Allow empty string but check later
    ])
    .refine(value => value !== "", {
      message: "Size is required",
    })
}).superRefine((data, ctx) => {
  if (!data.metric  && (data.sizeValue !== undefined && data.sizeValue !== "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Metric is required when size value is provided",
      path: ["metric"],
    })
    if (!data.sizeValue  && data.metric !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Size value is required when metric is provided",
        path: ["sizeValue"],
      })
    }
  }
 
})

const {validate, errors, values, handleSubmit} = useForm({
  validationSchema: toTypedSchema(schema),
})
const emit = defineEmits<{
  (event: "validated", isValid: boolean, data: { errors: Record<string, string[]>; values: { metric: string | undefined; size: number|undefined } }): void;
}>();

const submit = handleSubmit(async () => {
  const isValid = await validate()
  emit("validated", isValid?.valid ?? false, {
    errors: Object.fromEntries(Object.entries(errors.value).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])),
    values: {
      metric: values.metric,
      size: values.sizeValue === "" ? undefined : values.sizeValue,
      
    },
  })
})

watch(() => ({ metric: values.metric, size: values.sizeValue}), async () => {
  const isValid = await validate()
  if (!isValid.valid){
    emit("validated", isValid?.valid ?? false, {
      errors: Object.fromEntries(Object.entries(errors.value).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])),
      values: {
        metric: undefined,
        size: undefined
        
      },
    })
  }

 submit()
 
 
 
})
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
                <Input type="number"  placeholder="Enter the size" v-bind="componentField" class="w-full" />
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
