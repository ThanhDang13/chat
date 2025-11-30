import axiosInstance from "@web/lib/axios/instance";
import axios from "axios";
import { PresignedUrlResponseDTO } from "@api/modules/upload/application/commands/get-presigned-url/get-presigned-url.dto";

export async function uploadFile(file: File, folder?: string): Promise<string> {
  const { data } = await axiosInstance.post<PresignedUrlResponseDTO>("/uploads/presigned", {
    filename: file.name,
    contentType: file.type,
    folder: folder
  });

  const { uploadUrl, publicUrl } = data.payload;

  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type
    },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded / (e.total ?? 1)) * 100);
      console.log(`Uploading ${file.name}: ${percent}%`);
    }
  });

  return publicUrl;
}
