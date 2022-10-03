import { GetServerSidePropsContext } from 'next';
import axios, { AxiosError } from 'axios'
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../context/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

type ErrorResponse = {
  code?: string;
}

let isRefreshing = false;
let failedRequestsQueue = [];

export function setupApiClient(ctx: GetServerSidePropsContext = undefined) {
  const { 'auth.token': token } = parseCookies(ctx);

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  api.interceptors.response.use((response) => {
    return response;
  }, (error: AxiosError<ErrorResponse>) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        const { 'auth.refreshToken': refreshToken } = parseCookies(ctx);
  
        const originalRequestConfig = error.config;
  
        if (!isRefreshing) {
          isRefreshing = true;
  
          api.post('/refresh', {
            refreshToken,
          }).then(response => {
            const { token } = response.data;
    
            setCookie(ctx, 'auth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            });
      
            setCookie(ctx, 'auth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            });
    
            api.defaults.headers['Authorization'] = `Bearer ${token}`;
  
            failedRequestsQueue.forEach(response => response.onSuccess(token));
            failedRequestsQueue = [];
          }).catch(err => {
            failedRequestsQueue.forEach(response => response.onFailure(err));
            failedRequestsQueue = [];
  
            if (typeof window !== 'undefined') {
              signOut();
            }
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
        if (typeof window !== 'undefined') {
          signOut();
        } else {
          return Promise.reject(new AuthTokenError())
        }
      }
    }
  
    return Promise.reject(error)
  }) 

  return api;
};
