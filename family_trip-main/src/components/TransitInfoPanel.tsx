import React from 'react';
import { ExternalLink, Clock, AlertCircle } from 'lucide-react';

// 실시간 운행정보 API는 오사카메트로/난카이 모두 개인 개발자에게 공개돼 있지 않아 지원 불가 —
// 대신 (1) 공식 앱/사이트 바로가기와 (2) 대략적인 첫차·막차·배차간격 정적 정보를 제공합니다.
// 아래 시간은 평일 기준 대략적인 값이며, 요일/공휴일에 따라 달라질 수 있으니 정확한 시간은 반드시 공식 앱에서 재확인하세요.

interface OfficialLink {
  label: string;
  url: string;
  desc: string;
}

const OFFICIAL_LINKS: OfficialLink[] = [
  {
    label: '오사카메트로 공식 앱/사이트',
    url: 'https://www.osakametro.co.jp/en/',
    desc: '미도스지선 등 오사카메트로 전체 노선 실시간 운행정보',
  },
  {
    label: '난카이 트레인 내비',
    url: 'https://www.nankai.co.jp/travel/train-navi.html',
    desc: '라피트·난카이 본선 실시간 운행정보 및 지연 안내',
  },
  {
    label: '구글맵 실시간 길찾기',
    url: 'https://maps.google.com/',
    desc: '환승 경로 + 실시간 대중교통 지연 반영 길찾기',
  },
];

interface StaticTimetable {
  lineName: string;
  firstTrain: string;
  lastTrain: string;
  headway: string;
}

const STATIC_TIMETABLES: StaticTimetable[] = [
  { lineName: '미도스지선 (난바 기준)', firstTrain: '05:00경', lastTrain: '24:00경', headway: '평시 4~5분, 러시아워 2~3분' },
  { lineName: '난카이 본선/라피트 (난바 기준)', firstTrain: '05:30경', lastTrain: '23:30경', headway: '라피트 30분 간격, 일반 10~15분' },
  { lineName: 'JR 간사이공항선 (간사이공항 기준)', firstTrain: '05:45경', lastTrain: '23:00경', headway: '15~30분' },
];

export const TransitInfoPanel: React.FC = () => {
  return (
    <div className="space-y-2.5">
      {/* Official App/Site Quick Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2">
        <h4 className="text-xs font-bold text-slate-700">공식 실시간 운행정보 바로가기</h4>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          오사카메트로·난카이는 개인 개발자에게 실시간 API를 공개하지 않아, 앱 안에서 실시간 지연 정보를 직접
          가져올 수는 없습니다. 대신 공식 채널로 바로 연결해드려요.
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {OFFICIAL_LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all"
            >
              <div>
                <div className="text-xs font-bold text-slate-800">{link.label}</div>
                <div className="text-[10px] text-slate-500">{link.desc}</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Static First/Last Train Timetable */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <h4 className="text-xs font-bold text-slate-700">첫차 · 막차 · 배차간격 (참고용)</h4>
        </div>
        <div className="space-y-1.5">
          {STATIC_TIMETABLES.map((t) => (
            <div key={t.lineName} className="p-2.5 bg-slate-50 rounded-lg text-[11px]">
              <div className="font-bold text-slate-800 mb-1">{t.lineName}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-slate-600">
                <span>첫차 {t.firstTrain}</span>
                <span>막차 {t.lastTrain}</span>
                <span>배차 {t.headway}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
          <span>대략적인 참고용 시간이며, 요일·공휴일·행사 등으로 달라질 수 있습니다. 막차를 놓치면 안 되는 날은 위 공식 앱에서 그날 시간표를 꼭 다시 확인하세요.</span>
        </div>
      </div>
    </div>
  );
};
