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
  sizeValue: z.number({required_error: 'Size is Required'}).positive(),
})

const {validate, errors, values} = useForm({
  validationSchema: toTypedSchema(schema),
})
const emit = defineEmits<{
  (event: "validated", isValid: boolean, data: { errors: Record<string, string[]>; values: { metric: string | undefined; size: number|undefined } }): void;
}>();

watch(() => ({ metric: values.metric, size: values.sizeValue }), async () => {
  const isValid = await validate();
  emit("validated", isValid.valid, {
    errors: Object.fromEntries(Object.entries(errors.value).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])),
    values: {
      metric: values.metric ,
      size: values.sizeValue,
    },
  });
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
