import { NavLink } from "react-router-dom";
import { MonthPicker } from "./MonthPicker";
import { useCurrentMonth } from "../../hooks/useMonthBudget";
import { useSpentByCategory } from "../../hooks/useTransactions";
import { formatCurrency } from "../../utils/format";

const navItems = [
  { to: "/", label: "Dashboard", icon: "◉" },
  { to: "/transactions", label: "Transactions", icon: "⇄" },
  { to: "/categories", label: "Categories", icon: "▦" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export function Sidebar() {
  const month = useCurrentMonth();
  const spentMap = useSpentByCategory();

  const totalBudget =
    month?.categories.reduce((a, c) => a + c.budgetAmount, 0) ?? 0;
  const totalSpent = Array.from(spentMap.values()).reduce((a, v) => a + v, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <aside className="w-64 h-screen sticky top-0 bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-border">
        <h1 className="font-sans text-2xl font-extrabold tracking-tight gradient-text">
          Vantage
        </h1>
        <div className="text-text3 text-xs tracking-[0.15em] uppercase mt-1.5">
          Personal Finance
        </div>
      </div>

      {/* Month Picker */}
      <div className="py-5 border-b border-border">
        <MonthPicker />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-all duration-150 ${
                isActive
                  ? "text-accent bg-accent/8 border-r-2 border-accent"
                  : "text-text2 hover:text-text hover:bg-surface2"
              }`
            }>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="px-6 py-6 pb-8 border-t border-border">
        <div className="text-xs text-text3 tracking-[0.12em] uppercase mb-3">
          This Month
        </div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-text3">Spent</span>
          <span className="text-accent2">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text3">Left</span>
          <span className={remaining < 0 ? "text-danger" : "text-accent3"}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>
    </aside>
  );
}
