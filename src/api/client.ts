import axios from 'axios';

const API_BASE_URL = '/api/v1'; // Assumes proxy or same domain

export const apiClient = {
  getStats: async (period = '7days', app = 'lens_manager') => {
    const response = await axios.get(`${API_BASE_URL}/stats.php?period=${period}&app=${app}`);
    return response.data;
  },
  getPhotographers: async (search = '', app = 'lens_manager') => {
    const response = await axios.get(`${API_BASE_URL}/photographers.php?search=${search}&app=${app}`);
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
    payment_method?: string,
    app?: string
  }) => {
    const app = data.app || 'lens_manager';
    const response = await axios.put(`${API_BASE_URL}/photographers.php?app=${app}`, data);
    return response.data;
  },
  getSubscriptions: async (app = 'lens_manager') => {
    const response = await axios.get(`${API_BASE_URL}/subscriptions.php?app=${app}`);
    return response.data;
  },
  recordSubscription: async (data: any, app = 'lens_manager') => {
    const response = await axios.post(`${API_BASE_URL}/subscriptions.php?app=${app}`, data);
    return response.data;
  },
  getAccessLevels: async (app = 'lens_manager') => {
    const response = await axios.get(`${API_BASE_URL}/access-levels.php?app=${app}`);
    return response.data;
  },
  updateAccessLevel: async (data: any, app = 'lens_manager') => {
    const response = await axios.put(`${API_BASE_URL}/access-levels.php?app=${app}`, data);
    return response.data;
  },
  createAccessLevel: async (data: any, app = 'lens_manager') => {
    const response = await axios.post(`${API_BASE_URL}/access-levels.php?app=${app}`, data);
    return response.data;
  },
  getUserDetails: async (id: number, app = 'lens_manager') => {
    const response = await axios.get(`${API_BASE_URL}/user_details.php?id=${id}&app=${app}`);
    return response.data;
  },
  getAccessLogs: async (app = 'calculator') => {
    const response = await axios.get(`${API_BASE_URL}/access-logs.php?app=${app}`);
    return response.data;
  },
  getEquipment: async () => {
    const response = await axios.get(`${API_BASE_URL}/equipment.php`);
    return response.data;
  },
  getEquipmentCategories: async () => {
    const response = await axios.get(`${API_BASE_URL}/equipment.php?categories=1`);
    return response.data;
  },
  getEquipmentTypes: async () => {
    const response = await axios.get(`${API_BASE_URL}/equipment.php?types=1`);
    return response.data;
  },
  createEquipment: async (data: any) => {
    const response = await axios.post(`${API_BASE_URL}/equipment.php`, data);
    return response.data;
  },
  updateEquipment: async (data: any) => {
    const response = await axios.put(`${API_BASE_URL}/equipment.php`, data);
    return response.data;
  },
  deleteEquipment: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/equipment.php`, { data: { id } });
    return response.data;
  }
};
