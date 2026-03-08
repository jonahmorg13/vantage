import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useCurrentMonth } from "../../hooks/useMonthBudget";
import { Panel } from "../ui/Panel";
import { formatCurrency } from "../../utils/format";
import type { Category } from "../../types";

export function AllocationChart() {
  const month = useCurrentMonth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!month) return null;

  const totalBudget = month.categories.reduce((a, c) => a + c.budgetAmount, 0);
  const data: Category[] = month.categories
    .filter((c) => c.budgetAmount > 0)
    .sort((a, b) => b.budgetAmount - a.budgetAmount);

  const isEmpty = data.length === 0;
  const displayTotal =
    totalBudget > 0
      ? `$${(Math.round(totalBudget / 100) / 10).toFixed(1)}k`
      : "$0";

  const activeCat = activeIndex !== null ? data[activeIndex] : null;

  return (
    <Panel title="Allocation Breakdown">
      <div className="grid grid-cols-[240px_1fr] gap-8 items-center p-8 max-[900px]:grid-cols-1 max-[900px]:justify-items-center">
        {/* Donut */}
        <div className="relative w-[200px] h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={isEmpty ? [{ name: "Empty", budgetAmount: 1 }] : data}
                dataKey="budgetAmount"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={isEmpty ? 0 : 1}
                strokeWidth={0}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={600}
                animationEasing="ease-out">
                {isEmpty ? (
                  <Cell fill="var(--color-surface3)" opacity={1} />
                ) : (
                  data.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      opacity={
                        activeIndex === null || activeIndex === i ? 0.85 : 0.35
                      }
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseLeave={() => setActiveIndex(null)}
                      style={{ cursor: "default", outline: "none" }}
                    />
                  ))
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {activeCat ? (
              <>
                <div
                  className="font-sans text-base font-bold text-center leading-tight px-3"
                  style={{ color: activeCat.color }}>
                  {formatCurrency(activeCat.budgetAmount)}
                </div>
                <div className="text-xs text-text3 uppercase tracking-[0.1em] mt-1 text-center px-3 leading-tight max-w-[130px] truncate">
                  {activeCat.name}
                </div>
                <div
                  className="text-xs font-medium mt-1"
                  style={{ color: activeCat.color }}>
                  {((activeCat.budgetAmount / totalBudget) * 100).toFixed(1)}%
                </div>
              </>
            ) : (
              <>
                <div className="font-sans text-xl font-bold">
                  {displayTotal}
                </div>
                <div className="text-xs text-text3 uppercase tracking-[0.1em] mt-1">
                  Budgeted
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {data.slice(0, 8).map((cat, i) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 text-sm cursor-default transition-opacity"
              style={{
                opacity: activeIndex === null || activeIndex === i ? 1 : 0.4,
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}>
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-text2 flex-1">{cat.name}</span>
              <span className="text-text2 text-sm font-medium">
                {((cat.budgetAmount / totalBudget) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
