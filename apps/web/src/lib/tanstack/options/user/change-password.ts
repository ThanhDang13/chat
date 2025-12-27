import { UseMutationOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import { type ChangePasswordBodyDTO, type ChangePasswordResponseDTO } from "@api/modules/user/application/commands/change-password/change-password.dto";

const changePassword = async (data: ChangePasswordBodyDTO) => {
  const response = await axiosInstance.patch<ChangePasswordResponseDTO>("users/password", {
    ...data,
  });
  return response.data;
};

export const createChangePasswordMutationOptions = (): UseMutationOptions<
  ChangePasswordResponseDTO,
  Error,
  ChangePasswordBodyDTO
> => {
  return {
    mutationKey: ["profile", "change-password"],
    mutationFn: async (data: ChangePasswordBodyDTO) => {
      return await changePassword(data);
    },
  };
};
