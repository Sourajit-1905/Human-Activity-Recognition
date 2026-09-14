import { useHAR } from "./context/HARContext";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import DataExploration from "./pages/DataExploration";
import ModelComparison from "./pages/ModelComparison";
import ExperimentTracker from "./pages/ExperimentTracker";
import Evaluation from "./pages/Evaluation";
import LiveDemo from "./pages/LiveDemo";
import { NAV_ITEMS } from "./constants";
import PageWrapper from "./components/PageWrapper";
import { useState, useEffect } from 'react'

const PAGES = {
  overview: Overview,
  data: DataExploration,
  comparison: ModelComparison,
  experiments: ExperimentTracker,
  evaluation: Evaluation,
  demo: LiveDemo,
};

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-center space-y-4">
        <div
          className="w-10 h-10 border-2 border-accent border-t-transparent
                        rounded-full animate-spin mx-auto"
        />
        <p className="text-textsecondary text-sm">Loading results...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-8">
      <div
        className="bg-surface border border-red-400/20 rounded-xl
                      p-8 max-w-md text-center space-y-3"
      >
        <div
          className="w-12 h-12 bg-red-400/10 rounded-full flex items-center
                        justify-center mx-auto"
        >
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                     1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34
                     16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-red-400 font-bold">Data Error</p>
        <p className="text-textsecondary text-sm">{message}</p>
        <p className="text-muted text-xs">
          Check that results.json exists in src/data/
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const { isLoading, error, bestModel, helpers, data } = useHAR();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  const ActivePage = PAGES[activePage] || Overview;
  const activeNav = NAV_ITEMS.find((n) => n.id === activePage);

  
  return (
    <div className="min-h-screen bg-navy flex">
      {/* ── Sidebar ── */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* ── Main content ── */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header bar */}
        <header
          className="sticky top-0 z-10 bg-navy/80 backdrop-blur-sm
                           border-b border-border px-8 py-4
                           flex items-center justify-between"
        >
          {/* Page title */}
          <div>
            <p
              className="text-textsecondary text-xs uppercase
                          tracking-wider mb-0.5"
            >
              HAR Activity Recognition
            </p>
            <h1 className="text-textprimary font-bold text-lg">
              {activeNav?.label || "Dashboard"}
            </h1>
          </div>

          {/* Best model pill */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 bg-surface
                            border border-border rounded-full
                            px-4 py-2"
            >
              <div
                className="w-2 h-2 rounded-full bg-green-400
                              animate-pulse"
              />
              <span className="text-textsecondary text-xs">Best Model</span>
              <span className="text-textprimary text-xs font-bold">
                {bestModel}
              </span>
              <span className="text-green-400 text-xs font-mono">
                {helpers.formatAccuracy(
                  data?.test_results?.[bestModel]?.test_accuracy,
                )}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">
          <PageWrapper pageKey={activePage}>
            <ActivePage />
          </PageWrapper>
        </main>

        {/* Footer */}
        {/* Footer */}
        <footer
          className="border-t border-border px-8 py-4
                   flex items-center justify-between flex-shrink-0"
        >
          <p className="text-muted text-xs">
            HAR Activity Recognition — UCI HAR Dataset
          </p>
          <div className="flex items-center gap-4">
            <p className="text-muted text-xs">
              5 Models · 10,299 Samples · 6 Activities
            </p>
            <p className="text-muted text-xs">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
