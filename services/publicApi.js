import axios from "axios";

// Public API service for calls that don't require authentication
const publicApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  timeout: 30000,
});

// Public GET helper (no auth headers)
export const publicApiGet = async (endpoint, params = {}) => {
  const response = await publicApi.get(endpoint, { params });
  return response.data;
};

// Public POST helper (no auth headers)
export const publicApiPost = async (endpoint, data = {}) => {
  const response = await publicApi.post(endpoint, data);
  return response.data;
};

export default publicApi;
