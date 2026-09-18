import React, { useState } from 'react';
import {
  Utensils,
  Clock,
  MapPin,
  Sparkles,
  CalendarCheck,
  Search,
  ExternalLink,
  Users,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { restaurantData } from '../data/guidebookData';
import { RestaurantItem } from '../types';

interface GourmetTabProps {
  onOpenRestaurantPhrases?: () => void;
  onOpenConvenience?: () => void;
}

export const GourmetTab: React.FC<GourmetTabProps> = ({
  onOpenRestaurantPhrases,
  onOpenConvenience,
}) => {
  const [filter, setFilter] = useState<'all' | 'pdf' | 'hidden' | 'dotonbori' | 'namba'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);

  // Reservation Modal State
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reserveRest, setReserveRest] = useState<RestaurantItem | null>(null);
  const [reserveDate, setReserveDate] = useState('2026-10-15');
  const [reserveTime, setReserveTime] = useState('17:30');
  const [partySize, setPartySize] = useState(4);
  const [specialRequests, setSpecialRequests] = useState('가족 4인 (성인/청소년), 알레르기 주의');
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const filteredRestaurants = restaurantData.filter((r) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pdf' && r.isPdfFeatured) ||
      (filter === 'hidden' && r.isHiddenGem) ||
      (filter === 'dotonbori' && r.area === '도톤보리') ||
      (filter === 'namba' && (r.area === '난바' || r.area === '구로몬 시장'));

    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.signatureDish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleOpenReservation = (r: RestaurantItem) => {
    setReserveRest(r);
    setReserveSuccess(false);
    setReservationModalOpen(true);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setReserveSuccess(true);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner with PDF Tips */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-amber-600 shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-amber-950">
            오사카 4인 가족 맛집 & 숨은 명소 가이드
          </h2>
        </div>
        <p className="text-xs text-amber-900 mt-1 leading-relaxed">
          PDF 가이드북 6p 수록 공식 맛집 및 도톤보리·난바 숨은 로컬 식당을 4인 가족 동선에 맞추어 엄선했습니다.
        </p>

        {/* PDF Gourmet Tips */}
        <div className="mt-2.5 pt-2.5 border-t border-amber-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900">
          <div className="flex items-start gap-1.5">
            <span className="font-bold text-amber-700 shrink-0">⏳ 피크 타임 회피:</span>
            <span>저녁 6~8시는 대기가 가장 깁니다. <strong>오후 5시대</strong>나 <strong>8시 반 이후</strong> 방문을 권장합니다.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="font-bold text-amber-700 shrink-0">📸 메뉴 번역 팁:</span>
            <span>아이 입맛에 안 맞을 수 있는 와사비/양념은 파파고 사진 번역으로 메뉴판을 사전 확인하세요.</span>
          </div>
        </div>

        {/* Quick Food Toolkits Row */}
        <div className="mt-3 pt-3 border-t border-amber-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {onOpenRestaurantPhrases && (
            <button
              type="button"
              onClick={onOpenRestaurantPhrases}
              className="p-2.5 bg-white hover:bg-amber-100/50 border border-amber-300 rounded-xl text-left flex items-center justify-between shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="text-xl p-1 bg-amber-100 rounded-lg group-hover:scale-110 transition-transform">
                  🍽️
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    현지 식당 맞춤 요청 카드
                  </div>
                  <div className="text-[11px] text-amber-900">
                    와사비 빼기 · 덜 짜게 · 앞접시 4개
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-700">열기 →</span>
            </button>
          )}

          {onOpenConvenience && (
            <button
              type="button"
              onClick={onOpenConvenience}
              className="p-2.5 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl text-left flex items-center justify-between shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="text-xl p-1 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                  🏪
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    편의점 야식 털이 도감
                  </div>
                  <div className="text-[11px] text-blue-900">
                    로손 모찌롤 · 세븐 계란샌드 · 치킨
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700">열기 →</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="식당명, 대표 메뉴(게요리, 라멘, 꼬치튀김, 만두 등) 검색..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: '전체 식당' },
            { id: 'pdf', label: '★ PDF 엄선 5대 맛집' },
            { id: 'hidden', label: '✨ 오사카 숨은 명소' },
            { id: 'dotonbori', label: '도톤보리 거리' },
            { id: 'namba', label: '난바 / 구로몬' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-rose-200 hover:shadow-sm transition-all"
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      {restaurant.area}
                    </span>
                    {restaurant.isPdfFeatured && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        PDF 6p 공식 추천
                      </span>
                    )}
                    {restaurant.isHiddenGem && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                        숨은 명소
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">{restaurant.nameJa}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-800 block">
                    {restaurant.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {restaurant.pricePerPerson}
                  </span>
                </div>
              </div>

              {/* Signature Dish */}
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-700">대표 메뉴: </span>
                <span className="text-rose-600 font-semibold">{restaurant.signatureDish}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {restaurant.description}
              </p>

              {/* Waiting & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] bg-slate-50/80 p-2 rounded-lg text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>예상 대기: <strong>{restaurant.waitingEstimate}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>추천 시간: <strong>{restaurant.bestVisitTime}</strong></span>
                </div>
              </div>

              {/* Family Tip */}
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-950">
                <span className="font-bold">👨‍👩‍👧‍👦 4인 가족 팁: </span>
                <span>{restaurant.familyTip}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
              <button
                onClick={() => handleOpenReservation(restaurant)}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>4인 가족 예약 / 방문 플랜</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  restaurant.nameJa
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1"
                title="지도 보기"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">지도</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Reservation & Family Visit Modal */}
      {reservationModalOpen && reserveRest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">4인 가족 테이블 예약 및 방문 등록</h3>
                <p className="text-xs text-rose-100">{reserveRest.name} ({reserveRest.nameJa})</p>
              </div>
              <button
                onClick={() => setReservationModalOpen(false)}
                className="p-1 rounded-full hover:bg-rose-700 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reserveSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">방문 플랜 등록 완료!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>{reserveRest.name}</strong> ({reserveDate} {reserveTime}, 4인 가족) 일정이 내 일정 및 가계부에 저장되었습니다.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-left text-slate-600 border border-slate-200 space-y-1 font-mono">
                  <p>📍 주소: {reserveRest.addressJa}</p>
                  <p>⏰ 골든 타임: {reserveRest.bestVisitTime}</p>
                  <p>💡 팁: 현장 방문 시 일본어 이름({reserveRest.nameJa})을 제시하세요.</p>
                </div>
                <button
                  onClick={() => setReservationModalOpen(false)}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  확인 완료
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmReservation} className="p-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">방문 날짜</label>
                  <select
                    value={reserveDate}
                    onChange={(e) => setReserveDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
                  >
                    <option value="1일차 (10/15) 저녁">1일차 저녁 (도톤보리 글리코상 관람 후)</option>
                    <option value="2일차 (10/16) 저녁">2일차 저녁 (USJ 복귀 후 숙소 인근)</option>
                    <option value="3일차 (10/17) 점심">3일차 점심 (오사카성 관람 후/우메다)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">방문 희망 시간</label>
                    <input
                      type="time"
                      value={reserveTime}
                      onChange={(e) => setReserveTime(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">인원 수</label>
                    <div className="flex items-center gap-1.5 p-1.5 border border-slate-300 rounded-xl bg-slate-50">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-800">4인 가족 기준</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">가족 요청 사항 및 알레르기 메모</label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="예: 와사비 따로, 갑각류 알레르기 있음, 창가 자리 희망"
                    className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                  📢 <strong>안내:</strong> 인기 맛집(가니도라쿠, 다루마)은 저녁 6~8시에 현장 대기가 발생할 수 있습니다. 17시대 이른 저녁 또는 포장 주문을 활용하시면 대기 없이 쾌적합니다.
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReservationModalOpen(false)}
                    className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
                  >
                    일정에 방문 예약 저장
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
