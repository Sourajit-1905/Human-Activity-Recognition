import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  CartesianGrid,
  LabelList,
} from "recharts";
import { useHAR } from "../context/HARContext";
import MetricCard from "../components/MetricCard";
import ArchitectureCard from "../components/ArchitectureCard";
import { MODEL_ORDER } from "../constants";

// ── Sub-components ────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-textprimary font-bold text-lg">{title}</h2>
      {subtitle && (
        <p className="text-textsecondary text-sm mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: "#243044",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#F1F5F9",
  fontSize: "12px",
};

function AccuracyBarChart({ data, dataKey, title, color = "#2563EB" }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p
        className="text-textsecondary text-xs uppercase tracking-wider
                    font-medium mb-4"
      >
        {title}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 50, left: 10, bottom: 0 }}
        >
          <XAxis
            type="number"
            domain={[88, 100]}
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="model"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={75}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v}%`, title]}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} maxBarSize={22}>
            <LabelList
              dataKey={dataKey}
              position="right"
              formatter={(v) => `${v}%`}
              style={{ fill: "#94A3B8", fontSize: 11 }}
            />
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ParameterScatterPlot({ data }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p
        className="text-textsecondary text-xs uppercase tracking-wider
                    font-medium mb-1"
      >
        Parameter Efficiency
      </p>
      <p className="text-muted text-xs mb-4">
        Top-left = best efficiency (high accuracy, few parameters)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="params"
            scale="log"
            domain={[50000, 3000000]}
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            tickFormatter={(v) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : `${(v / 1_000).toFixed(0)}K`
            }
            name="Parameters"
          />
          <YAxis
            type="number"
            dataKey="valAccuracy"
            domain={[95, 100]}
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            name="Val Accuracy"
          />
          <ZAxis range={[80, 80]} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name) => [
              name === "Parameters"
                ? value >= 1_000_000
                  ? `${(value / 1_000_000).toFixed(2)}M`
                  : `${(value / 1_000).toFixed(1)}K`
                : `${value}%`,
              name,
            ]}
          />
          <Scatter
            data={data}
            shape={(props) => {
              const { cx, cy, payload } = props;
              return (
                <g>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={8}
                    fill={payload.color}
                    opacity={0.9}
                  />
                  <text
                    x={cx}
                    y={cy - 14}
                    textAnchor="middle"
                    fill="#F1F5F9"
                    fontSize={10}
                    fontWeight="600"
                  >
                    {payload.model}
                  </text>
                </g>
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrainingTimeChart({ data }) {
  const sorted = [...data].sort((a, b) => b.time - a.time);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p
        className="text-textsecondary text-xs uppercase tracking-wider
                    font-medium mb-1"
      >
        Training Time
      </p>
      <p className="text-muted text-xs mb-4">
        Seconds to train — lower is faster
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            tickFormatter={(v) => `${v}s`}
          />
          <YAxis
            type="category"
            dataKey="model"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={75}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v}s`, "Training Time"]}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="time" radius={[0, 4, 4, 0]} maxBarSize={22}>
            <LabelList
              dataKey="time"
              position="right"
              formatter={(v) => `${v}s`}
              style={{ fill: "#94A3B8", fontSize: 11 }}
            />
            {sorted.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GeneralizationGapChart({ data }) {
  const sorted = [...data].sort((a, b) => a.gap - b.gap);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p
        className="text-textsecondary text-xs uppercase tracking-wider
                    font-medium mb-1"
      >
        Generalization Gap
      </p>
      <p className="text-muted text-xs mb-4">
        Val accuracy minus test accuracy — lower is better
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="model"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={75}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${v}%`, "Gap"]}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="gap" radius={[0, 4, 4, 0]} maxBarSize={22}>
            <LabelList
              dataKey="gap"
              position="right"
              formatter={(v) => `${v}%`}
              style={{ fill: "#94A3B8", fontSize: 11 }}
            />
            {sorted.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.gap <= 3.8
                    ? "#38BDF8" 
                    : entry.gap <= 4.5
                      ? "#818CF8" 
                      : "#F472B6" 
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MasterTable({ rows }) {
  const { helpers } = useHAR();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {[
              "Rank",
              "Model",
              "Val Acc",
              "Test Acc",
              "Gap",
              "Parameters",
              "Train Time",
              "Epochs",
            ].map((h) => (
              <th
                key={h}
                className="text-left text-xs text-muted uppercase
                             tracking-wider pb-3 pr-5 font-medium
                             whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.model}
              className={`border-b border-border/50
                            hover:bg-surface2/50 transition-colors
                            ${i === 0 ? "bg-accent/5" : ""}`}
            >
              <td className="py-3 pr-5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center
                                 justify-center text-xs font-bold
                                 ${
                                   i === 0
                                     ? "bg-accent text-white"
                                     : "bg-surface text-muted"
                                 }`}
                >
                  {i + 1}
                </div>
              </td>
              <td className="py-3 pr-5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: helpers.getModelColor(row.model),
                    }}
                  />
                  <span className="text-textprimary font-medium">
                    {row.model}
                  </span>
                </div>
              </td>
              <td className="py-3 pr-5 font-mono text-textsecondary text-xs">
                {helpers.formatAccuracy(row.valAcc)}
              </td>
              <td
                className={`py-3 pr-5 font-mono font-bold text-xs
                              ${helpers.getAccuracyColor(row.testAcc)}`}
              >
                {helpers.formatAccuracy(row.testAcc)}
              </td>
              <td
                className={`py-3 pr-5 font-mono text-xs
                              ${helpers.getGapSeverity(row.gap)}`}
              >
                {helpers.formatGap(row.gap)}
              </td>
              <td className="py-3 pr-5 font-mono text-textsecondary text-xs">
                {helpers.formatParams(row.params)}
              </td>
              <td className="py-3 pr-5 font-mono text-textsecondary text-xs">
                {helpers.formatTime(row.time)}
              </td>
              <td className="py-3 pr-5 font-mono text-textsecondary text-xs">
                {row.epochs}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function ModelComparison() {
  const { data, bestModel, helpers } = useHAR();

  if (!data) return null;

  // Build chart datasets
  const rows = Object.entries(data.test_results)
    .map(([model, result]) => {
      const comp = data.model_comparison?.find((m) => m.Model === model);
      return {
        model: model,
        valAcc: result.val_accuracy,
        testAcc: result.test_accuracy,
        gap: result.generalization_gap,
        params: comp?.Parameters,
        time: comp?.["Train Time(s)"],
        epochs: comp?.Epochs,
        color: helpers.getModelColor(model),
      };
    })
    .sort((a, b) => b.testAcc - a.testAcc);

  const valChartData = [...rows]
    .sort((a, b) => b.valAcc - a.valAcc)
    .map((r) => ({
      model: r.model,
      valAccuracy: parseFloat((r.valAcc * 100).toFixed(2)),
      color: r.color,
    }));

  const testChartData = [...rows].map((r) => ({
    model: r.model,
    testAccuracy: parseFloat((r.testAcc * 100).toFixed(2)),
    color: r.color,
  }));

  const scatterData = rows.map((r) => ({
    model: r.model,
    params: r.params,
    valAccuracy: parseFloat((r.valAcc * 100).toFixed(2)),
    color: r.color,
  }));

  const timeData = rows.map((r) => ({
    model: r.model,
    time: r.time,
    color: r.color,
  }));

  const gapData = rows.map((r) => ({
    model: r.model,
    gap: parseFloat((r.gap * 100).toFixed(2)),
    color: r.color,
  }));

  // Key insight numbers
  const cnnRow = rows.find((r) => r.model === "CNN");
  const lstmRow = rows.find((r) => r.model === "LSTM");
  const gruRow = rows.find((r) => r.model === "GRU");
  const mlpRow = rows.find((r) => r.model === "MLP");

  const paramRatio =
    lstmRow && cnnRow ? (lstmRow.params / cnnRow.params).toFixed(1) : "—";
  const timeRatio =
    lstmRow && gruRow ? (lstmRow.time / gruRow.time).toFixed(1) : "—";
  const mlpToCnnGain =
    mlpRow && cnnRow ? ((cnnRow.valAcc - mlpRow.valAcc) * 100).toFixed(2) : "—";

  return (
    <div className="space-y-8 max-w-6xl">
      {/* ── Page header ── */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-textprimary font-bold text-xl mb-2">
          Model Comparison
        </h2>
        <p className="text-textsecondary text-sm leading-relaxed max-w-3xl">
          Side-by-side comparison of all five architectures across accuracy,
          parameter efficiency, training time, and generalization. The key
          finding: validation and test rankings diverge — CNN wins on validation
          but GRU generalises better to unseen subjects.
        </p>
      </div>

      {/* ── Insight cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="CNN vs LSTM Parameters"
          value={`${paramRatio}x`}
          subtitle="LSTM needs more params for lower accuracy"
          color="#E57373"
        />
        <MetricCard
          label="LSTM vs GRU Train Time"
          value={`${timeRatio}x`}
          subtitle="GRU trains faster with better accuracy"
          color="#FF8A65"
        />
        <MetricCard
          label="MLP → CNN Gain"
          value={`+${mlpToCnnGain}%`}
          subtitle="Proof that temporal structure matters"
          color="#81C784"
        />
        <MetricCard
          label="Ranking Reversal"
          value="CNN → GRU"
          subtitle="Val rank 1 drops to 4 on test data"
          color="#BA68C8"
        />
      </div>

      {/* ── Accuracy charts ── */}
      <div>
        <SectionHeader
          title="Accuracy Comparison"
          subtitle="Validation accuracy vs test accuracy — note the ranking reversal"
        />
        <div className="grid grid-cols-2 gap-4">
          <AccuracyBarChart
            data={valChartData}
            dataKey="valAccuracy"
            title="Validation Accuracy"
          />
          <AccuracyBarChart
            data={testChartData}
            dataKey="testAccuracy"
            title="Test Accuracy (honest)"
          />
        </div>

        {/* Ranking reversal callout */}
        <div
          className="mt-4 bg-yellow-400/5 border border-yellow-400/20
                        rounded-xl p-4 flex items-start gap-3"
        >
          <span className="text-yellow-400 text-lg flex-shrink-0">⚠</span>
          <div>
            <p className="text-yellow-400 font-medium text-sm mb-1">
              Ranking Reversal Detected
            </p>
            <p className="text-textsecondary text-xs leading-relaxed">
              CNN and GRU tied on validation (99.46%) but GRU outperformed CNN
              by 1.56% on test data (95.76% vs 94.20%). CNN overfitted to the
              specific signal characteristics of the 21 training subjects. GRU
              learned more subject-independent sequential patterns.
            </p>
          </div>
        </div>
      </div>

      {/* ── Efficiency charts ── */}
      <div>
        <SectionHeader
          title="Efficiency Analysis"
          subtitle="Parameter count, training time, and generalization gap"
        />
        <div className="grid grid-cols-3 gap-4">
          <ParameterScatterPlot data={scatterData} />
          <TrainingTimeChart data={timeData} />
          <GeneralizationGapChart data={gapData} />
        </div>
      </div>

      {/* ── Architecture cards ── */}
      <div>
        <SectionHeader
          title="Architecture Details"
          subtitle="Per-model summary — metrics, parameters, and architecture string"
        />
        <div className="grid grid-cols-3 gap-4">
          {MODEL_ORDER.filter((m) => data.test_results[m]).map((model) => (
            <ArchitectureCard
              key={model}
              modelName={model}
              isWinner={model === bestModel}
            />
          ))}
        </div>
      </div>

      {/* ── Master table ── */}
      <div>
        <SectionHeader
          title="Complete Comparison Table"
          subtitle="All models · all metrics · ranked by test accuracy"
        />
        <div className="bg-surface border border-border rounded-xl p-6">
          <MasterTable rows={rows} />
        </div>
      </div>
    </div>
  );
}
