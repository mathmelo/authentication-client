import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Home.module.css';
import { withSSRGuest } from '../utils/withSSRGuest';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    };

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="email"  name='email' onChange={(event) => setEmail(event.target.value)} />
      <input type="password" name='password' onChange={(event) => setPassword(event.target.value)} />

      <button type="submit">Enviar</button>
    </form>
  )
}

export const getServerSideProps = withSSRGuest(async () => {
  return {
    props: {}
  }
});