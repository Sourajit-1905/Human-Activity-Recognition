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
import { useState, useEffect } from "react";

const PAGES = {
  overview   : Overview,
  data       : DataExploration,
  comparison : ModelComparison,
  experiments: ExperimentTracker,
  evaluation : Evaluation,
  demo       : LiveDemo,
};

const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-textsecondary text-sm">Loading results...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-8">
      <div className="bg-surface border border-red-400/20 rounded-xl p-8 max-w-md text-center space-y-3">
        <div className="w-12 h-12 bg-red-400/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-400 font-bold">Data Error</p>
        <p className="text-textsecondary text-sm">{message}</p>
        <p className="text-muted text-xs">Check that results.json exists in src/data/</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const { isLoading, error, bestModel, helpers, data } = useHAR();

  useEffect(() => {
    const pageIds = NAV_ITEMS.map((n) => n.id);
    function handleKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setActivePage((prev) => {
          const idx = pageIds.indexOf(prev);
          return pageIds[(idx + 1) % pageIds.length];
        });
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setActivePage((prev) => {
          const idx = pageIds.indexOf(prev);
          return pageIds[(idx - 1 + pageIds.length) % pageIds.length];
        });
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  const ActivePage = PAGES[activePage] || Overview;
  const activeNav = NAV_ITEMS.find((n) => n.id === activePage);

  return (
    <div className="min-h-screen bg-navy flex">

      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-navy/80 backdrop-blur-sm border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-textsecondary text-xs uppercase tracking-wider mb-0.5">
              HAR Activity Recognition
            </p>
            <h1 className="text-textprimary font-bold text-lg">
              {activeNav?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-textsecondary text-xs">Best Model</span>
              <span className="text-textprimary text-xs font-bold">{bestModel}</span>
              <span className="text-green-400 text-xs font-mono">
                {helpers.formatAccuracy(data?.test_results?.[bestModel]?.test_accuracy)}
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
        <footer className="border-t border-border px-8 py-4 flex items-center justify-between flex-shrink-0">
          <p className="text-muted text-xs">
            HAR Activity Recognition — UCI HAR Dataset
          </p>
          <div className="flex items-center gap-6">
            <p className="text-muted text-xs">
              5 Models · 10,299 Samples · 6 Activities
            </p>
            <p className="text-muted text-xs">
              {new Date().toLocaleDateString("en-GB", {
                day  : "numeric",
                month: "short",
                year : "numeric",
              })}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Sourajit-1905/Human-Activity-Recognition"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-textprimary transition-colors duration-150"
                title="GitHub"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/sourajit-paul-347351322/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-textprimary transition-colors duration-150"
                title="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}