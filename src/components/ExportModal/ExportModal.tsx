import {
  Button,
  FillRow,
  IconButton,
  ModalBackdrop,
  ModalSurface,
  SvgIcon,
  Text,
} from "../ui";
import { t } from "../../i18n/messages";
import plusIcon from "../../icons/plus.svg?raw";
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
    <ModalBackdrop>
      <ModalSurface aria-modal="true" className={styles.modal} role="dialog">
        <FillRow align="start" className={styles.header} gap="xs">
          <div>
            <Text as="h2" className={styles.title} variant="title">
              {t(locale, "exportTitle")}
            </Text>
          </div>
          <IconButton
            className={styles.iconButton}
            onClick={onClose}
            title={t(locale, "cancel")}
          >
            <SvgIcon className={styles.searchClearIcon} svg={plusIcon} />
          </IconButton>
        </FillRow>

        <div className={styles.actions}>
          <Button className={styles.exportButton} onClick={exportJson}>
            {t(locale, "exportJson")}
          </Button>
          <Button className={styles.exportButton} onClick={exportCsv}>
            {t(locale, "exportCsv")}
          </Button>
        </div>
      </ModalSurface>
    </ModalBackdrop>
  );
}
