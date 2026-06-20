import { Menu } from "@base-ui/react/menu";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type {
  ChangeEvent,
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import backArrowIcon from "../icons/back-arrow.svg?raw";
import exportIcon from "../icons/export-arrow.svg?raw";
import fileIcon from "../icons/file.svg?raw";
import globeIcon from "../icons/globe.svg?raw";
import moonIcon from "../icons/moon.svg?raw";
import plusIcon from "../icons/plus.svg?raw";
import questionCircleIcon from "../icons/question-circle.svg?raw";
import searchIcon from "../icons/search.svg?raw";
import sunIcon from "../icons/sun.svg?raw";
import threeDotsIcon from "../icons/three-dots.svg?raw";
import trashIcon from "../icons/trash.svg?raw";
import pondDrawingUrl from "../illustrations/pond-drawing.svg";
import { Brand } from "../components/Brand";
import {
  Controls,
  type MobileControlOptionsOpen,
} from "../components/Controls";
import { ExportModal } from "../components/ExportModal";
import { PrimaryQuoteButton } from "../components/PrimaryQuoteButton";
import { WelcomeSlider, type WelcomeSlide } from "../components/WelcomeSlider";
import { Button, Page, Section, SvgIcon, Text } from "../components/ui";
import { QuoteFormModal } from "../components/QuoteFormModal";
import { t } from "../i18n/messages";
import { useIsMobile } from "../hooks/useIsMobile";
import { useCollectionStore } from "../store/collectionStore";
import type {
  FontSize,
  GridMode,
  Locale,
  Quote,
  ThemeName,
} from "../store/collectionStore";
import { parseQuotesCsv } from "../utils/quoteCsv";
import styles from "./AppPage.module.css";

const quoteFormId = "quote-form";
type FormMode = "closed" | "add" | "edit";

export function AppPage() {
  const {
    addQuote,
    fontSize,
    gridMode,
    importQuotes,
    locale,
    removeQuote,
    resetApp,
    quotes,
    setFontSize,
    setGridMode,
    setLocale,
    setTheme,
    theme,
    updateQuote,
  } = useCollectionStore();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [mobileOptionsOpen, setMobileOptionsOpen] =
    useState<MobileControlOptionsOpen>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const activeGridMode = normalizeGridMode(gridMode);
  const formMode: FormMode = formOpen
    ? editingQuote
      ? "edit"
      : "add"
    : "closed";

  const filteredQuotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return quotes;
    }

    return quotes.filter((quote) => {
      return `${quote.text} ${quote.source}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, quotes]);

  const hasQuotes = quotes.length > 0;
  const hasActiveSearch = query.trim().length > 0;
  const hasNoResults = hasQuotes && filteredQuotes.length === 0;
  const showClearSearchButton = hasNoResults && hasActiveSearch;
  const masonryColumns = {
    16: 5,
    24: 4,
    32: 3,
    40: 2,
  }[fontSize];
  const welcomeSlides = useMemo(() => getWelcomeSlides(locale), [locale]);

  function openCreateForm() {
    setEditingQuote(undefined);
    setFormOpen(true);
  }

  function openEditForm(quote: Quote) {
    setEditingQuote(quote);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingQuote(undefined);
  }

  function confirmResetApp() {
    resetApp();
    setQuery("");
    setExportOpen(false);
    setResetConfirmOpen(false);
    closeForm();
  }

  function openHelpDialog() {
    // Placeholder for the future help dialog.
  }

  function closeMobileOptionsFromOutside(
    event: ReactMouseEvent<HTMLElement> | ReactPointerEvent<HTMLElement>,
  ) {
    if (mobileOptionsOpen === null) {
      return;
    }

    if (
      event.target instanceof Element &&
      event.target.closest("[data-mobile-floating-controls]")
    ) {
      return;
    }

    setMobileOptionsOpen(null);
  }

  async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const importedQuotes = parseQuotesCsv(await file.text());

      if (importedQuotes.length > 0) {
        importQuotes(importedQuotes);
      }
    } catch {
      window.alert(t(locale, "importCsvError"));
    }
  }

  useEffect(() => {
    if (formOpen || !hasQuotes) {
      setMobileOptionsOpen(null);
    }
  }, [formOpen, hasQuotes]);

  useEffect(() => {
    if (!formOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeForm();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [formOpen]);

  useEffect(() => {
    if (!resetConfirmOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setResetConfirmOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [resetConfirmOpen]);

  return (
    <LayoutGroup id="quote-action-layout">
      <Page
        variant={hasQuotes ? "app" : "welcome"}
        data-form-mode={formMode}
        data-form-open={formOpen}
        onClickCapture={closeMobileOptionsFromOutside}
        onPointerDownCapture={closeMobileOptionsFromOutside}
      >
        {hasQuotes ? (
          <CollectionApp
            filteredQuotes={filteredQuotes}
            fontSize={fontSize}
            formMode={formMode}
            gridMode={activeGridMode}
            locale={locale}
            masonryColumns={masonryColumns}
            mobileOptionsOpen={mobileOptionsOpen}
            onFontSizeChange={setFontSize}
            onGridModeChange={setGridMode}
            onMobileOptionsOpenChange={setMobileOptionsOpen}
            onExportClick={() => setExportOpen(true)}
            onHelpClick={openHelpDialog}
            onImportClick={() => importInputRef.current?.click()}
            onLocaleChange={setLocale}
            onQuoteClick={openEditForm}
            onResetClick={() => setResetConfirmOpen(true)}
            onThemeChange={setTheme}
            formOpen={formOpen}
            query={query}
            setQuery={setQuery}
            theme={theme}
          />
        ) : (
          <WelcomeScreen
            formOpen={formOpen}
            locale={locale}
            onHelpClick={openHelpDialog}
            onImportClick={() => importInputRef.current?.click()}
            onLocaleChange={setLocale}
            welcomeSlides={welcomeSlides}
          />
        )}

        <input
          accept=".csv,text/csv"
          className={styles.importInput}
          onChange={handleImportFileChange}
          ref={importInputRef}
          type="file"
        />

        <AnimatePresence initial={false}>
          {!formOpen && hasQuotes && mobileOptionsOpen ? (
            <PrimaryQuoteButton
              data-mobile-floating-controls=""
              key={`close-${mobileOptionsOpen}-controls-button`}
              state={{
                kind:
                  mobileOptionsOpen === "grid"
                    ? "closeLeftControls"
                    : "closeRightControls",
                label: t(
                  locale,
                  mobileOptionsOpen === "grid"
                    ? "closeControls"
                    : "closeFontSizeControls",
                ),
                onClick: () => setMobileOptionsOpen(null),
                position: "fixed",
              }}
            />
          ) : !formOpen && showClearSearchButton ? (
            <PrimaryQuoteButton
              key="clear-search-button"
              state={{
                kind: "clearSearch",
                label: t(locale, "clearSearch"),
                onClick: () => setQuery(""),
                position: "fixed",
              }}
            />
          ) : !formOpen ? (
            <PrimaryQuoteButton
              key="open-quote-form-button"
              state={{
                kind: "add",
                label: t(locale, "addQuote"),
                onClick: openCreateForm,
                position: "fixed",
              }}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {formOpen ? (
            <QuoteFormModal
              formId={quoteFormId}
              key="quote-form"
              locale={locale}
              onClose={closeForm}
              onDelete={
                editingQuote
                  ? () => {
                      removeQuote(editingQuote.id);
                    }
                  : undefined
              }
              onSave={(quote) => {
                if (editingQuote) {
                  updateQuote(editingQuote.id, quote);
                } else {
                  addQuote(quote);
                }
              }}
              open={formOpen}
              quote={editingQuote}
            />
          ) : null}
        </AnimatePresence>

        <ExportModal
          locale={locale}
          onClose={() => setExportOpen(false)}
          open={exportOpen}
          quotes={quotes}
        />

        <AnimatePresence initial={false}>
          {resetConfirmOpen ? (
            <ResetConfirmDialog
              locale={locale}
              onCancel={() => setResetConfirmOpen(false)}
              onConfirm={confirmResetApp}
            />
          ) : null}
        </AnimatePresence>
      </Page>
    </LayoutGroup>
  );
}

function normalizeGridMode(gridMode: string): GridMode {
  if (
    gridMode === "masonry" ||
    gridMode === "focus" ||
    gridMode === "grid" ||
    gridMode === "list"
  ) {
    return gridMode;
  }

  return "grid";
}

type CollectionAppProps = {
  filteredQuotes: Quote[];
  fontSize: FontSize;
  formMode: FormMode;
  gridMode: GridMode;
  formOpen: boolean;
  locale: Locale;
  masonryColumns: number;
  mobileOptionsOpen: MobileControlOptionsOpen;
  query: string;
  theme: ThemeName;
  onFontSizeChange: (fontSize: FontSize) => void;
  onGridModeChange: (gridMode: GridMode) => void;
  onMobileOptionsOpenChange: (open: MobileControlOptionsOpen) => void;
  onExportClick: () => void;
  onHelpClick: () => void;
  onImportClick: () => void;
  onLocaleChange: (locale: Locale) => void;
  onQuoteClick: (quote: Quote) => void;
  onResetClick: () => void;
  onThemeChange: (theme: ThemeName) => void;
  setQuery: (query: string) => void;
};

function CollectionApp({
  filteredQuotes,
  fontSize,
  formMode,
  formOpen,
  gridMode,
  locale,
  masonryColumns,
  mobileOptionsOpen,
  onExportClick,
  onFontSizeChange,
  onGridModeChange,
  onMobileOptionsOpenChange,
  onHelpClick,
  onImportClick,
  onLocaleChange,
  onQuoteClick,
  onResetClick,
  onThemeChange,
  query,
  setQuery,
  theme,
}: CollectionAppProps) {
  const hasNoResults = filteredQuotes.length === 0;
  const isMobile = useIsMobile();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchActive = isMobile && (mobileSearchOpen || query.length > 0);

  function openMobileSearch() {
    if (!isMobile) {
      return;
    }

    setMobileSearchOpen(true);
    onMobileOptionsOpenChange(null);
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);

    if (isMobile) {
      setMobileSearchOpen(true);
    }
  }

  function handleSearchClear() {
    setQuery("");

    if (isMobile) {
      setMobileSearchOpen(false);
      searchInputRef.current?.blur();
    }
  }

  function handleSearchBlur(event: ReactFocusEvent<HTMLDivElement>) {
    const nextFocusedElement = event.relatedTarget;

    if (
      !isMobile ||
      query.length > 0 ||
      (nextFocusedElement instanceof Node &&
        event.currentTarget.contains(nextFocusedElement))
    ) {
      return;
    }

    setMobileSearchOpen(false);
  }

  return (
    <>
      <header
        className={styles.navbar}
        data-mobile-search-open={mobileSearchActive ? "true" : undefined}
      >
        <div
          className={styles.searchBox}
          data-focus-ring="within"
          onBlur={handleSearchBlur}
          onClick={() => searchInputRef.current?.focus()}
        >
          <SvgIcon className={styles.searchIcon} svg={searchIcon} />
          <input
            aria-label={t(locale, "search")}
            className={styles.searchInput}
            onChange={handleSearchChange}
            onFocus={openMobileSearch}
            placeholder={t(locale, "search")}
            ref={searchInputRef}
            type="search"
            value={query}
          />
          {query ? (
            <Button
              aria-label={t(locale, "clearSearch")}
              className={styles.searchClearButton}
              icon={
                <SvgIcon className={styles.searchClearIcon} svg={plusIcon} />
              }
              onClick={(event) => {
                event.stopPropagation();
                handleSearchClear();
              }}
              onMouseDown={(event) => event.preventDefault()}
              size="small"
              title={t(locale, "clearSearch")}
              type="button"
              variant="flat"
            />
          ) : null}
        </div>

        <div className={styles.navBrand}>
          <Brand locale={locale} />
        </div>

        <div className={styles.navControls}>
          <Menu.Root modal={false}>
            <Menu.Trigger
              className={styles.optionsButton}
              title={t(locale, "options")}
              type="button"
            >
              <span>{t(locale, "options")}</span>
              <SvgIcon className={styles.buttonIcon} svg={threeDotsIcon} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner
                align="end"
                className={styles.actionMenuPositioner}
                sideOffset={8}
              >
                <Menu.Popup className={styles.actionMenu}>
                  <Menu.Item
                    className={styles.actionMenuItem}
                    onClick={onHelpClick}
                  >
                    <SvgIcon
                      className={styles.buttonIcon}
                      svg={questionCircleIcon}
                    />
                    <span>{t(locale, "help")}</span>
                  </Menu.Item>
                  <Menu.Item
                    className={styles.actionMenuItem}
                    onClick={() =>
                      onLocaleChange(locale === "en" ? "de" : "en")
                    }
                  >
                    <SvgIcon className={styles.buttonIcon} svg={globeIcon} />
                    <span>{t(locale, "language")}</span>
                  </Menu.Item>
                  <Menu.Item
                    className={styles.actionMenuItem}
                    onClick={() =>
                      onThemeChange(theme === "light" ? "dark" : "light")
                    }
                  >
                    <SvgIcon
                      className={styles.buttonIcon}
                      svg={theme === "light" ? moonIcon : sunIcon}
                    />
                    <span>{t(locale, "theme")}</span>
                  </Menu.Item>

                  <Menu.Item
                    className={styles.actionMenuItem}
                    onClick={onExportClick}
                  >
                    <SvgIcon className={styles.buttonIcon} svg={exportIcon} />
                    <span>{t(locale, "export")}</span>
                  </Menu.Item>
                  <Menu.Item
                    className={styles.actionMenuItem}
                    onClick={onImportClick}
                  >
                    <SvgIcon className={styles.buttonIcon} svg={fileIcon} />
                    <span>{t(locale, "importQuotes")}</span>
                  </Menu.Item>

                  <Menu.Item
                    className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`}
                    onClick={onResetClick}
                  >
                    <SvgIcon className={styles.buttonIcon} svg={trashIcon} />
                    <span>{t(locale, "resetApp")}</span>
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </header>

      <Controls
        fontSize={fontSize}
        gridMode={gridMode}
        locale={locale}
        mobileOptionsOpen={mobileOptionsOpen}
        onFontSizeChange={onFontSizeChange}
        onGridModeChange={onGridModeChange}
        onMobileOptionsOpenChange={onMobileOptionsOpenChange}
      />

      {hasNoResults ? (
        <NoResultsScreen
          formMode={formMode}
          formOpen={formOpen}
          text={t(locale, "noResults")}
        />
      ) : (
        <QuoteResultsLayout
          filteredQuotes={filteredQuotes}
          fontSize={fontSize}
          formMode={formMode}
          formOpen={formOpen}
          gridMode={gridMode}
          masonryColumns={masonryColumns}
          onQuoteClick={onQuoteClick}
        />
      )}
    </>
  );
}

type QuoteResultsLayoutProps = {
  filteredQuotes: Quote[];
  fontSize: FontSize;
  formMode: FormMode;
  formOpen: boolean;
  gridMode: GridMode;
  masonryColumns: number;
  onQuoteClick: (quote: Quote) => void;
};

function QuoteResultsLayout({
  filteredQuotes,
  fontSize,
  formMode,
  formOpen,
  gridMode,
  masonryColumns,
  onQuoteClick,
}: QuoteResultsLayoutProps) {
  if (gridMode === "focus") {
    return (
      <FocusQuoteList
        formOpen={formOpen}
        formMode={formMode}
        fontSize={fontSize}
        onQuoteClick={onQuoteClick}
        quotes={filteredQuotes}
      />
    );
  }

  return (
    <section
      className={styles.quoteGrid}
      data-form-active={formOpen}
      data-form-mode={formMode}
      data-font={fontSize}
      data-grid={gridMode}
      style={
        {
          "--masonry-columns": String(masonryColumns),
          "--quote-font-size": `${fontSize}px`,
        } as CSSProperties
      }
    >
      {filteredQuotes.map((quote) => (
        <button
          className={styles.quoteCard}
          key={quote.id}
          onClick={() => onQuoteClick(quote)}
          type="button"
        >
          <Text className={styles.quoteText} variant="quote">
            <span className={`${styles.quoteMark} ${styles.openingQuoteMark}`}>
              „
            </span>
            {quote.text}
            <span className={styles.quoteMark}>“</span>
          </Text>
          {quote.source.trim() ? (
            <Text
              as="strong"
              className={styles.quoteSource}
              variant="quoteSource"
            >
              {quote.source}
            </Text>
          ) : null}
        </button>
      ))}
    </section>
  );
}

type ResetConfirmDialogProps = {
  locale: Locale;
  onCancel: () => void;
  onConfirm: () => void;
};

function ResetConfirmDialog({
  locale,
  onCancel,
  onConfirm,
}: ResetConfirmDialogProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={styles.resetDialogBackdrop}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onMouseDown={onCancel}
      role="presentation"
      transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <motion.div
        aria-labelledby="reset-dialog-title"
        aria-modal="true"
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={styles.resetDialog}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Text
          as="h2"
          className={styles.resetDialogTitle}
          id="reset-dialog-title"
          variant="title"
        >
          {t(locale, "resetAppTitle")}
        </Text>

        <div className={styles.resetDialogActions}>
          <Button
            icon={<SvgIcon svg={trashIcon} />}
            onClick={onConfirm}
            type="button"
            variant="danger"
          >
            {t(locale, "resetAppConfirm")}
          </Button>
          <Button
            icon={<SvgIcon svg={backArrowIcon} />}
            onClick={onCancel}
            type="button"
            variant="default"
          >
            {t(locale, "resetAppCancel")}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

type NoResultsScreenProps = {
  formMode: FormMode;
  formOpen: boolean;
  text: string;
};

function NoResultsScreen({ formMode, formOpen, text }: NoResultsScreenProps) {
  return (
    <section
      aria-live="polite"
      className={styles.noResultsScreen}
      data-form-active={formOpen}
      data-form-mode={formMode}
    >
      <Text as="h1" className={styles.noResultsText} variant="empty">
        {text}
      </Text>
      <AnimatedPondDrawing />
    </section>
  );
}

function AnimatedPondDrawing() {
  return (
    <svg
      aria-hidden="true"
      className={styles.pondDrawing}
      fill="none"
      focusable="false"
      viewBox="0 0 400 400"
    >
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="420"
          id="pond-water-motion"
          width="420"
          x="-10"
          y="-10"
        >
          <feTurbulence
            baseFrequency="0.008 0.024"
            numOctaves="2"
            result="waterNoise"
            seed="9"
            type="fractalNoise"
          >
            <animate
              attributeName="baseFrequency"
              dur="18s"
              repeatCount="indefinite"
              values="0.008 0.024; 0.014 0.036; 0.01 0.028; 0.008 0.024"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="waterNoise"
            scale="9"
            xChannelSelector="R"
            yChannelSelector="G"
          >
            <animate
              attributeName="scale"
              dur="14s"
              repeatCount="indefinite"
              values="7; 12; 8.5; 7"
            />
          </feDisplacementMap>
        </filter>
      </defs>
      <image
        className={styles.pondDrawingWaterLayer}
        filter="url(#pond-water-motion)"
        height="400"
        href={pondDrawingUrl}
        width="400"
      />
    </svg>
  );
}

type WelcomeScreenProps = {
  formOpen: boolean;
  locale: Locale;
  welcomeSlides: WelcomeSlide[];
  onHelpClick: () => void;
  onImportClick: () => void;
  onLocaleChange: (locale: Locale) => void;
};

function WelcomeScreen({
  formOpen,
  locale,
  onHelpClick,
  onImportClick,
  onLocaleChange,
  welcomeSlides,
}: WelcomeScreenProps) {
  return (
    <>
      <header className={styles.emptyHeader}>
        <Brand locale={locale} />
      </header>

      <Section
        className={styles.emptyContent}
        data-form-active={formOpen}
        size="wide"
      >
        <WelcomeSlider slides={welcomeSlides} />

        <motion.div className={styles.rule} />

        <Text className={styles.intro} tone="muted" variant="body">
          {t(locale, "intro")}
        </Text>

        <WelcomeActions
          locale={locale}
          onHelpClick={onHelpClick}
          onImportClick={onImportClick}
          onLocaleChange={onLocaleChange}
        />
      </Section>
    </>
  );
}

type WelcomeActionsProps = {
  locale: Locale;
  onHelpClick: () => void;
  onImportClick: () => void;
  onLocaleChange: (locale: Locale) => void;
};

function WelcomeActions({
  locale,
  onHelpClick,
  onImportClick,
  onLocaleChange,
}: WelcomeActionsProps) {
  return (
    <section className={styles.welcomeActions}>
      <div className={styles.localeSwitch} aria-label={t(locale, "language")}>
        <div className={styles.localeButtons}>
          <button
            className={styles.localeButton}
            data-active={locale === "en"}
            onClick={() => onLocaleChange("en")}
            type="button"
          >
            <span className={styles.localeButtonContent}>EN</span>
          </button>
          <button
            className={styles.localeButton}
            data-active={locale === "de"}
            onClick={() => onLocaleChange("de")}
            type="button"
          >
            <span className={styles.localeButtonContent}>DE</span>
          </button>
        </div>
      </div>

      <div className={styles.welcomeActionButtons}>
        <Button
          icon={<SvgIcon className={styles.buttonIcon} svg={fileIcon} />}
          onClick={onImportClick}
          size="small"
          type="button"
          variant="flat"
        >
          {t(locale, "importQuotes")}
        </Button>
        <Button
          icon={
            <SvgIcon className={styles.buttonIcon} svg={questionCircleIcon} />
          }
          onClick={onHelpClick}
          size="small"
          type="button"
          variant="flat"
        >
          {t(locale, "help")}
        </Button>
      </div>
    </section>
  );
}

function getWelcomeSlides(locale: Locale): WelcomeSlide[] {
  if (locale === "en") {
    return [
      {
        text: t(locale, "heroQuote"),
        source: t(locale, "heroSource"),
      },
      {
        text: "Do what you can, with what you have, where you are.",
        source: "Theodore Roosevelt",
      },
      {
        text: "Simplicity is the ultimate sophistication.",
        source: "Leonardo da Vinci",
      },
    ];
  }

  return [
    {
      text: t(locale, "heroQuote"),
      source: t(locale, "heroSource"),
    },
    {
      text: "Was man nicht aufgibt, hat man nie verloren.",
      source: "Friedrich Schiller",
    },
    {
      text: "Hat man sein warum des Lebens, so verträgt man sich fast mit jedem wie",
      source: "Friedrich Nietzsche",
    },
  ];
}

type FocusQuoteListProps = {
  formOpen: boolean;
  formMode: FormMode;
  fontSize: number;
  quotes: Quote[];
  onQuoteClick: (quote: Quote) => void;
};

function FocusQuoteList({
  fontSize,
  formMode,
  formOpen,
  quotes,
  onQuoteClick,
}: FocusQuoteListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const visibleIndexes = useRef(new Set<number>());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [visibleVersion, setVisibleVersion] = useState(0);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, quotes.length);
    visibleIndexes.current = new Set();
    setFocusedIndex(0);
    setVisibleVersion((version) => version + 1);
  }, [quotes.length]);

  useLayoutEffect(() => {
    const root = containerRef.current;

    if (!root) {
      return;
    }

    function updateSnapPadding() {
      const root = containerRef.current;
      const firstItem = itemRefs.current[0];
      const lastItem = itemRefs.current[quotes.length - 1];

      if (!root) {
        return;
      }

      const rootHeight = root.clientHeight;
      const startPadding = firstItem
        ? Math.max(0, (rootHeight - firstItem.offsetHeight) / 2)
        : 0;
      const endPadding = lastItem
        ? Math.max(0, (rootHeight - lastItem.offsetHeight) / 2)
        : startPadding;

      root.style.setProperty("--focus-padding-start", `${startPadding}px`);
      root.style.setProperty("--focus-padding-end", `${endPadding}px`);
    }

    updateSnapPadding();

    const resizeObserver = new ResizeObserver(updateSnapPadding);
    resizeObserver.observe(root);
    itemRefs.current.forEach((item) => {
      if (item) {
        resizeObserver.observe(item);
      }
    });
    window.addEventListener("resize", updateSnapPadding);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSnapPadding);
    };
  }, [fontSize, quotes.length]);

  useEffect(() => {
    const root = containerRef.current;

    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;

        entries.forEach((entry) => {
          const index = Number((entry.target as HTMLElement).dataset.index);

          if (entry.isIntersecting) {
            if (!visibleIndexes.current.has(index)) {
              visibleIndexes.current.add(index);
              changed = true;
            }
          } else if (visibleIndexes.current.delete(index)) {
            changed = true;
          }
        });

        if (changed) {
          setVisibleVersion((version) => version + 1);
        }
      },
      {
        root,
        rootMargin: "120px 0px",
        threshold: 0.18,
      },
    );

    itemRefs.current.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, [quotes]);

  useEffect(() => {
    const root = containerRef.current;

    if (!root) {
      return;
    }

    const scrollRoot = root;
    let frame = 0;

    function updateFocus() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rootRect = scrollRoot.getBoundingClientRect();
        const center = rootRect.top + rootRect.height / 2;
        let nextFocusedIndex = focusedIndex;
        let nearestDistance = Number.POSITIVE_INFINITY;

        visibleIndexes.current.forEach((index) => {
          const item = itemRefs.current[index];

          if (!item) {
            return;
          }

          const rect = item.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          const distance = Math.abs(center - itemCenter);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nextFocusedIndex = index;
          }
        });

        setFocusedIndex(nextFocusedIndex);
      });
    }

    updateFocus();
    scrollRoot.addEventListener("scroll", updateFocus, { passive: true });
    window.addEventListener("resize", updateFocus);

    return () => {
      window.cancelAnimationFrame(frame);
      scrollRoot.removeEventListener("scroll", updateFocus);
      window.removeEventListener("resize", updateFocus);
    };
  }, [focusedIndex, visibleVersion]);

  return (
    <section
      className={styles.focusListShell}
      data-form-active={formOpen}
      data-form-mode={formMode}
      style={{ "--quote-font-size": `${fontSize}px` } as CSSProperties}
    >
      <div className={styles.focusList} ref={containerRef}>
        <div className={styles.focusListInner}>
          {quotes.map((quote, index) => {
            const isVisible = visibleIndexes.current.has(index);
            const isFocused = focusedIndex === index;

            return (
              <button
                className={styles.focusQuoteCard}
                data-focus-state={
                  isFocused ? "focused" : isVisible ? "visible" : "hidden"
                }
                data-index={index}
                key={quote.id}
                onClick={() => onQuoteClick(quote)}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
              >
                <Text className={styles.quoteText} variant="quote">
                  <span
                    className={`${styles.quoteMark} ${styles.openingQuoteMark}`}
                  >
                    „
                  </span>
                  {quote.text}
                  <span className={styles.quoteMark}>“</span>
                </Text>
                {quote.source.trim() ? (
                  <Text
                    as="strong"
                    className={styles.quoteSource}
                    variant="quoteSource"
                  >
                    {quote.source}
                  </Text>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
