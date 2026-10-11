import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { UserInput, UserRecord } from "./types";

const USERS_KEY = ["users"];

function invalidateUsers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: USERS_KEY });
  // Il calendario elenca gli utenti come operatrici.
  queryClient.invalidateQueries({ queryKey: ["employees"] });
}

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => api<{ users: UserRecord[] }>("/users").then((r) => r.users),
  });
}

export function useSaveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: UserInput }) =>
      id ? api(`/users/${id}`, { method: "PATCH", body: data }) : api("/users", { method: "POST", body: data }),
    onSuccess: () => invalidateUsers(queryClient),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateUsers(queryClient),
  });
}
