import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { DateField } from "@/components/DateField";
import { ErrorBox, FormField, FormSheet, INPUT_CLASS } from "@/components/FormSheet";
import { SelectField } from "@/components/SelectField";
import { ApiError } from "@/lib/api";
import { toDateOnlyString } from "@/lib/dates";
import { useCreateExpense } from "./api";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "./types";

const CATEGORY_ITEMS = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));

// Come AddExpenseModal del web.
export function AddExpenseForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateExpense();
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("ALTRO");
  const [date, setDate] = useState(toDateOnlyString(new Date()));

  useEffect(() => {
    if (!open) return;
    setError(null);
    setAmount("");
    setDescription("");
    setCategory("ALTRO");
    setDate(toDateOnlyString(new Date()));
  }, [open]);

  async function handleSubmit() {
    setError(null);
    try {
      await createMutation.mutateAsync({
        // "12,50" → 12.5: sul telefono la tastiera italiana usa la virgola.
        amount: parseFloat(amount.replace(",", ".")),
        description: description.trim(),
        category,
        // Come il web: la data scelta a mezzanotte UTC.
        date: `${date}T00:00:00.000Z`,
      });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Errore durante il salvataggio. Riprova.");
    }
  }

  return (
    <FormSheet
      open={open}
      title="Nuova spesa"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={createMutation.isPending}
      submitLabel="Aggiungi"
    >
      <FormField label="Importo (€) *">
        <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" className={INPUT_CLASS} />
      </FormField>

      <FormField label="Descrizione *">
        <TextInput value={description} onChangeText={setDescription} className={INPUT_CLASS} />
      </FormField>

      <SelectField
        label="Categoria"
        items={CATEGORY_ITEMS}
        value={category}
        onChange={(v) => setCategory(v as ExpenseCategory)}
        placeholder="Categoria"
      />

      <View>
        <DateField label="Data" value={date} onChange={(v) => v && setDate(v)} required />
      </View>

      <ErrorBox message={error} />
    </FormSheet>
  );
}
