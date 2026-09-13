import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useHAR } from "../context/HARContext";
import ActivityBadge from "../components/ActivityBadge";
import MetricCard from "../components/MetricCard";
import {
  DATASET_INFO,
  CLASS_DISTRIBUTION,
  ACTIVITY_COLORS,
  ACTIVITY_DESCRIPTIONS,
  CHANNEL_NAMES,
} from "../constants";

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

function ClassDistributionBar() {
  const data = Object.entries(CLASS_DISTRIBUTION).map(([name, count]) => ({
    name,
    short:
      name === "Walking"
        ? "Walking"
        : name === "Walking Upstairs"
          ? "W. Upstairs"
          : name === "Walking Downstairs"
            ? "W. Downstairs"
            : name,
    count,
    color: ACTIVITY_COLORS[name] || "#94A3B8",
  }));

  const total = Object.values(CLASS_DISTRIBUTION).reduce((a, b) => a + b, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fill: "#64748B", fontSize: 10 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            domain={[0, 1600]}
          />
          <YAxis
            type="category"
            dataKey="short"
            tick={{ fill: "#94A3B8", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={95}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#243044",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#F1F5F9",
              fontSize: "12px",
            }}
            formatter={(value, name, props) => [
              `${value.toLocaleString()} samples
               (${((value / total) * 100).toFixed(1)}%)`,
              props.payload.name,
            ]}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Count labels */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {Object.entries(CLASS_DISTRIBUTION).map(([name, count]) => (
          <div
            key={name}
            className="flex items-center justify-between
                          bg-navy rounded-lg px-3 py-1.5"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ACTIVITY_COLORS[name] }}
              />
              <span className="text-textsecondary text-xs truncate">
                {name.split(" ")[0]}
                {name.includes(" ") ? "..." : ""}
              </span>
            </div>
            <span className="text-textprimary text-xs font-mono font-bold">
              {count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubjectSplitCard() {
  const trainPct = (
    (DATASET_INFO.trainSubjects / DATASET_INFO.nSubjects) *
    100
  ).toFixed(0);
  const testPct = (
    (DATASET_INFO.testSubjects / DATASET_INFO.nSubjects) *
    100
  ).toFixed(0);

  const pieData = [
    { name: "Train", value: DATASET_INFO.trainSubjects, color: "#2563EB" },
    { name: "Test", value: DATASET_INFO.testSubjects, color: "#FF8A65" },
  ];

  return (
    <div className="space-y-5">
      {/* Pie chart */}
      <div className="flex items-center gap-4">
        <PieChart width={120} height={120}>
          <Pie
            data={pieData}
            cx={55}
            cy={55}
            innerRadius={35}
            outerRadius={55}
            dataKey="value"
            strokeWidth={0}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="space-y-3">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <div>
                <p className="text-textprimary font-bold text-lg leading-none">
                  {entry.value}
                </p>
                <p className="text-textsecondary text-xs">
                  {entry.name} subjects (
                  {entry.name === "Train" ? trainPct : testPct}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-3">
        {[
          {
            label: "Total Subjects",
            value: DATASET_INFO.nSubjects,
            color: "text-textprimary",
          },
          {
            label: "Overlap",
            value: "None",
            color: "text-green-400",
          },
          {
            label: "Evaluation Type",
            value: "Subject-independent",
            color: "text-accent",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="flex items-center justify-between
                          py-2 border-b border-border last:border-0"
          >
            <span className="text-textsecondary text-sm">{label}</span>
            <span className={`text-sm font-medium ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Key insight */}
      <div
        className="bg-accent/5 border border-accent/20
                      rounded-xl p-4"
      >
        <p className="text-accent text-xs font-medium mb-1">Why this matters</p>
        <p className="text-textsecondary text-xs leading-relaxed">
          No subject appears in both train and test sets. The model is evaluated
          on completely new people — making test accuracy an honest measure of
          real-world generalization.
        </p>
      </div>
    </div>
  );
}

function SignalCharacteristicsTable() {
  const activities = [
    {
      name: "Walking",
      pattern: "Periodic",
      description:
        "Clear rhythmic oscillations repeating every ~0.5s. Strongest signal amplitude of all activities.",
      difficulty: "Easy",
      diffColor: "text-green-400",
    },
    {
      name: "Walking Upstairs",
      pattern: "Periodic",
      description:
        "Similar to walking but with higher amplitude — pushing against gravity increases sensor readings.",
      difficulty: "Medium",
      diffColor: "text-yellow-400",
    },
    {
      name: "Walking Downstairs",
      pattern: "Periodic",
      description:
        "Periodic like walking but with distinct deceleration pattern. Most often confused with Walking Upstairs.",
      difficulty: "Medium",
      diffColor: "text-yellow-400",
    },
    {
      name: "Sitting",
      pattern: "Near-flat",
      description:
        "Nearly flat signal with very low variance. Most often confused with Standing due to similar posture.",
      difficulty: "Hard",
      diffColor: "text-red-400",
    },
    {
      name: "Standing",
      pattern: "Near-flat",
      description:
        "Nearly flat signal, marginally more variable than Sitting due to micro-movements from balance.",
      difficulty: "Hard",
      diffColor: "text-red-400",
    },
    {
      name: "Laying",
      pattern: "Flat",
      description:
        "Flattest signal of all activities. Unique horizontal orientation makes it easiest to classify.",
      difficulty: "Easy",
      diffColor: "text-green-400",
    },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div
        className="grid grid-cols-12 gap-4 px-4 pb-2
                      border-b border-border"
      >
        {["Activity", "Pattern", "Description", "Difficulty"].map((h) => (
          <p
            key={h}
            className={`text-muted text-xs uppercase tracking-wider
                         font-medium
                         ${
                           h === "Activity"
                             ? "col-span-2"
                             : h === "Description"
                               ? "col-span-6"
                               : "col-span-2"
                         }`}
          >
            {h}
          </p>
        ))}
      </div>

      {/* Rows */}
      {activities.map((act) => (
        <div
          key={act.name}
          className="grid grid-cols-12 gap-4 px-4 py-3
                        bg-navy rounded-xl border border-border
                        hover:border-muted transition-colors"
        >
          <div className="col-span-2 flex items-center min-w-0">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium border flex-shrink-0"
              style={{
                backgroundColor: `${ACTIVITY_COLORS[act.name]}25`,
                borderColor: `${ACTIVITY_COLORS[act.name]}60`,
                color: ACTIVITY_COLORS[act.name],
              }}
            >
              {act.name}
            </span>
          </div>
          <div className="col-span-2 flex items-center">
            <span className="text-textsecondary text-xs font-mono">
              {act.pattern}
            </span>
          </div>
          <div className="col-span-6 flex items-center">
            <p className="text-textsecondary text-xs leading-relaxed">
              {act.description}
            </p>
          </div>
          <div className="col-span-2 flex items-center">
            <span className={`text-xs font-medium ${act.diffColor}`}>
              {act.difficulty}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChannelGrid() {
  const groups = [
    {
      name: "Body Accelerometer",
      color: "#64B5F6",
      desc: "Linear acceleration with gravity removed",
      channels: ["Body Acc X", "Body Acc Y", "Body Acc Z"],
    },
    {
      name: "Gyroscope",
      color: "#E57373",
      desc: "Angular velocity — rotational motion",
      channels: ["Body Gyro X", "Body Gyro Y", "Body Gyro Z"],
    },
    {
      name: "Total Accelerometer",
      color: "#81C784",
      desc: "Linear acceleration including gravity",
      channels: ["Total Acc X", "Total Acc Y", "Total Acc Z"],
    },
  ];

  const axes = {
    X: "Left-right motion",
    Y: "Forward-backward motion",
    Z: "Up-down motion",
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {groups.map((group) => (
        <div
          key={group.name}
          className="bg-navy border border-border rounded-xl p-5"
        >
          {/* Group header */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: group.color }}
            />
            <div>
              <p className="text-textprimary font-medium text-sm">
                {group.name}
              </p>
              <p className="text-textsecondary text-xs">{group.desc}</p>
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            {["X", "Y", "Z"].map((axis) => (
              <div
                key={axis}
                className="flex items-center justify-between
                              bg-surface rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: group.color }}
                  >
                    {axis}
                  </span>
                  <span className="text-textsecondary text-xs">
                    {group.name.split(" ")[0]} {axis}
                  </span>
                </div>
                <span className="text-muted text-xs">{axes[axis]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EDAObservations() {
  const observations = [
    {
      number: "01",
      title: "Class Balance",
      body: "Walking Downstairs has the fewest samples (986) and Laying the most (1407). The gap of 421 samples is only 5.7% of total training data — classes are roughly balanced. Weighted loss was not required.",
      color: "#81C784",
    },
    {
      number: "02",
      title: "Signal Patterns",
      body: "Dynamic activities (walking variants) produce clear periodic oscillations. Static activities (sitting, standing, laying) produce near-flat signals. This visual separation is what makes classification possible.",
      color: "#64B5F6",
    },
    {
      number: "03",
      title: "Channel Correlation",
      body: "Total Accelerometer and Body Accelerometer channels look similar — they carry related information. Gyroscope channels carry distinctly different rotational information that complements the accelerometer.",
      color: "#FF8A65",
    },
    {
      number: "04",
      title: "Normalization Required",
      body: "Raw channel means were not zero and standard deviations were not one. Channels were not on a common scale. StandardScaler normalization was applied using training statistics only — no data leakage.",
      color: "#BA68C8",
    },
  ];

  return (
    <div className="space-y-3">
      {observations.map((obs) => (
        <div
          key={obs.number}
          className="flex gap-4 p-4 bg-navy border border-border
                        rounded-xl hover:border-muted
                        transition-colors duration-150"
        >
          <span
            className="text-2xl font-bold flex-shrink-0 leading-none
                           mt-0.5 font-mono"
            style={{ color: obs.color }}
          >
            {obs.number}
          </span>
          <div>
            <p className="text-textprimary font-medium text-sm mb-1">
              {obs.title}
            </p>
            <p className="text-textsecondary text-xs leading-relaxed">
              {obs.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreprocessingSteps() {
  const steps = [
    {
      step: "01",
      title: "Download & Load",
      body: "UCI HAR dataset downloaded from the ML Repository. Raw signal files loaded into NumPy arrays. Shapes verified: X_train (7352, 128, 9), X_test (2947, 128, 9).",
      color: "#2563EB",
    },
    {
      step: "02",
      title: "Normalize",
      body: "StandardScaler fitted on training data only — reshaped to (941056, 9) for fitting. Same fitted scaler applied to validation and test. Scaler saved to artifacts/scalers/.",
      color: "#81C784",
    },
    {
      step: "03",
      title: "Validation Split",
      body: "15% of training data carved as validation using stratified split (random_state=42). Class proportions preserved. Final sizes: 6249 train / 1103 val / 2947 test.",
      color: "#FF8A65",
    },
    {
      step: "04",
      title: "Verify",
      body: "Training channel means confirmed ≈ 0.0, stds ≈ 1.0. Zero overlap between subjects in train and test confirmed. All .npy files saved to data/processed/.",
      color: "#BA68C8",
    },
  ];

  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={s.step} className="flex gap-4">
          {/* Step connector */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center
                            justify-center text-xs font-bold text-white"
              style={{ backgroundColor: s.color }}
            >
              {s.step}
            </div>
            {i < steps.length - 1 && (
              <div className="w-0.5 flex-1 bg-border mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4">
            <p className="text-textprimary font-medium text-sm mb-1">
              {s.title}
            </p>
            <p className="text-textsecondary text-xs leading-relaxed">
              {s.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function DataExploration() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* ── Page header ── */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-textprimary font-bold text-xl mb-2">
          Data Exploration
        </h2>
        <p className="text-textsecondary text-sm leading-relaxed max-w-3xl">
          Exploratory analysis of the UCI HAR dataset before any modeling.
          Understanding the data distribution, signal characteristics, and
          sensor channels is essential for making informed architecture
          decisions. All findings here directly motivated the model design
          choices.
        </p>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total Samples"
          value="10,299"
          subtitle="7,352 train · 2,947 test"
          color="#2563EB"
        />
        <MetricCard
          label="Window Size"
          value="2.56s"
          subtitle="128 timesteps @ 50 Hz"
          color="#81C784"
        />
        <MetricCard
          label="Sensor Channels"
          value="9"
          subtitle="3 accel · 3 gyro · 3 total"
          color="#FF8A65"
        />
        <MetricCard
          label="Subjects"
          value="30"
          subtitle="21 train · 9 test · no overlap"
          color="#BA68C8"
        />
      </div>

      {/* ── Class distribution + Subject split ── */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <SectionHeader
            title="Class Distribution"
            subtitle="Sample counts per activity — training set"
          />
          <ClassDistributionBar />
        </div>
        <div className="bg-surface border border-border rounded-xl p-6">
          <SectionHeader
            title="Subject Split"
            subtitle="How 30 subjects are divided across train and test"
          />
          <SubjectSplitCard />
        </div>
      </div>

      {/* ── Signal characteristics ── */}
      <div>
        <SectionHeader
          title="Signal Characteristics"
          subtitle="What each activity looks like in raw sensor data"
        />
        <div className="bg-surface border border-border rounded-xl p-6">
          <SignalCharacteristicsTable />
        </div>
      </div>

      {/* ── Sensor channels ── */}
      <div>
        <SectionHeader
          title="Sensor Channels"
          subtitle="All 9 input channels — what each one measures"
        />
        <ChannelGrid />
      </div>

      {/* ── EDA observations + Preprocessing ── */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <SectionHeader
            title="EDA Observations"
            subtitle="Key insights before modeling"
          />
          <EDAObservations />
        </div>
        <div>
          <SectionHeader
            title="Preprocessing Pipeline"
            subtitle="Steps taken to prepare data for training"
          />
          <PreprocessingSteps />
        </div>
      </div>
    </div>
  );
}
