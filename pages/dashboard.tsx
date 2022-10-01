import { useEffect } from "react";
import { useAuth } from "../context/AuthContext"
import { api } from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <h1>Dashboard: {user?.email}</h1>
  )
}
