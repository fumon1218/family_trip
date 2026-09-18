import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, ShieldAlert, Waves, RefreshCw, Activity, ExternalLink } from 'lucide-react';

// P2PQuake (https://www.p2pquake.net/) 공개 API - 키 발급 불필요, 일본 전역 지진/쓰나미 정보 무료 제공
const P2PQUAKE_ENDPOINT = 'https://api.p2pquake.net/v2/history?codes=551&limit=30';

// 오사카/간사이권으로 간주할 지진 발생 지역 키워드 (points[].pref 또는 hypocenter.name 매칭용)
const KANSAI_PREFS = ['大阪府', '京都府', '兵庫県', '奈良県', '和歌山県', '滋賀県'];

interface QuakePoint {
  pref: string;
  addr?: string;
  scale: number; // 10=진도1 ... 70=진도7 (10배수)
}

interface QuakeRecord {
  code: number;
  time: string; // "2024/01/01 16:10:00.0"
  earthquake?: {
    time: string;
    hypocenter?: { name: string; depth?: number; magnitude?: number };
    maxScale?: number;
    domesticTsunami?: 'None' | 'Unknown' | 'Checking' | 'NonEffective' | 'Watch' | 'Warning';
  };
  points?: QuakePoint[];
}

interface OsakaQuakeStatus {
  hasRecentActivity: boolean;
  osakaScale: number | null; // 오사카부 진도 (10배수), 없으면 null
  hypocenterName: string;
  magnitude: number | null;
  quakeTime: string;
  tsunami: string | null;
  minutesAgo: number;
}

// P2PQuake의 10배수 스케일 -> 한국식 "진도 N (약/강)" 표기로 변환
function formatShindo(scale: number): string {
  const map: Record<number, string> = {
    10: '진도 1',
    20: '진도 2',
    30: '진도 3',
    40: '진도 4',
    45: '진도 5약',
    50: '진도 5강',
    55: '진도 6약',
    60: '진도 6강',
    70: '진도 7',
  };
  return map[scale] || `진도 ${(scale / 10).toFixed(0)}`;
}

function tsunamiLabel(v?: string | null): string | null {
  if (!v || v === 'None' || v === 'Unknown' || v === 'NonEffective') return null;
  if (v === 'Warning') return '🌊 쓰나미 주의보/경보 발령 중';
  if (v === 'Watch') return '🌊 쓰나미 주의 정보 발령 중';
  if (v === 'Checking') return '🌊 쓰나미 영향 확인 중';
  return null;
}

async function fetchLatestOsakaQuake(): Promise<OsakaQuakeStatus> {
  const res = await fetch(P2PQUAKE_ENDPOINT);
  if (!res.ok) throw new Error(`P2PQuake API 응답 오류: ${res.status}`);
  const records: QuakeRecord[] = await res.json();

  // 최근 24시간 이내 & points 중 간사이권이 포함된 가장 최근 기록 탐색
  const now = Date.now();
  const relevant = records.find((r) => {
    if (!r.earthquake) return false;
    const t = new Date(r.earthquake.time.replace(/\//g, '-')).getTime();
    if (Number.isNaN(t) || now - t > 24 * 60 * 60 * 1000) return false;
    return (r.points || []).some((p) => KANSAI_PREFS.includes(p.pref));
  });

  if (!relevant || !relevant.earthquake) {
    return {
      hasRecentActivity: false,
      osakaScale: null,
      hypocenterName: '',
      magnitude: null,
      quakeTime: '',
      tsunami: null,
      minutesAgo: 0,
    };
  }

  const osakaPoint = (relevant.points || []).find((p) => p.pref === '大阪府');
  const quakeTimeMs = new Date(relevant.earthquake.time.replace(/\//g, '-')).getTime();

  return {
    hasRecentActivity: true,
    osakaScale: osakaPoint?.scale ?? null,
    hypocenterName: relevant.earthquake.hypocenter?.name || '알 수 없음',
    magnitude: relevant.earthquake.hypocenter?.magnitude ?? null,
    quakeTime: relevant.earthquake.time,
    tsunami: tsunamiLabel(relevant.earthquake.domesticTsunami),
    minutesAgo: Math.max(0, Math.round((now - quakeTimeMs) / 60000)),
  };
}

export const EarthquakeAlertBanner: React.FC = () => {
  const [status, setStatus] = useState<OsakaQuakeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchLatestOsakaQuake();
      setStatus(result);
      setLastChecked(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // 2분 간격 자동 갱신 (P2PQuake는 별도 rate limit 명시가 없으나 과도한 폴링은 지양)
    const interval = setInterval(refresh, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const isAlert = status?.hasRecentActivity && (status.osakaScale ?? 0) >= 30; // 진도3 이상만 경고 톤
  const hasTsunami = !!status?.tsunami;

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 shadow-xs mb-4 transition-colors ${
        hasTsunami
          ? 'bg-rose-50 border-rose-300'
          : isAlert
          ? 'bg-amber-50 border-amber-300'
          : 'bg-emerald-50 border-emerald-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs text-white ${
              hasTsunami ? 'bg-rose-600' : isAlert ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          >
            {hasTsunami ? (
              <Waves className="w-5 h-5" />
            ) : isAlert ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900">지진·쓰나미 실시간 안전 정보</span>
              <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                <Activity className="w-2.5 h-2.5" />
                P2PQuake 실시간 연동
              </span>
              {lastChecked && (
                <span className="text-[10px] text-slate-400">확인: {lastChecked}</span>
              )}
            </div>

            {loading && !status ? (
              <p className="text-xs text-slate-500 mt-1">간사이 지역 지진 정보를 확인하는 중...</p>
            ) : error ? (
              <p className="text-xs text-rose-600 mt-1">
                실시간 지진 정보를 불러오지 못했습니다. 새로고침을 눌러 다시 시도해주세요. (일본 기상청 긴급속보는 현지
                스마트폰에도 자동 수신됩니다)
              </p>
            ) : status?.hasRecentActivity ? (
              <div className="text-xs text-slate-700 mt-1 leading-relaxed max-w-xl">
                <span className="font-extrabold text-slate-900">
                  {status.minutesAgo}분 전, {status.hypocenterName}
                </span>
                에서 지진(규모 {status.magnitude ?? '-'})이 발생했습니다.
                {status.osakaScale !== null ? (
                  <>
                    {' '}
                    오사카부 관측 진도:{' '}
                    <span className="font-extrabold">{formatShindo(status.osakaScale)}</span>
                  </>
                ) : (
                  ' (오사카부는 별도 진도 관측 없음 - 체감 없었을 가능성이 높습니다)'
                )}
                {status.tsunami && (
                  <div className="mt-1.5 font-extrabold text-rose-700">{status.tsunami}</div>
                )}
              </div>
            ) : (
              <p className="text-xs text-emerald-800 mt-1 font-semibold">
                ✅ 최근 24시간 내 간사이 지역(오사카·교토·효고·나라) 지진 감지 없음 — 안전합니다.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="p-1.5 rounded-xl border border-slate-200 bg-white/70 hover:bg-white text-slate-600 cursor-pointer disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a
            href="https://www.jma.go.jp/bosai/map.html#5/34.686/135.519/&elem=int&contents=earthquake_map"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-white/70 hover:bg-white border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            기상청 지도
          </a>
        </div>
      </div>

      {isAlert && !hasTsunami && (
        <div className="mt-2.5 pt-2.5 border-t border-amber-200 text-[11px] text-amber-900">
          💡 진도 3 이상은 대부분 안전하며 인명 피해 사례가 드뭅니다. 흔들림이 느껴지면 문을 열어 출구를 확보하고,
          떨어지는 물건에 주의하며 가족들과 함께 대기해주세요.
        </div>
      )}
    </div>
  );
};
