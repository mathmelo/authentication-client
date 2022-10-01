import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../context/AuthContext';

const { 'auth.token': token } = parseCookies();
let isRefreshing = false;
let failedRequestsQueue = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${token}`
  }
});

type ErrorResponse = {
  code?: string;
}

api.interceptors.response.use((response) => {
  return response;
}, (error: AxiosError<ErrorResponse>) => {
  if (error.response.status === 401) {
    if (error.response.data?.code === 'token.expired') {
      const cookies = parseCookies();

      const { 'auth.refreshToken': refreshToken } = cookies;
      const originalRequestConfig = error.config;

      if (!isRefreshing) {
        isRefreshing = true;

        api.post('/refresh', {
          refreshToken,
        }).then(response => {
          const { token } = response.data;
  
          setCookie(undefined, 'auth.token', token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          });
    
          setCookie(undefined, 'auth.refreshToken', response.data.refreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          });
  
          api.defaults.headers['Authorization'] = `Bearer ${token}`;

          failedRequestsQueue.forEach(response => response.onSuccess(token));
          failedRequestsQueue = [];
        }).catch(err => {
          failedRequestsQueue.forEach(response => response.onFailure());
          failedRequestsQueue = [];
        }).finally(() => {
          isRefreshing = false;
        })
      }

      return new Promise(( resolve, reject ) => {
        failedRequestsQueue.push({
          onSuccess: (token: string) => { 
            originalRequestConfig.headers['Authorization'] = `Bearer ${token}`;

            resolve(api(originalRequestConfig))
          },
          onFailure: (error: AxiosError) => { reject(error) }
        })
      })
    } else {
      signOut()
    }
  }

  return Promise.reject(error)
})