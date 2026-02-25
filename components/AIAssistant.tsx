
import React, { useState } from 'react';
import { getPartyWorkAdvice } from '../services/geminiService';
import { SparklesIcon, PaperAirplaneIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    setResponse(null);
    const advice = await getPartyWorkAdvice(input);
    setResponse(advice);
    setLoading(false);
  };

  const suggestions = [
    "Quy trình xét chuyển đảng viên dự bị thành chính thức?",
    "Nội dung trọng tâm sinh hoạt chi đoàn tháng 1/2026?",
    "Cách viết bản kiểm điểm đảng viên cuối năm?",
    "Quy định về sinh hoạt chuyên đề quân sự?"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-block p-3 bg-red-100 rounded-2xl mb-4">
          <AcademicCapIcon className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Trợ lý Nghiệp vụ Đoàn thông minh</h2>
        <p className="text-slate-500 mt-2">Sử dụng trí tuệ nhân tạo (Gemini AI) để tư vấn nghiệp vụ CTĐ bám sát thực tiễn Chi đoàn.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-6 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-yellow-400" />
            <span className="font-bold uppercase tracking-wider text-sm">Hỏi đáp Nghiệp vụ</span>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <textarea 
                className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all text-sm"
                placeholder="Nhập nội dung cần tư vấn (ví dụ: Quy trình kết nạp Đoàn cho chiến sĩ mới...)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute bottom-4 right-4 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:bg-slate-300 transition-colors shadow-md"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  type="button"
                  onClick={() => setInput(s)}
                  className="text-[10px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          {response && (
            <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-red-600 p-1 rounded">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-red-800 uppercase">Tư vấn của Trợ lý AI:</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
              <div className="mt-6 pt-4 border-t border-red-200 flex justify-between items-center text-[10px] font-bold text-slate-500 italic">
                <span>Lưu ý: Nội dung chỉ mang tính chất tham khảo nghiệp vụ.</span>
                <button 
                  onClick={() => {
                    const blob = new Blob([response], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'tu-van-nghiep-vu.txt';
                    a.click();
                  }}
                  className="text-red-700 hover:underline uppercase"
                >
                  Tải về bản hướng dẫn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
