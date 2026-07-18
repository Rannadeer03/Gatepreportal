import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireRole, RequireAuth } from './RequireRole';

// This is the regression guard for the audit's most severe frontend finding
// (C10): App.tsx previously had zero route guards, so /admin-dashboard and
// every teacher-only page rendered for any visitor regardless of auth state
// or role. These tests assert the guard actually blocks and redirects.

const mockState: { user: { id: string } | null; profile: { role: string } | null } = {
  user: null,
  profile: null,
};

vi.mock('../store/authStore', () => ({
  useAuthStore: () => mockState,
}));

function renderProtected(element: React.ReactNode, initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/protected" element={element} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockState.user = null;
  mockState.profile = null;
});

describe('RequireRole', () => {
  it('redirects to /login when there is no authenticated user', () => {
    renderProtected(
      <RequireRole roles={['teacher']}>
        <div>Secret Teacher Content</div>
      </RequireRole>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Teacher Content')).not.toBeInTheDocument();
  });

  it('redirects to / when the user is authenticated but has the wrong role', () => {
    mockState.user = { id: 'u1' };
    mockState.profile = { role: 'student' };

    renderProtected(
      <RequireRole roles={['teacher', 'admin', 'super_admin']}>
        <div>Secret Teacher Content</div>
      </RequireRole>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Teacher Content')).not.toBeInTheDocument();
  });

  it('renders the protected content when the role matches', () => {
    mockState.user = { id: 'u1' };
    mockState.profile = { role: 'teacher' };

    renderProtected(
      <RequireRole roles={['teacher', 'admin', 'super_admin']}>
        <div>Secret Teacher Content</div>
      </RequireRole>
    );

    expect(screen.getByText('Secret Teacher Content')).toBeInTheDocument();
  });

  it('blocks an unauthenticated visitor from the admin dashboard shape of route', () => {
    // Mirrors App.tsx's actual usage for /admin-dashboard.
    renderProtected(
      <RequireRole roles={['admin', 'super_admin']}>
        <div>Admin Dashboard</div>
      </RequireRole>
    );

    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});

describe('RequireAuth', () => {
  it('redirects to /login when signed out', () => {
    renderProtected(
      <RequireAuth>
        <div>Any Authenticated Content</div>
      </RequireAuth>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders content for any signed-in user regardless of role', () => {
    mockState.user = { id: 'u1' };
    mockState.profile = { role: 'student' };

    renderProtected(
      <RequireAuth>
        <div>Any Authenticated Content</div>
      </RequireAuth>
    );

    expect(screen.getByText('Any Authenticated Content')).toBeInTheDocument();
  });
});
