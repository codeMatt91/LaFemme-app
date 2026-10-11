import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useCurrentUser } from "@/auth/AuthProvider";
import { ApiError } from "@/lib/api";
import { HeaderPanel } from "./HeaderPanel";
import { useProfile, useUpdateProfileImage } from "./api";

// Stesso limite del web (10 MB).
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// Le immagini SVG caricate dal web non si possono mostrare con <Image>:
// in quel caso si mostra l'iniziale.
function displayableImage(image: string | null | undefined): string | null {
  return image && !image.startsWith("data:image/svg+xml") ? image : null;
}

function Avatar({ image, initial, size }: { image: string | null; initial: string; size: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center overflow-hidden rounded-full bg-primary/20"
    >
      {image ? (
        <Image source={{ uri: image }} style={{ width: size, height: size }} accessibilityLabel="Foto profilo" />
      ) : (
        <Text style={{ fontSize: size * 0.36 }} className="font-semibold text-primary">
          {initial}
        </Text>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}

function ProfilePanelContent() {
  const user = useCurrentUser();
  const profileQuery = useProfile(true);
  const updateImage = useUpdateProfileImage();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const initial = user.firstName.charAt(0).toUpperCase();

  async function pickImage() {
    setUploadError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) return setUploadError("Errore durante la lettura del file.");
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
      return setUploadError("L'immagine supera il limite di 10 MB.");
    }
    const mimeType = asset.mimeType === "image/png" ? "image/png" : "image/jpeg";
    try {
      await updateImage.mutateAsync(`data:${mimeType};base64,${asset.base64}`);
    } catch (e) {
      setUploadError(e instanceof ApiError ? e.message : "Errore durante il caricamento.");
    }
  }

  return (
    <ScrollView contentContainerClassName="gap-4 p-5">
      <View className="items-center">
        <View>
          <Avatar image={displayableImage(profileQuery.data?.image)} initial={initial} size={80} />
          <Pressable
            onPress={pickImage}
            disabled={updateImage.isPending}
            accessibilityRole="button"
            accessibilityLabel="Cambia foto profilo"
            hitSlop={8}
            className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-primary disabled:opacity-50"
          >
            {updateImage.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>

      {uploadError && (
        <View className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
          <Text className="text-center text-xs text-destructive">{uploadError}</Text>
        </View>
      )}

      <View className="gap-3 pt-1">
        <InfoRow label="Nome" value={user.firstName} />
        <InfoRow label="Cognome" value={user.lastName} />
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Tipo account" value={user.role === "ADMIN" ? "Amministratore" : "Dipendente"} />
        {profileQuery.isLoading ? (
          <View className="gap-1">
            <Text className="text-xs text-muted-foreground">Membro dal</Text>
            <View className="h-4 w-24 rounded bg-secondary" />
          </View>
        ) : profileQuery.data ? (
          <InfoRow label="Membro dal" value={format(new Date(profileQuery.data.createdAt), "dd/MM/yyyy")} />
        ) : null}
      </View>
    </ScrollView>
  );
}

export function ProfileButton() {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  // Usa la foto già in cache, se il pannello è stato aperto almeno una volta.
  const profileQuery = useProfile(false);
  const initial = user.firstName.charAt(0).toUpperCase();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Apri profilo utente"
        accessibilityState={{ expanded: open }}
        className="ml-1 border-l border-border pl-2"
      >
        <Avatar image={displayableImage(profileQuery.data?.image)} initial={initial} size={28} />
      </Pressable>

      <HeaderPanel open={open} onClose={() => setOpen(false)}>
        {open && <ProfilePanelContent />}
      </HeaderPanel>
    </>
  );
}
