import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  RotateCcw,
  Share2,
  Check,
  Luggage,
  Sparkles,
  FileCheck,
  Smartphone,
  Pill,
  Shirt,
} from 'lucide-react';

interface PackingItem {
  id: string;
  category: 'docs' | 'electronics' | 'medicine' | 'clothing' | 'custom';
  title: string;
  desc?: string;
  checked: boolean;
  essential?: boolean;
}

const DEFAULT_PACKING_ITEMS: PackingItem[] = [
  // 1. 필수 서류 & 티켓
  { id: 'p1', category: 'docs', title: '여권 4인 (만료일 6개월 이상 확인)', desc: '여권 사본 및 스마트폰 사진 보관 필수', checked: false, essential: true },
  { id: 'p2', category: 'docs', title: '비짓재팬웹(VJW) 입국/세관 QR 등록', desc: '가족 전원 등록 후 QR코드 캡처 저장', checked: false, essential: true },
  { id: 'p3', category: 'docs', title: '항공권 E-티켓 (모바일/출력본)', desc: '에어서울/항공편 예약 번호 확인', checked: false, essential: true },
  { id: 'p4', category: 'docs', title: 'USJ 입장권 & 익스프레스 4 바우처', desc: 'QR코드 캡처본 및 USJ 공식앱 등록', checked: false, essential: true },
  { id: 'p5', category: 'docs', title: '난카이 라피트 모바일 교환 바우처', desc: '간사이공항역 2층 난카이 티켓창구 교환', checked: false, essential: true },
  { id: 'p6', category: 'docs', title: '해외 여행자보험 영문 증권', desc: '질병/상해/휴대품 보상 범위 확인', checked: false, essential: true },
  { id: 'p7', category: 'docs', title: '해외 결제 신용/체크카드 (트래블로그 등)', desc: '해외 결제 및 원화 결제 차단(DCC 방지) 설정', checked: false, essential: true },

  // 2. 전자기기 & 통신
  { id: 'p8', category: 'electronics', title: '110V 11자 돼지코 어댑터 (3~4개)', desc: '일본 호텔 콘센트는 110V 전용입니다', checked: false, essential: true },
  { id: 'p9', category: 'electronics', title: '대용량 보조배터리 (기내 수하물 필수)', desc: 'USJ 하루 종일 사진/지도 검색 대비', checked: false, essential: true },
  { id: 'p10', category: 'electronics', title: '일본 여행용 eSIM 또는 포켓와이파이', desc: '공항 도착 즉시 개통 확인', checked: false, essential: true },
  { id: 'p11', category: 'electronics', title: '스마트폰 고속 충전기 & 멀티 케이블', desc: '호텔에서 4인 동시 충전용 멀티탭 유용', checked: false, essential: false },

  // 3. 가족 상비약
  { id: 'p12', category: 'medicine', title: '소화제 (오타이산 또는 훼스탈)', desc: '일본 미식 탐방 시 과식 대비', checked: false, essential: true },
  { id: 'p13', category: 'medicine', title: '해열진통제 (타이레놀/이지엔)', desc: '갑작스러운 두통이나 열 대비', checked: false, essential: true },
  { id: 'p14', category: 'medicine', title: '파스 / 휴족시간 (발바닥/종아리용)', desc: '하루 1.5만~2만보 걷기 필수템', checked: false, essential: true },
  { id: 'p15', category: 'medicine', title: '종합 감기약 & 밴드/후시딘', desc: '어린이/부모님 비상용', checked: false, essential: false },
  { id: 'p16', category: 'medicine', title: '멀미약 (라피트/택시/USJ 어트랙션 대비)', desc: 'USJ 해리포터 탑승 전 필요 시 복용', checked: false, essential: false },

  // 4. 의류 & 편의용품
  { id: 'p17', category: 'clothing', title: '가장 편안한 런닝화/운동화', desc: '발 편한 신발이 여행 만족도 1위', checked: false, essential: true },
  { id: 'p18', category: 'clothing', title: '엔화 동전 지갑 (포켓형)', desc: '일본은 100엔, 500엔 등 동전 지출이 매우 많음', checked: false, essential: true },
  { id: 'p19', category: 'clothing', title: '경량 접이식 우산 (가방별 1개씩)', desc: '오사카 갑작스러운 비 대비', checked: false, essential: true },
  { id: 'p20', category: 'clothing', title: 'USJ용 경량 바람막이 겉옷 또는 핫팩', desc: '바닷가라 일교차가 크고 저녁에 쌀쌀함', checked: false, essential: false },
  { id: 'p21', category: 'clothing', title: '휴대용 물티슈 & 휴대용 포켓 티슈', desc: '식당/길거리 간식 취식 시 유용', checked: false, essential: false },
];

const STORAGE_KEY = 'osaka_family_packing_list_v1';

interface PackingChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PackingChecklistModal: React.FC<PackingChecklistModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<PackingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PACKING_ITEMS;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingItem['category']>('custom');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  if (!isOpen) return null;

  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((checkedCount / (totalCount || 1)) * 100);

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      category: newItemCategory,
      title: newItemTitle.trim(),
      checked: false,
    };
    setItems([...items, newItem]);
    setNewItemTitle('');
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleReset = () => {
    if (window.confirm('체크리스트를 처음 기본 상태로 초기화할까요?')) {
      setItems(DEFAULT_PACKING_ITEMS);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  const handleShareKakaoText = () => {
    const remaining = items.filter((i) => !i.checked);
    const text = `🎒 [오사카 4인 가족 여행 패킹 현황]\n진행률: ${checkedCount}/${totalCount} (${progressPercent}% 완료)\n\n📌 아직 덜 챙긴 품목 (${remaining.length}개):\n${remaining.map((i) => `▫ ${i.title}`).join('\n')}\n\n* 완벽히 챙겨서 즐거운 오사카 여행 떠나요! ✨`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter((i) => i.category === activeCategory);

  const getCategoryLabel = (cat: PackingItem['category']) => {
    switch (cat) {
      case 'docs':
        return '서류/티켓';
      case 'electronics':
        return '전자/통신';
      case 'medicine':
        return '상비약';
      case 'clothing':
        return '의류/편의';
      case 'custom':
        return '추가품목';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <Luggage className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-1.5">
                <span>🎒 4인 가족 여행 준비물 체크리스트</span>
              </h2>
              <p className="text-xs text-slate-300">오사카 2박 3일 출발 전 완벽 점검</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Actions Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">준비 완료도</span>
              <span className="text-emerald-600 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full">
                {checkedCount} / {totalCount}개 ({progressPercent}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShareKakaoText}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-2xs"
                title="카톡방 공유용 텍스트 복사"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? '복사완료!' : '카톡 공유'}</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium border border-slate-200"
                title="기본값 초기화"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">초기화</span>
              </button>
            </div>
          </div>

          {/* Progress track */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
            {[
              { id: 'all', label: '전체' },
              { id: 'docs', label: '📄 서류/티켓' },
              { id: 'electronics', label: '🔌 전자/통신' },
              { id: 'medicine', label: '💊 상비약' },
              { id: 'clothing', label: '👟 의류/편의' },
              { id: 'custom', label: '✏️ 직접추가' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  activeCategory === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                item.checked
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <button
                  type="button"
                  className="mt-0.5 shrink-0 focus:outline-none"
                >
                  {item.checked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-sm font-bold ${
                        item.checked ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.essential && (
                      <span className="text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded-md">
                        필수
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  {item.desc && (
                    <p className={`text-xs mt-0.5 ${item.checked ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>

              {item.category === 'custom' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Custom Item Form & Footer */}
        <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 space-y-2">
          <form onSubmit={handleAddItem} className="flex items-center gap-2">
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as any)}
              className="p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
            >
              <option value="custom">직접추가</option>
              <option value="docs">서류/티켓</option>
              <option value="electronics">전자/통신</option>
              <option value="medicine">상비약</option>
              <option value="clothing">의류/편의</option>
            </select>
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="새 준비물 추가 (예: 아이 좋아하는 과자, 접이식 장바구니)"
              className="flex-1 p-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>추가</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
