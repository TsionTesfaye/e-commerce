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
