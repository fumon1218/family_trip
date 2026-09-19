import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle } from 'lucide-react';

export interface TripSettings {
  startDate: string; // YYYY-MM-DD
  days: number; // 총 일수 (예: 2박3일이면 3)
}

interface TripSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripSettings: TripSettings;
  onSave: (settings: TripSettings) => void;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateKo(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${weekday})`;
}

export const TripSettingsModal: React.FC<TripSettingsModalProps> = ({
  isOpen,
  onClose,
  tripSettings,
  onSave,
}) => {
  const [startDate, setStartDate] = useState(tripSettings.startDate);
  const [days, setDays] = useState(tripSettings.days);

  useEffect(() => {
    if (isOpen) {
      setStartDate(tripSettings.startDate);
      setDays(tripSettings.days);
    }
  }, [isOpen, tripSettings]);

  if (!isOpen) return null;

  const endDate = addDays(startDate, Math.max(days - 1, 0));
  const nights = Math.max(days - 1, 0);

  const handleSave = () => {
    onSave({ startDate, days: Math.max(days, 1) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-600 to-orange-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">여행 기간 설정</h2>
              <p className="text-xs text-rose-50">출발일과 여행 일수를 자유롭게 바꿀 수 있어요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Start Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">여행 시작(출국) 날짜</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Days Stepper */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">여행 일수 (총 며칠)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-lg cursor-pointer"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <div className="text-2xl font-black text-slate-900">
                  {nights}박 {days}일
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDays((d) => Math.min(14, d + 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-lg cursor-pointer"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[2, 3, 4, 5, 7].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDays(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    days === preset
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset - 1}박{preset}일
                </button>
              ))}
            </div>
          </div>

          {/* Computed Date Range Preview */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
            <span className="text-sm font-bold text-rose-800">
              {formatDateKo(startDate)} ~ {formatDateKo(endDate)}
            </span>
            <p className="text-[11px] text-rose-600 mt-0.5">
              {nights}박 {days}일 여행으로 설정됩니다
            </p>
          </div>

          {days !== 3 && (
            <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                미리 준비된 세부 일정(구로몬 시장, USJ, 오사카성 등)은 1~3일차 기준입니다. 3일보다 길게
                설정하면 4일차부터는 빈 일정으로 표시되니 직접 계획을 채워주세요. 3일보다 짧게 설정하면
                남는 일정(오사카성·출국 준비 등)이 마지막 날에 함께 표시됩니다.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
