import React, { useState, useEffect } from 'react';
import { Flag, AlertCircle } from 'lucide-react';

interface TravelAlertData {
  country: string;
  alarmLevel: string | null;
  fetchedAt: string;
}

// alarm_lvl 코드가 숫자/문자 어느 쪽으로 와도 대응
function levelStyle(level: string | null): { label: string; color: string } {
  if (!level) return { label: '특별 경보 없음', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  const text = String(level);
  if (text.includes('4') || text.includes('흑색') || text.includes('여행금지'))
    return { label: text, color: 'bg-slate-900 text-white border-slate-900' };
  if (text.includes('3') || text.includes('적색'))
    return { label: text, color: 'bg-rose-50 text-rose-800 border-rose-300' };
  if (text.includes('2') || text.includes('황색'))
    return { label: text, color: 'bg-amber-50 text-amber-800 border-amber-300' };
  if (text.includes('1') || text.includes('남색'))
    return { label: text, color: 'bg-blue-50 text-blue-800 border-blue-300' };
  return { label: text, color: 'bg-slate-50 text-slate-700 border-slate-200' };
}

// 이 배너는 server.ts의 /api/travel-alert 프록시가 있어야 동작합니다 (정적 호스팅에서는 표시되지 않음).
export const TravelAlertBanner: React.FC = () => {
  const [data, setData] = useState<TravelAlertData | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/travel-alert');
        if (!res.ok) {
          if (!cancelled) setUnavailable(true);
          return;
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 서버 프록시가 없거나(정적 호스팅) 키/엔드포인트 미설정이면 조용히 숨김
  if (loading || unavailable || !data) return null;

  const style = levelStyle(data.alarmLevel);

  return (
    <div className={`mb-4 p-3 rounded-2xl border flex items-start gap-2.5 text-xs ${style.color}`}>
      <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
        <Flag className="w-4 h-4" />
      </div>
      <div>
        <span className="font-black">외교부 해외안전여행 · 일본 여행경보: {style.label}</span>
        <p className="mt-0.5 opacity-90 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          최신 안전공지는 외교부 해외안전여행 홈페이지(0404.go.kr)에서도 확인하세요.
        </p>
      </div>
    </div>
  );
};
