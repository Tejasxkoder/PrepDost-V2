import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { mockUserApi } from "@/mocks/user.mock";
import {
  userSchema,
  userStatsSchema,
  type UpdateProfileInput,
  type User,
  type UserStats,
} from "./schemas";

export interface UserApi {
  stats(signal?: AbortSignal): Promise<UserStats>;
  updateProfile(input: UpdateProfileInput): Promise<User>;
  changePassword(input: { currentPassword: string; newPassword: string }): Promise<void>;
  deleteAccount(): Promise<void>;
}

const httpUserApi: UserApi = {
  stats: (signal) => apiClient.get("/users/stats", { schema: userStatsSchema, signal }),
  updateProfile: (input) => apiClient.put("/users/profile", input, { schema: userSchema }),
  changePassword: async (input) => {
    await apiClient.put("/users/password", input);
  },
  deleteAccount: async () => {
    await apiClient.delete("/users/account");
  },
};

export const userApi: UserApi = env.NEXT_PUBLIC_USE_MOCKS ? mockUserApi : httpUserApi;
