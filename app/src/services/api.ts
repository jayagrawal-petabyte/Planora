import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';
import { Platform } from 'react-native';

let API_URL = 'http://192.168.1.13:5000/api'; // Physical IP address

if (Platform.OS === 'web') {
  API_URL = 'http://localhost:5000/api';
} else {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const localhost = debuggerHost.split(':')[0];
    API_URL = `http://${localhost}:5000/api`;
  }
}
console.log("Connecting to API at:", API_URL);

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
