import { MutationOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import {
  SignupResponse,
  type SignupDTO
} from "@api/modules/auth/application/commands/signup/signup.dto";

const login = async (data: { email: string; password: string }) => {
  const response = await axiosInstance.post<SignupResponse>("auth/signup", {
    ...data
  });
  return response.data;
};

export const createSignupMutationOptions = (): MutationOptions<
  SignupResponse,
  unknown,
  SignupDTO
> => {
  return {
    mutationKey: ["login"],
    mutationFn: (data: SignupDTO) => login(data)
  };
};
