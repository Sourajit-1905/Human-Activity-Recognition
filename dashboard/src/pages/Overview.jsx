import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { useHAR }       from '../context/HARContext'
import MetricCard       from '../components/MetricCard'
import ActivityBadge    from '../components/ActivityBadge'
import {
  KEY_INSIGHTS,
  DATASET_INFO,
  CLASS_DISTRIBUTION,
  ACTIVITY_COLORS,
} from '../constants'

// ── Sub-components ────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-textprimary font-bold text-lg">{title}</h2>
      {subtitle && (
        <p className="text-textsecondary text-sm mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}

function ImpactBadge({ impact }) {
  const styles = {
    high  : "bg-red-400/10 text-red-400 border-red-400/20",
    medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    low   : "bg-green-400/10 text-green-400 border-green-400/20",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                      flex-shrink-0 ${styles[impact] || styles.low}`}>
      {impact}
    </span>
  )
}

function FindingCard({ finding }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-navy rounded-xl
                    border border-border hover:border-muted
                    transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-textprimary font-medium text-sm">
            {finding.title}
          </p>
          <ImpactBadge impact={finding.impact} />
        </div>
        <p className="text-textsecondary text-xs leading-relaxed">
          {finding.description}
        </p>
      </div>
    </div>
  )
}

function DatasetStatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2
                    border-b border-border last:border-0">
      <span className="text-textsecondary text-sm">{label}</span>
      <span className="text-textprimary text-sm font-medium font-mono">
        {value}
      </span>
    </div>
  )
}

function ClassDistributionChart() {
  const data = Object.entries(CLASS_DISTRIBUTION).map(([name, count]) => ({
    name,
    short: name === "Walking"             ? "Walking"
         : name === "Walking Upstairs"    ? "W. Upstairs"
         : name === "Walking Downstairs"  ? "W. Downstairs"
         : name === "Sitting"             ? "Sitting"
         : name === "Standing"            ? "Standing"
         : "Laying",
    count,
    color: ACTIVITY_COLORS[name] || "#94A3B8",
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
        <XAxis
          type="number"
          tick={{ fill: '#64748B', fontSize: 10 }}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
          domain={[0, 1600]}
        />
        <YAxis
          type="category"
          dataKey="short"
          tick={{ fill: '#94A3B8', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#243044',
            border         : '1px solid #334155',
            borderRadius   : '8px',
            color          : '#F1F5F9',
          }}
          formatter={(value, name, props) => [
            `${value.toLocaleString()} samples`,
            props.payload.name.replace("\n", " ")
          ]}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function ModelResultsTable() {
  const { data, helpers } = useHAR()

  if (!data?.test_results) return null

  const rows = Object.entries(data.test_results)
    .map(([model, result]) => ({
      model,
      valAcc : result.val_accuracy,
      testAcc: result.test_accuracy,
      gap    : result.generalization_gap,
      params : data.model_comparison?.find(m => m.Model === model)?.Parameters,
      time   : data.model_comparison?.find(m => m.Model === model)?.["Train Time(s)"],
    }))
    .sort((a, b) => b.testAcc - a.testAcc)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Rank", "Model", "Val Accuracy", "Test Accuracy",
              "Gap", "Parameters", "Train Time"].map(h => (
              <th key={h}
                  className="text-left text-xs text-muted uppercase
                             tracking-wider pb-3 pr-6 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.model}
                className="border-b border-border/50 hover:bg-surface2/50
                           transition-colors">
              <td className="py-3 pr-6">
                <span className={`w-6 h-6 rounded-full flex items-center
                                  justify-center text-xs font-bold
                                  ${i === 0
                                    ? 'bg-accent text-white'
                                    : 'bg-surface text-muted'}`}>
                  {i + 1}
                </span>
              </td>
              <td className="py-3 pr-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                       style={{
                         backgroundColor: helpers.getModelColor(row.model)
                       }} />
                  <span className="text-textprimary font-medium">
                    {row.model}
                  </span>
                </div>
              </td>
              <td className="py-3 pr-6 font-mono text-textsecondary">
                {helpers.formatAccuracy(row.valAcc)}
              </td>
              <td className={`py-3 pr-6 font-mono font-bold
                              ${helpers.getAccuracyColor(row.testAcc)}`}>
                {helpers.formatAccuracy(row.testAcc)}
              </td>
              <td className={`py-3 pr-6 font-mono text-xs
                              ${helpers.getGapSeverity(row.gap)}`}>
                {helpers.formatGap(row.gap)}
              </td>
              <td className="py-3 pr-6 font-mono text-textsecondary text-xs">
                {helpers.formatParams(row.params)}
              </td>
              <td className="py-3 pr-6 font-mono text-textsecondary text-xs">
                {helpers.formatTime(row.time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────

export default function Overview() {
  const { data, bestModel, helpers } = useHAR()

  const bestTestAcc  = data?.test_results?.[bestModel]?.test_accuracy
  const totalModels  = Object.keys(data?.test_results || {}).length
  const bestValAcc   = data?.test_results?.[bestModel]?.val_accuracy

  return (
    <div className="space-y-8 max-w-6xl">

      {/* ── Hero section ── */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="px-2.5 py-1 rounded-full text-xs font-medium
                              bg-accent/10 text-accent border border-accent/20">
                DEEP LEARNING PROJECT
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs font-medium
                              bg-green-400/10 text-green-400
                              border border-green-400/20">
                COMPLETE
              </div>
            </div>
            <h1 className="text-textprimary font-bold text-2xl mb-2">
              Human Activity Recognition
            </h1>
            <p className="text-textsecondary text-sm leading-relaxed max-w-3xl">
              A complete end-to-end deep learning project implementing and comparing
              five neural network architectures — MLP, 1D CNN, LSTM, GRU, and ConvGRU —
              for classifying six human activities from raw smartphone inertial sensor
              data using the UCI HAR benchmark dataset. All models were trained from
              scratch on 128-timestep windows of 9-channel accelerometer and gyroscope
              signals without hand-crafted features.
            </p>
          </div>
        </div>
      </div>

      {/* ── Headline metrics ── */}
      <div>
        <SectionHeader
          title="Headline Results"
          subtitle="Key numbers from the complete model evaluation"
        />
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="Best Test Accuracy"
            value={helpers.formatAccuracy(bestTestAcc)}
            subtitle={`${bestModel} — subject independent`}
            color="#FF8A65"
            size="large"
          />
          <MetricCard
            label="Best Val Accuracy"
            value={helpers.formatAccuracy(bestValAcc)}
            subtitle="CNN and GRU tied"
            color="#81C784"
          />
          <MetricCard
            label="Models Trained"
            value={totalModels}
            subtitle="MLP · CNN · LSTM · GRU · ConvGRU"
            color="#2563EB"
          />
          <MetricCard
            label="Dataset Size"
            value="10,299"
            subtitle="samples · 6 classes · 9 channels"
            color="#BA68C8"
          />
        </div>
      </div>

      {/* ── Key findings + Dataset ── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Key findings */}
        <div>
          <SectionHeader
            title="Key Findings"
            subtitle="Scientific conclusions from the comparative study"
          />
          <div className="space-y-2">
            {KEY_INSIGHTS.map((finding, i) => (
              <FindingCard key={i} finding={finding} />
            ))}
          </div>
        </div>

        {/* Dataset summary */}
        <div>
          <SectionHeader
            title="Dataset Summary"
            subtitle="UCI HAR — Human Activity Recognition Using Smartphones"
          />

          {/* Stats table */}
          <div className="bg-surface border border-border rounded-xl p-5 mb-4">
            <DatasetStatRow label="Total Samples"
              value={DATASET_INFO.totalSamples.toLocaleString()} />
            <DatasetStatRow label="Training Samples"
              value={DATASET_INFO.trainSamples.toLocaleString()} />
            <DatasetStatRow label="Test Samples"
              value={DATASET_INFO.testSamples.toLocaleString()} />
            <DatasetStatRow label="Activity Classes"
              value={DATASET_INFO.nClasses} />
            <DatasetStatRow label="Sensor Channels"
              value={DATASET_INFO.nChannels} />
            <DatasetStatRow label="Timesteps per Window"
              value={DATASET_INFO.nTimesteps} />
            <DatasetStatRow label="Window Duration"
              value={`${DATASET_INFO.windowSeconds}s`} />
            <DatasetStatRow label="Sampling Rate"
              value={`${DATASET_INFO.samplingRate} Hz`} />
            <DatasetStatRow label="Total Subjects"
              value={DATASET_INFO.nSubjects} />
            <DatasetStatRow label="Train / Test Subjects"
              value={`${DATASET_INFO.trainSubjects} / ${DATASET_INFO.testSubjects}`} />
          </div>

          {/* Class distribution chart */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-textsecondary text-xs uppercase tracking-wider
                          font-medium mb-4">
              Class Distribution — Training Set
            </p>
            <ClassDistributionChart />
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.keys(CLASS_DISTRIBUTION).map(name => (
                <ActivityBadge key={name} activity={name} size="small" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Model results table ── */}
      <div>
        <SectionHeader
          title="Model Results Summary"
          subtitle="All models ranked by test accuracy — subject independent evaluation"
        />
        <div className="bg-surface border border-border rounded-xl p-6">
          <ModelResultsTable />
        </div>
      </div>

      {/* ── EDA observations ── */}
      <div>
        <SectionHeader
          title="EDA Observations"
          subtitle="Key insights from exploratory data analysis"
        />
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title  : "Class Balance",
              value  : data?.eda_observations?.class_balance ||
                       "Roughly balanced",
              color  : "#81C784",
            },
            {
              title  : "Hardest Pair",
              value  : data?.eda_observations?.hardest_pair ||
                       "Sitting vs Standing",
              color  : "#E57373",
            },
            {
              title  : "Natural Ceiling",
              value  : helpers.formatAccuracy(
                         data?.eda_observations?.natural_ceiling
                       ),
              color  : "#FF8A65",
            },
          ].map(({ title, value, color }) => (
            <div key={title}
                 className="bg-surface border border-border rounded-xl p-5">
              <p className="text-muted text-xs uppercase tracking-wider mb-2">
                {title}
              </p>
              <p className="text-textprimary font-medium text-sm"
                 style={{ color }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}