import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Sparkles,
  Share2,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Edit2,
  Save,
  Gamepad2,
  Wand2,
  Utensils,
  Ticket,
} from 'lucide-react';
import { UsjWaitTimesPanel } from './UsjWaitTimesPanel';

interface USJEvent {
  id: string;
  time: string; // HH:mm
  title: string;
  area: 'nintendo' | 'harrypotter' | 'jurassic' | 'minion' | 'general';
  isExpress: boolean;
  completed: boolean;
  note: string;
}

const DEFAULT_USJ_EVENTS: USJEvent[] = [
  {
    id: 'usj-1',
    time: '08:40',
    title: 'USJ 파크 도착 및 오픈런 대기',
    area: 'general',
    isExpress: false,
    completed: false,
    note: '지하철 JR 유니버설시티역 하차 후 도보 5분. 물 500ml 1병 외 음식물 반입 금지.',
  },
  {
    id: 'usj-2',
    time: '09:30',
    title: '슈퍼 닌텐도 월드 에어리어 입장',
    area: 'nintendo',
    isExpress: true,
    completed: false,
    note: '확약권(정리권) QR코드 스캔. 입장 후 즉시 파워업 밴드 구매 및 등록!',
  },
  {
    id: 'usj-3',
    time: '10:15',
    title: '[익스프레스] 마리오 카트: 쿠파의 도전장',
    area: 'nintendo',
    isExpress: true,
    completed: false,
    note: '익스프레스 전용 라인 입장. AR 고글 착용 후 등껍질 던지기 미션.',
  },
  {
    id: 'usj-4',
    time: '11:30',
    title: '키노피오 카페 점심 식사',
    area: 'nintendo',
    isExpress: false,
    completed: false,
    note: '입구 번호표 수령 필수. 키노피오 버거, 슈퍼버섯 피자볼 추천.',
  },
  {
    id: 'usj-5',
    time: '13:00',
    title: '워터월드 박진감 넘치는 액션 쇼 관람',
    area: 'general',
    isExpress: false,
    completed: false,
    note: '앞쪽 파란 좌석은 물이 많이 튀므로 부모님은 뒤쪽 중간 좌석 착석 권장.',
  },
  {
    id: 'usj-6',
    time: '14:30',
    title: '위저딩 월드 오브 해리포터 입장 & 버터맥주',
    area: 'harrypotter',
    isExpress: true,
    completed: false,
    note: '호그스미드 마을에서 무알콜 버터맥주(프로즌 추천) 시음 및 사진 촬영.',
  },
  {
    id: 'usj-7',
    time: '15:10',
    title: '[익스프레스] 해리포터 앤드 더 포비든 저니',
    area: 'harrypotter',
    isExpress: true,
    completed: false,
    note: '호그와트 성 내부 투어 후 탑승. 멀미가 심하면 탑승 전 멀미약 복용 권장.',
  },
  {
    id: 'usj-8',
    time: '16:30',
    title: '[선택 탑승] 더 플라잉 다이나소어 또는 죠스',
    area: 'jurassic',
    isExpress: true,
    completed: false,
    note: '스릴을 원하면 다이나소어, 부모님과 편하게 즐기려면 죠스 또는 미니언즈.',
  },
  {
    id: 'usj-9',
    time: '18:00',
    title: '원더랜드 & 기념품 샵 쇼핑 & 일몰 야경',
    area: 'general',
    isExpress: false,
    completed: false,
    note: '닌텐도/해리포터 굿즈 면세 5,500엔 이상 시 면세 카운터(출구 옆) 환급 가능.',
  },
];

const STORAGE_KEY = 'osaka_family_usj_schedule_v1';

interface USJSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const USJSchedulerModal: React.FC<USJSchedulerModalProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<USJEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USJ_EVENTS;
  });

  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editNote, setEditNote] = useState('');

  const [addModal, setAddModal] = useState(false);
  const [newTime, setNewTime] = useState('12:00');
  const [newTitle, setNewTitle] = useState('');
  const [newArea, setNewArea] = useState<USJEvent['area']>('general');
  const [newIsExpress, setNewIsExpress] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {}
  }, [events]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const handleStartEdit = (e: USJEvent) => {
    setEditingId(e.id);
    setEditTime(e.time);
    setEditTitle(e.title);
    setEditNote(e.note);
  };

  const handleSaveEdit = (id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, time: editTime, title: editTitle, note: editNote } : e
      )
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleReset = () => {
    if (window.confirm('USJ 타임테이블을 초기 추천 일정으로 되돌릴까요?')) {
      setEvents(DEFAULT_USJ_EVENTS);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newEv: USJEvent = {
      id: `usj-${Date.now()}`,
      time: newTime,
      title: newTitle.trim(),
      area: newArea,
      isExpress: newIsExpress,
      completed: false,
      note: newNote.trim(),
    };
    const updated = [...events, newEv].sort((a, b) => a.time.localeCompare(b.time));
    setEvents(updated);
    setNewTitle('');
    setNewNote('');
    setAddModal(false);
  };

  const handleCopyKakao = () => {
    const text = `🎢 [오사카 USJ 4인 가족 익스프레스 타임라인]\n\n${events
      .map(
        (e) =>
          `${e.completed ? '✅' : '⏰'} ${e.time} - ${e.title} ${e.isExpress ? '[익스프레스]' : ''}\n   └ ${e.note}`
      )
      .join('\n\n')}\n\n💡 꿀팁: 입장 30분 전 알림 필수 확인!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = events.filter((e) => e.completed).length;

  const getAreaBadge = (area: USJEvent['area']) => {
    switch (area) {
      case 'nintendo':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> 닌텐도 월드</span>;
      case 'harrypotter':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 flex items-center gap-1"><Wand2 className="w-3 h-3" /> 해리포터</span>;
      case 'jurassic':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">쥬라기/죠스</span>;
      case 'minion':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">미니언파크</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">일반/쇼</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-yellow-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-1.5">
                <span>🎢 USJ 타임테이블 & 탑승 알림</span>
              </h2>
              <p className="text-xs text-rose-100">익스프레스 4 및 닌텐도 월드 확약권 시간 관리</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary & Actions */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">진행 상황:</span>
            <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {completedCount} / {events.length}개 완료
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>일정 추가</span>
            </button>

            <button
              onClick={handleCopyKakao}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg font-bold transition-all shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? '복사완료!' : '카톡 공유'}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 font-medium"
              title="기본 일정 초기화"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>익스프레스 시간 엄수:</strong> 바우처에 적힌 지정 시간(예: 10:15~10:45)을 1분이라도 넘기면 탑승이 제한될 수 있습니다. <strong>30분 전 알림</strong>을 체크하고 미리 이동하세요!
          </div>
        </div>

        {/* Timeline Event List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          {/* Live USJ ride wait times (Queue-Times.com API, no key required) */}
          <UsjWaitTimesPanel />

          {events.map((e) => (
            <div
              key={e.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                e.completed
                  ? 'bg-slate-50/70 border-slate-200 opacity-70'
                  : e.isExpress
                  ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              {editingId === e.id ? (
                /* Edit Form */
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={editTime}
                      onChange={(ev) => setEditTime(ev.target.value)}
                      className="p-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                    />
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(ev) => setEditTitle(ev.target.value)}
                      className="flex-1 p-1.5 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>
                  <input
                    type="text"
                    value={editNote}
                    onChange={(ev) => setEditNote(ev.target.value)}
                    placeholder="메모 내용"
                    className="w-full p-1.5 border border-slate-300 rounded-lg"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleSaveEdit(e.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" /> 저장
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal View */
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => handleToggle(e.id)}
                      className="mt-0.5 shrink-0 focus:outline-none cursor-pointer"
                    >
                      {e.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black px-2 py-0.5 bg-slate-900 text-white rounded-md">
                          {e.time}
                        </span>
                        {getAreaBadge(e.area)}
                        {e.isExpress && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded-md">
                            EXPRESS 4
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-bold leading-snug ${
                          e.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {e.title}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed">{e.note}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(e)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="시간/내용 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Event Modal Sub-view */}
        {addModal && (
          <div className="p-4 bg-slate-100 border-t border-slate-300 space-y-2 text-xs animate-in slide-in-from-bottom">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>새 USJ 이벤트 추가</span>
              <button onClick={() => setAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">시간</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">테마 구역</label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="nintendo">닌텐도 월드</option>
                    <option value="harrypotter">해리포터</option>
                    <option value="jurassic">쥬라기/죠스</option>
                    <option value="minion">미니언파크</option>
                    <option value="general">일반/쇼/식사</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">일정 제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 싱글라이더로 스파이더맨 탑승"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">세부 팁 / 메모</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="예: 가족 모두 줄서기 없이 싱글라이더 활용"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-bold">
                  <input
                    type="checkbox"
                    checked={newIsExpress}
                    onChange={(e) => setNewIsExpress(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span>익스프레스 패스 적용 항목</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
                >
                  일정 등록
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>💡 USJ 공식 앱에서 'e정리권'을 추가 발급받으면 더 많은 구역 입장 가능</span>
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
