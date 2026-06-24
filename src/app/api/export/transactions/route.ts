import { NextRequest, NextResponse } from "next/server";
import { getTransactionsForCsvExport } from "@/features/reports/report.service";
import { buildCsv } from "@/lib/csv";

const VALID_TYPES = ["INCOME", "EXPENSE", "TRANSFER"];
const VALID_STATUSES = ["CONFIRMED", "PENDING"];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const rawType = params.get("type") ?? undefined;
  const rawStatus = params.get("status") ?? undefined;

  const filters = {
    dateFrom: params.get("dateFrom") ?? undefined,
    dateTo: params.get("dateTo") ?? undefined,
    accountId: params.get("accountId") ?? undefined,
    categoryId: params.get("categoryId") ?? undefined,
    type: rawType && VALID_TYPES.includes(rawType) ? rawType : undefined,
    status: rawStatus && VALID_STATUSES.includes(rawStatus) ? rawStatus : undefined,
  };

  if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
    return NextResponse.json({ error: "dateFrom no puede ser mayor que dateTo" }, { status: 400 });
  }

  const data = await getTransactionsForCsvExport(filters);

  const headers = ["Fecha", "Tipo", "Estado", "Cuenta Origen", "Cuenta Destino", "Categoría", "Descripción", "Monto", "Moneda"];
  const rows = data.map((d) => [
    d.fecha, d.tipo, d.estado, d.cuentaOrigen, d.cuentaDestino,
    d.categoria, d.descripcion, d.monto, d.moneda,
  ]);

  const csv = buildCsv(headers, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=transacciones-finanzas-personales.csv",
    },
  });
}
