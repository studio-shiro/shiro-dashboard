"use client";

import type { BatchForTable } from "@/types/database";
import { Tag } from "@/components/shared/Tag";
import clsx from "clsx";

function getDaysUntilExpiry(expirationDate: string | null): number | null {
  if (!expirationDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const HEADERS = [
  "Número de Lote",
  "EAN-13",
  "Fecha de Elaboración",
  "Fecha de Vencimiento",
  "Stock",
  "Días hasta Vencimiento",
  "Tag",
];

interface BatchesSubTableProps {
  batches: BatchForTable[];
}

export function BatchesSubTable({ batches }: BatchesSubTableProps) {
  return (
    <div className="bg-background-300 border-t border-border-200">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-200">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-left body-sm-semibold text-text-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => {
            const days = getDaysUntilExpiry(batch.expiration_date);
            const isExpired = days !== null && days < 0;
            const isExpiringSoon = days !== null && days >= 0 && days <= 30;

            return (
              <tr
                key={batch.id}
                className={clsx(
                  "border-b border-border-100 last:border-0",
                  isExpired && "bg-danger-300/30",
                )}
              >
                <td className="px-3 py-3 body-md-regular text-text-500">
                  {batch.lot_number ?? "—"}
                </td>
                <td className="px-3 py-3 body-md-regular text-text-400">—</td>
                <td className="px-3 py-3 body-md-regular text-text-500">
                  {formatDate(batch.received_at)}
                </td>
                <td className="px-3 py-3 body-md-regular text-text-500">
                  {formatDate(batch.expiration_date)}
                </td>
                <td className="px-3 py-3 body-md-regular text-text-500">
                  {batch.quantity}
                </td>
                <td className="px-3 py-3">
                  {days === null ? (
                    <span className="body-md-regular text-text-400">—</span>
                  ) : isExpired ? (
                    <Tag variant="danger">Vencido</Tag>
                  ) : isExpiringSoon ? (
                    <Tag variant="neutral">{days} días</Tag>
                  ) : (
                    <Tag variant="neutral">{days} días</Tag>
                  )}
                </td>
                <td className="px-3 py-3">
                  {days === null ? (
                    <Tag variant="neutral">Sin Fecha</Tag>
                  ) : isExpired ? (
                    <Tag variant="danger">Vencido</Tag>
                  ) : isExpiringSoon ? (
                    <Tag variant="warning">Próximo a Vencer</Tag>
                  ) : (
                    <Tag variant="success">Apto Consumo</Tag>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
