import './styles/global.css'

function App() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-center space-y-4">

        {/* Project badge */}
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium
                        bg-accent/10 text-accent border border-accent/20">
          DEEP LEARNING PROJECT
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-textprimary">
          HAR Activity Recognition
        </h1>
        <h2 className="text-xl font-medium text-accent">
          Dashboard
        </h2>

        {/* Status */}
        <p className="text-textsecondary text-sm">
          Stage D1 complete — environment ready
        </p>

        {/* Quick stats */}
        <div className="flex gap-4 justify-center mt-6">
          {[
            { label: "Models", value: "5" },
            { label: "Dataset", value: "UCI HAR" },
            { label: "Best Accuracy", value: "95.76%" },
          ].map(({ label, value }) => (
            <div key={label}
                 className="bg-surface border border-border rounded-lg px-4 py-3 text-center">
              <p className="text-textprimary font-bold text-lg">{value}</p>
              <p className="text-textsecondary text-xs">{label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App