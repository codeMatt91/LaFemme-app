import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ErrorBox, FormField, FormSheet, INPUT_CLASS } from "@/components/FormSheet";
import { ApiError } from "@/lib/api";
import type { Role } from "@/types";
import { useSaveUser } from "./api";
import type { UserRecord } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserRecord | null;
}

const ROLES: { value: Role; label: string }[] = [
  { value: "EMPLOYEE", label: "Dipendente" },
  { value: "ADMIN", label: "Amministratore" },
];

// Come UserModal del web: stessi campi, password facoltativa in modifica.
export function UserForm({ open, onClose, user }: Props) {
  const saveMutation = useSaveUser();
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setRole(user?.role ?? "EMPLOYEE");
  }, [open, user]);

  async function handleSubmit() {
    setError(null);
    try {
      await saveMutation.mutateAsync({
        id: user?.id,
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          role,
          ...(password || !user ? { password } : {}),
        },
      });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore durante il salvataggio. Riprova.");
    }
  }

  return (
    <FormSheet
      open={open}
      title={user ? "Modifica utente" : "Nuovo utente"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saveMutation.isPending}
      submitLabel={user ? "Aggiorna" : "Crea"}
    >
      <View className="flex-row gap-3">
        <FormField label="Nome *" inRow>
          <TextInput value={firstName} onChangeText={setFirstName} autoCapitalize="words" className={INPUT_CLASS} />
        </FormField>
        <FormField label="Cognome *" inRow>
          <TextInput value={lastName} onChangeText={setLastName} autoCapitalize="words" className={INPUT_CLASS} />
        </FormField>
      </View>

      <FormField label="Email *">
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField label={user ? "Password (lascia vuoto per non cambiare)" : "Password *"}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          placeholder="Min. 8 caratteri"
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField label="Ruolo">
        <View className="flex-row rounded-lg border border-input p-1">
          {ROLES.map((r) => {
            const selected = role === r.value;
            return (
              <Pressable
                key={r.value}
                onPress={() => setRole(r.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={`flex-1 items-center rounded-md py-2 ${selected ? "bg-primary" : ""}`}
              >
                <Text className={`text-sm font-medium ${selected ? "text-primary-foreground" : "text-foreground"}`}>
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </FormField>

      <ErrorBox message={error} />
    </FormSheet>
  );
}
