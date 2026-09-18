import React from 'react';
import { X, PhoneCall, ShieldAlert, MapPin, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { emergencyContacts } from '../data/guidebookData';
import { NearbyMedicalFinder } from './NearbyMedicalFinder';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-rose-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div>
              <h2 className="text-lg font-bold">오사카 여행 비상 SOS & 안전 가이드</h2>
              <p className="text-xs text-rose-100">가족의 안전을 위한 긴급 연락망 (PDF 2p 수록)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-rose-700/80 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-sm">
          {/* Quick Dial Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="tel:110"
              className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="p-2 bg-red-600 text-white rounded-lg">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-bold">경찰 신고 (전국)</p>
                <p className="text-lg font-extrabold text-red-900">110</p>
              </div>
            </a>

            <a
              href="tel:119"
              className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <div className="p-2 bg-amber-600 text-white rounded-lg">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-bold">구급차 · 화재</p>
                <p className="text-lg font-extrabold text-amber-900">119</p>
              </div>
            </a>
          </div>

          {/* Nearby Hospital / Pharmacy Finder (Overpass API, no key required) */}
          <NearbyMedicalFinder />

          {/* Consulate Contacts */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">주오사카 대한민국 총영사관</span>
              <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">영사 조력</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href={`tel:${emergencyContacts.embassy}`}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300"
              >
                <div>
                  <span className="text-slate-500 block text-[10px]">근무시간 대표전화</span>
                  <span className="font-bold text-slate-800">{emergencyContacts.embassy}</span>
                </div>
                <PhoneCall className="w-4 h-4 text-blue-600" />
              </a>
              <a
                href={`tel:${emergencyContacts.embassyUrgent}`}
                className="flex items-center justify-between p-2 bg-rose-50 border border-rose-200 rounded-lg hover:border-rose-300"
              >
                <div>
                  <span className="text-rose-600 block text-[10px] font-bold">야간·휴일 긴급당직</span>
                  <span className="font-bold text-rose-800">{emergencyContacts.embassyUrgent}</span>
                </div>
                <PhoneCall className="w-4 h-4 text-rose-600" />
              </a>
            </div>
          </div>

          {/* Meeting Point */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>가족 미아/일행 분산 시 공식 집결지</span>
            </div>
            <p className="text-sm font-extrabold text-emerald-950">
              {emergencyContacts.meetingPoint}
            </p>
            <p className="text-xs text-emerald-700">
              1일차~3일차 모두 핸드폰 배터리가 방전되거나 인파 속에서 흩어졌을 때 숙소 로비로 모이기로 약속하세요!
            </p>
            <div className="mt-2 pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-800 flex items-start gap-1">
              <span className="font-bold shrink-0">택시 제시용 주소:</span>
              <span className="font-mono">{emergencyContacts.hotelAddressJa}</span>
            </div>
          </div>

          {/* Passport Loss Process */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>여권 분실 시 긴급 대처 절차</span>
            </div>
            <ol className="space-y-1.5 text-xs text-amber-950">
              {emergencyContacts.passportLossProcess.map((step, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Safety Checklist */}
          <div className="p-3 bg-slate-100 rounded-xl space-y-1.5">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
              <span>출발 전 꼭 확인해야 할 안전 팁</span>
            </span>
            <ul className="text-xs text-slate-600 space-y-1 pl-1">
              {emergencyContacts.prepChecklist.map((tip, idx) => (
                <li key={idx}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
