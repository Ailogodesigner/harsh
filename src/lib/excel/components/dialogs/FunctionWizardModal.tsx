"use client";

import React, { useState } from "react";
import { useUIStore } from "../../store/ui-store";
import { useSelectionStore } from "../../store/selection-store";
import { X, Check } from "lucide-react";

interface FunctionItem {
  name: string;
  category: "Math" | "Statistical" | "Logical" | "Lookup" | "Text" | "Date";
  syntax: string;
  desc: string;
  example: string;
}

const FUNCTIONS: FunctionItem[] = [
  { name: "SUM", category: "Math", syntax: "SUM(number1, [number2], ...)", desc: "Adds all numbers in a range of cells.", example: "=SUM(B4:B6)" },
  { name: "AVERAGE", category: "Statistical", syntax: "AVERAGE(number1, [number2], ...)", desc: "Calculates the arithmetic mean of arguments.", example: "=AVERAGE(D4:D6)" },
  { name: "COUNT", category: "Statistical", syntax: "COUNT(value1, [value2], ...)", desc: "Counts cells that contain numbers.", example: "=COUNT(B4:B6)" },
  { name: "COUNTA", category: "Statistical", syntax: "COUNTA(value1, [value2], ...)", desc: "Counts non-empty cells in a range.", example: "=COUNTA(A4:A6)" },
  { name: "IF", category: "Logical", syntax: "IF(logical_test, [value_if_true], [value_if_false])", desc: "Returns one value if condition is TRUE and another if FALSE.", example: '=IF(E4>20, "High", "Low")' },
  { name: "VLOOKUP", category: "Lookup", syntax: "VLOOKUP(lookup_value, table_array, col_index, [range_lookup])", desc: "Looks for a value in the leftmost column of a table.", example: "=VLOOKUP(1, A4:D6, 4, FALSE)" },
  { name: "XLOOKUP", category: "Lookup", syntax: "XLOOKUP(lookup_value, lookup_array, return_array)", desc: "Searches a range or array and returns the corresponding item.", example: "=XLOOKUP(24, E4:E6, A4:A6)" },
  { name: "INDEX", category: "Lookup", syntax: "INDEX(array, row_num, [col_num])", desc: "Returns a value or reference of the cell at a given intersection.", example: "=INDEX(A4:D6, 1, 1)" },
  { name: "MATCH", category: "Lookup", syntax: "MATCH(lookup_value, lookup_array, [match_type])", desc: "Returns the relative position of an item in an array.", example: '=MATCH("Premium Node Tier-3", A4:A6, 0)' },
  { name: "CONCAT", category: "Text", syntax: "CONCAT(text1, [text2], ...)", desc: "Combines the text from multiple ranges and/or strings.", example: '=CONCAT(A4, " - ", B4, "GB")' },
  { name: "LEFT", category: "Text", syntax: "LEFT(text, [num_chars])", desc: "Returns characters from the start of a text string.", example: '=LEFT(A4, 5)' },
  { name: "RIGHT", category: "Text", syntax: "RIGHT(text, [num_chars])", desc: "Returns characters from the end of a text string.", example: '=RIGHT(A4, 6)' },
  { name: "MID", category: "Text", syntax: "MID(text, start_num, num_chars)", desc: "Returns characters from the middle of a text string.", example: '=MID(A4, 1, 4)' },
  { name: "LEN", category: "Text", syntax: "LEN(text)", desc: "Returns the number of characters in a text string.", example: '=LEN(A4)' },
  { name: "TRIM", category: "Text", syntax: "TRIM(text)", desc: "Removes all spaces from text except single spaces.", example: '=TRIM(A4)' },
  { name: "UPPER", category: "Text", syntax: "UPPER(text)", desc: "Converts text to uppercase.", example: '=UPPER(A4)' },
  { name: "LOWER", category: "Text", syntax: "LOWER(text)", desc: "Converts text to lowercase.", example: '=LOWER(A4)' },
  { name: "PROPER", category: "Text", syntax: "PROPER(text)", desc: "Capitalizes the first letter in each word.", example: '=PROPER(A4)' },
  { name: "TODAY", category: "Date", syntax: "TODAY()", desc: "Returns the current date in YYYY-MM-DD format.", example: "=TODAY()" },
  { name: "NOW", category: "Date", syntax: "NOW()", desc: "Returns the current date and time.", example: "=NOW()" },
  { name: "DATE", category: "Date", syntax: "DATE(year, month, day)", desc: "Returns the sequential date code for a given date.", example: "=DATE(2026, 11, 13)" },
  { name: "SUMIF", category: "Math", syntax: "SUMIF(range, criteria, [sum_range])", desc: "Adds the cells specified by a given condition or criteria.", example: '=SUMIF(B4:B6, ">1", D4:D6)' },
  { name: "COUNTIF", category: "Statistical", syntax: "COUNTIF(range, criteria)", desc: "Counts the number of cells that meet a criterion.", example: '=COUNTIF(B4:B6, ">=2")' },
  { name: "AVERAGEIF", category: "Statistical", syntax: "AVERAGEIF(range, criteria, [average_range])", desc: "Calculates the average for cells that satisfy a condition.", example: '=AVERAGEIF(B4:B6, ">1", D4:D6)' },
  { name: "ROUND", category: "Math", syntax: "ROUND(number, num_digits)", desc: "Rounds a number to a specified number of digits.", example: "=ROUND(155.678, 2)" },
  { name: "PRODUCT", category: "Math", syntax: "PRODUCT(number1, [number2], ...)", desc: "Multiplies all the numbers given as arguments.", example: "=PRODUCT(D4, E4)" },
  { name: "MAX", category: "Statistical", syntax: "MAX(number1, [number2], ...)", desc: "Returns the largest value in a set of values.", example: "=MAX(D4:D6)" },
  { name: "MIN", category: "Statistical", syntax: "MIN(number1, [number2], ...)", desc: "Returns the smallest value in a set of values.", example: "=MIN(D4:D6)" },
  { name: "MEDIAN", category: "Statistical", syntax: "MEDIAN(number1, [number2], ...)", desc: "Returns the median of the given numbers.", example: "=MEDIAN(D4:D6)" },
  { name: "ABS", category: "Math", syntax: "ABS(number)", desc: "Returns the absolute value of a number.", example: "=ABS(-150)" },
  { name: "SQRT", category: "Math", syntax: "SQRT(number)", desc: "Returns a positive square root.", example: "=SQRT(144)" },
  { name: "POWER", category: "Math", syntax: "POWER(number, power)", desc: "Returns the result of a number raised to a power.", example: "=POWER(2, 8)" },
  { name: "IFERROR", category: "Logical", syntax: "IFERROR(value, value_if_error)", desc: "Returns value_if_error if formula evaluates to an error.", example: '=IFERROR(D4/0, "Cost N/A")' },
];

export function FunctionWizardModal() {
  const { showFunctionWizard, toggleModal } = useUIStore();
  const { setFormulaInput } = useSelectionStore();

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [selectedFunc, setSelectedFunc] = useState<FunctionItem>(FUNCTIONS[0]);

  if (!showFunctionWizard) return null;

  const filtered = FUNCTIONS.filter((f) => {
    const matchesCat = selectedCat === "All" || f.category === selectedCat;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleInsert = (func: FunctionItem) => {
    setFormulaInput(func.example || `=${func.name}()`);
    toggleModal("showFunctionWizard", false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-[#202020] border border-[#333333] w-[560px] rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252525] border-b border-[#303030]">
          <span className="font-semibold text-sm text-white flex items-center gap-2">
            <span className="font-serif italic font-bold text-emerald-400 text-base">fx</span>
            Insert Function Wizard
          </span>
          <button
            onClick={() => toggleModal("showFunctionWizard", false)}
            className="p-1 hover:bg-[#303030] rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-[#1a1a1a] border-b border-[#303030] flex gap-3">
          <input
            type="text"
            placeholder="Type a function name or brief description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#222222] border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-xs focus:border-emerald-500 outline-none"
            autoFocus
          />
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-[#222222] border border-slate-700 rounded px-2.5 py-1.5 text-white"
          >
            {["All", "Math", "Statistical", "Logical", "Lookup", "Text", "Date"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Function List and Details */}
        <div className="grid grid-cols-2 divide-x divide-[#303030] min-h-[260px] max-h-[300px]">
          {/* List */}
          <div className="overflow-y-auto p-2 space-y-1">
            {filtered.map((f) => (
              <div
                key={f.name}
                onClick={() => setSelectedFunc(f)}
                onDoubleClick={() => handleInsert(f)}
                className={`px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center justify-between ${
                  selectedFunc.name === f.name
                    ? "bg-[#107c41] text-white font-bold"
                    : "hover:bg-[#282828] text-slate-300"
                }`}
              >
                <span>{f.name}</span>
                <span className="text-[10px] opacity-70 uppercase">{f.category}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-slate-500 p-4 text-center">No matching functions</p>
            )}
          </div>

          {/* Details */}
          <div className="p-4 flex flex-col justify-between bg-[#1d1d1d]">
            <div className="space-y-3">
              <div>
                <span className="font-bold text-sm text-white font-mono">{selectedFunc.syntax}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedFunc.desc}</p>
              <div className="bg-[#151515] p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block mb-1">Example:</span>
                <code className="text-emerald-400 font-mono font-semibold">{selectedFunc.example}</code>
              </div>
            </div>
            <button
              onClick={() => handleInsert(selectedFunc)}
              className="w-full mt-4 py-2 bg-[#107c41] hover:bg-[#0e6b37] text-white font-medium rounded flex items-center justify-center gap-1.5 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Insert Function</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-2.5 bg-[#1e1e1e] border-t border-[#303030]">
          <button
            onClick={() => toggleModal("showFunctionWizard", false)}
            className="px-4 py-1.5 bg-[#252525] hover:bg-[#303030] text-slate-300 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

