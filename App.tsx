
  import React, { useState, useEffect, useMemo, useCallback } from 'react';
  import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
  import { 
    HomeIcon, 
    UsersIcon, 
    ChatBubbleLeftEllipsisIcon, 
    CurrencyDollarIcon, 
    ShieldCheckIcon,
    AcademicCapIcon,
    ArrowLeftOnRectangleIcon,
    UserCircleIcon
  } from '@heroicons/react/24/outline';
  import Dashboard from './components/Dashboard';
  import MemberList from './components/MemberList';
  import MeetingLog from './components/MeetingLog';
  import PartyFees from './components/PartyFees';
  import AIAssistant from './components/AIAssistant';
  import MemberProfile from './components/MemberProfile';
  import Login from './components/Login';
  import { User, Member, EditRequest, MemberRole, Account, MemberStatus, PartyFee, Meeting } from './types';
  import { MOCK_MEMBERS, MOCK_FEES, MOCK_MEETINGS } from './constants';

  const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
    <Link 
      to={to} 
      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
        active ? 'bg-red-700 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="font-medium">{label}</span>
    </Link>
  );

  const AppContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const saved = sessionStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    });

    const [members, setMembers] = useState<Member[]>(() => {
      const saved = localStorage.getItem('party_members');
      return saved ? JSON.parse(saved) : MOCK_MEMBERS;
    });

    const [partyFees, setPartyFees] = useState<PartyFee[]>(() => {
      const saved = localStorage.getItem('party_fees');
      return saved ? JSON.parse(saved) : MOCK_FEES;
    });

    const [meetings, setMeetings] = useState<Meeting[]>(() => {
      const saved = localStorage.getItem('party_meetings');
      return saved ? JSON.parse(saved) : MOCK_MEETINGS;
    });

    const [editRequests, setEditRequests] = useState<EditRequest[]>(() => {
      const saved = localStorage.getItem('party_edit_requests');
      return saved ? JSON.parse(saved) : [];
    });
    
    const [accounts, setAccounts] = useState<Account[]>(() => {
      const saved = localStorage.getItem('party_accounts');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'u1',
          username: 'admin',
          password: '123',
          fullName: 'Trương A Dinh',
          role: MemberRole.SECRETARY,
          memberId: '1',
          isActive: true,
          createdAt: '2024-01-01'
        }
        
      ];
    });

    const currentMemberInfo = useMemo(() => {
      if (!currentUser) return null;
      return members.find(m => m.id === currentUser.memberId) || null;
    }, [currentUser, members]);

    useEffect(() => {
      localStorage.setItem('party_accounts', JSON.stringify(accounts));
      localStorage.setItem('party_members', JSON.stringify(members));
      localStorage.setItem('party_fees', JSON.stringify(partyFees));
      localStorage.setItem('party_meetings', JSON.stringify(meetings));
      localStorage.setItem('party_edit_requests', JSON.stringify(editRequests));
    }, [accounts, members, partyFees, meetings, editRequests]);

    const handleLoginAttempt = useCallback((credentials: {username: string, password: string}) => {
      const found = accounts.find(a => a.username === credentials.username && a.password === credentials.password);
      if (found) {
        if (!found.isActive) {
          return { success: false, error: 'Tài khoản đã bị khóa bởi hệ thống.' };
        }
        const userData: User = {
          id: found.id,
          username: found.username,
          fullName: found.fullName,
          role: found.role,
          memberId: found.memberId
        };
        sessionStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        navigate('/');
        return { success: true };
      }
      return { success: false, error: 'Sai tên đăng nhập hoặc mật khẩu.' };
    }, [accounts, navigate]);

    const handleLogout = useCallback(() => {
      sessionStorage.removeItem('user');
      setCurrentUser(null);
      navigate('/login');
    }, [navigate]);

    const handleCreateAccount = useCallback((memberId: string, username: string, password: string, role: MemberRole) => {
      const member = members.find(m => m.id === memberId);
      if (member) {
        const newAcc: Account = {
          id: 'acc-' + Math.random().toString(36).substr(2, 9),
          username,
          password,
          fullName: member.fullName,
          role,
          memberId,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setAccounts(prev => [...prev, newAcc]);
      }
    }, [members]);

    const handleToggleAccountStatus = useCallback((accountId: string) => {
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, isActive: !a.isActive } : a));
    }, []);

    const approveRequest = useCallback((requestId: string) => {
      const request = editRequests.find(r => r.id === requestId);
      if (request) {
        setMembers(prev => prev.map(m => m.id === request.memberId ? { ...m, ...request.changes } : m));
        setEditRequests(prev => prev.filter(r => r.id !== requestId));
        alert('Đã phê duyệt và cập nhật hồ sơ Đảng viên.');
      }
    }, [editRequests]);

    const rejectRequest = useCallback((requestId: string) => {
      setEditRequests(prev => prev.filter(r => r.id !== requestId));
      alert('Đã từ chối yêu cầu thay đổi.');
    }, []);

    if (!currentUser) {
      return <Login onLoginAttempt={handleLoginAttempt} />;
    }

    return (
      <div className="flex min-h-screen bg-slate-50">
        <aside className="w-72 bg-slate-900 text-white flex flex-col fixed h-full shadow-2xl z-20">
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg shadow-inner">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase leading-none">Chi bộ</h1>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Nền tảng quản lý CTĐ</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarItem to="/" icon={HomeIcon} label="Bảng điều khiển" active={currentPath === '/'} />
            <SidebarItem to="/profile" icon={UserCircleIcon} label="Hồ sơ cá nhân" active={currentPath === '/profile'} />
            <SidebarItem to="/members" icon={UsersIcon} label="Quản lý Đảng viên" active={currentPath === '/members'} />
            <SidebarItem to="/meetings" icon={ChatBubbleLeftEllipsisIcon} label="Sinh hoạt Chi bộ" active={currentPath === '/meetings'} />
            <SidebarItem to="/fees" icon={CurrencyDollarIcon} label="Quản lý Đảng phí" active={currentPath === '/fees'} />
            <SidebarItem to="/ai-assistant" icon={AcademicCapIcon} label="Trợ lý Nghiệp vụ AI" active={currentPath === '/ai-assistant'} />
          </nav>

          <div className="p-6 border-t border-slate-800">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shrink-0">
                {(currentMemberInfo?.fullName || currentUser.fullName).charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{currentMemberInfo?.fullName || currentUser.fullName}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{currentMemberInfo?.militaryRank || currentUser.role}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="ml-72 flex-1 p-8">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Chi bộ Đại đội 10 - Đảng bộ Tiểu đoàn 3</h2>
              <p className="text-slate-500 text-sm">Chuyển đổi số công tác Đảng trong Quân đội</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 pr-6 border-r border-slate-200 text-right">
                <div>
                  <p className="font-bold text-slate-900 leading-none">{currentMemberInfo?.fullName || currentUser.fullName}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1.5">
                    <span className="text-[9px] font-black text-white bg-red-600 px-2 py-0.5 rounded uppercase">{currentMemberInfo?.militaryRank || 'Sĩ quan'}</span>
                    <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase border border-red-100">{currentUser.role}</span>
                  </div>
                </div>
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden">
                  <UserCircleIcon className="w-7 h-7 text-slate-400" />
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center space-x-2 text-slate-400 hover:text-red-600 transition-all font-bold text-xs uppercase">
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </header>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 min-h-[calc(100vh-210px)] overflow-hidden p-8">
            <Routes>
              <Route path="/" element={<Dashboard members={members} partyFees={partyFees} meetings={meetings} />} />
              <Route path="/profile" element={<MemberProfile currentUser={currentUser} members={members} editRequests={editRequests} onAddRequest={(req) => setEditRequests(prev => [...prev, req])} />} />
              <Route path="/members" element={
                <MemberList 
                  currentUser={currentUser} members={members} accounts={accounts} editRequests={editRequests}
                  onApprove={approveRequest} onReject={rejectRequest}
                  onDirectEdit={(updated) => setMembers(prev => prev.map(m => m.id === updated.id ? updated : m))}
                  onAddMember={(m) => setMembers(prev => [...prev, m])}
                  onCreateAccount={handleCreateAccount}
                  onToggleAccountStatus={handleToggleAccountStatus}
                  onTransferMember={(mid) => setMembers(prev => prev.map(m => m.id === mid ? { ...m, status: MemberStatus.TRANSFERRED } : m))}
                  onMakeOfficial={(mid, d, c) => setMembers(prev => prev.map(m => m.id === mid ? { ...m, status: MemberStatus.OFFICIAL, officialDate: d, partyCardNumber: c } : m))}
                />
              } />
              <Route path="/meetings" element={
                <MeetingLog 
                  currentUser={currentUser} members={members} meetings={meetings} 
                  onAddMeeting={(m) => setMeetings(prev => [m, ...prev])} 
                  onUpdateMeeting={(m) => setMeetings(prev => prev.map(mt => mt.id === m.id ? m : mt))} 
                  onDeleteMeeting={(id) => setMeetings(prev => prev.filter(mt => mt.id !== id))} 
                />
              } />
  <Route
    path="/fees"
    element={
      <PartyFees
    fees={partyFees}
    members={members}   // ✅ THÊM DÒNG NÀY
    currentUser={currentUser}
    onUpdateFee={(id, updates) =>
      setPartyFees(prev =>
        prev.map(f => (f.id === id ? { ...f, ...updates } : f))
      )
    }
    onAddFee={(fee) =>
      setPartyFees(prev => [...prev, fee])
    }
  />

    }
  />
              <Route path="/ai-assistant" element={<AIAssistant />} />
            </Routes>
          </div>
        </main>
      </div>
    );
  };

  const App = () => (
    <Router>
      <AppContent />
    </Router>
  );

  export default App;
