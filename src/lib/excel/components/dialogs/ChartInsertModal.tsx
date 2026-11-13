"use client";

import React, { useState } from "react";
import { useUIStore } from "../../store/ui-store";
import { useWorkbookStore } from "../../store/workbook-store";
import { useSelectionStore } from "../../store/selection-store";
import { coordToAddress } from "../../engine/range-manager";
import { ChartType, ChartConfig } from "../../types";
import { X, BarChart3, LineChart, PieChart, Donut, AreaChart, ScatterChart, Check } from "lucide-react";

export function ChartInsertModal() {
  const { showChartInsert, toggleModal } = useUIStore();
  const { addChart } = useWorkbookStore();
  const { selectionRange } = useSelectionStore();

  const [type, setType] = useState<ChartType>("bar");
  const [title, setTitle] = useState("Infrastructure Cost & Revenue Analysis");
  const [dataRange, setDataRange] = useState("D4:E6");
  const [labelRange, setLabelRange] = useState("A4:A6");

  if (!showChartInsert) return null;

  const handleCreate = () => {
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      type,
      title: title || "Chart",
      dataRange,
      labelRange: labelRange || undefined,
      x: 30,
      y: 400,
      width: 440,
      height: 280,
    };
    addChart(newChart);
    toggleModal("showChartInsert", false);
  };

  const chartTypes = [
    { type: "bar" as const, label: "Clustered Bar / Column", icon: BarChart3 },
    { type: "line" as const, label: "2D Line Trend", icon: LineChart },
    { type: "pie" as const, label: "2D Pie Distribution", icon: PieChart },
    { type: "doughnut" as const, label: "Doughnut Breakdown", icon: Donut },
    { type: "area" as const, label: "Area Graph", icon: AreaChart },
    { type: "scatter" as const, label: "Scatter (X,Y) Plot", icon: ScatterChart },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-[#202020] border border-[#333333] w-[500px] rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252525] border-b border-[#303030]">
          <span className="font-semibold text-sm text-white">Insert Chart</span>
          <button
            onClick={() => toggleModal("showChartInsert", false)}
            className="p-1 hover:bg-[#303030] rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-slate-400 font-semibold block mb-2">Select Chart Type:</label>
            <div className="grid grid-cols-2 gap-2">
              {chartTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => setType(item.type)}
                    className={`flex items-center gap-2.5 p-2.5 rounded border transition-colors ${
                      type === item.type
                        ? "bg-[#107c41]/30 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-[#181818] border-slate-700/60 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Chart Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181818] border border-slate-700 rounded px-3 py-1.5 text-white font-sans text-xs focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-slate-400 block mb-1">Data Range (Numbers):</label>
              <input
                type="text"
                value={dataRange}
                onChange={(e) => setDataRange(e.target.value)}
                placeholder="e.g. D4:E6"
                className="w-full bg-[#181818] border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-slate-400 block mb-1">Category / Labels (Optional):</label>
              <input
                type="text"
                value={labelRange}
                onChange={(e) => setLabelRange(e.target.value)}
                placeholder="e.g. A4:A6"
                className="w-full bg-[#181818] border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 bg-[#1e1e1e] border-t border-[#303030]">
          <button
            onClick={() => toggleModal("showChartInsert", false)}
            className="px-4 py-1.5 bg-[#252525] hover:bg-[#303030] text-slate-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-1.5 bg-[#107c41] hover:bg-[#0e6b37] text-white font-medium rounded flex items-center gap-1.5 shadow"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Create Chart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

