import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useHAR } from "../context/HARContext";
import MetricCard from "../components/MetricCard";
import { MODEL_ORDER } from "../constants";

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
  backgroundColor: '#1A1A1A',
  border         : '1px solid #2A2A2A',
  borderRadius   : '8px',
  color          : '#F1F5F9',
  fontSize       : '12px',
}

function ModelToggle({ model, active, color, onToggle }) {
  return (
    <button
      onClick={() => onToggle(model)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg
                  text-sm font-medium transition-all duration-150
                  border
                  ${
                    active
                      ? "text-textprimary border-opacity-60"
                      : "text-muted border-border opacity-40"
                  }`}
      style={{
        borderColor: active ? color : undefined,
        backgroundColor: active ? `${color}15` : undefined,
      }}
    >
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: active ? color : "#64748B" }}
      />
      {model}
    </button>
  );
}

function ValidationAccuracyChart({ chartData, activeModels, colors }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p
        className="text-textsecondary text-xs uppercase tracking-wider
                    font-medium mb-4"
      >
        Validation Accuracy — per epoch
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis
            dataKey="epoch"
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            label={{
              value: "Epoch",
              position: "insideBottom",
              offset: -2,
              fill: "#64748B",
              fontSize: 10,
            }}
          />
          <YAxis
            domain={[85, 101]}
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [`${v.toFixed(2)}%`, name]}
            labelFormatter={(l) => `Epoch ${l}`}
          />
          {activeModels.map((model) => (
            <Line
              key={model}
              type="monotone"
              dataKey={model}
              stroke={colors[model]}
              strokeWidth={1.8}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ValidationLossChart({ chartData, activeModels, colors }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p
        className="text-textsecondary text-xs uppercase tracking-wider
                    font-medium mb-4"
      >
        Validation Loss — log scale
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis
            dataKey="epoch"
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            label={{
              value: "Epoch",
              position: "insideBottom",
              offset: -2,
              fill: "#64748B",
              fontSize: 10,
            }}
          />
          <YAxis
            scale="log"
            domain={["auto", "auto"]}
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [v?.toFixed(4), name]}
            labelFormatter={(l) => `Epoch ${l}`}
          />
          {activeModels.map((model) => (
            <Line
              key={model}
              type="monotone"
              dataKey={model}
              stroke={colors[model]}
              strokeWidth={1.8}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ModelSummaryCard({ model, result, comp, helpers }) {
  const color = helpers.getModelColor(model);
  const bestEpoch = comp?.Epochs || 0;
  const valAcc = result?.val_accuracy || 0;
  const trainTime = comp?.["Train Time(s)"] || 0;
  const params = comp?.Parameters || 0;

  return (
    <div
      className="bg-surface border border-border rounded-xl p-5
                    hover:border-opacity-80 transition-all duration-150"
      style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
    >
      {/* Model name */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <p className="text-textprimary font-bold">{model}</p>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        {[
          {
            label: "Best Val Accuracy",
            value: helpers.formatAccuracy(valAcc),
            color: helpers.getAccuracyColor(valAcc),
          },
          {
            label: "Best Epoch",
            value: bestEpoch,
            color: "text-textprimary",
          },
          {
            label: "Training Time",
            value: helpers.formatTime(trainTime),
            color: "text-textprimary",
          },
          {
            label: "Parameters",
            value: helpers.formatParams(params),
            color: "text-textprimary",
          },
        ].map(({ label, value, color: c }) => (
          <div
            key={label}
            className="flex items-center justify-between
                          py-1.5 border-b border-border/50
                          last:border-0"
          >
            <span className="text-textsecondary text-xs">{label}</span>
            <span className={`text-xs font-mono font-medium ${c}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function ExperimentFindingsTable() {
  const experiments = [
    {
      experiment: "MLP Baseline",
      hypothesis: "Can a model with no temporal awareness classify HAR?",
      result    : "96.65% val accuracy — surprisingly strong baseline",
      finding   : "Raw statistical features carry significant discriminative information even without temporal modeling",
      status    : "expected",
    },
    {
      experiment: "MLP → CNN",
      hypothesis: "Do local temporal patterns improve over flat features?",
      result    : "+2.81% accuracy gain (96.65% → 99.46%)",
      finding   : "Local motion patterns detected by Conv1D are the most discriminative features for HAR",
      status    : "confirmed",
    },
    {
      experiment: "CNN vs LSTM",
      hypothesis: "Does long-range memory outperform local patterns?",
      result    : "LSTM needed 14.6x more params to score 0.09% lower",
      finding   : "For 2.56s windows, local patterns are more discriminative than long-range dependencies",
      status    : "rejected",
    },
    {
      experiment: "LSTM vs GRU",
      hypothesis: "Does GRU match LSTM with fewer parameters?",
      result    : "GRU: 5.5x fewer params, 6.5x faster, higher accuracy",
      finding   : "GRU's simpler gating mechanism is sufficient for 128-timestep HAR sequences",
      status    : "confirmed",
    },
    {
      experiment: "BiLSTM variant",
      hypothesis: "Does bidirectional context improve LSTM?",
      result    : "97.82% vs 98.73% — BiLSTM performed worse",
      finding   : "Sensor windows are causal — backward context adds noise not signal",
      status    : "rejected",
    },
    {
      experiment: "ConvGRU hybrid",
      hypothesis: "Does combining CNN and GRU exceed standalone models?",
      result    : "98.91% — below both CNN and GRU at 99.46%",
      finding   : "2.56s windows are short enough that hybrid adds complexity without new information",
      status    : "rejected",
    },
    {
      experiment: "GRU depth vs width",
      hypothesis: "Does a deeper narrower GRU beat a wider shallower one?",
      result    : "6-layer narrow GRU matched CNN at 99.46%",
      finding   : "Depth forces efficient compression at each layer — better regularization than width",
      status    : "confirmed",
    },
  ]

  const statusConfig = {
    confirmed: { label: "Confirmed", color: "text-green-400 bg-green-400/10 border-green-400/20" },
    rejected : { label: "Rejected",  color: "text-red-400 bg-red-400/10 border-red-400/20"      },
    expected : { label: "Expected",  color: "text-blue-400 bg-blue-400/10 border-blue-400/20"   },
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-muted uppercase tracking-wider
                           font-medium pb-3 pr-4 whitespace-nowrap w-32">
              Experiment
            </th>
            <th className="text-left text-muted uppercase tracking-wider
                           font-medium pb-3 pr-4 w-52">
              Hypothesis
            </th>
            <th className="text-left text-muted uppercase tracking-wider
                           font-medium pb-3 pr-4 w-48">
              Result
            </th>
            <th className="text-left text-muted uppercase tracking-wider
                           font-medium pb-3 pr-4">
              Finding
            </th>
            <th className="text-left text-muted uppercase tracking-wider
                           font-medium pb-3 w-24">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {experiments.map((exp, i) => {
            const sc = statusConfig[exp.status]
            return (
              <tr key={i}
                  className="border-b border-border/50
                             hover:bg-surface2/50 transition-colors">
                <td className="py-3 pr-4 align-top">
                  <span className="text-textprimary font-medium
                                   leading-relaxed">
                    {exp.experiment}
                  </span>
                </td>
                <td className="py-3 pr-4 align-top">
                  <span className="text-textsecondary leading-relaxed">
                    {exp.hypothesis}
                  </span>
                </td>
                <td className="py-3 pr-4 align-top font-mono">
                  <span className="text-textprimary leading-relaxed">
                    {exp.result}
                  </span>
                </td>
                <td className="py-3 pr-4 align-top">
                  <span className="text-textsecondary leading-relaxed">
                    {exp.finding}
                  </span>
                </td>
                <td className="py-3 align-top">
                  <span className={`px-2 py-0.5 rounded-full border
                                    font-medium whitespace-nowrap
                                    ${sc.color}`}>
                    {sc.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// !─ Main page ─────────────────────────────────────────────!

export default function ExperimentTracker() {
  const { data, helpers } = useHAR();

  const availableModels = MODEL_ORDER.filter((m) => data?.training_curves?.[m]);

  const [activeModels, setActiveModels] = useState(new Set(availableModels));

  const colors = Object.fromEntries(
    availableModels.map((m) => [m, helpers.getModelColor(m)]),
  );

  function toggleModel(model) {
    setActiveModels((prev) => {
      const next = new Set(prev);
      if (next.has(model)) {
        if (next.size > 1) next.delete(model);
      } else {
        next.add(model);
      }
      return next;
    });
  }

  // Build unified epoch-indexed chart data
  const accChartData = useMemo(() => {
    if (!data?.training_curves) return [];

    const maxEpochs = Math.max(
      ...availableModels.map(
        (m) => data.training_curves[m]?.val_acc?.length || 0,
      ),
    );

    return Array.from({ length: maxEpochs }, (_, i) => {
      const point = { epoch: i + 1 };
      availableModels.forEach((model) => {
        const curve = data.training_curves[model]?.val_acc;
        if (curve && i < curve.length) {
          point[model] = parseFloat((curve[i] * 100).toFixed(3));
        }
      });
      return point;
    });
  }, [data, availableModels]);

  const lossChartData = useMemo(() => {
    if (!data?.training_curves) return [];

    const maxEpochs = Math.max(
      ...availableModels.map(
        (m) => data.training_curves[m]?.val_loss?.length || 0,
      ),
    );

    return Array.from({ length: maxEpochs }, (_, i) => {
      const point = { epoch: i + 1 };
      availableModels.forEach((model) => {
        const curve = data.training_curves[model]?.val_loss;
        if (curve && i < curve.length) {
          point[model] = parseFloat(curve[i].toFixed(6));
        }
      });
      return point;
    });
  }, [data, availableModels]);

  if (!data) return null;

  // Convergence insight numbers
  const modelStats = availableModels.map((model) => ({
    model,
    epochs: data.model_comparison?.find((m) => m.Model === model)?.Epochs || 0,
    valAcc: data.test_results[model]?.val_accuracy || 0,
    time:
      data.model_comparison?.find((m) => m.Model === model)?.[
        "Train Time(s)"
      ] || 0,
  }));

  const fastestModel = [...modelStats]
    .filter((m) => m.model !== "MLP")
    .sort((a, b) => a.epochs - b.epochs)[0];
  const longestModel = [...modelStats].sort((a, b) => b.time - a.time)[0];
  const bestValModel = [...modelStats].sort((a, b) => b.valAcc - a.valAcc)[0];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* ── Page header ── */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-textprimary font-bold text-xl mb-2">
          Experiment Tracker
        </h2>
        <p className="text-textsecondary text-sm leading-relaxed max-w-3xl">
          Training history for all five architectures — how each model learned
          over time, how fast it converged, and how stable the training was.
          Toggle individual models on and off to compare specific pairs. Each
          experiment tested a specific hypothesis about temporal modeling for
          HAR.
        </p>
      </div>

      {/* ── Convergence cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Fastest Convergence"
          value={fastestModel?.model || "—"}
          subtitle={`Best epoch: ${fastestModel?.epochs}`}
          color={helpers.getModelColor(fastestModel?.model)}
        />
        <MetricCard
          label="Longest Training"
          value={longestModel?.model || "—"}
          subtitle={helpers.formatTime(longestModel?.time)}
          color={helpers.getModelColor(longestModel?.model)}
        />
        <MetricCard
          label="Best Val Accuracy"
          value={helpers.formatAccuracy(bestValModel?.valAcc)}
          subtitle={`${bestValModel?.model} — validation set`}
          color="#81C784"
        />
        <MetricCard
          label="Total Experiments"
          value="7"
          subtitle="architectures and variants tested"
          color="#2563EB"
        />
      </div>

      {/* ── Model toggles ── */}
      <div>
        <p
          className="text-textsecondary text-xs uppercase tracking-wider
                      font-medium mb-3"
        >
          Toggle Models
        </p>
        <div className="flex flex-wrap gap-2">
          {availableModels.map((model) => (
            <ModelToggle
              key={model}
              model={model}
              active={activeModels.has(model)}
              color={colors[model]}
              onToggle={toggleModel}
            />
          ))}
          <button
            onClick={() => setActiveModels(new Set(availableModels))}
            className="px-3 py-2 rounded-lg text-xs font-medium
                       text-muted border border-border
                       hover:text-textprimary hover:border-muted
                       transition-all duration-150 ml-2"
          >
            Show All
          </button>
          <button
            onClick={() => setActiveModels(new Set([availableModels[0]]))}
            className="px-3 py-2 rounded-lg text-xs font-medium
                       text-muted border border-border
                       hover:text-textprimary hover:border-muted
                       transition-all duration-150"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Training curves ── */}
      <div>
        <SectionHeader
          title="Training Curves"
          subtitle="Validation accuracy and loss across epochs — toggle models above"
        />
        <div className="grid grid-cols-2 gap-4">
          <ValidationAccuracyChart
            chartData={accChartData}
            activeModels={[...activeModels]}
            colors={colors}
          />
          <ValidationLossChart
            chartData={lossChartData}
            activeModels={[...activeModels]}
            colors={colors}
          />
        </div>

        {/* Reading guide */}
        <div
          className="mt-4 bg-surface border border-border
                        rounded-xl p-4 grid grid-cols-3 gap-4"
        >
          {[
            {
              title: "Steep early rise",
              body: "Model learns quickly in early epochs — good architecture fit for the problem",
              color: "#81C784",
            },
            {
              title: "Plateau with spikes",
              body: "Typical of LSTM — loss spikes early before gates stabilise, then smooth convergence",
              color: "#E57373",
            },
            {
              title: "Short curve = early stop",
              body: "Models with fewer epochs were stopped by EarlyStopping — they converged before the limit",
              color: "#64B5F6",
            },
          ].map(({ title, body, color }) => (
            <div key={title} className="flex gap-3">
              <div
                className="w-1 rounded-full flex-shrink-0 self-stretch"
                style={{ backgroundColor: color }}
              />
              <div>
                <p className="text-textprimary text-xs font-medium mb-1">
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

      {/* ── Per-model summary cards ── */}
      <div>
        <SectionHeader
          title="Per-Model Training Summary"
          subtitle="Key numbers from each model's training run"
        />
        <div className="grid grid-cols-5 gap-3">
          {availableModels.map((model) => (
            <ModelSummaryCard
              key={model}
              model={model}
              result={data.test_results[model]}
              comp={data.model_comparison?.find((m) => m.Model === model)}
              helpers={helpers}
            />
          ))}
        </div>
      </div>

      {/* ── Experiment findings ── */}
      <div>
        <SectionHeader
          title="Experiment Findings"
          subtitle="What each experiment tested and what it found"
        />
        <div className="bg-surface border border-border rounded-xl p-6">
          <ExperimentFindingsTable />
        </div>
      </div>
    </div>
  );
}
