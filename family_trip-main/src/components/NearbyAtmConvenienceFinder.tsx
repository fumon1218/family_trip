import React, { useState, useCallback } from 'react';
import { MapPin, Landmark, Store, RefreshCw, Navigation, AlertCircle, ExternalLink } from 'lucide-react';

// Overpass API (OpenStreetMap 기반) - 키 발급 불필요, 전 세계 POI 데이터 무료 제공
const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

// 기본 중심점: 오사카 난바역 (사용자 위치 접근이 거부되면 이 좌표 기준으로 검색)
const DEFAULT_CENTER = { lat: 34.6687, lng: 135.501 };
const SEARCH_RADIUS_M = 800;

interface Poi {
  id: number;
  lat: number;
  lng: number;
  name: string;
  kind: 'atm' | 'convenience';
  brand: string; // 로손/세븐일레븐/패밀리마트/기타
  distanceM: number;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classifyBrand(tags: Record<string, string>): string {
  const raw = `${tags.brand || ''} ${tags.name || ''} ${tags.operator || ''}`.toLowerCase();
  if (raw.includes('seven') || raw.includes('セブン') || raw.includes('7-eleven') || raw.includes('7bank') || raw.includes('セブン銀行'))
    return '세븐일레븐/세븐은행';
  if (raw.includes('lawson') || raw.includes('ローソン')) return '로손';
  if (raw.includes('family') || raw.includes('ファミリーマート')) return '패밀리마트';
  if (raw.includes('circle k') || raw.includes('daily yamazaki') || raw.includes('ministop')) return '기타 편의점';
  return tags.name || '이름 미상';
}

async function queryOverpass(lat: number, lng: number): Promise<Poi[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="atm"](around:${SEARCH_RADIUS_M},${lat},${lng});
      node["shop"="convenience"](around:${SEARCH_RADIUS_M},${lat},${lng});
    );
    out body;
  `;
  const res = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error(`Overpass API 응답 오류: ${res.status}`);
  const data = await res.json();

  const pois: Poi[] = (data.elements || []).map((el: any) => {
    const tags = el.tags || {};
    const kind: Poi['kind'] = tags.amenity === 'atm' ? 'atm' : 'convenience';
    return {
      id: el.id,
      lat: el.lat,
      lng: el.lon,
      name: tags.name || (kind === 'atm' ? 'ATM' : '편의점'),
      kind,
      brand: classifyBrand(tags),
      distanceM: Math.round(haversine(lat, lng, el.lat, el.lon)),
    };
  });

  return pois.sort((a, b) => a.distanceM - b.distanceM);
}

const brandBadgeColor: Record<string, string> = {
  '세븐일레븐/세븐은행': 'bg-green-100 text-green-800 border-green-300',
  로손: 'bg-blue-100 text-blue-800 border-blue-300',
  패밀리마트: 'bg-cyan-100 text-cyan-800 border-cyan-300',
};

export const NearbyAtmConvenienceFinder: React.FC = () => {
  const [pois, setPois] = useState<Poi[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'atm' | 'convenience'>('all');

  const runSearch = useCallback(async (lat: number, lng: number, label: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await queryOverpass(lat, lng);
      setPois(results);
      setCenter({ lat, lng, label });
    } catch (e) {
      setError('주변 검색에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUseMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('이 브라우저는 위치 정보를 지원하지 않습니다. 난바역 기준으로 검색합니다.');
      runSearch(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, '오사카 난바역 (기본 위치)');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => runSearch(pos.coords.latitude, pos.coords.longitude, '현재 내 위치'),
      () => {
        setError('위치 접근이 거부되었습니다. 난바역 기준으로 검색합니다.');
        runSearch(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, '오사카 난바역 (기본 위치)');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleUseDefault = () => {
    runSearch(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, '오사카 난바역 (기본 위치)');
  };

  const filteredPois = pois.filter((p) => filter === 'all' || p.kind === filter);
  const atmOnly = pois.filter((p) => p.kind === 'atm');
  const seven7Bank = atmOnly.filter((p) => p.brand.includes('세븐'));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900">내 주변 ATM · 편의점 실시간 찾기</span>
              <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                OpenStreetMap 연동
              </span>
            </div>
            {center && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                기준 위치: {center.label} · 반경 {SEARCH_RADIUS_M}m 내 {pois.length}곳 발견
              </p>
            )}
          </div>
        </div>
      </div>

      {!center && !loading && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            내 현재 위치로 찾기
          </button>
          <button
            type="button"
            onClick={handleUseDefault}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            난바역 기준으로 보기
          </button>
        </div>
      )}

      {loading && <p className="text-xs text-slate-500 py-1.5">주변 ATM·편의점을 검색하는 중...</p>}

      {error && (
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {center && !loading && (
        <>
          {seven7Bank.length > 0 && (
            <div className="p-2.5 bg-green-50 border border-green-200 rounded-xl text-[11px] text-green-900">
              💡 트래블로그/트래블월렛 등 수수료 0원 카드는 <strong>세븐은행(セブン銀行) ATM</strong>에서만 무료
              출금되는 경우가 많습니다. 주변에{' '}
              <strong>세븐일레븐 계열 {seven7Bank.length}곳</strong>이 있습니다.
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {(['all', 'atm', 'convenience'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  filter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? `전체 ${pois.length}` : f === 'atm' ? `ATM ${atmOnly.length}` : `편의점 ${pois.length - atmOnly.length}`}
              </button>
            ))}
            <button
              type="button"
              onClick={() => center && runSearch(center.lat, center.lng, center.label)}
              className="ml-auto p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filteredPois.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">반경 내 결과가 없습니다.</p>
            ) : (
              filteredPois.slice(0, 20).map((p) => (
                <a
                  key={p.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-xs transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        p.kind === 'atm' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {p.kind === 'atm' ? <Landmark className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{p.name}</div>
                      <span
                        className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                          brandBadgeColor[p.brand] || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {p.brand}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-slate-500 font-bold">
                    <span>{p.distanceM}m</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={handleUseMyLocation}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            📍 내 현재 위치로 다시 검색
          </button>
        </>
      )}
    </div>
  );
};
