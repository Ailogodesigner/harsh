"use client";

import React, { useState } from "react";
import { useUIStore } from "../../store/ui-store";
import { useWorkbookStore } from "../../store/workbook-store";
import { X, ShieldCheck, Lock, Unlock } from "lucide-react";

export function ProtectSheetModal() {
  const { showProtectSheet, toggleModal } = useUIStore();
  const { workbook, setWorkbook } = useWorkbookStore();

  const [password, setPassword] = useState("");
  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);

  if (!showProtectSheet || !activeSheet) return null;

  const isCurrentlyProtected = !!activeSheet.isProtected;

  const handleToggle = () => {
    const updatedSheets = workbook.sheets.map((s) => {
      if (s.id === activeSheet.id) {
        return {
          ...s,
          isProtected: !isCurrentlyProtected,
          password: !isCurrentlyProtected ? password : "",
        };
      }
      return s;
    });

    setWorkbook({
      ...workbook,
      sheets: updatedSheets,
    });
    toggleModal("showProtectSheet", false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-[#202020] border border-[#333333] w-[420px] rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252525] border-b border-[#303030]">
          <span className="font-semibold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {isCurrentlyProtected ? "Unprotect Worksheet" : "Protect Worksheet"}
          </span>
          <button
            onClick={() => toggleModal("showProtectSheet", false)}
            className="p-1 hover:bg-[#303030] rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            {isCurrentlyProtected
              ? `Worksheet "${activeSheet.name}" is currently protected. Enter password or click below to unprotect.`
              : `Protect worksheet "${activeSheet.name}" and contents of locked cells from unauthorized edits.`}
          </p>

          <div>
            <label className="text-slate-400 block mb-1">
              Password ({isCurrentlyProtected ? "Required if set" : "Optional"}):
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full bg-[#181818] border border-slate-700 rounded px-3 py-1.5 text-white text-xs focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 bg-[#1e1e1e] border-t border-[#303030]">
          <button
            onClick={() => toggleModal("showProtectSheet", false)}
            className="px-4 py-1.5 bg-[#252525] hover:bg-[#303030] text-slate-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleToggle}
            className={`px-4 py-1.5 text-white font-medium rounded flex items-center gap-1.5 shadow ${
              isCurrentlyProtected
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-[#107c41] hover:bg-[#0e6b37]"
            }`}
          >
            {isCurrentlyProtected ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isCurrentlyProtected ? "Unprotect Sheet" : "Protect Sheet"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

