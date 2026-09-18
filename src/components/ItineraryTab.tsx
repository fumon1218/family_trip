import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Sparkles,
  AlertTriangle,
  Umbrella,
  Plus,
  Share2,
  RotateCcw,
  Tag,
  ChevronRight,
  Train,
  Camera,
  Utensils,
  Hotel,
  BarChart3,
  Layers,
  GitCommit,
} from 'lucide-react';
import { ScheduleItem, Accommodation, WeatherData } from '../types';
import { TimelineDiagram } from './TimelineDiagram';
import { WeatherAlertBanner } from './WeatherAlertBanner';

interface ItineraryTabProps {
  schedule: ScheduleItem[];
  onToggleComplete: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
  onResetSchedule: () => void;
  onOpenUsj?: () => void;
  onOpenWeather?: () => void;
  onOpenTaxi?: () => void;
  onOpenPacking?: () => void;
  onOpenDutyFree?: () => void;
  onOpenAirport?: () => void;
  onOpenPhotoSpots?: () => void;
  selectedHotel?: Accommodation;
  onOpenAccommodationModal?: () => void;
  weather?: WeatherData | null;
  rainSimulationDay?: number | null;
  onSetRainSimulationDay?: (day: number | null) => void;
  onRefreshWeather?: () => void;
}

export const ItineraryTab: React.FC<ItineraryTabProps> = ({
  schedule,
  onToggleComplete,
  onAddNote,
  onResetSchedule,
  onOpenUsj,
  onOpenWeather,
  onOpenTaxi,
  onOpenPacking,
  onOpenDutyFree,
  onOpenAirport,
  onOpenPhotoSpots,
  selectedHotel,
  onOpenAccommodationModal,
  weather,
  rainSimulationDay: propRainSimulationDay,
  onSetRainSimulationDay: propOnSetRainSimulationDay,
  onRefreshWeather,
}) => {
  const [internalRainDay, setInternalRainDay] = useState<number | null>(null);
  const rainSimulationDay = propRainSimulationDay !== undefined ? propRainSimulationDay : internalRainDay;
  const setRainSimulationDay = propOnSetRainSimulationDay || setInternalRainDay;

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [itineraryViewMode, setItineraryViewMode] = useState<'diagram' | 'list'>('diagram');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');
  const [showShareSuccess, setShowShareSuccess] = useState<boolean>(false);

  const filteredSchedule = selectedDay === 0
    ? schedule
    : schedule.filter((item) => item.day === selectedDay);

  const completedCount = filteredSchedule.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedCount / (filteredSchedule.length || 1)) * 100);

  const dayTitles: Record<number, { title: string; subtitle: string; weatherTip: string }> = {
    1: {
      title: '1일차: 오사카 입성과 도톤보리의 화려한 밤',
      subtitle: '간사이공항 → 라피트 → 난바 숙소 체크인 → 구로몬 시장 → 도톤보리 글리코상',
      weatherTip: '구로몬 시장은 전 구간 실내 아케이드입니다. 비가 와도 쾌적하게 맛있는 해산물 간식을 즐길 수 있습니다.',
    },
    2: {
      title: '2일차: 유니버설 스튜디오 재팬 (USJ) 종일 마스터',
      subtitle: '오픈런(08:40 도착) → 닌텐도 월드 & 해리포터 익스프레스 4 → 퍼레이드 & 버터맥주',
      weatherTip: 'USJ는 바다 근처라 저녁에 바람이 찹니다. 부모님과 자녀용 경량 겉옷 및 핫팩을 챙기세요. (외부 식사 반입 금지!)',
    },
    3: {
      title: '3일차: 오사카 역사 탐방, 닌텐도 스토어 쇼핑 후 귀국',
      subtitle: '체크아웃 짐보관 → 오사카성(300엔 전기차) → 우메다 다이마루 백화점 → 난바 면세쇼핑 → 라피트 탑승',
      weatherTip: '체력 안배 필수! 오사카성 정문 300엔 전기차를 이용하시고, 오후엔 우메다 다이마루 13층 실내 쇼핑을 즐기세요.',
    },
  };

  const getCategoryIcon = (category: ScheduleItem['category']) => {
    switch (category) {
      case 'transport':
        return <Train className="w-4 h-4 text-blue-600" />;
      case 'attraction':
        return <Camera className="w-4 h-4 text-rose-600" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'hotel':
        return <Hotel className="w-4 h-4 text-purple-600" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleCopyFamilyPlan = () => {
    const textPlan = schedule
      .filter((s) => selectedDay === 0 || s.day === selectedDay)
      .map(
        (s) =>
          `[${s.completed ? '완료' : '예정'}] ${s.time} - ${s.title} (${s.location})`
      )
      .join('\n');

    const shareContent = `🗾 [오사카 4인 가족 2박 3일 여행 일정표]\n베이스 숙소: ${selectedHotel?.nameKo || '미마루 오사카 난바 NORTH'}\n\n${textPlan}\n\n* 비상 집결지: [${selectedHotel?.nameKo || '숙소'}] 로비 (경찰 110 / 구급 119)`;

    navigator.clipboard.writeText(shareContent);
    setShowShareSuccess(true);
    setTimeout(() => setShowShareSuccess(false), 2500);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Active Basecamp Hotel Banner */}
      {selectedHotel && (
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-rose-200/90 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <Hotel className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  4인 가족 베이스캠프
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                  {selectedHotel.nameKo}
                </span>
                <span className="text-[11px] text-slate-500 hidden md:inline">({selectedHotel.area})</span>
              </div>
              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                {selectedHotel.nearestStation} • USJ {selectedHotel.area.includes('우메다') ? '단 16분 직통' : '25~28분'} • 라피트 {selectedHotel.stationDistance}
              </p>
            </div>
          </div>
          {onOpenAccommodationModal && (
            <button
              onClick={onOpenAccommodationModal}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shrink-0 transition-colors cursor-pointer shadow-xs"
            >
              🏨 숙소 변경
            </button>
          )}
        </div>
      )}

      {/* Weather Rain Notification Banner */}
      <WeatherAlertBanner
        weather={weather || null}
        schedule={schedule}
        selectedDay={selectedDay}
        onRefreshWeather={onRefreshWeather || (() => {})}
        onOpenWeatherRainyModal={onOpenWeather || (() => {})}
        onOpenPackingModal={onOpenPacking}
        rainSimulationDay={rainSimulationDay}
        onSetRainSimulationDay={setRainSimulationDay}
      />

      {/* View Mode Toggle: Timeline Diagram vs Detailed Card List */}
      <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => setItineraryViewMode('diagram')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            itineraryViewMode === 'diagram'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-rose-500" />
          <span>📊 타임라인 도표 뷰 (차트 & 노드)</span>
          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
            도표
          </span>
        </button>

        <button
          type="button"
          onClick={() => setItineraryViewMode('list')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            itineraryViewMode === 'list'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-slate-500" />
          <span>📋 상세 일정 카드 목록</span>
        </button>
      </div>

      {/* VIEW MODE 1: Interactive Timeline Diagram */}
      {itineraryViewMode === 'diagram' && (
        <div className="space-y-4">
          <TimelineDiagram
            schedule={schedule}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onToggleComplete={onToggleComplete}
            selectedHotel={selectedHotel}
            onOpenTaxi={onOpenTaxi}
            onOpenUsj={onOpenUsj}
            onOpenWeather={onOpenWeather}
            rainSimulationDay={rainSimulationDay}
            weather={weather}
          />

          <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span>텍스트 복사나 메모 작성이 필요하신가요?</span>
            <button
              type="button"
              onClick={() => setItineraryViewMode('list')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
            >
              상세 카드 목록으로 전환하기 →
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Detailed Cards & Timeline */}
      {itineraryViewMode === 'list' && (
        <div className="space-y-4">
          {/* Top Day Switcher */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { day: 1, label: '1일차', sub: '도톤보리' },
            { day: 2, label: '2일차', sub: 'USJ 완벽' },
            { day: 3, label: '3일차', sub: '오사카성' },
            { day: 0, label: '전체', sub: '2박 3일' },
          ].map((item) => (
            <button
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                selectedDay === item.day
                  ? 'bg-white text-rose-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="text-xs">{item.label}</div>
              <div className="text-[10px] text-slate-400 font-normal">{item.sub}</div>
            </button>
          ))}
        </div>

        {/* Day Header & Progress */}
        {selectedDay !== 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {dayTitles[selectedDay]?.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {dayTitles[selectedDay]?.subtitle}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-rose-600">
                  {completedCount} / {filteredSchedule.length} 완료
                </span>
                <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Weather / Travel Advice Tip & Rainy Guide Link */}
            <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200/70 rounded-xl space-y-1 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <Umbrella className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">당일 날씨·동선 핵심 팁: </span>
                  <span>{dayTitles[selectedDay]?.weatherTip}</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between border-t border-amber-200/50">
                <button
                  type="button"
                  onClick={onOpenWeather}
                  className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <span>☔️ 비 올 때의 대체 코스(플랜 B) & 복장 가이드 보기 →</span>
                </button>
              </div>
            </div>

            {/* Contextual Day Banners */}
            {selectedDay === 1 && (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {onOpenDutyFree && (
                  <button
                    type="button"
                    onClick={onOpenDutyFree}
                    className="p-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>🛍️</span>
                      <span>신사이바시·돈키호테 면세 계산기</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">쿠폰 보기 →</span>
                  </button>
                )}
                {onOpenPhotoSpots && (
                  <button
                    type="button"
                    onClick={onOpenPhotoSpots}
                    className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>📸</span>
                      <span>도톤보리 글리코상 숨은 포토존</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">구도 팁 →</span>
                  </button>
                )}
              </div>
            )}

            {/* USJ Special Banner on Day 2 */}
            {selectedDay === 2 && (
              <div className="mt-2.5 space-y-2">
                {onOpenUsj && (
                  <button
                    type="button"
                    onClick={onOpenUsj}
                    className="w-full p-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>🎢 USJ 익스프레스 4 & 닌텐도 월드 타임테이블 관리</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">
                      시간표 열기 →
                    </span>
                  </button>
                )}
                {onOpenPhotoSpots && (
                  <button
                    type="button"
                    onClick={onOpenPhotoSpots}
                    className="w-full p-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span>📸</span>
                      <span>USJ 닌텐도 토관 점프샷 & 해리포터 흑호수 반영 인생샷 가이드</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">보기 →</span>
                  </button>
                )}
              </div>
            )}

            {/* Day 3 Airport Departure Banner */}
            {selectedDay === 3 && (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {onOpenAirport && (
                  <button
                    type="button"
                    onClick={onOpenAirport}
                    className="p-2.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:opacity-95 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>✈️</span>
                      <span>간사이공항 출국 & 수하물 역산 플래너</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">시간 계산 →</span>
                  </button>
                )}
                {onOpenPhotoSpots && (
                  <button
                    type="button"
                    onClick={onOpenPhotoSpots}
                    className="p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>📸</span>
                      <span>오사카성 천수각 사쿠라몬 프레임 인생샷</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">구도 팁 →</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-xs font-medium text-slate-500">
          체크박스를 눌러 방문한 일정을 완료 처리하세요.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFamilyPlan}
            className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>일정 텍스트 복사</span>
          </button>
          <button
            onClick={onResetSchedule}
            className="p-1.5 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            title="일정 체크 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {showShareSuccess && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>가족 카카오톡/문자에 붙여넣을 수 있도록 일정이 클립보드에 복사되었습니다!</span>
        </div>
      )}

      {/* Schedule Timeline */}
      <div className="space-y-3">
        {filteredSchedule.map((item, index) => {
          const isCompleted = item.completed;
          const itemRainProb =
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

          const isRainAlert = itemRainProb >= 50 && isOutdoor;

          return (
            <div
              key={item.id}
              className={`relative bg-white rounded-2xl border p-3.5 sm:p-4 transition-all ${
                isRainAlert
                  ? 'border-blue-400 bg-blue-50/20 shadow-md ring-1 ring-blue-300'
                  : isCompleted
                  ? 'border-slate-200 bg-slate-50/70 opacity-80'
                  : 'border-slate-200/90 shadow-xs hover:border-rose-200 hover:shadow-sm'
              }`}
            >
              {/* Header line: Time, Badge, Rain Indicator, Checkbox */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.time}
                  </span>

                  {isRainAlert && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-blue-600 text-white shadow-xs animate-pulse">
                      <Umbrella className="w-3 h-3 text-cyan-200" />
                      <span>비 예보 {itemRainProb}%</span>
                    </span>
                  )}

                  <div className="p-1 bg-slate-50 border border-slate-200/70 rounded-md">
                    {getCategoryIcon(item.category)}
                  </div>

                  {item.badge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <Tag className="w-2.5 h-2.5" />
                      {item.badge}
                    </span>
                  )}

                  {item.travelTime && (
                    <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
                      {item.travelTime}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onToggleComplete(item.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                  title={isCompleted ? '완료 취소' : '방문 완료 표시'}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Title & Location */}
              <div className="mt-2">
                <h4
                  className={`text-sm sm:text-base font-bold ${
                    isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}
                >
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.location}</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>

              {/* Dedicated Rain Alert Warning Box */}
              {isRainAlert && (
                <div className="mt-2.5 p-3 bg-blue-100/70 border border-blue-300 rounded-xl text-xs text-blue-950 flex items-start justify-between gap-2 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <Umbrella className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                        <span>☔ [우천 경고] 비 예보 시간대입니다 (강수확률 {itemRainProb}%)</span>
                        <span className="text-[10px] bg-rose-600 text-white px-1.5 rounded">야외 보행 주의</span>
                      </div>
                      <p className="text-slate-700 text-[11px] mt-1">
                        💡 <strong>추천 우천 대체:</strong> {item.rainyBackup || '오사카 역사박물관(10층 실내 전망) 및 우메다 다이마루 백화점 실내 쇼핑'}
                      </p>
                    </div>
                  </div>
                  {onOpenWeather && (
                    <button
                      type="button"
                      onClick={onOpenWeather}
                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold shrink-0 shadow-xs cursor-pointer"
                    >
                      우천 대체 플랜B →
                    </button>
                  )}
                </div>
              )}

              {/* Emergency Tip */}
              {item.emergencyTip && (
                <div className="mt-2.5 p-2 bg-red-50/80 border border-red-200/60 rounded-lg flex items-start gap-1.5 text-xs text-red-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold">주의/꿀팁: </strong>
                    {item.emergencyTip}
                  </span>
                </div>
              )}

              {item.rainyBackup && !isRainAlert && (
                <div className="mt-2 p-2 bg-sky-50 border border-sky-200/70 rounded-lg flex items-start gap-1.5 text-xs text-sky-900">
                  <Umbrella className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold">우천 대체: </strong>
                    {item.rainyBackup}
                  </span>
                </div>
              )}

              {/* Family Notes */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {editingNoteId === item.id ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="가족 메모 (예: 닌텐도 굿즈 리스트, 간식 구매)"
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={() => {
                        onAddNote(item.id, tempNote);
                        setEditingNoteId(null);
                      }}
                      className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-700"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-slate-500 italic truncate max-w-[80%]">
                      {item.notes ? `📝 메모: ${item.notes}` : '가족 메모를 남길 수 있습니다.'}
                    </div>
                    <button
                      onClick={() => {
                        setEditingNoteId(item.id);
                        setTempNote(item.notes || '');
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-rose-600 shrink-0"
                    >
                      {item.notes ? '수정' : '+ 메모'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>
  );
};
