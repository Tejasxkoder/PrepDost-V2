"use client";

import type { Route } from "next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { authApi } from "./api";
import type { AuthSession } from "./schemas";

export const authKeys = {
  session: ["auth", "session"] as const,
};

export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: ({ signal }) => authApi.me(signal),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

function useStartSession(redirectTo: Route) {
  const router = useRouter();
  const queryClient = useQueryClient();
  return ({ user }: AuthSession) => {
    queryClient.setQueryData(authKeys.session, user);
    router.replace(redirectTo);
  };
}

export function useLogin(redirectTo: Route = ROUTES.dashboard) {
  return useMutation({ mutationFn: authApi.login, onSuccess: useStartSession(redirectTo) });
}

export function useGoogleLogin(redirectTo: Route = ROUTES.dashboard) {
  return useMutation({ mutationFn: authApi.google, onSuccess: useStartSession(redirectTo) });
}

/** Registering only creates an unverified account; there is no session until `useVerifyEmail`. */
export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}

export function useVerifyEmail(redirectTo: Route = ROUTES.dashboard) {
  return useMutation({ mutationFn: authApi.verifyEmail, onSuccess: useStartSession(redirectTo) });
}

export function useResendVerification() {
  return useMutation({ mutationFn: authApi.resendVerification });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear();
      router.replace(ROUTES.login);
    },
  });
}
