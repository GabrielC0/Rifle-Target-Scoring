import { render, screen, waitFor } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock useAuth
jest.mock("@/contexts/auth-context", () => ({
  ...jest.requireActual("@/contexts/auth-context"),
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

mockUseRouter.mockReturnValue({
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
});

describe("ProtectedRoute", () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show loading state when loading is true", () => {
    mockUsePathname.mockReturnValue("/test");
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(),
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("should show content for public routes (classement)", () => {
    mockUsePathname.mockReturnValue("/classement");
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn().mockReturnValue(false),
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should show content for authenticated users on protected routes", () => {
    mockUsePathname.mockReturnValue("/test");
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn().mockReturnValue(true),
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should show access denied dialog for unauthenticated users on protected routes", async () => {
    const mockCheckAuth = jest.fn().mockReturnValue(false);
    mockUsePathname.mockReturnValue("/test");
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: mockCheckAuth,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText("Accès Refusé")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Vous n'avez pas les droits nécessaires pour accéder à cette page."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Aller au Classement")).toBeInTheDocument();
  });

  it("should redirect to classement when clicking redirect button", async () => {
    const user = userEvent.setup();
    const mockCheckAuth = jest.fn().mockReturnValue(false);
    mockUsePathname.mockReturnValue("/test");
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: mockCheckAuth,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText("Accès Refusé")).toBeInTheDocument();
    });

    const redirectButton = screen.getByText("Aller au Classement");
    await user.click(redirectButton);

    expect(mockPush).toHaveBeenCalledWith("/classement");
  });
});
