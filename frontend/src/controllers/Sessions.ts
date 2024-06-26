import {api} from './API';


export class Session {
  static _instance: Session;

  static get instance() {
    if (!this._instance) {
      this._instance = new Session();
    }
    return this._instance;
  }

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
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
}

export default new Session();