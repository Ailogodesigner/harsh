import { describe, it, expect } from "vitest";
import { colToLetter, letterToCol, parseCoord, evaluateFormula } from "@/app/excel/page";

describe("Excel Engine Verification", () => {
  it("verifies column index to letter translation", () => {
    expect(colToLetter(0)).toBe("A");
    expect(colToLetter(1)).toBe("B");
    expect(colToLetter(25)).toBe("Z");
    expect(colToLetter(26)).toBe("AA");
  });

  it("verifies column letter to index translation", () => {
    expect(letterToCol("A")).toBe(0);
    expect(letterToCol("B")).toBe(1);
    expect(letterToCol("Z")).toBe(25);
    expect(letterToCol("AA")).toBe(26);
  });

  it("verifies coordinate string parser", () => {
    expect(parseCoord("A1")).toEqual({ row: 0, col: 0 });
    expect(parseCoord("B5")).toEqual({ row: 4, col: 1 });
    expect(parseCoord("Z100")).toEqual({ row: 99, col: 25 });
    expect(parseCoord("invalid")).toBeNull();
  });

  it("calculates mathematical formulas and range functions", () => {
    const grid = {
      "0:0": { raw: "10" },
      "1:0": { raw: "20" },
      "2:0": { raw: "30" },
      "0:1": { raw: "5" },
    };

    expect(evaluateFormula("=SUM(A1:A3)", grid)).toBe(60);
    expect(evaluateFormula("=AVERAGE(A1:A3)", grid)).toBe(20);
    expect(evaluateFormula("=COUNT(A1:A3)", grid)).toBe(3);
    expect(evaluateFormula("=MAX(A1:A3)", grid)).toBe(30);
    expect(evaluateFormula("=MIN(A1:A3)", grid)).toBe(10);
    expect(evaluateFormula("=A1+B1", grid)).toBe("15");
  });
});
