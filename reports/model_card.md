# Model Card — Human Activity Recognition (HAR)

## Model Overview

| Field             | Details                                                    |
|-------------------|------------------------------------------------------------|
| **Project**       | Human Activity Recognition from Smartphone Sensor Data     |
| **Model Family**  | Deep Learning — MLP, CNN, LSTM, GRU, ConvGRU               |
| **Best Model**    | GRU (6-layer, 128→64 units)                                |
| **Task**          | 6-class time-series classification                         |
| **Input**         | 128 timesteps × 9 sensor channels (2.56s window @ 50 Hz)  |
| **Output**        | Activity class probabilities (softmax, 6 classes)          |
| **Framework**     | TensorFlow / Keras                                         |
| **Date**          | September 2026                                             |

---

## Dataset

| Field                | Details                                      |
|----------------------|----------------------------------------------|
| **Name**             | UCI HAR Dataset                              |
| **Source**           | UCI Machine Learning Repository              |
| **Paper**            | Anguita et al. (2013)                        |
| **Total Samples**    | 10,299 windows                               |
| **Training Samples** | 7,352 (21 subjects)                          |
| **Test Samples**     | 2,947 (9 subjects)                           |
| **Classes**          | 6                                            |
| **Channels**         | 9 (body accel × 3, gyroscope × 3, total accel × 3) |
| **Evaluation Type**  | Subject-independent                          |

### Activity Classes

| ID | Activity            | Signal Type  | Difficulty |
|----|---------------------|--------------|------------|
| 0  | Walking             | Periodic     | Easy       |
| 1  | Walking Upstairs    | Periodic     | Medium     |
| 2  | Walking Downstairs  | Periodic     | Medium     |
| 3  | Sitting             | Near-flat    | Hard       |
| 4  | Standing            | Near-flat    | Hard       |
| 5  | Laying              | Flat         | Easy       |

---

## Model Architectures

### Best Model — GRU

```
Input (128, 9)
→ GRU(128, return_sequences=True) → BatchNorm → Dropout(0.2)
→ GRU(128, return_sequences=True) → BatchNorm → Dropout(0.2)
→ GRU(128, return_sequences=True) → BatchNorm → Dropout(0.2)
→ GRU(64,  return_sequences=True) → BatchNorm → Dropout(0.2)
→ GRU(64,  return_sequences=True) → BatchNorm → Dropout(0.2)
→ GRU(64,  return_sequences=False) → BatchNorm → Dropout(0.2)
→ Dense(6, activation='softmax')
```

| Property        | Value        |
|-----------------|--------------|
| Parameters      | 340,230      |
| Learning Rate   | 0.001        |
| Batch Size      | 64           |
| Best Epoch      | 59           |
| Training Time   | 74 seconds   |

### All Models Comparison

| Model   | Parameters  | Val Accuracy | Test Accuracy | Train Time |
|---------|-------------|-------------|---------------|------------|
| GRU     | 340,230     | 99.46%      | **95.76%**    | 74s        |
| LSTM    | 1,861,126   | 99.37%      | 95.15%        | 479.4s     |
| ConvGRU | 670,598     | 98.91%      | 95.11%        | 132.0s     |
| CNN     | 128,390     | 99.46%      | 94.20%        | 107.7s     |
| MLP     | 330,374     | 96.65%      | 91.48%        | 11.9s      |

---

## Training Configuration

| Hyperparameter       | Value                        |
|----------------------|------------------------------|
| Optimizer            | Adam                         |
| Loss Function        | Sparse Categorical Crossentropy |
| Epochs (max)         | 100                          |
| Batch Size           | 64                           |
| Early Stopping       | patience=15, restore best weights |
| LR Scheduler         | ReduceLROnPlateau (factor=0.5, patience=7) |
| Random Seed          | 42                           |
| Validation Split     | 15% stratified from train    |
| Normalization        | StandardScaler (fit on train only) |

---

## Performance Metrics — Best Model (GRU)

### Overall

| Metric           | Validation | Test    |
|------------------|------------|---------|
| Accuracy         | 99.46%     | 95.76%  |
| Macro F1         | 99.50%     | 95.76%  |
| Macro ROC-AUC    | —          | 0.9974  |
| Generalization Gap | —        | 3.70%   |

### Per-Class (Test Set)

| Activity            | ROC-AUC |
|---------------------|---------|
| Walking             | 0.9999  |
| Walking Upstairs    | 0.9994  |
| Walking Downstairs  | 0.9996  |
| Sitting             | 0.9908  |
| Standing            | 0.9944  |
| Laying              | 1.0000  |

---

## Error Analysis

| Metric                  | Value                    |
|-------------------------|--------------------------|
| Total Test Errors        | 125 of 2,947 (4.24%)    |
| Sitting → Standing       | 61 errors (48.8%)        |
| Standing → Sitting       | 29 errors (23.2%)        |
| Walking Upstairs → Down  | 15 errors (12.0%)        |
| High Confidence Errors   | 91 samples (>90% conf)  |

### Root Cause Analysis

**Sitting vs Standing (72% of errors)**
Both activities produce near-flat accelerometer signals with
nearly identical baseline values. The difference is a subtle
postural shift that 2.56-second raw sensor windows cannot
reliably capture. This is a fundamental data limitation,
not an architectural one.

**Walking variants (20% of errors)**
Walking Upstairs and Downstairs share the same periodic rhythm
as Walking. Confusion arises when the amplitude and deceleration
pattern of a sample falls between class boundaries.

**High confidence errors (72.8% of wrong predictions)**
The model made 91 wrong predictions with greater than 90%
confidence. This indicates overconfidence near the
Sitting/Standing decision boundary and suggests probability
calibration (temperature scaling) before production deployment.

---

## Key Findings

1. **Temporal structure matters** — MLP to CNN jump of +2.81%
   confirms local temporal patterns are critical for HAR.

2. **CNN is most parameter efficient** — 99.46% validation
   accuracy with only 128K parameters, 14.6x fewer than LSTM.

3. **GRU wins on generalization** — best test accuracy (95.76%)
   despite tying CNN on validation. Sequential modeling learned
   more subject-independent patterns.

4. **GRU outperforms LSTM comprehensively** — 5.5x fewer
   parameters, 6.5x faster training, higher accuracy.

5. **Hybrid models did not break the ceiling** — ConvGRU scored
   below standalone CNN and GRU despite higher complexity.

6. **Natural accuracy ceiling at ~99.5%** — caused by inherent
   Sitting vs Standing signal ambiguity across all architectures.

---

## Limitations

- **Window size** — 2.56-second windows cannot distinguish
  Sitting from Standing reliably. A 5+ second window would
  likely improve static activity classification.

- **Sensor placement** — dataset uses waist-mounted phone.
  Results may not transfer to wrist-worn devices (smartwatches)
  without retraining.

- **Subject independence** — trained on 21 subjects, tested on
  9. Performance may degrade further on populations with
  significantly different movement patterns (elderly, children,
  people with mobility impairments).

- **Overconfident predictions** — 72.8% of errors were made
  with greater than 90% confidence. Probability calibration
  is required before production deployment.

- **Missing activities** — the dataset covers only 6 basic
  activities. Running, cycling, climbing stairs, or complex
  daily activities are not represented.

---

## Intended Use

**Suitable for:**
- Academic benchmarking on UCI HAR
- Learning and understanding deep learning architectures
  for time-series classification
- Baseline comparison for HAR research

**Not suitable for:**
- Medical or clinical activity monitoring without further
  validation on target populations
- Real-time production deployment without probability
  calibration
- Activities beyond the 6 classes in the training data

---

## Ethical Considerations

- The dataset consists of consenting adult volunteers.
- No personally identifiable information is included.
- Subject-independent evaluation ensures the model is not
  simply memorising individual movement signatures.
- Activity recognition systems can be misused for surveillance.
  Deployment in any monitoring context requires informed
  consent from all subjects.

---

## Recommended Model for Deployment

**GRU** — best test accuracy, best generalization gap,
reasonable parameter count (340K), suitable for on-device
inference. Convert to TFLite for mobile deployment:

```python
converter = tf.lite.TFLiteConverter.from_saved_model(
    "artifacts/models/gru_best.keras"
)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open("artifacts/models/gru_final.tflite", "wb") as f:
    f.write(tflite_model)
```

---

## Files

```
artifacts/models/
├── mlp_best.keras
├── cnn_best.keras
├── lstm_best.keras
├── gru_best.keras
└── convgru_best.keras

artifacts/scalers/
└── standard_scaler.pkl     ← must be used at inference time

artifacts/results/
├── model_comparison.csv
├── mlp_results.json
├── cnn_results.json
├── lstm_results.json
├── gru_results.json
└── convgru_results.json
```

---

## Citation

```
Dataset:
Anguita, D., Ghio, A., Oneto, L., Parra, X., & Reyes-Ortiz, J. L. (2013).
A public domain dataset for human activity recognition using smartphones.
ESANN 2013.

DeepConvLSTM Reference:
Ordóñez, F. J., & Roggen, D. (2016).
Deep convolutional and LSTM recurrent neural networks for
multimodal wearable activity recognition.
Sensors, 16(1), 115.
```