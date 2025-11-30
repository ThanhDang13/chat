import { MutationOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import {
  type LoginDTO,
  type LoginResponseDTO
} from "@api/modules/auth/application/commands/login/login.dto";

const login = async (data: { email: string; password: string }) => {
  const response = await axiosInstance.post<LoginResponseDTO>("auth/login", {
    ...data
  });
  return response.data;
};

export const createLoginMutationOptions = (): MutationOptions<
  LoginResponseDTO,
  Error,
  LoginDTO
> => {
  return {
    mutationKey: ["login"],
    mutationFn: async (data: LoginDTO) => {
      return await login(data);
    }
  };
};
