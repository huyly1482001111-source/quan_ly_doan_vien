
export enum MemberRole {
  SECRETARY = 'Bí thư',
  DEPUTY_SECRETARY = 'Phó Bí thư',
  COMMITTEE_MEMBER = 'Chi ủy viên',
  MEMBER = 'Đảng viên'
}

export enum MemberStatus {
  OFFICIAL = 'Chính thức',
  PROBATIONARY = 'Dự bị',
  PROSPECT = 'Quần chúng ưu tú',
  TRANSFERRED = 'Đã chuyển sinh hoạt'
}

export interface Member {
  id: string;
  fullName: string;
  birthDate: string;
  hometown: string; // Quê quán
  nativePlace: string; // Nơi sinh
  currentResidence: string; // Trú quán
  ethnicity: string; // Dân tộc
  religion: string; // Tôn giáo
  militaryRank: string;
  position: string;
  unit: string;
  
  // Thông tin Đảng
  partyDate: string;
  officialDate?: string;
  partyCardNumber?: string;
  introducer1?: string; // Người giới thiệu 1
  introducer2?: string; // Người giới thiệu 2
  status: MemberStatus;
  role: MemberRole;

  // Trình độ & Chuyên môn
  educationLevel: string; // Giáo dục phổ thông
  technicalTitle: string; // Chuyên môn kỹ thuật
  politicalTheory: string; // Lý luận chính trị
  foreignLanguage: string; // Ngoại ngữ
  
  // Sức khỏe & Lịch sử
  healthStatus: string;
  background?: string; // Tóm tắt lý lịch (Quá trình công tác)
  rewardHistory?: string;
  disciplineHistory?: string;
  
  isPendingApproval?: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: MemberRole;
  memberId: string;
}

export interface Account extends User {
  password: string;
  isActive: boolean;
  createdAt: string;
}

export interface EditRequest {
  id: string;
  memberId: string;
  memberName: string;
  requestedAt: string;
  changes: Partial<Member>;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  type: 'Định kỳ' | 'Chuyên đề' | 'Bất thường';
  content: string;
  attendeesCount: number;
  totalMembers: number;
  resolution: string;
}

export interface PartyFee {
  id: string;
  memberId: string;
  memberName: string;
  month: number;
  year: number;
  amount: number;
  isPaid: boolean;
  paymentDate?: string;
}
