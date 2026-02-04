
import { Member, MemberRole, MemberStatus, Meeting, PartyFee } from './types';

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    fullName: 'Trương A Dinh',
    birthDate: '2000-07-03',
    hometown: 'Cao Bằng',
    nativePlace: 'Xã Quảng Lâm, Cao Bằng',
    currentResidence: 'Khu tập thể đơn vị, Đại đội 10',
    ethnicity: 'Mông',
    religion: 'Không',
    militaryRank: 'Trung úy',
    position: 'Bí thư Chi bộ',
    partyDate: '2021-02-03',
    officialDate: '2022-02-03',
    partyCardNumber: '004200003729',
    status: MemberStatus.OFFICIAL,
    role: MemberRole.SECRETARY,
    unit: 'Đại đội 10',
    educationLevel: '12/12',
    technicalTitle: 'Cử nhân Quân sự',
    politicalTheory: 'Cao cấp',
    foreignLanguage: 'Tiếng Anh B1',
    healthStatus: 'Loại 1',
    background: 'Nhập ngũ tháng 08/2018. Tốt nghiệp Học viện Chính trị. Trải qua các chức vụ: Chính trị viên phó đại đội, Chính trị viên đại đội.',
    rewardHistory: 'Không',
    disciplineHistory: 'Không'
  },
  
];

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Sinh hoạt Chi bộ định kỳ tháng 01/2026',
    date: '2026-01-01',
    type: 'Định kỳ',
    content: 'Đánh giá kết quả lãnh đạo nhiệm vụ tháng 12-2025, triển khai phương hướng tháng 1-2026.',
    attendeesCount: 28,
    totalMembers: 30,
    resolution: '100% nhất trí với báo cáo và phương hướng thực hiện nhiệm vụ.'
  }
];

export const MOCK_FEES: PartyFee[] = [
  { id: 'f1', memberId: '1', memberName: 'Trương A Dinh', month: 1, year: 2026, amount: 150000, isPaid: true, paymentDate: '2026-01-01' },
 
];
