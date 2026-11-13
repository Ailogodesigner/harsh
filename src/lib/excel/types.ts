export type FormatType =
  | "general"
  | "number"
  | "currency"
  | "accounting"
  | "percentage"
  | "date"
  | "time"
  | "scientific"
  | "text";

export interface BorderStyle {
  style?: "thin" | "medium" | "thick" | "double" | "dashed";
  color?: string;
}

export interface CellBorders {
  top?: BorderStyle | boolean;
  bottom?: BorderStyle | boolean;
  left?: BorderStyle | boolean;
  right?: BorderStyle | boolean;
  doubleBottom?: boolean;
}

export interface DataValidationRule {
  type: "list" | "number" | "date" | "textLength";
  operator?: "between" | "equal" | "greaterThan" | "lessThan";
  values: string[];
  allowBlank?: boolean;
  errorMessage?: string;
}

export interface ConditionalFormatRule {
  id: string;
  type: "cellValue" | "colorScale" | "dataBar";
  operator?: "greaterThan" | "lessThan" | "between" | "equal" | "contains";
  values: string[];
  style: Partial<CellData>;
}

export interface CellComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface CellData {
  raw: string | number | boolean;
  computed?: string | number | boolean | null;
  format?: FormatType;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textColor?: string;
  bgColor?: string;
  align?: "left" | "center" | "right";
  valign?: "top" | "middle" | "bottom";
  wrapText?: boolean;
  borders?: CellBorders;
  border?: boolean; // legacy compatibility
  comment?: CellComment;
  note?: string;
  validation?: DataValidationRule;
  locked?: boolean;
  error?: string;
}

export type SheetGrid = Record<string, CellData>;

export interface SheetTab {
  id: string;
  name: string;
  grid: SheetGrid;
  maxRows: number;
  maxCols: number;
  rowHeights?: Record<number, number>;
  colWidths?: Record<number, number>;
  freezeRows?: number;
  freezeCols?: number;
  tabColor?: string;
  isProtected?: boolean;
  password?: string;
  conditionalFormats?: ConditionalFormatRule[];
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export type ChartType = "bar" | "line" | "pie" | "doughnut" | "area" | "scatter";

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  dataRange: string; // e.g. "B4:B6" or "Sheet1!B4:B6"
  labelRange?: string; // e.g. "A4:A6"
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkbookData {
  id: string;
  title: string;
  sheets: SheetTab[];
  activeSheetId: string;
  charts?: ChartConfig[];
  isProtected?: boolean;
  password?: string;
}

export type RibbonTab =
  | "file"
  | "home"
  | "wps_pdf"
  | "insert"
  | "page_layout"
  | "formulas"
  | "data"
  | "review"
  | "view"
  | "help";

