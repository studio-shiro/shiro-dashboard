"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  useXAxisTicks,
  usePlotArea,
} from "recharts";
import type { StockAlertItem } from "@/types/dashboard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

function getBarColor(quantity: number, threshold: number): string {
  const ratio = quantity / threshold;
  if (ratio < 0.2) return "#cd2b31"; // danger-300
  if (ratio < 0.6) return "#ff9900"; // warning-300
  return "#b46c00"; // warning-400
}

const Y_TICKS = [0, 10, 20, 30, 40, 50];

// Renders vertical separator lines at each band boundary.
// Tick coordinates are at band centers, so the boundary between bands[i] and bands[i+1]
// is the midpoint of their two tick coordinates — matching the hover cursor edges exactly.
function BandSeparators() {
  const ticks = useXAxisTicks();
  const plotArea = usePlotArea();

  if (!ticks || ticks.length < 2 || !plotArea) return null;

  const bandWidth = ticks[1].coordinate - ticks[0].coordinate;
  const last = ticks[ticks.length - 1];
  const separatorXs = [
    ...ticks.slice(0, -1).map((tick, i) => (tick.coordinate + ticks[i + 1].coordinate) / 2),
    last.coordinate + bandWidth / 2,
  ];

  return (
    <>
      {separatorXs.map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={plotArea.y}
          x2={x}
          y2={plotArea.y + plotArea.height}
          stroke="#e8e8ea"
          strokeWidth={1}
        />
      ))}
    </>
  );
}

interface StockAlertChartProps {
  data: StockAlertItem[];
}

export function StockAlertChart({ data }: StockAlertChartProps) {
  return (
    <div className="flex flex-col flex-1 gap-3">
      <SectionHeader
        title="Alerta de stock"
        description="Tus alertas más urgentes."
        lastUpdated="Última actualización el 24 de mayo de 2026 a las 10:30hs"
      />

      <div className="rounded-2xl border border-border-200 bg-background-400 px-4 pb-4 pt-5 shadow-md">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid vertical={false} stroke="#e8e8ea" />
            <XAxis
              dataKey="name"
              axisLine={{
                stroke: "#e8e8ea",
              }}
              tickLine={false}
              tick={{ fontFamily: "Montserrat", fontSize: 11, fill: "#616161" }}
            />
            <YAxis
              ticks={Y_TICKS}
              axisLine={{
                stroke: "#e8e8ea",
              }}
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
            <BandSeparators />
            <Bar dataKey="quantity" radius={[0, 0, 0, 0]} maxBarSize={36}>
              {data.map((entry, index) => (
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
