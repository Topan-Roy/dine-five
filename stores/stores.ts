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
  favorites: [] as string[],

  // // this is for user profile
  // userProfile: async () => {
  //   const response = await fetch(
  //     `${process.env.EXPO_PUBLIC_API_URL}/profile/me`,
  //     {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${get().accessToken}`,
  //       },
  //     },
  //   );

  //   const result = await response.json();
  //   console.log("userProfile result:", JSON.stringify(result, null, 2));

  //   if (!response.ok) {
  //     throw new Error(result.message || "Failed to fetch user profile");
  //   }

  //   return result.data;
  // },

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
      console.log("Failed to persist auth data:", error);
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
      console.log("Failed to initialize auth:", error);
      set({ isInitialized: true });
      return { user: null, accessToken: null };
    }
  },

  signup: async (data: any) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/signup`,
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
      console.log("signup error details:", error.message);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  login: async (data: any) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/login`,
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

      // Extract user and session data based on the provided JSON structure
      const user = result.data?.user || result.user || result.data;
      const session = result.data?.session || result.session;

      const accessToken =
        session?.accessToken || result.accessToken || result.data?.accessToken;
      const refreshToken =
        session?.refreshToken ||
        result.refreshToken ||
        result.data?.refreshToken;

      if (user) {
        // If we already have a user, merge them to avoid losing fields like email/role
        const currentUser = (get() as any).user;
        const userData = { ...user };

        // Sync name/fullName
        if (userData.fullName && !userData.name) userData.name = userData.fullName;
        if (userData.name && !userData.fullName) userData.fullName = userData.name;

        const mergedUser = currentUser ? { ...currentUser, ...userData } : userData;

        await (get() as any).persistAuthData(
          mergedUser,
          accessToken,
          refreshToken,
        );

        set({
          user: mergedUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
          isLoading: false,
        });

        // Proactively fetch latest profile to ensure we have updated data
        (get() as any).fetchProfile();

        return result.data || result;
      } else {
        throw new Error("Invalid response format: User data is missing");
      }
    } catch (error: any) {
      console.log("login error", error);
      // Ensure we don't overwrite "EMAIL_NOT_VERIFIED" if it was set above
      if ((get() as any).error !== "EMAIL_NOT_VERIFIED") {
        set({ error: error.message, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      throw error;
    }
  },

  googleLogin: async (data: { idToken: string; requestedRole?: string }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken: data.idToken,
            requestedRole: data.requestedRole || "CUSTOMER",
          }),
        },
      );

      const result = await response.json();
      console.log("Google login result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Google login failed");
      }

      // Extract user and session data based on the provided JSON structure
      const user = result.data?.user || result.user || result.data;
      const session = result.data?.session || result.session;

      const accessToken =
        session?.accessToken || result.accessToken || result.data?.accessToken;
      const refreshToken =
        session?.refreshToken ||
        result.refreshToken ||
        result.data?.refreshToken;

      if (user && accessToken) {
        const userData = { ...user };
        // Sync name/fullName
        if (userData.fullName && !userData.name) userData.name = userData.fullName;
        if (userData.name && !userData.fullName) userData.fullName = userData.name;

        await (get() as any).persistAuthData(
          userData,
          accessToken,
          refreshToken,
        );

        set({
          user: userData,
          accessToken: accessToken,
          refreshToken: refreshToken,
          isLoading: false,
        });

        // Proactively fetch latest profile to ensure we have updated data
        (get() as any).fetchProfile();

        return result.data || result;
      } else {
        throw new Error("Invalid response format: User or token is missing");
      }
    } catch (error: any) {
      console.log("googleLogin error", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  verifyOTP: async (data: { email: string; code: string }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/verify-email`,
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
      console.log("verifyOTP error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // 1️⃣ Verify forgot password OTP
  verifyForgotOTP: async (data: { email: string; code: string }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/verify-forgot-otp`,
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
      console.log("verifyForgotOTP error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // 2️⃣ Request forgot password
  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/forgot-password`,
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
      console.log("forgotPassword error", error);
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
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/auth/reset-password`,
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
      console.log("resetPassword error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateProfile: async (data: any) => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      // Check if data is FormData or regular object
      const isFormData = data instanceof FormData;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/profile/me`,
        {
          method: "PATCH",
          headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            Authorization: `Bearer ${accessToken}`,
          },
          body: isFormData ? data : JSON.stringify(data),
        },
      );

      const result = await response.json();
      console.log("updateProfile result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Profile update failed");
      }

      // Extract updated data
      const updatedData =
        result.data?.user || result.user || result.data;

      if (updatedData) {
        const currentUser = (get() as any).user;

        // Ensure updatedData is actually an object before spreading
        const finalData = typeof updatedData === "object" ? { ...updatedData } : {};

        // Sync name/fullName in updated data
        if (finalData.fullName && !finalData.name) finalData.name = finalData.fullName;
        if (finalData.name && !finalData.fullName) finalData.fullName = finalData.name;

        const mergedUser = { ...currentUser, ...finalData };

        // Persist updated user
        await (get() as any).persistAuthData(
          mergedUser,
          accessToken,
          (get() as any).refreshToken,
        );

        set({
          user: mergedUser,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return result;
    } catch (error: any) {
      console.log("updateProfile error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) return null;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/profile/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch profile");
      }

      const latestUser = result.data || result.user;
      if (latestUser) {
        const userData = { ...latestUser };
        // Sync name/fullName
        if (userData.fullName && !userData.name) userData.name = userData.fullName;
        if (userData.name && !userData.fullName) userData.fullName = userData.name;

        const currentUser = (get() as any).user;
        const mergedUser = { ...currentUser, ...userData };

        await (get() as any).persistAuthData(
          mergedUser,
          accessToken,
          (get() as any).refreshToken,
        );

        set({
          user: mergedUser,
          isLoading: false,
        });
        return mergedUser;
      }

      set({ isLoading: false });
      return null;
    } catch (error: any) {
      console.log("fetchProfile error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/notifications`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch notifications");
      }

      set({ isLoading: false });
      return result.data;
    } catch (error: any) {
      console.log("fetchNotifications error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/profile/me`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to deactivate account");
      }

      // Logout automatically after account deletion
      await (get() as any).logout();

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("deleteAccount error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchFeed: async () => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/feed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch feed");
      }

      set({ isLoading: false });
      return result.data;
    } catch (error: any) {
      console.log("fetchFeed error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchCurrentOrders: async () => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/customer/orders/current`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      console.log(
        "fetchCurrentOrders result:",
        JSON.stringify(result, null, 2),
      );

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch current orders");
      }

      set({ isLoading: false });
      return result.data;
    } catch (error: any) {
      console.log("fetchCurrentOrders error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchPreviousOrders: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/customer/orders/previous?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      console.log(
        "fetchPreviousOrders result:",
        JSON.stringify(result, null, 2),
      );

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch previous orders");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("fetchPreviousOrders error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchFavorites: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/favorites/feed?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      console.log("fetchFavorites result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch favorites");
      }

      set({ isLoading: false });
      if (result.data && result.data.favorites) {
        set({
          favorites: result.data.favorites.map((f: any) => f.food.foodId || f.food._id || f.food.id),
        });
      }
      return result.data;
    } catch (error: any) {
      console.log("fetchFavorites error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  addFavorite: async (foodId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      console.log("Adding favorite for foodId:", foodId);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/favorites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ foodId }),
        },
      );

      const result = await response.json();
      console.log("addFavorite result:", result);
      if (!response.ok) {
        console.log("addFavorite error details:", result);
        throw new Error(result.message || "Failed to add favorite");
      }

      const { favorites } = get() as any;
      set({ favorites: [...favorites, foodId], isLoading: false });
      return result;
    } catch (error: any) {
      console.log("addFavorite error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  removeFavorite: async (foodId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/favorites/${foodId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      console.log("removeFavorite result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Failed to remove favorite");
      }

      const { favorites } = get() as any;
      set({
        favorites: favorites.filter((id: string) => id !== foodId),
        isLoading: false,
      });
      return result;
    } catch (error: any) {
      console.log("removeFavorite error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  // fetchCatagori: async (page = 1, limit = 10) => {
  //   set({ isLoading: true, error: null });

  //   try {
  //     const { accessToken } = get() as any;
  //     if (!accessToken) throw new Error("No access token found");

  //     const response = await fetch(
  //       `${process.env.EXPO_PUBLIC_API_URL}/categories`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       },
  //     );

  //     const result = await response.json();
  //     console.log(
  //       "fetchPreviousOrders result:",
  //       JSON.stringify(result, null, 2),
  //     );

  //     if (!response.ok) {
  //       throw new Error(result.message || "Failed to fetch previous orders");
  //     }

  //     set({ isLoading: false });
  //     return result;
  //   } catch (error: any) {
  //     console.log("fetchPreviousOrders error", error);
  //     set({ error: error.message, isLoading: false });
  //     return null;
  //   }
  // },

  cancelOrder: async (orderId: string, reason?: string) => {
    set({ isLoading: true, error: null });

    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/orders/${orderId}/cancel`;
      console.log("Cancelling order at URL:", url);
      console.log("Payload:", JSON.stringify({ reason }));

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason, status: "cancelled" }),
      });

      const result = await response.json();
      console.log("Cancel Order Response:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel order");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("cancelOrder error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchConversations: async (limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/chat/conversations?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch conversations");
      }

      set({ isLoading: false });
      return result.data;
    } catch (error: any) {
      console.log("fetchConversations error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createConversation: async (providerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/chat/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ providerId }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to create conversation");
      }

      set({ isLoading: false });
      return result.data;
    } catch (error: any) {
      console.log("createConversation error", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchMessages: async (conversationId: string, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch messages");
      }

      set({ isLoading: false });
      return result.data;
    } catch (error: any) {
      console.log("fetchMessages error", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  sendMessage: async (conversationId: string, message: string, attachments: any[] = []) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const isFormData = attachments.length > 0;
      let body: any;

      if (isFormData) {
        body = new FormData();
        body.append("message", message);
        attachments.forEach((file) => {
          const fileName = file.uri.split("/").pop();
          body.append("attachments", {
            uri: file.uri,
            name: fileName,
            type: file.type === "video" ? "video/mp4" : "image/jpeg",
          } as any);
        });
      } else {
        body = JSON.stringify({ message });
      }

      console.log("Sending POST to:", `${process.env.EXPO_PUBLIC_API_URL}/api/v1/chat/conversations/${conversationId}/messages`);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            Authorization: `Bearer ${accessToken}`,
          },
          body: body,
        },
      );

      const result = await response.json();
      if (!response.ok) {
        console.log("Response error:", result);
        throw new Error(result.message || "Failed to send message");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("sendMessage error details:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  sendMessageToProvider: async (providerId: string, message: string, attachments: any[] = []) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const isFormData = attachments.length > 0;
      let body: any;

      if (isFormData) {
        body = new FormData();
        body.append("receiverId", providerId);
        body.append("text", message);

        attachments.forEach((file, index) => {
          const fileName = file.uri.split("/").pop() || `image_${index}.jpg`;
          const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
          const fileType = file.type === "video" ? "video/mp4" : `image/${extension === 'png' ? 'png' : 'jpeg'}`;

          body.append("image", {
            uri: file.uri,
            name: fileName,
            type: fileType,
          } as any);
        });
      } else {
        body = JSON.stringify({ receiverId: providerId, text: message });
      }

      console.log("--- OUTGOING MESSAGE DETAILS ---");
      console.log("Text:", message);
      if (isFormData) {
        console.log("Attachments count:", attachments.length);
        attachments.forEach((a, i) => console.log(`Attachment ${i}:`, a.uri));
      }
      console.log("--------------------------------");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/chat/message/customer-to-admin`,
        {
          method: "POST",
          headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            Authorization: `Bearer ${accessToken}`,
          },
          body: body,
        },
      );

      const responseText = await response.text();
      console.log("SERVER RESPONSE RAW:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned non-JSON: ${responseText.substring(0, 50)}`);
      }

      if (result.success && result.data?.imageUrl) {
        console.log("SUCCESS! Image uploaded to:", result.data.imageUrl);
      } else if (result.success) {
        console.log("Message sent successfully (No Image URL returned)");
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to send message to provider");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("sendMessageToProvider error details:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  submitReview: async (orderId: string, foodId: string, rating: number, comment: string) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/reviews`;
      const response = await fetch(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ orderId, foodId, rating, comment }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to submit review");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("submitReview error:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchReviewByOrderId: async (identifier: string) => {
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      // Check if identifier is an orderId or a specific reviewId
      // For now, let's support both: filtering by orderId and direct fetch by reviewId
      const url = identifier.length > 20
        ? `${process.env.EXPO_PUBLIC_API_URL}/api/v1/reviews/${identifier}`
        : `${process.env.EXPO_PUBLIC_API_URL}/api/v1/reviews?orderId=${identifier}`;

      console.log("Fetching review from:", url);

      const response = await fetch(
        url,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const responseText = await response.text();
      console.log("Fetch Review Raw:", responseText);

      const result = JSON.parse(responseText);
      if (!response.ok) {
        return null;
      }
      return result;
    } catch (error) {
      console.log("fetchReviewByOrderId error:", error);
      return null;
    }
  },

  updateReview: async (reviewId: string, rating: number, comment: string) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/v1/reviews/${reviewId}`;
      const body = JSON.stringify({ rating, comment });

      console.log("Updating review at:", url);
      console.log("Update Body:", body);

      const response = await fetch(
        url,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: body,
        },
      );

      const responseText = await response.text();
      console.log("Update Review Raw:", responseText);

      const result = JSON.parse(responseText);
      if (!response.ok) {
        throw new Error(result.message || "Failed to update review");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("updateReview error:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchBanners: async () => {
    try {
      const { accessToken } = get() as any;
      //   if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/banners?status=ACTIVE&page=1&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      console.log("fetchBanners full result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch banners");
      }

      return result.banners || result.data || [];
    } catch (error: any) {
      console.log("fetchBanners error:", error);
      return [];
    }
  },

  fetchReviewsByFoodId: async (foodId: string) => {
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/reviews/food/${foodId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch reviews");
      }

      return result;
    } catch (error: any) {
      console.log("fetchReviewsByFoodId error:", error);
      return { data: [], meta: { total: 0 } };
    }
  },

  addToCart: async (item: any, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      // Construct payload for the API
      // Based on user request: { items: [{ foodId: "...", quantity: 1, price: 15 }] }
      // But usually cart APIs take one item at a time or a list. 
      // The user log shows a response structure, implying the request might be simpler:
      // POST /api/v1/cart/add
      // Body: { foodId: "...", quantity: 1 } (typically)

      const payload = {
        foodId: item.foodId || item._id || item.id,
        quantity: quantity,
      };

      console.log("Adding to cart:", payload);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      console.log("addToCart result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Failed to add item to cart");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("addToCart error:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/cart`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch cart");
      }

      set({ isLoading: false });
      return result.data;
    } catch (error: any) {
      console.log("fetchCart error:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchCartCount: async () => {
    try {
      const { accessToken } = get() as any;
      if (!accessToken) return 0;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/cart/count`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      if (response.ok) {
        return result.data?.count || result.count || 0;
      }
      return 0;
    } catch (error) {
      // console.log("fetchCartCount error", error);
      return 0;
    }
  },

  updateCartQuantity: async (foodId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/cart/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ foodId, quantity }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update cart");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("updateCartQuantity error:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  removeCartItem: async (foodId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/cart/remove`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ foodId }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to remove item");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("removeCartItem error:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/cart/clear`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to clear cart");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("clearCart error:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  createOrder: async (orderData: any) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = get() as any;
      if (!accessToken) throw new Error("No access token found");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(orderData),
        },
      );

      const result = await response.json();
      console.log("createOrder result:", JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.message || "Failed to place order");
      }

      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.log("createOrder error:", error);
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
      console.log("Failed to logout:", error);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
