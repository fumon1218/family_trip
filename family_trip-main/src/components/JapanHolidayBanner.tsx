import React, { useState, useEffect } from 'react';
import { CalendarDays, Users2 } from 'lucide-react';
import { fetchNextJapanHoliday, UpcomingHoliday } from '../utils/liveDataService';

// 다가오는 30일 이내 일본 공휴일이 있으면 혼잡 예상 안내를 띄움 (date.nager.at API, 키 불필요)
export const JapanHolidayBanner: React.FC = () => {
  const [holiday, setHoliday] = useState<UpcomingHoliday | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchNextJapanHoliday();
      if (!cancelled) {
        setHoliday(result);
        setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 30일 이내 공휴일이 없으면(혹은 조회 실패) 아무것도 표시하지 않음 - 불필요한 정보 노출 방지
  if (!checked || !holiday || holiday.daysUntil > 30) return null;

  const urgency = holiday.daysUntil <= 3 ? '이번' : `${holiday.daysUntil}일 후`;

  return (
    <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-2.5 text-xs">
      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
        <CalendarDays className="w-4 h-4" />
      </div>
      <div className="text-indigo-900">
        <span className="font-black">
          📅 {urgency}({holiday.date}) 일본 공휴일: {holiday.localName}
        </span>
        <span className="ml-1.5 inline-flex items-center gap-1 text-indigo-700">
          <Users2 className="w-3 h-3" />
          USJ·난바·도톤보리가 평소보다 붐빌 수 있어요. 가능하면 오픈런 시간을 더 앞당기는 걸 추천드립니다.
        </span>
      </div>
    </div>
  );
};
