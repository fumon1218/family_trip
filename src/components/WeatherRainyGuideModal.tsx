import React, { useState } from 'react';
import {
  X,
  CloudSun,
  Umbrella,
  Thermometer,
  Wind,
  Droplets,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building,
  MapPin,
  Compass,
} from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherRainyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather?: WeatherData | null;
}

export const WeatherRainyGuideModal: React.FC<WeatherRainyGuideModalProps> = ({ isOpen, onClose, weather }) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'rainy_plan' | 'indoor_spots'>('rainy_plan');

  if (!isOpen) return null;

  const defaultForecastData = [
    {
      day: '1일차 (입국 & 도톤보리)',
      temp: '8°C / 16°C',
      condition: '맑음 후 구름',
      rainProb: '20%',
      icon: '⛅',
      clothing: '낮엔 쾌적, 저녁 도톤보리 강바람 쌀쌀함. 가디건/경량 외투 필수.',
    },
    {
      day: '2일차 (USJ 종일)',
      temp: '7°C / 14°C',
      condition: '맑고 바닷바람 강함',
      rainProb: '10%',
      icon: '☀️',
      clothing: '오사카만 바닷바람으로 체감온도 낮음. 핫팩 4개 & 바람막이 외투 지참!',
    },
    {
      day: '3일차 (오사카성 & 출국)',
      temp: '9°C / 17°C',
      condition: '온화하고 화창함',
      rainProb: '15%',
      icon: '🌤️',
      clothing: '오사카성 산책 시 땀날 수 있음. 탈착 편한 이너웨어 & 편안한 운동화.',
    },
  ];

  const forecastData = weather?.forecast && weather.forecast.length > 0
    ? weather.forecast.map((f, i) => ({
        day: f.day,
        temp: `${f.tempMin}°C / ${f.tempMax}°C`,
        condition: f.condition,
        rainProb: f.rainProb,
        icon: (f.rainProbNumber ?? 0) >= 50 ? '🌧️' : f.condition.includes('맑음') ? '☀️' : '⛅',
        clothing: f.tip || defaultForecastData[i]?.clothing || '활동하기 편한 레이어드 룩 추천',
        isLive: true,
      }))
    : defaultForecastData;

  const rainyPlans = [
    {
      day: '1일차 비 올 때의 대체 플랜',
      original: '난바역 → 도톤보리 야외 거리 산책 → 구로몬 시장 야외',
      backup: '신사이바시스지 지붕 아케이드 쇼핑 & 난바 파크스 실내 복합몰',
      details: [
        '구로몬 시장은 전 구간 아케이드 덮개가 있어 비가 와도 100% 쾌적하게 길거리 해산물/소고기 시식 가능!',
        '도톤보리 다리 위 기념촬영 후, 길이 600m의 천장 덮개가 있는 [신사이바시스지 아케이드]로 즉시 이동.',
        '저녁 식사는 비 안 맞는 난바 지하상가(난바 워크) 직통 맛집 또는 난바 파크스 6~8층 식당가 이용.',
      ],
      tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      day: '2일차 비 올 때 (USJ 우천 대응)',
      original: 'USJ 야외 롤러코스터 및 야외 워터월드',
      backup: 'USJ 핵심 실내 어트랙션 집중 공략 또는 [가이유칸 수족관] 플랜B',
      details: [
        '【USJ 내 우천 대응】: 비가 와도 핵심 라이드 4대(해리포터 포비든 저니, 마리오 카트 쿠파의 도전장, 스파이더맨, 미니언 메이헴)는 모두 실내 건물 안에서 진행되므로 100% 정상 가동됩니다!',
        '파크 내 판초 우비(약 1,500엔~2,000엔)를 구입해 착용하면 우산 없이 양손 자유롭게 이동 가능.',
        '【극심한 폭우 시 대체 코스】: 지하철 츄오선 타고 [가이유칸(海遊館) 수족관]으로 이동. 세계 최대급 실내 수조에서 고래상어를 감상하고 덴포잔 마켓플레이스 실내 쇼핑 즐기기.',
      ],
      tagColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      day: '3일차 비 올 때의 대체 플랜',
      original: '오사카성 천수각 야외 공원 산책 (약 1.5시간 보행)',
      backup: '오사카 역사박물관(실내) + 우메다 다이마루 백화점 실내 풀코스',
      details: [
        '오사카성 야외 보행 대신 오사카성 바로 맞은편에 위치한 [오사카 역사박물관] 10층으로 이동. 실내에서 오사카성 전체 뷰를 통유리로 감상 가능!',
        '오후 우메다 이동 시 한큐/한신/다이마루 백화점 및 지하상가 [화이티 우메다]가 지하철과 100% 지하 연결되어 있어 우산 한 번 안 펴고 이동 가능.',
        '다이마루 백화점 13층 닌텐도 오사카 & 포켓몬 센터에서 실내 가족 쇼핑 마스터.',
      ],
      tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  const indoorSpots = [
    {
      name: '가이유칸 (海遊館, 해유관 수족관)',
      location: '오사카코역 (난바에서 지하철 25분)',
      desc: '세계 최대급 실내 수조와 거대 고래상어, 물범, 펭귄을 볼 수 있는 전천후 1등 실내 명소.',
      tip: '덴포잔 마켓플레이스 실내 쇼핑몰 및 대관람차와 바로 연결됨.',
    },
    {
      name: '신사이바시스지 상점가 (전구간 아케이드)',
      location: '신사이바시역 ~ 난바역 직결',
      desc: '비 한 방울 맞지 않는 총길이 600m 이상의 대형 지붕 상점가. 쇼핑 및 디저트 천국.',
      tip: '다이마루 백화점 본관과 바로 연결되어 쇼핑과 휴식이 편리함.',
    },
    {
      name: '난바 워크 & 난바 파크스 (지하 복합몰)',
      location: '난바역 지하 연결',
      desc: '난바역에서 숙소 근처까지 지하 통로(난바 워크)로 연결되어 우천 시 이동이 매우 쾌적.',
      tip: '다양한 실내 드럭스토어 및 푸드코트가 입점.',
    },
    {
      name: '우메다 다이마루 & 루쿠아 (LUCUA) 백화점',
      location: 'JR 오사카역 / 우메다역 직결',
      desc: '13층 닌텐도 오사카, 포켓몬 센터, 지브리 동구리 공화국 등 캐릭터 굿즈의 성지.',
      tip: '지하 1층부터 지상 10층 이상까지 전 층 실내 이동 가능.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-rose-700 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-amber-300 flex items-center justify-center">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-1.5">
                <span>☀️ 오사카 기상 & 우천 시 대체 가이드</span>
              </h2>
              <p className="text-xs text-blue-100">비가 와도 완벽한 2박 3일 실내 대체 코스</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('rainy_plan')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rainy_plan'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Umbrella className="w-4 h-4 text-blue-600" />
            <span>우천 시 대체 코스 (플랜 B)</span>
          </button>

          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'forecast'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-4 h-4 text-rose-500" />
            <span>일자별 날씨 & 복장 팁</span>
          </button>

          <button
            onClick={() => setActiveTab('indoor_spots')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'indoor_spots'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-amber-600" />
            <span>실내 명소 TOP 4</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* TAB 1: RAINY PLAN */}
          {activeTab === 'rainy_plan' && (
            <div className="space-y-3.5">
              <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
                <Umbrella className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>오사카는 아케이드와 지하통로가 발달한 도시입니다!</strong> 비가 오더라도 실내 연결로와 아케이드를 활용하면 여행 만족도를 그대로 유지할 수 있습니다.
                </div>
              </div>

              {rainyPlans.map((plan, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                      {plan.day}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${plan.tagColor}`}>
                      우천 맞춤 플랜
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-slate-500 flex items-center gap-1">
                      <span className="font-semibold text-rose-600">기존 야외 코스:</span> {plan.original}
                    </div>
                    <div className="text-slate-900 font-bold flex items-start gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>대체 실내 코스: {plan.backup}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    {plan.details.map((detail, dIdx) => (
                      <div key={dIdx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: FORECAST & CLOTHING */}
          {activeTab === 'forecast' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3">
                {forecastData.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.day}</h4>
                          <p className="text-xs text-slate-500">{item.condition} · 강수확률 {item.rainProb}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-rose-600 font-mono">{item.temp}</span>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      <strong>💡 옷차림 & 패킹 권장:</strong> {item.clothing}
                    </div>
                  </div>
                ))}
              </div>

              {/* General Clothing Advice */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>4인 가족 추천 의류 전략</span>
                </h4>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  <li><strong>레이어드 룩:</strong> 낮에는 걷다 보면 더울 수 있으므로 벗기 편한 얇은 니트나 가디건을 껴입으세요.</li>
                  <li><strong>접이식 우산:</strong> 가족 4명이 한 가방에 각 1개씩 경량 우산을 넣고 다니면 갑작스러운 소나기에도 안심입니다.</li>
                  <li><strong>신발:</strong> 방수 스프레이를 출발 전 뿌려두면 오사카에서 비가 와도 젖지 않고 쾌적합니다.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: INDOOR SPOTS */}
          {activeTab === 'indoor_spots' && (
            <div className="space-y-3">
              {indoorSpots.map((spot, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{spot.name}</span>
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {spot.location}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{spot.desc}</p>
                  <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded-xl font-medium">
                    💡 꿀팁: {spot.tip}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>🌦️ 기상 변화 시 비짓재팬웹 & USJ 공식 앱 알림을 함께 확인하세요.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
