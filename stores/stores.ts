import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEYS = {
  USER: "auth_user",
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
};

const translateApiMessage = (code: string) => {
  const messages: { [key: string]: string } = {
    VALIDATION_ERROR: "Please check your input and try again.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    USER_NOT_FOUND: "No account found with this email.",
    INTERNAL_SERVER_ERROR: "Something went wrong on our end.",
    UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  };
  return messages[code] || messages.UNKNOWN_ERROR;
};

export const useStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  resetToken: null as string | null,

  // Add this function to persist auth data to AsyncStorage
  persistAuthData: async (user: any, accessToken: any, refreshToken: any) => {
    try {
      const promises = [
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ];

      if (accessToken) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        );
      }

      if (refreshToken) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to persist auth data:", error);
      throw error;
    }
  },

  // Add this function to initialize auth state from storage on app start
  initializeAuth: async () => {
    try {
      const [user, accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      //   console.log("from storage", user, accessToken, refreshToken);

      if (user) {
        const parsedUser = JSON.parse(user);
        set({
          user: parsedUser,
          accessToken: accessToken || null,
          refreshToken: refreshToken || null,
          isInitialized: true,
        });
        return { user: parsedUser, accessToken };
      } else {
        set({ isInitialized: true });
        return { user: null, accessToken: null };
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      set({ isInitialized: true });
      return { user: null, accessToken: null };
    }
  },

  signup: async (data: any) => {
    // console.log(
    //   "Signup starting with URL:",
    //   `${process.env.EXPO_PUBLIC_API_URL}/auth/signup`,
    // );
    // console.log("Signup data:", data);
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Signup result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }

      // Check if data is nested or flat
      const userData = result.data?.user || result.user;
      const sessionData = result.data?.session || result.session;

      if (userData) {
        await (get() as any).persistAuthData(
          userData,
          sessionData?.accessToken,
          sessionData?.refreshToken,
        );

        set({
          user: userData,
          accessToken: sessionData?.accessToken,
          refreshToken: sessionData?.refreshToken,
          isLoading: false,
        });

        return result.data || result;
      } else {
        throw new Error("Invalid response format: User data is missing");
      }
    } catch (error: any) {
      console.error("signup error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  login: async (data: any) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        const errorCode =
          result.error?.code || result.errorCode || "UNKNOWN_ERROR";
        let message = result.message || translateApiMessage(errorCode);

        // Specific handling for email verification error if needed by message
        if (message.includes("verify your email")) {
          // You could set a specific error code here if you want the UI to react
          set({ error: "EMAIL_NOT_VERIFIED", isLoading: false });
          throw new Error(message);
        }

        throw new Error(message);
      }

      // Check for nested or flat data
      const userData = result.data?.user || result.data || result.user;
      const sessionData = result.data?.session || result.session || result.data;

      const user = userData;
      const accessToken = sessionData?.accessToken || result.accessToken;
      const refreshToken = sessionData?.refreshToken || result.refreshToken;

      if (user) {
        await (get() as any).persistAuthData(user, accessToken, refreshToken);

        set({
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken,
          isLoading: false,
        });

        return result.data || result;
      } else {
        throw new Error("Invalid response format: User data is missing");
      }
    } catch (error: any) {
      console.error("login error", error);
      // Ensure we don't overwrite "EMAIL_NOT_VERIFIED" if it was set above
      if ((get() as any).error !== "EMAIL_NOT_VERIFIED") {
        set({ error: error.message, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      throw error;
    }
  },

  verifyOTP: async (data: { email: string; code: string }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            otp: data.code,
          }),
        },
      );

      const result = await response.json();
      console.log("verifyOTP full result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Verification failed");
      }

      // Check for user/token in different possible locations
      const userData = result.data?.user || result.user || result.data || null;
      const accessToken =
        result.data?.session?.accessToken ||
        result.session?.accessToken ||
        result.accessToken ||
        result.data?.accessToken ||
        result.token;
      const refreshToken =
        result.data?.session?.refreshToken ||
        result.session?.refreshToken ||
        result.refreshToken ||
        result.data?.refreshToken;

      if (userData && accessToken) {
        await (get() as any).persistAuthData(
          userData,
          accessToken,
          refreshToken,
        );

        set({
          user: userData,
          accessToken: accessToken,
          refreshToken: refreshToken || null,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return result;
    } catch (error: any) {
      console.error("verifyOTP error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // 1️⃣ Verify forgot password OTP
  verifyForgotOTP: async (data: { email: string; code: string }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/verify-forgot-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            otp: data.code,
          }),
        },
      );

      const result = await response.json();
      console.log(
        "verifyForgotOTP full result:",
        JSON.stringify(result, null, 2),
      );

      if (!response.ok) {
        throw new Error(result.message || "Verification failed");
      }

      // Save token as resetToken
      const resetToken = result.data?.accessToken || result.accessToken;
      if (!resetToken) throw new Error("Reset token not received from server");

      set({ resetToken, isLoading: false });

      return result;
    } catch (error: any) {
      console.error("verifyForgotOTP error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // 2️⃣ Request forgot password
  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const result = await response.json();
      console.log(
        "forgotPassword full result:",
        JSON.stringify(result, null, 2),
      );

      if (!response.ok) {
        throw new Error(result.message || "Forgot password request failed");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.error("forgotPassword error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // 3️⃣ Reset password
  resetPassword: async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    set({ isLoading: true, error: null });
    // console.log(data.newPassword + data.confirmPassword);

    try {
      const { resetToken } = get() as any;

      if (!resetToken) {
        throw new Error("Reset token missing. Please verify OTP first.");
      }

      if (!data.newPassword || !data.confirmPassword) {
        throw new Error("Please provide both newPassword and confirmPassword");
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resetToken}`,
          },
          body: JSON.stringify({
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword,
          }),
        },
      );

      const result = await response.json();
      console.log(
        "resetPassword full result:",
        JSON.stringify(result, null, 2),
      );

      if (!response.ok) {
        throw new Error(result.message || "Reset password failed");
      }

      // Clear resetToken after success
      set({ isLoading: false, resetToken: null });

      return result;
    } catch (error: any) {
      console.error("resetPassword error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  logout: async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
      });

      return true;
    } catch (error) {
      console.error("Failed to logout:", error);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
