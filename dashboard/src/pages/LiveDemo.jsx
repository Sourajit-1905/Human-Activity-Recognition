import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
  CartesianGrid,
} from "recharts";
import { useHAR } from "../context/HARContext";
import ActivityBadge from "../components/ActivityBadge";
import { ACTIVITY_NAMES, ACTIVITY_COLORS } from "../constants";

// Signal generator : Generates a mathematically simulated sensor signal matching the characteristics of each activity type

function generateSignal(activity, sampleId) {
  const seed = sampleId * 137;
  const points = 128;

  function noise(i, scale = 0.02) {
    return (
      Math.sin(i * seed * 0.3) * scale + Math.cos(i * seed * 0.7) * scale * 0.5
    );
  }

  return Array.from({ length: points }, (_, i) => {
    let accX, accY, accZ;

    if (activity === "Walking") {
      const freq = 0.25;
      accX = 0.6 * Math.sin(2 * Math.PI * freq * i) + noise(i, 0.08);
      accY = 0.3 * Math.cos(2 * Math.PI * freq * i) + noise(i, 0.05);
      accZ = -0.8 * Math.sin(2 * Math.PI * freq * i + 0.5) + noise(i, 0.06);
    } else if (activity === "Walking Upstairs") {
      const freq = 0.22;
      accX = 0.8 * Math.sin(2 * Math.PI * freq * i) + noise(i, 0.09);
      accY = 0.45 * Math.cos(2 * Math.PI * freq * i) + noise(i, 0.06);
      accZ = -1.0 * Math.sin(2 * Math.PI * freq * i + 0.4) + noise(i, 0.07);
    } else if (activity === "Walking Downstairs") {
      const freq = 0.28;
      accX = 0.55 * Math.sin(2 * Math.PI * freq * i) + noise(i, 0.1);
      accY = 0.35 * Math.cos(2 * Math.PI * freq * i) + noise(i, 0.07);
      accZ = -0.75 * Math.sin(2 * Math.PI * freq * i + 0.6) + noise(i, 0.08);
    } else if (activity === "Sitting") {
      accX = 0.02 + noise(i, 0.015);
      accY = -0.01 + noise(i, 0.012);
      accZ = 0.98 + noise(i, 0.01);
    } else if (activity === "Standing") {
      accX = 0.01 + noise(i, 0.02);
      accY = -0.02 + noise(i, 0.018);
      accZ = 0.99 + noise(i, 0.015);
    } else {
      // Laying
      accX = 0.99 + noise(i, 0.008);
      accY = 0.02 + noise(i, 0.006);
      accZ = 0.05 + noise(i, 0.007);
    }

    return {
      t: i,
      accX: parseFloat(accX.toFixed(4)),
      accY: parseFloat(accY.toFixed(4)),
      accZ: parseFloat(accZ.toFixed(4)),
    };
  });
}

// Confidence generator : Generates realistic probability distributions matching the stored demo sample data

function generateConfidence(sample) {
  const trueIdx = ACTIVITY_NAMES.indexOf(sample.trueActivity);
  const predIdx = ACTIVITY_NAMES.indexOf(sample.predicted);
  const conf = sample.confidence;

  // Base — very low probability for all
  const probs = ACTIVITY_NAMES.map(() => Math.random() * 0.02);

  // Assign confidence to predicted class
  probs[predIdx] = conf;

  // If wrong prediction, give some to true class
  if (!sample.correct && trueIdx !== predIdx) {
    probs[trueIdx] = parseFloat((1 - conf - 0.03).toFixed(3));
  }

  // Normalize remaining
  const usedProb = probs[predIdx] + (sample.correct ? 0 : probs[trueIdx]);
  const remaining = 1 - usedProb;
  let otherSum = 0;
  probs.forEach((p, i) => {
    if (i !== predIdx && i !== trueIdx) otherSum += p;
  });
  probs.forEach((p, i) => {
    if (i !== predIdx && i !== trueIdx && otherSum > 0) {
      probs[i] = parseFloat(((p / otherSum) * remaining).toFixed(4));
    }
  });

  return ACTIVITY_NAMES.map((name, i) => ({
    activity: name,
    probability: parseFloat((probs[i] * 100).toFixed(2)),
    color: ACTIVITY_COLORS[name] || "#94A3B8",
    isPredicted: i === predIdx,
    isTrue: i === trueIdx,
  })).sort((a, b) => b.probability - a.probability);
}

// ── Model insight generator ───────────────────────────────

function getModelInsight(sample) {
  const { trueActivity, predicted, correct, confidence } = sample;

  if (correct) {
    if (trueActivity === "Laying") {
      return `The model identified Laying with ${(confidence * 100).toFixed(1)}% confidence. The horizontal orientation of the phone produces a unique accelerometer signature — nearly all signal energy is on the X-axis with Y and Z near zero. No other activity produces this pattern, making Laying the easiest class to classify.`;
    }
    if (trueActivity === "Walking" || trueActivity.includes("Walking")) {
      return `The model detected the periodic oscillation pattern characteristic of ${trueActivity}. The rhythmic peaks in body accelerometer X occur approximately every 4-6 timesteps, matching a typical step cadence. The GRU's sequential memory tracked this rhythm across all 128 timesteps to make a confident prediction.`;
    }
    if (trueActivity === "Sitting" || trueActivity === "Standing") {
      return `The model correctly identified ${trueActivity} with ${(confidence * 100).toFixed(1)}% confidence. Static activities produce near-flat signals — the model distinguished the subtle baseline differences between the two postures. This is the hardest classification boundary in the dataset.`;
    }
    return `Correct prediction with ${(confidence * 100).toFixed(1)}% confidence. The model found clear discriminative features in the sensor signal for ${trueActivity}.`;
  }

  // Wrong predictions
  if (trueActivity === "Sitting" && predicted === "Standing") {
    return `This is the most common error in the dataset — 61 such cases on the test set. Both Sitting and Standing produce nearly flat accelerometer signals with very similar baselines. The GRU assigned ${(confidence * 100).toFixed(1)}% confidence to Standing. This confusion is physically explainable: the difference between sitting and standing posture is a subtle torso angle change that 2.56 seconds of wrist sensor data cannot reliably distinguish.`;
  }
  if (trueActivity === "Standing" && predicted === "Sitting") {
    return `The model confused Standing for Sitting — one of the 29 such errors on the test set. Both activities produce near-flat signals. The GRU detected a slightly lower baseline variance and predicted Sitting. A longer window or additional barometric pressure data would likely resolve this confusion.`;
  }
  if (trueActivity.includes("Walking") && predicted.includes("Walking")) {
    return `The model confused ${trueActivity} with ${predicted}. Both activities produce rhythmic periodic oscillations — the difference lies in the amplitude and deceleration pattern. This sample's signal characteristics were closer to ${predicted}, leading to the misclassification. This accounts for 20% of all test errors.`;
  }
  return `The model predicted ${predicted} instead of ${trueActivity} with ${(confidence * 100).toFixed(1)}% confidence. The signal characteristics of this sample overlapped with the predicted class more than the true class.`;
}

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

function SampleCard({ sample, isSelected, onClick }) {
  const color = ACTIVITY_COLORS[sample.trueActivity] || "#94A3B8";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl border
                  transition-all duration-150
                  ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-navy hover:border-muted"
                  }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted text-xs font-mono">Sample {sample.id}</span>
        <span
          className={`text-xs font-medium
                          ${
                            sample.correct ? "text-green-400" : "text-red-400"
                          }`}
        >
          {sample.correct ? "✓" : "✗"}
        </span>
      </div>

      {/* Activity badge */}
      <span
        className="text-xs px-2 py-1 rounded-lg font-medium border
             leading-tight inline-block"
        style={{
          backgroundColor: `${color}20`,
          borderColor: `${color}50`,
          color: color,
        }}
      >
        {sample.trueActivity}
      </span>

      {/* Confidence */}
      <div className="mt-2">
        <div className="h-1 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${sample.confidence * 100}%`,
              backgroundColor: sample.correct ? "#81C784" : "#E57373",
            }}
          />
        </div>
        <p className="text-muted text-xs mt-1">
          {(sample.confidence * 100).toFixed(1)}% confidence
        </p>
      </div>
    </button>
  );
}

function PredictionResult({ sample }) {
  const predColor = ACTIVITY_COLORS[sample.predicted] || "#94A3B8";
  const trueColor = ACTIVITY_COLORS[sample.trueActivity] || "#94A3B8";

  return (
    <div
      className="bg-surface border border-border rounded-xl p-6
                    h-full flex flex-col"
    >
      <p
        className="text-textsecondary text-xs uppercase tracking-wider
                    font-medium mb-5"
      >
        Prediction Result
      </p>

      {/* Correct / Wrong banner */}
      <div
        className={`rounded-xl p-4 mb-5 flex items-center gap-3
                       ${
                         sample.correct
                           ? "bg-green-400/10 border border-green-400/20"
                           : "bg-red-400/10 border border-red-400/20"
                       }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center
                         justify-center text-xl flex-shrink-0
                         ${
                           sample.correct ? "bg-green-400/20" : "bg-red-400/20"
                         }`}
        >
          {sample.correct ? "✓" : "✗"}
        </div>
        <div>
          <p
            className={`font-bold text-sm
                         ${sample.correct ? "text-green-400" : "text-red-400"}`}
          >
            {sample.correct ? "Correct Prediction" : "Wrong Prediction"}
          </p>
          <p className="text-textsecondary text-xs">
            {(sample.confidence * 100).toFixed(1)}% model confidence
          </p>
        </div>
      </div>

      {/* Predicted class */}
      <div className="mb-4">
        <p className="text-muted text-xs mb-2">Predicted Activity</p>
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: predColor }}
          />
          <p className="text-textprimary font-bold text-lg">
            {sample.predicted}
          </p>
        </div>
      </div>

      {/* True class (if different) */}
      {!sample.correct && (
        <div className="mb-4 p-3 bg-navy rounded-xl border border-border">
          <p className="text-muted text-xs mb-2">True Activity</p>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: trueColor }}
            />
            <p className="text-textprimary font-medium">
              {sample.trueActivity}
            </p>
          </div>
        </div>
      )}

      {/* Confidence bar */}
      <div className="mb-5">
        <div className="flex justify-between mb-1">
          <p className="text-muted text-xs">Confidence</p>
          <p className="text-textprimary text-xs font-mono font-bold">
            {(sample.confidence * 100).toFixed(1)}%
          </p>
        </div>
        <div className="h-2 bg-navy rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${sample.confidence * 100}%`,
              backgroundColor: sample.correct ? "#81C784" : "#E57373",
            }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-muted text-xs mb-1">Sample Description</p>
        <p className="text-textsecondary text-xs leading-relaxed">
          {sample.description}
        </p>
      </div>
    </div>
  );
}

function SignalChart({ signalData }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={signalData}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          tick={{ fill: "#64748B", fontSize: 9 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
          label={{
            value: "Timestep (0–127)",
            position: "insideBottom",
            offset: -2,
            fill: "#64748B",
            fontSize: 9,
          }}
        />
        <YAxis
          tick={{ fill: "#64748B", fontSize: 9 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
          domain={[-1.5, 1.5]}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v, name) => [v.toFixed(4), name]}
          labelFormatter={(l) => `Timestep ${l}`}
        />
        <Line
          type="monotone"
          dataKey="accX"
          stroke="#64B5F6"
          strokeWidth={1.5}
          dot={false}
          name="Body Acc X"
        />
        <Line
          type="monotone"
          dataKey="accY"
          stroke="#81C784"
          strokeWidth={1.5}
          dot={false}
          name="Body Acc Y"
        />
        <Line
          type="monotone"
          dataKey="accZ"
          stroke="#FF8A65"
          strokeWidth={1.5}
          dot={false}
          name="Body Acc Z"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ConfidenceChart({ confidenceData }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={confidenceData}
        layout="vertical"
        margin={{ top: 0, right: 70, left: 10, bottom: 0 }}
      >
        <XAxis
          type="number"
          domain={[0, 100]}
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
          width={110}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => [`${v}%`, "Probability"]}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="probability" radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="probability"
            position="right"
            formatter={(v) => `${v}%`}
            style={{ fill: "#94A3B8", fontSize: 11 }}
          />
          {confidenceData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.color}
              opacity={entry.isPredicted ? 1 : 0.35}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function LiveDemo() {
  const { chartData, helpers } = useHAR();
  const samples = chartData.demoSamples || [];

  const [selectedId, setSelectedId] = useState(1);

  const selectedSample = samples.find((s) => s.id === selectedId) || samples[0];

  const signalData = useMemo(
    () =>
      selectedSample
        ? generateSignal(selectedSample.trueActivity, selectedSample.id)
        : [],
    [selectedSample?.id, selectedSample?.trueActivity],
  );

  const confidenceData = useMemo(
    () => (selectedSample ? generateConfidence(selectedSample) : []),
    [selectedSample?.id],
  );

  const insight = useMemo(
    () => (selectedSample ? getModelInsight(selectedSample) : ""),
    [selectedSample?.id],
  );

  if (!samples.length) return null;

  const correctCount = samples.filter((s) => s.correct).length;
  const wrongCount = samples.length - correctCount;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* ── Page header ── */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-textprimary font-bold text-xl">Live Demo</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium
                               bg-yellow-400/10 text-yellow-400
                               border border-yellow-400/20"
              >
                Simulated
              </span>
            </div>
            <p className="text-textsecondary text-sm leading-relaxed max-w-3xl">
              Explore how the GRU model classifies sensor windows. Select a
              pre-loaded sample below to see the raw signal, the model's
              prediction, and a breakdown of its confidence across all six
              activity classes. Signals are mathematically generated to match
              real activity characteristics.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 flex-shrink-0 ml-6">
            <div
              className="text-center bg-navy border border-border
                            rounded-xl px-4 py-3"
            >
              <p className="text-green-400 font-bold text-xl">{correctCount}</p>
              <p className="text-muted text-xs">Correct</p>
            </div>
            <div
              className="text-center bg-navy border border-border
                            rounded-xl px-4 py-3"
            >
              <p className="text-red-400 font-bold text-xl">{wrongCount}</p>
              <p className="text-muted text-xs">Wrong</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            step: "01",
            title: "Select a sample",
            body: "Choose from 10 pre-loaded sensor windows — a mix of correct predictions and real model errors from the test set.",
            color: "#2563EB",
          },
          {
            step: "02",
            title: "View the signal",
            body: "See the simulated raw accelerometer signal — 128 timesteps of body accelerometer X, Y, Z channels at 50 Hz.",
            color: "#81C784",
          },
          {
            step: "03",
            title: "Inspect the prediction",
            body: "See the GRU model's prediction, confidence score, and full probability distribution across all 6 activity classes.",
            color: "#FF8A65",
          },
        ].map(({ step, title, body, color }) => (
          <div
            key={step}
            className="bg-surface border border-border rounded-xl p-5
                          flex gap-4"
          >
            <span
              className="text-2xl font-bold font-mono flex-shrink-0"
              style={{ color }}
            >
              {step}
            </span>
            <div>
              <p className="text-textprimary font-medium text-sm mb-1">
                {title}
              </p>
              <p className="text-textsecondary text-xs leading-relaxed">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sample selector + prediction ── */}
      <div>
        <SectionHeader
          title="Select a Sample"
          subtitle="Click any sample to load its signal and prediction"
        />
        <div className="grid grid-cols-3 gap-6">
          {/* Sample grid */}
          <div className="col-span-2">
            <div className="grid grid-cols-5 gap-3">
              {samples.map((sample) => (
                <SampleCard
                  key={sample.id}
                  sample={sample}
                  isSelected={selectedId === sample.id}
                  onClick={() => setSelectedId(sample.id)}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="text-green-400 text-sm">✓</span>
                <span className="text-textsecondary text-xs">
                  Correct prediction
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-red-400 text-sm">✗</span>
                <span className="text-textsecondary text-xs">
                  Wrong prediction
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-1 bg-green-400 rounded" />
                <span className="text-textsecondary text-xs">
                  Confidence bar
                </span>
              </div>
            </div>
          </div>

          {/* Prediction result */}
          <div>
            {selectedSample && <PredictionResult sample={selectedSample} />}
          </div>
        </div>
      </div>

      {/* ── Signal visualization ── */}
      <div>
        <SectionHeader
          title="Raw Sensor Signal"
          subtitle={`Simulated accelerometer signal — ${selectedSample?.trueActivity} (128 timesteps @ 50 Hz)`}
        />
        <div className="bg-surface border border-border rounded-xl p-6">
          {/* Channel legend */}
          <div className="flex items-center gap-5 mb-4">
            {[
              { label: "Body Acc X", color: "#64B5F6" },
              { label: "Body Acc Y", color: "#81C784" },
              { label: "Body Acc Z", color: "#FF8A65" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-6 h-0.5 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-textsecondary text-xs">{label}</span>
              </div>
            ))}
          </div>

          <SignalChart signalData={signalData} />

          {/* Signal description */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              {
                label: "Activity Type",
                value: selectedSample?.trueActivity.includes("Walking")
                  ? "Dynamic — periodic"
                  : selectedSample?.trueActivity === "Laying"
                    ? "Static — horizontal"
                    : "Static — near-flat",
                color: "#64B5F6",
              },
              {
                label: "Window Duration",
                value: "2.56 seconds",
                color: "#81C784",
              },
              {
                label: "Sampling Rate",
                value: "50 Hz — 128 readings",
                color: "#FF8A65",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-navy rounded-xl px-4 py-3">
                <p className="text-muted text-xs mb-1">{label}</p>
                <p className="text-xs font-medium" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Confidence breakdown ── */}
      <div>
        <SectionHeader
          title="Confidence Breakdown"
          subtitle="Model's probability distribution across all 6 activity classes"
        />
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <p
              className="text-textsecondary text-xs uppercase tracking-wider
                          font-medium mb-4"
            >
              Probability per class — {selectedSample?.predicted} predicted
            </p>
            <ConfidenceChart confidenceData={confidenceData} />
            <p className="text-muted text-xs mt-3">
              Highlighted bar = predicted class. A well-calibrated model
              concentrates probability on one class.
            </p>
          </div>

          {/* Model insight */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <p
              className="text-textsecondary text-xs uppercase tracking-wider
                          font-medium mb-4"
            >
              Model Insight
            </p>

            {/* Prediction summary */}
            <div
              className={`rounded-xl p-4 mb-4 border
                             ${
                               selectedSample?.correct
                                 ? "bg-green-400/5 border-green-400/20"
                                 : "bg-red-400/5 border-red-400/20"
                             }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-medium
                                  ${
                                    selectedSample?.correct
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                >
                  {selectedSample?.correct
                    ? "Correct classification"
                    : "Misclassification"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!selectedSample?.correct && (
                  <>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full
                                 font-medium border"
                      style={{
                        backgroundColor: `${ACTIVITY_COLORS[selectedSample?.trueActivity]}20`,
                        borderColor: `${ACTIVITY_COLORS[selectedSample?.trueActivity]}50`,
                        color: ACTIVITY_COLORS[selectedSample?.trueActivity],
                      }}
                    >
                      {selectedSample?.trueActivity}
                    </span>
                    <span className="text-muted text-xs">predicted as</span>
                  </>
                )}
                <span
                  className="text-xs px-2 py-0.5 rounded-full
                             font-medium border"
                  style={{
                    backgroundColor: `${ACTIVITY_COLORS[selectedSample?.predicted]}20`,
                    borderColor: `${ACTIVITY_COLORS[selectedSample?.predicted]}50`,
                    color: ACTIVITY_COLORS[selectedSample?.predicted],
                  }}
                >
                  {selectedSample?.predicted}
                </span>
              </div>
            </div>

            {/* Insight text */}
            <p className="text-textsecondary text-sm leading-relaxed">
              {insight}
            </p>

            {/* Key metrics */}
            <div
              className="mt-5 pt-4 border-t border-border
                            grid grid-cols-2 gap-3"
            >
              {[
                {
                  label: "Model",
                  value: "GRU — 6 layers",
                  color: "#FF8A65",
                },
                {
                  label: "Test Accuracy",
                  value: "95.76%",
                  color: "#81C784",
                },
                {
                  label: "Parameters",
                  value: "340K",
                  color: "#64B5F6",
                },
                {
                  label: "Window Size",
                  value: "128 timesteps",
                  color: "#BA68C8",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-navy rounded-lg px-3 py-2">
                  <p className="text-muted text-xs mb-0.5">{label}</p>
                  <p
                    className="text-xs font-mono font-medium"
                    style={{ color }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
