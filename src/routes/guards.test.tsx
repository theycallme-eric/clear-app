import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute, PublicOnlyRoute, OnboardingRoute } from './guards';

// Mock AuthContext
const mockAuthContext = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext(),
}));

function renderWithRouter(initialEntries: string[], routes: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>{routes}</Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const authed = (onboarded = true) => ({
  status: 'authenticated' as const,
  user: { id: '1', email: 'test@test.com' },
  profile: { onboardingComplete: onboarded, experienceLevel: null, goal: null, limitations: '', enabledSections: [], defaultLocationId: null },
  locations: [],
  error: null,
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  updateLocations: vi.fn(),
  completeOnboarding: vi.fn(),
  refreshAuth: vi.fn(),
});

const unauthed = () => ({
  status: 'unauthenticated' as const,
  user: null,
  profile: null,
  locations: [],
  error: null,
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  updateLocations: vi.fn(),
  completeOnboarding: vi.fn(),
  refreshAuth: vi.fn(),
});

beforeEach(() => {
  mockAuthContext.mockReset();
});

describe('ProtectedRoute', () => {
  it('redirects to /welcome when unauthenticated', () => {
    mockAuthContext.mockReturnValue(unauthed());
    renderWithRouter(['/'], (
      <>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Home</div>} />
        </Route>
        <Route path="/welcome" element={<div>Welcome Page</div>} />
      </>
    ));
    expect(screen.getByText('Welcome Page')).toBeInTheDocument();
  });

  it('redirects to /onboarding when not onboarded', () => {
    mockAuthContext.mockReturnValue(authed(false));
    renderWithRouter(['/'], (
      <>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Home</div>} />
        </Route>
        <Route path="/onboarding" element={<div>Onboarding Page</div>} />
      </>
    ));
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
  });

  it('renders outlet when fully authenticated', () => {
    mockAuthContext.mockReturnValue(authed());
    renderWithRouter(['/'], (
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<div>Protected Content</div>} />
      </Route>
    ));
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

describe('PublicOnlyRoute', () => {
  it('renders outlet for unauthenticated users', () => {
    mockAuthContext.mockReturnValue(unauthed());
    renderWithRouter(['/welcome'], (
      <Route element={<PublicOnlyRoute />}>
        <Route path="/welcome" element={<div>Welcome Content</div>} />
      </Route>
    ));
    expect(screen.getByText('Welcome Content')).toBeInTheDocument();
  });

  it('redirects to / when authenticated and onboarded', () => {
    mockAuthContext.mockReturnValue(authed());
    renderWithRouter(['/welcome'], (
      <>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/welcome" element={<div>Welcome Content</div>} />
        </Route>
        <Route path="/" element={<div>Home Page</div>} />
      </>
    ));
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('redirects to /onboarding when authenticated but not onboarded', () => {
    mockAuthContext.mockReturnValue(authed(false));
    renderWithRouter(['/welcome'], (
      <>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/welcome" element={<div>Welcome Content</div>} />
        </Route>
        <Route path="/onboarding" element={<div>Onboarding Page</div>} />
      </>
    ));
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
  });
});

describe('OnboardingRoute', () => {
  it('redirects to /welcome when unauthenticated', () => {
    mockAuthContext.mockReturnValue(unauthed());
    renderWithRouter(['/onboarding'], (
      <>
        <Route element={<OnboardingRoute />}>
          <Route path="/onboarding" element={<div>Onboarding Content</div>} />
        </Route>
        <Route path="/welcome" element={<div>Welcome Page</div>} />
      </>
    ));
    expect(screen.getByText('Welcome Page')).toBeInTheDocument();
  });

  it('redirects to / when already onboarded', () => {
    mockAuthContext.mockReturnValue(authed());
    renderWithRouter(['/onboarding'], (
      <>
        <Route element={<OnboardingRoute />}>
          <Route path="/onboarding" element={<div>Onboarding Content</div>} />
        </Route>
        <Route path="/" element={<div>Home Page</div>} />
      </>
    ));
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders outlet when authenticated but not onboarded', () => {
    mockAuthContext.mockReturnValue(authed(false));
    renderWithRouter(['/onboarding'], (
      <Route element={<OnboardingRoute />}>
        <Route path="/onboarding" element={<div>Onboarding Content</div>} />
      </Route>
    ));
    expect(screen.getByText('Onboarding Content')).toBeInTheDocument();
  });
});
