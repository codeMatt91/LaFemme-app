import * as SecureStore from "expo-secure-store";

// Il token Bearer vive nel portachiavi (iOS) / Keystore (Android), mai in AsyncStorage.
const TOKEN_KEY = "lafemme.authToken";

export function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function setToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function deleteToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
