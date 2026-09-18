import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchWikipediaSummary, WikiSummary } from '../utils/liveDataService';

interface WikiSummaryPanelProps {
  query: string; // 검색할 명소 이름 (예: selectedSpot.name)
}

export const WikiSummaryPanel: React.FC<WikiSummaryPanelProps> = ({ query }) => {
  const [summary, setSummary] = useState<WikiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setExpanded(false);
    (async () => {
      const result = await fetchWikipediaSummary(query);
      if (!cancelled) {
        setSummary(result);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (loading) {
    return <p className="text-[11px] text-slate-400 py-1">위키백과에서 명소 정보를 찾는 중...</p>;
  }

  if (!summary) return null; // 검색 결과가 없으면 조용히 숨김

  const truncated = summary.extract.length > 140 && !expanded;

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>위키백과: {summary.title}</span>
        </div>
        <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
          Wikipedia 연동
        </span>
      </div>

      <p className="text-slate-600 leading-relaxed">
        {truncated ? `${summary.extract.slice(0, 140)}...` : summary.extract}
      </p>

      <div className="flex items-center gap-3 pt-0.5">
        {summary.extract.length > 140 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
          >
            {expanded ? (
              <>
                접기 <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                더 보기 <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
        <a
          href={summary.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-0.5"
        >
          전체 문서 보기 <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
