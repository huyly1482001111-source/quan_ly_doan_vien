
import React, { useState, useCallback, useMemo } from 'react';
import { Meeting, User, MemberRole, Member, MemberStatus } from '../types';
import { 
  CalendarIcon, 
  UsersIcon, 
  DocumentArrowDownIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  CheckBadgeIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import { exportToWord } from '../utils/exportUtils';

interface MeetingLogProps {
  currentUser: User;
  members: Member[];
  meetings: Meeting[];
  onAddMeeting: (m: Meeting) => void;
  onUpdateMeeting: (m: Meeting) => void;
  onDeleteMeeting: (id: string) => void;
}

const EMPTY_TEMPLATE: Omit<Meeting, 'id'> = {
  title: '',
  date: '',
  type: 'Định kỳ',
  content: '',
  attendeesCount: 0,
  totalMembers: 0,
  resolution: ''
};

const MeetingLog: React.FC<MeetingLogProps> = ({ 
  currentUser, members, meetings, onAddMeeting, onUpdateMeeting, onDeleteMeeting 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState<Omit<Meeting, 'id'>>(EMPTY_TEMPLATE);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const isSecretary = currentUser.role === MemberRole.SECRETARY || currentUser.role === MemberRole.DEPUTY_SECRETARY;

  const activeMembersCount = useMemo(() => 
    members.filter(m => m.status !== MemberStatus.TRANSFERRED).length, 
  [members]);

  const handleOpenAdd = () => {
    setEditingMeeting(null);
    setFormErrors({});
    setFormData({
      ...EMPTY_TEMPLATE,
      date: new Date().toISOString().split('T')[0],
      attendeesCount: activeMembersCount,
      totalMembers: activeMembersCount
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Meeting) => {
    setEditingMeeting(m);
    setFormErrors({});
    const { id, ...rest } = m;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMeeting(null);
    setFormData(EMPTY_TEMPLATE);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    if (!formData.title.trim()) errors.title = true;
    if (!formData.date) errors.date = true;
    if (!formData.content.trim()) errors.content = true;
    if (!formData.resolution.trim()) errors.resolution = true;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingMeeting) {
      onUpdateMeeting({ ...editingMeeting, ...formData } as Meeting);
    } else {
      const newMeeting: Meeting = {
        ...formData,
        id: 'MEET-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
      } as Meeting;
      onAddMeeting(newMeeting);
    }
    handleCloseModal();
    alert('Thao tác thành công.');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Xác nhận xóa vĩnh viễn biên bản này?')) {
      onDeleteMeeting(id);
      if (viewingMeeting?.id === id) setViewingMeeting(null);
      alert('Đã xóa biên bản.');
    }
  };

  const handleExportWord = (meeting: Meeting) => {
    const htmlContent = `
      <div style="text-align: center; font-weight: bold; font-family: 'Times New Roman';">ĐẢNG CỘNG SẢN VIỆT NAM</div>
      <div style="text-align: center; font-weight: bold; font-family: 'Times New Roman';">CHI ĐOÀN ĐẠI ĐỘI 10</div>
      <br/>
      <div style="text-align: center; font-size: 14pt; font-weight: bold; font-family: 'Times New Roman';">BIÊN BẢN SINH HOẠT CHI ĐOÀN</div>
      <div style="text-align: center; font-weight: bold; font-family: 'Times New Roman';">${meeting.title.toUpperCase()}</div>
      <br/>
      <div style="font-family: 'Times New Roman';">
        <p><b>I. Thời gian, địa điểm:</b></p>
        <p>- Thời gian: Ngày ${meeting.date}</p>
        <p>- Địa điểm: Phòng sinh hoạt đơn vị.</p>
        <p><b>II. Thành phần:</b></p>
        <p>- Tổng số đảng viên: ${meeting.totalMembers} đồng chí.</p>
        <p>- Có mặt: ${meeting.attendeesCount} đồng chí.</p>
        <p>- Vắng mặt: ${meeting.totalMembers - meeting.attendeesCount} đồng chí.</p>
        <p><b>III. Nội dung sinh hoạt:</b></p>
        <div style="white-space: pre-wrap; margin-top: 10px;">${meeting.content}</div>
        <br/>
        <p><b>IV. Nghị quyết Chi đoàn:</b></p>
        <div style="font-style: italic; border-left: 4px solid #cc0000; padding-left: 15px; margin: 10px 0;">"${meeting.resolution}"</div>
        <br/><br/>
        <table style="width: 100%; border: none;">
          <tr>
            <td style="border: none; text-align: center; width: 50%;">
              <p><b>THƯ KÝ</b></p>
              <br/><br/><br/><br/>
              <p>........................</p>
            </td>
            <td style="border: none; text-align: center; width: 50%;">
              <p><b>BÍ THƯ</b></p>
              <br/><br/><br/><br/>
              <p><b>${currentUser.fullName}</b></p>
            </td>
          </tr>
        </table>
      </div>
    `;
    exportToWord(htmlContent, `Bien_ban_sinh_hoat_${meeting.id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 uppercase flex items-center tracking-tight">
            <CalendarIcon className="w-6 h-6 mr-2 text-red-600" />
            Sổ Biên Bản Sinh Hoạt
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 italic font-medium">Lưu trữ điện tử theo quy định bảo mật</p>
        </div>
        {isSecretary && (
          <button 
            onClick={handleOpenAdd}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-red-100 text-xs font-bold uppercase tracking-wide"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Thêm biên bản</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {meetings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <CalendarIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium italic">Chưa có dữ liệu biên bản sinh hoạt.</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded shadow-sm border ${
                        meeting.type === 'Định kỳ' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                        meeting.type === 'Chuyên đề' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {meeting.type}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-red-700 transition-colors">{meeting.title}</h4>
                  </div>
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-bold text-slate-700">
                    {new Date(meeting.date).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl">
                    <UsersIcon className="w-4 h-4 mr-2 text-slate-400" />
                    <span>Quân số: <b className="text-slate-900">{meeting.attendeesCount}/{meeting.totalMembers}</b></span>
                  </div>
                  <div className="flex items-center text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl">
                    <CheckBadgeIcon className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="truncate">Nghị quyết: <i className="font-medium text-slate-800">"{meeting.resolution}"</i></span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex space-x-2">
                  {isSecretary && (
                    <>
                      <button onClick={() => handleOpenEdit(meeting)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(meeting.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><TrashIcon className="w-5 h-5" /></button>
                    </>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setViewingMeeting(meeting)} className="text-slate-600 text-[10px] font-black hover:text-red-700 uppercase transition-all px-4 py-2 rounded-xl border border-slate-200">Xem chi tiết</button>
                  <button onClick={() => handleExportWord(meeting)} className="bg-white text-slate-700 hover:bg-red-600 hover:text-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm">Xuất Word</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h4 className="text-lg font-bold uppercase tracking-tight">{editingMeeting ? 'Sửa Biên Bản' : 'Biên Bản Mới'}</h4>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase flex justify-between">Tiêu đề * {formErrors.title && <span className="text-red-500">Bắt buộc</span>}</label>
                  <input type="text" className={`w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 ${formErrors.title ? 'border-red-500' : 'border-slate-200'}`} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Tên cuộc họp..." />
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Ngày họp *</label><input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} /></div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Hình thức</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})}>
                    <option value="Định kỳ">Định kỳ</option><option value="Chuyên đề">Chuyên đề</option><option value="Bất thường">Bất thường</option>
                  </select>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Có mặt</label><input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={formData.attendeesCount} onChange={(e) => setFormData({...formData, attendeesCount: parseInt(e.target.value) || 0})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Tổng số</label><input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={formData.totalMembers} onChange={(e) => setFormData({...formData, totalMembers: parseInt(e.target.value) || 0})} /></div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase flex justify-between">Nội dung diễn biến * {formErrors.content && <span className="text-red-500">Bắt buộc</span>}</label>
                  <textarea className={`w-full h-40 p-4 bg-slate-50 border rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-red-500 ${formErrors.content ? 'border-red-500' : 'border-slate-200'}`} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Ghi nhận nội dung sinh hoạt..." />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-red-700 uppercase flex justify-between">Chương trình hoạt động CTĐ/PTTN * {formErrors.resolution && <span className="text-red-500">Bắt buộc</span>}</label>
                  <textarea className={`w-full h-24 p-4 bg-red-50/30 border rounded-xl text-sm font-bold italic outline-none resize-none focus:ring-2 focus:ring-red-500 ${formErrors.resolution ? 'border-red-500' : 'border-red-100'}`} value={formData.resolution} onChange={(e) => setFormData({...formData, resolution: e.target.value})} placeholder="Nội dung nghị quyết..." />
                </div>
              </div>
            </form>
            
            <div className="p-8 border-t bg-slate-50 flex items-center justify-between">
              <button type="button" onClick={() => setFormData({...EMPTY_TEMPLATE, date: new Date().toISOString().split('T')[0], attendeesCount: activeMembersCount, totalMembers: activeMembersCount})} className="text-slate-400 hover:text-red-600 transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase"><NoSymbolIcon className="w-4 h-4" /><span>Xóa trắng form</span></button>
              <div className="flex space-x-4">
                <button type="button" onClick={handleCloseModal} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl uppercase text-xs">Hủy</button>
                <button type="button" onClick={handleSubmit} className="px-8 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-xl uppercase text-xs">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHI TIẾT */}
      {viewingMeeting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="bg-red-700 p-6 text-white flex justify-between items-center">
              <h4 className="text-lg font-bold uppercase">{viewingMeeting.title}</h4>
              <button onClick={() => setViewingMeeting(null)} className="p-2 hover:bg-white/10 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase">Ngày</p><p className="text-sm font-bold text-slate-800">{new Date(viewingMeeting.date).toLocaleDateString('vi-VN')}</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase">Hình thức</p><p className="text-sm font-bold text-slate-800">{viewingMeeting.type}</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center"><p className="text-[10px] font-black text-slate-400 uppercase">Quân số</p><p className="text-sm font-bold text-slate-800">{viewingMeeting.attendeesCount}/{viewingMeeting.totalMembers}</p></div>
              </div>
              <div><h5 className="text-[10px] font-black text-slate-800 uppercase mb-4 border-b pb-2">I. Diễn biến nội dung</h5><div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50/50 p-6 rounded-2xl border border-slate-100">{viewingMeeting.content}</div></div>
              <div><h5 className="text-[10px] font-black text-slate-800 uppercase mb-4 border-b pb-2">II. Nghị quyết phê duyệt</h5><div className="text-base font-bold italic text-red-800 bg-red-50 p-6 rounded-2xl border-l-8 border-red-600 shadow-sm">"{viewingMeeting.resolution}"</div></div>
              <div className="flex justify-between items-center pt-8 border-t gap-4">
                {isSecretary && <button onClick={() => handleDelete(viewingMeeting.id)} className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px] flex items-center space-x-1"><TrashIcon className="w-4 h-4" /><span>Xóa biên bản</span></button>}
                <div className="flex space-x-3">
                   <button onClick={() => handleOpenEdit(viewingMeeting)} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black uppercase text-[10px]">Sửa</button>
                   <button onClick={() => handleExportWord(viewingMeeting)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center space-x-2"><span>Tải Word</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingLog;
