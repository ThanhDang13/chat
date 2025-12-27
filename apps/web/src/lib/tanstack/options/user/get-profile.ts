import { UseQueryOptions } from "@tanstack/react-query";
import axiosInstance from "@web/lib/axios/instance";
import { type GetProfileResponseDTO, type ProfileDTO } from "@api/modules/user/application/queries/get-profile/get-profile.dto";

const getProfile = async () => {
  const response = await axiosInstance.get<GetProfileResponseDTO>("users/profile");
  return response.data.payload;
};

export const createGetProfileQueryOptions = (): UseQueryOptions<
  ProfileDTO,
  Error,
  ProfileDTO,
  string[]
> => ({
  queryKey: ["profile"],
  queryFn: getProfile,
  staleTime: Infinity,
});
