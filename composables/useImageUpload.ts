import { useToast } from "@/components/ui/toast"


//not used rn but will finish up changing the function in admin to composable here
export function useImageUpload() {
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

  const images = ref<{ file: File, url: string }[]>([])

  const handleImageUpload = (event: Event) => {
    const files = Array.from((event.target as HTMLInputElement)?.files || [])
    const { toast } = useToast()

    if (files.length + images.value.length > 5) {
      return toast({
        title: "Error",
        description: "You can only upload a maximum of 5 images",
        variant: "destructive",
      })
    }

    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }))

    images.value = [
      ...images.value,
      ...newImages,
    ].slice(0, 5)
  }

  const removeImage = (index: number) => {
    const removedImage = images.value[index]
    URL.revokeObjectURL(removedImage.url)
    images.value.splice(index, 1)
  }

  const triggerFileInput = async (fileInput: Ref<HTMLInputElement | null>) => {
    await nextTick()
    const input = fileInput.value

    if (input instanceof HTMLInputElement) {
      input.click()
    } else {
      console.error("File input is not ready yet.")
    }
  }

  const validateImage = (file: File): boolean => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      return false
    }
    return true
  }

  return {
    images: readonly(images),
    handleImageUpload,
    removeImage,
    triggerFileInput,
    validateImage,
    MAX_FILE_SIZE,
    ACCEPTED_IMAGE_TYPES,
  }
}
