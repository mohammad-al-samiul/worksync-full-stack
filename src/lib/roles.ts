export type ApiRole = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
export type DisplayRole = "Admin" | "Manager" | "Member";

export function apiRoleToDisplay(role: ApiRole | string): DisplayRole {
  if (role === "ADMIN") return "Admin";
  if (role === "PROJECT_MANAGER") return "Manager";
  return "Member";
}

export function displayRoleToApi(role: DisplayRole | string): ApiRole {
  if (role === "Admin") return "ADMIN";
  if (role === "Manager") return "PROJECT_MANAGER";
  return "TEAM_MEMBER";
}

export function canManageProjects(role: DisplayRole | ApiRole | string): boolean {
  const api = role === "Admin" || role === "Manager" || role === "Member"
    ? displayRoleToApi(role as DisplayRole)
    : (role as ApiRole);
  return api === "ADMIN" || api === "PROJECT_MANAGER";
}

export function canManageTasks(role: DisplayRole | ApiRole | string): boolean {
  return canManageProjects(role);
}

export function isPastDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export function todayInputValue(): string {
  return new Date().toISOString().split("T")[0];
}
