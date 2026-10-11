const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL non impostato: copia .env.example in .env e inserisci l'URL del backoffice."
  );
}

export const API_URL = apiUrl.replace(/\/+$/, "");
