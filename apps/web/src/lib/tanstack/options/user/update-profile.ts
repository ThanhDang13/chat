import { UseMutationOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import { type UpdateProfileBodyDTO, type UpdateProfileResponseDTO } from "@api/modules/user/application/commands/update-profile/update-profile.dto";

const updateProfile = async (data: UpdateProfileBodyDTO) => {
  const response = await axiosInstance.patch<UpdateProfileResponseDTO>("users/profile", {
    ...data,
  });
  return response.data;
};

export const createUpdateProfileMutationOptions = (): UseMutationOptions<
  UpdateProfileResponseDTO,
  Error,
  UpdateProfileBodyDTO
> => {
  return {
    mutationKey: ["profile", "update"],
    mutationFn: async (data: UpdateProfileBodyDTO) => {
      return await updateProfile(data);
    },
  };
};
