import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface NotificationItem {
  id: string;
  customerName: string;
  appointmentType: string;
  success: boolean;
  errorMessage: string | null;
  read: boolean;
  appointmentId: string | null;
  createdAt: string;
}

export interface Profile {
  image: string | null;
  createdAt: string;
}

const UNREAD_KEY = ["notifications", "unread"];

// Pallino rosso sulla campanella. Sul web si aggiorna a ogni cambio pagina;
// qui ogni minuto, così i promemoria inviati dal cron compaiono da soli.
export function useHasUnreadNotifications() {
  return useQuery({
    queryKey: UNREAD_KEY,
    queryFn: () => api<{ hasUnread: boolean }>("/notifications/unread").then((r) => r.hasUnread),
    refetchInterval: 60_000,
  });
}

// Come il pannello web: carica le notifiche e poi le segna tutte come lette.
export function useNotifications(enabled: boolean) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      const { notifications } = await api<{ notifications: NotificationItem[] }>("/notifications");
      await api("/notifications/read", { method: "POST" });
      queryClient.setQueryData(UNREAD_KEY, false);
      return notifications;
    },
    enabled,
    staleTime: 0,
  });
}

export function useProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api<Profile>("/profile"),
    enabled,
  });
}

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (image: string) => api("/profile", { method: "PUT", body: { image } }),
    onSuccess: (_data, image) =>
      queryClient.setQueryData<Profile>(["profile"], (old) => (old ? { ...old, image } : old)),
  });
}
