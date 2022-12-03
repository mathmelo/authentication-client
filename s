warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/context/AuthContext.tsx b/context/AuthContext.tsx[m
[1mindex 18aeb19..f34efa4 100644[m
[1m--- a/context/AuthContext.tsx[m
[1m+++ b/context/AuthContext.tsx[m
[36m@@ -25,7 +25,7 @@[m [mtype AuthContextData = {[m
   signIn(credentials: SignInInputData): Promise<void>[m
 };[m
 [m
[31m-const AuthContext = createContext({} as AuthContextData);[m
[32m+[m[32mexport const AuthContext = createContext({} as AuthContextData);[m[41m[m
 [m
 export function signOut() {[m
   destroyCookie(undefined, 'auth.token');[m
[1mdiff --git a/package.json b/package.json[m
[1mindex e1f773a..d028ebc 100644[m
[1m--- a/package.json[m
[1m+++ b/package.json[m
[36m@@ -10,6 +10,7 @@[m
   },[m
   "dependencies": {[m
     "axios": "^0.27.2",[m
[32m+[m[32m    "jwt-decode": "^3.1.2",[m
     "next": "12.3.1",[m
     "nookies": "^2.5.2",[m
     "react": "18.2.0",[m
[1mdiff --git a/pages/dashboard.tsx b/pages/dashboard.tsx[m
[1mindex d6d79fc..fccc1b1 100644[m
[1m--- a/pages/dashboard.tsx[m
[1m+++ b/pages/dashboard.tsx[m
[36m@@ -1,4 +1,5 @@[m
 import { useEffect } from "react";[m
[32m+[m[32mimport { Can } from "../components/Can";[m[41m[m
 import { useAuth } from "../context/AuthContext"[m
 import { setupApiClient } from "../services/api";[m
 import { api } from "../services/apiClient";[m
[36m@@ -12,7 +13,12 @@[m [mexport default function Dashboard() {[m
   }, [])[m
 [m
   return ([m
[31m-    <h1>Dashboard: {user?.email}</h1>[m
[32m+[m[32m    <>[m[41m[m
[32m+[m[32m      <h1>Dashboard: {user?.email}</h1>[m[41m[m
[32m+[m[32m      <Can permissions={['metrics.list']}>[m[41m[m
[32m+[m[32m        <div>Métricas</div>[m[41m[m
[32m+[m[32m      </Can>[m[41m[m
[32m+[m[32m    </>[m[41m[m
   )[m
 }[m
 [m
[1mdiff --git a/utils/withSSRAuth.ts b/utils/withSSRAuth.ts[m
[1mindex ce20b37..1b4d4b6 100644[m
[1m--- a/utils/withSSRAuth.ts[m
[1m+++ b/utils/withSSRAuth.ts[m
[36m@@ -1,10 +1,18 @@[m
 import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";[m
 import { destroyCookie, parseCookies } from "nookies";[m
[32m+[m[32mimport decode from 'jwt-decode';[m[41m[m
[32m+[m[32mimport { validateUserPermissions } from "./validateUserPermissions";[m[41m[m
 import { AuthTokenError } from "../services/errors/AuthTokenError";[m
 [m
[31m-export function withSSRAuth<P>(fn: GetServerSideProps<P>) {[m
[32m+[m[32minterface IOptionsProps {[m[41m[m
[32m+[m[32m  permissions?: string[];[m[41m[m
[32m+[m[32m  roles?: string[];[m[41m[m
[32m+[m[32m}[m[41m[m
[32m+[m[41m[m
[32m+[m[32mexport function withSSRAuth<P>(fn: GetServerSideProps<P>, options: IOptionsProps) {[m[41m[m
   return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {[m
     const cookies = parseCookies(ctx);[m
[32m+[m[32m    const token = cookies['auth.token'];[m[41m[m
 [m
     if (!cookies['auth.token']) {[m
       return {[m
[36m@@ -14,6 +22,26 @@[m [mexport function withSSRAuth<P>(fn: GetServerSideProps<P>) {[m
         }[m
       }[m
     }[m
[32m+[m[41m[m
[32m+[m[32m    if(options) {[m[41m[m
[32m+[m[32m      const user = decode<{ permissions: string[], roles: string[] }>(token);[m[41m[m
[32m+[m[32m      const { permissions, roles } = options;[m[41m[m
[32m+[m[41m  [m
[32m+[m[32m      const userHasValidPermissions = validateUserPermissions({[m[41m [m
[32m+[m[32m        permissions,[m[41m [m
[32m+[m[32m        roles,[m[41m [m
[32m+[m[32m        user[m[41m [m
[32m+[m[32m      });[m[41m[m
[32m+[m[41m[m
[32m+[m[32m      if (!userHasValidPermissions) {[m[41m[m
[32m+[m[32m        return {[m[41m[m
[32m+[m[32m          redirect: {[m[41m[m
[32m+[m[32m            destination: '/dashboard',[m[41m[m
[32m+[m[32m            permanent: false[m[41m[m
[32m+[m[32m          }[m[41m[m
[32m+[m[32m        }[m[41m[m
[32m+[m[32m      }[m[41m[m
[32m+[m[32m    }[m[41m[m
     [m
     try {[m
       return await fn(ctx);[m
[1mdiff --git a/yarn.lock b/yarn.lock[m
[1mindex 1b78f9a..d5bf45e 100644[m
[1m--- a/yarn.lock[m
[1m+++ b/yarn.lock[m
[36m@@ -1178,6 +1178,11 @@[m [mjson5@^1.0.1:[m
     array-includes "^3.1.5"[m
     object.assign "^4.1.3"[m
 [m
[32m+[m[32mjwt-decode@^3.1.2:[m[41m[m
[32m+[m[32m  version "3.1.2"[m[41m[m
[32m+[m[32m  resolved "https://registry.yarnpkg.com/jwt-decode/-/jwt-decode-3.1.2.tgz#3fb319f3675a2df0c2895c8f5e9fa4b67b04ed59"[m[41m[m
[32m+[m[32m  integrity sha512-UfpWE/VZn0iP50d8cz9NrZLM9lSWhcJ+0Gt/nm4by88UL+J1SiKN8/5dkjMmbEzwL2CAe+67GsegCbIKtbp75A==[m[41m[m
[32m+[m[41m[m
 language-subtag-registry@~0.3.2:[m
   version "0.3.22"[m
   resolved "https://registry.yarnpkg.com/language-subtag-registry/-/language-subtag-registry-0.3.22.tgz#2e1500861b2e457eba7e7ae86877cbd08fa1fd1d"[m
