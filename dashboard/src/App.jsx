// src/App.jsx

import { useHAR } from './context/HARContext'

function App() {
  const {
    data,
    models,
    bestModel,
    worstModel,
    chartData,
    helpers,
    isLoading,
    error
  } = useHAR()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent
                          rounded-full animate-spin mx-auto" />
          <p className="text-textsecondary text-sm">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="bg-surface border border-red-400/20 rounded-xl p-6 max-w-md">
          <p className="text-red-400 font-medium mb-2">Data Error</p>
          <p className="text-textsecondary text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium
                          bg-accent/10 text-accent border border-accent/20">
            STAGE D2 — DATA LAYER TEST
          </div>
          <h1 className="text-3xl font-bold text-textprimary">
            HAR Dashboard
          </h1>
        </div>

        {/* Headline metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Best Model",
              value: bestModel,
              sub  : helpers.formatAccuracy(
                data.test_results[bestModel]?.test_accuracy) + " test"
            },
            {
              label: "Models Trained",
              value: models.length,
              sub  : "architectures"
            },
            {
              label: "Dataset",
              value: "UCI HAR",
              sub  : "10,299 samples"
            },
          ].map(({ label, value, sub }) => (
            <div key={label}
                 className="bg-surface border border-border rounded-xl p-4 text-center">
              <p className="text-textprimary font-bold text-xl">{value}</p>
              <p className="text-textsecondary text-xs mt-1">{label}</p>
              <p className="text-muted text-xs">{sub}</p>
            </div>
          ))}
        </div>

        {/* Model results from context */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-textsecondary text-xs uppercase tracking-wide mb-4">
            Test Results — loaded from results.json
          </p>
          <div className="space-y-3">
            {chartData.accuracy?.map(row => (
              <div key={row.model}
                   className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0"
                       style={{ backgroundColor: row.color }} />
                  <span className="text-textprimary text-sm font-medium">
                    {row.model}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm font-mono">
                  <span className="text-textsecondary">
                    Val: {row.valAccuracy}%
                  </span>
                  <span className={helpers.getAccuracyColor(
                    data.test_results[row.model]?.test_accuracy
                  )}>
                    Test: {row.testAccuracy}%
                  </span>
                  <span className={helpers.getGapSeverity(
                    data.test_results[row.model]?.generalization_gap
                  )}>
                    Gap: {helpers.formatGap(
                      data.test_results[row.model]?.generalization_gap
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Helper functions verification */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-textsecondary text-xs uppercase tracking-wide mb-4">
            Helper functions — verified
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {[
              ["formatAccuracy(0.9576)",  helpers.formatAccuracy(0.9576)],
              ["formatParams(341382)",    helpers.formatParams(341382)],
              ["formatParams(1861126)",   helpers.formatParams(1861126)],
              ["formatTime(345.9)",       helpers.formatTime(345.9)],
              ["formatTime(479.4)",       helpers.formatTime(479.4)],
              ["formatTime(11.9)",        helpers.formatTime(11.9)],
              ["formatGap(0.0370)",       helpers.formatGap(0.0370)],
              ["getModelColor('GRU')",    helpers.getModelColor('GRU')],
            ].map(([fn, result]) => (
              <div key={fn}
                   className="flex justify-between items-center
                              bg-navy rounded-lg px-3 py-2">
                <span className="text-muted">{fn}</span>
                <span className="text-accent">{result}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo samples verification */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-textsecondary text-xs uppercase tracking-wide mb-4">
            Live Demo samples — {chartData.demoSamples?.length} pre-loaded
          </p>
          <div className="space-y-2">
            {chartData.demoSamples?.slice(0, 3).map(sample => (
              <div key={sample.id}
                   className="flex items-center justify-between
                              bg-navy rounded-lg px-3 py-2 text-xs">
                <span className="text-textprimary">
                  Sample {sample.id} — {sample.trueActivity}
                </span>
                <span className={sample.correct
                  ? "text-green-400" : "text-red-400"}>
                  {sample.correct ? "✓ Correct" : "✗ Wrong"}
                  {" "}({(sample.confidence * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
            <p className="text-muted text-xs text-center pt-1">
              + {chartData.demoSamples?.length - 3} more samples
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App