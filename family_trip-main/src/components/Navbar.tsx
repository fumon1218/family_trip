import React from 'react';
import {
  ShieldAlert,
  CloudSun,
  MapPin,
  Share2,
  Check,
  Wifi,
  WifiOff,
  Car,
  Luggage,
  Umbrella,
  Sparkles,
  ShoppingBag,
  Store,
  Utensils,
  Plane,
  Radar,
  Camera,
  Hotel,
} from 'lucide-react';
import { Accommodation } from '../types';

interface NavbarProps {
  onOpenSos: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onOpenTaxi?: () => void;
  onOpenPacking?: () => void;
  onOpenWeather?: () => void;
  onOpenUsj?: () => void;
  onOpenDutyFree?: () => void;
  onOpenConvenience?: () => void;
  onOpenRestaurantPhrases?: () => void;
  onOpenAirport?: () => void;
  onOpenFlightSchedule?: () => void;
  onOpenPhotoSpots?: () => void;
  selectedHotel?: Accommodation;
  onOpenAccommodationModal?: () => void;
  tripDays?: number;
  onOpenTripSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSos,
  isOffline,
  onToggleOffline,
  onOpenTaxi,
  onOpenPacking,
  onOpenWeather,
  onOpenUsj,
  onOpenDutyFree,
  onOpenConvenience,
  onOpenRestaurantPhrases,
  onOpenAirport,
  onOpenFlightSchedule,
  onOpenPhotoSpots,
  selectedHotel,
  onOpenAccommodationModal,
  tripDays = 3,
  onOpenTripSettings,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    const nights = Math.max(tripDays - 1, 0);
    if (navigator.share) {
      navigator.share({
        title: '오사카 4인 가족 완벽 여행 가이드북',
        text: `오사카 4인 가족 ${nights}박${tripDays}일 맞춤 일정, USJ 공략, 맛집 및 실시간 노선도 가이드`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2.5">
        {/* Title and Basecamp */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-xl">🗾</span>
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              오사카 4인 가족 가이드북
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              {Math.max(tripDays - 1, 0)}박 {tripDays}일 USJ 코스
            </span>
            {onOpenTripSettings && (
              <button
                onClick={onOpenTripSettings}
                className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer transition-colors"
                title="여행 기간 수정하기"
              >
                기간 수정
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="font-medium text-slate-700">숙소:</span>
            <span className="truncate font-semibold text-slate-800">
              {selectedHotel?.nameKo || '미마루 오사카 난바 NORTH'}
            </span>
            {onOpenAccommodationModal && (
              <button
                onClick={onOpenAccommodationModal}
                className="ml-0.5 px-1.5 py-0.2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200 shrink-0 transition-colors cursor-pointer"
                title="숙소(베이스캠프) 변경하기"
              >
                변경
              </button>
            )}
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Offline cache indicator */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? "오프라인 모드 (저장된 데이터 표시)" : "온라인 연결됨 (클릭 시 오프라인 모드 전환)"}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isOffline
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-emerald-700" /> : <Wifi className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden md:inline">{isOffline ? '오프라인' : '오프라인 저장'}</span>
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="가족에게 링크 공유"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* SOS Emergency button */}
          <button
            onClick={onOpenSos}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs transition-all animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS</span>
          </button>
        </div>
      </div>

      {/* Quick Access Utility Bar */}
      <div className="bg-slate-100/90 border-t border-slate-200/80 px-2 sm:px-4 py-1.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto scrollbar-none text-[11px] sm:text-xs">
          {onOpenAccommodationModal && (
            <button
              onClick={onOpenAccommodationModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <Hotel className="w-3.5 h-3.5 text-rose-100" />
              <span>🏨 숙소 변경</span>
            </button>
          )}

          <button
            onClick={onOpenTaxi}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            <Car className="w-3.5 h-3.5 text-amber-500" />
            <span>🚖 택시 목적지</span>
          </button>

          <button
            onClick={onOpenPacking}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            <Luggage className="w-3.5 h-3.5 text-emerald-500" />
            <span>🎒 준비물 체크</span>
          </button>

          <button
            onClick={onOpenWeather}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            <Umbrella className="w-3.5 h-3.5 text-blue-500" />
            <span>☀️ 날씨·우천대체</span>
          </button>

          <button
            onClick={onOpenUsj}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>🎢 USJ 타임테이블</span>
          </button>

          {onOpenDutyFree && (
            <button
              onClick={onOpenDutyFree}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              <span>🛍️ 면세 계산기</span>
            </button>
          )}

          {onOpenConvenience && (
            <button
              onClick={onOpenConvenience}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <Store className="w-3.5 h-3.5 text-blue-500" />
              <span>🏪 편의점 야식</span>
            </button>
          )}

          {onOpenRestaurantPhrases && (
            <button
              onClick={onOpenRestaurantPhrases}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <Utensils className="w-3.5 h-3.5 text-rose-500" />
              <span>🍽️ 식당 요청 카드</span>
            </button>
          )}

          {onOpenAirport && (
            <button
              onClick={onOpenAirport}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <Plane className="w-3.5 h-3.5 text-sky-500" />
              <span>✈️ 출국·수하물</span>
            </button>
          )}

          {onOpenFlightSchedule && (
            <button
              onClick={onOpenFlightSchedule}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <Radar className="w-3.5 h-3.5 text-indigo-500" />
              <span>🛫 항공편 조회</span>
            </button>
          )}

          {onOpenPhotoSpots && (
            <button
              onClick={onOpenPhotoSpots}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-slate-800 hover:text-purple-900 border border-slate-200 font-bold transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-purple-500" />
              <span>📸 인생샷 명당</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
