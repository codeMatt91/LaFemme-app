import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateField } from "@/components/DateField";
import { ApiError } from "@/lib/api";
import { useSaveCustomer } from "./api";
import type { Customer } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

// Data proposta quando la data di nascita è vuota (evita di partire da oggi).
const BIRTH_DATE_START = new Date(1990, 0, 1);

function Field({ label, inRow = false, children }: { label: string; inRow?: boolean; children: React.ReactNode }) {
  return (
    <View className={`gap-1 ${inRow ? "flex-1" : ""}`}>
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      {children}
    </View>
  );
}

const INPUT_CLASS = "rounded-lg border border-input px-3 py-3 text-foreground";

export function CustomerForm({ open, onClose, customer }: Props) {
  const saveMutation = useSaveCustomer();
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setFirstName(customer?.firstName ?? "");
    setLastName(customer?.lastName ?? "");
    setPhoneNumber(customer?.phoneNumber ?? "");
    setEmail(customer?.email ?? "");
    setBirthDate(customer?.birthDate?.slice(0, 10) ?? null);
    setNotes(customer?.notes ?? "");
  }, [open, customer]);

  async function handleSubmit() {
    setError(null);
    try {
      await saveMutation.mutateAsync({
        id: customer?.id,
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim() || null,
          email: email.trim() || null,
          birthDate,
          notes: notes || null,
        },
      });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore durante il salvataggio. Riprova.");
    }
  }

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
          <Text className="font-semibold text-foreground">{customer ? "Modifica cliente" : "Nuovo cliente"}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Chiudi" hitSlop={8}>
            <Ionicons name="close" size={20} color="hsl(340, 10%, 10%)" />
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          <ScrollView contentContainerClassName="gap-4 p-5" keyboardShouldPersistTaps="handled">
            <View className="flex-row gap-3">
              <Field label="Nome *" inRow>
                <TextInput value={firstName} onChangeText={setFirstName} autoCapitalize="words" className={INPUT_CLASS} />
              </Field>
              <Field label="Cognome *" inRow>
                <TextInput value={lastName} onChangeText={setLastName} autoCapitalize="words" className={INPUT_CLASS} />
              </Field>
            </View>

            <Field label="Telefono">
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                placeholder="+39 333 000 0000"
                className={INPUT_CLASS}
              />
            </Field>

            <DateField
              label="Data di nascita"
              value={birthDate}
              onChange={setBirthDate}
              maximumDate={new Date()}
              initialDate={BIRTH_DATE_START}
            />

            <Field label="Email">
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                placeholder="cliente@esempio.it"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Note">
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Allergie, preferenze, note varie..."
                className={`${INPUT_CLASS} min-h-[88px]`}
              />
            </Field>

            {error && (
              <View className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            )}

            <View className="flex-row gap-2 pt-1">
              <Pressable onPress={onClose} accessibilityRole="button" className="flex-1 items-center rounded-lg bg-muted py-3">
                <Text className="text-sm font-medium text-foreground">Annulla</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={saveMutation.isPending}
                accessibilityRole="button"
                className="flex-1 items-center rounded-lg bg-primary py-3 disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-sm font-medium text-primary-foreground">{customer ? "Aggiorna" : "Crea"}</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
