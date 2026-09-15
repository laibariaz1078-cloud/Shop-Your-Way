import { Store, DollarSign, ShoppingBag, Gift } from "lucide-react";

const stats = [
  { icon: Store, value: "10.5k", label: "Sellers active our site", highlighted: false },
  { icon: DollarSign, value: "33k", label: "Mopnthly Product Sale", highlighted: true },
  { icon: ShoppingBag, value: "45.5k", label: "Customer active in our site", highlighted: false },
  { icon: Gift, value: "25k", label: "Anual gross sale in our site", highlighted: false },
];

export default function StatsStrip() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`flex flex-col items-center justify-center gap-3 rounded border px-7 py-6 text-center transition-all ${
              stat.highlighted
                ? "border-[#DB4444] bg-[#DB4444] text-white shadow-md"
                : "border-black/30 bg-white text-black hover:border-[#DB4444] hover:bg-[#DB4444] hover:text-white group"
            }`}
          >
            {/* Double Circle Icon Frame */}
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                stat.highlighted
                  ? "bg-white/30"
                  : "bg-black/30 group-hover:bg-white/30"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  stat.highlighted
                    ? "bg-white text-black"
                    : "bg-black text-white group-hover:bg-white group-hover:text-black"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>

            <p className="text-3xl font-bold tracking-wide">{stat.value}</p>
            <p className="text-sm font-normal">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}