import type { Business } from "./database";
import type { BusinessMember } from "./team";

export type BusinessWithMembers = Business & {
  business_members: Pick<
    BusinessMember,
    "id" | "email" | "full_name" | "role" | "status"
  >[];
};
