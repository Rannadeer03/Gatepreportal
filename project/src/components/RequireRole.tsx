import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type Role = 'student' | 'teacher' | 'admin' | 'super_admin';

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
}

export const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const { user, profile } = useAuthStore();

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
