import React, { useState } from 'react';
import {
  X,
  Plane,
  Clock,
  Luggage,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

import { Accommodation } from '../types';

interface AirportDepartureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHotel?: Accommodation;
}

export const AirportDepartureModal: React.FC<AirportDepartureModalProps> = ({
  isOpen,
  onClose,
  selectedHotel,
}) => {
  // Flight departure time (default 18:30)
  const [flightTime, setFlightTime] = useState('18:30');
  const [copied, setCopied] = useState(false);
  const [baggageTab, setBaggageTab] = useState<'checked' | 'carryon'>('checked');

  if (!isOpen) return null;

  // Calculate milestones based on flightTime
  const [hours, minutes] = flightTime.split(':').map(Number);
  const flightDate = new Date();
  flightDate.setHours(hours || 18, minutes || 30, 0, 0);

  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  // Milestone 1: Gate Close (30 min before)
  const gateCloseTime = new Date(flightDate.getTime() - 30 * 60 * 1000);
  // Milestone 2: Airport Duty-Free & Security (2 hours before)
  const securityTime = new Date(flightDate.getTime() - 120 * 60 * 1000);
  // Milestone 3: Airport Arrival & Check-in (2.5 hours before)
  const airportArrivalTime = new Date(flightDate.getTime() - 150 * 60 * 1000);
  // Milestone 4: Nankai Rapi:t Departure (Airport arrival - 45 min for transit & buffer)
  const rapitDepartureTime = new Date(airportArrivalTime.getTime() - 45 * 60 * 1000);
  // Milestone 5: Hotel Checkout & Pick up luggage (dynamic based on hotel)
  const hotelTransitMinutes = selectedHotel?.checkOutMinutesToRapit || 45;
  const hotelCheckoutTime = new Date(rapitDepartureTime.getTime() - hotelTransitMinutes * 60 * 1000);
  const hotelName = selectedHotel?.nameKo || '숙소';
  const hotelDesc = selectedHotel?.area.includes('우메다')
    ? `${hotelName}에서 맡겨둔 캐리어를 찾고 미도스지선(10분)으로 난바역 이동 후 라피트 탑승`
    : selectedHotel?.id === 'swissotel-nankai'
    ? `${hotelName} 로비에서 짐을 찾고 전용 엘리베이터로 3층 라피트 개찰구 직통 이동 (도보 2분 최고 편리)`
    : `${hotelName}에서 맡겨둔 4인 캐리어를 찾고 ${selectedHotel?.stationDistance || '난바역'} 이동`;

  const milestones = [
    {
      time: formatTime(hotelCheckoutTime),
      title: `🏨 ${hotelName} 짐 찾기 & 역 이동`,
      desc: hotelDesc,
      badge: '여유 출발',
    },
    {
      time: formatTime(rapitDepartureTime),
      title: '🚅 난카이 특급 라피트(Rapi:t) 탑승',
      desc: '난바역에서 간사이공항까지 38분 소요 (전좌석 지정석, 짐 보관칸 잠금장치)',
      badge: '핵심 이동',
    },
    {
      time: formatTime(airportArrivalTime),
      title: '🛫 간사이공항 제1터미널 도착 & 수하물 위탁',
      desc: '항공사 카운터에서 4인 위탁 수하물 부치기 (무게 확인: 보통 15kg~23kg 한도)',
      badge: '출국 2.5시간 전',
    },
    {
      time: formatTime(securityTime),
      title: '🛍️ 보안검색 통과 & 출국장 면세점 쇼핑',
      desc: '로이즈 생초콜릿(보랭팩 추가), 도쿄바나나, 닷사이 사케 등 마지막 쇼핑',
      badge: '선물 구매',
    },
    {
      time: formatTime(gateCloseTime),
      title: '🚪 탑승구(Gate) 도착 & 비행기 탑승 시작',
      desc: '간사이공항은 셔틀 트레인(윙 셔틀) 이동이 필요할 수 있으므로 마감 30분 전 게이트 대기',
      badge: '마감 주의',
    },
    {
      time: flightTime,
      title: '✈️ 비행기 이륙 (귀국)',
      desc: '인천/김포/부산 공항으로 출발',
      badge: '출국 완료',
    },
  ];

  const handleCopyTimeline = () => {
    const text = [
      `✈️ [오사카 3일차 귀국 역산 타임라인 (항공편 ${flightTime} 기준)]`,
      `---------------------------------`,
      ...milestones.map((m) => `• [${m.time}] ${m.title}\n  - ${m.desc}`),
      `---------------------------------`,
      `⚠️ 수하물 주의: 곤약젤리/액체류는 캐리어 위탁! 보조배터리는 기내 휴대!`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Plane className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">간사이공항 출국 & 수하물 역산 플래너</h2>
              <p className="text-xs text-sky-100">3일차 귀국 항공편 기준 라피트·체크아웃 시간 자동 계산</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
          {/* Flight Time Setting Card */}
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>귀국 비행기 출발 시간 입력</span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                항공편 이륙 시간을 입력하면 모든 일정이 자동으로 역산됩니다.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={flightTime}
                onChange={(e) => setFlightTime(e.target.value)}
                className="px-3 py-2 bg-white border border-sky-300 rounded-xl font-mono text-base font-extrabold text-sky-950 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
              <button
                onClick={handleCopyTimeline}
                className="px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>일정 카톡 복사</span>
              </button>
            </div>
          </div>

          {/* Reverse Calculated Milestones Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-600 flex items-center justify-between">
              <span>권장 역산 일정표 (시간 엄수 필수)</span>
              <span className="text-[11px] text-sky-600 font-semibold">간사이공항은 혼잡도가 높습니다</span>
            </h3>

            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-sky-200">
              {milestones.map((m, idx) => (
                <div key={idx} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-sky-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-sky-600" />
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-sky-300 shadow-2xs transition-all space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm font-black text-sky-800 px-2 py-0.5 bg-sky-100 rounded-md">
                          {m.time}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{m.title}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-1">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Baggage Classifier: Checked vs Carry-on */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="bg-slate-900 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Luggage className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold">수하물 분류기 (공항 압수 방지)</h4>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setBaggageTab('checked')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    baggageTab === 'checked'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🧳 위탁 캐리어 전용
                </button>
                <button
                  onClick={() => setBaggageTab('carryon')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    baggageTab === 'carryon'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🎒 기내 휴대 전용
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50">
              {baggageTab === 'checked' ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-center gap-2 font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>기내로 들고 타면 검색대에서 무조건 압수 폐기되는 품목</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">✕</span>
                      <div>
                        <strong>곤약젤리 (파우치형 포함):</strong> 컵형은 국내 반입 자체가 금지이며, 파우치형도 기내 반입 시 액체류로 취급되어 100% 압수됩니다. <strong>무조건 큰 캐리어 안에 넣으세요!</strong>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">✕</span>
                      <div>
                        <strong>100ml 초과 액체/크림류:</strong> 퍼펙트휩 폼클렌징, 스킨, 로션, 선크림, 푸딩, 잼, 미소된장
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">✕</span>
                      <div>
                        <strong>주류 (위스키/사케):</strong> 시내 면세점에서 산 병 주류는 반드시 뽁뽁이로 감싸 캐리어 위탁 (1인당 2병/2L/합산 400달러 이하 면세)
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">✕</span>
                      <div>
                        <strong>도검/날붙이류:</strong> 손톱깎이, 눈썹칼, 가위, 장우산
                      </div>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>캐리어(위탁 수하물)에 넣으면 화재 위험으로 절대 안 되는 품목</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <div>
                        <strong>보조배터리 (휴대폰/카메라용):</strong> 위탁 수하물에 넣으면 짐 검사 시 호출되거나 강제 개봉됩니다. <strong>반드시 타는 가방(배낭)에 소지하세요.</strong>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <div>
                        <strong>라이터 (1인 1개 한정):</strong> 몸에 소지하거나 기내 휴대만 가능
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <div>
                        <strong>노트북, 태블릿, 카메라, 귀중품, 여권:</strong> 파손 및 분실 위험으로 기내 반입 권장
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* KIX Duty-Free Recommendations */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <span>간사이공항 출국장 내 필수 쇼핑 추천템</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 bg-white rounded-xl border border-amber-200">
                <div className="font-bold text-slate-900">로이즈 생초콜릿</div>
                <div className="text-[11px] text-slate-500">¥800 (보랭백 ¥100 추가 필수)</div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200">
                <div className="font-bold text-slate-900">도쿄바나나 (8입)</div>
                <div className="text-[11px] text-slate-500">¥1,080 부드러운 바나나빵</div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-amber-200">
                <div className="font-bold text-slate-900">시로이코이비토 (18입)</div>
                <div className="text-[11px] text-slate-500">¥1,320 홋카이도 쿠키</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            💡 라피트는 주말/성수기 매진이 빠르므로 한국에서 왕복 바우처를 미리 교환해두세요.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
