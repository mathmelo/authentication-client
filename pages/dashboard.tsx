import { useEffect } from "react";
import { useAuth } from "../context/AuthContext"
import { setupApiClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => { 
    api.get('teste').then(response => console.log(response.status)).catch(err => console.log(err));
  }, [])

  return (
    <h1>Dashboard: {user?.email}</h1>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = setupApiClient(ctx);

  const response = await api.get('/teste');

  return {
    props: {}
  }
});