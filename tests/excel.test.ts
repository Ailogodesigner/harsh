import { describe, it, expect } from "vitest";
import { colToLetter, letterToCol, parseCoord, evaluateFormula } from "@/app/excel/page";

describe("Excel Engine Verification", () => {
  it("verifies column index to letter translation", () => {
    expect(colToLetter(0)).toBe("A");
    expect(colToLetter(1)).toBe("B");
    expect(colToLetter(25)).toBe("Z");
    expect(colToLetter(26)).toBe("AA");
    expect(colToLetter(27)).toBe("AB");
  });

  it("verifies column letter to index translation", () => {
    expect(letterToCol("A")).toBe(0);
    expect(letterToCol("B")).toBe(1);
    expect(letterToCol("Z")).toBe(25);
    expect(letterToCol("AA")).toBe(26);
    expect(letterToCol("AB")).toBe(27);
  });

  it("verifies coordinate string parser", () => {
    expect(parseCoord("A1")).toEqual({ row: 0, col: 0 });
    expect(parseCoord("B5")).toEqual({ row: 4, col: 1 });
    expect(parseCoord("E9")).toEqual({ row: 8, col: 4 });
    expect(parseCoord("Z100")).toEqual({ row: 99, col: 25 });
    expect(parseCoord("invalid")).toBeNull();
  });

  it("calculates basic math and range formulas", () => {
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

  it("calculates multi-arg and expanded mathematical functions", () => {
    const grid = {
      "0:0": { raw: "10" },
      "1:0": { raw: "20" },
      "0:1": { raw: "5" },
    };

    // Comma-separated SUM
    expect(evaluateFormula("=SUM(A1, B1, 15)", grid)).toBe(30);
    // PRODUCT
    expect(evaluateFormula("=PRODUCT(A1, B1)", grid)).toBe(50);
    // ROUND
    expect(evaluateFormula("=ROUND(15.6789, 2)", grid)).toBe(15.68);
    // ABS, SQRT, POWER, MOD
    expect(evaluateFormula("=ABS(-42)", grid)).toBe(42);
    expect(evaluateFormula("=SQRT(25)", grid)).toBe(5);
    expect(evaluateFormula("=POWER(2, 3)", grid)).toBe(8);
    expect(evaluateFormula("=MOD(10, 3)", grid)).toBe(1);
    // Text formulas
    expect(evaluateFormula("=UPPER(\"notixnode\")", grid)).toBe("NOTIXNODE");
    expect(evaluateFormula("=LOWER(\"EXCEL\")", grid)).toBe("excel");
    expect(evaluateFormula("=LEN(\"hello\")", grid)).toBe(5);
    expect(evaluateFormula("=CONCAT(\"A\", \"B\", \"C\")", grid)).toBe("ABC");
    // IF formula
    expect(evaluateFormula("=IF(A1>5, \"Pass\", \"Fail\")", grid)).toBe("Pass");
    expect(evaluateFormula("=IF(A1<5, \"Pass\", \"Fail\")", grid)).toBe("Fail");
    // Exponent in arithmetic
    expect(evaluateFormula("=2^3", grid)).toBe("8");
  });
});
