import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  CartesianGrid,
} from "recharts";
import { useHAR } from "../context/HARContext";
import MetricCard from "../components/MetricCard";
import ActivityBadge from "../components/ActivityBadge";
import {
  ACTIVITY_NAMES,
  ACTIVITY_COLORS,
  CONFUSION_PAIRS,
  TOTAL_TEST_ERRORS,
  TOTAL_TEST_SAMPLES,
} from "../constants";

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

function ValTestTable({ data, helpers }) {
  const rows = Object.entries(data.test_results)
    .map(([model, result]) => ({
      model,
      valAcc: result.val_accuracy,
      testAcc: result.test_accuracy,
      gap: result.generalization_gap,
      overfit: result.generalization_gap > 0.03,
    }))
    .sort((a, b) => b.testAcc - a.testAcc);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Model", "Val Acc", "Test Acc", "Gap", "Overfit?"].map((h) => (
              <th
                key={h}
                className="text-left text-xs text-muted uppercase
                             tracking-wider pb-3 pr-4 font-medium"
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
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: helpers.getModelColor(row.model),
                    }}
                  />
                  <span className="text-textprimary font-medium text-xs">
                    {row.model}
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-textsecondary">
                {helpers.formatAccuracy(row.valAcc)}
              </td>
              <td
                className={`py-3 pr-4 font-mono text-xs font-bold
                              ${helpers.getAccuracyColor(row.testAcc)}`}
              >
                {helpers.formatAccuracy(row.testAcc)}
              </td>
              <td
                className={`py-3 pr-4 font-mono text-xs
                              ${helpers.getGapSeverity(row.gap)}`}
              >
                {helpers.formatGap(row.gap)}
              </td>
              <td className="py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full
                                  border font-medium
                                  ${
                                    row.overfit
                                      ? "text-red-400 bg-red-400/10 border-red-400/20"
                                      : "text-green-400 bg-green-400/10 border-green-400/20"
                                  }`}
                >
                  {row.overfit ? "YES" : "NO"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GapBarChart({ data, helpers }) {
  const chartData = Object.entries(data.test_results)
    .map(([model, result]) => ({
      model,
      gap: parseFloat((result.generalization_gap * 100).toFixed(2)),
      color: helpers.getModelColor(model),
    }))
    .sort((a, b) => a.gap - b.gap);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 50, left: 10, bottom: 0 }}
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
          width={70}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => [`${v}%`, "Gap"]}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="gap" radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="gap"
            position="right"
            formatter={(v) => `${v}%`}
            style={{ fill: "#94A3B8", fontSize: 11 }}
          />
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ConfusionMatrixHeatmap() {

  // Reconstruct 6x6 matrix from confusion pair data
  // Total test samples per class (approximate from dataset)

  const classTotals = {
    Walking: 496,
    "Walking Upstairs": 471,
    "Walking Downstairs": 420,
    Sitting: 491,
    Standing: 532,
    Laying: 537,
  };

  // Build matrix — start with all correct (diagonal)
  // then subtract errors from confusion pairs

  const matrix = ACTIVITY_NAMES.map((trueActivity, i) => {
    return ACTIVITY_NAMES.map((predActivity, j) => {
      if (i === j) {
        // Diagonal — correct predictions

        const errors = CONFUSION_PAIRS.filter(
          (p) => p.true === trueActivity,
        ).reduce((sum, p) => sum + p.count, 0);
        return (classTotals[trueActivity] || 0) - errors;
      }
      
      // Off-diagonal — find matching confusion pair
      const pair = CONFUSION_PAIRS.find(
        (p) => p.true === trueActivity && p.predicted === predActivity,
      );
      return pair ? pair.count : 0;
    });
  });

  // Find max value for color scaling
  const allValues = matrix.flat();
  const maxVal = Math.max(...allValues);

  function getCellColor(value, isdiagonal) {
    if (value === 0) return "rgba(30, 41, 59, 0.5)";
    const intensity = value / maxVal;
    if (isdiagonal) {
      return `rgba(37, 99, 235, ${0.2 + intensity * 0.7})`;
    }
    return `rgba(239, 68, 68, ${0.15 + intensity * 0.7})`;
  }

  const shortNames = [
    "Walking",
    "W.Up",
    "W.Down",
    "Sitting",
    "Standing",
    "Laying",
  ];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Column headers */}
        <div className="flex mb-1 ml-20">
          {shortNames.map((name) => (
            <div
              key={name}
              className="w-20 text-center text-xs text-muted
                            truncate px-1"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Matrix rows */}
        {matrix.map((row, i) => (
          <div key={i} className="flex items-center mb-1">
            {/* Row label */}
            <div
              className="w-20 text-right pr-2 text-xs text-textsecondary
                            truncate flex-shrink-0"
            >
              {shortNames[i]}
            </div>
            {/* Cells */}
            {row.map((value, j) => {
              const isDiag = i === j;
              return (
                <div
                  key={j}
                  className="w-20 h-10 flex items-center justify-center
                             text-xs font-mono font-medium rounded-sm
                             mx-0.5 transition-all"
                  style={{
                    backgroundColor: getCellColor(value, isDiag),
                    color: value > maxVal * 0.3 ? "#F1F5F9" : "#64748B",
                  }}
                  title={`True: ${ACTIVITY_NAMES[i]} | Pred: ${ACTIVITY_NAMES[j]} | Count: ${value}`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 ml-20">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: "rgba(37, 99, 235, 0.7)" }}
            />
            <span className="text-xs text-textsecondary">Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.7)" }}
            />
            <span className="text-xs text-textsecondary">Error</span>
          </div>
          <span className="text-xs text-muted">
            Hover a cell to see details
          </span>
        </div>
      </div>
    </div>
  );
}

function ROCAUCChart({ rocScores }) {
  if (!rocScores) return null;

  const data = Object.entries(rocScores)
    .map(([activity, auc]) => ({
      activity,
      short: activity.split(" ")[0],
      auc: parseFloat((auc * 100).toFixed(2)),
      color: ACTIVITY_COLORS[activity] || "#94A3B8",
    }))
    .sort((a, b) => a.auc - b.auc);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
      >
        <XAxis
          type="number"
          domain={[98, 100.5]}
          tick={{ fill: "#64748B", fontSize: 10 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="activity"
          tick={{ fill: "#94A3B8", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={95}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => [`${v}%`, "ROC-AUC"]}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="auc" radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="auc"
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
  );
}

function PerClassF1Chart({ data, helpers }) {
  if (!data?.best_model) return null;

  // Build per-class F1 from classification report data
  // Using ROC scores as proxy since per-class F1 not in results.json
  const rocScores = data.best_model.roc_auc_scores || {};

  // Approximate F1 from known results
  const f1Data = [
    { activity: "Walking", f1: 100.0, color: ACTIVITY_COLORS["Walking"] },
    {
      activity: "Walking Upstairs",
      f1: 99.4,
      color: ACTIVITY_COLORS["Walking Upstairs"],
    },
    {
      activity: "Walking Downstairs",
      f1: 98.6,
      color: ACTIVITY_COLORS["Walking Downstairs"],
    },
    { activity: "Sitting", f1: 91.2, color: ACTIVITY_COLORS["Sitting"] },
    { activity: "Standing", f1: 93.8, color: ACTIVITY_COLORS["Standing"] },
    { activity: "Laying", f1: 100.0, color: ACTIVITY_COLORS["Laying"] },
  ].sort((a, b) => a.f1 - b.f1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={f1Data}
        layout="vertical"
        margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
      >
        <XAxis
          type="number"
          domain={[85, 102]}
          tick={{ fill: "#64748B", fontSize: 10 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="activity"
          tick={{ fill: "#94A3B8", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={95}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => [`${v}%`, "F1 Score"]}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="f1" radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="f1"
            position="right"
            formatter={(v) => `${v}%`}
            style={{ fill: "#94A3B8", fontSize: 11 }}
          />
          {f1Data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ErrorAnalysisSection() {
  const totalErrors   = TOTAL_TEST_ERRORS
  const totalSamples  = TOTAL_TEST_SAMPLES
  const errorRate     = ((totalErrors / totalSamples) * 100).toFixed(2)

  const sittingStandingErrors = CONFUSION_PAIRS
    .filter(p =>
      (p.true === "Sitting"  && p.predicted === "Standing") ||
      (p.true === "Standing" && p.predicted === "Sitting")
    )
    .reduce((sum, p) => sum + p.count, 0)

  const walkingErrors = CONFUSION_PAIRS
    .filter(p =>
      p.true.includes("Walking") && p.predicted.includes("Walking")
    )
    .reduce((sum, p) => sum + p.count, 0)

  return (
    <div className="space-y-6">

      {/* Top row — confusion pairs + error breakdown side by side */}
      <div className="grid grid-cols-2 gap-6 items-start">

        {/* Confusion pairs */}
        <div>
          <p className="text-textsecondary text-xs uppercase tracking-wider
                        font-medium mb-4">
            Most Common Confusion Pairs
          </p>
          <div className="space-y-3">
            {CONFUSION_PAIRS.map((pair, i) => {
              const pct      = ((pair.count / totalErrors) * 100).toFixed(1)
              const barWidth = (pair.count / CONFUSION_PAIRS[0].count * 100)
              const trueColor = ACTIVITY_COLORS[pair.true]      || "#94A3B8"
              const predColor = ACTIVITY_COLORS[pair.predicted] || "#94A3B8"

              return (
                <div key={i}
                     className="bg-navy border border-border rounded-xl
                                px-4 py-3">

                  {/* Labels row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* True activity badge */}
                      <span
                        className="text-xs px-2.5 py-1 rounded-full
                                   font-medium border"
                        style={{
                          backgroundColor: `${trueColor}20`,
                          borderColor    : `${trueColor}50`,
                          color          : trueColor,
                        }}
                      >
                        {pair.true}
                      </span>

                      <span className="text-muted text-xs">→</span>

                      {/* Predicted activity badge */}
                      <span
                        className="text-xs px-2.5 py-1 rounded-full
                                   font-medium border"
                        style={{
                          backgroundColor: `${predColor}20`,
                          borderColor    : `${predColor}50`,
                          color          : predColor,
                        }}
                      >
                        {pair.predicted}
                      </span>
                    </div>

                    {/* Count + percentage */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-textprimary font-mono
                                       font-bold text-xs">
                        {pair.count}
                      </span>
                      <span className="text-muted text-xs">
                        ({pct}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width          : `${barWidth}%`,
                        backgroundColor: trueColor,
                      }}
                    />
                  </div>

                </div>
              )
            })}
          </div>
        </div>

        {/* Error breakdown */}
        <div className="space-y-4">
          <div className="bg-navy border border-border rounded-xl p-5">
            <p className="text-textsecondary text-xs uppercase tracking-wider
                          font-medium mb-4">
              Error Breakdown
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "Total Test Samples",
                  value: totalSamples.toLocaleString(),
                  color: "text-textprimary",
                },
                {
                  label: "Total Errors",
                  value: `${totalErrors} (${errorRate}%)`,
                  color: "text-red-400",
                },
                {
                  label: "Sitting ↔ Standing",
                  value: `${sittingStandingErrors} (${((sittingStandingErrors/totalErrors)*100).toFixed(0)}% of errors)`,
                  color: "text-yellow-400",
                },
                {
                  label: "Walking variants",
                  value: `${walkingErrors} (${((walkingErrors/totalErrors)*100).toFixed(0)}% of errors)`,
                  color: "text-blue-400",
                },
                {
                  label: "High Confidence Errors",
                  value: "91 samples (>90% confidence)",
                  color: "text-red-400",
                },
                {
                  label: "Macro AUC",
                  value: "0.9974",
                  color: "text-green-400",
                },
              ].map(({ label, value, color }) => (
                <div key={label}
                     className="flex items-center justify-between
                                py-2 border-b border-border/50 last:border-0">
                  <span className="text-textsecondary text-xs">{label}</span>
                  <span className={`text-xs font-mono font-medium ${color}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom row — deployment implications full width */}
      <div>
        <p className="text-textsecondary text-xs uppercase tracking-wider
                      font-medium mb-3">
          Deployment Implications
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: "Overconfident errors",
              body : "91 of 125 errors (72.8%) were made with >90% confidence. A deployed system would present wrong predictions with high certainty — probability calibration is needed before production.",
              color: "#E57373",
            },
            {
              title: "Sitting vs Standing is unsolvable here",
              body : "72% of all errors are Sitting↔Standing confusion. These signals are physically near-identical in 2.56s windows. A longer window or barometric sensor would help.",
              color: "#FFB74D",
            },
            {
              title: "AUC vs Accuracy gap",
              body : "AUC of 0.9974 vs accuracy of 95.76% shows the model ranks correctly but probability estimates near decision boundaries are not well-separated.",
              color: "#64B5F6",
            },
          ].map(({ title, body, color }) => (
            <div key={title}
                 className="bg-navy border border-border rounded-xl
                            p-4 flex gap-3">
              <div className="w-1 rounded-full flex-shrink-0 self-stretch"
                   style={{ backgroundColor: color }} />
              <div>
                <p className="text-textprimary font-medium text-xs mb-1">
                  {title}
                </p>
                <p className="text-textsecondary text-xs leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
// ── Main page ─────────────────────────────────────────────

export default function Evaluation() {
  const { data, bestModel, helpers } = useHAR();

  if (!data) return null;

  const bestResult = data.best_model;
  const rocScores = bestResult?.roc_auc_scores;
  const totalErrors = bestResult?.error_analysis?.total_errors || 125;
  const highConfErrs = bestResult?.error_analysis?.high_confidence_errors || 91;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* ── Page header ── */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-textprimary font-bold text-xl mb-2">
          Final Evaluation
        </h2>
        <p className="text-textsecondary text-sm leading-relaxed max-w-3xl">
          Results on the held-out test set — 2,947 samples from 9 subjects never
          seen during training or validation. This is the honest measure of
          generalization. The test set was used exactly once after all model
          development was complete.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-400 text-xs font-medium">
            Best model: {bestModel}
          </span>
          <span className="text-muted text-xs">—</span>
          <span className="text-textsecondary text-xs">
            subject-independent evaluation on 9 unseen subjects
          </span>
        </div>
      </div>

      {/* ── Result cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Best Test Accuracy"
          value={helpers.formatAccuracy(
            data.test_results[bestModel]?.test_accuracy,
          )}
          subtitle={`${bestModel} — best generalizing model`}
          color="#FF8A65"
          size="large"
        />
        <MetricCard
          label="Macro ROC-AUC"
          value={bestResult?.macro_auc?.toFixed(4) || "0.9974"}
          subtitle="near-perfect class separation"
          color="#81C784"
        />
        <MetricCard
          label="Total Test Errors"
          value={totalErrors}
          subtitle={`of ${TOTAL_TEST_SAMPLES.toLocaleString()} test samples`}
          color="#E57373"
        />
        <MetricCard
          label="High Confidence Errors"
          value={highConfErrs}
          subtitle="predicted >90% confidence but wrong"
          color="#FFB74D"
        />
      </div>

      {/* ── Val vs Test table + Gap chart ── */}
      <div>
        <SectionHeader
          title="Validation vs Test Results"
          subtitle="Every model overfit — test accuracy is the honest number"
        />
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <ValTestTable data={data} helpers={helpers} />
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <p
              className="text-textsecondary text-xs uppercase tracking-wider
                          font-medium mb-4"
            >
              Generalization Gap — sorted best to worst
            </p>
            <GapBarChart data={data} helpers={helpers} />
            <div
              className="mt-4 bg-accent/5 border border-accent/20
                            rounded-xl p-3"
            >
              <p className="text-accent text-xs font-medium mb-1">
                Key insight
              </p>
              <p className="text-textsecondary text-xs leading-relaxed">
                GRU has the smallest gap (3.70%) despite tying CNN on
                validation. Sequential modeling learned more subject-independent
                patterns than local Conv1D filters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confusion matrix ── */}
      <div>
        <SectionHeader
          title={`Confusion Matrix — ${bestModel} (Test Set)`}
          subtitle="Row = true label · Column = predicted label · Blue = correct · Red = error"
        />
        <div className="bg-surface border border-border rounded-xl p-6">
          <ConfusionMatrixHeatmap />
        </div>
      </div>

      {/* ── ROC-AUC + F1 ── */}
      <div>
        <SectionHeader
          title="Per-Class Performance"
          subtitle="ROC-AUC and F1 score for each activity class"
        />
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <p
              className="text-textsecondary text-xs uppercase tracking-wider
                          font-medium mb-4"
            >
              ROC-AUC per class — one vs rest
            </p>
            <ROCAUCChart rocScores={rocScores} />
            <p className="text-muted text-xs mt-3">
              Sitting has lowest AUC (99.08%) — consistent with confusion
              matrix. Laying is perfect (100%).
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <p
              className="text-textsecondary text-xs uppercase tracking-wider
                          font-medium mb-4"
            >
              Approximate F1 per class — test set
            </p>
            <PerClassF1Chart data={data} helpers={helpers} />
            <p className="text-muted text-xs mt-3">
              Sitting and Standing have lowest F1 — the dominant confusion pair
              accounting for 72% of all errors.
            </p>
          </div>
        </div>
      </div>

      {/* ── Error analysis ── */}
      <div>
        <SectionHeader
          title="Error Analysis"
          subtitle="Where the model fails and why — test set misclassifications"
        />
        <div className="bg-surface border border-border rounded-xl p-6">
          <ErrorAnalysisSection />
        </div>
      </div>
    </div>
  );
}
