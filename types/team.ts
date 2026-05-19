export type MemberRole = "owner" | "operator";
export type MemberStatus = "pending" | "active" | "revoked";

export type BusinessMember = {
  id: string;
  business_id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: MemberRole;
  status: MemberStatus;
  invited_at: string;
  joined_at: string | null;
};
