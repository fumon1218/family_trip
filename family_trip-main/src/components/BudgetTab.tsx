import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowRightLeft,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  PiggyBank,
  TrendingDown,
  Receipt,
  X,
  CreditCard,
  Banknote,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  Share2,
  FileSpreadsheet,
} from 'lucide-react';
import { initialBudgetData } from '../data/guidebookData';
import { BudgetItem, PaymentStatus } from '../types';
import { BudgetReportModal } from './BudgetReportModal';
import { fetchLiveExchangeRate } from '../utils/liveDataService';

const BUDGET_STORAGE_KEY = 'osaka_family_budget_data_v2';

const getPaymentStatus = (item: BudgetItem): PaymentStatus => {
  if (item.paymentStatus) return item.paymentStatus;
  return item.isPaid ? 'paid' : 'onsite';
};

export const BudgetTab: React.FC = () => {
  const [budgetList, setBudgetList] = useState<BudgetItem[]>(() => {
    try {
      const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved budget', e);
    }
    return initialBudgetData;
  });

  const [exchangeRate, setExchangeRate] = useState<number>(9.2); // 1 JPY = 9.2 KRW (100엔 = 920원, 실시간 조회 전 기본값)
  const [isLiveRate, setIsLiveRate] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const refreshLiveRate = React.useCallback(async () => {
    setRateLoading(true);
    const live = await fetchLiveExchangeRate();
    if (live) {
      setExchangeRate(live.jpyToKrw);
      setIsLiveRate(true);
    }
    setRateLoading(false);
  }, []);

  // 최초 진입 시 실시간 환율 1회 자동 조회 (open.er-api.com, 키 불필요)
  useEffect(() => {
    refreshLiveRate();
  }, [refreshLiveRate]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetList));
    } catch (e) {
      console.error('Failed to save budget', e);
    }
  }, [budgetList]);

  // Currency Converter State
  const [jpyInput, setJpyInput] = useState<string>('5000');
  const [krwInput, setKrwInput] = useState<string>('46000');

  // Add Item Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmountKrw, setNewAmountKrw] = useState('');
  const [newCategory, setNewCategory] = useState<BudgetItem['category']>('food');
  const [newNote, setNewNote] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('paid');

  // Edit Item Modal
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmountKrw, setEditAmountKrw] = useState('');
  const [editAmountJpy, setEditAmountJpy] = useState('');
  const [editCategory, setEditCategory] = useState<BudgetItem['category']>('food');
  const [editPerPersonRate, setEditPerPersonRate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('paid');

  const totalBudgetKrw = budgetList.reduce((sum, item) => sum + item.amountKrw, 0);
  const paidBudgetKrw = budgetList
    .filter((item) => getPaymentStatus(item) === 'paid')
    .reduce((sum, item) => sum + item.amountKrw, 0);
  const pendingBudgetKrw = budgetList
    .filter((item) => getPaymentStatus(item) === 'pending')
    .reduce((sum, item) => sum + item.amountKrw, 0);
  const onsiteBudgetKrw = budgetList
    .filter((item) => getPaymentStatus(item) === 'onsite')
    .reduce((sum, item) => sum + item.amountKrw, 0);
  const unpaidBudgetKrw = pendingBudgetKrw + onsiteBudgetKrw;

  const handleJpyChange = (val: string) => {
    setJpyInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setKrwInput(Math.round(num * exchangeRate).toString());
    } else {
      setKrwInput('');
    }
  };

  const handleKrwChange = (val: string) => {
    setKrwInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setJpyInput(Math.round(num / exchangeRate).toString());
    } else {
      setJpyInput('');
    }
  };

  const handleCyclePaymentStatus = (id: string) => {
    setBudgetList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const current = getPaymentStatus(item);
        const nextStatus: PaymentStatus =
          current === 'paid' ? 'pending' : current === 'pending' ? 'onsite' : 'paid';
        return {
          ...item,
          paymentStatus: nextStatus,
          isPaid: nextStatus === 'paid',
        };
      })
    );
  };

  const handleOpenEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditAmountKrw(item.amountKrw.toString());
    setEditAmountJpy(item.amountJpy ? item.amountJpy.toString() : Math.round(item.amountKrw / exchangeRate).toString());
    setEditCategory(item.category);
    setEditPerPersonRate(item.perPersonRate || '');
    setEditNote(item.note || '');
    setEditPaymentStatus(getPaymentStatus(item));
  };

  const handleEditKrwChange = (val: string) => {
    setEditAmountKrw(val);
    const krw = parseInt(val, 10);
    if (!isNaN(krw)) {
      setEditAmountJpy(Math.round(krw / exchangeRate).toString());
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim() || !editAmountKrw.trim()) return;

    const krw = parseInt(editAmountKrw, 10) || 0;
    const jpy = editAmountJpy ? parseInt(editAmountJpy, 10) : Math.round(krw / exchangeRate);

    setBudgetList((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: editTitle.trim(),
              category: editCategory,
              amountKrw: krw,
              amountJpy: jpy,
              perPersonRate: editPerPersonRate.trim() || undefined,
              note: editNote.trim(),
              isPaid: editPaymentStatus === 'paid',
              paymentStatus: editPaymentStatus,
            }
          : item
      )
    );
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (window.confirm(`'${title}' 항목을 예산 내역에서 삭제하시겠습니까?`)) {
      setBudgetList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('가계부 예산 내역을 처음 기본 상태로 초기화하시겠습니까? (직접 추가/수정한 내용이 초기화됩니다)')) {
      setBudgetList(initialBudgetData);
      try {
        localStorage.removeItem(BUDGET_STORAGE_KEY);
      } catch (e) {}
    }
  };

  const handleAutoCalcPerPerson = () => {
    const krw = parseInt(editAmountKrw, 10);
    if (!isNaN(krw) && krw > 0) {
      const perPerson = Math.round(krw / 4);
      if (perPerson >= 10000) {
        const manWon = (perPerson / 10000).toFixed(1).replace('.0', '');
        setEditPerPersonRate(`약 ${manWon}만원/인`);
      } else {
        setEditPerPersonRate(`약 ${perPerson.toLocaleString()}원/인`);
      }
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmountKrw) return;
    const krw = parseInt(newAmountKrw, 10);
    const perPerson = Math.round(krw / 4);
    const perPersonRate = perPerson >= 10000 ? `약 ${(perPerson / 10000).toFixed(1)}만원/인` : `약 ${perPerson.toLocaleString()}원/인`;
    const newItem: BudgetItem = {
      id: `custom-${Date.now()}`,
      category: newCategory,
      title: newTitle,
      amountKrw: krw,
      amountJpy: Math.round(krw / exchangeRate),
      perPersonRate,
      note: newNote || '가족 직접 지출 기록',
      isPaid: newPaymentStatus === 'paid',
      paymentStatus: newPaymentStatus,
    };
    setBudgetList([newItem, ...budgetList]);
    setNewTitle('');
    setNewAmountKrw('');
    setNewNote('');
    setNewPaymentStatus('paid');
    setAddModalOpen(false);
  };

  const getCategoryLabel = (category: BudgetItem['category']) => {
    switch (category) {
      case 'lodging':
        return '숙소';
      case 'transit':
        return '교통·라피트';
      case 'tickets':
        return 'USJ·입장권';
      case 'food':
        return '식비·간식';
      case 'shopping':
        return '쇼핑·기념품';
      case 'insurance':
        return '여행자보험';
      default:
        return '기타';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Budget Summary Card */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm sm:text-base font-bold">4인 가족 예상 가계부 (2박 3일)</h2>
          </div>
          <span className="text-xs bg-slate-800 text-rose-300 px-2.5 py-1 rounded-full font-mono">
            PDF 4장 예산표 기반
          </span>
        </div>

        <div>
          <div className="text-xs text-slate-400 font-medium">총 예상 예산</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
            약 {totalBudgetKrw.toLocaleString()}원
            <span className="text-xs sm:text-sm font-normal text-slate-400 ml-2">
              (약 {Math.round(totalBudgetKrw / exchangeRate).toLocaleString()}엔)
            </span>
          </div>
        </div>

        {/* Progress Bar & Breakdown */}
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-wrap items-center justify-between text-xs gap-1">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 결제 완료: {paidBudgetKrw.toLocaleString()}원
            </span>
            {pendingBudgetKrw > 0 && (
              <span className="text-blue-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 결제 예정: {pendingBudgetKrw.toLocaleString()}원
              </span>
            )}
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Circle className="w-3.5 h-3.5" /> 현지 지출: {onsiteBudgetKrw.toLocaleString()}원
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${totalBudgetKrw > 0 ? Math.round((paidBudgetKrw / totalBudgetKrw) * 100) : 0}%` }}
              title={`결제 완료: ${paidBudgetKrw.toLocaleString()}원`}
            />
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${totalBudgetKrw > 0 ? Math.round((pendingBudgetKrw / totalBudgetKrw) * 100) : 0}%` }}
              title={`결제 예정: ${pendingBudgetKrw.toLocaleString()}원`}
            />
            <div
              className="bg-amber-500 h-full transition-all"
              style={{ width: `${totalBudgetKrw > 0 ? Math.round((onsiteBudgetKrw / totalBudgetKrw) * 100) : 0}%` }}
              title={`현지 지출 예정: ${onsiteBudgetKrw.toLocaleString()}원`}
            />
          </div>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <span>4인 1인당 평균: 약 <strong>{Math.round(totalBudgetKrw / 4).toLocaleString()}원</strong></span>
          <span>USJ 패스 조기예매 시 추가 절감 가능</span>
        </div>
      </div>

      {/* Currency Converter (엔화 <-> 원화 실시간 계산기) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <span>실시간 엔화-원화 환율 계산기</span>
            {isLiveRate && (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                LIVE
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>환율: 100엔 =</span>
            <input
              type="number"
              value={Math.round(exchangeRate * 100)}
              onChange={(e) => {
                setExchangeRate(parseFloat(e.target.value) / 100 || 9.2);
                setIsLiveRate(false);
              }}
              className="w-14 text-center border border-slate-300 rounded px-1 py-0.5 font-mono text-xs"
            />
            <span>원</span>
            <button
              type="button"
              onClick={refreshLiveRate}
              disabled={rateLoading}
              className="ml-1 px-1.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] disabled:opacity-50 cursor-pointer"
              title="실시간 환율 새로고침 (open.er-api.com)"
            >
              {rateLoading ? '조회중' : '실시간 갱신'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-[10px] font-bold text-slate-500 block mb-1">일본 엔 (JPY ¥)</label>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-700">¥</span>
              <input
                type="number"
                value={jpyInput}
                onChange={(e) => handleJpyChange(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent font-bold text-base text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="text-[10px] font-bold text-slate-500 block mb-1">대한민국 원 (KRW ₩)</label>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-700">₩</span>
              <input
                type="number"
                value={krwInput}
                onChange={(e) => handleKrwChange(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent font-bold text-base text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tax Free Calculator Notice */}
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 flex items-start gap-2">
          <PiggyBank className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong>면세(택스프리 10%) 꿀팁: </strong>
            돈키호테나 백화점에서 <strong>5,000엔 (약 {Math.round(5000 * exchangeRate).toLocaleString()}원)</strong> 이상 구매 시 10% 소비세 즉시 면세! 영수증 합산 결제를 이용하세요.
          </div>
        </div>
      </div>

      {/* Action Header for Expense Items */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-slate-500" />
          <span>예산 상세 내역 및 지출 체크 ({budgetList.length}건)</span>
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="가계부 정산 보고서 및 카톡 공유"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>정산 보고서</span>
          </button>
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-all"
            title="초기 기본 예산 데이터로 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>지출 추가</span>
          </button>
        </div>
      </div>

      {/* Budget Item List */}
      <div className="space-y-2.5">
        {budgetList.map((item) => {
          const status = getPaymentStatus(item);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-3.5 shadow-xs transition-all ${
                status === 'paid'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : status === 'pending'
                  ? 'border-blue-200 bg-blue-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {getCategoryLabel(item.category)}
                    </span>
                    {item.perPersonRate && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.perPersonRate}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.note}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">
                    {item.amountKrw.toLocaleString()}원
                  </div>
                  {item.amountJpy && (
                    <div className="text-xs text-slate-400 font-mono">
                      ¥{item.amountJpy.toLocaleString()}
                    </div>
                  )}
                  <div className="mt-1.5 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleCyclePaymentStatus(item.id)}
                      title="클릭하여 결제 상태 변경 (결제완료 ↔ 결제예정 ↔ 현지지출)"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                        status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : status === 'pending'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                      {status === 'pending' && <Clock className="w-3 h-3" />}
                      {status === 'onsite' && <Circle className="w-3 h-3" />}
                      <span>
                        {status === 'paid' ? '결제완료' : status === 'pending' ? '결제예정' : '현지지출'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="항목 수정"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="항목 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Expense Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Pencil className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">예산 내역 수정</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">카테고리</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:border-blue-500"
                >
                  <option value="lodging">숙소</option>
                  <option value="transit">교통 · 라피트 · 지하철</option>
                  <option value="tickets">USJ · 입장권 · 액티비티</option>
                  <option value="food">식비 · 간식</option>
                  <option value="shopping">쇼핑 · 기념품</option>
                  <option value="insurance">여행자보험</option>
                  <option value="etc">기타 경비</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">항목명</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="예: 숙소, 특급열차 라피트, USJ 입장권"
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">금액 (원화 KRW)</label>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white px-2 focus-within:border-blue-500">
                    <span className="text-slate-500 font-bold mr-1">₩</span>
                    <input
                      type="number"
                      value={editAmountKrw}
                      onChange={(e) => handleEditKrwChange(e.target.value)}
                      placeholder="500000"
                      className="w-full py-2 bg-transparent focus:outline-none font-bold"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">예상 엔화 (JPY)</label>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white px-2 focus-within:border-blue-500">
                    <span className="text-slate-500 font-bold mr-1">¥</span>
                    <input
                      type="number"
                      value={editAmountJpy}
                      onChange={(e) => setEditAmountJpy(e.target.value)}
                      placeholder="55000"
                      className="w-full py-2 bg-transparent focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">1인당 예상 환산 표기 (선택)</label>
                  <button
                    type="button"
                    onClick={handleAutoCalcPerPerson}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                  >
                    4인 기준 자동 계산 (÷4)
                  </button>
                </div>
                <input
                  type="text"
                  value={editPerPersonRate}
                  onChange={(e) => setEditPerPersonRate(e.target.value)}
                  placeholder="예: 약 12.5만원/인 또는 600엔/인"
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">세부 메모 및 설명</label>
                <textarea
                  rows={2}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="예: 4인 가족 패밀리룸 1채, 체크인 전 짐 보관 가능 등"
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">결제 상태</label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPaymentStatus('paid')}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all text-xs ${
                      editPaymentStatus === 'paid'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-2xs ring-1 ring-emerald-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${editPaymentStatus === 'paid' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>결제 완료</span>
                    </div>
                    <span className="text-[10px] text-emerald-600/80 font-normal hidden sm:inline">(사전 결제)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditPaymentStatus('pending')}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all text-xs ${
                      editPaymentStatus === 'pending'
                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-2xs ring-1 ring-blue-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className={`w-3.5 h-3.5 ${editPaymentStatus === 'pending' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>결제 예정</span>
                    </div>
                    <span className="text-[10px] text-blue-600/80 font-normal hidden sm:inline">(사전 예매 대기)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditPaymentStatus('onsite')}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold transition-all text-xs ${
                      editPaymentStatus === 'onsite'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-2xs ring-1 ring-amber-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Circle className={`w-3.5 h-3.5 ${editPaymentStatus === 'onsite' ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span>현지 지출 예정</span>
                    </div>
                    <span className="text-[10px] text-amber-600/80 font-normal hidden sm:inline">(현지 지출)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  수정 내용 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">새 지출 항목 추가</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">카테고리</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
                >
                  <option value="food">식비 · 간식</option>
                  <option value="shopping">쇼핑 · 기념품</option>
                  <option value="transit">교통비 (지하철/택시)</option>
                  <option value="tickets">입장권 · 액티비티</option>
                  <option value="lodging">숙소</option>
                  <option value="insurance">여행자보험</option>
                  <option value="etc">기타 잡비</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">항목명</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 편의점 로손 야식, 돈키호테 과자 쇼핑"
                  className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">금액 (원화 KRW)</label>
                <input
                  type="number"
                  value={newAmountKrw}
                  onChange={(e) => setNewAmountKrw(e.target.value)}
                  placeholder="예: 35000"
                  className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">메모 (선택)</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="예: 4인 음료 및 디저트"
                  className="w-full p-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">결제 상태</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewPaymentStatus('paid')}
                    className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      newPaymentStatus === 'paid' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>결제 완료</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPaymentStatus('pending')}
                    className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      newPaymentStatus === 'pending' ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>결제 예정</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPaymentStatus('onsite')}
                    className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      newPaymentStatus === 'onsite' ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    <Circle className="w-3 h-3" />
                    <span>현지 지출</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="w-1/3 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs"
                >
                  가계부에 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Budget Report & Kakao Share Modal */}
      <BudgetReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        budgetList={budgetList}
        exchangeRate={exchangeRate}
      />
    </div>
  );
};
