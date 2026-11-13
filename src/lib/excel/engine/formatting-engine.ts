import { FormatType } from "../types";

export function parseNumeric(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  // Strip currency symbols (₹, $, €, £), spaces, and commas
  const cleaned = String(val).replace(/[₹$€£\s,]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatCellValue(value: any, format?: FormatType): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string" && (value.startsWith("#") || value.startsWith("ERR:"))) {
    return value;
  }

  const num = parseNumeric(value);
  const isNum = !isNaN(num) && typeof value !== "boolean";

  switch (format) {
    case "currency": {
      if (!isNum) return String(value);
      const isInteger = Number.isInteger(num);
      return `₹${num.toLocaleString("en-IN", {
        minimumFractionDigits: isInteger ? 0 : 2,
        maximumFractionDigits: 2,
      })}`;
    }

    case "accounting": {
      if (!isNum) return String(value);
      if (num < 0) {
        return `(₹${Math.abs(num).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })})`;
      }
      return `₹${num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    case "percentage": {
      if (!isNum) return String(value);
      const pct = num * 100;
      const isInteger = Number.isInteger(pct);
      return `${pct.toFixed(isInteger ? 0 : 2)}%`;
    }

    case "number": {
      if (!isNum) return String(value);
      return num.toLocaleString("en-US", {
        minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
        maximumFractionDigits: 4,
      });
    }

    case "scientific": {
      if (!isNum) return String(value);
      return num.toExponential(2).toUpperCase();
    }

    case "date": {
      if (!value) return "";
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
    }

    case "time": {
      if (!value) return "";
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      return d.toLocaleTimeString("en-GB"); // HH:MM:SS
    }

    case "text":
      return String(value);

    case "general":
    default:
      if (typeof value === "number") {
        return value.toLocaleString("en-US", {
          maximumFractionDigits: 8,
          useGrouping: false,
        });
      }
      return String(value);
  }
}

