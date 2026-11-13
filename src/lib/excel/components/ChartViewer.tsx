"use client";

import React, { useMemo } from "react";
import { useWorkbookStore } from "../store/workbook-store";
import { ChartConfig } from "../types";
import { getRangeValues } from "../engine/formula-engine";
import { parseNumeric } from "../engine/formatting-engine";
import { X, BarChart3, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";

interface ChartViewerProps {
  chart: ChartConfig;
}

export function ChartViewer({ chart }: ChartViewerProps) {
  const { workbook, deleteChart } = useWorkbookStore();
  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);

  // Extract data values and labels dynamically
  const { values, labels } = useMemo(() => {
    if (!activeSheet) return { values: [], labels: [] };

    const rawVals = getRangeValues(chart.dataRange, activeSheet.grid, workbook.sheets);
    const nums = rawVals.map((v) => parseNumeric(v));

    let lbls: string[] = [];
    if (chart.labelRange) {
      const rawLabels = getRangeValues(chart.labelRange, activeSheet.grid, workbook.sheets);
      lbls = rawLabels.map((l) => String(l || ""));
    } else {
      lbls = nums.map((_, i) => `Series ${i + 1}`);
    }

    return { values: nums, labels: lbls };
  }, [activeSheet, chart.dataRange, chart.labelRange, workbook.sheets]);

  const maxVal = Math.max(...values, 1);
  const colors = ["#107c41", "#0284c7", "#d97706", "#dc2626", "#8b5cf6", "#ec4899", "#14b8a6"];

  return (
    <div
      style={{ left: chart.x, top: chart.y, width: chart.width, height: chart.height }}
      className="absolute z-30 bg-[#1e1e1e] border border-slate-700/80 rounded-lg shadow-2xl flex flex-col overflow-hidden text-xs text-slate-200 select-none backdrop-blur"
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252525] border-b border-slate-800 cursor-move">
        <span className="font-semibold text-white truncate max-w-[280px]">{chart.title}</span>
        <button
          onClick={() => deleteChart(chart.id)}
          className="p-1 hover:bg-[#333333] rounded text-slate-400 hover:text-rose-400"
          title="Delete Chart"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chart Canvas / SVG Area */}
      <div className="flex-1 p-4 flex flex-col justify-center items-center bg-[#181818]/90">
        {values.length === 0 ? (
          <span className="text-slate-500">No numeric data in range {chart.dataRange}</span>
        ) : chart.type === "bar" ? (
          <div className="w-full h-full flex items-end gap-3 pt-4 pb-2 px-3 border-b border-l border-slate-700">
            {values.map((v, i) => {
              const heightPct = Math.max(5, Math.min(100, (v / maxVal) * 100));
              const color = colors[i % colors.length];
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono mb-1">
                    {v}
                  </span>
                  <div
                    style={{ height: `${heightPct}%`, backgroundColor: color }}
                    className="w-full rounded-t transition-all duration-300 hover:brightness-125"
                  />
                  <span className="text-[10px] text-slate-400 truncate w-full text-center mt-1">
                    {labels[i] || `T${i + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : chart.type === "pie" || chart.type === "doughnut" ? (
          <div className="flex items-center justify-around w-full h-full">
            <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
              {(() => {
                const total = values.reduce((a, b) => a + b, 0) || 1;
                let accAngle = 0;
                return values.map((val, i) => {
                  const sliceAngle = (val / total) * 360;
                  const x1 = 50 + 40 * Math.cos((Math.PI * accAngle) / 180);
                  const y1 = 50 + 40 * Math.sin((Math.PI * accAngle) / 180);
                  accAngle += sliceAngle;
                  const x2 = 50 + 40 * Math.cos((Math.PI * accAngle) / 180);
                  const y2 = 50 + 40 * Math.sin((Math.PI * accAngle) / 180);
                  const largeArc = sliceAngle > 180 ? 1 : 0;
                  const color = colors[i % colors.length];

                  return (
                    <path
                      key={i}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={color}
                      className="hover:opacity-90 transition-opacity"
                    />
                  );
                });
              })()}
              {chart.type === "doughnut" && <circle cx="50" cy="50" r="22" fill="#181818" />}
            </svg>
            <div className="flex flex-col gap-1.5 max-w-[120px]">
              {labels.map((lbl, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] truncate">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span className="text-slate-300 truncate">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Line / Area Chart */
          <div className="w-full h-full flex flex-col justify-between pt-2 px-2">
            <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke="#107c41"
                strokeWidth="3"
                points={values
                  .map((v, i) => {
                    const x = 20 + (i / Math.max(values.length - 1, 1)) * 260;
                    const y = 110 - (v / maxVal) * 90;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
              {values.map((v, i) => {
                const x = 20 + (i / Math.max(values.length - 1, 1)) * 260;
                const y = 110 - (v / maxVal) * 90;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#34d399"
                    className="hover:r-6 transition-all"
                  />
                );
              })}
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-700 pt-1">
              {labels.map((lbl, i) => (
                <span key={i} className="truncate max-w-[50px] text-center">{lbl}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

