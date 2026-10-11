// Regole per la foto profilo, condivise da actions/profile.ts e dalla route
// mobile app/api/mobile/profile. Restituisce il messaggio d'errore o null.
const VALID_PREFIX = /^data:image\/(jpeg|png|svg\+xml);base64,/;

// base64 encodes 3 bytes as 4 chars; 10 MB * 4/3 ≈ 13 981 013 chars
const MAX_DATA_URL_LENGTH = 13_981_013;

export function validateProfileImage(dataUrl: unknown): string | null {
  if (typeof dataUrl !== "string" || !VALID_PREFIX.test(dataUrl)) {
    return "Formato immagine non valido. Usa JPEG, PNG o SVG.";
  }
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    return "L'immagine supera il limite di 10 MB.";
  }
  return null;
}
