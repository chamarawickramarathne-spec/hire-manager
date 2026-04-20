import axios from 'axios';

const API_BASE_URL = '/api/v1'; // Assumes proxy or same domain

export const apiClient = {
  getStats: async (period = '7days') => {
    const response = await axios.get(`${API_BASE_URL}/stats.php?period=${period}`);
    return response.data;
  },
  getPhotographers: async (search = '') => {
    const response = await axios.get(`${API_BASE_URL}/photographers.php?search=${search}`);
    return response.data;
  },
  updatePhotographerPlan: async (data: { 
    id: number, 
    level_id: number, 
    expire_date?: string,
    status?: string,
    activation_date?: string,
    amount?: number,
    transaction_id?: string,
    payment_method?: string
  }) => {
    const response = await axios.put(`${API_BASE_URL}/photographers.php`, data);
    return response.data;
  },
  getSubscriptions: async () => {
    const response = await axios.get(`${API_BASE_URL}/subscriptions.php`);
    return response.data;
  },
  recordSubscription: async (data: any) => {
    const response = await axios.post(`${API_BASE_URL}/subscriptions.php`, data);
    return response.data;
  },
  getAccessLevels: async () => {
    const response = await axios.get(`${API_BASE_URL}/access-levels.php`);
    return response.data;
  },
  updateAccessLevel: async (data: any) => {
    const response = await axios.put(`${API_BASE_URL}/access-levels.php`, data);
    return response.data;
  },
  createAccessLevel: async (data: any) => {
    const response = await axios.post(`${API_BASE_URL}/access-levels.php`, data);
    return response.data;
  },
  getUserDetails: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/user_details.php?id=${id}`);
    return response.data;
  }
};
