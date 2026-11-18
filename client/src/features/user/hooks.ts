import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/hooks";
import { userApi } from "./api";

export const userKeys = {
  all: ["user"] as const,
  stats: ["user", "stats"] as const,
};

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats,
    queryFn: ({ signal }) => userApi.stats(signal),
  });
}

/** The session query IS the current user, so a successful update refreshes it everywhere. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (user) => queryClient.setQueryData(authKeys.session, user),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: userApi.changePassword });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: userApi.deleteAccount });
}
