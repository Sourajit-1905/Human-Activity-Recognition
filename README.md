# Human Activity Recognition — Deep Learning Study Project

> **Live Dashboard →** [HAR Dashboard]()  
> **LinkedIn →** [Sourajit Paul](https://www.linkedin.com/in/sourajit-paul-347351322/)  
> **Dataset →** [UCI HAR Dataset](https://archive.ics.uci.edu/dataset/240/human+activity+recognition+using+smartphones)

---

## Why I Built This

I recently completed my self-study of deep learning and neural networks — covering everything from basic ANNs and MLPs through to CNNs, RNNs, LSTMs, GRUs, and hybrid architectures. Rather than stopping at tutorials and isolated exercises, I wanted to consolidate everything I had learned into a single end-to-end project where I could see all the concepts working together and compare them directly against each other.

The core question I wanted to answer was simple:

> *Does the sequential structure of sensor data matter? Does a model that understands time (LSTM, GRU) outperform one that does not (MLP)? And does combining local feature extraction with temporal modeling (CNN + GRU) give the best result of all?*

This project is my attempt to answer that question with real data, real training runs, and honest evaluation.

---

## What I Built

A complete end-to-end deep learning pipeline that:

- Trains **5 neural network architectures** from scratch on raw sensor data
- Compares them systematically across accuracy, parameter efficiency, training time, and generalization
- Tracks every experiment with full training history
- Evaluates all models on a completely held-out test set of unseen subjects
- Presents all findings in an **interactive React dashboard**

---

## The Problem

Smartphones contain inertial measurement units (IMUs) that continuously record motion data. The task is: given a **2.56-second window of 9-channel sensor data (128 timesteps)** from a smartphone worn on the waist, classify which of 6 activities the person was performing:

```
0 — Walking
1 — Walking Upstairs
2 — Walking Downstairs
3 — Sitting
4 — Standing
5 — Laying
```

This is a **6-class time-series classification problem** using raw accelerometer and gyroscope signals — no hand-crafted features.

---

## Dataset

I used the **UCI HAR Dataset** (Anguita et al., 2013) — one of the most cited benchmarks in applied deep learning for time-series classification.

| Property          | Value                          |
|-------------------|--------------------------------|
| Total Samples     | 10,299 windows                 |
| Training Samples  | 7,352 (21 subjects)            |
| Test Samples      | 2,947 (9 subjects)             |
| Input Shape       | (128 timesteps, 9 channels)    |
| Classes           | 6 activities                   |
| Evaluation        | Subject-independent            |
| Dataset Size      | ~25 MB                         |

The test set contains **9 subjects who never appeared in training** — making test accuracy a genuine measure of generalization, not memorization.

---

## My Learning Journey Through the Models

I built the models in a deliberate progression, each one adding a new concept I had studied:

### Stage 1 — MLP Baseline
*Concept practiced: feedforward networks, Dense layers, Dropout, BatchNormalization*

My first model had no understanding of time. It flattened the 128×9 input into a 1152-dimensional vector and passed it through Dense layers. I expected this to perform poorly — but it reached **96.65% validation accuracy**, which surprised me. It showed that raw statistical features carry more information than I expected, even without temporal modeling.

### Stage 2 — 1D CNN
*Concept practiced: convolutional layers, receptive fields, local pattern detection, GlobalAveragePooling*

I replaced the flatten operation with Conv1D layers that slide filters across the 128 timesteps. Each filter learns to detect a local motion pattern — a step, a jerk, a rotation. This jumped to **99.46% validation accuracy** — a gain of +2.81% over the MLP. The lesson was clear: the temporal ordering of sensor readings carries important information that flattening destroys.

### Stage 3 — LSTM
*Concept practiced: recurrent networks, gating mechanisms, hidden state, return_sequences, vanishing gradients*

I then built a stacked LSTM to model long-range sequential dependencies — the kind of memory that lets the model remember what happened at timestep 10 while processing timestep 100. I learned several painful lessons here: LSTMs are sensitive to learning rate, adding ReLU after LSTM hidden states is harmful, and BiLSTM does not always help. After extensive experimentation my best LSTM reached **99.37% validation accuracy** — using 1.86M parameters.

### Stage 4 — GRU
*Concept practiced: GRU gates vs LSTM gates, depth vs width tradeoff, parameter efficiency*

I replaced the LSTM with GRU layers — a simpler gating mechanism with fewer parameters. The most interesting discovery came when I tried a 6-layer narrow GRU (128→64 units) instead of a wide 2-layer version: the deeper narrow model matched the CNN at **99.46% validation accuracy** using only 340K parameters — 5.5x fewer than my LSTM for better accuracy.

### Stage 5 — ConvGRU Hybrid
*Concept practiced: hybrid architectures, feature mismatch, when complexity does not help*

My final model combined a CNN front-end with a GRU back-end — the CNN extracts local features, the GRU models how those features evolve over time. I expected this to be the best model. It was not. ConvGRU reached **98.91% validation accuracy** — below both standalone CNN and GRU. This was one of the most valuable lessons of the project: architectural complexity does not guarantee improvement.

---

## Results

### Validation vs Test Accuracy

| Model   | Val Accuracy | Test Accuracy | Gap    | Parameters  | Train Time |
|---------|-------------|---------------|--------|-------------|------------|
| **GRU** | **99.46%**  | **95.76%**    | 3.70%  | 340,230     | 74s        |
| LSTM    | 99.37%      | 95.15%        | 4.22%  | 1,861,126   | 479.4s     |
| ConvGRU | 98.91%      | 95.11%        | 3.80%  | 670,598     | 132.0s     |
| CNN     | 99.46%      | 94.20%        | 5.26%  | 128,390     | 107.7s     |
| MLP     | 96.65%      | 91.48%        | 5.17%  | 330,374     | 11.9s      |

### The Most Surprising Finding

CNN and GRU tied on validation accuracy (99.46%) but GRU outperformed CNN by **1.56% on test data**. The model I expected to win (CNN — fewest parameters, highest validation accuracy) had the worst generalization gap. GRU's sequential modeling learned patterns that transferred better to unseen subjects.

**This is why you never select a deployment model based on validation accuracy alone.**

---

## Key Findings

**1. Temporal structure matters significantly**
The jump from MLP (96.65%) to CNN (99.46%) confirms that local temporal patterns are the most important feature type for HAR. A model with no temporal awareness leaves 2.81% on the table.

**2. Local patterns beat long-range memory for short windows**
CNN outperformed LSTM with 14.6x fewer parameters. For 2.56-second windows, local motion patterns (step rhythms, gesture signatures) are more discriminative than long-range sequential dependencies.

**3. GRU comprehensively outperforms LSTM**
5.5x fewer parameters, 6.5x faster training, higher accuracy. GRU's simpler gating mechanism is sufficient for 128-timestep HAR sequences.

**4. Depth beats width in GRU**
A 6-layer narrow GRU matched CNN accuracy. More layers with smaller units generalised better than fewer layers with larger units — each layer forced efficient feature compression.

**5. Hybrid models did not break the ceiling**
ConvGRU scored below both standalone components. On short windows with complete activity signatures, neither architecture gains new information from the other.

**6. Natural accuracy ceiling at ~99.5%**
Every model plateaued near 99.5% on validation. The remaining errors are Sitting vs Standing — signals that are physically near-identical in a 2.56-second window regardless of architecture.

---

## Error Analysis

On the test set my best model (GRU) made 125 errors out of 2,947 samples:

```
Sitting → Standing              : 61 errors  (48.8% of all errors)
Standing → Sitting              : 29 errors  (23.2%)
Walking Upstairs → Downstairs   : 15 errors  (12.0%)
Walking Downstairs → Upstairs   : 6 errors   (4.8%)
Walking Downstairs → Walking    : 4 errors   (3.2%)
```

**72% of all errors are Sitting vs Standing confusion.** These two activities produce nearly identical sensor signals — the difference is a subtle postural shift that 2.56 seconds of raw accelerometer data cannot reliably distinguish. This is a data limitation, not an architectural one.

Additionally, **91 of 125 errors (72.8%) were made with greater than 90% confidence** — meaning the model was wrong and certain about it. Probability calibration would be required before production deployment.

---

## Project Structure

```
har-activity-recognition/
├── notebooks/              # 9 Jupyter notebooks — one per stage
│   ├── 01_eda.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_baseline_mlp.ipynb
│   ├── 04_cnn_1d.ipynb
│   ├── 05_lstm.ipynb
│   ├── 06_gru.ipynb
│   ├── 07_deepconvGRU.ipynb
│   ├── 08_experiments_comparison.ipynb
│   └── 09_final_evaluation.ipynb
├── artifacts/              # Saved models, scalers, results
├── reports/                # Training curves, confusion matrices
├── dashboard/              # React frontend dashboard
└── data/                   # Raw and processed dataset
```

---

## Dashboard

I built a 6-page interactive React dashboard to present all findings visually:

| Page                | What it shows                                           |
|---------------------|---------------------------------------------------------|
| Overview            | Project summary, headline metrics, key findings         |
| Data Exploration    | EDA findings, class distribution, signal characteristics|
| Model Comparison    | All models side-by-side, efficiency analysis            |
| Experiment Tracker  | Training curves, convergence, experiment findings table |
| Evaluation          | Test results, confusion matrix, ROC-AUC, error analysis |
| Live Demo           | Interactive prediction simulation with signal viewer    |

**Live Dashboard →** [HAR Dashboard]()

---

## What I Learned

Beyond the technical results, this project taught me several things I could not have learned from tutorials alone:

- **Validation accuracy is optimistic.** It is computed on subjects whose movement style the model has already seen during training. Test accuracy on truly unseen subjects is always lower and always more honest.

- **More complexity is not always better.** My hybrid ConvGRU was more complex than either CNN or GRU but performed worse than both. The best model is the simplest one that captures all relevant structure in the data.

- **Architecture choices interact with data properties.** LSTM's long-range memory adds no value for 2.56-second windows because there are no long-range dependencies to model. The window is short enough that every timestep is effectively local.

- **Errors have physics behind them.** Sitting and Standing look the same in raw accelerometer data because they genuinely are physically similar. Understanding why a model fails is more valuable than trying to fix it.

- **The training process is as important as the architecture.** Learning rate, BatchNormalization placement, ReLU after LSTM hidden states, patience values for early stopping — these decisions affected my results as much as the choice between LSTM and GRU.

---

## Tech Stack

```
Python          — core language
TensorFlow/Keras— model building and training
NumPy / Pandas  — data handling
Scikit-learn    — preprocessing, metrics
Matplotlib / Seaborn — visualization
React           — dashboard frontend
Recharts        — dashboard charts
Tailwind CSS    — dashboard styling
Vite            — dashboard build tool
```

---

## How to Run

### Notebooks (Google Colab)

```bash
# Run notebooks in order
01_eda.ipynb               → EDA and data loading
02_preprocessing.ipynb     → Normalization and splitting
03_baseline_mlp.ipynb      → MLP baseline
04_cnn_1d.ipynb            → 1D CNN
05_lstm.ipynb              → LSTM and BiLSTM
06_gru.ipynb               → GRU variants
07_deepconvGRU.ipynb       → Hybrid ConvGRU
08_experiments_comparison.ipynb → All model comparison
09_final_evaluation.ipynb  → Final test evaluation
```

### Dashboard (Local)

```bash
cd dashboard
npm install
npm run dev
# Open http://localhost:5173
```


---

## References

```
Anguita, D., Ghio, A., Oneto, L., Parra, X., & Reyes-Ortiz, J. L. (2013).
A public domain dataset for human activity recognition using smartphones.
ESANN 2013.

Ordóñez, F. J., & Roggen, D. (2016).
Deep convolutional and LSTM recurrent neural networks for
multimodal wearable activity recognition.
Sensors, 16(1), 115.
```

---

## Connect

If you are learning deep learning and found this project useful, or if you have questions about any of the architectural decisions, feel free to reach out.

>**LinkedIn →** [Sourajit Paul](https://www.linkedin.com/in/sourajit-paul-347351322/)<br>
>**GitHub →** [Sourajit-1905](https://github.com/Sourajit-1905)