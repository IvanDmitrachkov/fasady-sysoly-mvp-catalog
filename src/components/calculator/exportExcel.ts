import type { SheetData } from "write-excel-file/browser";
import { PRICES_ARE_PLACEHOLDER, isVisible, optionOf, params, totals, type Row } from "@/lib/pricing";

const HEADER_BG = "#ebe2d3";

/** Светлый текст на тёмном образце цвета и наоборот */
function textOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#000000" : "#ffffff";
}

/** Выгрузка расчёта в .xlsx: открывается в Excel и печатается как обычная таблица */
export async function exportExcel(rows: Row[]) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const t = totals(rows);
  const columnsCount = 1 + params.length + 8;
  const header = ["№", ...params.map((p) => p.label), "Ширина, мм", "Высота, мм", "Кол-во, шт", "Площадь, м²", "Цена за шт, ₽", "Сумма, ₽", "Срок, дн."];

  const data: SheetData = [
    [{ value: "Расчёт заказа: Фасады Сысолы", fontWeight: "bold", fontSize: 14, columnSpan: columnsCount }],
    [{ value: `Дата: ${new Date().toLocaleDateString("ru-RU")}`, columnSpan: columnsCount }],
    [{ value: "Розничная цена по прайсу. Окончательная стоимость определяется после замера. Площадь считается от 0,5 м² на фасад, кроме белого RAL 9003.", columnSpan: columnsCount }],
    ...(PRICES_ARE_PLACEHOLDER
      ? [[{ value: "Расчёт на условном прайсе: до внесения цен заказчика суммы не являются предложением.", textColor: "#b00020", columnSpan: columnsCount }]]
      : []),
    [],
    header.map((h) => ({ value: h, fontWeight: "bold" as const, backgroundColor: HEADER_BG, align: "center" as const })),
    ...rows.map((row, i) => {
      const c = t.calcs[i];
      const cells = params.map((p) => {
        if (!isVisible(p, row.values)) return { value: "–", align: "center" as const };
        const o = optionOf(p, row.values);
        return o.hex ? { value: o.label, backgroundColor: o.hex, textColor: textOn(o.hex) } : { value: o.label };
      });
      return [
        { value: i + 1, type: Number, align: "center" as const },
        ...cells,
        { value: c.width, type: Number },
        { value: c.height, type: Number },
        { value: c.qty, type: Number },
        { value: Math.round(c.area * c.qty * 1000) / 1000, type: Number, format: "0.000" },
        { value: c.unit, type: Number, format: "#,##0" },
        { value: c.total, type: Number, format: "#,##0" },
        { value: c.days, type: Number },
      ];
    }),
    [
      // всё до колонки «Кол-во»: №, параметры, ширина и высота
      { value: "Итого", fontWeight: "bold", columnSpan: columnsCount - 5 },
      ...Array(columnsCount - 6).fill(null),
      { value: t.pieces, type: Number, fontWeight: "bold" },
      { value: Math.round(t.area * 1000) / 1000, type: Number, format: "0.000", fontWeight: "bold" },
      null,
      { value: t.total, type: Number, format: "#,##0", fontWeight: "bold", backgroundColor: HEADER_BG },
      { value: t.days, type: Number, fontWeight: "bold" },
    ],
  ];

  const columns = [
    { width: 5 },
    ...params.map((p) => ({ width: p.id === "color" ? 34 : p.id === "edge" ? 20 : 16 })),
    { width: 12 },
    { width: 12 },
    { width: 11 },
    { width: 13 },
    { width: 14 },
    { width: 14 },
    { width: 10 },
  ];

  await writeXlsxFile(data, { columns, stickyRowsCount: 6 }).toFile(`Расчёт заказа ${new Date().toISOString().slice(0, 10)}.xlsx`);
}
