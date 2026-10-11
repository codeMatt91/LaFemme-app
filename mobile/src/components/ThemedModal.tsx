import { Modal, View, type ModalProps } from "react-native";
import { THEME_VARS } from "@/theme/palette";
import { useTheme } from "@/theme/ThemeProvider";

// Un Modal viene disegnato fuori dall'albero della schermata, quindi non eredita
// le variabili colore del tema: le riapplichiamo qui, così bg-card, text-foreground
// ecc. funzionano anche dentro i modali, sia in chiaro che in scuro.
export function ThemedModal({ children, ...props }: ModalProps) {
  const { scheme } = useTheme();
  return (
    <Modal {...props}>
      <View style={THEME_VARS[scheme]} className="flex-1">
        {children}
      </View>
    </Modal>
  );
}
