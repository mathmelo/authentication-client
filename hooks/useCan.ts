import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { validateUserPermissions } from "../utils/validateUserPermissions";

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions, roles }: UseCanParams) {
  const {isAuthenticated, user} = useContext(AuthContext);

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validateUserPermissions({ 
    permissions, 
    roles, 
    user 
  });

  return userHasValidPermissions;
}