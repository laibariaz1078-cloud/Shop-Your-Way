export const ROLE_HOME = {
  admin: "/dashboard/admin",
  seller: "/dashboard/seller",
  customer: "/dashboard/customer",
};

export function canAccess(role, pathname) {
  if (!role) return false;

  if (pathname.startsWith("/dashboard/admin")) {
    return role === "admin";
  }
  if (pathname.startsWith("/dashboard/seller")) {
    return role === "seller" || role === "admin";
  }
  if (pathname.startsWith("/dashboard/customer")) {
    return role === "customer" || role === "admin";
  }

  return true;
}
