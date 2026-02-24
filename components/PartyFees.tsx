
import React, { useState } from 'react';
import { PartyFee, User,Member,  MemberRole } from '../types';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  BanknotesIcon, 
  TableCellsIcon, 
  DocumentTextIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  ArrowPathIcon,
  AcademicCapIcon as AcademicCapIconOutline
} from '@heroicons/react/24/outline';
import { exportToExcel, exportToWord } from '../utils/exportUtils';

interface PartyFeesProps {
  fees: PartyFee[];
  members: Member[];   
  currentUser: User;
  onUpdateFee: (id: string, updates: Partial<PartyFee>) => void;
  onAddFee: (fee: PartyFee) => void; // 👈 THÊM
}


const PartyFees: React.FC<PartyFeesProps> = ({
  fees, 
  members,
  currentUser,
  onUpdateFee,
  onAddFee
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<string>('');
  const [tempName, setTempName] = useState<string>(''); 
  const isSecretary = currentUser.role === MemberRole.SECRETARY;

  const totalCollected = fees.reduce((acc, f) => acc + (f.isPaid ? f.amount : 0), 0);
  const pendingCount = fees.filter(f => !f.isPaid).length;
  const totalAmount = fees.reduce((acc, f) => acc + f.amount, 0);

  const handleExportFees = () => {
    const headers = ['Đảng viên', 'Tháng/Năm', 'Số tiền (VNĐ)', 'Tình trạng', 'Ngày nộp'];
    const data = fees.map(f => [
      f.memberName,
      `${f.month}/${f.year}`,
      f.amount,
      f.isPaid ? 'Đã nộp' : 'Chưa nộp',
      f.paymentDate || '-'
    ]);
    exportToExcel(data, `Bang_ke_Dang_phi_Thang_${fees[0].month}`, headers);
  };

  const handleExportSettlementWord = () => {
    const today = new Date();
    const htmlContent = `
      <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
          <td style="border: none; text-align: center; width: 40%;">
            ĐẢNG CỘNG SẢN VIỆT NAM<br/>
            <b>CHI BỘ ĐẠI ĐỘI 10</b><br/>
            *
          </td>
          <td style="border: none; text-align: center; width: 60%;">
            <b>ĐẢNG CỘNG SẢN VIỆT NAM</b><br/>
            <i style="font-size: 11pt;">Đại đội 10, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}</i>
          </td>
        </tr>
      </table>
      <div style="text-align: center; font-size: 16pt; font-weight: bold; margin-top: 20px;">BÁO CÁO QUYẾT TOÁN THU - NỘP Đoàn PHÍ</div>
      <div style="text-align: center; font-weight: bold; font-style: italic; margin-bottom: 30px;">(Tháng 1 năm 2026)</div>
      <p style="text-indent: 30px;">Căn cứ Điều lệ Đảng và hướng dẫn nộp đoàn phí. Chi bộ Đại đội 10 báo cáo kết quả như sau:</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid black; padding: 8px;">STT</th>
            <th style="border: 1px solid black; padding: 8px;">Họ và tên</th>
            <th style="border: 1px solid black; padding: 8px;">Số tiền (VNĐ)</th>
            <th style="border: 1px solid black; padding: 8px;">Tình trạng</th>
          </tr>
        </thead>
        <tbody>
          ${fees.map((f, i) => `
            <tr>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${i + 1}</td>
              <td style="border: 1px solid black; padding: 8px;">${f.memberName}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: right;">${f.amount.toLocaleString()}</td>
              <td style="border: 1px solid black; padding: 8px; text-align: center;">${f.isPaid ? 'Đã nộp' : 'Chưa nộp'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    exportToWord(htmlContent, `Bao_cao_Dang_phi_T${fees[0].month}`);
  };

 const startEdit = (fee: PartyFee) => {
  if (!isSecretary) return;
  setEditingId(fee.id);
  setTempAmount(fee.amount.toString());
  setTempName(fee.memberName);
};


 const cancelEdit = () => {
  setEditingId(null);
  setTempAmount('');
  setTempName('');
};


  const saveEdit = (id: string) => {
    const val = parseInt(tempAmount);
    if (isNaN(val) || val < 0) return;
onUpdateFee(id, { 
  amount: val,
  memberName: tempName
});
    setEditingId(null);
  };

  const togglePayment = (fee: PartyFee) => {
    if (!isSecretary) return;
    const isNowPaid = !fee.isPaid;
    onUpdateFee(fee.id, { 
      isPaid: isNowPaid, 
      paymentDate: isNowPaid ? new Date().toLocaleDateString('vi-VN') : undefined 
    });
  };
const handleAddFee = () => {
  const newFee: PartyFee = {
    id: 'fee-' + Date.now(),
    memberId: 'temp',    
    memberName: 'Đảng viên mới',
    month: 1,        // 👈 sửa tháng tại đây
    year: 2026,
    amount: 50000,
    isPaid: false,
    paymentDate: undefined
  };

  onAddFee(newFee);
};
{isSecretary && (
  <button
    onClick={handleAddFee}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase shadow-lg flex items-center space-x-2"
  >
    <AcademicCapIconOutline className="w-4 h-4" />
    <span>Thêm đảng viên</span>
  </button>
)}

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 uppercase flex items-center"><BanknotesIcon className="w-6 h-6 mr-2 text-red-600" />Quản lý Đoàn phí</h3>
          <p className="text-sm text-slate-500 mt-1 italic flex items-center"><ArrowPathIcon className="w-4 h-4 mr-1 text-slate-400" />Dữ liệu thu nộp tháng 01 năm 2026</p>
        </div>
       <div className="flex items-center space-x-2">
  {isSecretary && (
    <button
      onClick={handleAddFee}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase shadow-lg flex items-center space-x-2"
    >
      <AcademicCapIconOutline className="w-4 h-4" />
      <span>Thêm đoàn viên</span>
    </button>
  )}

  <button
    onClick={handleExportFees}
    className="p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold uppercase shadow-sm flex items-center space-x-2"
  >
    <TableCellsIcon className="w-5 h-5" />
    <span>Xuất Excel</span>
  </button>

  <button
    onClick={handleExportSettlementWord}
    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase shadow-lg shadow-red-200 flex items-center space-x-2"
  >
    <DocumentTextIcon className="w-4 h-4" />
    <span>Xuất Quyết toán</span>
  </button>
</div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-xs font-bold uppercase opacity-80">Tổng thực thu</p>
          <p className="text-3xl font-black mt-1">{totalCollected.toLocaleString()}đ</p>
          <div className="mt-4 flex items-center text-[10px] font-bold">
             <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden mr-3"><div className="h-full bg-white" style={{ width: `${(totalCollected / totalAmount) * 100}%` }}></div></div>
             <span>{Math.round((totalCollected / totalAmount) * 100)}%</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-xs font-bold uppercase opacity-80">Chưa hoàn thành</p>
          <p className="text-3xl font-black mt-1">{pendingCount} <span className="text-sm font-bold opacity-70">Đồng chí</span></p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white">
          <p className="text-xs font-bold uppercase opacity-80">Kế hoạch thu</p>
          <p className="text-3xl font-black mt-1">{totalAmount.toLocaleString()}đ</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Họ và tên</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Mức nộp (1%)</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Tình trạng</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Ngày nộp</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {fees.map((fee) => (
              <tr key={fee.id} className="hover:bg-slate-50 group">
               <td className="px-6 py-4 whitespace-nowrap">
  {editingId === fee.id ? (
    <input
      type="text"
      value={tempName}
      onChange={(e) => setTempName(e.target.value)}
      className="w-full p-2 border-2 border-red-500 rounded-lg text-sm font-bold"
    />
  ) : (
    <span className="text-sm font-bold text-slate-900">
      {fee.memberName}
    </span>
  )}
</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === fee.id ? (
                    <div className="flex items-center space-x-1">
                      <input type="number" className="w-24 p-2 border-2 border-red-500 rounded-lg outline-none text-sm font-bold" value={tempAmount} onChange={(e) => setTempAmount(e.target.value)} autoFocus />
                      <button onClick={() => saveEdit(fee.id)} className="bg-green-600 text-white p-2 rounded-lg"><CheckIcon className="w-4 h-4" /></button>
                      <button onClick={cancelEdit} className="bg-slate-200 text-slate-600 p-2 rounded-lg"><XMarkIcon className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 group/amount">
                      <span className="font-bold text-slate-800">{fee.amount.toLocaleString()}đ</span>
                      {isSecretary && <button onClick={() => startEdit(fee)} className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover/amount:opacity-100"><PencilIcon className="w-3 h-3" /></button>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${fee.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>{fee.isPaid ? 'Đã nộp' : 'Chưa nộp'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{fee.paymentDate || '---'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {isSecretary && <button onClick={() => togglePayment(fee)} className={`px-4 py-1.5 rounded-lg font-bold uppercase text-[10px] border ${!fee.isPaid ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{!fee.isPaid ? 'Xác nhận' : 'Hủy'}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-slate-300">
        <div className="flex items-center mb-4"><AcademicCapIconOutline className="w-5 h-5 text-yellow-500 mr-2" /><h4 className="text-xs font-bold uppercase text-white tracking-widest">Quy định thu nộp</h4></div>
        <p className="text-[11px] leading-relaxed opacity-80">Đoàn viên trong Quân đội thực hiện nộp đoàn phí hàng tháng mức 1% lương/phụ cấp. Chi đoàn tổng hợp và nộp lên Đảng ủy cấp trên đúng thời hạn.</p>
      </div>
    </div>
  );
};

export default PartyFees;
