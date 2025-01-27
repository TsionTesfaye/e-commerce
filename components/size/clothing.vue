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
        Clothing Size
      </h2>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
        <FormField v-slot="{ componentField }" name="sizeLetters">
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

        <FormField v-slot="{ componentField }" name="bust">
          <FormItem>
            <FormLabel>Bust (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the bust size" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="waist">
          <FormItem>
            <FormLabel>Waist (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the waist size" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="hips">
          <FormItem>
            <FormLabel>Hips (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the hips size" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="length">
          <FormItem>
            <FormLabel>Length (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the length" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="sleeve">
          <FormItem>
            <FormLabel>Sleeve Length (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the length of the sleeve" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
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
