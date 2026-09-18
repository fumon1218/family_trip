import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Copy,
  Check,
  Maximize2,
  X,
  Sparkles,
  Send,
  HelpCircle,
  Smartphone,
  CreditCard,
  Luggage,
  Ticket,
  AlertOctagon,
  ShieldCheck,
  Bot,
  ExternalLink,
  Hotel,
} from 'lucide-react';
import { japanesePhrasesData, emergencyContacts } from '../data/guidebookData';
import { JapanesePhrase, Accommodation } from '../types';

interface GuidebookAITabProps {
  onOpenTaxi?: () => void;
  onOpenPacking?: () => void;
  onOpenWeather?: () => void;
  onOpenUsj?: () => void;
  onOpenDutyFree?: () => void;
  onOpenConvenience?: () => void;
  onOpenRestaurantPhrases?: () => void;
  onOpenAirport?: () => void;
  onOpenPhotoSpots?: () => void;
  selectedHotel?: Accommodation;
  onOpenAccommodationModal?: () => void;
}

export const GuidebookAITab: React.FC<GuidebookAITabProps> = ({
  onOpenTaxi,
  onOpenPacking,
  onOpenWeather,
  onOpenUsj,
  onOpenDutyFree,
  onOpenConvenience,
  onOpenRestaurantPhrases,
  onOpenAirport,
  onOpenPhotoSpots,
  selectedHotel,
  onOpenAccommodationModal,
}) => {
  const [activeSection, setActiveSection] = useState<'phrases' | 'guides' | 'ai'>('phrases');
  const [phraseFilter, setPhraseFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [largePhraseModal, setLargePhraseModal] = useState<JapanesePhrase | null>(null);

  // AI Concierge State
  const [questionInput, setQuestionInput] = useState('');
  const [aiChatLog, setAiChatLog] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: '안녕하세요! 오사카 4인 가족 여행 전문 AI 가이드입니다. 숙소인 미마루 난바 NORTH를 중심으로 USJ 동선, 대중교통 환승, 자녀/부모님 맞춤 맛집, 알레르기 표현 등 궁금한 점을 언제든 물어보세요!',
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Play Speech using browser Web Speech API
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
    }
  };

  const handleCopy = (phrase: JapanesePhrase) => {
    navigator.clipboard.writeText(`${phrase.japaneseText} (${phrase.pronunciation})`);
    setCopiedId(phrase.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [aiChatCopiedIdx, setAiChatCopiedIdx] = useState<number | null>(null);

  const handleCopyChatAnswer = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setAiChatCopiedIdx(idx);
    setTimeout(() => setAiChatCopiedIdx(null), 2000);
  };

  const handleAskAI = async (customPrompt?: string) => {
    const q = customPrompt || questionInput;
    if (!q.trim() || aiLoading) return;

    const newLogs = [...aiChatLog, { role: 'user' as const, text: q }];
    setAiChatLog(newLogs);
    setQuestionInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: '4인 가족 (부모님 + 고등학생 자녀 2명), 숙소: 미마루 오사카 난바 NORTH, 2박3일 일정 중 2일차 USJ 종일, 3일차 오사카성 및 우메다 다이마루 쇼핑.',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || '답변 생성 실패');
      }

      const data = await res.json();
      const reply = data.answer || '답변을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
      setAiChatLog([...newLogs, { role: 'assistant', text: reply }]);
    } catch (err: any) {
      setAiChatLog([
        ...newLogs,
        {
          role: 'assistant',
          text: '일시적인 네트워크 지연이 발생했습니다. 내장된 PDF 가이드(USJ 공략법, 라피트 환승, 추천 맛집)를 참고하시거나 위 질문 버튼을 다시 눌러주세요!',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredPhrases = japanesePhrasesData.filter((p) => {
    if (phraseFilter === 'all') return true;
    return p.category === phraseFilter;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Top Switcher */}
      <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
        <button
          onClick={() => setActiveSection('phrases')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSection === 'phrases'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>생존 일본어 & 알레르기</span>
        </button>

        <button
          onClick={() => setActiveSection('guides')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSection === 'guides'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>PDF 핵심 가이드북</span>
        </button>

        <button
          onClick={() => setActiveSection('ai')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSection === 'ai'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-600" />
          <span>AI 가족 컨시어지</span>
        </button>
      </div>

      {/* SECTION 1: JAPANESE PHRASES & EMERGENCY ALLERGY */}
      {activeSection === 'phrases' && (
        <div className="space-y-3.5">
          {/* Intro Notice */}
          <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs text-rose-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong>여행에서 100% 통하는 생존 표현 (PDF 9p, 10p):</strong>
              <p className="text-slate-600 mt-0.5">
                스피커 아이콘을 누르면 일본어 원어민 발음(TTS)이 재생되며, <strong>[크게 보여주기]</strong>를 누르면 현지인이나 점원에게 화면을 크게 보여줄 수 있습니다.
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: '전체' },
              { id: 'essential', label: '기본 인사·요청' },
              { id: 'dining', label: '식당·주문' },
              { id: 'shopping', label: '쇼핑·면세' },
              { id: 'allergy', label: '🚨 알레르기 주의' },
              { id: 'emergency', label: '🏥 응급·길찾기' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPhraseFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  phraseFilter === f.id
                    ? f.id === 'allergy' || f.id === 'emergency'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Phrase Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPhrases.map((phrase) => {
              const isUrgent = phrase.category === 'allergy' || phrase.category === 'emergency';
              return (
                <div
                  key={phrase.id}
                  className={`bg-white rounded-2xl border p-3.5 shadow-xs flex flex-col justify-between transition-all ${
                    isUrgent ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUrgent
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {phrase.category === 'allergy'
                          ? '🚨 알레르기'
                          : phrase.category === 'emergency'
                          ? '🏥 응급'
                          : phrase.category === 'dining'
                          ? '식당'
                          : phrase.category === 'shopping'
                          ? '쇼핑'
                          : '기본'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSpeak(phrase.japaneseText)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="일본어 발음 듣기"
                        >
                          <Volume2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => setLargePhraseModal(phrase)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="현지인에게 크게 보여주기"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleCopy(phrase)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="복사하기"
                        >
                          {copiedId === phrase.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {phrase.koreanMeaning}
                    </h4>

                    {/* Japanese text */}
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                      <p className="text-sm sm:text-base font-bold text-slate-900 tracking-wide font-sans">
                        {phrase.japaneseText}
                      </p>
                      <p className="text-xs font-semibold text-rose-600">
                        발음: {phrase.pronunciation}
                      </p>
                    </div>

                    {phrase.contextTip && (
                      <p className="text-[11px] text-slate-500 italic">
                        💡 {phrase.contextTip}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: PDF ESSENTIAL GUIDES */}
      {activeSection === 'guides' && (
        <div className="space-y-4">
          {/* Quick Travel Toolkit Row */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold">오사카 가족 여행 핵심 툴킷</h3>
              </div>
              <span className="text-[11px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full">
                원터치 바로가기
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {onOpenAccommodationModal && (
                <button
                  type="button"
                  onClick={onOpenAccommodationModal}
                  className="p-2.5 bg-rose-950/80 hover:bg-rose-900 active:scale-95 rounded-xl text-left border border-rose-700/80 transition-all cursor-pointer shadow-xs"
                >
                  <div className="text-lg mb-1">🏨</div>
                  <div className="text-xs font-bold text-rose-200 truncate">숙소 베이스캠프</div>
                  <div className="text-[10px] text-rose-300/80 truncate">
                    {selectedHotel ? selectedHotel.nameKo.split(' ')[0] : '미마루'} • 변경
                  </div>
                </button>
              )}

              {onOpenTaxi && (
                <button
                  type="button"
                  onClick={onOpenTaxi}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-left border border-slate-700 transition-all cursor-pointer"
                >
                  <div className="text-lg mb-1">🚖</div>
                  <div className="text-xs font-bold text-white">택시 목적지 카드</div>
                  <div className="text-[10px] text-slate-400">기사님 전용 큰 글씨</div>
                </button>
              )}

              {onOpenPacking && (
                <button
                  type="button"
                  onClick={onOpenPacking}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-left border border-slate-700 transition-all cursor-pointer"
                >
                  <div className="text-lg mb-1">🎒</div>
                  <div className="text-xs font-bold text-white">패킹 체크리스트</div>
                  <div className="text-[10px] text-slate-400">여권·돼지코·상비약</div>
                </button>
              )}

              {onOpenWeather && (
                <button
                  type="button"
                  onClick={onOpenWeather}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-left border border-slate-700 transition-all cursor-pointer"
                >
                  <div className="text-lg mb-1">☀️</div>
                  <div className="text-xs font-bold text-white">우천 시 대체 코스</div>
                  <div className="text-[10px] text-slate-400">비 올 때 실내 플랜B</div>
                </button>
              )}

              {onOpenUsj && (
                <button
                  type="button"
                  onClick={onOpenUsj}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-left border border-slate-700 transition-all cursor-pointer"
                >
                  <div className="text-lg mb-1">🎢</div>
                  <div className="text-xs font-bold text-white">USJ 타임테이블</div>
                  <div className="text-[10px] text-slate-400">익스프레스 시간 관리</div>
                </button>
              )}

              {onOpenDutyFree && (
                <button
                  type="button"
                  onClick={onOpenDutyFree}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-left border border-slate-700 transition-all cursor-pointer"
                >
                  <div className="text-lg mb-1">🛍️</div>
                  <div className="text-xs font-bold text-amber-300">면세 쇼핑 계산기</div>
                  <div className="text-[10px] text-slate-400">5,500엔 비과세·쿠폰</div>
                </button>
              )}

              {onOpenConvenience && (
                <button
                  type="button"
                  onClick={onOpenConvenience}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-left border border-slate-700 transition-all cursor-pointer"
                >
                  <div className="text-lg mb-1">🏪</div>
                  <div className="text-xs font-bold text-blue-300">편의점 야식 도감</div>
                  <div className="text-[10px] text-slate-400">로손·세븐·계산대 회화</div>
                </button>
              )}

              {onOpenRestaurantPhrases && (
                <button
                  type="button"
                  onClick={onOpenRestaurantPhrases}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-left border border-slate-700 transition-all cursor-pointer"
                >
                  <div className="text-lg mb-1">🍽️</div>
                  <div className="text-xs font-bold text-rose-300">식당 맞춤 요청 카드</div>
                  <div className="text-[10px] text-slate-400">와사비·덜 짜게·앞접시</div>
                </button>
              )}

              {onOpenAirport && (
                <button
                  type="button"
                  onClick={onOpenAirport}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-left border border-slate-700 transition-all cursor-pointer"
                >
                  <div className="text-lg mb-1">✈️</div>
                  <div className="text-xs font-bold text-sky-300">출국·수하물 플래너</div>
                  <div className="text-[10px] text-slate-400">역산 일정·곤약젤리 주의</div>
                </button>
              )}

              {onOpenPhotoSpots && (
                <button
                  type="button"
                  onClick={onOpenPhotoSpots}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl text-left border border-slate-700 transition-all cursor-pointer"
                >
                  <div className="text-lg mb-1">📸</div>
                  <div className="text-xs font-bold text-purple-300">가족 인생샷 명당</div>
                  <div className="text-[10px] text-slate-400">글리코상·USJ 구도 팁</div>
                </button>
              )}
            </div>
          </div>

          {/* Guide 1: eSIM & ICOCA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  eSIM & 교통카드(ICOCA) 완벽 가이드 (PDF 6p)
                </h3>
                <p className="text-xs text-slate-500">라피트 QR 탑승과 일정 동기화를 위한 1순위 준비사항</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                <span className="font-bold text-slate-900">📶 eSIM 데이터 연결:</span>
                <p>• 출발 2~3일 전 한국에서 미리 구매·다운로드해 두세요.</p>
                <p>• 비행기 안에서 'eSIM 회선 켜기'만 해두면 착륙 즉시 데이터가 자동 연결됩니다.</p>
                <p>• 4인 가족 각자 스마트폰마다 1인 1eSIM 권장 (핫스팟은 배터리 소모 극심).</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                <span className="font-bold text-slate-900">💳 ICOCA 교통카드:</span>
                <p>• 아이폰: '애플월렛'에 ICOCA를 추가하여 한국 신용카드로 충전해 가면 가장 편리합니다.</p>
                <p>• 안드로이드: 난바역 자동발매기에서 실물 카드 구매 (보증금 500엔 포함) 또는 모바일 앱 이용.</p>
                <p>• 4인 가족이면 4장을 준비하여 개찰구를 1명씩 연속으로 빠르게 통과하세요.</p>
              </div>
            </div>
          </div>

          {/* Guide 2: MyRealTrip 3-Core Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  마이리얼트립 3종 티켓 활용 팁 (PDF 6p, 7p)
                </h3>
                <p className="text-xs text-slate-500">현장 매표소 긴 대기줄 없이 바로 통과하는 핵심 비법</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                <span className="font-bold text-blue-900">1. 특급열차 라피트 (공항 ↔ 난바):</span>
                <p>결제 후 바우처 링크 클릭 → 난카이 사이트에서 날짜/시간/4인 좌석 지정 필수! 비행기 지연 시 스마트폰으로 출발 5분 전까지 무료 변경 가능.</p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 space-y-1">
                <span className="font-bold text-amber-900">2. USJ 입장권 + 익스프레스 4:</span>
                <p>익스프레스 4 구매 시 '마리오(닌텐도 월드)'와 '해리포터' 확약권이 포함된 펀/버라이어티 옵션 선택. 4명 각자의 폰에 QR 코드를 저장해두면 익스프레스 전용 라인 즉시 탑승!</p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-900">3. 오사카성 천수각 E-티켓:</span>
                <p>현장 매표소의 긴 줄을 서지 않고 천수각 입구(게이트)로 직행하여 QR 코드를 스캔하고 바로 입장합니다.</p>
              </div>
            </div>
          </div>

          {/* Guide 3: Day 3 Luggage Storage */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Luggage className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  3일차 짐 보관 완벽 안내 (PDF 10p)
                </h3>
                <p className="text-xs text-slate-500">저녁 7시 비행기까지 가벼운 몸으로 오사카성 & 우메다 투어</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p>• <strong>숙소(미마루 난바 NORTH) 프론트:</strong> 체크아웃 당일 오후까지 무료 짐 보관 가능 여부를 체크아웃 전날 미리 확인하세요.</p>
                <p>• <strong>난바역 코인로커:</strong> 대형 캐리어 4개 기준 대형 로커 1~2개 필요. 아침 9시대에 일찍 채워지므로 오전 일찍 보관 권장.</p>
                <p>• <strong>라피트 팁:</strong> 열차 내 캐리어 보관함이 한정적이므로 승강장에 10분 일찍 도착해 짐을 먼저 거치하세요.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: GEMINI AI CONCIERGE */}
      {activeSection === 'ai' && (
        <div className="space-y-3">
          <div className="p-3 bg-purple-50/90 border border-purple-200 rounded-2xl text-xs text-purple-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong>Gemini 3.8 Flash 기반 오사카 가족 여행 AI 가이드:</strong>
              <p className="text-slate-600 mt-0.5">
                4인 가족(부모님, 고교생 자녀) 맞춤 일정, 날씨에 따른 실시간 대안, 숨은 식당 추천, 일본어 맞춤 번역 등을 자유롭게 질문하세요.
              </p>
            </div>
          </div>

          {/* Quick Question Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'USJ 닌텐도월드 대기 줄이는 꿀팁?',
              '구로몬 시장에서 꼭 먹어야 할 4인 가족 간식?',
              '3일차 비가 올 때 오사카성 대체 실내 코스는?',
              '부모님이 좋아하실 덜 짠 라멘/식당 추천해줘',
            ].map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleAskAI(promptText)}
                className="text-[11px] bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1.5 rounded-xl font-medium shadow-xs transition-colors"
              >
                💬 {promptText}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3 min-h-[220px] max-h-[380px] overflow-y-auto">
            {aiChatLog.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 text-xs ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed whitespace-pre-wrap relative group ${
                    msg.role === 'user'
                      ? 'bg-rose-600 text-white font-medium rounded-tr-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <div>{msg.text}</div>
                  {msg.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-end">
                      <button
                        onClick={() => handleCopyChatAnswer(msg.text, idx)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs transition-colors"
                      >
                        {aiChatCopiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">복사 완료!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>가족 공유용 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex gap-2 text-xs items-center text-slate-400 animate-pulse">
                <Bot className="w-4 h-4 text-purple-500" />
                <span>오사카 가족 가이드 AI가 답변을 작성하고 있습니다...</span>
              </div>
            )}
          </div>

          {/* Question Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAI();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="오사카 여행이나 맛집, 일본어 표현에 대해 무엇이든 질문하세요..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600 shadow-xs"
              disabled={aiLoading}
            />
            <button
              type="submit"
              disabled={aiLoading || !questionInput.trim()}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>전송</span>
            </button>
          </form>
        </div>
      )}

      {/* Large Phrase Fullscreen Modal */}
      {largePhraseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">현지인에게 직접 보여주는 화면</span>
              <button
                onClick={() => setLargePhraseModal(null)}
                className="p-1 rounded-full bg-slate-100 hover:bg-slate-200"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="py-6 space-y-4">
              <p className="text-xs font-bold text-slate-500">{largePhraseModal.koreanMeaning}</p>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug break-words px-2">
                {largePhraseModal.japaneseText}
              </h2>
              <p className="text-base font-bold text-rose-600">
                {largePhraseModal.pronunciation}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleSpeak(largePhraseModal.japaneseText)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Volume2 className="w-4 h-4" />
                <span>일본어 발음 듣기</span>
              </button>
              <button
                onClick={() => setLargePhraseModal(null)}
                className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
