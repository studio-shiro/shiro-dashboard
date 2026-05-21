"use client";
import { useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import type { TopProduct } from "@/types/dashboard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { units, color } = payload[0].payload as {
    units: number;
    color: string;
  };
  return (
    <div
      style={{
        backgroundColor: "#fffffd",
        border: "1px solid #e8e8ea",
        borderRadius: 10,
        padding: "6px 12px",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 12,
        color: "#212121",
        boxShadow: `0px 6px 16px -2px ${color}50, 0px 2px 4px -1px rgba(112,113,116,0.08)`,
        whiteSpace: "nowrap" as const,
      }}
    >
      <span style={{ fontWeight: 700 }}>{units}</span> unidades vendidas
    </div>
  );
}

function CenterLabel() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="body-sm-regular text-text-400">Top</span>
      <span className="font-body text-[28px] font-bold leading-none text-text-500">
        5
      </span>
    </div>
  );
}

interface TopProductsChartProps {
  data: TopProduct[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const renderActiveShape = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
        props;
      const filterId = `glow-${fill.replace("#", "")}`;
      return (
        <g>
          <defs>
            <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="6"
                floodColor={fill}
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius - 2}
            outerRadius={outerRadius + 6}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            filter={`url(#${filterId})`}
          />
        </g>
      );
    },
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-body text-2xl font-bold leading-none text-text-500">
          Productos Destacados
        </h2>
        <div className="flex flex-col">
          <p className="body-md-regular text-text-400">
            Tu top 5 de lo más vendido.
          </p>
          <p className="body-sm-regular text-text-400">
            Última actualización el 24 de mayo de 2026 a las 10:30hs
          </p>
        </div>
      </div>

      <div className="flex h-[282px] items-center rounded-2xl border border-border-200 bg-background-400 px-5 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.08),0px_2px_4px_-2px_rgba(112,113,116,0.06)]">
        {/* Donut chart */}
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={2}
                stroke="#fffffd"
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <CenterLabel />
        </div>

        {/* Legend */}
        <div className="ml-6 flex flex-col gap-2.5">
          {data.map((product, index) => (
            <div
              key={product.name}
              className="flex items-center gap-2 transition-opacity duration-150"
              style={{
                opacity:
                  activeIndex === undefined || activeIndex === index ? 1 : 0.35,
              }}
            >
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: product.color }}
              />
              <span className="heading-sm text-text-500">
                {product.value}%
              </span>
              <span className="body-md-regular text-text-400">
                {product.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
