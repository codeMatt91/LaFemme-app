import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedModal } from "@/components/ThemedModal";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Pannello a tendina sotto l'header (come i pannelli notifiche e profilo del
// web): si chiude toccando fuori.
export function HeaderPanel({ open, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ThemedModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1">
        <Pressable onPress={onClose} accessibilityLabel="Chiudi" className="absolute inset-0 bg-black/20" />
        <View
          style={{ marginTop: insets.top + 52 }}
          className="mx-2 max-h-[70%] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {children}
        </View>
      </View>
    </ThemedModal>
  );
}
