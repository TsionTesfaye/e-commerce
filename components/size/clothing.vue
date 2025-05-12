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
    sizeLetter?: string
    bust?: number
    waist?: number
    hips?: number
    length?: number
    sleeve?: number
    fit?: string
    customSize?: string
  }
}>()

const emit = defineEmits<{
  (event: "validated", isValid: boolean, data: { errors: Record<string, string[]>, values: { sizeLetter: string | undefined; bust: number | undefined; waist: number | undefined; hips: number | undefined
  ; length: number | undefined; sleeve: number | undefined; fit: string | undefined; customSize: string | undefined, } }): void
}>()

const schema = z.object({
  sizeLetters: z.string({ required_error: "Size letter is required" }).nonempty("Size letter is required"),
  bust: z.union([
    z.number({
      invalid_type_error: "Bust size must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  waist: z.union([
    z.number({
      invalid_type_error: "Waist Size must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  hips: z.union([
    z.number({
      invalid_type_error: "Hips size must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  length: z.union([
    z.number({
      invalid_type_error: "Length must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  sleeve: z.union([
    z.number({
      invalid_type_error: "Sleeve length must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  fit: z.string().optional(),
  customSize: z.string().optional(),
})

const { validate, errors, values, handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    sizeLetters: props.modelValue?.sizeLetter || "",
    bust: props.modelValue?.bust || "",
    waist: props.modelValue?.waist || "",
    hips: props.modelValue?.hips || "",
    length: props.modelValue?.length || "",
    sleeve: props.modelValue?.sleeve || "",
    fit: props.modelValue?.fit || "",
    customSize: props.modelValue?.customSize || "",
  },
})

const submit = handleSubmit(async () => {
  const isValid = await validate()
  emit("validated", isValid.valid, {
    errors: Object.fromEntries(Object.entries(errors.value).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])),
    values: {
      sizeLetter: values.sizeLetters!,
      bust: values.bust === "" ? undefined : values.bust,
      waist: values.waist === "" ? undefined : values.waist,
      hips: values.hips === "" ? undefined : values.hips,
      length: values.length === "" ? undefined : values.length,
      sleeve: values.sleeve === "" ? undefined : values.sleeve,
      fit: values.fit,
      customSize: values.customSize,
    },
  })
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    values.sizeLetters = newValue.sizeLetter || ""
    values.bust = newValue.bust || ""
    values.waist = newValue.waist || ""
    values.hips = newValue.hips || ""
    values.length = newValue.length || ""
    values.sleeve = newValue.sleeve || ""
    values.fit = newValue.fit || ""
    values.customSize = newValue.customSize || ""
  }
}, { deep: true })

watch(() => ({ sizeLetter: values.sizeLetters, bust: values.bust, waist: values.waist, hips: values.hips, length: values.length, sleeve: values.sleeve, fit: values.fit, customSize: values.customSize }), async () => {
  const isValid = await validate()
  if (!isValid.valid) {
    emit("validated", isValid.valid, {
      errors: Object.fromEntries(Object.entries(errors.value).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])),
      values:
      {
        sizeLetter: undefined,
        bust: undefined,
        waist: undefined,
        hips: undefined,
        length: undefined,
        sleeve: undefined,
        fit: undefined,
        customSize: undefined,
      },
    })
  }
  submit()
})
</script>

<script lang="ts">
export default {
  name: "ClothingSize",
}
</script>

<template>
  <div>
    <form class="mx-auto max-w-4xl  bg-white ">
      <h2 class="mb-4 text-xl font-semibold">
        Clothing Size
      </h2>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
        <FormField v-slot="{ componentField }" name="sizeLetters" validate-on-blur>
          <FormItem>
            <FormLabel>Basic size</FormLabel>

            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="xs">
                    XS
                  </SelectItem>
                  <SelectItem value="s">
                    S
                  </SelectItem>
                  <SelectItem value="m">
                    M
                  </SelectItem>
                  <SelectItem value="l">
                    L
                  </SelectItem>
                  <SelectItem value="xl">
                    Xl
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="bust" validate-on-blur>
          <FormItem>
            <FormLabel>Bust (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the bust size" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="waist" validate-on-blur>
          <FormItem>
            <FormLabel>Waist (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the waist size" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="hips" validate-on-blur>
          <FormItem>
            <FormLabel>Hips (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the hips size" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="length" validate-on-blur>
          <FormItem>
            <FormLabel>Length (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the length" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="sleeve" validate-on-blur>
          <FormItem>
            <FormLabel>Sleeve Length (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the length of the sleeve" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="fit" validate-on-blur>
          <FormItem class="w-full">
            <FormLabel>Fit Type</FormLabel>
            <FormControl class="w-full">
              <Input type="text" placeholder="Enter the fit type" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
      <FormField v-slot="{ componentField }" name="customSize" validate-on-blur>
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
