import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { fetchFinance } from "./api";
import { buildReportHtml, reportFilename, reportRange, type ReportPeriod } from "./report";

// "Esporta mese / anno": come sul web usa sempre il mese o l'anno in corso,
// indipendentemente dai filtri. Crea il PDF e apre il menu Condividi del
// telefono (Salva su File, Mail, WhatsApp...).
export async function exportFinanceReport(period: ReportPeriod): Promise<void> {
  const now = new Date();
  const { from, to } = reportRange(period, now);
  const { summary, expenses } = await fetchFinance(from, to);
  const html = buildReportHtml(period, summary, expenses, now);

  // A4 in punti tipografici.
  const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });

  const pdf = new File(Paths.cache, reportFilename(period, now));
  await new File(uri).move(pdf, { overwrite: true });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Condivisione non disponibile su questo dispositivo.");
  }
  await Sharing.shareAsync(pdf.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "Report Finanziario",
  });
}
