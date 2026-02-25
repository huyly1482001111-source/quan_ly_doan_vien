
import React, { useState } from 'react';
import { Member, User, EditRequest, MemberStatus, MemberRole } from '../types';
import { 
  IdentificationIcon, 
  AcademicCapIcon, 
  ShieldCheckIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  TrophyIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface MemberProfileProps {
  currentUser: User;
  members: Member[];
  editRequests: EditRequest[];
  onAddRequest: (req: EditRequest) => void;
}

const ProfileField = ({ label, value, isPending }: { label: string, value?: string, isPending?: boolean }) => (
  <div className={`py-2 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center ${isPending ? 'bg-orange-50/50 px-2 rounded-lg' : ''}`}>
    <div className="flex items-center space-x-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      {isPending && <span className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded font-black uppercase">Đợi duyệt</span>}
    </div>
    <span className={`text-sm font-semibold ${isPending ? 'text-orange-700' : 'text-slate-800'}`}>{value || '---'}</span>
  </div>
);

const MemberProfile: React.FC<MemberProfileProps> = ({ currentUser, members, editRequests, onAddRequest }) => {
  const myMemberInfo = members.find(m => m.id === currentUser.memberId);
  const myRequest = editRequests.find(r => r.memberId === currentUser.memberId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>(myMemberInfo || {});
  const [activeTab, setActiveTab] = useState<'personal' | 'party' | 'education' | 'history'>('personal');

  if (!myMemberInfo) return <div className="p-8 text-center text-slate-500 italic">Không tìm thấy thông tin hồ sơ liên kết với tài khoản này.</div>;

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const request: EditRequest = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: myMemberInfo.id,
      memberName: myMemberInfo.fullName,
      requestedAt: new Date().toLocaleDateString('vi-VN'),
      changes: formData
    };
    onAddRequest(request);
    setIsEditing(false);
    alert('Yêu cầu thay đổi hồ sơ đã được gửi tới Bí thư chi đoàn phê duyệt.');
  };

  const getVal = (field: keyof Member) => {
    return myRequest?.changes[field] !== undefined ? (myRequest.changes as any)[field] : (myMemberInfo as any)[field];
  };

  const isChanged = (field: keyof Member) => {
    return myRequest?.changes[field] !== undefined && (myRequest.changes as any)[field] !== (myMemberInfo as any)[field];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Báo trạng thái chờ duyệt */}
      {myRequest && (
        <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-xl">
              <ArrowPathIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-orange-800 uppercase">Hồ sơ đang chờ phê duyệt</p>
              <p className="text-xs text-orange-600">Yêu cầu gửi ngày {myRequest.requestedAt}. Thông tin mới đang được Bí thư thẩm định.</p>
            </div>
          </div>
          <ExclamationCircleIcon className="w-8 h-8 text-orange-300" />
        </div>
      )}

      {/* Header Profile */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {myMemberInfo.fullName.charAt(0)}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{myMemberInfo.fullName}</h3>
            <p className="text-sm text-slate-500 font-medium">{myMemberInfo.militaryRank} - {myMemberInfo.position}</p>
          </div>
        </div>
        {!myRequest && (
          <button 
            onClick={() => { setFormData({...myMemberInfo}); setIsEditing(true); }}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl transition-all font-bold text-xs uppercase shadow-lg shadow-slate-200"
          >
            <PencilSquareIcon className="w-4 h-4" />
            <span>Đề nghị sửa hồ sơ</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột Trái: Đảng tịch & Trình độ */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-red-600 uppercase mb-4 flex items-center">
              <ShieldCheckIcon className="w-4 h-4 mr-2" />
              Thông tin Đoàn tịch
            </h4>
            <div className="space-y-4">
              <ProfileField label="Trạng thái" value={getVal('status')} isPending={isChanged('status')} />
              <ProfileField label="Số thẻ Đảng" value={getVal('partyCardNumber')} isPending={isChanged('partyCardNumber')} />
              <ProfileField label="Ngày vào Đảng" value={getVal('partyDate')} isPending={isChanged('partyDate')} />
              <ProfileField label="Ngày chính thức" value={getVal('officialDate')} isPending={isChanged('officialDate')} />
              <ProfileField label="Người giới thiệu 1" value={getVal('introducer1')} isPending={isChanged('introducer1')} />
              <ProfileField label="Người giới thiệu 2" value={getVal('introducer2')} isPending={isChanged('introducer2')} />
              <ProfileField label="Đơn vị sinh hoạt" value={getVal('unit')} isPending={isChanged('unit')} />
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-blue-600 uppercase mb-4 flex items-center">
              <AcademicCapIcon className="w-4 h-4 mr-2" />
              Trình độ & Sức khỏe
            </h4>
            <div className="space-y-4">
              <ProfileField label="Văn hóa" value={getVal('educationLevel')} isPending={isChanged('educationLevel')} />
              <ProfileField label="Lý luận CT" value={getVal('politicalTheory')} isPending={isChanged('politicalTheory')} />
              <ProfileField label="Chuyên môn KT" value={getVal('technicalTitle')} isPending={isChanged('technicalTitle')} />
              <ProfileField label="Ngoại ngữ" value={getVal('foreignLanguage')} isPending={isChanged('foreignLanguage')} />
              <ProfileField label="Sức khỏe" value={getVal('healthStatus')} isPending={isChanged('healthStatus')} />
            </div>
          </section>
        </div>

        {/* Cột Phải: Sơ yếu & Lịch sử */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 uppercase mb-6 flex items-center border-b border-slate-100 pb-4">
              <IdentificationIcon className="w-5 h-5 mr-2 text-slate-400" />
              Thông tin quân nhân & Sơ yếu
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <ProfileField label="Họ tên khai sinh" value={getVal('fullName')} isPending={isChanged('fullName')} />
              <ProfileField label="Ngày sinh" value={getVal('birthDate')} isPending={isChanged('birthDate')} />
              <ProfileField label="Dân tộc" value={getVal('ethnicity')} isPending={isChanged('ethnicity')} />
              <ProfileField label="Tôn giáo" value={getVal('religion')} isPending={isChanged('religion')} />
              <ProfileField label="Quê quán" value={getVal('hometown')} isPending={isChanged('hometown')} />
              <ProfileField label="Nơi sinh" value={getVal('nativePlace')} isPending={isChanged('nativePlace')} />
              <ProfileField label="Nơi ở hiện nay" value={getVal('currentResidence')} isPending={isChanged('currentResidence')} />
              <ProfileField label="Cấp bậc" value={getVal('militaryRank')} isPending={isChanged('militaryRank')} />
              <ProfileField label="Chức vụ" value={getVal('position')} isPending={isChanged('position')} />
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 uppercase mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-slate-400" />
              Quá trình công tác
            </h4>
            <div className={`p-4 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap ${isChanged('background') ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
              {getVal('background') || 'Chưa có dữ liệu.'}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-green-600 uppercase mb-4 flex items-center">
                <TrophyIcon className="w-4 h-4 mr-2" />
                Khen thưởng
              </h4>
              <div className={`p-3 rounded-lg border text-xs italic ${isChanged('rewardHistory') ? 'bg-orange-50 border-orange-200' : 'bg-green-50/30 border-green-100'}`}>
                {getVal('rewardHistory') || 'Chưa có thông tin khen thưởng.'}
              </div>
            </section>
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-red-600 uppercase mb-4 flex items-center">
                <ShieldExclamationIcon className="w-4 h-4 mr-2" />
                Kỷ luật
              </h4>
              <div className={`p-3 rounded-lg border text-xs italic ${isChanged('disciplineHistory') ? 'bg-orange-50 border-orange-200' : 'bg-red-50/30 border-red-100'}`}>
                {getVal('disciplineHistory') || 'Không.'}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* MODAL ĐỀ NGHỊ SỬA HỒ SƠ */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
              <h4 className="text-lg font-bold uppercase">Đề nghị sửa đổi hồ sơ</h4>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/10 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
            </div>

            <div className="flex border-b bg-slate-50 shrink-0 overflow-x-auto">
              {['personal', 'party', 'education', 'history'].map((t) => (
                <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 min-w-[120px] py-4 text-[10px] font-black uppercase transition-all ${activeTab === t ? 'bg-white text-red-600 border-b-2 border-red-600' : 'text-slate-500'}`}>
                  {t === 'personal' ? '1. Cá nhân' : t === 'party' ? '2. Đảng tịch' : t === 'education' ? '3. Trình độ' : '4. Lịch sử'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitRequest} className="flex-1 overflow-y-auto p-8 space-y-8">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-2">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Họ và tên</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Ngày sinh</label><input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Dân tộc</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.ethnicity} onChange={e => setFormData({...formData, ethnicity: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Tôn giáo</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.religion} onChange={e => setFormData({...formData, religion: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Quê quán</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.hometown} onChange={e => setFormData({...formData, hometown: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Nơi sinh</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.nativePlace} onChange={e => setFormData({...formData, nativePlace: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Nơi ở hiện nay</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.currentResidence} onChange={e => setFormData({...formData, currentResidence: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Cấp bậc</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.militaryRank} onChange={e => setFormData({...formData, militaryRank: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Chức vụ</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Đơn vị sinh hoạt</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} /></div>
                </div>
              )}
              {activeTab === 'party' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-2">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Số thẻ Đảng</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={formData.partyCardNumber} onChange={e => setFormData({...formData, partyCardNumber: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Ngày vào Đảng</label><input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.partyDate} onChange={e => setFormData({...formData, partyDate: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Ngày chính thức</label><input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.officialDate} onChange={e => setFormData({...formData, officialDate: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Người giới thiệu 1</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.introducer1} onChange={e => setFormData({...formData, introducer1: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Người giới thiệu 2</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.introducer2} onChange={e => setFormData({...formData, introducer2: e.target.value})} /></div>
                </div>
              )}
              {activeTab === 'education' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Văn hóa</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.educationLevel} onChange={e => setFormData({...formData, educationLevel: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Lý luận CT</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.politicalTheory} onChange={e => setFormData({...formData, politicalTheory: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Chuyên môn KT</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.technicalTitle} onChange={e => setFormData({...formData, technicalTitle: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Ngoại ngữ</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.foreignLanguage} onChange={e => setFormData({...formData, foreignLanguage: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Sức khỏe</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.healthStatus} onChange={e => setFormData({...formData, healthStatus: e.target.value})} /></div>
                </div>
              )}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Quá trình công tác</label><textarea className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.background} onChange={e => setFormData({...formData, background: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-green-700 uppercase">Thành tích khen thưởng</label><textarea className="w-full h-24 p-3 bg-green-50/20 border border-green-200 rounded-xl text-sm" value={formData.rewardHistory} onChange={e => setFormData({...formData, rewardHistory: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-red-700 uppercase">Vi phạm kỷ luật (nếu có)</label><textarea className="w-full h-24 p-3 bg-red-50/20 border border-red-200 rounded-xl text-sm" value={formData.disciplineHistory} onChange={e => setFormData({...formData, disciplineHistory: e.target.value})} /></div>
                </div>
              )}
            </form>

            <div className="p-8 border-t bg-slate-50 flex space-x-4 shrink-0">
               <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all uppercase text-xs">Hủy bỏ</button>
               <button type="submit" onClick={handleSubmitRequest} className="flex-2 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-200 transition-all uppercase text-xs">Gửi yêu cầu phê duyệt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
