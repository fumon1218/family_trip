import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  MapPin,
  Sparkles,
  Volume2,
  Check,
  Copy,
  ChevronRight,
  ShieldAlert,
  Users,
  Sun,
  RefreshCw,
} from 'lucide-react';
import { fetchOsakaSunTimes, formatJstTime, SunTimes } from '../utils/liveDataService';

interface PhotoSpotGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PhotoSpot {
  id: string;
  location: string;
  titleKo: string;
  subTitle: string;
  tag: string;
  secretPoint: string;
  familyPoseTip: string;
  crowdAvoidance: string;
  icon: string;
}

const PHOTO_SPOTS: PhotoSpot[] = [
  {
    id: 'glico-riverwalk',
    location: '도톤보리',
    titleKo: '톰보리 리버워크 강변 산책로 (다리 아래)',
    subTitle: '에비스바시 다리 위 인파를 피하는 1등 명당',
    tag: '글리코상',
    secretPoint:
      '다리 위는 사람이 꽉 차서 4명이 서면 가려집니다. 다리 옆 계단으로 내려와 돈키호테 앞 강변 데크로 가면 글리코상이 정면 상단에 딱 들어오며 인파 없이 여유롭습니다.',
    familyPoseTip:
      '4인 가족이 일렬로 나란히 서서 한쪽 다리를 들고 양손을 번쩍 드는 원조 글리코 러너 만세 포즈!',
    crowdAvoidance: '밤 8시 이후보다 오후 5시 노을 질 무렵 조명이 켜질 때 방문하면 가장 화사합니다.',
    icon: '🏃',
  },
  {
    id: 'glico-track',
    location: '도톤보리',
    titleKo: 'H&M 건물 앞 야외 육상 트랙 매트',
    subTitle: '글리코상과 같은 트랙을 달리는 착시 샷',
    tag: '글리코상',
    secretPoint:
      'H&M 건물 앞 바닥에 빨간 우레탄 육상 트랙 라인이 그려져 있습니다. 카메라를 바닥에 가깝게 낮춰(로우 앵글) 촬영하면 진짜 트랙에서 달리는 입체감이 살아납니다.',
    familyPoseTip: '아이들을 앞쪽에 배치하고 부모님이 뒤에서 스타트 끊는 달리기 자세 추천!',
    crowdAvoidance: '도톤보리 번화가 중심이므로 아침 10시 이전 한산할 때 방문 권장.',
    icon: '👟',
  },
  {
    id: 'usj-nintendo-pipe',
    location: 'USJ',
    titleKo: '슈퍼 닌텐도 월드 녹색 파이프(토관) 입구',
    subTitle: '게임 세상 속으로 워프하는 환상의 순간',
    tag: 'USJ 닌텐도',
    secretPoint:
      '초록 파이프 속으로 들어가는 터널 안쪽에서 빛이 비칩니다. 파이프 테두리에 가족이 걸터앉거나 머리만 쏙 내미는 샷이 명물입니다.',
    familyPoseTip:
      '마리오/루이지 모자나 파워업 밴드를 착용하고 파이프 속으로 빨려 들어가는 듯한 코믹한 표정과 뒷모습 점프!',
    crowdAvoidance: '오전 9시 30분 확약 입장 직후 또는 일몰 후 네온 조명이 켜졌을 때 촬영.',
    icon: '🍄',
  },
  {
    id: 'usj-potter-lake',
    location: 'USJ',
    titleKo: '해리포터 호그와트 성 흑호수(Black Lake) 반영 샷',
    subTitle: '호수에 성이 거울처럼 완벽히 비치는 인생샷',
    tag: 'USJ 해리포터',
    secretPoint:
      '많은 분들이 호그스미드 마을 입구에서 찍지만, 성 뒤편 세 자루 빗자루 레스토랑 테라스나 호숫가 선착장 산책로로 가면 잔잔한 수면에 호그와트 성이 데칼코마니처럼 비칩니다.',
    familyPoseTip: '마법 지팡이를 들고 성을 향해 주문을 외우는(루모스!) 실루엣 포즈.',
    crowdAvoidance: '바람이 불지 않는 잔잔한 오후 시간대에 호수 반영이 가장 맑고 뚜렷합니다.',
    icon: '🏰',
  },
  {
    id: 'usj-globe',
    location: 'USJ',
    titleKo: '유니버설 스튜디오 정문 거대 회전 지구본',
    subTitle: 'UNIVERSAL 글자가 정면으로 올 때 찰칵',
    tag: 'USJ 정문',
    secretPoint:
      '지구본이 천천히 자전하므로 ‘UNIVERSAL’ 흰 글자가 카메라 정면을 통과하는 순간(약 1~2분 간격)을 기다렸다가 연속 촬영해야 실패가 없습니다.',
    familyPoseTip: '지구본 바로 앞 난간에서 4인이 손을 맞잡고 점프하는 단체샷!',
    crowdAvoidance: '퇴장 시간(저녁 7시~)에는 인파가 몰리므로 아침 입장 전 08:30경 촬영 추천.',
    icon: '🌍',
  },
  {
    id: 'osaka-sakuramon',
    location: '오사카성',
    titleKo: '사쿠라몬(桜門) 거대 석축 아치 프레임',
    subTitle: '성문 아치가 천수각을 액자처럼 감싸는 구도',
    tag: '오사카성',
    secretPoint:
      '본마루로 들어가는 사쿠라몬 성문 바깥쪽에서 성문을 렌즈 프레임으로 삼아 안쪽의 천수각을 올려다보면 자연스러운 액자(프레임) 효과가 완성됩니다.',
    familyPoseTip: '성문 거석(다코이시) 앞에 4인이 서면 성벽의 압도적인 웅장함이 대비됩니다.',
    crowdAvoidance: '오전 10시 이전 햇살이 천수각 전면을 비출 때가 가장 청명합니다.',
    icon: '🏯',
  },
];

const PHOTO_PHRASES = [
  {
    id: 'take',
    ko: '사진 한 장 찍어주시겠어요?',
    ja: '写真を撮っていただけますか？',
    pron: '샤신오 톳테 이타다케마스카?',
  },
  {
    id: 'one-more',
    ko: '한 장만 더 부탁드립니다.',
    ja: 'もう一枚お願いします。',
    pron: '모오 이치마이 오네가이시마스',
  },
  {
    id: 'shutter',
    ko: '셔터만 눌러주시면 됩니다.',
    ja: 'シャッターを押すだけで大丈夫です。',
    pron: '샷타아오 오스다케데 다이죠오부데스',
  },
  {
    id: 'thank',
    ko: '정말 감사합니다!',
    ja: 'ありがとうございます！',
    pron: '아리가토오 고자이마스!',
  },
];

export const PhotoSpotGuideModal: React.FC<PhotoSpotGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('전체');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [sunLoading, setSunLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setSunLoading(true);
      const result = await fetchOsakaSunTimes();
      if (!cancelled) {
        setSunTimes(result);
        setSunLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const tags = ['전체', '글리코상', 'USJ 닌텐도', 'USJ 해리포터', 'USJ 정문', '오사카성'];

  const filteredSpots = PHOTO_SPOTS.filter(
    (s) => selectedTag === '전체' || s.tag === selectedTag
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Camera className="w-5 h-5 text-pink-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">4인 가족 인생샷 숨은 포토존 가이드</h2>
              <p className="text-xs text-pink-100">글리코상 · USJ 닌텐도/해리포터 · 오사카성 구도 명당</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="bg-slate-100 p-2 flex gap-1 border-b border-slate-200 overflow-x-auto shrink-0">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedTag === t
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
          {/* Live Sunset / Golden Hour Widget (sunrise-sunset.org API, no key required) */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sun className="w-4.5 h-4.5" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-amber-950">오늘 오사카 골든아워</span>
                  <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                    실시간 연동
                  </span>
                </div>
                {sunLoading ? (
                  <p className="text-amber-800 mt-0.5">일몰 시각을 확인하는 중...</p>
                ) : sunTimes ? (
                  <p className="text-amber-900 mt-0.5">
                    일몰{' '}
                    <span className="font-extrabold">{formatJstTime(sunTimes.sunsetJst)}</span> (일본시간) · 골든아워{' '}
                    <span className="font-extrabold">
                      {formatJstTime(sunTimes.goldenHourStartJst)}~{formatJstTime(sunTimes.goldenHourEndJst)}
                    </span>
                  </p>
                ) : (
                  <p className="text-amber-700 mt-0.5">일몰 정보를 불러오지 못했습니다.</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                setSunLoading(true);
                setSunTimes(await fetchOsakaSunTimes());
                setSunLoading(false);
              }}
              className="p-1.5 rounded-xl border border-amber-300 bg-white/70 hover:bg-white text-amber-700 cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${sunLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Spots Grid */}
          <div className="space-y-3">
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 shadow-2xs transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-2 bg-purple-50 rounded-xl">{spot.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                          {spot.location}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {spot.titleKo}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{spot.subTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Secret Angle */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                  <div className="font-bold text-purple-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>숨은 촬영 각도 & 구도 팁:</span>
                  </div>
                  <p>{spot.secretPoint}</p>
                </div>

                {/* Family Pose & Timing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-950">
                    <span className="font-bold">👨‍👩‍👧‍👦 4인 추천 포즈: </span>
                    <span>{spot.familyPoseTip}</span>
                  </div>
                  <div className="p-2 bg-sky-50/70 border border-sky-200 rounded-xl text-sky-950">
                    <span className="font-bold">⏰ 한산한 타이밍: </span>
                    <span>{spot.crowdAvoidance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Asking for Photo Japanese Helper Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs sm:text-sm font-bold">주변 사람에게 가족사진 부탁할 때</h4>
              </div>
              <span className="text-[10px] bg-slate-800 text-pink-300 px-2 py-0.5 rounded-md">
                클릭 시 음성 재생
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PHOTO_PHRASES.map((ph) => (
                <div
                  key={ph.id}
                  onClick={() => playTTS(ph.ja)}
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-pink-300">
                    <span>{ph.ko}</span>
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="font-jp text-sm font-black text-white">{ph.ja}</div>
                  <div className="text-[11px] text-slate-400">발음: {ph.pron}</div>
                </div>
              ))}
            </div>
          </div>

          {/* USJ Selfie Stick Rule Box */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-800">⚠️ USJ 셀카봉/삼각대 이용 규정: </span>
              <span>
                USJ 파크 내에서는 <strong>길게 뻗어서 사용하는 셀카봉 및 삼각대 설치가 전면 금지</strong>되어 있습니다. 
                셀카봉은 손잡이를 완전히 접어 손바닥 크기 내에서만 사용해야 하며, 가족 단체샷은 파크 직원(크루)이나 주변 관람객에게 친절하게 부탁하는 것이 가장 안전하고 좋습니다.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            가족과 함께 잊지 못할 오사카 인생샷을 남겨보세요!
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
