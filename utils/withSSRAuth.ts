import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import decode from 'jwt-decode';
import { validateUserPermissions } from "./validateUserPermissions";
import { AuthTokenError } from "../services/errors/AuthTokenError";

interface IOptionsProps {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options: IOptionsProps) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['auth.token'];

    if (!cookies['auth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    if(options) {
      const user = decode<{ permissions: string[], roles: string[] }>(token);
      const { permissions, roles } = options;
  
      const userHasValidPermissions = validateUserPermissions({ 
        permissions, 
        roles, 
        user 
      });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
        }
      }
    }
    
    try {
      return await fn(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, 'auth.refreshToken');
        destroyCookie(ctx, 'auth.token');
  
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }
  }
}