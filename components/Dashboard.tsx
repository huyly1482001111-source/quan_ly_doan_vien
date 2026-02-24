
import React from 'react';
import { 
  UsersIcon, 
  UserPlusIcon, 
  PresentationChartLineIcon, 
  BriefcaseIcon 
} from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Member, MemberStatus, PartyFee, Meeting } from '../types';

interface DashboardProps {
  members: Member[];
  partyFees: PartyFee[];
  meetings: Meeting[];
}

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
    <div className={`${color} p-4 rounded-lg text-white shadow-inner`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-tighter">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ members, partyFees, meetings }) => {
  // Thực tế: Lọc bỏ những đảng viên đã chuyển đi
  const activeMembers = members.filter(m => m.status !== MemberStatus.TRANSFERRED);
  const totalCount = activeMembers.length;
  const officialCount = activeMembers.filter(m => m.status === MemberStatus.OFFICIAL).length;
  const probationaryCount = activeMembers.filter(m => m.status === MemberStatus.PROBATIONARY).length;
  
  // Tính tỷ lệ hoàn thành đảng phí
  const paidFeesCount = partyFees.filter(f => f.isPaid).length;
  const totalFeesCount = partyFees.length || 1;
  const feeCompletionRate = Math.round((paidFeesCount / totalFeesCount) * 100);

  // Dữ liệu biểu đồ (Phân bổ theo trạng thái)
  const chartData = [
    { name: 'Chính thức', count: officialCount, color: '#22c55e' },
    { name: 'Dự bị', count: probationaryCount, color: '#eab308' },
    { name: 'Đang xét kết nạp', count: activeMembers.filter(m => m.status === MemberStatus.PROSPECT).length, color: '#3b82f6' },
  ];

  // Tính toán thông báo xét chuyển chính thức
  const reminders = activeMembers.filter(m => m.status === MemberStatus.PROBATIONARY).map(m => {
    const partyDate = new Date(m.partyDate);
    const nextYear = new Date(partyDate.getFullYear() + 1, partyDate.getMonth(), partyDate.getDate());
    const isUpcoming = (nextYear.getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000); // Trong vòng 30 ngày
    
    if (isUpcoming || nextYear < new Date()) {
      return {
        id: m.id,
        title: 'Xét chuyển chính thức',
        desc: `Đ/c ${m.fullName} đủ 12 tháng dự bị vào ngày ${nextYear.toLocaleDateString('vi-VN')}.`,
        type: 'blue'
      };
    }
    return null;
  }).filter(r => r !== null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Tổng Đoàn viên" value={totalCount} icon={UsersIcon} color="bg-red-600" />
       
        <StatCard label="Hoàn thành Đoàn phí" value={`${feeCompletionRate}%`} icon={PresentationChartLineIcon} color="bg-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quality Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Cơ cấu Đoàn viên hiện tại</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Cập nhật: {new Date().toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                <YAxis fontSize={10} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications / Tasks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Việc cần làm & Nhắc nhở</h3>
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Ưu tiên cao</span>
          </div>
          <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
            {reminders.length > 0 ? reminders.map((r, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 transition-all hover:shadow-md">
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-800 uppercase mb-1">{r!.title}</p>
                  <p className="text-xs text-blue-600 font-medium leading-relaxed">{r!.desc}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-slate-400 text-xs italic">Không có đảng viên nào sắp đến hạn chuyển chính thức.</p>
              </div>
            )}
            
            <div className="flex items-start space-x-3 p-4 bg-green-50/50 rounded-xl border border-green-100 transition-all hover:shadow-md">
              <div className="flex-1">
                <p className="text-xs font-bold text-green-800 uppercase mb-1">Tiến độ thu Đoàn phí</p>
                <p className="text-xs text-green-600 font-medium leading-relaxed">
                  Đã hoàn thành {paidFeesCount}/{totalFeesCount} đoàn viên. 
                  {paidFeesCount < totalFeesCount ? ` Cần đôn đốc ${totalFeesCount - paidFeesCount} đồng chí còn lại.` : ' Tuyệt vời! Chi bộ đã hoàn thành 100% kế hoạch.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-red-50/50 rounded-xl border border-red-100 transition-all hover:shadow-md">
              <div className="flex-1">
                <p className="text-xs font-bold text-red-800 uppercase mb-1">Sinh hoạt Chi đoàn</p>
                <p className="text-xs text-red-600 font-medium leading-relaxed">
                  Hệ thống ghi nhận {meetings.length} biên bản sinh hoạt. Nhắc nhở: Cần tổ chức sinh hoạt định kỳ tháng tới đúng quy định.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
