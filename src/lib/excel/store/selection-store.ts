import { create } from "zustand";
import { CellCoord, SelectionRange } from "../types";
import { coordToAddress } from "../engine/range-manager";

interface SelectionState {
  activeCell: CellCoord;
  selectionRange: SelectionRange;
  isSelecting: boolean;
  editingCell: CellCoord | null;
  formulaInput: string;
  isAutoFilling: boolean;
  autoFillTarget: CellCoord | null;

  // Actions
  setActiveCell: (coord: CellCoord) => void;
  setSelectionRange: (range: SelectionRange) => void;
  setIsSelecting: (selecting: boolean) => void;
  setEditingCell: (cell: CellCoord | null) => void;
  setFormulaInput: (input: string) => void;
  setIsAutoFilling: (filling: boolean) => void;
  setAutoFillTarget: (target: CellCoord | null) => void;
  getActiveAddress: () => string;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  activeCell: { row: 3, col: 0 }, // Defaults to A4
  selectionRange: { startRow: 3, startCol: 0, endRow: 3, endCol: 0 },
  isSelecting: false,
  editingCell: null,
  formulaInput: "",
  isAutoFilling: false,
  autoFillTarget: null,

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
  setFormulaInput: (formulaInput) => set({ formulaInput }),
  setIsAutoFilling: (isAutoFilling) => set({ isAutoFilling }),
  setAutoFillTarget: (autoFillTarget) => set({ autoFillTarget }),

  getActiveAddress: () => {
    const { activeCell } = get();
    return coordToAddress(activeCell.row, activeCell.col);
  },
}));

