import { api } from './API';

class Session {
  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  async login(username: string, password: string) {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return response.data;
      }
    } catch (error) {
      console.error('Error during login', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user', error);
      throw error;
    }
  }
}

export default new Session();