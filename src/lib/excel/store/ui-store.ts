import { create } from "zustand";
import { RibbonTab } from "../types";

interface UIState {
  activeTab: RibbonTab;
  showFormulaBar: boolean;
  showGridlines: boolean;
  showHeadings: boolean;
  zoomScale: number;
  theme: "dark" | "light";

  // Modals / Dialogs
  showFormatCells: boolean;
  showFindReplace: boolean;
  findMode: "find" | "replace";
  showFunctionWizard: boolean;
  showChartInsert: boolean;
  showProtectSheet: boolean;
  showSortFilter: boolean;
  showDataValidation: boolean;
  showConditionalFormatting: boolean;
  showFileBackstage: boolean;

  // Actions
  setActiveTab: (tab: RibbonTab) => void;
  setShowFormulaBar: (show: boolean) => void;
  setShowGridlines: (show: boolean) => void;
  setShowHeadings: (show: boolean) => void;
  setZoomScale: (zoom: number | ((prev: number) => number)) => void;
  setTheme: (theme: "dark" | "light") => void;

  toggleModal: (modal: keyof Omit<UIState, "activeTab" | "showFormulaBar" | "showGridlines" | "showHeadings" | "zoomScale" | "theme" | "findMode" | "setActiveTab" | "setShowFormulaBar" | "setShowGridlines" | "setShowHeadings" | "setZoomScale" | "setTheme" | "toggleModal" | "setFindMode">, open?: boolean) => void;
  setFindMode: (mode: "find" | "replace") => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: "home",
  showFormulaBar: true,
  showGridlines: true,
  showHeadings: true,
  zoomScale: 1.0,
  theme: "dark",

  showFormatCells: false,
  showFindReplace: false,
  findMode: "find",
  showFunctionWizard: false,
  showChartInsert: false,
  showProtectSheet: false,
  showSortFilter: false,
  showDataValidation: false,
  showConditionalFormatting: false,
  showFileBackstage: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setShowFormulaBar: (showFormulaBar) => set({ showFormulaBar }),
  setShowGridlines: (showGridlines) => set({ showGridlines }),
  setShowHeadings: (showHeadings) => set({ showHeadings }),
  setZoomScale: (zoom) =>
    set((state) => ({
      zoomScale: typeof zoom === "function" ? zoom(state.zoomScale) : zoom,
    })),
  setTheme: (theme) => set({ theme }),

  toggleModal: (modal, open) =>
    set((state) => ({
      [modal]: open !== undefined ? open : !state[modal],
    })),
  setFindMode: (findMode) => set({ findMode }),
}));

