// src/context/HARContext.jsx

import { createContext, useContext, useState, useEffect } from 'react'
import resultsData from '../data/results.json'
import {
  getBestModel,
  getOrderedModels,
  buildAccuracyChartData,
  buildParamChartData,
  buildClassDistributionData,
  buildConfusionPairData,
  buildROCAUCData,
  generateDemoSamples,
  formatAccuracy,
  formatParams,
  formatTime,
  formatGap,
  formatNumber,
  formatEpochs,
  getModelColor,
  getActivityColor,
  getGapSeverity,
  getGapBg,
  getAccuracyColor,
  getImpactColor,
  computeGeneralizationGap,
  getWorstModel,
  buildTrainingCurveData,
  computeAccuracyGain,
  getTotalErrorRate,
  getSittingStandingErrorRate,
} from '../utils/helpers'

const HARContext = createContext(null)

export function HARProvider({ children }) {
  const [data, setData]           = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    try {
      // Validate all required fields
      const required = [
        "metadata", "model_comparison", "training_curves",
        "key_findings", "eda_observations", "test_results", "best_model"
      ]
      const missing = required.filter(f => !(f in resultsData))
      if (missing.length > 0) {
        throw new Error(`Missing fields in results.json: ${missing.join(", ")}`)
      }
      setData(resultsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Derived values ──────────────────────────────────────
  const models    = data
    ? getOrderedModels(Object.keys(data.test_results))
    : []

  const bestModel  = data ? getBestModel(data.test_results)  : null
  const worstModel = data ? getWorstModel(data.test_results) : null

  // ── Pre-built chart data ────────────────────────────────
  // Computed once here — passed to pages via context
  const chartData = data ? {
    accuracy         : buildAccuracyChartData(data.test_results),
    parameters       : buildParamChartData(data.model_comparison),
    classDistribution: buildClassDistributionData(),
    confusionPairs   : buildConfusionPairData(),
    rocAUC           : buildROCAUCData(data.best_model?.roc_auc_scores),
    demoSamples      : generateDemoSamples(),
  } : {}

  // ── All helpers exposed through context ─────────────────
  const helpers = {
    formatAccuracy,
    formatParams,
    formatTime,
    formatGap,
    formatNumber,
    formatEpochs,
    getModelColor,
    getActivityColor,
    getGapSeverity,
    getGapBg,
    getAccuracyColor,
    getImpactColor,
    computeGeneralizationGap,
    computeAccuracyGain,
    buildTrainingCurveData,
    getTotalErrorRate,
    getSittingStandingErrorRate,
  }

  const value = {
    // Raw data
    data,
    // Derived
    models,
    bestModel,
    worstModel,
    // Pre-built chart datasets
    chartData,
    // All helper functions
    helpers,
    // Loading state
    isLoading,
    error,
  }

  return (
    <HARContext.Provider value={value}>
      {children}
    </HARContext.Provider>
  )
}

export function useHAR() {
  const context = useContext(HARContext)
  if (!context) {
    throw new Error("useHAR must be used inside HARProvider")
  }
  return context
}