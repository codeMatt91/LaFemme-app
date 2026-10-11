import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedModal } from "@/components/ThemedModal";
import { useTheme } from "@/theme/ThemeProvider";

// Pezzi comuni ai moduli in un foglio a comparsa (cliente, utente, prestazione):
// stessi titoli, campi, riquadro errore e pulsanti Annulla / Crea-Aggiorna del web.

export const INPUT_CLASS = "rounded-lg border border-input px-3 py-3 text-foreground";

export function FormField({
  label,
  inRow = false,
  children,
}: {
  label: string;
  inRow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className={`gap-1 ${inRow ? "flex-1" : ""}`}>
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      {children}
    </View>
  );
}

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
      <Text className="text-sm text-destructive">{message}</Text>
    </View>
  );
}

interface FormSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
  children: React.ReactNode;
}

export function FormSheet({ open, title, onClose, onSubmit, submitting, submitLabel, children }: FormSheetProps) {
  const { colors } = useTheme();
  return (
    <ThemedModal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
          <Text className="font-semibold text-foreground">{title}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Chiudi" hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          <ScrollView contentContainerClassName="gap-4 p-5" keyboardShouldPersistTaps="handled">
            {children}

            <View className="flex-row gap-2 pt-1">
              <Pressable onPress={onClose} accessibilityRole="button" className="flex-1 items-center rounded-lg bg-muted py-3">
                <Text className="text-sm font-medium text-foreground">Annulla</Text>
              </Pressable>
              <Pressable
                onPress={onSubmit}
                disabled={submitting}
                accessibilityRole="button"
                className="flex-1 items-center rounded-lg bg-primary py-3 disabled:opacity-50"
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-sm font-medium text-primary-foreground">{submitLabel}</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedModal>
  );
}
