import axios from "@/lib/axiosConfig";
import { getAuth } from "firebase/auth";

// API helper functions
export const apiGet = async (endpoint, params = {}) => {
  // Fallback: ensure Authorization-Token header is present
  const config = { params, headers: {} };
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    if (token) config.headers["Authorization-Token"] = token;
  }
  const response = await axios.get(endpoint, config);
  return response.data;
};

export const apiPost = async (endpoint, data = {}) => {
  const response = await axios.post(endpoint, data);
  return response.data;
};

export const apiPostFormData = async (endpoint, formData) => {
  const response = await axios.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const apiPut = async (endpoint, data = {}) => {
  const response = await axios.put(endpoint, data);
  // eslint-disable-next-line no-console
  console.log(response);
  return response.data;
};

export const apiPutFormData = async (endpoint, formData) => {
  const response = await axios.put(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const apiPatch = async (endpoint, data = {}) => {
  const response = await axios.patch(endpoint, data);
  return response.data;
};

export const apiDelete = async (endpoint, data = null) => {
  const config = data ? { data } : {};
  const response = await axios.delete(endpoint, config);
  return response.data;
};

// export default axios;
