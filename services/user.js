import { apiGet } from "@/lib/api";

export const getuserdatabyfirebaseid = async (userId) => {
  const response = await apiGet(`/auth/getuserdatabyfirebaseid/${userId}`);
  return response?.data;
};
