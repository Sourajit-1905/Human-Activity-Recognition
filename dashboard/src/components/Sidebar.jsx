import { NAV_ITEMS, MODEL_COLORS, MODEL_ORDER } from '../constants'
import { useHAR } from '../context/HARContext'

function getIcon(name) {
  const icons = {
    home   : "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    chart  : "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    scale  : "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    beaker : "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    check  : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    play   : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  }
  return icons[name] || icons.home
}

export default function Sidebar({ activePage, onNavigate }) {
  const { data, bestModel, helpers } = useHAR()

  const bestTestAcc = data?.test_results?.[bestModel]?.test_accuracy

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-surface
                      border-r border-border flex flex-col z-10
                      overflow-y-auto">

      {/* ── Branding ── */}
      <div className="px-5 py-5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center
                          justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-textprimary font-bold text-sm leading-tight">
              HAR Dashboard
            </p>
            <p className="text-textsecondary text-xs">
              UCI HAR Dataset
            </p>
          </div>
        </div>

        {/* Project completion badge */}
        <div className="flex items-center gap-2 bg-green-400/10
                        border border-green-400/20 rounded-lg px-3 py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400
                          animate-pulse flex-shrink-0" />
          <span className="text-green-400 text-xs font-medium">
            Project Complete
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-muted text-xs uppercase tracking-wider
                      px-2 mb-3 font-medium">
          Navigation
        </p>
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5
                         rounded-lg text-sm font-medium transition-all
                         duration-150 text-left
                         ${isActive
                           ? 'bg-accent text-white shadow-lg shadow-accent/20'
                           : 'text-textsecondary hover:bg-surface2 hover:text-textprimary'
                         }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={2} d={getIcon(item.icon)} />
              </svg>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* ── Model legend ── */}
      <div className="px-4 py-4 border-t border-border flex-shrink-0">
        <p className="text-muted text-xs uppercase tracking-wider
                      mb-3 font-medium">
          Models
        </p>
        <div className="space-y-2">
          {MODEL_ORDER
            .filter(m => data?.test_results?.[m])
            .map(model => {
              const testAcc = data?.test_results?.[model]?.test_accuracy
              return (
                <div key={model}
                     className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                         style={{ backgroundColor: MODEL_COLORS[model] }} />
                    <span className="text-textsecondary text-xs">
                      {model}
                    </span>
                  </div>
                  <span className="text-muted text-xs font-mono">
                    {helpers.formatAccuracy(testAcc)}
                  </span>
                </div>
              )
            })}
        </div>
      </div>

      {/* ── Project metadata ── */}
      <div className="px-4 py-4 border-t border-border flex-shrink-0">
        <div className="space-y-2">
          {[
            { label: "Best Model",  value: bestModel || "—"                          },
            { label: "Test Acc",    value: helpers.formatAccuracy(bestTestAcc)        },
            { label: "Dataset",     value: "UCI HAR"                                  },
            { label: "Subjects",    value: "30 (21 train / 9 test)"                   },
          ].map(({ label, value }) => (
            <div key={label}
                 className="flex items-center justify-between">
              <span className="text-muted text-xs">{label}</span>
              <span className="text-textsecondary text-xs font-mono">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}