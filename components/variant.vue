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
import { Textarea } from "@/components/ui/textarea"
import { toTypedSchema } from "@vee-validate/zod"
import { useForm } from "vee-validate"
import * as z from "zod"
import accessory from "~/components/size/accessory.vue"
import clothing from "~/components/size/clothing.vue"
import cosmetic from "~/components/size/cosmetic.vue"
import shoes from "~/components/size/shoes.vue"

</script>


<template>
  <div>
    <form class="mx-auto max-w-4xl  bg-white ">
      <FormField v-slot="{ componentField }" name="price">
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter the Price of the product" v-bind="componentField" class="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <div class="mb-8">
          <h2 class="mb-4 text-xl font-semibold">
            Color / Pattern
          </h2>
          <div class="mb-4 flex space-x-4">
            <FormField v-slot="{ componentField }" type="radio" name="colorOrPattern">
              <FormItem class="space-y-3">
                <FormControl>
                  <RadioGroup
                    class="flex  space-y-1"
                    v-bind="componentField"
                  >
                    <FormItem class="flex items-center gap-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="solidColor" />
                      </FormControl>
                      <FormLabel class="font-normal">
                        Solid Color
                      </FormLabel>
                    </FormItem>
                    <FormItem class="flex items-center gap-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="pattern" />
                      </FormControl>
                      <FormLabel class="font-normal">
                        Pattern thumbnail
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
          <div class="mb-8  flex space-x-4">
            <FormField v-slot="{ componentField }" name="color">
              <FormItem class="size-12 rounded ">
                <FormLabel>Color</FormLabel>
                <FormControl class="p-1">
                  <Input type="color" placeholder="Enter the name of the product" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="colorName">
              <FormItem class="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl class="w-full">
                  <Input type="text" placeholder="Enter the name of the Color" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
          <FormField v-slot="{ componentField }" name="stock">
              <FormItem>
                <FormLabel>Stock Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter the stock of the product" v-bind="componentField" class="w-full" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
        </div>


      </form>

    
  </div>
</template>


<style>

</style>