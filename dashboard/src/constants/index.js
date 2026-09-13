
// ── Model configuration ───────────────────────────────────

export const MODEL_COLORS = {
  MLP     : "#64B5F6",
  CNN     : "#81C784",
  LSTM    : "#E57373",
  GRU     : "#FF8A65",
  ConvGRU : "#BA68C8",
}

export const MODEL_ORDER = ["GRU", "LSTM", "ConvGRU", "CNN", "MLP"]

export const MODEL_DESCRIPTIONS = {
  MLP     : "Multilayer Perceptron — flattens input, no temporal awareness",
  CNN     : "1D Convolutional — detects local motion patterns",
  LSTM    : "Long Short-Term Memory — models long-range sequential dependencies",
  GRU     : "Gated Recurrent Unit — efficient sequential modeling",
  ConvGRU : "Hybrid CNN + GRU — local feature extraction + temporal modeling",
}

export const MODEL_ARCHITECTURES = {
  MLP     : "Flatten → Dense(256) → BN → Drop → Dense(128) → BN → Drop → Dense(6)",
  CNN     : "Conv1D(64) → Conv1D(128) → Conv1D(256) → GlobalAvgPool → Drop → Dense(6)",
  LSTM    : "LSTM(512) → BN → Drop → LSTM(256) → BN → Drop → Dense(6)",
  GRU     : "GRU(128)×3 → GRU(64)×3 → BN → Drop → Dense(6)",
  ConvGRU : "Conv1D(64,128,256) → GRU(256) → Drop → GRU(128) → Drop → Dense(6)",
}

// ── Activity configuration ────────────────────────────────

export const ACTIVITY_NAMES = [
  "Walking",
  "Walking Upstairs",
  "Walking Downstairs",
  "Sitting",
  "Standing",
  "Laying"
]

export const ACTIVITY_COLORS = {
  "Walking"            : "#81C784",
  "Walking Upstairs"   : "#64B5F6",
  "Walking Downstairs" : "#4DD0E1",
  "Sitting"            : "#FFB74D",
  "Standing"           : "#F06292",
  "Laying"             : "#BA68C8",
}

export const ACTIVITY_DESCRIPTIONS = {
  "Walking"            : "Rhythmic periodic oscillations — easiest to classify",
  "Walking Upstairs"   : "Similar to walking but with higher amplitude",
  "Walking Downstairs" : "Similar to walking but with different deceleration pattern",
  "Sitting"            : "Nearly flat signal — often confused with Standing",
  "Standing"           : "Nearly flat signal — often confused with Sitting",
  "Laying"             : "Flattest signal of all — easiest static activity",
}


export const DATASET_INFO = {
  name          : "UCI HAR Dataset",
  fullName      : "Human Activity Recognition Using Smartphones",
  totalSamples  : 10299,
  trainSamples  : 7352,
  valSamples    : 1103,
  testSamples   : 2947,
  nClasses      : 6,
  nChannels     : 9,
  nTimesteps    : 128,
  windowSeconds : 2.56,
  samplingRate  : 50,
  nSubjects     : 30,
  trainSubjects : 21,
  testSubjects  : 9,
  source        : "UCI ML Repository",
  year          : 2013,
  paper         : "Anguita et al. (2013)",
}

export const CLASS_DISTRIBUTION = {
  "Walking"            : 1226,
  "Walking Upstairs"   : 1073,
  "Walking Downstairs" : 986,
  "Sitting"            : 1286,
  "Standing"           : 1374,
  "Laying"             : 1407,
}

export const CHANNEL_NAMES = [
  "Body Acc X", "Body Acc Y", "Body Acc Z",
  "Body Gyro X", "Body Gyro Y", "Body Gyro Z",
  "Total Acc X", "Total Acc Y", "Total Acc Z",
]

// ── Navigation configuration ──────────────────────────────

export const NAV_ITEMS = [
  { id: "overview",    label: "Overview",           icon: "home"    },
  { id: "data",        label: "Data Exploration",   icon: "chart"   },
  { id: "comparison",  label: "Model Comparison",   icon: "scale"   },
  { id: "experiments", label: "Experiment Tracker", icon: "beaker"  },
  { id: "evaluation",  label: "Evaluation",         icon: "check"   },
  { id: "demo",        label: "Live Demo",          icon: "play"    },
]

// ── Error analysis findings ───────────────────────────────

export const CONFUSION_PAIRS = [
  { true: "Sitting",          predicted: "Standing",          count: 61 },
  { true: "Standing",         predicted: "Sitting",           count: 29 },
  { true: "Walking Upstairs", predicted: "Walking Downstairs",count: 15 },
  { true: "Walking Downstairs",predicted: "Walking Upstairs", count: 6  },
  { true: "Walking Downstairs",predicted: "Walking",          count: 4  },
]

export const TOTAL_TEST_ERRORS = 125
export const TOTAL_TEST_SAMPLES = 2947

// ── Key findings ──────────────────────────────────────────

export const KEY_INSIGHTS = [
  {
    title      : "Temporal structure matters",
    description: "MLP → CNN jump of +2.81% confirms local temporal patterns are critical.",
    impact     : "high",
    icon       : "trend-up",
  },
  {
    title      : "CNN is most parameter efficient",
    description: "99.46% validation accuracy with only 128K parameters — 14.6x fewer than LSTM.",
    impact     : "high",
    icon       : "chip",
  },
  {
    title      : "GRU wins on generalization",
    description: "GRU achieved best test accuracy (95.76%) despite tying CNN on validation.",
    impact     : "high",
    icon       : "trophy",
  },
  {
    title      : "GRU outperforms LSTM comprehensively",
    description: "5.5x fewer parameters, 6.5x faster training, higher accuracy than LSTM.",
    impact     : "high",
    icon       : "lightning",
  },
  {
    title      : "Hybrid models did not break the ceiling",
    description: "ConvGRU scored below standalone CNN and GRU despite higher complexity.",
    impact     : "medium",
    icon       : "warning",
  },
  {
    title      : "Natural ceiling at ~99.5%",
    description: "Sitting vs Standing ambiguity prevents any architecture from exceeding ~99.5%.",
    impact     : "medium",
    icon       : "info",
  },
]