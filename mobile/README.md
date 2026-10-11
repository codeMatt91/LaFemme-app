# La Femme – app mobile (iOS e Android)

App Expo / React Native del backoffice La Femme. Parla con il backoffice Next.js
(la cartella principale di questo progetto) tramite le route `/api/mobile/*`.

## Avvio in sviluppo

1. Avvia il backoffice dalla cartella principale: `npm install && npm run dev -- -H 0.0.0.0`
   (`-H 0.0.0.0` rende il server raggiungibile dal telefono nella stessa rete Wi-Fi).
2. In questa cartella:
   ```bash
   cp .env.example .env      # poi metti in EXPO_PUBLIC_API_URL l'IP del computer, es. http://192.168.1.10:3000
   npm install
   npx expo start
   ```
3. Inquadra il QR code con l'app **Expo Go** (App Store / Play Store) e accedi
   con le stesse credenziali del backoffice web.

In produzione `EXPO_PUBLIC_API_URL` sarà l'URL HTTPS del backoffice su Vercel.

## Struttura

| Percorso | Cosa contiene |
|---|---|
| `src/app/` | Schermate (Expo Router, routing a file come l'App Router di Next) |
| `src/app/login.tsx` | Login: `POST /api/mobile/login`, token salvato con expo-secure-store |
| `src/app/(app)/(tabs)/` | Schede Calendario, Clienti, Altro |
| `src/app/(app)/finance.tsx` ecc. | Sezioni admin (Finanze, Dipendenti, Impostazioni), protette da `AdminOnly` |
| `src/features/calendar/` | Calendario: viste Mese/Settimana/Giorno, legenda prestazioni, modulo appuntamento (crea, modifica, elimina) |
| `src/features/customers/` | Clienti: elenco con ricerca, chiamata dal telefono, modulo crea/modifica, eliminazione |
| `src/auth/AuthProvider.tsx` | Stato della sessione, login/logout, verifica del token all'avvio (`GET /api/mobile/me`) |
| `src/lib/api.ts` | Client HTTP: aggiunge il token Bearer, gestisce errori e 401 |
| `tailwind.config.js` | Stessa palette del web, usata con NativeWind (`className`) |

## Aggiungere una funzione

1. Nel backoffice crea una route in `app/api/mobile/<nome>/route.ts` che chiama
   `requireMobileAuth(req)` (o `requireMobileAdmin`) da `lib/mobileAuth.ts`, valida
   l'input con Zod e risponde in JSON.
2. Qui usala con TanStack Query: `useQuery({ queryKey: [...], queryFn: () => api("/<nome>") })`.

## Comandi

```bash
npm run typecheck   # controllo dei tipi
npx expo-doctor     # controllo dipendenze e configurazione
npx expo install <pacchetto>   # aggiunge pacchetti nella versione compatibile con l'SDK
```
