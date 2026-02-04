
import React, { useState, useEffect } from 'react';
import { Member, MemberStatus, MemberRole, User, EditRequest, Account } from '../types';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilSquareIcon, 
  CheckIcon, 
  XMarkIcon, 
  TableCellsIcon, 
  CheckBadgeIcon,
  KeyIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  EyeIcon,
  ArrowRightIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { exportToExcel } from '../utils/exportUtils';

interface MemberListProps {
  currentUser: User;
  members: Member[];
  accounts: Account[];
  editRequests: EditRequest[];
  // Fix: Removed onAddRequest from interface as it's not used in this component (only in MemberProfile)
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDirectEdit: (m: Member) => void;
  onAddMember: (m: Member) => void;
  onCreateAccount: (memberId: string, username: string, password: string, role: MemberRole) => void;
  onToggleAccountStatus: (accountId: string) => void;
  onTransferMember: (memberId: string) => void;
  onMakeOfficial: (memberId: string, officialDate: string, partyCardNumber: string) => void;
}

const MemberList: React.FC<MemberListProps> = ({ 
  currentUser, members, accounts, editRequests, onApprove, onReject, onDirectEdit, onAddMember,
  onCreateAccount, onToggleAccountStatus, onTransferMember, onMakeOfficial
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [confirmingOfficial, setConfirmingOfficial] = useState<Member | null>(null);
  const [creatingAccountFor, setCreatingAccountFor] = useState<Member | null>(null);
  const [viewingRequest, setViewingRequest] = useState<EditRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'transferred'>('all');
  const [formTab, setFormTab] = useState<'personal' | 'party' | 'education' | 'history'>('personal');

  // Form states
  const [accUsername, setAccUsername] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accRole, setAccRole] = useState<MemberRole>(MemberRole.MEMBER);
  const [officialDate, setOfficialDate] = useState('');
  const [partyCardNumber, setPartyCardNumber] = useState('');
  const [memberFormData, setMemberFormData] = useState<Partial<Member>>({});

  const isSecretary = currentUser.role === MemberRole.SECRETARY || currentUser.role === MemberRole.DEPUTY_SECRETARY;

  const filteredMembers = members.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = m.fullName.toLowerCase().includes(searchLower) || 
                          (m.partyCardNumber && m.partyCardNumber.includes(searchTerm));
    if (activeTab === 'all') return matchesSearch && m.status !== MemberStatus.TRANSFERRED;
    if (activeTab === 'transferred') return matchesSearch && m.status === MemberStatus.TRANSFERRED;
    return matchesSearch;
  });

  const getAccountInfo = (memberId: string) => accounts.find(a => a.memberId === memberId);

  // Handlers
  const handleOpenAdd = () => {
    setMemberFormData({
      fullName: '', birthDate: '', hometown: '', nativePlace: '', currentResidence: '',
      ethnicity: 'Kinh', religion: 'Không', militaryRank: '', position: '',
      unit: 'Đại đội 10', status: MemberStatus.OFFICIAL, role: MemberRole.MEMBER,
      partyDate: new Date().toISOString().split('T')[0], educationLevel: '12/12',
      technicalTitle: '', politicalTheory: 'Sơ cấp', foreignLanguage: 'Không',
      healthStatus: 'Loại 1', background: '', rewardHistory: '', disciplineHistory: '',
      introducer1: '', introducer2: ''
    });
    setFormTab('personal');
    setIsAddingMember(true);
  };

  const handleOpenEdit = (m: Member) => {
    setMemberFormData({ ...m });
    setFormTab('personal');
    setEditingMember(m);
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatingAccountFor) return;
    onCreateAccount(creatingAccountFor.id, accUsername, accPassword, accRole);
    setCreatingAccountFor(null);
    setAccUsername(''); setAccPassword('');
    alert('Đã cấp tài khoản thành công!');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    onAddMember({ ...memberFormData, id } as Member);
    setIsAddingMember(false);
    alert('Đã thêm Đảng viên mới thành công!');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      onDirectEdit(memberFormData as Member);
      setEditingMember(null);
      alert('Đã cập nhật hồ sơ trực tiếp thành công!');
    }
  };

  const ComparisonRow = ({ label, oldVal, newVal }: { label: string, oldVal?: any, newVal?: any }) => {
    if (newVal === undefined || newVal === oldVal) return null;
    return (
      <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100 items-center">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label} (Cũ)</p>
          <p className="text-sm text-slate-500 italic">{oldVal || '---'}</p>
        </div>
        <div className="space-y-1 bg-blue-50 p-2 rounded-lg border border-blue-100 relative">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{label} (Mới)</p>
          <p className="text-sm font-bold text-blue-900">{newVal}</p>
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <CheckIcon className="w-4 h-4 text-blue-400" />
          </div>
        </div>
      </div>
    );
  };

  const renderFormFields = () => (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
        {['personal', 'party', 'education', 'history'].map((t) => (
          <button 
            key={t} type="button" 
            onClick={() => setFormTab(t as any)} 
            className={`flex-1 py-4 text-[10px] font-black uppercase transition-all flex items-center justify-center space-x-1 ${formTab === t ? 'bg-white text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span>{t === 'personal' ? 'Cá nhân' : t === 'party' ? 'Đảng tịch' : t === 'education' ? 'Trình độ' : 'Lịch sử'}</span>
            <ChevronRightIcon className={`w-3 h-3 ${formTab === t ? 'opacity-100' : 'opacity-0'}`} />
          </button>
        ))}
      </div>
      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {formTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Họ và tên</label><input type="text" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={memberFormData.fullName} onChange={e => setMemberFormData({...memberFormData, fullName: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Ngày sinh</label><input type="date" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.birthDate} onChange={e => setMemberFormData({...memberFormData, birthDate: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Dân tộc</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.ethnicity} onChange={e => setMemberFormData({...memberFormData, ethnicity: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Tôn giáo</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.religion} onChange={e => setMemberFormData({...memberFormData, religion: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Quê quán</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.hometown} onChange={e => setMemberFormData({...memberFormData, hometown: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Nơi sinh</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.nativePlace} onChange={e => setMemberFormData({...memberFormData, nativePlace: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Nơi cư trú</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.currentResidence} onChange={e => setMemberFormData({...memberFormData, currentResidence: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Cấp bậc</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.militaryRank} onChange={e => setMemberFormData({...memberFormData, militaryRank: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Chức vụ</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.position} onChange={e => setMemberFormData({...memberFormData, position: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Đơn vị</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.unit} onChange={e => setMemberFormData({...memberFormData, unit: e.target.value})} /></div>
          </div>
        )}
        {formTab === 'party' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Số thẻ Đảng</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={memberFormData.partyCardNumber} onChange={e => setMemberFormData({...memberFormData, partyCardNumber: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Ngày vào Đảng</label><input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.partyDate} onChange={e => setMemberFormData({...memberFormData, partyDate: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Ngày chính thức</label><input type="date" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.officialDate} onChange={e => setMemberFormData({...memberFormData, officialDate: e.target.value})} /></div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">Trạng thái sinh hoạt</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.status} onChange={e => setMemberFormData({...memberFormData, status: e.target.value as any})}>
                <option value={MemberStatus.OFFICIAL}>Chính thức</option>
                <option value={MemberStatus.PROBATIONARY}>Dự bị</option>
                <option value={MemberStatus.PROSPECT}>Quần chúng ưu tú</option>
              </select>
            </div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Người giới thiệu 1</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.introducer1} onChange={e => setMemberFormData({...memberFormData, introducer1: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Người giới thiệu 2</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.introducer2} onChange={e => setMemberFormData({...memberFormData, introducer2: e.target.value})} /></div>
          </div>
        )}
        {formTab === 'education' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Trình độ Văn hóa</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.educationLevel} onChange={e => setMemberFormData({...memberFormData, educationLevel: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Lý luận Chính trị</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.politicalTheory} onChange={e => setMemberFormData({...memberFormData, politicalTheory: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Chuyên môn KT</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.technicalTitle} onChange={e => setMemberFormData({...memberFormData, technicalTitle: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Ngoại ngữ</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.foreignLanguage} onChange={e => setMemberFormData({...memberFormData, foreignLanguage: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Sức khỏe</label><input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.healthStatus} onChange={e => setMemberFormData({...memberFormData, healthStatus: e.target.value})} /></div>
          </div>
        )}
        {formTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase">Tóm tắt quá trình công tác</label><textarea className="w-full h-24 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={memberFormData.background} onChange={e => setMemberFormData({...memberFormData, background: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-green-700 uppercase">Khen thưởng qua các năm</label><textarea className="w-full h-20 p-2.5 bg-green-50 border border-green-200 rounded-xl text-sm" value={memberFormData.rewardHistory} onChange={e => setMemberFormData({...memberFormData, rewardHistory: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-red-700 uppercase">Xử lý vi phạm, kỷ luật</label><textarea className="w-full h-20 p-2.5 bg-red-50 border border-red-200 rounded-xl text-sm" value={memberFormData.disciplineHistory} onChange={e => setMemberFormData({...memberFormData, disciplineHistory: e.target.value})} /></div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 uppercase">Quản lý Hồ sơ & Tài khoản</h3>
          <div className="flex mt-4 space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>Danh sách Chi bộ</button>
            {isSecretary && (
              <button onClick={() => setActiveTab('pending')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all flex items-center ${activeTab === 'pending' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>
                Chờ duyệt {editRequests.length > 0 && <span className="ml-2 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">{editRequests.length}</span>}
              </button>
            )}
            <button onClick={() => setActiveTab('transferred')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${activeTab === 'transferred' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>Chuyển đi</button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tìm tên, số thẻ..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none w-64 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => exportToExcel(filteredMembers, 'Danh_sach_Dang_vien', [])} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"><TableCellsIcon className="w-5 h-5" /></button>
          {isSecretary && activeTab === 'all' && (
            <button onClick={handleOpenAdd} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-red-100 text-sm font-bold uppercase">
              <PlusIcon className="w-4 h-4" />
              <span>Thêm Đảng viên</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {activeTab === 'pending' ? (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-600 uppercase">Đảng viên đề nghị</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-600 uppercase">Ngày gửi</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-600 uppercase">Nội dung thay đổi</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-orange-600 uppercase">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {editRequests.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">Không có yêu cầu chờ duyệt.</td></tr>
              ) : (
                editRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-orange-50/20">
                    <td className="px-6 py-4 font-bold text-slate-800">{req.memberName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{req.requestedAt}</td>
                    <td className="px-6 py-4 text-xs font-bold text-blue-600">{Object.keys(req.changes).length} trường thông tin</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setViewingRequest(req)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase shadow-sm">Thẩm định & Duyệt</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Đảng viên / Cấp bậc</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Số thẻ Đảng</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Tài khoản</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.map((member) => {
                const account = getAccountInfo(member.id);
                return (
                  <tr key={member.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">{member.fullName.charAt(0)}</div>
                        <div className="ml-3">
                          <div className="text-sm font-bold text-slate-900">{member.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">{member.militaryRank} - {member.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{member.partyCardNumber || '---'}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                      {account ? <span>{account.username} <i className={`ml-1 ${account.isActive ? 'text-green-500' : 'text-red-500'}`}>●</i></span> : <span className="text-slate-300 italic">Chưa cấp</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${member.status === MemberStatus.OFFICIAL ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{member.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {isSecretary && (
                          <>
                            {account ? (
                              <button onClick={() => onToggleAccountStatus(account.id)} className="p-1.5 text-slate-400 hover:text-red-600" title="Khóa/Mở tài khoản"><NoSymbolIcon className="w-5 h-5" /></button>
                            ) : (
                              <button onClick={() => { setCreatingAccountFor(member); setAccUsername(member.fullName.toLowerCase().replace(/\s/g, '')); setAccPassword('123456'); }} className="p-1.5 text-slate-400 hover:text-yellow-600" title="Cấp tài khoản"><KeyIcon className="w-5 h-5" /></button>
                            )}
                            {member.status === MemberStatus.PROBATIONARY && (
                                <button onClick={() => { setOfficialDate(new Date().toISOString().split('T')[0]); setConfirmingOfficial(member); }} className="p-1.5 text-slate-400 hover:text-green-600" title="Xét chính thức"><CheckBadgeIcon className="w-5 h-5" /></button>
                            )}
                            <button onClick={() => { if(window.confirm(`Xác nhận chuyển sinh hoạt cho đ/c ${member.fullName}?`)) onTransferMember(member.id); }} className="p-1.5 text-slate-400 hover:text-orange-600" title="Chuyển sinh hoạt"><ArrowRightIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleOpenEdit(member)} className="p-1.5 text-slate-400 hover:text-blue-600" title="Sửa hồ sơ"><PencilSquareIcon className="w-5 h-5" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: THÊM MỚI / SỬA HỒ SƠ */}
      {(isAddingMember || editingMember) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className={`${isAddingMember ? 'bg-red-700' : 'bg-blue-900'} p-6 text-white flex justify-between items-center`}>
              <h4 className="text-lg font-bold uppercase tracking-tight">{isAddingMember ? 'Thêm Đảng viên mới' : 'Cập nhật hồ sơ trực tiếp'}</h4>
              <button onClick={() => { setIsAddingMember(false); setEditingMember(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={isAddingMember ? handleAddSubmit : handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
              {renderFormFields()}
              <div className="p-8 border-t bg-slate-50 flex space-x-4">
                <button type="button" onClick={() => { setIsAddingMember(false); setEditingMember(null); }} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl uppercase text-xs">Hủy</button>
                <button type="submit" className={`flex-2 py-4 text-white font-bold rounded-2xl shadow-xl uppercase text-xs ${isAddingMember ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>Lưu hồ sơ vào hệ thống</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CẤP TÀI KHOẢN */}
      {creatingAccountFor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h4 className="text-lg font-bold uppercase tracking-tight">Cấp tài khoản đăng nhập</h4>
              <button onClick={() => setCreatingAccountFor(null)} className="p-2 hover:bg-white/10 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateAccountSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Tên đăng nhập</label>
                <input type="text" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={accUsername} onChange={e => setAccUsername(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Mật khẩu</label>
                <input type="text" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono" value={accPassword} onChange={e => setAccPassword(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase">Quyền hạn</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={accRole} onChange={e => setAccRole(e.target.value as MemberRole)}>
                  <option value={MemberRole.MEMBER}>Đảng viên</option>
                  <option value={MemberRole.SECRETARY}>Bí thư</option>
                </select>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setCreatingAccountFor(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl uppercase text-xs">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg uppercase text-xs">Xác nhận cấp</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PHÊ DUYỆT YÊU CẦU */}
      {viewingRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-blue-900 p-6 text-white flex justify-between items-center shrink-0">
              <h4 className="text-lg font-bold uppercase">Thẩm định thay đổi hồ sơ: {viewingRequest.memberName}</h4>
              <button onClick={() => setViewingRequest(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-4 flex-1 overflow-y-auto bg-slate-50">
              {(() => {
                const oldMember = members.find(m => m.id === viewingRequest.memberId)!;
                return (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <ComparisonRow label="Họ và tên" oldVal={oldMember.fullName} newVal={viewingRequest.changes.fullName} />
                    <ComparisonRow label="Ngày sinh" oldVal={oldMember.birthDate} newVal={viewingRequest.changes.birthDate} />
                    <ComparisonRow label="Quê quán" oldVal={oldMember.hometown} newVal={viewingRequest.changes.hometown} />
                    <ComparisonRow label="Cấp bậc" oldVal={oldMember.militaryRank} newVal={viewingRequest.changes.militaryRank} />
                    <ComparisonRow label="Chức vụ" oldVal={oldMember.position} newVal={viewingRequest.changes.position} />
                    <ComparisonRow label="Số thẻ Đảng" oldVal={oldMember.partyCardNumber} newVal={viewingRequest.changes.partyCardNumber} />
                    <ComparisonRow label="Ngày vào Đảng" oldVal={oldMember.partyDate} newVal={viewingRequest.changes.partyDate} />
                    <ComparisonRow label="Quá trình công tác" oldVal={oldMember.background} newVal={viewingRequest.changes.background} />
                    <ComparisonRow label="Khen thưởng" oldVal={oldMember.rewardHistory} newVal={viewingRequest.changes.rewardHistory} />
                    <ComparisonRow label="Kỷ luật" oldVal={oldMember.disciplineHistory} newVal={viewingRequest.changes.disciplineHistory} />
                  </div>
                );
              })()}
            </div>
            <div className="p-8 border-t border-slate-200 bg-white flex space-x-4 shrink-0">
              <button onClick={() => { onReject(viewingRequest.id); setViewingRequest(null); }} className="flex-1 py-4 bg-white border border-red-200 text-red-600 font-bold rounded-2xl uppercase text-xs hover:bg-red-50">Từ chối</button>
              <button onClick={() => { onApprove(viewingRequest.id); setViewingRequest(null); }} className="flex-2 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl uppercase text-xs hover:bg-blue-700">Phê duyệt & Cập nhật</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XÉT CHÍNH THỨC */}
      {confirmingOfficial && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-green-700 p-6 text-white flex justify-between items-center">
              <h4 className="text-lg font-bold uppercase">Xét chuyển chính thức</h4>
              <button onClick={() => setConfirmingOfficial(null)} className="p-2 hover:bg-white/10 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onMakeOfficial(confirmingOfficial.id, officialDate, partyCardNumber); setConfirmingOfficial(null); alert('Đã xét chuyển chính thức thành công!'); }} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Ngày quyết định chính thức</label>
                <input type="date" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={officialDate} onChange={(e) => setOfficialDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Số thẻ Đảng viên</label>
                <input type="text" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" value={partyCardNumber} onChange={(e) => setPartyCardNumber(e.target.value)} />
              </div>
              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={() => setConfirmingOfficial(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl uppercase text-xs">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl uppercase text-xs shadow-lg">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
