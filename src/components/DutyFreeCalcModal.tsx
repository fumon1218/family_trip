import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
  ExternalLink,
  Copy,
  Receipt,
  Sparkles,
  Percent,
} from 'lucide-react';

interface DutyFreeCalcModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  id: string;
  name: string;
  priceJpy: number;
  quantity: number;
  category: string;
}

const PRESET_ITEMS: Omit<CartItem, 'id' | 'quantity'>[] = [
  { name: '휴족시간 (발바닥/종아리 쿨링패치)', priceJpy: 680, category: '의약/뷰티' },
  { name: '샤론파스 (140매)', priceJpy: 980, category: '의약/뷰티' },
  { name: '동전파스 (로이히츠보코 156매)', priceJpy: 798, category: '의약/뷰티' },
  { name: '오타이산 소화제 (분말 48포)', priceJpy: 1380, category: '의약/뷰티' },
  { name: '카베진 코와 α (300정)', priceJpy: 1980, category: '의약/뷰티' },
  { name: '센카 퍼펙트휩 클렌징폼', priceJpy: 450, category: '뷰티' },
  { name: '오리히로 곤약젤리 파우치 (6개입)', priceJpy: 168, category: '식품' },
  { name: '이치란 라멘 밀키트 (5인분)', priceJpy: 2150, category: '식품' },
  { name: '산토리 가쿠빈 위스키 (700ml)', priceJpy: 1780, category: '주류' },
  { name: '알포트 미니 초콜릿', priceJpy: 118, category: '식품' },
  { name: '키스미 히로인 롱앤컬 마스카라', priceJpy: 1100, category: '뷰티' },
  { name: '안약 로토 리세 / C큐브', priceJpy: 550, category: '의약/뷰티' },
];

const STORAGE_KEY = 'osaka_duty_free_cart_v1';

export const DutyFreeCalcModal: React.FC<DutyFreeCalcModalProps> = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { id: '1', name: '샤론파스 (140매)', priceJpy: 980, quantity: 2, category: '의약/뷰티' },
      { id: '2', name: '오타이산 소화제 (48포)', priceJpy: 1380, quantity: 1, category: '의약/뷰티' },
      { id: '3', name: '오리히로 곤약젤리 파우치', priceJpy: 168, quantity: 5, category: '식품' },
      { id: '4', name: '센카 퍼펙트휩', priceJpy: 450, quantity: 3, category: '뷰티' },
    ];
  });

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [exchangeRate] = useState(9.2); // 1 JPY = 9.2 KRW
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copiedList, setCopiedList] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  if (!isOpen) return null;

  // Calculate totals
  const totalJpy = cart.reduce((sum, item) => sum + item.priceJpy * item.quantity, 0);
  const totalKrw = Math.round(totalJpy * exchangeRate);

  // Duty Free threshold: 5,500 JPY (including 10% tax in store prices)
  const TAX_FREE_MIN = 5500;
  const COUPON_5_PERCENT_MIN = 10000;
  const isTaxFreeEligible = totalJpy >= TAX_FREE_MIN;
  const isCouponEligible = totalJpy >= COUPON_5_PERCENT_MIN;

  const remainingForTaxFree = Math.max(0, TAX_FREE_MIN - totalJpy);
  const remainingForCoupon = Math.max(0, COUPON_5_PERCENT_MIN - totalJpy);

  // Approximate tax refund (approx 10% consumption tax exempted)
  const savedTaxJpy = isTaxFreeEligible ? Math.round((totalJpy / 1.1) * 0.1) : 0;
  // Extra 5% coupon discount on pre-tax amount
  const couponDiscountJpy = isCouponEligible ? Math.round(totalJpy * 0.05) : 0;
  const totalSavedJpy = savedTaxJpy + couponDiscountJpy;
  const totalSavedKrw = Math.round(totalSavedJpy * exchangeRate);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || Number(newItemPrice) <= 0) return;

    const item: CartItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      priceJpy: Math.round(Number(newItemPrice)),
      quantity: 1,
      category: '기타 쇼핑',
    };
    setCart((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleAddPreset = (preset: typeof PRESET_ITEMS[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === preset.name);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: preset.name,
          priceJpy: preset.priceJpy,
          quantity: 1,
          category: preset.category,
        },
      ];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCopyShoppingList = () => {
    const text = [
      `🛍️ [오사카 가족 쇼핑 & 면세 장바구니]`,
      `총 구매액: ¥${totalJpy.toLocaleString()} (약 ₩${totalKrw.toLocaleString()})`,
      isTaxFreeEligible
        ? `✅ 10% 면세 대상 달성 (절감: 약 ¥${savedTaxJpy.toLocaleString()})`
        : `⚠️ 면세선(¥5,500)까지 ¥${remainingForTaxFree.toLocaleString()} 부족`,
      isCouponEligible ? `🎉 추가 5% 모바일 쿠폰 적용 가능!` : ``,
      `---------------------------------`,
      ...cart.map(
        (it) => `• ${it.name} x${it.quantity}개 = ¥${(it.priceJpy * it.quantity).toLocaleString()}`
      ),
      `---------------------------------`,
      `⚠️ 필수: 여권 원본 지참 / 곤약젤리·액체류는 캐리어 위탁!`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">돈키호테 & 드럭스토어 면세 계산기</h2>
              <p className="text-xs text-rose-100">¥5,500 면세 달성 & 5% 추가 할인쿠폰 가이드</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
          {/* Status & Eligibility Banner */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isTaxFreeEligible
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200">
                  현재 장바구니 합계
                </span>
                <div className="text-2xl sm:text-3xl font-black mt-1">
                  ¥{totalJpy.toLocaleString()}
                  <span className="text-sm font-normal text-slate-600 ml-2">
                    (약 {totalKrw.toLocaleString()}원)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-500">예상 절감 혜택</span>
                <div className="text-lg font-extrabold text-rose-600">
                  -¥{totalSavedJpy.toLocaleString()}
                  <div className="text-[11px] text-slate-500 font-normal">
                    (약 -{totalSavedKrw.toLocaleString()}원 할인)
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar 1: Tax Free 5,500 JPY */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>10% 면세선 (소비세 감면)</span>
                <span>
                  {isTaxFreeEligible ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 면세 조건 달성!
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold">
                      ¥{remainingForTaxFree.toLocaleString()} 더 담으면 면세
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isTaxFreeEligible ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, (totalJpy / TAX_FREE_MIN) * 100)}%` }}
                />
              </div>
            </div>

            {/* Progress Bar 2: Extra 5% Coupon 10,000 JPY */}
            <div className="mt-2.5 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3 text-rose-600" />
                  돈키호테 추가 5% 쿠폰선 (¥10,000 이상)
                </span>
                <span>
                  {isCouponEligible ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 5% 쿠폰 적용 가능!
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      ¥{remainingForCoupon.toLocaleString()} 더 담으면 5% 추가 할인
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCouponEligible ? 'bg-rose-500' : 'bg-slate-400'
                  }`}
                  style={{ width: `${Math.min(100, (totalJpy / COUPON_5_PERCENT_MIN) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Item Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                오사카 인기 쇼핑 추천템 (클릭하여 장바구니에 바로 추가)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ITEMS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(item)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>{item.name}</span>
                  <span className="font-bold text-slate-500">¥{item.priceJpy}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Custom Item Form */}
          <form onSubmit={handleAddItem} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="물품명 직접 입력 (예: 킷캣 말차)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            <div className="relative w-28 shrink-0">
              <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">¥</span>
              <input
                type="number"
                placeholder="가격(엔)"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-full pl-6 pr-2 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              추가
            </button>
          </form>

          {/* Current Cart List */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>담은 품목 ({cart.length}개)</span>
              <button
                onClick={() => setCart([])}
                className="text-slate-400 hover:text-rose-600 transition-colors font-medium text-[11px]"
              >
                전체 비우기
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                장바구니가 비어 있습니다. 위의 추천 상품을 클릭하거나 직접 품목을 추가해 보세요.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        단가 ¥{item.priceJpy.toLocaleString()} (약{' '}
                        {Math.round(item.priceJpy * exchangeRate).toLocaleString()}원)
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="w-20 text-right text-xs font-bold text-slate-900">
                        ¥{(item.priceJpy * item.quantity).toLocaleString()}
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donki Official Coupon Card & Barcode Guide */}
          <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950">
                <Percent className="w-4 h-4 text-amber-600" />
                <span>돈키호테 모바일 5% 할인쿠폰 이용법</span>
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                계산대 제시용
              </span>
            </div>

            <p className="text-xs text-amber-900 leading-relaxed">
              돈키호테 계산대에서 <strong>면세(Tax-Free) 전용 카운터</strong>로 가신 후, 
              여권을 제시하고 모바일 쿠폰 화면을 바코드로 찍으면 <strong>추가 5%가 즉시 차감</strong>됩니다.
              (화면 밝기를 100%로 올려주세요)
            </p>

            {/* Visual Simulated Barcode Box */}
            <div className="bg-white p-3 rounded-xl border border-amber-300 text-center space-y-1">
              <div className="text-[11px] font-bold text-slate-700">DON QUIJOTE 5% OFF TAX-FREE COUPON</div>
              {/* Stylized Barcode SVG */}
              <div className="flex items-center justify-center gap-1 h-12 py-1 px-4 bg-slate-50 rounded border border-dashed border-slate-300">
                <div className="w-1.5 h-full bg-slate-950" />
                <div className="w-0.5 h-full bg-slate-950" />
                <div className="w-2 h-full bg-slate-950" />
                <div className="w-1 h-full bg-slate-950" />
                <div className="w-3 h-full bg-slate-950" />
                <div className="w-0.5 h-full bg-slate-950" />
                <div className="w-1.5 h-full bg-slate-950" />
                <div className="w-2 h-full bg-slate-950" />
                <div className="w-0.5 h-full bg-slate-950" />
                <div className="w-2.5 h-full bg-slate-950" />
                <div className="w-1 h-full bg-slate-950" />
                <div className="w-2 h-full bg-slate-950" />
                <div className="w-0.5 h-full bg-slate-950" />
                <div className="w-3 h-full bg-slate-950" />
                <div className="w-1.5 h-full bg-slate-950" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono tracking-widest">
                TAX FREE + 5% DISCOUNT (¥10,000~)
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href="https://japan-taxfree-coupon.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 transition-all"
              >
                <span>웹 공식 쿠폰 페이지 열기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={handleCopyShoppingList}
                className="py-2 px-3 bg-white hover:bg-slate-100 border border-amber-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                {copiedList ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>장바구니 카톡 복사</span>
              </button>
            </div>
          </div>

          {/* 3 Critical Rules Box */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>면세 쇼핑 3대 필수 주의사항</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-slate-700 pl-1">
              <li>
                <strong>여권 실물 필수 지참:</strong> 사진이나 복사본은 불인정되며, 실물 여권 입국 도장이 있어야 합니다.
              </li>
              <li>
                <strong>면세 봉투 일본 내 개봉 금지:</strong> 투명 봉인 비닐을 출국 전 뜯으면 세관 검사 시 10% 소비세를 즉시 추징당합니다.
              </li>
              <li>
                <strong>곤약젤리 & 액체류는 무조건 캐리어 위탁:</strong> 컵형 곤약젤리는 반입 불가(질식 위험), 파우치형은 기내 반입 시 100ml 초과 액체로 간주되어 공항 보안검색대에서 전량 압수됩니다. 반드시 위탁 캐리어에 넣으세요!
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            적용 환율: 100엔 = {exchangeRate * 10}원
          </div>
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
