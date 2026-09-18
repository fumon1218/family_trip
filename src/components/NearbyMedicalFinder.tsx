import React, { useState, useCallback } from 'react';
import { Cross, Pill, Navigation, RefreshCw, AlertCircle, ExternalLink, Clock } from 'lucide-react';

// Overpass API (OpenStreetMap 기반) - 키 발급 불필요
const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

// 기본 중심점: 오사카 난바역 (위치 접근이 거부되면 이 좌표 기준으로 검색)
const DEFAULT_CENTER = { lat: 34.6687, lng: 135.501 };
const SEARCH_RADIUS_M = 1500; // 병원은 편의점보다 밀도가 낮아 반경을 넓게 설정

interface MedicalPoi {
  id: number;
  lat: number;
  lng: number;
  name: string;
  kind: 'hospital' | 'pharmacy' | 'clinic';
  hasEmergency: boolean;
  openingHours?: string;
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

async function queryOverpassMedical(lat: number, lng: number): Promise<MedicalPoi[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${SEARCH_RADIUS_M},${lat},${lng});
      way["amenity"="hospital"](around:${SEARCH_RADIUS_M},${lat},${lng});
      node["amenity"="clinic"](around:${SEARCH_RADIUS_M},${lat},${lng});
      node["amenity"="pharmacy"](around:${SEARCH_RADIUS_M},${lat},${lng});
    );
    out center;
  `;
  const res = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error(`Overpass API 응답 오류: ${res.status}`);
  const data = await res.json();

  const pois: MedicalPoi[] = (data.elements || [])
    .map((el: any) => {
      const tags = el.tags || {};
      const kind: MedicalPoi['kind'] =
        tags.amenity === 'pharmacy' ? 'pharmacy' : tags.amenity === 'clinic' ? 'clinic' : 'hospital';
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (elLat == null || elLng == null) return null;
      return {
        id: el.id,
        lat: elLat,
        lng: elLng,
        name: tags.name || (kind === 'pharmacy' ? '약국' : kind === 'clinic' ? '클리닉' : '병원'),
        kind,
        hasEmergency: tags.emergency === 'yes',
        openingHours: tags.opening_hours,
        distanceM: Math.round(haversine(lat, lng, elLat, elLng)),
      } as MedicalPoi;
    })
    .filter((p: MedicalPoi | null): p is MedicalPoi => p !== null);

  return pois.sort((a, b) => a.distanceM - b.distanceM);
}

const kindLabel: Record<MedicalPoi['kind'], string> = {
  hospital: '병원',
  clinic: '클리닉',
  pharmacy: '약국',
};

export const NearbyMedicalFinder: React.FC = () => {
  const [pois, setPois] = useState<MedicalPoi[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'hospital' | 'pharmacy'>('all');

  const runSearch = useCallback(async (lat: number, lng: number, label: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await queryOverpassMedical(lat, lng);
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

  const handleUseDefault = () => runSearch(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, '오사카 난바역 (기본 위치)');

  const filteredPois = pois.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'hospital') return p.kind === 'hospital' || p.kind === 'clinic';
    return p.kind === 'pharmacy';
  });
  const hospitalCount = pois.filter((p) => p.kind === 'hospital' || p.kind === 'clinic').length;
  const pharmacyCount = pois.filter((p) => p.kind === 'pharmacy').length;
  const emergencyCount = pois.filter((p) => p.hasEmergency).length;

  return (
    <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
            <Cross className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-800 text-xs">내 주변 병원 · 약국 찾기</span>
              <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                OpenStreetMap 연동
              </span>
            </div>
            {center && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                기준: {center.label} · 반경 {(SEARCH_RADIUS_M / 1000).toFixed(1)}km 내 병원/클리닉{' '}
                {hospitalCount}곳, 약국 {pharmacyCount}곳
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
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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

      {loading && <p className="text-xs text-slate-500">주변 병원·약국을 검색하는 중...</p>}

      {error && (
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {center && !loading && (
        <>
          {emergencyCount > 0 && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900">
              🚨 주변에 <strong>응급실 운영 병원 {emergencyCount}곳</strong>이 확인됩니다. 위급 상황 시 119
              신고 후 가까운 순으로 이동하세요.
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {(['all', 'hospital', 'pharmacy'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                  filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? `전체 ${pois.length}` : f === 'hospital' ? `병원 ${hospitalCount}` : `약국 ${pharmacyCount}`}
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

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filteredPois.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">반경 내 결과가 없습니다.</p>
            ) : (
              filteredPois.slice(0, 20).map((p) => (
                <a
                  key={p.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 text-xs transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        p.kind === 'pharmacy' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {p.kind === 'pharmacy' ? <Pill className="w-3.5 h-3.5" /> : <Cross className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate flex items-center gap-1">
                        {p.name}
                        {p.hasEmergency && (
                          <span className="text-[9px] bg-rose-600 text-white px-1 py-0.5 rounded font-bold shrink-0">
                            응급
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span>{kindLabel[p.kind]}</span>
                        {p.openingHours && (
                          <span className="flex items-center gap-0.5 truncate">
                            <Clock className="w-2.5 h-2.5 shrink-0" /> {p.openingHours}
                          </span>
                        )}
                      </div>
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

          <p className="text-[10px] text-slate-400">
            💡 언어가 통하지 않으면 "병원 어디에 있어요?" 회화 카드(생존 일본어 가이드)를 함께 활용하세요.
          </p>
        </>
      )}
    </div>
  );
};
