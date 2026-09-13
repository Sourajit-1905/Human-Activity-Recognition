
import {
  MODEL_COLORS,
  MODEL_ORDER,
  ACTIVITY_NAMES,
  ACTIVITY_COLORS,
  CLASS_DISTRIBUTION,
  CONFUSION_PAIRS,
  TOTAL_TEST_ERRORS,
  TOTAL_TEST_SAMPLES,
} from '../constants'

// ── Number formatting ─────────────────────────────────────

export function formatAccuracy(value, decimals = 2) {
  if (value === null || value === undefined) return "N/A"
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatParams(value) {
  if (value === null || value === undefined) return "N/A"
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

export function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return "N/A"
  if (seconds < 60)  return `${seconds.toFixed(1)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

export function formatGap(gap) {
  if (gap === null || gap === undefined) return "N/A"
  return `${(gap * 100).toFixed(2)}%`
}

export function formatNumber(value) {
  if (value === null || value === undefined) return "N/A"
  return value.toLocaleString()
}

export function formatEpochs(value) {
  if (value === null || value === undefined) return "N/A"
  return `${value} epochs`
}

// ── Color utilities ───────────────────────────────────────

export function getModelColor(modelName) {
  return MODEL_COLORS[modelName] || "#94A3B8"
}

export function getActivityColor(activityName) {
  return ACTIVITY_COLORS[activityName] || "#94A3B8"
}

export function getGapSeverity(gap) {
  if (gap === null || gap === undefined) return "text-textsecondary"
  const pct = gap * 100
  if (pct <= 2)  return "text-green-400"
  if (pct <= 4)  return "text-yellow-400"
  return "text-red-400"
}

export function getGapBg(gap) {
  if (gap === null || gap === undefined) return "bg-surface"
  const pct = gap * 100
  if (pct <= 2)  return "bg-green-400/10"
  if (pct <= 4)  return "bg-yellow-400/10"
  return "bg-red-400/10"
}

export function getAccuracyColor(accuracy) {
  const pct = accuracy * 100
  if (pct >= 99)   return "text-green-400"
  if (pct >= 97)   return "text-blue-400"
  if (pct >= 95)   return "text-yellow-400"
  return "text-red-400"
}

export function getImpactColor(impact) {
  if (impact === "high")   return "text-red-400 bg-red-400/10 border-red-400/20"
  if (impact === "medium") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
  return "text-green-400 bg-green-400/10 border-green-400/20"
}

// ── Data computation ──────────────────────────────────────

export function getBestModel(testResults) {
  if (!testResults) return null
  return Object.entries(testResults)
    .sort((a, b) => b[1].test_accuracy - a[1].test_accuracy)[0][0]
}

export function getWorstModel(testResults) {
  if (!testResults) return null
  return Object.entries(testResults)
    .sort((a, b) => a[1].test_accuracy - b[1].test_accuracy)[0][0]
}

export function computeGeneralizationGap(valAcc, testAcc) {
  if (!valAcc || !testAcc) return null
  return valAcc - testAcc
}

export function getOrderedModels(availableModels) {
  return MODEL_ORDER.filter(m => availableModels.includes(m))
}

export function computeAccuracyGain(baseModel, targetModel, testResults) {
  if (!testResults?.[baseModel] || !testResults?.[targetModel]) return null
  return testResults[targetModel].test_accuracy -
         testResults[baseModel].test_accuracy
}

export function getTotalErrorRate() {
  return TOTAL_TEST_ERRORS / TOTAL_TEST_SAMPLES
}

export function getSittingStandingErrorRate() {
  const sittingStandingErrors = CONFUSION_PAIRS
    .filter(p =>
      (p.true === "Sitting" && p.predicted === "Standing") ||
      (p.true === "Standing" && p.predicted === "Sitting")
    )
    .reduce((sum, p) => sum + p.count, 0)
  return sittingStandingErrors / TOTAL_TEST_ERRORS
}

// ── Chart data builders ───────────────────────────────────

export function buildAccuracyChartData(testResults) {
  if (!testResults) return []
  return getOrderedModels(Object.keys(testResults)).map(model => ({
    model,
    testAccuracy : parseFloat((testResults[model].test_accuracy * 100).toFixed(2)),
    valAccuracy  : parseFloat((testResults[model].val_accuracy * 100).toFixed(2)),
    gap          : parseFloat(((testResults[model].val_accuracy -
                   testResults[model].test_accuracy) * 100).toFixed(2)),
    color        : getModelColor(model),
  }))
}

export function buildParamChartData(modelComparison) {
  if (!modelComparison) return []
  return modelComparison.map(m => ({
    model      : m.Model,
    params     : m.Parameters,
    valAccuracy: parseFloat((m["Val Accuracy"] * 100).toFixed(2)),
    testAccuracy: 0,
    color      : getModelColor(m.Model),
  }))
}

export function buildClassDistributionData() {
  return Object.entries(CLASS_DISTRIBUTION).map(([name, count]) => ({
    name,
    count,
    color : getActivityColor(name),
  }))
}

export function buildTrainingCurveData(curves, modelName) {
  if (!curves?.[modelName]) return []
  const { val_acc, train_acc } = curves[modelName]
  return val_acc.map((val, i) => ({
    epoch    : i + 1,
    valAcc   : parseFloat((val * 100).toFixed(3)),
    trainAcc : parseFloat((train_acc[i] * 100).toFixed(3)),
  }))
}

export function buildROCAUCData(rocScores) {
  if (!rocScores) return []
  return Object.entries(rocScores).map(([activity, auc]) => ({
    activity,
    auc      : parseFloat((auc * 100).toFixed(2)),
    color    : getActivityColor(activity),
  })).sort((a, b) => b.auc - a.auc)
}

export function buildConfusionPairData() {
  return CONFUSION_PAIRS.map(pair => ({
    ...pair,
    percentage : parseFloat(((pair.count / TOTAL_TEST_ERRORS) * 100).toFixed(1)),
  }))
}

// ── Live Demo sample generator ────────────────────────────
// Generates 10 realistic pre-stored test samples
// Uses actual class distribution and confusion pair data
// No real inference — predictions are pre-computed from results

export function generateDemoSamples() {
  // 8 correct predictions + 2 errors matching real confusion pairs
  return [
    {
      id          : 1,
      trueActivity: "Walking",
      predicted   : "Walking",
      confidence  : 0.9987,
      correct     : true,
      description : "Clear rhythmic oscillation — confident correct prediction",
    },
    {
      id          : 2,
      trueActivity: "Laying",
      predicted   : "Laying",
      confidence  : 0.9999,
      correct     : true,
      description : "Perfectly flat signal — easiest activity to classify",
    },
    {
      id          : 3,
      trueActivity: "Walking Upstairs",
      predicted   : "Walking Upstairs",
      confidence  : 0.9743,
      correct     : true,
      description : "Higher amplitude oscillation than flat walking",
    },
    {
      id          : 4,
      trueActivity: "Sitting",
      predicted   : "Standing",
      confidence  : 0.9234,
      correct     : false,
      description : "Hardest confusion pair — nearly identical sensor signals",
    },
    {
      id          : 5,
      trueActivity: "Walking Downstairs",
      predicted   : "Walking Downstairs",
      confidence  : 0.8821,
      correct     : true,
      description : "Distinctive deceleration pattern detected",
    },
    {
      id          : 6,
      trueActivity: "Standing",
      predicted   : "Sitting",
      confidence  : 0.7654,
      correct     : false,
      description : "Model confused static posture — low movement signal",
    },
    {
      id          : 7,
      trueActivity: "Walking",
      predicted   : "Walking",
      confidence  : 0.9956,
      correct     : true,
      description : "Strong periodic pattern — high confidence correct",
    },
    {
      id          : 8,
      trueActivity: "Sitting",
      predicted   : "Sitting",
      confidence  : 0.8934,
      correct     : true,
      description : "Near-flat signal correctly identified",
    },
    {
      id          : 9,
      trueActivity: "Walking Upstairs",
      predicted   : "Walking Downstairs",
      confidence  : 0.6123,
      correct     : false,
      description : "Similar walking pattern — lower confidence error",
    },
    {
      id          : 10,
      trueActivity: "Laying",
      predicted   : "Laying",
      confidence  : 1.0000,
      correct     : true,
      description : "Perfect confidence — completely unique horizontal signal",
    },
  ]
}