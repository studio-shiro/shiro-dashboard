"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STOCK_DATA = [
  { name: "Coca", quantity: 7, threshold: 20 },
  { name: "Beldent", quantity: 2, threshold: 20 },
  { name: "Jorgito", quantity: 14, threshold: 20 },
  { name: "Milka", quantity: 4, threshold: 20 },
  { name: "Sprite", quantity: 22, threshold: 35 },
  { name: "Cepita", quantity: 9, threshold: 20 },
  { name: "Bubaloo", quantity: 1, threshold: 20 },
];

function getBarColor(quantity: number, threshold: number): string {
  const ratio = quantity / threshold;
  if (ratio < 0.2) return "#cd2b31"; // danger-300
  if (ratio < 0.6) return "#ff9900"; // warning-300
  return "#b46c00"; // warning-400
}

const Y_TICKS = [0, 5, 10, 15, 20, 35, 50];

export function StockAlertChart() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-body text-2xl font-bold leading-none text-text-500">
          Alerta de stock
        </h2>
        <div className="flex flex-col">
          <p className="font-body text-sm leading-5 text-text-400">
            Tus alertas más urgentes.
          </p>
          <p className="font-body text-xs leading-4 text-text-400">
            Última actualización el 24 de mayo de 2026 a las 10:30hs
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border-200 bg-background-400 px-4 pb-4 pt-5 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.08),0px_2px_4px_-2px_rgba(112,113,116,0.06)]">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={STOCK_DATA}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              vertical={false}
              stroke="#e8e8ea"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontFamily: "Montserrat", fontSize: 11, fill: "#616161" }}
            />
            <YAxis
              ticks={Y_TICKS}
              axisLine={false}
              tickLine={false}
              tick={{ fontFamily: "Montserrat", fontSize: 11, fill: "#616161" }}
              label={{
                value: "Cantidad de Unidades",
                angle: -90,
                position: "insideLeft",
                offset: -2,
                style: {
                  fontFamily: "Montserrat",
                  fontSize: 11,
                  fill: "#616161",
                  textAnchor: "middle",
                },
              }}
              width={52}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{
                fontFamily: "Montserrat",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e8e8ea",
                boxShadow: "0px 4px 8px -2px rgba(112,113,116,0.1)",
              }}
              formatter={(value) => [`${value} unidades`, "Stock"]}
            />
            <ReferenceLine
              y={20}
              stroke="#d1d0c9"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <ReferenceLine
              y={35}
              stroke="#d1d0c9"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Bar dataKey="quantity" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {STOCK_DATA.map((entry, index) => (
                <Cell
                  key={index}
                  fill={getBarColor(entry.quantity, entry.threshold)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
