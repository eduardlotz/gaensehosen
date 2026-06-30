import { Menu } from "@base-ui/react/menu";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type {
  ChangeEvent,
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefObject,
} from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import backArrowIcon from "../icons/back-arrow.svg?raw";
import exportIcon from "../icons/export-arrow.svg?raw";
import fileIcon from "../icons/file.svg?raw";
import globeIcon from "../icons/globe.svg?raw";
import moonIcon from "../icons/moon.svg?raw";
import plusIcon from "../icons/plus.svg?raw";
import questionCircleIcon from "../icons/question-circle.svg?raw";
import shortcutKeyIcon from "../icons/shortcut-key.svg?raw";
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
import { FloatingQuoteUtilityButton } from "../components/FloatingQuoteUtilityButton";
import { HelpModal } from "../components/HelpModal";
import { KeyboardShortcutKeys } from "../components/KeyboardShortcut";
import { PrimaryQuoteButton } from "../components/PrimaryQuoteButton";
import { WelcomeSlider, type WelcomeSlide } from "../components/WelcomeSlider";
import { ShortcutsDialog } from "../components/ShortcutsDialog";
import {
  Button,
  FullScreenDialog,
  ModalCloseButton,
  Page,
  Section,
  SvgIcon,
  Text,
} from "../components/ui";
import { QuoteFormModal } from "../components/QuoteFormModal";
import { createTranslator, getLocaleMessages } from "../i18n/translate";
import { useIsMobile } from "../hooks/useIsMobile";
import { useKeyPress } from "../hooks/useKeyPress";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { useCollectionStore } from "../store/collectionStore";
import type {
  FontSize,
  GridMode,
  Locale,
  Quote,
  ThemeName,
} from "../store/collectionStore";
import {
  getKeyboardShortcutItems,
  getPlatformModifierKey,
} from "../utils/keyboardShortcuts";
import { parseQuotesCsv, serializeQuotesCsv } from "../utils/quoteCsv";
import { appPageMessages } from "./AppPage.messages";
import styles from "./AppPage.module.css";

const quoteFormId = "quote-form";
const quoteResultsId = "quote-results";
type FormMode = "closed" | "add" | "edit";
type QuoteNavigationDirection = "down" | "left" | "right" | "up";

function downloadQuotesCsv(quotes: Quote[]) {
  const blob = new Blob([serializeQuotesCsv(quotes)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "gaensehosen-quotes.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AppPage() {
  const {
    addQuote,
    fontSize,
    gridMode,
    hasStartedCollection,
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
  const t = createTranslator(appPageMessages, locale);
  const messages = getLocaleMessages(appPageMessages, locale);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileOptionsOpen, setMobileOptionsOpen] =
    useState<MobileControlOptionsOpen>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | undefined>();
  const dialogReturnFocusRef = useRef<HTMLElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const activeGridMode = normalizeGridMode(gridMode);
  const shortcuts = getKeyboardShortcutItems(locale);
  const formMode: FormMode = formOpen
    ? editingQuote
      ? "edit"
      : "add"
    : "closed";

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
  }

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
  const showWelcome = hasStartedCollection === false && !hasQuotes;
  const modalOpen = formOpen || helpOpen || resetConfirmOpen || shortcutsOpen;
  const hasActiveSearch = query.trim().length > 0;
  const hasNoResults = hasQuotes && filteredQuotes.length === 0;
  const showClearSearchButton = hasNoResults && hasActiveSearch;
  const masonryColumns = {
    16: 5,
    24: 4,
    32: 3,
    40: 2,
  }[fontSize];
  const welcomeSlides = useMemo(() => messages.welcomeSlides, [messages]);

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
    setHelpOpen(false);
    setResetConfirmOpen(false);
    closeForm();
  }

  function openHelpDialog(returnFocusElement?: HTMLElement | null) {
    dialogReturnFocusRef.current = returnFocusElement ?? null;
    setHelpOpen(true);
  }

  function openShortcutsDialog(returnFocusElement?: HTMLElement | null) {
    dialogReturnFocusRef.current = returnFocusElement ?? null;
    setShortcutsOpen(true);
  }

  function openResetConfirmDialog(returnFocusElement?: HTMLElement | null) {
    dialogReturnFocusRef.current = returnFocusElement ?? null;
    setResetConfirmOpen(true);
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
      window.alert(t("importCsvError"));
    }
  }

  useEffect(() => {
    if (formOpen || !hasQuotes) {
      setMobileOptionsOpen(null);
    }
  }, [formOpen, hasQuotes]);

  useOutsideClick({
    enabled: mobileOptionsOpen !== null,
    ignoreSelector: "[data-mobile-floating-controls]",
    onOutsideClick: () => setMobileOptionsOpen(null),
  });

  useEffect(() => {
    if (!formOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [formOpen]);

  useKeyPress("Escape", closeForm, {
    enabled: formOpen,
    preventDefault: true,
  });

  useKeyPress("Q", openCreateForm, {
    enabled: !modalOpen,
    ignoreEditable: true,
    preventDefault: true,
  });

  return (
    <LayoutGroup id="quote-action-layout">
      <Page
        variant={showWelcome ? "welcome" : "app"}
        data-form-mode={formMode}
        data-form-open={formOpen}
      >
        {!showWelcome ? (
          <CollectionApp
            filteredQuotes={filteredQuotes}
            fontSize={fontSize}
            formMode={formMode}
            gridMode={activeGridMode}
            locale={locale}
            masonryColumns={masonryColumns}
            modalOpen={modalOpen}
            mobileOptionsOpen={mobileOptionsOpen}
            onFontSizeChange={setFontSize}
            onGridModeChange={setGridMode}
            onMobileOptionsOpenChange={setMobileOptionsOpen}
            onExportClick={() => downloadQuotesCsv(quotes)}
            onHelpClick={openHelpDialog}
            onImportClick={() => importInputRef.current?.click()}
            onLocaleChange={changeLocale}
            onQuoteClick={openEditForm}
            onResetClick={openResetConfirmDialog}
            onShortcutsClick={openShortcutsDialog}
            onThemeChange={setTheme}
            query={query}
            setQuery={setQuery}
            theme={theme}
          />
        ) : (
          <WelcomeScreen
            locale={locale}
            modalOpen={modalOpen}
            onHelpClick={openHelpDialog}
            onImportClick={() => importInputRef.current?.click()}
            onLocaleChange={changeLocale}
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
          {!formOpen && !showWelcome && mobileOptionsOpen ? (
            <FloatingQuoteUtilityButton
              data-mobile-floating-controls=""
              key="floating-quote-utility-button"
              state={{
                kind: "closeControls",
                label: t(
                  mobileOptionsOpen === "grid"
                    ? "closeControls"
                    : "closeFontSizeControls",
                ),
                onClick: () => setMobileOptionsOpen(null),
                side: mobileOptionsOpen === "grid" ? "right" : "left",
              }}
            />
          ) : !formOpen && showClearSearchButton ? (
            <FloatingQuoteUtilityButton
              key="floating-quote-utility-button"
              state={{
                kind: "clearSearch",
                label: t("clearSearch"),
                onClick: () => setQuery(""),
              }}
            />
          ) : !formOpen ? (
            <PrimaryQuoteButton
              key="open-quote-form-button"
              state={{
                kind: "add",
                label: t("addQuote"),
                onClick: openCreateForm,
                position: "fixed",
              }}
              shortcut={shortcuts.newQuote}
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

        <AnimatePresence initial={false}>
          {helpOpen ? (
            <HelpModal
              key="help-dialog"
              locale={locale}
              onClose={() => setHelpOpen(false)}
              open={helpOpen}
              restoreFocusRef={dialogReturnFocusRef}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {shortcutsOpen ? (
            <ShortcutsDialog
              key="shortcuts-dialog"
              locale={locale}
              onClose={() => setShortcutsOpen(false)}
              restoreFocusRef={dialogReturnFocusRef}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {resetConfirmOpen ? (
            <ResetConfirmDialog
              locale={locale}
              onCancel={() => setResetConfirmOpen(false)}
              onConfirm={confirmResetApp}
              restoreFocusRef={dialogReturnFocusRef}
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
  locale: Locale;
  masonryColumns: number;
  modalOpen: boolean;
  mobileOptionsOpen: MobileControlOptionsOpen;
  query: string;
  theme: ThemeName;
  onFontSizeChange: (fontSize: FontSize) => void;
  onGridModeChange: (gridMode: GridMode) => void;
  onMobileOptionsOpenChange: (open: MobileControlOptionsOpen) => void;
  onExportClick: () => void;
  onHelpClick: (returnFocusElement?: HTMLElement | null) => void;
  onImportClick: () => void;
  onLocaleChange: (locale: Locale) => void;
  onQuoteClick: (quote: Quote) => void;
  onResetClick: (returnFocusElement?: HTMLElement | null) => void;
  onShortcutsClick: (returnFocusElement?: HTMLElement | null) => void;
  onThemeChange: (theme: ThemeName) => void;
  setQuery: (query: string) => void;
};

type AppHeaderProps = {
  controls?: ReactNode;
  locale: Locale;
  mobileSearchActive?: boolean;
  search?: ReactNode;
};

function AppHeader({
  controls,
  locale,
  mobileSearchActive = false,
  search,
}: AppHeaderProps) {
  return (
    <header
      className={styles.navbar}
      data-mobile-search-open={mobileSearchActive ? "true" : undefined}
    >
      {search}

      <div className={styles.navBrand}>
        <Brand locale={locale} />
      </div>

      {controls}
    </header>
  );
}

function CollectionApp({
  filteredQuotes,
  fontSize,
  formMode,
  gridMode,
  locale,
  masonryColumns,
  modalOpen,
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
  onShortcutsClick,
  onThemeChange,
  query,
  setQuery,
  theme,
}: CollectionAppProps) {
  const t = createTranslator(appPageMessages, locale);
  const hasNoResults = filteredQuotes.length === 0;
  const isMobile = useIsMobile();
  const [actionMenuPointerActive, setActionMenuPointerActive] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const optionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchActive = isMobile && (mobileSearchOpen || query.length > 0);
  const shortcuts = getKeyboardShortcutItems(locale);
  const platformModifierKey = getPlatformModifierKey();
  const focusSearchShortcut = shortcuts.focusSearch;

  function focusSearch() {
    onMobileOptionsOpenChange(null);

    if (isMobile) {
      setMobileSearchOpen(true);
    }

    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }

  useKeyPress([platformModifierKey, "K"], focusSearch, {
    enabled: !modalOpen,
    preventDefault: true,
  });

  function selectFontSizeShortcut(nextFontSize: FontSize) {
    onMobileOptionsOpenChange(null);
    onFontSizeChange(nextFontSize);
  }

  function selectGridShortcut(nextGridMode: GridMode) {
    onMobileOptionsOpenChange(null);
    onGridModeChange(nextGridMode);
  }

  useKeyPress(
    [
      {
        action: () => selectFontSizeShortcut(16),
        keys: "1",
        preventDefault: true,
      },
      {
        action: () => selectFontSizeShortcut(24),
        keys: "2",
        preventDefault: true,
      },
      {
        action: () => selectFontSizeShortcut(32),
        keys: "3",
        preventDefault: true,
      },
      {
        action: () => selectFontSizeShortcut(40),
        keys: "4",
        preventDefault: true,
      },
      {
        action: () => selectGridShortcut("masonry"),
        keys: "M",
        preventDefault: true,
      },
      {
        action: () => selectGridShortcut("grid"),
        keys: "G",
        preventDefault: true,
      },
      {
        action: () => selectGridShortcut("list"),
        keys: "L",
        preventDefault: true,
      },
      {
        action: () => selectGridShortcut("focus"),
        keys: "F",
        preventDefault: true,
      },
    ],
    { enabled: !modalOpen, ignoreEditable: true },
  );

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

  function handleJumpToQuotes(event: ReactMouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const quoteResults = document.getElementById(quoteResultsId);

    quoteResults?.focus({ preventScroll: true });
    quoteResults?.scrollIntoView({
      block: "start",
      inline: "nearest",
    });
  }

  return (
    <>
      <a
        className={styles.skipLink}
        href={`#${quoteResultsId}`}
        onClick={handleJumpToQuotes}
      >
        {t("jumpToQuotes")}
      </a>

      <AppHeader
        locale={locale}
        mobileSearchActive={mobileSearchActive}
        search={
          <div
            className={styles.searchBox}
            data-focus-ring="within"
            onBlur={handleSearchBlur}
            onClick={() => searchInputRef.current?.focus()}
          >
            <SvgIcon className={styles.searchIcon} svg={searchIcon} />
            <input
              aria-label={`${t("search")}. ${t("keyboardShortcut")}: ${focusSearchShortcut.keysText}.`}
              className={styles.searchInput}
              onChange={handleSearchChange}
              onFocus={openMobileSearch}
              placeholder={t("search")}
              ref={searchInputRef}
              type="search"
              value={query}
            />
            {!query ? (
              <KeyboardShortcutKeys
                className={styles.searchShortcutMarker}
                decorative
                shortcut={focusSearchShortcut}
              />
            ) : null}
            {query ? (
              <Button
                aria-label={t("clearSearch")}
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
                title={t("clearSearch")}
                type="button"
                variant="flat"
              />
            ) : null}
          </div>
        }
        controls={
          <div className={styles.navControls}>
            <Menu.Root modal={false}>
              <Menu.Trigger
                className={styles.optionsButton}
                ref={optionsButtonRef}
                title={t("options")}
                type="button"
              >
                <span>{t("options")}</span>
                <SvgIcon className={styles.buttonIcon} svg={threeDotsIcon} />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner
                  align="end"
                  className={styles.actionMenuPositioner}
                  sideOffset={8}
                >
                  <Menu.Popup
                    className={styles.actionMenu}
                    data-pointer-active={
                      actionMenuPointerActive ? "true" : undefined
                    }
                    onKeyDown={() => setActionMenuPointerActive(false)}
                    onPointerMove={() => setActionMenuPointerActive(true)}
                  >
                    <Menu.Item
                      className={styles.actionMenuItem}
                      onClick={() => onHelpClick(optionsButtonRef.current)}
                    >
                      <SvgIcon
                        className={styles.buttonIcon}
                        svg={questionCircleIcon}
                      />
                      <span>{t("help")}</span>
                    </Menu.Item>
                    <Menu.Item
                      className={styles.actionMenuItem}
                      onClick={() => onShortcutsClick(optionsButtonRef.current)}
                    >
                      <SvgIcon
                        className={styles.buttonIcon}
                        svg={shortcutKeyIcon}
                      />
                      <span>{t("keyboardShortcuts")}</span>
                    </Menu.Item>
                    <Menu.Item
                      className={styles.actionMenuItem}
                      onClick={() =>
                        onLocaleChange(locale === "en" ? "de" : "en")
                      }
                    >
                      <SvgIcon className={styles.buttonIcon} svg={globeIcon} />
                      <span>{t("language")}</span>
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
                      <span>{t("theme")}</span>
                    </Menu.Item>

                    <Menu.Item
                      className={styles.actionMenuItem}
                      onClick={onExportClick}
                    >
                      <SvgIcon className={styles.buttonIcon} svg={exportIcon} />
                      <span>{t("exportCsv")}</span>
                    </Menu.Item>
                    <Menu.Item
                      className={styles.actionMenuItem}
                      onClick={onImportClick}
                    >
                      <SvgIcon className={styles.buttonIcon} svg={fileIcon} />
                      <span>{t("importCsv")}</span>
                    </Menu.Item>

                    <Menu.Item
                      className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`}
                      onClick={() => onResetClick(optionsButtonRef.current)}
                    >
                      <SvgIcon className={styles.buttonIcon} svg={trashIcon} />
                      <span>{t("resetApp")}</span>
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        }
      />

      <Controls
        fontSize={fontSize}
        gridMode={gridMode}
        locale={locale}
        mobileOptionsOpen={mobileOptionsOpen}
        shortcuts={{
          fontSizes: shortcuts.fontSizes,
          gridModes: shortcuts.gridModes,
        }}
        onFontSizeChange={onFontSizeChange}
        onGridModeChange={onGridModeChange}
        onMobileOptionsOpenChange={onMobileOptionsOpenChange}
      />

      {hasNoResults ? (
        <NoResultsScreen
          formMode={formMode}
          formOpen={modalOpen}
          id={quoteResultsId}
          text={t("noResults")}
        />
      ) : (
        <QuoteResultsLayout
          filteredQuotes={filteredQuotes}
          fontSize={fontSize}
          formMode={formMode}
          formOpen={modalOpen}
          gridMode={gridMode}
          masonryColumns={masonryColumns}
          onQuoteClick={onQuoteClick}
          resultsLabel={t("quotes")}
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
  resultsLabel: string;
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
  resultsLabel,
}: QuoteResultsLayoutProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredQuotes.length);
    setActiveIndex(0);
  }, [filteredQuotes]);

  function focusQuote(index: number) {
    if (filteredQuotes.length === 0) {
      return;
    }

    const nextIndex = clamp(index, 0, filteredQuotes.length - 1);
    const nextItem = itemRefs.current[nextIndex];

    setActiveIndex(nextIndex);
    nextItem?.focus({ preventScroll: true });
    nextItem?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }

  function handleQuoteGridKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    const nextIndex = getNextQuoteNavigationIndex(
      event.key,
      activeIndex,
      itemRefs.current,
      gridMode,
    );

    if (nextIndex === activeIndex) {
      return;
    }

    event.preventDefault();
    focusQuote(nextIndex);
  }

  useEffect(() => {
    if (formOpen || gridMode === "focus" || filteredQuotes.length === 0) {
      return;
    }

    function handlePageArrowKey(event: globalThis.KeyboardEvent) {
      if (
        event.defaultPrevented ||
        !getQuoteNavigationDirection(event.key) ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      const activeElement = document.activeElement;

      if (
        !isPageFocus(activeElement) ||
        (activeElement instanceof Node &&
          sectionRef.current?.contains(activeElement))
      ) {
        return;
      }

      event.preventDefault();
      focusQuote(activeIndex);
    }

    window.addEventListener("keydown", handlePageArrowKey);

    return () => {
      window.removeEventListener("keydown", handlePageArrowKey);
    };
  }, [activeIndex, filteredQuotes.length, formOpen, gridMode]);

  if (gridMode === "focus") {
    return (
      <FocusQuoteList
        id={quoteResultsId}
        formOpen={formOpen}
        formMode={formMode}
        fontSize={fontSize}
        onQuoteClick={onQuoteClick}
        quotes={filteredQuotes}
        resultsLabel={resultsLabel}
      />
    );
  }

  return (
    <section
      aria-label={resultsLabel}
      className={styles.quoteGrid}
      data-form-active={formOpen}
      data-form-mode={formMode}
      data-font={fontSize}
      data-grid={gridMode}
      id={quoteResultsId}
      onKeyDown={handleQuoteGridKeyDown}
      ref={sectionRef}
      style={
        {
          "--masonry-columns": String(masonryColumns),
          "--quote-font-size": `${fontSize}px`,
        } as CSSProperties
      }
      tabIndex={-1}
    >
      {filteredQuotes.map((quote, index) => (
        <button
          className={styles.quoteCard}
          key={quote.id}
          onClick={() => onQuoteClick(quote)}
          onFocus={() => setActiveIndex(index)}
          ref={(element) => {
            itemRefs.current[index] = element;
          }}
          tabIndex={index === activeIndex ? 0 : -1}
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

function getNextQuoteNavigationIndex(
  key: string,
  activeIndex: number,
  items: (HTMLElement | null)[],
  gridMode: GridMode,
) {
  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return Math.max(0, items.length - 1);
  }

  const direction = getQuoteNavigationDirection(key);

  if (!direction) {
    return activeIndex;
  }

  if (gridMode === "masonry") {
    return getNextMasonryNavigationIndex(direction, activeIndex, items);
  }

  if (gridMode === "list") {
    return getNextLinearNavigationIndex(key, activeIndex, items.length);
  }

  return getNextGridNavigationIndex(direction, activeIndex, items);
}

function getNextGridNavigationIndex(
  direction: QuoteNavigationDirection,
  activeIndex: number,
  items: (HTMLElement | null)[],
) {
  const rows = getGridRows(items);
  const activePosition = rows.reduce<
    { columnIndex: number; rowIndex: number } | undefined
  >((position, row, rowIndex) => {
    if (position) {
      return position;
    }

    const columnIndex = row.findIndex((item) => item.index === activeIndex);

    return columnIndex >= 0 ? { columnIndex, rowIndex } : undefined;
  }, undefined);

  if (!activePosition) {
    return activeIndex;
  }

  const currentRow = rows[activePosition.rowIndex];

  if (direction === "left") {
    return currentRow[activePosition.columnIndex - 1]?.index ?? activeIndex;
  }

  if (direction === "right") {
    return currentRow[activePosition.columnIndex + 1]?.index ?? activeIndex;
  }

  const targetRowIndex =
    direction === "up"
      ? activePosition.rowIndex - 1
      : activePosition.rowIndex + 1;
  const targetRow = rows[targetRowIndex];

  if (!targetRow) {
    return activeIndex;
  }

  const targetColumnIndex = clamp(
    activePosition.columnIndex,
    0,
    targetRow.length - 1,
  );

  return targetRow[targetColumnIndex]?.index ?? activeIndex;
}

function getGridRows(items: (HTMLElement | null)[]) {
  const rowThreshold = 8;
  const positionedItems = items
    .map((item, index) => {
      if (!item) {
        return null;
      }

      const rect = item.getBoundingClientRect();

      return {
        index,
        left: rect.left,
        top: rect.top,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.top - b.top || a.left - b.left);
  const rows: (typeof positionedItems)[] = [];

  positionedItems.forEach((item) => {
    const currentRow = rows[rows.length - 1];

    if (!currentRow || Math.abs(currentRow[0].top - item.top) > rowThreshold) {
      rows.push([item]);
      return;
    }

    currentRow.push(item);
  });

  rows.forEach((row) => row.sort((a, b) => a.left - b.left));

  return rows;
}

function getNextMasonryNavigationIndex(
  direction: QuoteNavigationDirection,
  activeIndex: number,
  items: (HTMLElement | null)[],
) {
  const columns = getMasonryColumns(items);
  const activePosition = columns.reduce<
    { columnIndex: number; rowIndex: number } | undefined
  >((position, column, columnIndex) => {
    if (position) {
      return position;
    }

    const rowIndex = column.findIndex((item) => item.index === activeIndex);

    return rowIndex >= 0 ? { columnIndex, rowIndex } : undefined;
  }, undefined);

  if (!activePosition) {
    return activeIndex;
  }

  const currentColumn = columns[activePosition.columnIndex];

  if (direction === "up") {
    return currentColumn[activePosition.rowIndex - 1]?.index ?? activeIndex;
  }

  if (direction === "down") {
    return currentColumn[activePosition.rowIndex + 1]?.index ?? activeIndex;
  }

  const targetColumnIndex =
    direction === "left"
      ? activePosition.columnIndex - 1
      : activePosition.columnIndex + 1;
  const targetColumn = columns[targetColumnIndex];

  if (!targetColumn) {
    return activeIndex;
  }

  const currentItem = currentColumn[activePosition.rowIndex];
  const targetItem = targetColumn.reduce((nearestItem, item) => {
    const nearestDistance = Math.abs(nearestItem.centerY - currentItem.centerY);
    const itemDistance = Math.abs(item.centerY - currentItem.centerY);

    return itemDistance < nearestDistance ? item : nearestItem;
  }, targetColumn[0]);

  return targetItem.index;
}

function getMasonryColumns(items: (HTMLElement | null)[]) {
  const columnThreshold = 8;
  const positionedItems = items
    .map((item, index) => {
      if (!item) {
        return null;
      }

      const rect = item.getBoundingClientRect();

      return {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        index,
        top: rect.top,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.centerX - b.centerX || a.top - b.top);
  const columns: (typeof positionedItems)[] = [];

  positionedItems.forEach((item) => {
    const currentColumn = columns[columns.length - 1];

    if (
      !currentColumn ||
      Math.abs(currentColumn[0].centerX - item.centerX) > columnThreshold
    ) {
      columns.push([item]);
      return;
    }

    currentColumn.push(item);
  });

  columns.forEach((column) => column.sort((a, b) => a.top - b.top));

  return columns;
}

function getNextLinearNavigationIndex(
  key: string,
  activeIndex: number,
  itemCount: number,
) {
  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return Math.max(0, itemCount - 1);
  }

  if (key === "ArrowDown" || key === "ArrowRight") {
    return clamp(activeIndex + 1, 0, itemCount - 1);
  }

  if (key === "ArrowUp" || key === "ArrowLeft") {
    return clamp(activeIndex - 1, 0, itemCount - 1);
  }

  return activeIndex;
}

function getQuoteNavigationDirection(
  key: string,
): QuoteNavigationDirection | null {
  if (key === "ArrowDown") {
    return "down";
  }

  if (key === "ArrowLeft") {
    return "left";
  }

  if (key === "ArrowRight") {
    return "right";
  }

  if (key === "ArrowUp") {
    return "up";
  }

  return null;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function isPageFocus(activeElement: Element | null) {
  return (
    activeElement === null ||
    activeElement === document.body ||
    activeElement === document.documentElement
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type ResetConfirmDialogProps = {
  locale: Locale;
  onCancel: () => void;
  onConfirm: () => void;
  restoreFocusRef?: RefObject<HTMLElement | null>;
};

function ResetConfirmDialog({
  locale,
  onCancel,
  onConfirm,
  restoreFocusRef,
}: ResetConfirmDialogProps) {
  const t = createTranslator(appPageMessages, locale);

  return (
    <FullScreenDialog
      aria-labelledby="reset-dialog-title"
      contentClassName={styles.resetDialog}
      onClose={onCancel}
      restoreFocusRef={restoreFocusRef}
    >
      <ModalCloseButton
        aria-label={t("cancel")}
        onClick={onCancel}
        title={t("cancel")}
      />

      <Text
        as="h2"
        className={styles.resetDialogTitle}
        id="reset-dialog-title"
        variant="title"
      >
        {t("resetAppTitle")}
      </Text>

      <div className={styles.resetDialogActions}>
        <Button
          icon={<SvgIcon svg={trashIcon} />}
          onClick={onConfirm}
          type="button"
          variant="danger"
        >
          {t("resetAppConfirm")}
        </Button>
        <Button
          icon={<SvgIcon svg={backArrowIcon} />}
          onClick={onCancel}
          type="button"
          variant="default"
        >
          {t("resetAppCancel")}
        </Button>
      </div>
    </FullScreenDialog>
  );
}

type NoResultsScreenProps = {
  formMode: FormMode;
  formOpen: boolean;
  id: string;
  text: string;
};

function NoResultsScreen({
  formMode,
  formOpen,
  id,
  text,
}: NoResultsScreenProps) {
  return (
    <section
      aria-live="polite"
      className={styles.noResultsScreen}
      data-form-active={formOpen}
      data-form-mode={formMode}
      id={id}
      tabIndex={-1}
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
  locale: Locale;
  modalOpen: boolean;
  welcomeSlides: readonly WelcomeSlide[];
  onHelpClick: () => void;
  onImportClick: () => void;
  onLocaleChange: (locale: Locale) => void;
};

function WelcomeScreen({
  locale,
  modalOpen,
  onHelpClick,
  onImportClick,
  onLocaleChange,
  welcomeSlides,
}: WelcomeScreenProps) {
  const t = createTranslator(appPageMessages, locale);

  return (
    <>
      <AppHeader locale={locale} />

      <motion.div
        animate={{ opacity: 1, filter: "blur(0px)" }}
        className={styles.welcomePage}
        initial={{ opacity: 0, filter: "blur(18px)" }}
        transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Section
          className={styles.emptyContent}
          data-form-active={modalOpen}
          size="wide"
        >
          <WelcomeSlider slides={welcomeSlides} />

          <motion.div className={styles.rule} />

          <Text className={styles.intro} tone="muted" variant="body">
            {t("intro")}
          </Text>

          <WelcomeActions
            locale={locale}
            onHelpClick={onHelpClick}
            onImportClick={onImportClick}
            onLocaleChange={onLocaleChange}
          />
        </Section>
      </motion.div>
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
  const t = createTranslator(appPageMessages, locale);

  return (
    <section className={styles.welcomeActions}>
      <div className={styles.localeSwitch} aria-label={t("language")}>
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
          {t("importCsv")}
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
          {t("help")}
        </Button>
      </div>
    </section>
  );
}

type FocusQuoteListProps = {
  formOpen: boolean;
  formMode: FormMode;
  fontSize: number;
  id: string;
  quotes: Quote[];
  resultsLabel: string;
  onQuoteClick: (quote: Quote) => void;
};

function FocusQuoteList({
  fontSize,
  formMode,
  formOpen,
  id,
  quotes,
  onQuoteClick,
  resultsLabel,
}: FocusQuoteListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const keyboardNavigationUntil = useRef(0);
  const visibleIndexes = useRef(new Set<number>());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [visibleVersion, setVisibleVersion] = useState(0);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, quotes.length);
    visibleIndexes.current = new Set();
    setFocusedIndex(0);
    setVisibleVersion((version) => version + 1);
  }, [quotes.length]);

  function focusQuote(index: number) {
    if (quotes.length === 0) {
      return;
    }

    const nextIndex = clamp(index, 0, quotes.length - 1);
    const nextItem = itemRefs.current[nextIndex];

    keyboardNavigationUntil.current = Date.now() + 420;
    setFocusedIndex(nextIndex);
    nextItem?.focus({ preventScroll: true });
    nextItem?.scrollIntoView({
      block: "center",
      inline: "nearest",
    });
  }

  function handleFocusListKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    const nextIndex = getNextLinearNavigationIndex(
      event.key,
      focusedIndex,
      quotes.length,
    );

    if (nextIndex === focusedIndex) {
      return;
    }

    event.preventDefault();
    focusQuote(nextIndex);
  }

  useEffect(() => {
    if (formOpen || quotes.length === 0) {
      return;
    }

    function handlePageArrowKey(event: globalThis.KeyboardEvent) {
      if (
        event.defaultPrevented ||
        !getQuoteNavigationDirection(event.key) ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      const activeElement = document.activeElement;

      if (
        !isPageFocus(activeElement) ||
        (activeElement instanceof Node &&
          itemRefs.current.some((item) => item?.contains(activeElement)))
      ) {
        return;
      }

      event.preventDefault();
      focusQuote(focusedIndex);
    }

    window.addEventListener("keydown", handlePageArrowKey);

    return () => {
      window.removeEventListener("keydown", handlePageArrowKey);
    };
  }, [focusedIndex, formOpen, quotes.length]);

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
        ? Math.max(0, (rootHeight - firstItem.offsetHeight) / 5)
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
        const quoteHasDomFocus = itemRefs.current.some(
          (item) => item === document.activeElement,
        );

        if (quoteHasDomFocus && Date.now() < keyboardNavigationUntil.current) {
          return;
        }

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
      aria-label={resultsLabel}
      className={styles.focusListShell}
      data-form-active={formOpen}
      data-form-mode={formMode}
      id={id}
      onKeyDown={handleFocusListKeyDown}
      style={{ "--quote-font-size": `${fontSize}px` } as CSSProperties}
      tabIndex={-1}
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
                onFocus={() => setFocusedIndex(index)}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                tabIndex={index === focusedIndex ? 0 : -1}
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
