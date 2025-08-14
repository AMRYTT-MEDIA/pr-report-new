import api from "../lib/api";

export const getuserdatabyfirebaseid = async (userId) => {
  const user = await api.get(`/auth/getuserdatabyfirebaseid/${userId}`);
  return user.data;
};
