import React, { useState } from 'react';
import {
  X,
  Plane,
  Search,
  AlertTriangle,
  Info,
  Star,
  Clock,
  Zap,
  Loader2,
} from 'lucide-react';

interface FlightScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Direction = 'to_osaka' | 'to_korea';
type CarrierType = 'FSC' | 'LCC';

interface FlightItem {
  id: string;
  airline: string;
  flightNo: string;
  aircraft: string;
  carrierType: CarrierType;
  depTime: string;
  depCity: string;
  depCode: string;
  depTerminal: string;
  arrTime: string;
  arrCity: string;
  arrCode: string;
  arrTerminal: string;
  durationMin: number;
  direction: Direction;
  status: string;
}

const FLIGHTS: FlightItem[] = [
  // 인천(ICN) → 오사카 간사이(KIX)
  { id: 'ke723', airline: '대한항공', flightNo: 'KE723', aircraft: 'B777-300ER (광동체 대형기)', carrierType: 'FSC', depTime: '09:00', depCity: '인천', depCode: 'ICN', depTerminal: 'T2', arrTime: '10:45', arrCity: '오사카 간사이', arrCode: 'KIX', arrTerminal: 'T1', durationMin: 105, direction: 'to_osaka', status: '정시 출발 예정' },
  { id: 'oz102', airline: '아시아나항공', flightNo: 'OZ102', aircraft: 'A350-900', carrierType: 'FSC', depTime: '08:30', depCity: '인천', depCode: 'ICN', depTerminal: 'T1', arrTime: '10:20', arrCity: '오사카 간사이', arrCode: 'KIX', arrTerminal: 'T1', durationMin: 110, direction: 'to_osaka', status: '정시 출발 예정' },
  { id: '7c1304', airline: '제주항공', flightNo: '7C1304', aircraft: 'B737-800', carrierType: 'LCC', depTime: '07:20', depCity: '인천', depCode: 'ICN', depTerminal: 'T1', arrTime: '09:05', arrCity: '오사카 간사이', arrCode: 'KIX', arrTerminal: 'T1', durationMin: 105, direction: 'to_osaka', status: '정시 출발 예정' },
  { id: 'lj301', airline: '진에어', flightNo: 'LJ301', aircraft: 'B737-800', carrierType: 'LCC', depTime: '09:50', depCity: '인천', depCode: 'ICN', depTerminal: 'T2', arrTime: '11:35', arrCity: '오사카 간사이', arrCode: 'KIX', arrTerminal: 'T1', durationMin: 105, direction: 'to_osaka', status: '정시 출발 예정' },
  { id: 'tw281', airline: '티웨이항공', flightNo: 'TW281', aircraft: 'A330-300', carrierType: 'LCC', depTime: '08:05', depCity: '인천', depCode: 'ICN', depTerminal: 'T1', arrTime: '09:50', arrCity: '오사카 간사이', arrCode: 'KIX', arrTerminal: 'T1', durationMin: 105, direction: 'to_osaka', status: '정시 출발 예정' },
  { id: 'rs611', airline: '에어서울', flightNo: 'RS611', aircraft: 'A321neo', carrierType: 'LCC', depTime: '10:30', depCity: '인천', depCode: 'ICN', depTerminal: 'T1', arrTime: '12:15', arrCity: '오사카 간사이', arrCode: 'KIX', arrTerminal: 'T1', durationMin: 105, direction: 'to_osaka', status: '정시 출발 예정' },
  { id: 'bx122', airline: '에어부산', flightNo: 'BX122', aircraft: 'A321neo', carrierType: 'LCC', depTime: '11:10', depCity: '부산', depCode: 'PUS', depTerminal: '국제선', arrTime: '12:40', arrCity: '오사카 간사이', arrCode: 'KIX', arrTerminal: 'T1', durationMin: 90, direction: 'to_osaka', status: '정시 출발 예정' },
  { id: '7c1306', airline: '제주항공', flightNo: '7C1306', aircraft: 'B737-800', carrierType: 'LCC', depTime: '09:40', depCity: '부산', depCode: 'PUS', depTerminal: '국제선', arrTime: '11:05', arrCity: '오사카 간사이', arrCode: 'KIX', arrTerminal: 'T1', durationMin: 85, direction: 'to_osaka', status: '정시 출발 예정' },
  { id: 'mm123', airline: '피치항공', flightNo: 'MM123', aircraft: 'A320', carrierType: 'LCC', depTime: '13:20', depCity: '인천', depCode: 'ICN', depTerminal: 'T1', arrTime: '15:05', arrCity: '오사카 간사이', arrCode: 'KIX', arrTerminal: 'T2', durationMin: 105, direction: 'to_osaka', status: '정시 출발 예정' },

  // 오사카 간사이(KIX) → 인천(ICN) 귀국편
  { id: 'ke724', airline: '대한항공', flightNo: 'KE724', aircraft: 'B777-300ER (광동체 대형기)', carrierType: 'FSC', depTime: '11:45', depCity: '오사카 간사이', depCode: 'KIX', depTerminal: 'T1', arrTime: '13:35', arrCity: '인천', arrCode: 'ICN', arrTerminal: 'T2', durationMin: 110, direction: 'to_korea', status: '정시 출발 예정' },
  { id: 'oz103', airline: '아시아나항공', flightNo: 'OZ103', aircraft: 'A350-900', carrierType: 'FSC', depTime: '11:20', depCity: '오사카 간사이', depCode: 'KIX', depTerminal: 'T1', arrTime: '13:05', arrCity: '인천', arrCode: 'ICN', arrTerminal: 'T1', durationMin: 105, direction: 'to_korea', status: '정시 출발 예정' },
  { id: '7c1305', airline: '제주항공', flightNo: '7C1305', aircraft: 'B737-800', carrierType: 'LCC', depTime: '10:05', depCity: '오사카 간사이', depCode: 'KIX', depTerminal: 'T1', arrTime: '11:50', arrCity: '인천', arrCode: 'ICN', arrTerminal: 'T1', durationMin: 105, direction: 'to_korea', status: '정시 출발 예정' },
  { id: 'lj302', airline: '진에어', flightNo: 'LJ302', aircraft: 'B737-800', carrierType: 'LCC', depTime: '12:40', depCity: '오사카 간사이', depCode: 'KIX', depTerminal: 'T1', arrTime: '14:25', arrCity: '인천', arrCode: 'ICN', arrTerminal: 'T2', durationMin: 105, direction: 'to_korea', status: '정시 출발 예정' },
  { id: 'mm124', airline: '피치항공', flightNo: 'MM124', aircraft: 'A320', carrierType: 'LCC', depTime: '16:10', depCity: '오사카 간사이', depCode: 'KIX', depTerminal: 'T2', arrTime: '18:00', arrCity: '인천', arrCode: 'ICN', arrTerminal: 'T1', durationMin: 110, direction: 'to_korea', status: '정시 출발 예정' },
  { id: 'bx121', airline: '에어부산', flightNo: 'BX121', aircraft: 'A321neo', carrierType: 'LCC', depTime: '13:35', depCity: '오사카 간사이', depCode: 'KIX', depTerminal: 'T1', arrTime: '15:20', arrCity: '부산', arrCode: 'PUS', arrTerminal: '국제선', durationMin: 105, direction: 'to_korea', status: '정시 출발 예정' },
];

interface LiveFlightEndpoint {
  airport: string;
  iata: string;
  scheduled: string;
  estimated?: string | null;
  actual?: string | null;
  delay?: number | null;
  terminal?: string | null;
  gate?: string | null;
}

interface LiveFlightData {
  flight_status: string;
  departure: LiveFlightEndpoint;
  arrival: LiveFlightEndpoint;
  airline: { name: string; iata: string };
  flight: { iata: string; number: string };
}

function extractHHMM(iso?: string | null): string | null {
  if (!iso) return null;
  const match = iso.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  scheduled: { label: '예정', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  active: { label: '비행 중', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  landed: { label: '착륙 완료', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  cancelled: { label: '결항', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  incident: { label: '이상 상황', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  diverted: { label: '회항', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

export const FlightScheduleModal: React.FC<FlightScheduleModalProps> = ({ isOpen, onClose }) => {
  const [direction, setDirection] = useState<Direction>('to_osaka');
  const [koreaAirport, setKoreaAirport] = useState<'all' | 'ICN' | 'PUS'>('all');
  const [carrierFilter, setCarrierFilter] = useState<'all' | CarrierType>('all');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [liveQuery, setLiveQuery] = useState('');
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<LiveFlightData[] | null>(null);

  const handleLiveSearch = async () => {
    const flightNo = liveQuery.trim();
    if (!flightNo) return;
    setLiveLoading(true);
    setLiveError(null);
    setLiveResults(null);
    try {
      const res = await fetch(`/api/flight-search?flightNo=${encodeURIComponent(flightNo)}`);
      const json = await res.json();
      if (!res.ok) {
        setLiveError(json.error || '실시간 항공편 정보를 가져오지 못했습니다.');
        return;
      }
      if (!json.flights || json.flights.length === 0) {
        setLiveError(`"${flightNo}" 항공편을 찾을 수 없습니다. 편명을 확인해주세요. (예: KE723)`);
        return;
      }
      setLiveResults(json.flights);
    } catch {
      setLiveError('실시간 항공편 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLiveLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = FLIGHTS.filter((f) => {
    if (f.direction !== direction) return false;
    if (carrierFilter !== 'all' && f.carrierType !== carrierFilter) return false;
    if (koreaAirport !== 'all') {
      const koreaCode = direction === 'to_osaka' ? f.depCode : f.arrCode;
      if (koreaCode !== koreaAirport) return false;
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const hay = `${f.flightNo} ${f.airline}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => a.depTime.localeCompare(b.depTime));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <Plane className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">한·일 항공편 & 비행기 노선</h2>
              <p className="text-xs text-sky-100 leading-relaxed">
                인천·부산 ↔ 오사카 간사이(KIX) 직항 전 항공편 정기 스케줄
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direction Tabs */}
        <div className="flex border-b border-slate-200 shrink-0">
          <button
            onClick={() => setDirection('to_osaka')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              direction === 'to_osaka'
                ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            한국 → 오사카 (KIX)
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">출국편</span>
          </button>
          <button
            onClick={() => setDirection('to_korea')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              direction === 'to_korea'
                ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            오사카 (KIX) → 한국
            <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">귀국편</span>
          </button>
        </div>

        {/* Korea Airport Selector */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">
            {direction === 'to_osaka' ? '출발 공항:' : '도착 공항:'}
          </span>
          {(
            [
              { key: 'all', label: '전체' },
              { key: 'ICN', label: '인천 (ICN)' },
              { key: 'PUS', label: '부산 (PUS)' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setKoreaAirport(opt.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                koreaAirport === opt.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-slate-400">김포(GMP)는 간사이 직항이 없어 제외했습니다</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Live Flight Search (Aviationstack API - requires server-side key) */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black text-indigo-950">실시간 항공편 조회</span>
              <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                Aviationstack 연동
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={liveQuery}
                onChange={(e) => setLiveQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLiveSearch()}
                placeholder="편명 입력 (예: KE723)"
                className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="button"
                onClick={handleLiveSearch}
                disabled={liveLoading || !liveQuery.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {liveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                조회
              </button>
            </div>

            {liveError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                {liveError}
              </div>
            )}

            {liveResults && liveResults.length > 0 && (
              <div className="space-y-2">
                {liveResults.map((f, idx) => {
                  const statusInfo = STATUS_LABEL[f.flight_status] || {
                    label: f.flight_status,
                    color: 'bg-slate-100 text-slate-600 border-slate-200',
                  };
                  const depTime = extractHHMM(f.departure.actual) || extractHHMM(f.departure.estimated) || extractHHMM(f.departure.scheduled);
                  const arrTime = extractHHMM(f.arrival.actual) || extractHHMM(f.arrival.estimated) || extractHHMM(f.arrival.scheduled);
                  return (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900">
                          {f.airline?.name} {f.flight?.iata}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">
                            {depTime || '-'} {f.departure.iata}
                          </div>
                          {typeof f.departure.delay === 'number' && f.departure.delay > 0 && (
                            <div className="text-[10px] text-rose-600 font-bold">{f.departure.delay}분 지연</div>
                          )}
                        </div>
                        <Plane className="w-3.5 h-3.5 text-indigo-400 rotate-90 shrink-0" />
                        <div className="text-right">
                          <div className="font-bold text-slate-800">
                            {arrTime || '-'} {f.arrival.iata}
                          </div>
                          {typeof f.arrival.delay === 'number' && f.arrival.delay > 0 && (
                            <div className="text-[10px] text-rose-600 font-bold">{f.arrival.delay}분 지연</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-[10px] text-indigo-400">
              편명으로 실제 항공사 데이터를 실시간 조회합니다 (아래 목록은 정기 스케줄 참고용입니다).
            </p>
          </div>

          {/* KIX Terminal Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">오사카 간사이공항(KIX) 터미널 구분</strong>
              <p className="mt-0.5">
                대부분의 항공사(대한항공, 아시아나, 제주항공, 진에어, 티웨이 등)는 <strong>제1터미널(T1)</strong>을
                이용합니다. 오직 <strong className="underline">피치항공(MM)만 제2터미널(T2)</strong>을 이용하며,
                라피트/전철 탑승을 위해 무료 셔틀버스로 7분간 이동해야 합니다.
              </p>
            </div>
          </div>

          {/* ICN Terminal Notice */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-950">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed space-y-0.5">
              <strong className="font-bold">인천공항(ICN) 터미널 구분 꿀팁</strong>
              <p>
                <strong>제2여객터미널 (T2):</strong> 대한항공, 진에어
              </p>
              <p>
                <strong>제1여객터미널 (T1):</strong> 아시아나, 제주항공, 티웨이, 에어서울, 에어부산, 피치항공
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="항공편명(KE723, 7C1304 등), 항공사 검색..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Carrier Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { key: 'all', label: '전체 항공사' },
                { key: 'FSC', label: '대한/아시아나 (FSC)' },
                { key: 'LCC', label: '저비용항공 (LCC)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setCarrierFilter(opt.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  carrierFilter === opt.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-slate-400 font-medium">조회 결과: {filtered.length}편</span>
          </div>

          {/* Flight List */}
          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">검색 결과가 없습니다.</p>
            ) : (
              filtered.map((f) => (
                <div key={f.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">{f.airline}</span>
                      <span className="text-[11px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                        {f.flightNo}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleFavorite(f.id)}
                      className="p-1 text-slate-300 hover:text-amber-400 cursor-pointer shrink-0"
                    >
                      <Star className={`w-4 h-4 ${favorites.has(f.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{f.aircraft}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        f.carrierType === 'FSC' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {f.carrierType === 'FSC' ? '대형항공사(FSC)' : '저비용항공사(LCC)'}
                    </span>
                    <span className="ml-auto bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      {f.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-lg font-black text-slate-900">{f.depTime}</div>
                      <div className="text-xs font-bold text-slate-700">{f.depCity} ({f.depCode})</div>
                      <div className="text-[10px] text-slate-400">{f.depTerminal}</div>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" /> {formatDuration(f.durationMin)}
                      </span>
                      <div className="w-full h-px bg-slate-200 relative flex items-center justify-center">
                        <Plane className="w-3.5 h-3.5 text-blue-500 bg-white rotate-90" />
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">{f.arrTime}</div>
                      <div className="text-xs font-bold text-slate-700">{f.arrCity} ({f.arrCode})</div>
                      <div className="text-[10px] text-slate-400">{f.arrTerminal}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-[10px] text-slate-400 text-center pt-1">
            정기 운항 스케줄 기준이며, 실제 지연·결항 여부는 탑승 항공사 공식 앱/홈페이지에서 확인해주세요.
          </p>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">KST/JST 기준 정기 스케줄</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
