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
