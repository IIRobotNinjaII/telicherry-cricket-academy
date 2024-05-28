import axios from 'axios';
import { doGetIdToken } from "../firebase/auth";

const getIdToken = async () => {

  const token = doGetIdToken();
  if (token) {
    return token;
  }
  throw new Error('User not authenticated');
};

const axiosWithAuth = axios.create({
  baseURL: 'https://asia-south1-tellicherry-cricket-academy.cloudfunctions.net/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add Firebase ID token to requests
axiosWithAuth.interceptors.request.use(async config => {
  const idToken = await getIdToken();
  config.headers.Authorization = `Bearer ${idToken}`;
  return config;
}, error => {
  return Promise.reject(error);
});

const makeRequest = async (method, endpoint, data = null) => {
  try {
    if (method === 'DELETE'){
      const response = await axiosWithAuth({
        method: method,
        url: endpoint,
      });
      return response;
    }
    const response = await axiosWithAuth({
      method: method,
      url: endpoint,
      data: data
    });
    return response;
  } catch (error) {
    console.error(`Error making ${method} request to ${endpoint}:`, error);
    throw error;
  }
};

export default makeRequest;
