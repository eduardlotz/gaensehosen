import { Button, FullScreenDialog, ModalCloseButton, Text } from "../ui";
import { t } from "../../i18n/messages";
import type { Locale, Quote } from "../../store/collectionStore";
import { serializeQuotesCsv } from "../../utils/quoteCsv";
import styles from "./ExportModal.module.css";

type ExportModalProps = {
  locale: Locale;
  open: boolean;
  quotes: Quote[];
  onClose: () => void;
};

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportModal({
  locale,
  open,
  quotes,
  onClose,
}: ExportModalProps) {
  if (!open) {
    return null;
  }

  function exportJson() {
    download(
      "gaensehosen-quotes.json",
      JSON.stringify(quotes, null, 2),
      "application/json",
    );
  }

  function exportCsv() {
    download(
      "gaensehosen-quotes.csv",
      serializeQuotesCsv(quotes),
      "text/csv;charset=utf-8",
    );
  }

  return (
    <FullScreenDialog
      aria-labelledby="export-dialog-title"
      contentClassName={styles.modal}
      onClose={onClose}
    >
      <ModalCloseButton
        aria-label={t(locale, "cancel")}
        onClick={onClose}
        title={t(locale, "cancel")}
      />

      <div className={styles.content}>
        <Text
          as="h2"
          className={styles.title}
          id="export-dialog-title"
          variant="title"
        >
          <span className={styles.quoteMark}>„</span>
          {t(locale, "exportTitle")}
          <span className={styles.quoteMark}>“</span>
        </Text>
        <Text className={styles.intro} tone="muted" variant="body">
          {t(locale, "exportIntro")}
        </Text>

        <div className={styles.actions}>
          <Button className={styles.exportButton} onClick={exportJson}>
            {t(locale, "exportJson")}
          </Button>
          <Button className={styles.exportButton} onClick={exportCsv}>
            {t(locale, "exportCsv")}
          </Button>
        </div>
      </div>
    </FullScreenDialog>
  );
}
