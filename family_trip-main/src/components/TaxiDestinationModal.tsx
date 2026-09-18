import React, { useState } from 'react';
import {
  X,
  Volume2,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Car,
  Maximize2,
  Minimize2,
  Navigation,
  Sparkles,
} from 'lucide-react';

import { Accommodation } from '../types';

interface TaxiSpot {
  id: string;
  nameKo: string;
  nameJa: string;
  addressJa: string;
  noteKo: string;
  tag: string;
}

const DEFAULT_TAXI_SPOTS: TaxiSpot[] = [
  {
    id: 'mimaru',
    nameKo: '미마루 오사카 난바 NORTH (우리 가족 숙소)',
    nameJa: 'MIMARU大阪 難波NORTH',
    addressJa: '大阪府大阪市西区南堀江1-2-10',
    noteKo: '요츠바시역 6번 출구 도보 4분, 오렌지스트리트 입구 부근',
    tag: '숙소',
  },
  {
    id: 'usj',
    nameKo: '유니버설 스튜디오 재팬 (USJ 택시 승강장)',
    nameJa: 'ユニバーサル・スタジオ・ジャパン (タクシー乗り場)',
    addressJa: '大阪府大阪市此花区桜島2-1-33',
    noteKo: 'JR 유니버설시티역 인근 택시 전용 승강장 (정문 보도 연결)',
    tag: '테마파크',
  },
  {
    id: 'osaka_castle',
    nameKo: '오사카성 (사쿠라몬・천수각 입구)',
    nameJa: '大阪城 (桜門・大手門付近)',
    addressJa: '大阪府大阪市中央区大阪城1-1',
    noteKo: '천수각 가장 가까운 사쿠라몬(桜門) 또는 오테몬 앞 하차',
    tag: '명소',
  },
  {
    id: 'namba_station',
    nameKo: '난바역 (다카시마야 백화점 앞)',
    nameJa: 'なんば駅 (高島屋前 タクシー乗り場)',
    addressJa: '大阪府大阪市中央区難波5-1-60',
    noteKo: '라피트 특급 탑승구 및 다카시마야 1층 택시 승강장',
    tag: '교통',
  },
  {
    id: 'kix',
    nameKo: '간사이 국제공항 제1터미널 (국제선 출발)',
    nameJa: '関西国際空港 第1ターミナル 4階 国際線出発ロビー',
    addressJa: '大阪府泉佐野市泉州空港北1',
    noteKo: '4층 국제선 출발 로비 정면 하차',
    tag: '공항',
  },
  {
    id: 'dotonbori',
    nameKo: '도톤보리 (글리코상 부근・도톤보리바시)',
    nameJa: '道頓堀 (道頓堀橋・戎橋付近)',
    addressJa: '大阪府大阪市中央区道頓堀1丁目',
    noteKo: '미도스지 도로 도톤보리 다리 앞 하차 (글리코상 바로 앞 도보 1분)',
    tag: '번화가',
  },
  {
    id: 'umeda_sky',
    nameKo: '우메다 스카이빌딩 (공중정원)',
    nameJa: '梅田スカイビル (空中庭園展望台)',
    addressJa: '大阪府大阪市北区大淀中1-1-88',
    noteKo: '우메다 스카이빌딩 1층 정문 회차로',
    tag: '전망대',
  },
  {
    id: 'kaiyukan',
    nameKo: '가이유칸 (해유관 수족관・덴포잔)',
    nameJa: '海遊館 (天保山ハーバービレッジ)',
    addressJa: '大阪府大阪市港区海岸通1-1-10',
    noteKo: '덴포잔 대관람차 및 수족관 정문 앞',
    tag: '실내수족관',
  },
];

const TAXI_PHRASES = [
  {
    ko: '이곳으로 가주세요',
    ja: 'ここまでお願いします',
    romaji: '코코마데 오네가이시마스',
  },
  {
    ko: '트렁크를 열어주시겠습니까? (짐 4개 적재)',
    ja: 'トランクを開けていただけますか？',
    romaji: '토란쿠오 아케테 이타다케마스카?',
  },
  {
    ko: '여기서 내려주세요',
    ja: 'ここで降ろしてください',
    romaji: '코코데 오로시테 쿠다사이',
  },
  {
    ko: '영수증을 주세요',
    ja: '領収書（レシート）をください',
    romaji: '료-슈-쇼(레시-토)오 쿠다사이',
  },
  {
    ko: '신용카드로 결제 가능한가요?',
    ja: 'クレジットカードで支払えますか？',
    romaji: '쿠레짓토카-도데 시하라에마스카?',
  },
];

interface TaxiDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHotel?: Accommodation;
}

export const TaxiDestinationModal: React.FC<TaxiDestinationModalProps> = ({
  isOpen,
  onClose,
  selectedHotel,
}) => {
  const hotelSpot: TaxiSpot = selectedHotel
    ? {
        id: selectedHotel.id,
        nameKo: `${selectedHotel.nameKo} (우리 가족 숙소)`,
        nameJa: selectedHotel.nameJa,
        addressJa: selectedHotel.addressJa,
        noteKo: `${selectedHotel.nearestStation} (${selectedHotel.taxiNote})`,
        tag: '숙소',
      }
    : DEFAULT_TAXI_SPOTS[0];

  const spotsList: TaxiSpot[] = [
    hotelSpot,
    ...DEFAULT_TAXI_SPOTS.filter((s) => s.id !== 'mimaru'),
  ];

  const [selectedSpot, setSelectedSpot] = useState<TaxiSpot>(hotelSpot);
  const [isFullscreenMode, setIsFullscreenMode] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Update selected spot when hotel changes
  React.useEffect(() => {
    if (selectedHotel) {
      setSelectedSpot({
        id: selectedHotel.id,
        nameKo: `${selectedHotel.nameKo} (우리 가족 숙소)`,
        nameJa: selectedHotel.nameJa,
        addressJa: selectedHotel.addressJa,
        noteKo: `${selectedHotel.nearestStation} (${selectedHotel.taxiNote})`,
        tag: '숙소',
      });
    }
  }, [selectedHotel]);

  if (!isOpen) return null;

  const currentDestination = isCustomMode && customName.trim()
    ? {
        id: 'custom',
        nameKo: customName,
        nameJa: customName,
        addressJa: customAddress || '大阪府内',
        noteKo: '사용자 직접 입력 목적지',
        tag: '직접입력',
      }
    : selectedSpot;

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className={`bg-white w-full rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all ${
          isFullscreenMode
            ? 'max-w-4xl h-[94vh]'
            : 'max-w-2xl max-h-[92vh]'
        }`}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-1.5">
                <span>🚖 택시 기사용 목적지 카드</span>
                <span className="text-[11px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  원터치 대형 글씨
                </span>
              </h2>
              <p className="text-xs text-slate-300">스마트폰 화면을 기사님께 그대로 보여주세요</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreenMode(!isFullscreenMode)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title={isFullscreenMode ? '기본 크기로 축소' : '기사님 전용 초대형 전체화면'}
            >
              {isFullscreenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Spot Selector Chips */}
        {!isFullscreenMode && (
          <div className="p-3 bg-slate-100 border-b border-slate-200 overflow-x-auto scrollbar-none flex items-center gap-2">
            {spotsList.map((spot) => (
              <button
                key={spot.id}
                onClick={() => {
                  setSelectedSpot(spot);
                  setIsCustomMode(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  !isCustomMode && selectedSpot.id === spot.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {spot.tag}: {spot.nameJa.split(' ')[0]}
              </button>
            ))}
            <button
              onClick={() => setIsCustomMode(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isCustomMode
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              + 직접 입력
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Custom Input Form if active */}
          {isCustomMode && !isFullscreenMode && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs">
              <div className="font-bold text-amber-900">목적지 직접 입력 (호텔/식당 등)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="목적지 이름 (예: 焼肉 力丸 心斎橋店)"
                  className="p-2 bg-white border border-amber-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="일본어 주소 (구글 지도 주소 복사)"
                  className="p-2 bg-white border border-amber-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* DRIVER DISPLAY CARD (High Contrast, Bold, Extra Large) */}
          <div className="bg-amber-300 text-slate-950 p-5 sm:p-7 rounded-3xl border-4 border-slate-900 shadow-lg space-y-4 text-center">
            <div className="inline-flex items-center gap-1.5 bg-slate-900 text-amber-300 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide">
              <span>運転手さんへ (기사님께)</span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
              ここまでお願いします。
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800">
              (여기로 가주세요 / 코코마데 오네가이시마스)
            </div>

            {/* Target Destination Box */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-slate-900 text-left space-y-2 shadow-inner">
              <div className="text-xs font-bold text-rose-600 flex items-center justify-between">
                <span>📍 目的地 (목적지)</span>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  {currentDestination.nameKo}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {currentDestination.nameJa}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <div className="text-[11px] font-bold text-slate-500">住所 (주소)</div>
                <div className="text-base sm:text-lg font-bold text-slate-800 break-keep">
                  {currentDestination.addressJa}
                </div>
              </div>

              {currentDestination.noteKo && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl font-medium">
                  💡 참고: {currentDestination.noteKo}
                </div>
              )}
            </div>

            {/* Audio & Copy Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={() => handleSpeak(`${currentDestination.nameJa}までお願いします`)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>일본어 발음 들려주기</span>
              </button>

              <button
                onClick={() => handleCopy(`${currentDestination.nameJa} (${currentDestination.addressJa})`)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 border border-slate-900 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>주소 복사</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentDestination.nameJa + ' ' + currentDestination.addressJa)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>구글 지도 열기</span>
              </a>
            </div>
          </div>

          {/* Quick Taxi Communication Phrases */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>택시 안에서 바로 쓰는 원터치 일본어 회화</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TAXI_PHRASES.map((phrase, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 hover:border-slate-400 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900">{phrase.ko}</div>
                    <div className="text-sm font-extrabold text-blue-700 font-mono mt-0.5">
                      {phrase.ja}
                    </div>
                    <div className="text-[11px] text-slate-500">{phrase.romaji}</div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleSpeak(phrase.ja)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition-colors"
                      title="발음 듣기"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(phrase.ja)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 transition-colors"
                      title="일본어 복사"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>💡 일본 택시는 자동문입니다. 손으로 문을 열지 마세요.</span>
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
