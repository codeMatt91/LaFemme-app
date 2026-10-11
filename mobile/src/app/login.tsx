import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/auth/AuthProvider";
import { ApiError } from "@/lib/api";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Si è verificato un errore.");
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6"
      >
        <Text className="text-center text-3xl font-bold text-primary">La Femme</Text>
        <Text className="mb-8 mt-1 text-center text-muted-foreground">Accedi al backoffice</Text>

        <Text className="mb-1 text-sm font-medium text-foreground">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          className="mb-4 rounded-lg border border-input px-3 py-3 text-foreground"
        />

        <Text className="mb-1 text-sm font-medium text-foreground">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          onSubmitEditing={handleSubmit}
          className="mb-4 rounded-lg border border-input px-3 py-3 text-foreground"
        />

        {error && <Text className="mb-4 text-sm text-destructive">{error}</Text>}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting || !email || !password}
          accessibilityRole="button"
          className="items-center rounded-lg bg-primary py-3 disabled:opacity-50"
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-semibold text-primary-foreground">Accedi</Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
