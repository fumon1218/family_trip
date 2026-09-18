import React, { useState } from 'react';
import {
  MapPin,
  Train,
  Flame,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Compass,
  AlertCircle,
  Clock,
  ShieldCheck,
  Check,
  Car,
  Hotel,
} from 'lucide-react';
import { osakaSpotsData, subwayLinesData, subwayStationsData } from '../data/guidebookData';
import { SpotInfo, Accommodation } from '../types';
import { WikiSummaryPanel } from './WikiSummaryPanel';

interface MapSubwayTabProps {
  onOpenTaxi?: () => void;
  selectedHotel?: Accommodation;
  onOpenAccommodationModal?: () => void;
}

export const MapSubwayTab: React.FC<MapSubwayTabProps> = ({
  onOpenTaxi,
  selectedHotel,
  onOpenAccommodationModal,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'subway'>('map');
  const [selectedSpot, setSelectedSpot] = useState<SpotInfo>(osakaSpotsData[0]);
  const [fromStation, setFromStation] = useState<string>('st-namba');
  const [toStation, setToStation] = useState<string>('st-usj');

  // Congestion stats simulation (real-time live crowd levels for Osaka)
  const congestionStats = [
    { name: '유니버설 스튜디오 (USJ)', level: '극심 (94%)', status: 'very_high', tip: '마리오카트 대기 120분, 익스프레스 패스 적극 활용 권장' },
    { name: '도톤보리 글리코상', level: '혼잡 (80%)', status: 'high', tip: '18시~21시 야경 인파 절정. 골목 이동 시 소매치기 주의' },
    { name: '우메다 닌텐도 오사카', level: '혼잡 (72%)', status: 'high', tip: '주말엔 13층 입장 정리권 배부 가능성 높음' },
    { name: '오사카성 천수각', level: '보통 (50%)', status: 'moderate', tip: 'E-티켓 소지 시 매표소 줄 생략 가능, 전기차 탑승 여유' },
    { name: '구로몬 시장', level: '보통 (42%)', status: 'moderate', tip: '오전 9~11시가 가장 신선하고 쾌적하게 시식 가능' },
    { name: '호젠지 요코초 (숨은 명소)', level: '원활 (25%)', status: 'low', tip: '도톤보리 옆 조용한 힐링 돌담길, 여유롭게 산책 가능' },
  ];

  const getSubwayRoute = () => {
    if (fromStation === 'st-namba' && toStation === 'st-usj') {
      return {
        lineName: '한신 난바선 → JR 유메사키선 환승',
        time: '약 25~30분 소요',
        steps: [
          '1. 난바역에서 한신 난바선 탑승 (아마가사키 방면)',
          '2. 니시쿠조(西九条)역 하차 후 4번 승강장으로 환승 (도보 2분)',
          '3. JR 유메사키선 탑승 → 유니버설시티(Universal City)역 하차',
          '4. 개찰구 나와 도보 3분 후 USJ 정문 도착',
        ],
        fare: '총 370엔 (ICOCA 카드 결제 가능)',
        tip: '출근/등교 시간과 겹치는 08시대에는 열차가 혼잡할 수 있으니 08:10 전후 탑승을 추천합니다.',
      };
    }
    if (fromStation === 'st-namba' && toStation === 'st-umeda') {
      return {
        lineName: '지하철 미도스지선 (M16 → M20)',
        time: '약 10분 소요 (환승 없음 직통)',
        steps: [
          '1. 난바역에서 빨간색 미도스지선 (우메다/센리츄오 방면) 탑승',
          '2. 4정거장 이동 후 우메다역 하차',
          '3. 중앙 개찰구 나와 지하통로로 다이마루 백화점 바로 연결 (13층 이동)',
        ],
        fare: '240엔 (ICOCA 카드)',
        tip: '환승이 전혀 없어 유모차나 부모님 모시고 가기에 가장 쾌적한 최단 경로입니다.',
      };
    }
    if (fromStation === 'st-namba' && toStation === 'st-osaka-castle') {
      return {
        lineName: '센니치마에선/미도스지선 → 타니마치선 환승',
        time: '약 18~20분 소요',
        steps: [
          '1. 난바역에서 센니치마에선 탑승 → 타니마치9초메역 하차',
          '2. 보라색 타니마치선 환승 → 타니마치4초메역 9번 출구 하차',
          '3. 오사카성 공원 오테몬 정문 진입 후 300엔 로드 트레인 탑승',
        ],
        fare: '240엔 (ICOCA 카드)',
        tip: '오사카성 부지가 넓으므로 타니마치4초메역 9번 출구가 천수각 정문과 가장 가깝습니다.',
      };
    }
    if (fromStation === 'st-kix' && toStation === 'st-namba') {
      return {
        lineName: '난카이 특급 라피트 (Nankai Rapi:t)',
        time: '약 40분 소요 (직통 지정석)',
        steps: [
          '1. 간사이공항 2층 난카이선 개찰구에서 모바일 QR 스캔 후 입장',
          '2. 전좌석 지정석 열차이므로 지정 호차/좌석 착석',
          '3. 종점 난카이 난바역 하차 (택시 5분 or 도보로 숙소 이동)',
        ],
        fare: '약 1,600엔 (마이리얼트립 사전 예약 티켓)',
        tip: '비행기 지연 시 스마트폰 바우처 링크에서 출발 5분 전까지 좌석 시간을 무료 변경할 수 있습니다.',
      };
    }

    return {
      lineName: '오사카 메트로 추천 노선',
      time: '약 15~25분 소요',
      steps: [
        '1. 승차역 플랫폼에서 해당 노선 탑승',
        '2. 역내 안내 표지판의 알파벳(M, T, S)과 역 번호를 확인하세요.',
        '3. 목적지 역 개찰구에서 ICOCA 카드 태그',
      ],
      fare: '기본 190~290엔 (ICOCA)',
      tip: '구글 맵 검색 시 탑승할 지하철 플랫폼 번호까지 한국어로 완벽 안내됩니다.',
    };
  };

  const routeInfo = getSubwayRoute();

  return (
    <div className="space-y-4 pb-20">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setViewMode('map')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            viewMode === 'map'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>관광지 실시간 지도 & 동선</span>
        </button>
        <button
          onClick={() => setViewMode('subway')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            viewMode === 'subway'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Train className="w-4 h-4" />
          <span>지하철 노선도 & 경로 탐색</span>
        </button>
      </div>

      {/* Active Basecamp Info Pill */}
      {selectedHotel && (
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
              <Hotel className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                우리 가족 베이스캠프: <span className="text-rose-700">{selectedHotel.nameKo}</span> ({selectedHotel.area})
              </div>
              <div className="text-[11px] text-slate-600 truncate">
                {selectedHotel.nearestStation} • 라피트 {selectedHotel.stationDistance}
              </div>
            </div>
          </div>
          {onOpenAccommodationModal && (
            <button
              onClick={onOpenAccommodationModal}
              className="px-2.5 py-1.5 bg-white hover:bg-rose-100 text-rose-700 font-bold border border-rose-300 rounded-xl text-xs shrink-0 transition-all cursor-pointer shadow-2xs"
            >
              🏨 숙소 변경
            </button>
          )}
        </div>
      )}

      {/* Taxi Destination Card Quick Access */}
      {onOpenTaxi && (
        <div className="bg-amber-100/80 border border-amber-300 p-3 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-950">4인 가족 짐 이동 시 택시가 필요하신가요?</div>
              <div className="text-[11px] text-amber-900">기사님께 보여주는 일본어 큰 글씨 목적지 카드를 열어보세요</div>
            </div>
          </div>
          <button
            onClick={onOpenTaxi}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold rounded-xl text-xs shrink-0 transition-all cursor-pointer shadow-xs"
          >
            🚖 택시 카드 열기
          </button>
        </div>
      )}

      {/* Real-time Congestion Banner */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">오사카 주요 스팟 실시간 혼잡도 지수</span>
          </div>
          <span className="text-[11px] text-slate-400">오사카 시간 기준 실시간 반영</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {congestionStats.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border text-xs ${
                c.status === 'very_high'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : c.status === 'high'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px] mb-0.5">
                <span className="truncate">{c.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    c.status === 'very_high'
                      ? 'bg-rose-600 text-white'
                      : c.status === 'high'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {c.level}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 truncate mt-1">{c.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MAP VIEW */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          {/* Interactive Graphic Map of Osaka */}
          <div className="relative bg-gradient-to-b from-sky-50 to-slate-100 rounded-2xl border border-slate-300 p-4 shadow-inner overflow-hidden min-h-[340px] flex flex-col justify-between">
            {/* Map Top Bar */}
            <div className="flex items-center justify-between z-10">
              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg text-xs font-bold text-slate-800 shadow-xs border border-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                난바 숙소 중심 반경 동선 지도 (오프라인 지원)
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-white px-2 py-0.5 rounded">
                1:1 스케일 (PDF 3p~5p)
              </span>
            </div>

            {/* Simulated Osaka Map Canvas with Subway & Spot Nodes */}
            <div className="relative w-full h-[260px] my-2">
              {/* Osaka Bay Water Area */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Coastline / Bay */}
                <path d="M 0,0 L 25,0 L 15,35 L 5,60 L 0,100 Z" fill="#E0F2FE" opacity="0.7" />
                <path d="M 15,35 Q 28,45 20,65 T 25,100" fill="none" stroke="#BAE6FD" strokeWidth="3" />

                {/* Transit Connecting lines from Namba Basecamp */}
                {/* Namba (50, 56) to KIX Airport (30, 88) */}
                <line x1="50" y1="56" x2="30" y2="88" stroke="#1B365D" strokeWidth="2" strokeDasharray="3,2" />
                {/* Namba to USJ (22, 52) */}
                <line x1="50" y1="56" x2="22" y2="52" stroke="#0072BC" strokeWidth="2.5" />
                {/* Namba to Umeda (48, 26) */}
                <line x1="50" y1="56" x2="48" y2="26" stroke="#E51E25" strokeWidth="2.5" />
                {/* Namba to Osaka Castle (68, 38) */}
                <line x1="50" y1="56" x2="68" y2="38" stroke="#832885" strokeWidth="2" />
                {/* Namba to Dotonbori (50, 52) */}
                <line x1="50" y1="56" x2="50" y2="52" stroke="#F43F5E" strokeWidth="3" />

                {/* Radius Rings around Namba */}
                <circle cx="50" cy="56" r="6" fill="none" stroke="#F43F5E" strokeWidth="0.8" strokeDasharray="1,1" opacity="0.6" />
                <circle cx="50" cy="56" r="22" fill="none" stroke="#64748B" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4" />
              </svg>

              {/* Map Spot Markers */}
              {osakaSpotsData.map((spot) => {
                const isSelected = selectedSpot.id === spot.id;
                const isBasecamp = spot.id === 'spot-namba';
                return (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    style={{ left: `${spot.coordinates.x}%`, top: `${spot.coordinates.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center rounded-full p-1.5 shadow-md border-2 transition-colors ${
                        isBasecamp
                          ? 'bg-rose-600 border-white text-white animate-bounce ring-4 ring-rose-200'
                          : isSelected
                          ? 'bg-amber-500 border-white text-white ring-4 ring-amber-200'
                          : 'bg-white border-slate-700 text-slate-800'
                      }`}
                    >
                      {isBasecamp ? (
                        <span className="text-xs">★</span>
                      ) : (
                        <MapPin className="w-3 h-3" />
                      )}
                    </div>
                    {/* Tooltip Label */}
                    <span
                      className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-white/95 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {spot.name.split('(')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 z-10 pt-2 border-t border-slate-200/80 text-[10px] text-slate-600">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-bold text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> ★ 숙소(난바)
                </span>
                <span className="flex items-center gap-1 font-bold text-blue-600">
                  <span className="w-2.5 h-2.5 bg-blue-600 inline-block" /> USJ(25분)
                </span>
                <span className="flex items-center gap-1 font-bold text-red-600">
                  <span className="w-2.5 h-2.5 bg-red-600 inline-block" /> 우메다(10분)
                </span>
                <span className="flex items-center gap-1 font-bold text-purple-600">
                  <span className="w-2.5 h-2.5 bg-purple-600 inline-block" /> 오사카성(20분)
                </span>
              </div>
              <span className="text-slate-400">터치하여 스팟 상세 정보 확인</span>
            </div>
          </div>

          {/* Selected Spot Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {selectedSpot.pdfReference}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{selectedSpot.nameJa}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedSpot.name}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-rose-600 block">
                  난바 기준 {selectedSpot.distanceFromNamba}
                </span>
                <span className="text-[11px] text-slate-500">{selectedSpot.transitMethod}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {selectedSpot.description}
            </p>

            {/* Family Tip */}
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">4인 가족 맞춤 가이드라인: </strong>
                <span>{selectedSpot.familyTip}</span>
              </div>
            </div>

            {/* Wikipedia Summary (Wikipedia REST API, no key required) */}
            <WikiSummaryPanel query={selectedSpot.name} />

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  selectedSpot.nameJa || selectedSpot.name
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>구글 지도에서 실시간 길찾기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  alert(`[오프라인 저장 완료]\n${selectedSpot.name}의 이동 경로와 팁이 기기에 오프라인 캐시되었습니다.`);
                }}
                className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>오프라인 저장됨</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBWAY VIEW */}
      {viewMode === 'subway' && (
        <div className="space-y-4">
          {/* Quick Route Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Train className="w-4 h-4 text-blue-600" />
                <span>오사카 주요 구간 지하철 환승 검색기</span>
              </h3>
              <span className="text-[11px] text-blue-600 font-medium">ICOCA 카드 전 구간 사용 가능</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">출발역</label>
                <select
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500"
                >
                  {subwayStationsData.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameKo} ({s.nameJa})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">도착지 역</label>
                <select
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500"
                >
                  {subwayStationsData.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameKo} ({s.nameJa})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Route Result Box */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-950 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                  {routeInfo.lineName}
                </span>
                <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                  {routeInfo.time}
                </span>
              </div>

              <div className="space-y-1 text-xs text-blue-900 bg-white/80 p-2.5 rounded-lg border border-blue-100 font-medium">
                {routeInfo.steps.map((step, idx) => (
                  <p key={idx}>{step}</p>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-blue-800 pt-1 border-t border-blue-200/60">
                <span>예상 요금: <strong>{routeInfo.fare}</strong></span>
                <span className="text-slate-500">환승 시 개찰구 밖으로 나가지 마세요</span>
              </div>

              <div className="text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-lg">
                💡 <strong>팁:</strong> {routeInfo.tip}
              </div>
            </div>
          </div>

          {/* Subway Lines Info Cards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 px-1">오사카 4인 가족 핵심 노선도 가이드</h4>
            {subwayLinesData.map((line) => (
              <div
                key={line.id}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: line.color }}
                    />
                    <span className="text-xs font-bold text-slate-900">{line.nameKo}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{line.nameJa}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    주요 정차역 {line.stations.length}개
                  </span>
                </div>
                <p className="text-xs text-slate-600">{line.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {line.stations.map((st, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
