import React, { useState } from 'react';
import {
  X,
  Share2,
  Check,
  Wallet,
  TrendingDown,
  PieChart,
  Copy,
  Receipt,
  Sparkles,
  CreditCard,
  Building,
  Utensils,
  Ticket,
  Train,
  ShoppingBag,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { BudgetItem, PaymentStatus } from '../types';

interface BudgetReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetList: BudgetItem[];
  exchangeRate: number;
}

export const BudgetReportModal: React.FC<BudgetReportModalProps> = ({
  isOpen,
  onClose,
  budgetList,
  exchangeRate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getPaymentStatus = (item: BudgetItem): PaymentStatus => {
    if (item.paymentStatus) return item.paymentStatus;
    return item.isPaid ? 'paid' : 'onsite';
  };

  const totalBudgetKrw = budgetList.reduce((sum, item) => sum + item.amountKrw, 0);
  const totalBudgetJpy = Math.round(totalBudgetKrw / exchangeRate);

  const paidBudgetKrw = budgetList
    .filter((item) => getPaymentStatus(item) === 'paid')
    .reduce((sum, item) => sum + item.amountKrw, 0);
  const pendingBudgetKrw = budgetList
    .filter((item) => getPaymentStatus(item) === 'pending')
    .reduce((sum, item) => sum + item.amountKrw, 0);
  const onsiteBudgetKrw = budgetList
    .filter((item) => getPaymentStatus(item) === 'onsite')
    .reduce((sum, item) => sum + item.amountKrw, 0);

  const perPersonKrw = Math.round(totalBudgetKrw / 4);

  // Category breakdown
  const categoryTotals: Record<BudgetItem['category'], number> = {
    lodging: 0,
    tickets: 0,
    food: 0,
    transit: 0,
    shopping: 0,
    insurance: 0,
    etc: 0,
  };

  budgetList.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amountKrw;
  });

  const categoryLabels: Record<BudgetItem['category'], { label: string; icon: any; color: string }> = {
    lodging: { label: '숙소', icon: Building, color: 'text-purple-600 bg-purple-100' },
    tickets: { label: '입장권·패스', icon: Ticket, color: 'text-rose-600 bg-rose-100' },
    food: { label: '식비·간식', icon: Utensils, color: 'text-amber-600 bg-amber-100' },
    transit: { label: '교통 (라피트/지하철)', icon: Train, color: 'text-blue-600 bg-blue-100' },
    shopping: { label: '쇼핑·기념품', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-100' },
    insurance: { label: '여행자보험', icon: Shield, color: 'text-indigo-600 bg-indigo-100' },
    etc: { label: '기타 잡비', icon: Receipt, color: 'text-slate-600 bg-slate-100' },
  };

  // Top 3 expenses
  const topExpenses = [...budgetList]
    .sort((a, b) => b.amountKrw - a.amountKrw)
    .slice(0, 3);

  const handleShareKakao = () => {
    const text = `📊 [오사카 4인 가족 2박 3일 여행 가계부 정산 보고서]
총 소요 예산: 약 ${totalBudgetKrw.toLocaleString()}원 (¥${totalBudgetJpy.toLocaleString()})
4인 1인당 분담액: 약 ${perPersonKrw.toLocaleString()}원

💳 결제 상태별 진행 현황:
- 결제 완료: ${paidBudgetKrw.toLocaleString()}원 (${Math.round((paidBudgetKrw / totalBudgetKrw) * 100)}%)
- 결제 예정: ${pendingBudgetKrw.toLocaleString()}원 (${Math.round((pendingBudgetKrw / totalBudgetKrw) * 100)}%)
- 현지 지출: ${onsiteBudgetKrw.toLocaleString()}원 (${Math.round((onsiteBudgetKrw / totalBudgetKrw) * 100)}%)

🏷️ 카테고리별 지출 비중:
${Object.entries(categoryTotals)
  .filter(([_, amt]) => amt > 0)
  .sort(([_, a], [__, b]) => b - a)
  .map(
    ([cat, amt]) =>
      `• ${categoryLabels[cat as BudgetItem['category']].label}: ${amt.toLocaleString()}원 (${Math.round(
        (amt / totalBudgetKrw) * 100
      )}%)`
  )
  .join('\n')}

👑 주요 지출 TOP 3:
1위: ${topExpenses[0]?.title} (${topExpenses[0]?.amountKrw.toLocaleString()}원)
2위: ${topExpenses[1]?.title} (${topExpenses[1]?.amountKrw.toLocaleString()}원)
3위: ${topExpenses[2]?.title} (${topExpenses[2]?.amountKrw.toLocaleString()}원)

✨ 숙소: 미마루 오사카 난바 NORTH
(기준 환율: 100엔 = 920원 적용)`;

    if (navigator.share) {
      navigator.share({
        title: '오사카 4인 가족 여행 가계부 보고서',
        text: text,
      }).catch(() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-1.5">
                <span>📤 여행 가계부 정산 보고서 & 공유</span>
              </h2>
              <p className="text-xs text-slate-300">4인 가족 총 지출 분석 및 카카오톡 전송</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Main Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>오사카 2박 3일 4인 가족 총액</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-full font-mono">100엔 = 920원</span>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                약 {totalBudgetKrw.toLocaleString()}원
              </div>
              <div className="text-sm font-medium text-slate-300 mt-0.5">
                (현지 통화 약 ¥{totalBudgetJpy.toLocaleString()}엔)
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300">4인 1인당 분담금:</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                약 {perPersonKrw.toLocaleString()}원 / 인
              </span>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>결제 상태별 진행 현황</span>
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                <div className="text-[11px] font-bold text-emerald-700">결제 완료</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                  {paidBudgetKrw.toLocaleString()}원
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {Math.round((paidBudgetKrw / totalBudgetKrw) * 100)}%
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-2xs">
                <div className="text-[11px] font-bold text-blue-700">결제 예정</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                  {pendingBudgetKrw.toLocaleString()}원
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {Math.round((pendingBudgetKrw / totalBudgetKrw) * 100)}%
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-[11px] font-bold text-amber-700">현지 지출</div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                  {onsiteBudgetKrw.toLocaleString()}원
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {Math.round((onsiteBudgetKrw / totalBudgetKrw) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span>카테고리별 지출 비중</span>
            </h4>

            <div className="space-y-2">
              {Object.entries(categoryTotals)
                .filter(([_, amt]) => amt > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([cat, amt]) => {
                  const conf = categoryLabels[cat as BudgetItem['category']];
                  const Icon = conf.icon;
                  const percent = Math.round((amt / totalBudgetKrw) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className={`p-1 rounded-md ${conf.color}`}>
                            <Icon className="w-3 h-3" />
                          </span>
                          <span>{conf.label}</span>
                        </span>
                        <span className="font-bold text-slate-900">
                          {amt.toLocaleString()}원 ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Top 3 High Expenses */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>최고 지출 항목 TOP 3</span>
            </h4>
            <div className="space-y-1.5">
              {topExpenses.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{item.title}</span>
                  </div>
                  <span className="font-mono font-extrabold text-slate-900">
                    {item.amountKrw.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Big Kakao Share Button */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center gap-2">
          <button
            onClick={handleShareKakao}
            className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? '카톡방 공유 내용이 복사되었습니다!' : '카카오톡 공유 / 클립보드 복사'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
