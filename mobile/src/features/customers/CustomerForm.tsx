import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { DateField } from "@/components/DateField";
import { ApiError } from "@/lib/api";
import { useSaveCustomer } from "./api";
import type { Customer } from "./types";
import { ErrorBox, FormField, FormSheet, INPUT_CLASS } from "@/components/FormSheet";

interface Props {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

// Data proposta quando la data di nascita è vuota (evita di partire da oggi).
const BIRTH_DATE_START = new Date(1990, 0, 1);

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
    <FormSheet
      open={open}
      title={customer ? "Modifica cliente" : "Nuovo cliente"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saveMutation.isPending}
      submitLabel={customer ? "Aggiorna" : "Crea"}
    >
      <View className="flex-row gap-3">
        <FormField label="Nome *" inRow>
          <TextInput value={firstName} onChangeText={setFirstName} autoCapitalize="words" className={INPUT_CLASS} />
        </FormField>
        <FormField label="Cognome *" inRow>
          <TextInput value={lastName} onChangeText={setLastName} autoCapitalize="words" className={INPUT_CLASS} />
        </FormField>
      </View>

      <FormField label="Telefono">
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          placeholder="+39 333 000 0000"
          className={INPUT_CLASS}
        />
      </FormField>

      <DateField
        label="Data di nascita"
        value={birthDate}
        onChange={setBirthDate}
        maximumDate={new Date()}
        initialDate={BIRTH_DATE_START}
      />

      <FormField label="Email">
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
      </FormField>

      <FormField label="Note">
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholder="Allergie, preferenze, note varie..."
          className={`${INPUT_CLASS} min-h-[88px]`}
        />
      </FormField>

      <ErrorBox message={error} />
    </FormSheet>
  );
}
