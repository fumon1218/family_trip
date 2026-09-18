import React, { useState } from 'react';
import {
  X,
  Hotel,
  MapPin,
  Check,
  Sparkles,
  Train,
  Car,
  Clock,
  Compass,
  Building,
  Plus,
  ArrowRight,
  ShieldCheck,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Accommodation } from '../types';
import { osakaAccommodations } from '../data/guidebookData';

interface AccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHotel: Accommodation;
  onSelectHotel: (hotel: Accommodation) => void;
}

export const AccommodationModal: React.FC<AccommodationModalProps> = ({
  isOpen,
  onClose,
  selectedHotel,
  onSelectHotel,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'namba' | 'umeda' | 'custom'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [changeSuccessNotice, setChangeSuccessNotice] = useState<string | null>(null);

  // Custom hotel form state
  const [customNameKo, setCustomNameKo] = useState('');
  const [customNameJa, setCustomNameJa] = useState('');
  const [customAddressJa, setCustomAddressJa] = useState('');
  const [customStation, setCustomStation] = useState('');
  const [customArea, setCustomArea] = useState('난바 / 도톤보리');
  const [customRoomType, setCustomRoomType] = useState('4인 패밀리룸');
  const [customTransitUSJ, setCustomTransitUSJ] = useState('지하철 환승 25~30분');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelect = (hotel: Accommodation) => {
    onSelectHotel(hotel);
    setChangeSuccessNotice(`[${hotel.nameKo}] 숙소로 변경되어 일정표, 택시 카드, USJ 동선, 공항 플래너가 모두 자동 갱신되었습니다!`);
    setTimeout(() => {
      setChangeSuccessNotice(null);
    }, 3500);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNameKo.trim()) return;

    const isUmeda = customArea.includes('우메다');

    const newHotel: Accommodation = {
      id: `custom-${Date.now()}`,
      nameKo: customNameKo.trim(),
      nameJa: customNameJa.trim() || customNameKo.trim(),
      addressJa: customAddressJa.trim() || '大阪市内',
      nearestStation: customStation.trim() || '지하철역 도보 5분',
      stationDistance: customStation.trim() || '도보 5분',
      area: customArea,
      badge: '사용자 지정 숙소',
      roomType: customRoomType.trim() || '4인 맞춤 객실',
      transitToNamba: '지하철/택시로 난바역 이동',
      transitToUSJ: customTransitUSJ.trim() || (isUmeda ? 'JR 오사카역 → USJ 16분' : '난바역 → 니시쿠조 환승 → USJ 28분'),
      transitToDotonbori: isUmeda ? '미도스지선 지하철 10분' : '도보 5~10분',
      transitToAirport: isUmeda ? '오사카역 하루카(45분) 또는 난바역 라피트' : '난카이 난바역 라피트 38분',
      features: ['사용자 지정 숙소', '4인 가족 베이스캠프', customRoomType.trim()],
      taxiNote: `${customNameJa.trim() || customNameKo.trim()}までお願いします。`,
      checkInGuide: `${customStation.trim() || '지하철역'} 인근 위치. 체크인 후 짐 풀기.`,
      checkOutMinutesToRapit: isUmeda ? 55 : 45,
      coordinates: isUmeda ? { x: 50, y: 26 } : { x: 50, y: 56 },
      isCustom: true,
    };

    handleSelect(newHotel);
    setActiveFilter('all');
  };

  const filteredHotels = osakaAccommodations.filter((h) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'namba') return h.area.includes('난바') || h.area.includes('도톤보리') || h.area.includes('신사이바시');
    if (activeFilter === 'umeda') return h.area.includes('우메다');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <Hotel className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">오사카 4인 가족 숙소(베이스캠프) 변경</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold">실시간 동기화</span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                숙소를 변경하면 일정표·택시 주소·USJ 동선·공항 출국 시간이 자동 갱신됩니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Success Banner Toast */}
        {changeSuccessNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <Check className="w-4 h-4 shrink-0 text-white" />
            <span>{changeSuccessNotice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          {/* Active Hotel Highlight Card */}
          <div className="bg-white p-4 rounded-2xl border-2 border-rose-500 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 현재 적용 중인 숙소
                </span>
                <span className="text-xs font-semibold text-slate-500">{selectedHotel.area}</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>체크인 동선 & 택시 카드 연동 중</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{selectedHotel.nameKo}</span>
                    <span className="text-xs font-normal text-slate-500">({selectedHotel.nameJa})</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{selectedHotel.nearestStation}</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold shrink-0">
                  {selectedHotel.badge}
                </span>
              </div>

              {/* Dynamic Auto-Calculated Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[11px] text-slate-600 font-medium">🎢 USJ 이동 소요</div>
                  <div className="font-bold text-slate-900 mt-0.5 truncate">
                    {selectedHotel.area.includes('우메다') ? '약 16분 (JR 직통)' : '약 25~28분'}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[11px] text-slate-600 font-medium">🚄 라피트/난바역</div>
                  <div className="font-bold text-slate-900 mt-0.5 truncate">{selectedHotel.stationDistance}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[11px] text-slate-600 font-medium">🍢 도톤보리 접근</div>
                  <div className="font-bold text-slate-900 mt-0.5 truncate">{selectedHotel.transitToDotonbori}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-[11px] text-slate-600 font-medium">🛏️ 객실 구성</div>
                  <div className="font-bold text-slate-900 mt-0.5 truncate">{selectedHotel.roomType}</div>
                </div>
              </div>

              {/* Japanese Address for Taxi */}
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-amber-900 mr-1.5 shrink-0">🚖 택시용 주소:</span>
                  <span className="font-mono text-slate-700 truncate">{selectedHotel.addressJa}</span>
                </div>
                <button
                  onClick={() => handleCopy(selectedHotel.addressJa, 'current')}
                  className="px-2 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 transition-colors shrink-0 flex items-center gap-1"
                >
                  {copiedId === 'current' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'current' ? '복사됨' : '복사'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sync Explanation Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">숙소 변경 시 연동되는 내용:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 text-slate-600">
                <div>• 1일차 체크인 및 도톤보리 야간 복귀 동선</div>
                <div>• 2일차 USJ 유니버설시티역 최적 환승 경로 및 시간</div>
                <div>• 3일차 체크아웃 & 짐보관 스케줄 자동 갱신</div>
                <div>• 택시 카드 1순위 목적지(우리 가족 숙소) 즉시 교체</div>
                <div>• 간사이공항 출국 역산 플래너 숙소 출발 시간 재계산</div>
                <div>• 관광지 실시간 지도 내 베이스캠프 핀 위치 동기화</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === 'all' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                전체 추천 ({osakaAccommodations.length})
              </button>
              <button
                onClick={() => setActiveFilter('namba')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === 'namba' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                난바/도톤보리
              </button>
              <button
                onClick={() => setActiveFilter('umeda')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFilter === 'umeda' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                우메다/역직결 (USJ 16분)
              </button>
              <button
                onClick={() => setActiveFilter('custom')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  activeFilter === 'custom' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>직접 입력</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500">
              * 4인 가족(자녀+부모)에게 최적화된 호텔들입니다
            </span>
          </div>

          {/* Custom Hotel Input Form View */}
          {activeFilter === 'custom' ? (
            <form onSubmit={handleCreateCustom} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building className="w-5 h-5 text-rose-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">사용자 직접 입력 (내 숙소 등록)</h4>
                  <p className="text-xs text-slate-500">예약해두신 숙소 정보를 입력하면 모든 일정과 도구에 즉시 반영됩니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">숙소명 (한글) *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 소테츠 그랜드 프레사 오사카 난바"
                    value={customNameKo}
                    onChange={(e) => setCustomNameKo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">숙소명 (일본어/영문) *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 相鉄グランドフレッサ 大阪なんば"
                    value={customNameJa}
                    onChange={(e) => setCustomNameJa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">일본어 주소 (택시 기사용) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 大阪府大阪市中央区日本橋1-1-13"
                  value={customAddressJa}
                  onChange={(e) => setCustomAddressJa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-slate-50 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">가장 가까운 역 & 출구 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 닛폰바시역 6번 출구 도보 1분"
                    value={customStation}
                    onChange={(e) => setCustomStation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">위치 지역 선택</label>
                  <select
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-slate-50"
                  >
                    <option value="난바 / 도톤보리">난바 / 도톤보리</option>
                    <option value="신사이바시">신사이바시</option>
                    <option value="우메다 / 키타">우메다 / 키타</option>
                    <option value="텐노지">텐노지</option>
                    <option value="기타 오사카 시내">기타 오사카 시내</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">객실 형태 / 베드 구성</label>
                  <input
                    type="text"
                    placeholder="예: 4인 패밀리 쿼드룸 / 싱글 4개"
                    value={customRoomType}
                    onChange={(e) => setCustomRoomType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">USJ 이동 경로</label>
                  <input
                    type="text"
                    placeholder="예: 난바역 → 니시쿠조 환승 → USJ (26분)"
                    value={customTransitUSJ}
                    onChange={(e) => setCustomTransitUSJ(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-rose-500 bg-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>이 숙소로 설정 및 전체 일정표에 즉시 반영하기</span>
              </button>
            </form>
          ) : (
            /* Curated Hotels List */
            <div className="space-y-3">
              {filteredHotels.map((hotel) => {
                const isSelected = selectedHotel.id === hotel.id;
                return (
                  <div
                    key={hotel.id}
                    className={`bg-white p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                            {hotel.nameKo}
                          </h4>
                          <span className="text-xs text-slate-500">({hotel.nameJa})</span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            {hotel.badge}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-semibold text-slate-800">{hotel.nearestStation}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{hotel.roomType}</span>
                        </div>
                      </div>

                      {/* Select Action Button */}
                      <button
                        onClick={() => handleSelect(hotel)}
                        disabled={isSelected}
                        className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 cursor-default'
                            : 'bg-slate-900 hover:bg-rose-600 text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4 text-rose-600" />
                            <span>현재 선택됨</span>
                          </>
                        ) : (
                          <>
                            <span>이 숙소로 변경</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Features Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                      {hotel.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Train className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-semibold text-slate-900">USJ 이동:</span>
                        <span className="truncate">{hotel.area.includes('우메다') ? '단 16분 (오사카역)' : '25~28분'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Car className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-slate-900">라피트역:</span>
                        <span className="truncate">{hotel.stationDistance}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 col-span-2 sm:col-span-1">
                        <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-900">도톤보리:</span>
                        <span className="truncate">{hotel.transitToDotonbori}</span>
                      </div>
                    </div>

                    {/* Japanese Address for Taxi */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="font-mono truncate">주소: {hotel.addressJa}</span>
                      <button
                        onClick={() => handleCopy(hotel.addressJa, hotel.id)}
                        className="text-slate-600 hover:text-slate-900 font-semibold shrink-0 flex items-center gap-1"
                      >
                        {copiedId === hotel.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === hotel.id ? '복사됨' : '주소 복사'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            현재 적용 숙소: <strong className="text-slate-900">{selectedHotel.nameKo}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
