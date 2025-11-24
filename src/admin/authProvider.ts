import { AuthProvider } from "react-admin";
import { apiClient } from "@/lib/api-client";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      await apiClient.login({ email: username, password });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error("Invalid credentials"));
    }
  },

  logout: async () => {
    apiClient.logout();
    return Promise.resolve();
  },

  checkAuth: async () => {
    const token = localStorage.getItem("accessToken");
    return token ? Promise.resolve() : Promise.reject();
  },

  checkError: async (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      apiClient.clearTokens();
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: async () => {
    return Promise.resolve();
  },

  getIdentity: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return Promise.reject();
    }

    // Decode JWT to get user info (simple base64 decode)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Promise.resolve({
        id: payload.sub,
        fullName: payload.email,
        avatar: undefined,
      });
    } catch {
      return Promise.reject();
    }
  },
};
