import { useHAR } from '../context/HARContext'
import { MODEL_DESCRIPTIONS, MODEL_ARCHITECTURES } from '../constants'

export default function ArchitectureCard({ modelName, isWinner = false }) {
  const { data, helpers } = useHAR()

  const testResult = data?.test_results?.[modelName]
  const valResult  = data?.model_comparison?.find(m => m.Model === modelName)

  if (!testResult || !valResult) return null

  const color = helpers.getModelColor(modelName)
  const gap   = testResult.generalization_gap

  return (
    <div className={`bg-surface border rounded-xl p-5 relative
                     overflow-hidden transition-all duration-200
                     hover:border-opacity-80
                     ${isWinner
                       ? 'border-accent shadow-lg shadow-accent/10'
                       : 'border-border'
                     }`}>

      {/* Winner badge */}
      {isWinner && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full
                        text-xs font-medium bg-accent/20 text-accent
                        border border-accent/30">
          Best Model
        </div>
      )}

      {/* Model name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center
                        justify-center flex-shrink-0"
             style={{ backgroundColor: `${color}20` }}>
          <div className="w-4 h-4 rounded-full"
               style={{ backgroundColor: color }} />
        </div>
        <div>
          <p className="text-textprimary font-bold">{modelName}</p>
          <p className="text-textsecondary text-xs">
            {MODEL_DESCRIPTIONS[modelName]}
          </p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          {
            label: "Val Accuracy",
            value: helpers.formatAccuracy(valResult["Val Accuracy"]),
            color: helpers.getAccuracyColor(valResult["Val Accuracy"]),
          },
          {
            label: "Test Accuracy",
            value: helpers.formatAccuracy(testResult.test_accuracy),
            color: helpers.getAccuracyColor(testResult.test_accuracy),
          },
          {
            label: "Parameters",
            value: helpers.formatParams(valResult.Parameters),
            color: "text-textprimary",
          },
          {
            label: "Train Time",
            value: helpers.formatTime(valResult["Train Time(s)"]),
            color: "text-textprimary",
          },
        ].map(({ label, value, color: c }) => (
          <div key={label}
               className="bg-navy rounded-lg px-3 py-2">
            <p className="text-muted text-xs mb-1">{label}</p>
            <p className={`font-bold text-sm font-mono ${c}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Generalization gap */}
      <div className={`rounded-lg px-3 py-2 ${helpers.getGapBg(gap)}`}>
        <div className="flex items-center justify-between">
          <p className="text-textsecondary text-xs">Generalization Gap</p>
          <p className={`text-sm font-bold font-mono
                         ${helpers.getGapSeverity(gap)}`}>
            {helpers.formatGap(gap)}
          </p>
        </div>
      </div>

      {/* Architecture string */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-muted text-xs font-mono leading-relaxed">
          {MODEL_ARCHITECTURES[modelName]}
        </p>
      </div>

    </div>
  )
}