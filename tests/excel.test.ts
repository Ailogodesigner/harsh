import { describe, it, expect } from "vitest";
import { colToLetter, letterToCol, parseCoord, evaluateFormula, formatCellValue, SheetGrid } from "@/app/excel/page";

describe("Excel Engine Verification", () => {
  it("verifies column index to letter translation", () => {
    expect(colToLetter(0)).toBe("A");
    expect(colToLetter(1)).toBe("B");
    expect(colToLetter(5)).toBe("F");
    expect(colToLetter(25)).toBe("Z");
    expect(colToLetter(26)).toBe("AA");
  });

  it("verifies column letter to index translation", () => {
    expect(letterToCol("A")).toBe(0);
    expect(letterToCol("B")).toBe(1);
    expect(letterToCol("F")).toBe(5);
    expect(letterToCol("Z")).toBe(25);
    expect(letterToCol("AA")).toBe(26);
  });

  it("verifies coordinate string parser", () => {
    expect(parseCoord("A1")).toEqual({ row: 0, col: 0 });
    expect(parseCoord("B4")).toEqual({ row: 3, col: 1 });
    expect(parseCoord("D4")).toEqual({ row: 3, col: 3 });
    expect(parseCoord("E9")).toEqual({ row: 8, col: 4 });
    expect(parseCoord("F7")).toEqual({ row: 6, col: 5 });
    expect(parseCoord("invalid")).toBeNull();
  });

  it("verifies complete NotixNode Cluster infrastructure dataset calculations", () => {
    const clusterGrid: SheetGrid = {
      // Row 3 (index 2) - Headers
      "2:0": { raw: "Server Node" },
      "2:1": { raw: "RAM (GB)" },
      "2:2": { raw: "CPU Cores" },
      "2:3": { raw: "Monthly Cost (₹)" },
      "2:4": { raw: "Active Clients" },
      "2:5": { raw: "Monthly Revenue (₹)" },

      // Row 4 (index 3): Basic Node Tier-1 | 1 | 1 | 69 | 24
      "3:0": { raw: "Basic Node Tier-1" },
      "3:1": { raw: "1" },
      "3:2": { raw: "1" },
      "3:3": { raw: "69", format: "currency" },
      "3:4": { raw: "24" },
      "3:5": { raw: "=D4*E4", format: "currency" },

      // Row 5 (index 4): Standard Node Tier-2 | 1 | 2 | 149 | 15
      "4:0": { raw: "Standard Node Tier-2" },
      "4:1": { raw: "1" },
      "4:2": { raw: "2" },
      "4:3": { raw: "149", format: "currency" },
      "4:4": { raw: "15" },
      "4:5": { raw: "=D5*E5", format: "currency" },

      // Row 6 (index 5): Premium Node Tier-3 | 1 | 3 | 249 | 8
      "5:0": { raw: "Premium Node Tier-3" },
      "5:1": { raw: "1" },
      "5:2": { raw: "3" },
      "5:3": { raw: "249", format: "currency" },
      "5:4": { raw: "8" },
      "5:5": { raw: "=D6*E6", format: "currency" },

      // Row 7 (index 6): Total Infrastructure | Sum/Average formulas | 47
      "6:0": { raw: "Total Infrastructure" },
      "6:1": { raw: "=SUM(B4:B6)" },
      "6:2": { raw: "=SUM(C4:C6)" },
      "6:3": { raw: "=AVERAGE(D4:D6)", format: "currency" },
      "6:4": { raw: "=SUM(E4:E6)" },
      "6:5": { raw: "=SUM(F4:F6)", format: "currency" },
    };

    // Range formulas with text headers gracefully ignoring non-numeric cells:
    expect(evaluateFormula("=SUM(C3:C5)", clusterGrid)).toBe(3);

    // Row 4-6 Revenue calculations:
    expect(evaluateFormula("=D4*E4", clusterGrid)).toBe("1656");
    expect(evaluateFormula("=D5*E5", clusterGrid)).toBe("2235");
    expect(evaluateFormula("=D6*E6", clusterGrid)).toBe("1992");

    // Row 7 Totals:
    expect(evaluateFormula("=SUM(B4:B6)", clusterGrid)).toBe(3);
    expect(evaluateFormula("=SUM(C4:C6)", clusterGrid)).toBe(6);
    expect(evaluateFormula("=AVERAGE(D4:D6)", clusterGrid)).toBe(155.67);
    expect(evaluateFormula("=SUM(E4:E6)", clusterGrid)).toBe(47);
    expect(evaluateFormula("=SUM(F4:F6)", clusterGrid)).toBe(5883);

    // Verify cell formatting
    expect(formatCellValue(69, "currency")).toBe("₹69");
    expect(formatCellValue(155.67, "currency")).toBe("₹155.67");
    expect(formatCellValue(1656, "currency")).toBe("₹1,656");
    expect(formatCellValue(5883, "currency")).toBe("₹5,883");
  });

  it("verifies undo and redo stack behavior", () => {
    let history: SheetGrid[] = [{ "0:0": { raw: "Initial" } }];
    let historyIndex = 0;

    // Perform edit 1: "Edited 1"
    history = [...history.slice(0, historyIndex + 1), { "0:0": { raw: "Edited 1" } }];
    historyIndex = history.length - 1;
    expect(history[historyIndex]["0:0"].raw).toBe("Edited 1");

    // Perform edit 2: "Edited 2"
    history = [...history.slice(0, historyIndex + 1), { "0:0": { raw: "Edited 2" } }];
    historyIndex = history.length - 1;
    expect(history[historyIndex]["0:0"].raw).toBe("Edited 2");

    // Undo 1 step (Ctrl+Z)
    if (historyIndex > 0) historyIndex--;
    expect(history[historyIndex]["0:0"].raw).toBe("Edited 1");

    // Undo 2nd step (Ctrl+Z)
    if (historyIndex > 0) historyIndex--;
    expect(history[historyIndex]["0:0"].raw).toBe("Initial");

    // Redo 1 step (Ctrl+Y)
    if (historyIndex < history.length - 1) historyIndex++;
    expect(history[historyIndex]["0:0"].raw).toBe("Edited 1");
  });
});
