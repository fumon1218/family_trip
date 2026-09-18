import React, { useState, useMemo } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Train,
  Camera,
  Utensils,
  Hotel,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ArrowDown,
  Layers,
  BarChart3,
  GitCommit,
  Car,
  Footprints,
  ChevronRight,
  AlertTriangle,
  Info,
  DollarSign,
  Navigation,
  ExternalLink,
  X,
  Umbrella,
  CloudRain,
} from 'lucide-react';
import { ScheduleItem, Accommodation, WeatherData } from '../types';

interface TransitSegment {
  id: string;
  day: number;
  fromId: string;
  toId: string;
  fromTitle: string;
  toTitle: string;
  fromTime: string;
  toTime: string;
  durationMinutes: number;
  durationText: string;
  mode: 'taxi' | 'subway' | 'walk' | 'train';
  modeLabel: string;
  estimatedCost: string;
  notes: string;
  taxiDestination?: string;
}

interface TimelineDiagramProps {
  schedule?: ScheduleItem[];
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  onToggleComplete?: (id: string) => void;
  selectedHotel?: Accommodation;
  onOpenTaxi?: () => void;
  onOpenUsj?: () => void;
  onOpenWeather?: () => void;
  rainSimulationDay?: number | null;
  weather?: WeatherData | null;
}

type DiagramMode = 'gantt' | 'flow' | 'matrix';

// Explicit Day 3 fallback schedule based on user prompt
const defaultDay3Items: ScheduleItem[] = [
  {
    id: 'd3-1',
    day: 3,
    time: '09:00',
    title: '체크아웃 & 짐 보관',
    location: '미마루 난바 NORTH 프론트',
    category: 'hotel',
    description: '체크아웃 후 프론트에 캐리어 4개 무료 보관. 신속하게 오사카성으로 출발.',
    badge: '짐보관 확인',
    completed: false,
    durationMinutes: 30,
    tags: ['체크아웃', '짐보관', '출발준비'],
  },
  {
    id: 'd3-2',
    day: 3,
    time: '09:30',
    title: '오사카성 공원 관광',
    location: '오사카성 천수각 & 공원',
    category: 'attraction',
    description: '천수각 외관 관람, 고자부네 놀잇배 또는 공원 산책. 유모차/부모님 완만한 동선 권장.',
    badge: '핵심 포토존',
    completed: false,
    durationMinutes: 120,
    tags: ['오사카성', '천수각', '가족사진'],
  },
  {
    id: 'd3-3',
    day: 3,
    time: '12:00',
    title: '우메다 다이마루 백화점',
    location: '우메다 다이마루 14F 식당가',
    category: 'food',
    description: '백화점 고급 정식 또는 돈카츠·스시. 포켓몬센터 및 닌텐도 오사카 굿즈 쇼핑 연계.',
    badge: '미식 & 쇼핑',
    completed: false,
    durationMinutes: 120,
    tags: ['다이마루', '우메다', '포켓몬센터'],
  },
  {
    id: 'd3-4',
    day: 3,
    time: '15:00',
    title: '난바 복합쇼핑몰',
    location: '난바 파크스 / 난바 시티',
    category: 'attraction',
    description: '난바로 복귀하여 옥상 정원 휴식, 드럭스토어 면세 쇼핑 및 마지막 디저트 타임.',
    badge: '면세 쇼핑',
    completed: false,
    durationMinutes: 90,
    tags: ['난바파크스', '면세쇼핑', '기념품'],
  },
  {
    id: 'd3-5',
    day: 3,
    time: '17:40',
    title: '간사이 공항 이동 준비',
    location: '난카이 난바역 라피트 승강장',
    category: 'transport',
    description: '호텔에서 보관 짐 수령 후 난카이 난바역 3층 북측 개찰구로 이동. 라피트 지정석 탑승 대기.',
    badge: '특급 라피트',
    completed: false,
    durationMinutes: 60,
    tags: ['라피트', '짐찾기', '난카이난바'],
  },
  {
    id: 'd3-6',
    day: 3,
    time: '19:40',
    title: '최종 일정 (출국 수속)',
    location: '간사이 국제공항 제1터미널',
    category: 'transport',
    description: '항공사 카운터 수하물 위탁, 보안검색 및 출국심사. 면세점 로이스 초콜릿·도쿄바나나 쇼핑.',
    badge: '귀국 편 탑승',
    completed: false,
    durationMinutes: 100,
    tags: ['출국수속', '공항면세점', '귀국'],
  },
];

// Predefined explicit transit segments
const predefinedTransitSegments: TransitSegment[] = [
  // Day 3 Segments
  {
    id: 'trans-d3-1',
    day: 3,
    fromId: 'd3-1',
    toId: 'd3-2',
    fromTitle: '미마루 난바 NORTH',
    toTitle: '오사카성 공원',
    fromTime: '09:00',
    toTime: '09:30',
    durationMinutes: 30,
    durationText: '30분',
    mode: 'taxi',
    modeLabel: '택시 이동',
    estimatedCost: '약 2,000 ~ 2,400엔',
    notes: '4인 가족 이동 시 지하철 4인 요금(약 1,120엔) 대비 체력 보존 효과 극대화. 천수각 사쿠라몬 인근 하차 요청 권장.',
    taxiDestination: '大阪城公園 極楽橋または桜門付近 (오사카성 공원 극락교 또는 사쿠라몬 부근)',
  },
  {
    id: 'trans-d3-2',
    day: 3,
    fromId: 'd3-2',
    toId: 'd3-3',
    fromTitle: '오사카성 공원',
    toTitle: '우메다 다이마루 백화점',
    fromTime: '11:30',
    toTime: '12:00',
    durationMinutes: 30,
    durationText: '30분',
    mode: 'subway',
    modeLabel: '지하철 이동',
    estimatedCost: '1인 240엔 (4인 960엔)',
    notes: '타니마치선 타니마치4초메역 → 히가시우메다역 하차 후 지하 연결통로로 다이마루 백화점 도보 5분 진입.',
  },
  {
    id: 'trans-d3-3',
    day: 3,
    fromId: 'd3-3',
    toId: 'd3-4',
    fromTitle: '우메다 다이마루',
    toTitle: '난바 복합쇼핑몰',
    fromTime: '14:20',
    toTime: '15:00',
    durationMinutes: 40,
    durationText: '40분',
    mode: 'subway',
    modeLabel: '지하철 (미도스지선)',
    estimatedCost: '1인 240엔 (4인 960엔)',
    notes: '미도스지선 우메다역 → 난바역 직통 (약 9분 탑승). 난바역 지하상가(난바워크)를 통해 난바파크스 직결.',
  },
  {
    id: 'trans-d3-4',
    day: 3,
    fromId: 'd3-4',
    toId: 'd3-5',
    fromTitle: '난바 복합쇼핑몰',
    toTitle: '라피트 승강장 (간사이 공항 이동 준비)',
    fromTime: '17:00',
    toTime: '17:40',
    durationMinutes: 40,
    durationText: '40분',
    mode: 'walk',
    modeLabel: '도보 / 짐 수령 / 이동',
    estimatedCost: '무료 (도보 이동)',
    notes: '숙소(미마루 난바)에서 보관한 캐리어 4개 수령(15분) 후 난카이 난바역 2층 중앙/3층 북측 개찰구로 도보 10분 이동.',
  },
  {
    id: 'trans-d3-5',
    day: 3,
    fromId: 'd3-5',
    toId: 'd3-6',
    fromTitle: '난카이 난바역',
    toTitle: '간사이 국제공항',
    fromTime: '18:15',
    toTime: '19:00',
    durationMinutes: 45,
    durationText: '약 38~45분',
    mode: 'train',
    modeLabel: '특급 라피트 β',
    estimatedCost: '1인 1,490엔 (지정좌석권 포함)',
    notes: '전 좌석 지정석, 캐리어 전용 잠금장치 비치. 간사이공항역 하차 후 2층 연결통로로 제1터미널 출국장 바로 연결.',
  },
];

export const TimelineDiagram: React.FC<TimelineDiagramProps> = ({
  schedule: propSchedule,
  selectedDay: propSelectedDay,
  onSelectDay: propOnSelectDay,
  onToggleComplete,
  selectedHotel,
  onOpenTaxi,
  onOpenUsj,
  onOpenWeather,
  rainSimulationDay,
  weather,
}) => {
  // Local state for view modes and filters
  const [internalDay, setInternalDay] = useState<number>(3);
  const [diagramMode, setDiagramMode] = useState<DiagramMode>('gantt');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedTransitId, setSelectedTransitId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Weather Rain Alert logic per schedule item
  const getRainAlert = (item: ScheduleItem) => {
    const prob =
      rainSimulationDay !== null && rainSimulationDay !== undefined
        ? item.day === rainSimulationDay
          ? 80
          : 15
        : weather?.forecast?.[item.day - 1]?.rainProbNumber ?? 15;

    const isOutdoor =
      item.category === 'attraction' ||
      item.category === 'transport' ||
      item.location.includes('공원') ||
      item.location.includes('거리') ||
      item.location.includes('USJ') ||
      item.title.includes('오사카성') ||
      item.title.includes('도톤보리');

    const isRain = prob >= 50 && isOutdoor;
    return { isRain, prob };
  };

  const selectedDay = propSelectedDay !== undefined ? propSelectedDay : internalDay;
  const handleSelectDay = (day: number) => {
    setInternalDay(day);
    if (propOnSelectDay) propOnSelectDay(day);
    setSelectedItemId(null);
    setSelectedTransitId(null);
  };

  // Convert time "HH:MM" to decimal hours (e.g., "09:30" -> 9.5)
  const timeToDecimal = (t: string): number => {
    const [h, m] = t.split(':').map((v) => parseInt(v, 10) || 0);
    return h + m / 60;
  };

  // Decimal to "HH:MM" format
  const decimalToTime = (d: number): string => {
    const h = Math.floor(d);
    const m = Math.round((d - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Base schedule for the selected day
  const baseSchedule = useMemo(() => {
    if (propSchedule && propSchedule.length > 0) {
      // If prop schedule has items for this day, use them
      const dayFiltered = selectedDay === 0
        ? propSchedule
        : propSchedule.filter((item) => item.day === selectedDay);
      if (dayFiltered.length > 0) return dayFiltered;
    }
    // Fallback default Day 3 dataset
    return defaultDay3Items;
  }, [propSchedule, selectedDay]);

  // Transits for the selected day
  const activeTransits = useMemo(() => {
    return predefinedTransitSegments.filter((t) => selectedDay === 0 || t.day === selectedDay);
  }, [selectedDay]);

  // Dynamic Time Axis Bound Calculation (09:00 ~ 20:00 without dead empty margins)
  const { startHour, endHour, totalHours } = useMemo(() => {
    if (baseSchedule.length === 0) return { startHour: 9, endHour: 20, totalHours: 11 };
    let minT = 24;
    let maxT = 0;

    baseSchedule.forEach((item) => {
      const dec = timeToDecimal(item.time);
      const dur = (item.durationMinutes || 90) / 60;
      if (dec < minT) minT = dec;
      if (dec + dur > maxT) maxT = dec + dur;
    });

    activeTransits.forEach((tr) => {
      const s = timeToDecimal(tr.fromTime);
      const e = timeToDecimal(tr.toTime);
      if (s < minT) minT = s;
      if (e > maxT) maxT = e;
    });

    // Clamp nicely: start at the lower integer hour, end at upper integer hour
    const start = Math.max(0, Math.floor(minT));
    const end = Math.min(24, Math.max(start + 5, Math.ceil(maxT)));
    return {
      startHour: start,
      endHour: end,
      totalHours: end - start,
    };
  }, [baseSchedule, activeTransits]);

  // Hours ruler array for headers and guidelines
  const hoursRuler = useMemo(() => {
    return Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);
  }, [startHour, totalHours]);

  // Selected item / transit objects
  const activeItem = useMemo(() => {
    if (!selectedItemId) return null;
    return baseSchedule.find((item) => item.id === selectedItemId) || null;
  }, [selectedItemId, baseSchedule]);

  const activeTransit = useMemo(() => {
    if (!selectedTransitId) return null;
    return activeTransits.find((t) => t.id === selectedTransitId) || null;
  }, [selectedTransitId, activeTransits]);

  // Categories config for dedicated rows and high-contrast styling
  // NOTE: 숙소 (Hotel) = Deep Purple, 교통 (Transport) = High-vibrancy Blue with distinct borders
  const categoriesConfig = [
    {
      id: 'hotel',
      label: '숙소',
      fullName: '숙소 / 체크인·짐보관',
      colorClass: 'bg-purple-600 border-purple-800 text-white',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      icon: <Hotel className="w-3.5 h-3.5" />,
      rowBg: 'bg-purple-50/20',
    },
    {
      id: 'attraction',
      label: '관광',
      fullName: '관광 / 명소 체험',
      colorClass: 'bg-rose-500 border-rose-700 text-white',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <Camera className="w-3.5 h-3.5" />,
      rowBg: 'bg-rose-50/20',
    },
    {
      id: 'food',
      label: '식사',
      fullName: '식사 / 미식 탐방',
      colorClass: 'bg-amber-500 border-amber-600 text-white',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: <Utensils className="w-3.5 h-3.5" />,
      rowBg: 'bg-amber-50/20',
    },
    {
      id: 'transport',
      label: '교통',
      fullName: '교통 / 이동 일정',
      colorClass: 'bg-blue-600 border-blue-800 text-white',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      icon: <Train className="w-3.5 h-3.5" />,
      rowBg: 'bg-blue-50/20',
    },
  ];

  const getTransitIcon = (mode: TransitSegment['mode']) => {
    switch (mode) {
      case 'taxi':
        return <Car className="w-3.5 h-3.5 text-amber-600" />;
      case 'subway':
        return <Train className="w-3.5 h-3.5 text-blue-600" />;
      case 'walk':
        return <Footprints className="w-3.5 h-3.5 text-emerald-600" />;
      case 'train':
        return <Train className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden font-sans">
      {/* 1. Dark Header (상단 다크 헤더) */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-sm">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                일정표 타임라인 도표
                <span className="text-[10px] bg-rose-500/30 text-rose-300 border border-rose-400/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  간트 차트
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              시간대별 활동 점유율, 소요 시간 및 구간별 이동 동선(택시·지하철·도보) 시각화 다이어그램
            </p>
          </div>

          {/* View Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 border border-slate-700 rounded-xl self-start md:self-auto">
            <button
              type="button"
              onClick={() => setDiagramMode('gantt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                diagramMode === 'gantt'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>간트 시간축</span>
            </button>

            <button
              type="button"
              onClick={() => setDiagramMode('flow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                diagramMode === 'flow'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>플로우 노드</span>
            </button>

            <button
              type="button"
              onClick={() => setDiagramMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                diagramMode === 'matrix'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3일 비교</span>
            </button>
          </div>
        </div>

        {/* Sub Header Controls: Day Selection + Category Filter */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Day selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1">일차 선택:</span>
            {[
              { day: 1, label: '1일차' },
              { day: 2, label: '2일차' },
              { day: 3, label: '3일차' },
              { day: 0, label: '전체' },
            ].map((d) => (
              <button
                key={d.day}
                type="button"
                onClick={() => handleSelectDay(d.day)}
                className={`px-3 py-1 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                  selectedDay === d.day
                    ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Category Filter (Dim other categories instead of hiding!) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 mr-1">카테고리 강조:</span>
            {[
              { id: 'all', label: '전체' },
              { id: 'transport', label: '교통' },
              { id: 'attraction', label: '관광' },
              { id: 'food', label: '식사' },
              { id: 'hotel', label: '숙소' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Canvas */}
      <div className="p-3.5 sm:p-5 bg-slate-50/50">
        {/* =========================================================================
            VIEW 1: GANTT CHART (시간축 설정 + 카테고리별 Row + 이동 구간 시각화)
           ========================================================================= */}
        {diagramMode === 'gantt' && (
          <div className="space-y-4">
            {/* Legend info bar */}
            <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <Clock className="w-4 h-4 text-slate-700" />
                <span>시간 범위:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                  {decimalToTime(startHour)} ~ {decimalToTime(endHour)}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (이벤트 없는 빈 앞뒤 시간대는 자동 제외하여 블록 확대)
                </span>
              </div>

              {/* Category Color legend */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-purple-600" /> 숙소
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" /> 관광
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" /> 식사
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600" /> 교통
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700 ml-1">
                  <span className="w-3 h-1 border-t-2 border-dashed border-slate-500" /> 🚕 이동 구간
                </span>
              </div>
            </div>

            {/* Gantt Interactive Board (with horizontal scroll for small screens) */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs p-3">
              <div className="min-w-[720px] select-none">
                {/* 2.1 Top Time Ruler */}
                <div className="flex items-center pb-2.5 border-b border-slate-200 font-mono text-[11px] font-bold text-slate-500">
                  <div className="w-28 shrink-0 text-slate-400 font-sans text-xs">카테고리</div>
                  <div className="flex-1 relative h-5">
                    {hoursRuler.map((hour, idx) => {
                      const percent = ((hour - startHour) / totalHours) * 100;
                      return (
                        <div
                          key={hour}
                          style={{ left: `${percent}%` }}
                          className="absolute -translate-x-1/2 flex flex-col items-center"
                        >
                          <span className="leading-none">{hour}:00</span>
                          <span className="w-px h-1.5 bg-slate-300 mt-1" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2.2 Category Rows (숙소, 관광, 식사, 교통) */}
                <div className="divide-y divide-slate-100 relative pt-1">
                  {/* Vertical Guidelines throughout the chart */}
                  <div className="absolute top-0 bottom-0 left-28 right-0 pointer-events-none z-0">
                    {hoursRuler.map((hour) => {
                      const percent = ((hour - startHour) / totalHours) * 100;
                      return (
                        <div
                          key={hour}
                          style={{ left: `${percent}%` }}
                          className="absolute top-0 bottom-0 w-px border-r border-slate-100"
                        />
                      );
                    })}
                  </div>

                  {categoriesConfig.map((cat) => {
                    const rowItems = baseSchedule.filter((item) => item.category === cat.id);
                    const isRowDimmed = categoryFilter !== 'all' && categoryFilter !== cat.id;

                    return (
                      <div
                        key={cat.id}
                        className={`flex items-center py-2.5 relative transition-opacity duration-200 ${
                          cat.rowBg
                        } ${isRowDimmed ? 'opacity-30 saturate-50' : 'opacity-100'}`}
                      >
                        {/* Row Label (Left) */}
                        <div className="w-28 shrink-0 pr-3 flex items-center gap-1.5 z-10">
                          <span
                            className={`p-1 rounded-md border text-[11px] font-extrabold flex items-center gap-1 ${cat.badgeBg}`}
                          >
                            {cat.icon}
                            <span>{cat.label}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({rowItems.length})
                          </span>
                        </div>

                        {/* Row Timeline Track (Right) */}
                        <div className="flex-1 relative h-12">
                          {rowItems.map((item) => {
                            const itemStart = timeToDecimal(item.time);
                            const dur = (item.durationMinutes || 90) / 60;
                            const leftPercent = Math.max(
                              0,
                              ((itemStart - startHour) / totalHours) * 100
                            );
                            const widthPercent = Math.min(
                              100 - leftPercent,
                              Math.max(8.5, (dur / totalHours) * 100)
                            );

                            const isSelected = selectedItemId === item.id;
                            const isHovered = hoveredItemId === item.id;
                            const rainAlert = getRainAlert(item);

                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedItemId(item.id);
                                  setSelectedTransitId(null);
                                }}
                                onMouseEnter={() => setHoveredItemId(item.id)}
                                onMouseLeave={() => setHoveredItemId(null)}
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                }}
                                className={`absolute top-0.5 bottom-0.5 rounded-xl border p-1.5 flex flex-col justify-between cursor-pointer transition-all duration-150 z-10 shadow-xs hover:shadow-md hover:scale-[1.01] ${
                                  cat.colorClass
                                } ${
                                  isSelected
                                    ? 'ring-3 ring-slate-900 ring-offset-2 scale-[1.02] z-30'
                                    : ''
                                } ${
                                  rainAlert.isRain
                                    ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-blue-500/20'
                                    : ''
                                } ${item.completed ? 'opacity-65 saturate-70' : ''}`}
                              >
                                {/* Line 1: Time (항상 완전히 표시) + Rain Badge + Complete indicator */}
                                <div className="flex items-center justify-between gap-1 overflow-hidden leading-none">
                                  <div className="flex items-center gap-1 min-w-0 flex-wrap">
                                    <span className="font-mono text-[10px] font-black bg-black/35 px-1 py-0.5 rounded whitespace-nowrap">
                                      {item.time}
                                    </span>
                                    {rainAlert.isRain && (
                                      <span className="font-mono text-[9px] font-black bg-blue-600 text-white px-1 py-0.5 rounded flex items-center gap-0.5 shrink-0 animate-pulse">
                                        <Umbrella className="w-2.5 h-2.5 text-cyan-200" />
                                        <span>비 {rainAlert.prob}%</span>
                                      </span>
                                    )}
                                    {/* Icon if narrow */}
                                    <span className="hidden sm:inline-block opacity-90 shrink-0">
                                      {cat.icon}
                                    </span>
                                  </div>

                                  {/* Quick check completion button on block */}
                                  {onToggleComplete && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleComplete(item.id);
                                      }}
                                      className="p-0.5 hover:bg-black/30 rounded shrink-0 transition-all"
                                      title={item.completed ? '완료 취소' : '방문 완료'}
                                    >
                                      {item.completed ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-white/80" />
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* Line 2: Title (공간 부족 시 말줄임 또는 호버 툴팁) */}
                                <div className="text-[11px] font-extrabold truncate leading-tight mt-0.5">
                                  {item.title}
                                </div>

                                {/* Floating Tooltip on Hover */}
                                {isHovered && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-slate-950 text-white p-2.5 rounded-xl shadow-xl border border-slate-800 text-xs pointer-events-none z-50 animate-in fade-in zoom-in-95">
                                    <div className="flex items-center justify-between gap-1 font-mono text-[10px] text-amber-300 font-bold">
                                      <span>⏰ {item.time} ({item.durationMinutes || 90}분 소요)</span>
                                      {rainAlert.isRain && (
                                        <span className="bg-rose-600 text-white px-1 py-0.2 rounded font-bold text-[9px]">
                                          ☔ 우천주의
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-extrabold text-white text-xs mt-0.5">
                                      {item.title}
                                    </div>
                                    <div className="text-[10px] text-slate-300 truncate mt-0.5">
                                      📍 {item.location}
                                    </div>
                                    {rainAlert.isRain && (
                                      <div className="mt-1.5 p-1.5 bg-blue-900/80 border border-blue-500 rounded-lg text-[10px] text-cyan-200 flex items-start gap-1">
                                        <Umbrella className="w-3.5 h-3.5 text-cyan-300 shrink-0 mt-0.5" />
                                        <span>
                                          강수확률 {rainAlert.prob}% 비 예보! 실내 대체 플랜 확인 권장
                                        </span>
                                      </div>
                                    )}
                                    {item.badge && (
                                      <div className="mt-1 text-[9px] bg-rose-500/40 text-rose-200 px-1.5 py-0.2 rounded w-fit">
                                        {item.badge}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2.3 Dedicated Transit Track (이동 구간 전용 레인 - 핵심 기능) */}
                <div className="mt-2 pt-2 border-t-2 border-slate-200/80 bg-slate-100/50 rounded-xl p-2 flex items-center relative">
                  <div className="w-28 shrink-0 pr-3 flex items-center gap-1 text-slate-700 font-bold text-xs">
                    <Navigation className="w-3.5 h-3.5 text-slate-600" />
                    <span>이동 동선</span>
                  </div>

                  <div className="flex-1 relative h-9">
                    {activeTransits.map((transit) => {
                      const fromDec = timeToDecimal(transit.fromTime);
                      const toDec = timeToDecimal(transit.toTime);
                      const leftPercent = Math.max(0, ((fromDec - startHour) / totalHours) * 100);
                      const widthPercent = Math.min(
                        100 - leftPercent,
                        Math.max(7, ((toDec - fromDec) / totalHours) * 100)
                      );
                      const isSelected = selectedTransitId === transit.id;

                      return (
                        <div
                          key={transit.id}
                          onClick={() => {
                            setSelectedTransitId(transit.id);
                            setSelectedItemId(null);
                          }}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          className={`absolute top-0.5 bottom-0.5 rounded-lg border-2 border-dashed flex items-center justify-center px-1.5 cursor-pointer transition-all duration-150 z-20 ${
                            isSelected
                              ? 'bg-amber-400 border-amber-600 text-slate-950 font-black shadow-md scale-105 ring-2 ring-slate-900 ring-offset-1'
                              : 'bg-amber-100/90 hover:bg-amber-200 border-amber-400 text-slate-900'
                          }`}
                          title={`${transit.fromTitle} → ${transit.toTitle} (${transit.durationText})`}
                        >
                          <div className="flex items-center gap-1 text-[10px] truncate">
                            {getTransitIcon(transit.mode)}
                            <span className="font-extrabold whitespace-nowrap">
                              {transit.durationText}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>💡 블록 또는 🚕 이동 구간 점선 카드를 클릭하면 하단에 상세 정보가 표시됩니다.</span>
              <span className="font-medium text-slate-400 hidden sm:inline">
                단축키: 언제든 카테고리 필터로 원하는 항목만 집중 조망 가능
              </span>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: FLOW NODE DIAGRAM (수직 플로우 노드 + 이동 구간 커넥터)
           ========================================================================= */}
        {diagramMode === 'flow' && (
          <div className="max-w-2xl mx-auto py-2">
            <div className="relative pl-7 sm:pl-9 space-y-3 before:absolute before:left-3.5 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 via-rose-500 to-blue-500">
              {baseSchedule.map((item, index) => {
                const catInfo =
                  categoriesConfig.find((c) => c.id === item.category) || categoriesConfig[1];
                const isSelected = selectedItemId === item.id;
                const transitToNext = activeTransits.find((t) => t.fromId === item.id);

                return (
                  <div key={item.id} className="relative">
                    {/* Node Circular Marker */}
                    <div
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setSelectedTransitId(null);
                      }}
                      className={`absolute -left-7 sm:-left-9 top-3 w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all shadow-xs z-10 ${
                        item.completed
                          ? 'bg-emerald-500 border-white text-white'
                          : `${catInfo.colorClass} border-white`
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px] font-black">{index + 1}</span>
                      )}
                    </div>

                    {/* Node Card */}
                    <div
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setSelectedTransitId(null);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-rose-500 shadow-md ring-2 ring-rose-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded-md">
                            {item.time}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${catInfo.badgeBg}`}
                          >
                            {catInfo.icon}
                            <span>{catInfo.label}</span>
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                              ⭐ {item.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate max-w-[200px]">{item.location}</span>
                        </div>
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-black mt-2 ${
                          item.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Flow Transit Connector to Next Event */}
                    {transitToNext && (
                      <div
                        onClick={() => {
                          setSelectedTransitId(transitToNext.id);
                          setSelectedItemId(null);
                        }}
                        className="my-1.5 ml-2 p-2 bg-amber-50 hover:bg-amber-100/90 border border-amber-300 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                            {getTransitIcon(transitToNext.mode)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900">
                              {transitToNext.modeLabel} ({transitToNext.durationText})
                            </span>
                            <span className="text-amber-800 text-[11px] ml-1.5">
                              • {transitToNext.estimatedCost}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-amber-900 flex items-center gap-0.5">
                          상세 경로 <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: 3-DAY MACRO MATRIX (3일 일정 비교)
           ========================================================================= */}
        {diagramMode === 'matrix' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((dayNum) => {
                const dayThemes = {
                  1: {
                    title: '1일차: 입국 & 도톤보리',
                    color: 'from-blue-600 to-indigo-600',
                    desc: '공항 도착, 호텔 체크인 & 저녁 미식',
                  },
                  2: {
                    title: '2일차: USJ 종일 정복',
                    color: 'from-rose-600 to-orange-600',
                    desc: '닌텐도월드 & 해리포터 집중 공략',
                  },
                  3: {
                    title: '3일차: 오사카성 & 출국',
                    color: 'from-emerald-600 to-teal-600',
                    desc: '체크아웃, 쇼핑 & 라피트 귀국',
                  },
                }[dayNum as 1 | 2 | 3];

                const items =
                  propSchedule && propSchedule.filter((s) => s.day === dayNum).length > 0
                    ? propSchedule.filter((s) => s.day === dayNum)
                    : dayNum === 3
                    ? defaultDay3Items
                    : [];

                return (
                  <div
                    key={dayNum}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs flex flex-col"
                  >
                    <div className={`p-3 bg-gradient-to-r ${dayThemes.color} text-white`}>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm">{dayThemes.title}</span>
                        <button
                          type="button"
                          onClick={() => handleSelectDay(dayNum)}
                          className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded font-bold transition-all"
                        >
                          상세 보기 →
                        </button>
                      </div>
                      <div className="text-[11px] text-white/80 mt-0.5">{dayThemes.desc}</div>
                    </div>

                    <div className="p-2 space-y-1.5 flex-1 max-h-[360px] overflow-y-auto">
                      {items.map((it) => {
                        const cat =
                          categoriesConfig.find((c) => c.id === it.category) || categoriesConfig[0];
                        return (
                          <div
                            key={it.id}
                            onClick={() => {
                              handleSelectDay(dayNum);
                              setSelectedItemId(it.id);
                              setSelectedTransitId(null);
                            }}
                            className="p-2 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-rose-50/50 cursor-pointer transition-all text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-slate-800">
                                {it.time}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${cat.badgeBg}`}
                              >
                                {cat.label}
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5 truncate">
                              {it.title}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              📍 {it.location}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            3. 하단 상세 정보 패널 (Detail Inspector Panel)
           ========================================================================= */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          {/* Case A: 아무것도 선택되지 않았을 때의 Placeholder */}
          {!activeItem && !activeTransit && (
            <div className="p-6 bg-slate-100/80 rounded-2xl border border-dashed border-slate-300 text-center space-y-1 text-slate-500">
              <Info className="w-5 h-5 mx-auto text-slate-400" />
              <div className="text-xs sm:text-sm font-bold text-slate-700">
                블록이나 이동 구간을 클릭하면 세부 정보가 표시됩니다
              </div>
              <div className="text-[11px] text-slate-400">
                시간, 장소명, 짐 보관 여부, 메모, 이동 수단(택시비 및 경로)을 한곳에서 확인하세요.
              </div>
            </div>
          )}

          {/* Case B: 이벤트 블록 선택 시 (시간, 장소명, 태그, 메모, 체크박스, 액션 버튼) */}
          {activeItem && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800 animate-in fade-in">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black bg-rose-500 text-white px-2.5 py-1 rounded-lg">
                      ⏰ {activeItem.time}
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                      {activeItem.durationMinutes || 90}분 일정
                    </span>
                    {activeItem.badge && (
                      <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md">
                        ⭐ {activeItem.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white pt-1">
                    {activeItem.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-rose-300">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{activeItem.location}</span>
                  </div>
                </div>

                {/* Top Right: Toggle Complete & Close */}
                <div className="flex items-center gap-2">
                  {onToggleComplete && (
                    <button
                      type="button"
                      onClick={() => onToggleComplete(activeItem.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeItem.completed
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {activeItem.completed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>방문 완료됨</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          <span>방문 완료 체크</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedItemId(null)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                    title="패널 닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {activeItem.tags && activeItem.tags.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {activeItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Rain Alert Warning Box if rain is forecast for this item */}
              {(() => {
                const rainAlert = getRainAlert(activeItem);
                if (!rainAlert.isRain) return null;
                return (
                  <div className="mt-3 p-3.5 bg-blue-950/80 border-2 border-cyan-400 rounded-xl text-xs text-blue-100 flex items-start gap-3 shadow-md animate-in fade-in">
                    <div className="w-8 h-8 rounded-lg bg-cyan-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                      <Umbrella className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-cyan-300">
                          ☔ 비 예보 감지 (강수확률 {rainAlert.prob}%)
                        </span>
                        <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">
                          야외 일정 주의
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">
                        이 시간대는 야외 보행이 포함되어 우천 시 이동이 불편할 수 있습니다.
                      </p>
                      <div className="text-amber-300 font-semibold text-[11px] mt-1">
                        💡 추천 실내 대체 플랜:{' '}
                        {activeItem.rainyBackup ||
                          '인근 실내 아케이드 또는 오사카 역사박물관 10층 실내 전망대 & 우메다 백화점'}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Description & Note */}
              <div className="mt-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold text-slate-200 mb-0.5">📝 상세 안내 및 체크포인트</div>
                {activeItem.description}
                {activeItem.notes && (
                  <div className="mt-2 pt-2 border-t border-slate-700 text-amber-300 font-medium">
                    📌 메모: {activeItem.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="text-[11px] text-slate-400">
                  4인 가족 추천 동선 가이드라인 적용됨
                </div>

                <div className="flex items-center gap-2">
                  {onOpenTaxi && (
                    <button
                      type="button"
                      onClick={onOpenTaxi}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>택시 목적지 카드</span>
                    </button>
                  )}

                  {activeItem.title.includes('USJ') && onOpenUsj && (
                    <button
                      type="button"
                      onClick={onOpenUsj}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>🎢 USJ 타임테이블</span>
                    </button>
                  )}

                  {onOpenWeather && (
                    <button
                      type="button"
                      onClick={onOpenWeather}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>🌧️ 우천 대비 플랜B</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Case C: 이동 구간(교통 동선) 선택 시 (출발지→도착지, 이동수단, 소요시간, 예상비용, 주의사항) */}
          {activeTransit && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-slate-900 shadow-md animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                    {getTransitIcon(activeTransit.mode)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-slate-900 text-amber-300 px-2 py-0.5 rounded">
                        {activeTransit.modeLabel}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-950">
                        {activeTransit.fromTime} → {activeTransit.toTime} ({activeTransit.durationText})
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-950 mt-1 flex items-center gap-1.5">
                      <span>{activeTransit.fromTitle}</span>
                      <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{activeTransit.toTitle}</span>
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTransitId(null)}
                  className="p-1.5 hover:bg-amber-200 text-amber-900 rounded-lg cursor-pointer"
                  title="패널 닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cost & Tips Cards */}
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white border border-amber-200 rounded-xl">
                  <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span>예상 교통 비용</span>
                  </div>
                  <div className="font-black text-slate-900 text-sm">
                    {activeTransit.estimatedCost}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    4인 가족 1대 탑승 기준 (택시의 경우 할증 미포함)
                  </div>
                </div>

                <div className="p-3 bg-white border border-amber-200 rounded-xl">
                  <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>소요 시간 및 여유 권장</span>
                  </div>
                  <div className="font-black text-slate-900 text-sm">
                    {activeTransit.durationText}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    신호 대기 및 짐 싣고 내리는 시간 5~10분 포함
                  </div>
                </div>
              </div>

              {/* Notes & Taxi Action */}
              <div className="mt-3 p-3 bg-white/80 border border-amber-200/90 rounded-xl text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-amber-950">💡 가족 이동 팁: </span>
                {activeTransit.notes}
              </div>

              {/* Taxi Card Shortcut if Taxi mode */}
              {activeTransit.mode === 'taxi' && onOpenTaxi && (
                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-amber-200">
                  <span className="text-xs text-amber-900 font-bold">
                    기사님께 보여줄 일본어 큰 글씨 목적지 카드가 준비되어 있습니다.
                  </span>
                  <button
                    type="button"
                    onClick={onOpenTaxi}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>🚖 택시 목적지 카드 열기</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
