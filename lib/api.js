import axios from "@/lib/axiosConfig";
import { getAuth } from "firebase/auth";

// API helper functions
export const apiGet = async (endpoint, params = {}) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

export const apiPost = async (endpoint, data = {}) => {
  try {
    const response = await axios.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiPostFormData = async (endpoint, formData) => {
  try {
    const response = await axios.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiPut = async (endpoint, data = {}) => {
  try {
    const response = await axios.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiPutFormData = async (endpoint, formData) => {
  try {
    const response = await axios.put(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiPatch = async (endpoint, data = {}) => {
  try {
    const response = await axios.patch(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiDelete = async (endpoint) => {
  try {
    const response = await axios.delete(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export default axios;
