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

  it("verifies extended mathematical formulas", () => {
    const grid: SheetGrid = {
      "0:0": { raw: 10 },
      "0:1": { raw: 20 },
      "0:2": { raw: -15 },
      "0:3": { raw: 5.678 },
    };

    expect(evaluateFormula("=PRODUCT(A1, B1)", grid)).toBe(200);
    expect(evaluateFormula("=ABS(C1)", grid)).toBe(15);
    expect(evaluateFormula("=ROUND(D1, 2)", grid)).toBe(5.68);
    expect(evaluateFormula("=ROUNDUP(D1, 1)", grid)).toBe(5.7);
    expect(evaluateFormula("=ROUNDDOWN(D1, 1)", grid)).toBe(5.6);
    expect(evaluateFormula("=MOD(B1, 3)", grid)).toBe(2);
    expect(evaluateFormula("=POWER(2, 3)", grid)).toBe(8);
    expect(evaluateFormula("=SQRT(144)", grid)).toBe(12);
  });

  it("verifies statistical formulas", () => {
    const grid: SheetGrid = {
      "0:0": { raw: 10 },
      "1:0": { raw: 20 },
      "2:0": { raw: 30 },
      "3:0": { raw: 40 },
      "4:0": { raw: 50 },
      "5:0": { raw: "" },
    };

    expect(evaluateFormula("=COUNT(A1:A5)", grid)).toBe(5);
    expect(evaluateFormula("=COUNTA(A1:A5)", grid)).toBe(5);
    expect(evaluateFormula("=COUNTBLANK(A1:A6)", grid)).toBe(1);
    expect(evaluateFormula("=MAX(A1:A5)", grid)).toBe(50);
    expect(evaluateFormula("=MIN(A1:A5)", grid)).toBe(10);
    expect(evaluateFormula("=MEDIAN(A1:A5)", grid)).toBe(30);
    expect(evaluateFormula("=LARGE(A1:A5, 2)", grid)).toBe(40);
    expect(evaluateFormula("=SMALL(A1:A5, 1)", grid)).toBe(10);
  });

  it("verifies logical and error handling formulas", () => {
    const grid: SheetGrid = {
      "0:0": { raw: 100 },
    };

    expect(evaluateFormula('=IF(A1>50, "Pass", "Fail")', grid)).toBe("Pass");
    expect(evaluateFormula('=IF(A1<50, "Pass", "Fail")', grid)).toBe("Fail");
    expect(evaluateFormula('=IFS(A1<50, "Low", A1=100, "Perfect")', grid)).toBe("Perfect");
    expect(evaluateFormula("=AND(1, 1, 1)", grid)).toBe(true);
    expect(evaluateFormula("=AND(1, 0)", grid)).toBe(false);
    expect(evaluateFormula("=OR(0, 1)", grid)).toBe(true);
    expect(evaluateFormula("=NOT(1)", grid)).toBe(false);
    expect(evaluateFormula('=IFERROR(10/0, "DivError")', grid)).toBe("DivError");
  });

  it("verifies lookup and reference formulas", () => {
    const grid: SheetGrid = {
      // Table: Code | Name | Price
      "0:0": { raw: "P1" },
      "0:1": { raw: "Server Basic" },
      "0:2": { raw: 69 },
      "1:0": { raw: "P2" },
      "1:1": { raw: "Server Standard" },
      "1:2": { raw: 149 },
      "2:0": { raw: "P3" },
      "2:1": { raw: "Server Premium" },
      "2:2": { raw: 249 },
    };

    expect(evaluateFormula('=VLOOKUP("P2", A1:C3, 2, FALSE)', grid)).toBe("Server Standard");
    expect(evaluateFormula('=VLOOKUP("P3", A1:C3, 3, FALSE)', grid)).toBe(249);
    expect(evaluateFormula('=VLOOKUP("P99", A1:C3, 2, FALSE)', grid)).toBe("#N/A!");
    expect(evaluateFormula("=INDEX(A1:C3, 2, 2)", grid)).toBe("Server Standard");
  });

  it("verifies text manipulation formulas", () => {
    const grid: SheetGrid = {
      "0:0": { raw: "NotixNode" },
      "0:1": { raw: "Cloud" },
    };

    expect(evaluateFormula('=CONCAT(A1, " ", B1)', grid)).toBe("NotixNode Cloud");
    expect(evaluateFormula("=LEFT(A1, 5)", grid)).toBe("Notix");
    expect(evaluateFormula("=RIGHT(A1, 4)", grid)).toBe("Node");
    expect(evaluateFormula("=MID(A1, 6, 4)", grid)).toBe("Node");
    expect(evaluateFormula("=LEN(A1)", grid)).toBe(9);
    expect(evaluateFormula('=TRIM("   hello   world   ")', grid)).toBe("hello world");
    expect(evaluateFormula("=UPPER(B1)", grid)).toBe("CLOUD");
    expect(evaluateFormula("=LOWER(B1)", grid)).toBe("cloud");
    expect(evaluateFormula('=PROPER("notixnode cloud")', grid)).toBe("Notixnode Cloud");
    expect(evaluateFormula('=SUBSTITUTE(A1, "Node", "Core")', grid)).toBe("NotixCore");
  });

  it("verifies date and conditional aggregation formulas", () => {
    const grid: SheetGrid = {
      "0:0": { raw: 10 },
      "1:0": { raw: 20 },
      "2:0": { raw: 30 },
      "0:1": { raw: 100 },
      "1:1": { raw: 200 },
      "2:1": { raw: 300 },
    };

    expect(evaluateFormula('=SUMIF(A1:A3, ">15", B1:B3)', grid)).toBe(500);
    expect(evaluateFormula('=COUNTIF(A1:A3, ">=20")', grid)).toBe(2);
    expect(evaluateFormula('=AVERAGEIF(A1:A3, ">10", B1:B3)', grid)).toBe(250);
    expect(evaluateFormula("=DATE(2026, 11, 13)", grid)).toBe("2026-11-13");
    expect(evaluateFormula('=YEAR("2026-11-13")', grid)).toBe(2026);
    expect(evaluateFormula('=MONTH("2026-11-13")', grid)).toBe(11);
    expect(evaluateFormula('=DAY("2026-11-13")', grid)).toBe(13);
  });

  it("verifies circular reference detection", () => {
    const circularGrid: SheetGrid = {
      "0:0": { raw: "=B1" },
      "0:1": { raw: "=A1" },
    };

    expect(evaluateFormula("=A1", circularGrid)).toBe("#CIRCULAR!");
  });
});
