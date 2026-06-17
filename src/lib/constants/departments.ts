import type { Department } from "@/lib/repositories/types";

/**
 * The 8 departments. The original Hub had 4 (finance/sales/operations/cs); we
 * keep their ids + brand colors and extend to the full enterprise set.
 * `cs` was renamed to `customer_service` but its legacy short code "CS"/"cs" is
 * preserved in `code` (and used by the reconciler session bridge).
 */
export const DEPARTMENTS: Department[] = [
  {
    id: "sales",
    code: "SLS",
    nameEn: "Sales",
    nameAr: "المبيعات",
    color: "#FF8E5E",
    icon: "trending-up",
    blurbEn: "Lead generation, pipeline tracking and outreach.",
    blurbAr: "توليد العملاء، متابعة الصفقات، والتواصل.",
    sortOrder: 1,
  },
  {
    id: "operations",
    code: "OPS",
    nameEn: "Operations",
    nameAr: "العمليات",
    color: "#43D9A0",
    icon: "package",
    blurbEn: "Shipments, zones, pricing and daily dispatch.",
    blurbAr: "الشحنات، المناطق، التسعير، والتشغيل اليومي.",
    sortOrder: 2,
  },
  {
    id: "customer_service",
    code: "CS",
    nameEn: "Customer Service",
    nameAr: "خدمة العملاء",
    color: "#B49CFF",
    icon: "headset",
    blurbEn: "Faster replies and cleaner ticket handling.",
    blurbAr: "ردود أسرع وإدارة تذاكر أنظف.",
    sortOrder: 3,
  },
  {
    id: "logistics",
    code: "LOG",
    nameEn: "Logistics",
    nameAr: "اللوجستيات",
    color: "#5EC8C8",
    icon: "truck",
    blurbEn: "Fleet, routing and last-mile coordination.",
    blurbAr: "الأسطول، المسارات، وتنسيق الميل الأخير.",
    sortOrder: 4,
  },
  {
    id: "hr",
    code: "HR",
    nameEn: "HR",
    nameAr: "الموارد البشرية",
    color: "#F78DA7",
    icon: "users",
    blurbEn: "People, onboarding and team operations.",
    blurbAr: "الموظفون، التعيين، وعمليات الفريق.",
    sortOrder: 5,
  },
  {
    id: "finance",
    code: "FIN",
    nameEn: "Finance",
    nameAr: "المالية",
    color: "#4FC3F7",
    icon: "wallet",
    blurbEn: "Carrier reconciliation, invoices and cost control.",
    blurbAr: "تسويات الشحن، الفواتير، والتحكم في التكاليف.",
    sortOrder: 6,
  },
  {
    id: "marketing",
    code: "MKT",
    nameEn: "Marketing",
    nameAr: "التسويق",
    color: "#FFC857",
    icon: "megaphone",
    blurbEn: "Campaigns, content and brand growth.",
    blurbAr: "الحملات، المحتوى، ونمو العلامة.",
    sortOrder: 7,
  },
  {
    id: "it",
    code: "IT",
    nameEn: "IT",
    nameAr: "تقنية المعلومات",
    color: "#7AA2F7",
    icon: "server",
    blurbEn: "Systems, access and platform administration.",
    blurbAr: "الأنظمة، الصلاحيات، وإدارة المنصة.",
    sortOrder: 8,
  },
];

export const DEPARTMENT_MAP: Record<string, Department> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d])
);

/** Legacy reconciler understands only 4 short codes — map the new ids down. */
export function legacyDeptCode(dept: string): string {
  switch (dept) {
    case "customer_service":
      return "cs";
    case "finance":
    case "sales":
    case "operations":
      return dept;
    default:
      return "all"; // depts with no legacy meaning
  }
}
