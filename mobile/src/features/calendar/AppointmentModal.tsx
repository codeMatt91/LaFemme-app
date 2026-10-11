import Ionicons from "@expo/vector-icons/Ionicons";
import { addMinutes } from "date-fns";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateTimeField } from "@/components/DateTimeField";
import { SelectField } from "@/components/SelectField";
import { ApiError } from "@/lib/api";
import { useCustomers } from "@/features/customers/api";
import { useDeleteAppointment, useSaveAppointment } from "./api";
import type { Appointment, PaymentStatus, Person, ServiceType } from "./types";
import { useTheme } from "@/theme/ThemeProvider";
import { ThemedModal } from "@/components/ThemedModal";

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "PAID", label: "Pagato" },
  { value: "PENDING", label: "Da pagare" },
  { value: "OPTIONAL", label: "Opzionale" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  /** Giorno (ed eventualmente ora) toccato nel calendario per un nuovo appuntamento. */
  defaultDate?: Date;
  employees: Person[];
  serviceTypes: ServiceType[];
}

// Orario iniziale di un nuovo appuntamento: l'ora dello slot toccato nelle
// viste settimana/giorno, altrimenti le 9:00 come sul web; durata 1 ora.
function defaultTimes(defaultDate?: Date): { start: Date; end: Date } {
  const start = new Date(defaultDate ?? new Date());
  if (!defaultDate || (start.getHours() === 0 && start.getMinutes() === 0)) start.setHours(9, 0, 0, 0);
  return { start, end: addMinutes(start, 60) };
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError ? e.message : fallback;
}

export function AppointmentModal({ open, onClose, appointment, defaultDate, employees, serviceTypes }: Props) {
  const { colors } = useTheme();
  const customersQuery = useCustomers(open);
  const saveMutation = useSaveAppointment();
  const deleteMutation = useDeleteAppointment();
  const loading = saveMutation.isPending || deleteMutation.isPending;

  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [price, setPrice] = useState("0");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");
  const [notes, setNotes] = useState("");

  // Riallinea il modulo ogni volta che si apre su un appuntamento o uno slot diverso.
  useEffect(() => {
    if (!open) return;
    const defaults = defaultTimes(defaultDate);
    setError(null);
    setCustomerId(appointment?.customerId ?? "");
    setEmployeeId(appointment?.employeeId ?? "");
    setServiceType(appointment?.serviceType ?? "");
    setStartTime(appointment ? new Date(appointment.startTime) : defaults.start);
    setEndTime(appointment ? new Date(appointment.endTime) : defaults.end);
    setPrice(appointment?.price ?? "0");
    setPaymentStatus(appointment?.paymentStatus ?? "PENDING");
    setNotes(appointment?.notes ?? "");
  }, [open, appointment, defaultDate]);

  // Scegliendo la prestazione si compilano prezzo e (se nota) la fine.
  function handleServiceTypeChange(name: string) {
    setServiceType(name);
    const found = serviceTypes.find((s) => s.name === name);
    if (found) setPrice(found.defaultPrice);
    if (found?.durationMinutes != null) setEndTime(addMinutes(startTime, found.durationMinutes));
  }

  function handleStartTimeChange(value: Date) {
    setStartTime(value);
    const found = serviceTypes.find((s) => s.name === serviceType);
    if (found?.durationMinutes != null) setEndTime(addMinutes(value, found.durationMinutes));
  }

  async function handleSubmit() {
    if (!customerId) return setError("Seleziona un cliente");
    if (!serviceType) return setError("Seleziona una prestazione.");
    setError(null);
    try {
      await saveMutation.mutateAsync({
        id: appointment?.id,
        data: {
          customerId,
          employeeId: employeeId || null,
          serviceType,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          price: parseFloat(price.replace(",", ".")),
          paymentStatus,
          notes: notes || null,
        },
      });
      onClose();
    } catch (e) {
      setError(errorMessage(e, "Errore durante il salvataggio. Riprova."));
    }
  }

  function handleDelete() {
    if (!appointment) return;
    Alert.alert("Elimina appuntamento", "Sei sicuro di voler eliminare questo appuntamento?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(appointment.id);
            onClose();
          } catch (e) {
            setError(errorMessage(e, "Errore durante l'eliminazione. Riprova."));
          }
        },
      },
    ]);
  }

  const customerItems = (customersQuery.data ?? []).map((c) => ({
    value: c.id,
    label: `${c.lastName} ${c.firstName}`,
  }));
  // Un appuntamento esistente mostra il suo cliente anche prima che l'elenco sia caricato.
  if (appointment && !customerItems.some((c) => c.value === appointment.customerId)) {
    customerItems.unshift({
      value: appointment.customerId,
      label: `${appointment.customer.lastName} ${appointment.customer.firstName}`,
    });
  }

  return (
    <ThemedModal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
          <Text className="font-semibold text-foreground">
            {appointment ? "Modifica appuntamento" : "Nuovo appuntamento"}
          </Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Chiudi" hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          <ScrollView contentContainerClassName="gap-4 p-5" keyboardShouldPersistTaps="handled">
            <SelectField
              label="Cliente *"
              items={customerItems}
              value={customerId}
              onChange={setCustomerId}
              placeholder={customersQuery.isLoading ? "Caricamento clienti..." : "Seleziona cliente"}
              searchable
              searchPlaceholder="Cerca cliente per nome o cognome..."
              emptyMessage="Nessun cliente trovato"
            />

            <SelectField
              label="Operatrice"
              items={[
                { value: "", label: "Nessuna assegnazione" },
                ...employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` })),
              ]}
              value={employeeId}
              onChange={setEmployeeId}
              placeholder="Nessuna assegnazione"
            />

            <SelectField
              label="Prestazione *"
              items={serviceTypes.map((s) => ({ value: s.name, label: s.name }))}
              value={serviceType}
              onChange={handleServiceTypeChange}
              placeholder="Seleziona prestazione"
            />

            <DateTimeField label="Inizio *" value={startTime} onChange={handleStartTimeChange} />
            <DateTimeField label="Fine *" value={endTime} onChange={setEndTime} />

            <View className="flex-row gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-sm font-medium text-foreground">Prezzo (€)</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  className="rounded-lg border border-input px-3 py-3 text-foreground"
                />
              </View>
              <View className="flex-1">
                <SelectField
                  label="Pagamento"
                  items={PAYMENT_OPTIONS}
                  value={paymentStatus}
                  onChange={(v) => setPaymentStatus(v as PaymentStatus)}
                  placeholder="Pagamento"
                />
              </View>
            </View>

            <View className="gap-1">
              <Text className="text-sm font-medium text-foreground">Note</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                className="min-h-[64px] rounded-lg border border-input px-3 py-3 text-foreground"
              />
            </View>

            {error && (
              <View className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            )}

            <View className="flex-row items-center gap-2 pt-1">
              {appointment && (
                <Pressable
                  onPress={handleDelete}
                  disabled={loading}
                  accessibilityRole="button"
                  className="flex-row items-center gap-1.5 rounded-lg border border-destructive/20 px-3 py-2.5"
                >
                  <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                  <Text className="text-sm font-medium text-destructive">Elimina</Text>
                </Pressable>
              )}
              <View className="flex-1" />
              <Pressable onPress={onClose} accessibilityRole="button" className="rounded-lg bg-muted px-4 py-2.5">
                <Text className="text-sm font-medium text-foreground">Annulla</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                accessibilityRole="button"
                className="min-w-[88px] items-center rounded-lg bg-primary px-4 py-2.5 disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-sm font-medium text-primary-foreground">
                    {appointment ? "Aggiorna" : "Crea"}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedModal>
  );
}
