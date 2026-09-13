export default function MetricCard({
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  color = "#2563EB",
  size = "default",
}) {
  const isLarge = size === "large"

  return (
    <div className="bg-surface border border-border rounded-xl p-5
                    relative overflow-hidden group hover:border-border
                    transition-all duration-200">

      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
           style={{ backgroundColor: color }} />

      <div className="pl-2">

        {/* Label */}
        <p className="text-textsecondary text-xs uppercase tracking-wider
                      font-medium mb-2">
          {label}
        </p>

        {/* Value */}
        <p className={`font-bold text-textprimary leading-none
                       ${isLarge ? 'text-4xl' : 'text-2xl'}`}>
          {value}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-textsecondary text-xs mt-2">
            {subtitle}
          </p>
        )}

        {/* Trend indicator */}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium
                           ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span>{trend >= 0 ? '↑' : '↓'}</span>
            <span>{trendLabel || `${Math.abs(trend).toFixed(2)}%`}</span>
          </div>
        )}

      </div>
    </div>
  )
}