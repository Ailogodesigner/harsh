"use client";

import React, { useEffect, useRef } from "react";
import { useWorkbookStore } from "../../store/workbook-store";
import { useSelectionStore } from "../../store/selection-store";
import { useUIStore } from "../../store/ui-store";
import { Scissors, Copy, Clipboard, Trash2, Plus, Minus, Settings2 } from "lucide-react";

interface CellContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onPasteValues: () => void;
}

export function CellContextMenu({
  x,
  y,
  onClose,
  onCut,
  onCopy,
  onPaste,
  onPasteValues,
}: CellContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { activeCell, selectionRange } = useSelectionStore();
  const { insertRow, deleteRow, insertCol, deleteCol, clearCells } = useWorkbookStore();
  const { toggleModal } = useUIStore();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ left: Math.min(x, window.innerWidth - 220), top: Math.min(y, window.innerHeight - 340) }}
      className="fixed z-50 w-52 bg-[#222222] border border-[#383838] shadow-2xl rounded-md py-1.5 text-xs text-slate-200 select-none backdrop-blur"
    >
      <button
        onClick={() => { onCut(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#303030] text-left"
      >
        <span className="flex items-center gap-2"><Scissors className="w-3.5 h-3.5 text-slate-400" /> Cut</span>
        <span className="text-[10px] text-slate-500 font-mono">Ctrl+X</span>
      </button>

      <button
        onClick={() => { onCopy(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#303030] text-left"
      >
        <span className="flex items-center gap-2"><Copy className="w-3.5 h-3.5 text-slate-400" /> Copy</span>
        <span className="text-[10px] text-slate-500 font-mono">Ctrl+C</span>
      </button>

      <button
        onClick={() => { onPaste(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#303030] text-left"
      >
        <span className="flex items-center gap-2"><Clipboard className="w-3.5 h-3.5 text-slate-400" /> Paste</span>
        <span className="text-[10px] text-slate-500 font-mono">Ctrl+V</span>
      </button>

      <button
        onClick={() => { onPasteValues(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#303030] text-left"
      >
        <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
        <span>Paste Values Only</span>
      </button>

      <div className="h-[1px] bg-[#333333] my-1" />

      <button
        onClick={() => { insertRow(activeCell.row); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#303030] text-left"
      >
        <Plus className="w-3.5 h-3.5 text-slate-400" />
        <span>Insert Row Above</span>
      </button>

      <button
        onClick={() => { insertCol(activeCell.col); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#303030] text-left"
      >
        <Plus className="w-3.5 h-3.5 text-slate-400" />
        <span>Insert Column Left</span>
      </button>

      <button
        onClick={() => { deleteRow(activeCell.row); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#303030] text-left text-rose-300"
      >
        <Minus className="w-3.5 h-3.5 text-rose-400" />
        <span>Delete Row</span>
      </button>

      <button
        onClick={() => { deleteCol(activeCell.col); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#303030] text-left text-rose-300"
      >
        <Minus className="w-3.5 h-3.5 text-rose-400" />
        <span>Delete Column</span>
      </button>

      <div className="h-[1px] bg-[#333333] my-1" />

      <button
        onClick={() => { clearCells(selectionRange, "contents"); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#303030] text-left"
      >
        <span className="flex items-center gap-2"><Trash2 className="w-3.5 h-3.5 text-slate-400" /> Clear Contents</span>
        <span className="text-[10px] text-slate-500 font-mono">Del</span>
      </button>

      <button
        onClick={() => { toggleModal("showFormatCells", true); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-[#303030] text-left"
      >
        <span className="flex items-center gap-2"><Settings2 className="w-3.5 h-3.5 text-emerald-400" /> Format Cells...</span>
        <span className="text-[10px] text-slate-500 font-mono">Ctrl+1</span>
      </button>
    </div>
  );
}

