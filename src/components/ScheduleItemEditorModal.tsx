import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { ScheduleItem } from '../types';

interface ScheduleItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ScheduleItem) => void;
  onDelete?: (id: string) => void;
  tripDays: number;
  defaultDay: number;
  editingItem: ScheduleItem | null; // null이면 새 일정 추가 모드
}

const CATEGORY_OPTIONS: { value: ScheduleItem['category']; label: string }[] = [
  { value: 'transport', label: '🚇 교통/이동' },
  { value: 'attraction', label: '📷 관광/명소' },
  { value: 'food', label: '🍽️ 식사' },
  { value: 'shopping', label: '🛍️ 쇼핑' },
  { value: 'rest', label: '☕ 휴식' },
  { value: 'hotel', label: '🏨 숙소' },
];

function makeId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const emptyForm = {
  day: 1,
  time: '10:00',
  title: '',
  location: '',
  description: '',
  category: 'attraction' as ScheduleItem['category'],
};

export const ScheduleItemEditorModal: React.FC<ScheduleItemEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  tripDays,
  defaultDay,
  editingItem,
}) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setForm({
        day: editingItem.day,
        time: editingItem.time,
        title: editingItem.title,
        location: editingItem.location,
        description: editingItem.description,
        category: editingItem.category,
      });
    } else {
      setForm({ ...emptyForm, day: defaultDay });
    }
  }, [isOpen, editingItem, defaultDay]);

  if (!isOpen) return null;

  const isEditMode = !!editingItem;

  const handleSave = () => {
    if (!form.title.trim()) return;
    const item: ScheduleItem = {
      ...(editingItem || {}),
      id: editingItem?.id || makeId(),
      day: form.day,
      time: form.time,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      category: form.category,
      completed: editingItem?.completed || false,
    };
    onSave(item);
    onClose();
  };

  const handleDelete = () => {
    if (editingItem && onDelete && window.confirm('이 일정을 삭제할까요?')) {
      onDelete(editingItem.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold">{isEditMode ? '일정 수정' : '새 일정 추가'}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Day & Time */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">일차</label>
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {Array.from({ length: tripDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}일차
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">시간</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">종류</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ScheduleItem['category'] })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">일정 제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="예: 신사이바시 쇼핑"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">장소</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="예: 신사이바시스지 상점가"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">메모/설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="세부 계획이나 준비물을 적어두세요"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {isEditMode ? (
            <button
              onClick={handleDelete}
              className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              삭제
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!form.title.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
