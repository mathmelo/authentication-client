import { useEffect } from "react";
import { useAuth } from "../context/AuthContext"

import { Can } from "../components/Can";

import { setupApiClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  useEffect(() => { 
    api.get('teste').then(response => console.log(response.status)).catch(err => console.log(err));
  }, [])

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={() => signOut()}>Sign Out</button>
      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = setupApiClient(ctx);

  const response = await api.get('/teste');

  return {
    props: {}
  }
});