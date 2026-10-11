import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/auth/AuthProvider";
import { ApiError } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { useTheme } from "@/theme/ThemeProvider";

const logo = require("../../assets/la-femme-logo.png");
const LOGO_RATIO = 1006 / 1200;

// Come lo sfondo della pagina di login web: from-rose-50 via-white to-pink-50
// (in tema scuro tinta unita).
const LIGHT_GRADIENT = ["#fff1f2", "#ffffff", "#fdf2f8"] as const;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { scheme, colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sul web il logo è nero e in tema scuro viene invertito: qui lo coloriamo.
  const logoTint = scheme === "dark" ? colors.foreground : undefined;
  const gradient = scheme === "dark" ? ([colors.background, colors.background] as const) : LIGHT_GRADIENT;

  async function handleSubmit() {
    if (!email || !password) return;
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 401
          ? "Credenziali non valide. Riprova."
          : e instanceof ApiError
            ? e.message
            : "Si è verificato un errore."
      );
      setSubmitting(false);
    }
  }

  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
          <ScrollView
            contentContainerClassName="flex-grow justify-center px-8 py-8"
            keyboardShouldPersistTaps="handled"
          >
            <View className="relative">
              {/* Watermark del logo, semi-trasparente, dietro a tutto il form */}
              <View pointerEvents="none" className="absolute -inset-x-24 inset-y-0 items-center justify-center">
                <Image
                  source={logo}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  resizeMode="contain"
                  style={{ width: "100%", aspectRatio: LOGO_RATIO, opacity: 0.08, tintColor: logoTint }}
                />
              </View>

              <View className="items-center">
                <Image
                  source={logo}
                  accessibilityLabel="La Femme"
                  resizeMode="contain"
                  style={{ height: 72, width: 72 * LOGO_RATIO, marginBottom: 16, tintColor: logoTint }}
                />
                <Text className="text-2xl font-bold text-foreground">Beauty Backoffice</Text>
                <Text className="mt-1 text-sm text-muted-foreground">Accedi al gestionale</Text>
              </View>

              <View className="mt-6 gap-4">
                <View className="gap-1">
                  <Text className="text-sm font-medium text-foreground">Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="tuamail@email.it"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    className="rounded-lg border border-input bg-background px-3 py-3 text-sm text-foreground"
                  />
                </View>

                <View className="gap-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-foreground">Password</Text>
                    <Pressable
                      onPress={() => Linking.openURL(`${API_URL}/forgot-password`)}
                      accessibilityRole="link"
                      hitSlop={8}
                    >
                      <Text className="text-xs text-primary">Password dimenticata?</Text>
                    </Pressable>
                  </View>
                  <View className="justify-center">
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="go"
                      onSubmitEditing={handleSubmit}
                      className="rounded-lg border border-input bg-background py-3 pl-3 pr-11 text-sm text-foreground"
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      accessibilityLabel={showPassword ? "Nascondi password" : "Mostra password"}
                      hitSlop={8}
                      className="absolute right-0 px-3"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  </View>
                </View>

                {error && (
                  <View className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
                    <Text className="text-sm text-destructive">{error}</Text>
                  </View>
                )}

                <Pressable
                  onPress={handleSubmit}
                  disabled={submitting}
                  accessibilityRole="button"
                  className="flex-row items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 disabled:opacity-50"
                >
                  {submitting && <ActivityIndicator size="small" color={colors.primaryForeground} />}
                  <Text className="text-sm font-medium text-primary-foreground">
                    {submitting ? "Accesso in corso..." : "Accedi"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
