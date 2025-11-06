import { useMutation } from "@tanstack/react-query"
import { uploadApi } from "../api/upload"

type UploadType = "image" | "document" | "video"

export const useUploadFile = () => {
  const mutation = useMutation({
    mutationFn: async ({
      file,
      type,
    }: {
      file: any
      type?: UploadType
    }) => {
      console.log("📤 Uploading:", { file, type })
      switch (type) {
        case "document":
          return await uploadApi.uploadDocument(file)
        case "video":
          return await uploadApi.uploadVideo(file)
        default:
          return await uploadApi.uploadImage(file)
      }
    },
  })

  const uploadFile = async (file: any, type: UploadType = "image") => {
    const res = await mutation.mutateAsync({ file, type })
    if (res.isSuccess && res.result) {
      return res.result
    }
    throw new Error(res.errorMessages?.[0] || "Upload failed")
  }

  return {
    uploadFile,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    result:
      mutation.data?.isSuccess && mutation.data?.result
        ? mutation.data.result
        : null,
  }
}
