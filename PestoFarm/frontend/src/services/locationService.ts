import axios from 'axios';

const API_BASE_URL = 'http://localhost:5454'; // Update to match your backend URL

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

export interface LocationPreference {
  choice: 'allowWhileVisiting' | 'onlyThisTime' | 'dontAllow';
}

export interface SavedLocation extends LocationData {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedLocationPreference extends LocationPreference {
  id: number;
  userId: number;
  savedAt: string;
}

export const locationService = {
  saveLocation: async (location: LocationData): Promise<SavedLocation> => {
    const token = localStorage.getItem('jwt');
    const response = await axios.post(`${API_BASE_URL}/api/users/location`, location, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  },

  getLocation: async (): Promise<LocationData | null> => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_BASE_URL}/api/users/location`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No location saved yet
      }
      throw error;
    }
  },

  saveLocationPreference: async (preference: LocationPreference): Promise<SavedLocationPreference> => {
    const token = localStorage.getItem('jwt');
    const response = await axios.post(`${API_BASE_URL}/api/users/location-preference`, preference, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getLocationPreference: async (): Promise<LocationPreference | null> => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.get(`${API_BASE_URL}/api/users/location-preference`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No preference set yet
      }
      throw error;
    }
  },
};
