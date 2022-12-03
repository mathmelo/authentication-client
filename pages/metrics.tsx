import { setupApiClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = setupApiClient(ctx);
  const response = await api.get('/teste');

  return {
    props: {}
  }
}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
});