import React, { useState, useEffect, useCallback } from 'react';
import { Clock, RefreshCw, AlertCircle, Ban, Timer, TrendingDown, TrendingUp } from 'lucide-react';

// USJ 실시간 대기시간은 server.ts의 /api/usj-wait-times 프록시를 거칩니다
// (Queue-Times.com이 브라우저 직접 호출 시 CORS를 차단하기 때문에 서버 경유가 필요합니다)
const QUEUE_TIMES_ENDPOINT = '/api/usj-wait-times';

interface QueueRide {
  id: number;
  name: string;
  is_open: boolean;
  wait_time: number; // minutes
  last_updated: string;
}

interface QueueLand {
  id: number;
  name: string;
  rides: QueueRide[];
}

interface QueueTimesResponse {
  lands: QueueLand[];
  rides: QueueRide[]; // ungrouped rides, if any
}

function waitColor(min: number, open: boolean): string {
  if (!open) return 'bg-slate-100 text-slate-500 border-slate-200';
  if (min >= 90) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (min >= 45) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (min >= 20) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

export const UsjWaitTimesPanel: React.FC = () => {
  const [rides, setRides] = useState<QueueRide[]>([]);
  const [landOf, setLandOf] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastFetched, setLastFetched] = useState<string>('');
  const [showAll, setShowAll] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(QUEUE_TIMES_ENDPOINT);
      if (!res.ok) throw new Error(`Queue-Times API 응답 오류: ${res.status}`);
      const data: QueueTimesResponse = await res.json();

      const flat: QueueRide[] = [];
      const landMap: Record<number, string> = {};
      (data.lands || []).forEach((land) => {
        (land.rides || []).forEach((r) => {
          flat.push(r);
          landMap[r.id] = land.name;
        });
      });
      (data.rides || []).forEach((r) => flat.push(r));

      // 대기시간 긴 순 정렬 (운휴는 뒤로)
      flat.sort((a, b) => {
        if (a.is_open !== b.is_open) return a.is_open ? -1 : 1;
        return b.wait_time - a.wait_time;
      });

      setRides(flat);
      setLandOf(landMap);
      setLastFetched(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // 3분마다 자동 갱신 (원본 데이터는 약 5분 간격 갱신)
    const interval = setInterval(refresh, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const openRides = rides.filter((r) => r.is_open);
  const avgWait =
    openRides.length > 0
      ? Math.round(openRides.reduce((sum, r) => sum + r.wait_time, 0) / openRides.length)
      : null;
  const visibleRides = showAll ? rides : rides.slice(0, 8);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs mb-3">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0">
            <Timer className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900">USJ 실시간 대기시간</span>
              <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                Queue-Times.com 연동
              </span>
            </div>
            {avgWait !== null && !loading && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                현재 운영 중 {openRides.length}개 어트랙션 평균 대기{' '}
                <span className="font-bold text-slate-800">{avgWait}분</span>
                {lastFetched && ` · 확인 ${lastFetched}`}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer disabled:opacity-50"
          title="새로고침"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && rides.length === 0 ? (
        <p className="text-xs text-slate-500 py-2">실시간 대기시간을 불러오는 중...</p>
      ) : error ? (
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            실시간 대기시간을 불러오지 못했습니다. 파크 내 전광판 또는 공식 USJ 앱에서 확인해주세요.
            새로고침을 눌러 다시 시도할 수 있습니다.
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {visibleRides.map((r) => (
              <div
                key={r.id}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs ${waitColor(
                  r.wait_time,
                  r.is_open
                )}`}
              >
                <div className="min-w-0">
                  <div className="font-bold truncate">{r.name}</div>
                  <div className="text-[10px] opacity-70 truncate">{landOf[r.id] || ''}</div>
                </div>
                {r.is_open ? (
                  <span className="shrink-0 font-black flex items-center gap-1">
                    {r.wait_time >= 45 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {r.wait_time}분
                  </span>
                ) : (
                  <span className="shrink-0 font-bold flex items-center gap-1 text-[10px]">
                    <Ban className="w-3 h-3" /> 운휴
                  </span>
                )}
              </div>
            ))}
          </div>

          {rides.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              {showAll ? '접기 ▲' : `전체 ${rides.length}개 어트랙션 보기 ▼`}
            </button>
          )}

          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>대기시간은 5분 간격으로 갱신되며 실제와 오차가 있을 수 있습니다.</span>
          </div>
        </>
      )}
    </div>
  );
};
