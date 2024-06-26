import axios from 'axios';
import {QueryClient} from "react-query";
import {UserRole} from "../models/userRoleEnum";

export const baseURL = process.env.REACT_APP_API_URL
export const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);


export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            meta: {
                baseURL: baseURL,
                headers: api.defaults.headers,
            },
            queryFn: async ({queryKey}) => {
                let path: string = (queryKey[0] ?? '/users/me') as string;
                if(queryKey.length > 1) {
                    path = '/' + queryKey.join('/');
                }

                if(path[0] !== '/') {
                    path = '/' + path;
                }

                let response = await api.get(path);
                if(response.status === 200) {
                    let data = response.data;
                    if(path === '/users/me') {
                        if(data) {
                            data.role = UserRole[data.role as string as keyof typeof UserRole] as UserRole;
                        }
                    }

                    return data;
                } else {
                    throw new Error(response.data.detail);
                }
            }
        },
    },
});