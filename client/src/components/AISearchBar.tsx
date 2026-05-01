import { useState, useRef, useEffect } from "react";
import { Sparkles, Search, BookOpen, Video, FileText, GraduationCap, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function AISearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching, isError } = trpc.search.query.useQuery(
    { q: debouncedQ },
    { enabled: debouncedQ.trim().length >= 2, retry: 1 }
  );

  const hasResults =
    data &&
    (data.courses.length + data.lessons.length + data.webinars.length + data.guides.length) > 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(path: string) {
    setOpen(false);
    setQuery("");
    navigate(path);
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
        style={{
          background: "#1a1a1a",
          border: open ? "1px solid #0074F4" : "1px solid #2a2a2a",
        }}
      >
        <Sparkles size={13} style={{ color: "#0074F4", flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search Academy, Webinars, Guides..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none min-w-0"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button onClick={() => { setQuery(""); setDebouncedQ(""); }} className="text-gray-500 hover:text-white">
            <X size={13} />
          </button>
        )}
        {isFetching && (
          <div className="w-3 h-3 border border-[#0074F4] border-t-transparent rounded-full animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Dropdown */}
      {open && query.trim().length >= 2 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50 shadow-2xl"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", maxHeight: "420px", overflowY: "auto" }}
        >
          {isError && (
            <div className="px-4 py-6 text-center text-sm text-red-400">
              Search unavailable. Please try again.
            </div>
          )}
          {!isError && !hasResults && !isFetching && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No results found for <span className="text-white">"{query}"</span>
            </div>
          )}

          {data?.courses && data.courses.length > 0 && (
            <ResultSection title="Courses" icon={<GraduationCap size={12} />}>
              {data.courses.map((c) => (
                <ResultItem
                  key={c.id}
                  label={c.title}
                  sub={c.category ?? ""}
                  onClick={() => handleSelect(`/academy/${c.id}`)}
                />
              ))}
            </ResultSection>
          )}

          {data?.lessons && data.lessons.length > 0 && (
            <ResultSection title="Lessons" icon={<BookOpen size={12} />}>
              {data.lessons.map((l) => (
                <ResultItem
                  key={l.id}
                  label={l.title}
                  sub={l.description?.slice(0, 60) ?? ""}
                  onClick={() => handleSelect(`/academy/${l.courseId}/lesson/${l.id}`)}
                />
              ))}
            </ResultSection>
          )}

          {data?.webinars && data.webinars.length > 0 && (
            <ResultSection title="Webinars" icon={<Video size={12} />}>
              {data.webinars.map((w) => (
                <ResultItem
                  key={w.id}
                  label={w.title}
                  sub={w.type === "upcoming" ? "Upcoming" : "Recording"}
                  onClick={() => handleSelect("/webinars")}
                />
              ))}
            </ResultSection>
          )}

          {data?.guides && data.guides.length > 0 && (
            <ResultSection title="Guides & Docs" icon={<FileText size={12} />}>
              {data.guides.map((g) => (
                <ResultItem
                  key={g.id}
                  label={g.title}
                  sub={g.category ?? ""}
                  onClick={() => handleSelect("/guides")}
                />
              ))}
            </ResultSection>
          )}

          <div className="px-3 py-2 border-t border-[#2a2a2a] flex items-center gap-1.5">
            <Sparkles size={10} style={{ color: "#0074F4" }} />
            <span className="text-xs text-gray-600">AI-powered search</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#222]">
        <span className="text-gray-500">{icon}</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ResultItem({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors"
    >
      <p className="text-sm text-white font-medium truncate">{label}</p>
      {sub && <p className="text-xs text-gray-500 truncate mt-0.5">{sub}</p>}
    </button>
  );
}
