import { render, renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

// Mock useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
mockUseRouter.mockReturnValue({
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("should initialize with unauthenticated state", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should initialize as authenticated if token exists in localStorage", async () => {
    localStorageMock.getItem.mockReturnValue("fake-token");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should login successfully with valid credentials", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        token: "fake-token",
        user: { username: "root", id: "root" },
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login("root", "admin");
    });

    expect(loginResult!).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "auth-token",
      "fake-token"
    );
  });

  it("should fail login with invalid credentials", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult: boolean;
    await act(async () => {
      loginResult = await result.current.login("wrong", "wrong");
    });

    expect(loginResult!).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("should logout and redirect to classement", async () => {
    localStorageMock.getItem.mockReturnValue("fake-token");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth-token");
    expect(mockPush).toHaveBeenCalledWith("/classement");
  });

  it("should checkAuth return true if token exists", async () => {
    localStorageMock.getItem.mockReturnValue("fake-token");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let authResult: boolean;
    act(() => {
      authResult = result.current.checkAuth();
    });

    expect(authResult!).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should checkAuth return false if no token exists", async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let authResult: boolean;
    act(() => {
      authResult = result.current.checkAuth();
    });

    expect(authResult!).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });
});
