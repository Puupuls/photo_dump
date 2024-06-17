import { useLocalStorage } from '@uidotdev/usehooks';
import { api } from './API';
import {UserType} from "../models/userType";
import {useEffect, useState} from "react";
import {UserRole} from "../models/userRoleEnum";

export class Session {
  static _instance: Session;
  _user: any;

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

  async getCurrentUser(): Promise<UserType|null> {
    try {
      if (!localStorage.getItem('token')) {
        return null;
      }
      if(this._user) {
        return this._user;
      } else {
        const response = await api.get('/users/me');
        this._user = response.data;
        return response.data;
      }
    } catch (error) {
      console.error('Error getting current user', error);
      throw error;
    }
  }
}

export const useUser = () => {
  const [user, setUser] = useState<UserType>()
  useEffect(() => {
    Session.instance.getCurrentUser().then((user) => {
      if(user) {
        user.role = UserRole[user.role as string as keyof typeof UserRole] as UserRole;
        setUser(user)
      }
    });
  }, []);
  return user;
}

export default new Session();