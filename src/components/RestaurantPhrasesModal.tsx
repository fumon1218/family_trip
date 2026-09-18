import React, { useState } from 'react';
import {
  X,
  Utensils,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Search,
  MessageSquare,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface RestaurantPhrasesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RequestCard {
  id: string;
  category: '필수 요청' | '아이/가족' | '맛/조절' | '주문/계산' | '알레르기';
  titleKo: string;
  descKo: string;
  textJa: string;
  pronounce: string;
  icon: string;
  isPopular?: boolean;
}

const RESTAURANT_REQUESTS: RequestCard[] = [
  {
    id: 'wasabi',
    category: '맛/조절',
    titleKo: '와사비 빼주세요 (스시/초밥집)',
    descKo: '스시나 초밥, 덮밥 주문 시 아이나 매운 것을 못 드시는 분을 위해',
    textJa: 'わさび抜きでお願いします。',
    pronounce: '와사비 누키데 오네가이시마스',
    icon: '🍣',
    isPopular: true,
  },
  {
    id: 'less-salty',
    category: '맛/조절',
    titleKo: '간을 덜 짜게 해주세요 (라멘/우동/국물)',
    descKo: '일본 국물이 짤 때 육수를 연하게 하거나 온수를 부어달라고 할 때',
    textJa: '味を少し薄めにできますか？（お湯を入れても大丈夫です）',
    pronounce: '아지오 스코시 우스메니 데키마스카? (오유오 이레테모 다이죠오부데스)',
    icon: '🍜',
    isPopular: true,
  },
  {
    id: 'plates-4',
    category: '아이/가족',
    titleKo: '앞접시 4개 & 포크 주세요',
    descKo: '가족 4인이 요리를 쉐어할 때 필수적인 앞접시와 어린이용 포크 요청',
    textJa: '取り皿4枚とフォークをお願いします。',
    pronounce: '토리자라 욘마이토 포오쿠오 오네가이시마스',
    icon: '🍽️',
    isPopular: true,
  },
  {
    id: 'water-refill',
    category: '필수 요청',
    titleKo: '얼음물 (또는 따뜻한 차) 더 주세요',
    descKo: '일본 식당에서 물 리필을 원할 때',
    textJa: 'お冷（または温かいお茶）のおかわりをお願いします。',
    pronounce: '오히야 (마타와 아타타카이 오차) 노 오카와리오 오네가이시마스',
    icon: '🧊',
    isPopular: true,
  },
  {
    id: 'seat-4',
    category: '필수 요청',
    titleKo: '4명인데 함께 앉을 수 있나요?',
    descKo: '인기 맛집 입장 시 4인 테이블이나 인접 좌석 착석 가능 여부 확인',
    textJa: '4人ですが、一緒に座れる席はありますか？',
    pronounce: '요닌데스가, 잇쇼니 스와레루 세키와 아리마스카?',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'recommend',
    category: '주문/계산',
    titleKo: '이 집의 가장 인기 있는 추천 메뉴는?',
    descKo: '메뉴판이 복잡할 때 점원에게 대표 메뉴 물어보기',
    textJa: '一番人気のおすすめメニューは何ですか？',
    pronounce: '이치방 닌키노 오스스메 메뉴우와 난데스카?',
    icon: '⭐',
  },
  {
    id: 'english-menu',
    category: '필수 요청',
    titleKo: '한국어(또는 영어) 메뉴판이 있나요?',
    descKo: '일본어 전용 메뉴판일 때 사진이나 다국어 메뉴 요청',
    textJa: '韓国語（または英語）のメニューはありますか？',
    pronounce: '칸코쿠고 (마타와 에이고) 노 메뉴우와 아리마스카?',
    icon: '📖',
  },
  {
    id: 'bill-together',
    category: '주문/계산',
    titleKo: '계산은 한 번에 할게요 (영수증 포함)',
    descKo: '식사 후 테이블 또는 계산대에서 총액 일괄 결제',
    textJa: 'お会計は一緒にお願いします。レシートもください。',
    pronounce: '오카이케이와 잇쇼니 오네가이시마스. 레시이토모 쿠다사이',
    icon: '💳',
  },
  {
    id: 'allergy-shrimp',
    category: '알레르기',
    titleKo: '갑각류(새우/게) 알레르기가 있습니다',
    descKo: '새우, 게 등이 들어간 튀김이나 육수를 피해야 할 때',
    textJa: '甲殻類（エビ・カニ）のアレルギーがあります。除いていただけますか？',
    pronounce: '코오카쿠루이 (에비, 카니) 노 아레루기이가 아리마스. 노조이테 이타다케마스카?',
    icon: '🦐',
  },
  {
    id: 'allergy-peanut',
    category: '알레르기',
    titleKo: '땅콩/견과류 알레르기가 있습니다',
    descKo: '디저트나 소스에 땅콩이 들어가지 않도록 확인',
    textJa: 'ナッツ類（ピーナッツ）のアレルギーがあります。',
    pronounce: '낫츠루이 (피이나츠) 노 아레루기이가 아리마스',
    icon: '🥜',
  },
];

export const RestaurantPhrasesModal: React.FC<RestaurantPhrasesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCard, setSelectedCard] = useState<RequestCard>(RESTAURANT_REQUESTS[0]);
  const [filterCategory, setFilterCategory] = useState<string>('전체');
  const [copied, setCopied] = useState(false);
  const [isBigScreenMode, setIsBigScreenMode] = useState(false);

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const categories = ['전체', '맛/조절', '아이/가족', '필수 요청', '주문/계산', '알레르기'];

  const filteredCards = RESTAURANT_REQUESTS.filter(
    (c) => filterCategory === '전체' || c.category === filterCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Utensils className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">오사카 식당 맞춤 요청 카드</h2>
              <p className="text-xs text-rose-100">와사비 빼기 · 덜 짜게 · 4인 앞접시 · 점원 보여주기</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Japanese Display Card (Top Showcase for Waiter) */}
        <div className="p-4 bg-slate-900 text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <span>{selectedCard.icon}</span>
              <span>{selectedCard.titleKo}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => playTTS(selectedCard.textJa)}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="일본어 원어민 발음 재생"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>발음 듣기</span>
              </button>
              <button
                onClick={() => handleCopy(selectedCard.textJa)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all cursor-pointer"
                title="텍스트 복사"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Huge Japanese text container to show waiter */}
          <div className="bg-slate-950 p-4 rounded-xl border-2 border-amber-400/80 text-center space-y-1.5 shadow-inner">
            <div className="text-[11px] text-amber-300 font-bold tracking-wider">
              👉 점원에게 이 화면을 그대로 보여주세요
            </div>
            <div className="font-jp text-xl sm:text-2xl font-black text-white leading-relaxed select-all">
              {selectedCard.textJa}
            </div>
            <div className="text-xs text-slate-400">
              발음: <span className="text-amber-200">{selectedCard.pronounce}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400 text-center">
            💡 {selectedCard.descKo}
          </div>
        </div>

        {/* Category Pills */}
        <div className="bg-slate-100 p-2 flex gap-1 border-b border-slate-200 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterCategory === cat
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Card Selection List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCards.map((card) => {
            const isSelected = selectedCard.id === card.id;
            return (
              <div
                key={card.id}
                onClick={() => {
                  setSelectedCard(card);
                  playTTS(card.textJa);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-rose-50 border-rose-400 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-2xl shrink-0 p-2 bg-slate-100 rounded-xl">{card.icon}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {card.titleKo}
                      </span>
                      {card.isPopular && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded">
                          필수
                        </span>
                      )}
                    </div>
                    <div className="font-jp text-xs text-slate-700 font-bold truncate mt-0.5">
                      {card.textJa}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{card.pronounce}</div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTTS(card.textJa);
                    }}
                    className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            일본 식당은 1인 1주문이 기본 매너입니다.
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
