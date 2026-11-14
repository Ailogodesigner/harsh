import { create } from "zustand";
import { CellCoord, SelectionRange, ClipboardState } from "../types";
import { coordToAddress } from "../engine/range-manager";

interface SelectionState {
  activeCell: CellCoord;
  selectionRange: SelectionRange;
  isSelecting: boolean;
  editingCell: CellCoord | null;
  editValue: string;
  formulaInput: string;
  isAutoFilling: boolean;
  autoFillTarget: CellCoord | null;
  clipboard: ClipboardState | null;

  // Actions
  setActiveCell: (coord: CellCoord) => void;
  setSelectionRange: (range: SelectionRange) => void;
  setIsSelecting: (selecting: boolean) => void;
  setEditingCell: (cell: CellCoord | null) => void;
  setEditValue: (val: string) => void;
  setFormulaInput: (input: string) => void;
  setIsAutoFilling: (filling: boolean) => void;
  setAutoFillTarget: (target: CellCoord | null) => void;
  setClipboard: (cb: ClipboardState | null) => void;
  clearClipboard: () => void;
  getActiveAddress: () => string;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  activeCell: { row: 0, col: 0 }, // Cell A1 (blank default)
  selectionRange: { startRow: 0, startCol: 0, endRow: 0, endCol: 0 },
  isSelecting: false,
  editingCell: null,
  editValue: "",
  formulaInput: "",
  isAutoFilling: false,
  autoFillTarget: null,
  clipboard: null,

  setActiveCell: (coord) =>
    set({
      activeCell: coord,
      selectionRange: {
        startRow: coord.row,
        startCol: coord.col,
        endRow: coord.row,
        endCol: coord.col,
      },
    }),

  setSelectionRange: (range) => set({ selectionRange: range }),
  setIsSelecting: (isSelecting) => set({ isSelecting }),
  setEditingCell: (editingCell) => set({ editingCell }),
  setEditValue: (editValue) => set({ editValue }),
  setFormulaInput: (formulaInput) => set({ formulaInput }),
  setIsAutoFilling: (isAutoFilling) => set({ isAutoFilling }),
  setAutoFillTarget: (autoFillTarget) => set({ autoFillTarget }),
  setClipboard: (clipboard) => set({ clipboard }),
  clearClipboard: () => set({ clipboard: null }),

  getActiveAddress: () => {
    const { activeCell } = get();
    return coordToAddress(activeCell.row, activeCell.col);
  },
}));

