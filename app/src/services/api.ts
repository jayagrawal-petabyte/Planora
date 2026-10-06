import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use standard local IP for Android emulator to host machine, 
// or the machine's actual IP if testing on a physical device.
// localhost doesn't work for android emulator. 10.0.2.2 points to host.
const API_URL = 'http://10.0.2.2:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from SecureStore', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let unauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  unauthorizedCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network Error Handling
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Expired-token / Unauthorized handling
    if (error.response.status === 401) {
      try {
        await SecureStore.deleteItemAsync('token');
      } catch (e) {}
      if (unauthorizedCallback) {
        unauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
