import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  Copy,
  Check,
  Flame,
  Coffee,
  CheckCircle2,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { NearbyAtmConvenienceFinder } from './NearbyAtmConvenienceFinder';

interface ConvenienceStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemInfo {
  nameKo: string;
  nameJa: string;
  pronounce: string;
  priceJpy: number;
  category: '디저트' | '치킨/핫스낵' | '식사/면/샌드' | '음료/주류';
  desc: string;
  familyTip: string;
  badge?: string;
}

const LAWSON_ITEMS: ItemInfo[] = [
  {
    nameKo: 'Uchi Café 쫀득한 모찌롤 (플레인/초코)',
    nameJa: 'もち食感ロール',
    pronounce: '모치 숏칸 로오루',
    priceJpy: 343,
    category: '디저트',
    desc: '일본 편의점 디저트 부동의 1위. 쫀득쫀득한 떡 같은 빵 피에 신선하고 달콤한 우유 생크림이 가득.',
    familyTip: '미마루 호텔 냉장고에 넣어두었다가 밤에 시원하게 4조각씩 나눠먹기 최고!',
    badge: '★ 시그니처 1위',
  },
  {
    nameKo: '가라아게쿤 (레귤러 / 레드매콤 / 치즈)',
    nameJa: 'からあげクン',
    pronounce: '카라아게쿤',
    priceJpy: 248,
    category: '치킨/핫스낵',
    desc: '계산대 옆 온장고에 있는 로손의 명물 치킨 너겟. 닭가슴살을 부드럽게 튀겨 겉바속촉.',
    familyTip: '치즈맛은 아이들에게 인기 만점, 레드맛은 어른들 맥주 안주로 제격입니다.',
    badge: '핫스낵 필수',
  },
  {
    nameKo: 'Uchi Café 프리미엄 롤케이크',
    nameJa: 'プレミアムロールケーキ',
    pronounce: '푸레미아무 로오루케에키',
    priceJpy: 194,
    category: '디저트',
    desc: '홋카이도산 생크림의 진한 풍미. 숟가락으로 푹 떠먹는 케이크.',
    familyTip: '스푼을 꼭 받아와서 아이들과 함께 떠먹어보세요.',
  },
  {
    nameKo: '악마의 주먹밥 (아쿠마노 오니기리)',
    nameJa: '悪魔のおにぎり',
    pronounce: '아쿠마노 오니기리',
    priceJpy: 140,
    category: '식사/면/샌드',
    desc: '텐카스(튀김부스러기), 쯔유, 파래김을 버무려 한번 먹으면 멈출 수 없는 중독적인 맛.',
    familyTip: '전자레인지에 살짝(15초) 데워 먹으면 풍미가 2배가 됩니다.',
  },
];

const SEVEN_ITEMS: ItemInfo[] = [
  {
    nameKo: '듬뿍 계란 샌드위치 (타마고 산도)',
    nameJa: 'たっぷりたまごサンド',
    pronounce: '탓푸리 타마고 산도',
    priceJpy: 324,
    category: '식사/면/샌드',
    desc: '성시경 인생 샌드위치로 유명한 전설의 에그마요. 촉촉한 식빵과 부드러운 달걀의 황금 비율.',
    familyTip: '아침 조식으로 미마루 호텔에서 커피/우유와 함께 곁들이기 가장 좋습니다.',
    badge: '★ 전국민 극찬',
  },
  {
    nameKo: '오하요 쟈지 우유 푸딩 (Jersey Milk)',
    nameJa: 'ジャージー牛乳プリン',
    pronounce: '쟈아지이 규우뉴우 푸린',
    priceJpy: 178,
    category: '디저트',
    desc: '희귀 쟈지 품종 젖소 우유로 만들어 생크림처럼 진하고 입안에서 사르르 녹아내리는 푸딩.',
    familyTip: '푸딩을 싫어하던 분도 빠져드는 맛. 4개 한 번에 사두는 것 추천!',
    badge: '인생 푸딩',
  },
  {
    nameKo: '세븐 카페 부드러운 슈크림',
    nameJa: 'シュー・ア・ラ・クレーム',
    pronounce: '슈우 아 라 쿠레엠',
    priceJpy: 181,
    category: '디저트',
    desc: '바삭하고 고소한 슈 피 속에 바닐라빈이 콕콕 박힌 커스터드 크림이 꽉 차 있음.',
    familyTip: '한 입 베어 물면 크림이 넘쳐흐르니 물티슈를 준비하세요.',
  },
  {
    nameKo: '냉동 세븐프리미엄 야키교자 (만두 5입)',
    nameJa: '７プレミアム 焼き餃子',
    pronounce: '야키 교오자',
    priceJpy: 160,
    category: '식사/면/샌드',
    desc: '호텔 전자레인지에 봉지째 넣고 돌리면 바삭하고 육즙 터지는 군만두 완성.',
    familyTip: '미마루 호텔에 전자레인지가 구비되어 있어 밤 11시 야식으로 최고입니다.',
  },
];

const FAMILYMART_ITEMS: ItemInfo[] = [
  {
    nameKo: '패미치키 (Famichiki 원조 순살치킨)',
    nameJa: 'ファミチキ',
    pronounce: '파미치키',
    priceJpy: 230,
    category: '치킨/핫스낵',
    desc: '일본 편의점 치킨의 원조. 한입 베어 물면 육즙이 뚝뚝 떨어지는 극강의 부드러움.',
    familyTip: '계산대에서 "파미치키 2개 주세요"하면 즉시 따뜻한 종이봉투에 담아줍니다.',
    badge: '★ 편의점 치킨 제왕',
  },
  {
    nameKo: '패미마 카페 프라페 (딸기/쿠키앤크림)',
    nameJa: 'ファミマフラッペ',
    pronounce: '파미마 후랏뻬',
    priceJpy: 350,
    category: '디저트',
    desc: '냉동고에서 컵을 골라 카운터 계산 후, 커피 머신에서 따뜻한 우유를 부어 섞어 마시는 슬러시.',
    familyTip: '아이들이 직접 머신 버튼을 누르고 저어 만드는 재미가 쏠쏠합니다.',
  },
  {
    nameKo: '수플레 푸딩 (치즈 수플레 푸딩)',
    nameJa: 'スフレ・プリン',
    pronounce: '스후레 푸린',
    priceJpy: 320,
    category: '디저트',
    desc: '폭신폭신한 치즈 수플레 케이크 아래에 바닐라 커스터드 푸딩이 통째로 레이어드된 명작.',
    familyTip: '달콤함과 치즈 풍미가 완벽하여 2박 3일 중 꼭 한 번은 먹어봐야 할 디저트.',
  },
  {
    nameKo: '야키소바 빵',
    nameJa: '焼きそばパン',
    pronounce: '야키소바 팡',
    priceJpy: 180,
    category: '식사/면/샌드',
    desc: '핫도그 빵 사이에 감칠맛 가득한 볶음 국수와 초생강이 들어간 일본 만화 속 대표 간식.',
    familyTip: '간단하게 일본 길거리 감성을 느끼며 아침 허기를 채우기 좋습니다.',
  },
];

const DRINK_ITEMS: ItemInfo[] = [
  {
    nameKo: '아사히 수퍼드라이 생맥주캔 (생맥주 거품 캔)',
    nameJa: 'アサヒスーパードライ 生ジョッキ缶',
    pronounce: '나마 죡키칸',
    priceJpy: 220,
    category: '음료/주류',
    desc: '뚜껑 전체를 따면 풍성한 크림 생맥주 거품이 솟아오르는 신개념 맥주.',
    familyTip: '캔을 두 손으로 감싸 쥐면 체온에 의해 거품이 더욱 풍성하게 올라옵니다.',
    badge: '생맥주 거품 캔',
  },
  {
    nameKo: '이로하스 복숭아 물',
    nameJa: 'いろはす 白桃',
    pronounce: '이로하스 하쿠토오',
    priceJpy: 140,
    category: '음료/주류',
    desc: '생수처럼 맑은데 한 모금 마시면 진하고 향긋한 천연 백도 과즙 향이 퍼지는 음료.',
    familyTip: 'USJ나 도톤보리 걸어 다닐 때 4명 가방에 1병씩 넣어 다니기 최고입니다.',
  },
  {
    nameKo: '산토리 호로요이 (화이트샤워 / 복숭아)',
    nameJa: 'ほろよい',
    pronounce: '호로요이',
    priceJpy: 160,
    category: '음료/주류',
    desc: '알코올 도수 3%로 술을 잘 못 마시는 가족도 기분 좋게 즐길 수 있는 탄산 과실주.',
    familyTip: '미마루 호텔 객실에서 하루 일정을 마치고 가볍게 치얼스하기 좋습니다.',
  },
  {
    nameKo: '메이지 불가리아 요구르트 / 야쿠르트 1000',
    nameJa: 'ヤクルト1000 / 明治ヨーグルト',
    pronounce: '야쿠루토 센',
    priceJpy: 160,
    category: '음료/주류',
    desc: '여행 중 피로 회복과 장 건강을 위한 일본 국민 유산균 음료.',
    familyTip: '매일 아침 공복에 한 병씩 마시면 든든합니다.',
  },
];

const CONVENIENCE_PHRASES = [
  {
    id: 'heat',
    label: '전자레인지 데워주세요',
    ja: 'これを温めていただけますか？',
    pron: '고레오 아타타메테 이타다케마스카?',
  },
  {
    id: 'chopsticks',
    label: '젓가락 / 숟가락 4개 주세요',
    ja: 'お箸とスプーンを4人分お願いします。',
    pron: '오하시토 스푼오 요닌분 오네가이시마스',
  },
  {
    id: 'bag',
    label: '큰 비닐봉투 1장 주세요',
    ja: 'レジ袋（大きいサイズ）を1枚お願いします。',
    pron: '레지부쿠로 오오키이 사이즈오 이치마이 오네가이시마스',
  },
  {
    id: 'straw',
    label: '빨대 4개 부탁드립니다',
    ja: 'ストローを4本お願いします。',
    pron: '스토로오 욘혼 오네가이시마스',
  },
  {
    id: 'fork',
    label: '포크 4개 부탁드립니다',
    ja: 'フォークを4人分お願いします。',
    pron: '포오쿠오 요닌분 오네가이시마스',
  },
  {
    id: 'receipt',
    label: '영수증 주세요',
    ja: 'レシートをお願いします。',
    pron: '레시이토오 오네가이시마스',
  },
];

export const ConvenienceStoreModal: React.FC<ConvenienceStoreModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedChain, setSelectedChain] = useState<'lawson' | 'seven' | 'family' | 'drinks' | 'nearby'>(
    'lawson'
  );
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activePhraseCard, setActivePhraseCard] = useState<string | null>(null);

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
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const getCurrentItems = () => {
    switch (selectedChain) {
      case 'lawson':
        return LAWSON_ITEMS;
      case 'seven':
        return SEVEN_ITEMS;
      case 'family':
        return FAMILYMART_ITEMS;
      case 'drinks':
        return DRINK_ITEMS;
      case 'nearby':
        return [];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl text-xl">🏪</div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">오사카 편의점 야식 털이 & 디저트 도감</h2>
              <p className="text-xs text-blue-100">로손 · 세븐 · 패밀리마트 4인 가족 필수 꿀조합</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chain Selector Tabs */}
        <div className="bg-slate-100 p-2 flex gap-1 border-b border-slate-200 shrink-0 overflow-x-auto">
          <button
            onClick={() => setSelectedChain('lawson')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              selectedChain === 'lawson'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>💙 로손 (모찌롤·가라아게)</span>
          </button>
          <button
            onClick={() => setSelectedChain('seven')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              selectedChain === 'seven'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>💚 세븐 (계란샌드·푸딩)</span>
          </button>
          <button
            onClick={() => setSelectedChain('family')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              selectedChain === 'family'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🩵 패밀리마트 (치킨·프라페)</span>
          </button>
          <button
            onClick={() => setSelectedChain('drinks')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              selectedChain === 'drinks'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>🍺 맥주 & 과실음료</span>
          </button>
          <button
            onClick={() => setSelectedChain('nearby')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              selectedChain === 'nearby'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📍 내 주변 ATM/편의점</span>
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChain === 'nearby' && <NearbyAtmConvenienceFinder />}

          {/* Items Grid */}
          {selectedChain !== 'nearby' && (
          <div className="space-y-3">
            {getCurrentItems().map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900">
                        {item.nameKo}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-jp text-blue-700 font-bold">{item.nameJa}</span>
                      <span className="text-slate-400">({item.pronounce})</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-slate-950">
                      ¥{item.priceJpy.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      약 {Math.round(item.priceJpy * 9.2).toLocaleString()}원
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>

                <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">4인 가족 꿀팁: </span>
                    <span>{item.familyTip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Real-time Japanese Requests for Cashier */}
          {selectedChain !== 'nearby' && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">편의점 계산대 원터치 소통 카드 (점원에게 제시)</h3>
              </div>
              <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md">
                클릭 시 음성 재생
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CONVENIENCE_PHRASES.map((ph) => (
                <div
                  key={ph.id}
                  onClick={() => {
                    playTTS(ph.ja);
                    setActivePhraseCard(ph.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    activePhraseCard === ph.id
                      ? 'bg-blue-900/60 border-blue-400 text-white'
                      : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                    <span>{ph.label}</span>
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="font-jp text-sm font-black text-white">{ph.ja}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">발음: {ph.pron}</div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            💡 미마루 호텔 도보 2분 거리에 로손 & 패밀리마트가 있습니다.
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
