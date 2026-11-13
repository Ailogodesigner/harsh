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
  activeCell: { row: 8, col: 4 }, // Defaults to E9 (matching Excel screenshot)
  selectionRange: { startRow: 8, startCol: 4, endRow: 8, endCol: 4 },
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

