import type { Tool } from "@/lib/repositories/types";

/**
 * The tool registry, migrated verbatim from the original Hub's TOOLS array.
 * This is mirrored into the `tools` table by supabase/seed.sql; it is kept here
 * for type-safe references and as the seed source of truth.
 *
 * The flagship reconciler is launched as a same-origin iframe under the new
 * auth (see public/tools/reconciler/index.html + the session bridge).
 */
export const TOOLS_SEED: Tool[] = [
  {
    id: "AOI-FIN-001",
    dept: "finance",
    name: "Shipping Reconciler",
    version: "v2.80",
    status: "live",
    featured: true,
    description:
      "Reconcile SMSA, EGY Post and Armex invoices against shipment sheets — pricing engines, PDF invoice parsing and editable zone maps in one screen.",
    tags: ["SMSA", "EGY POST", "ARMEX", "PDF PARSER", "OLLAMA RAG"],
    launchKind: "iframe",
    launchUrl: "/tools/reconciler/index.html",
    minRole: "employee",
  },
  {
    id: "AOI-SLS-001",
    dept: "sales",
    name: "B2B Lead Generation Platform",
    version: "v1.0",
    status: "soon",
    featured: false,
    description:
      "Discover and score freight leads from maps and directories, then generate WhatsApp outreach per governorate.",
    tags: ["LEADS", "SCORING", "WHATSAPP"],
    launchKind: "external",
    launchUrl: "#",
    minRole: "employee",
  },
  {
    id: "AOI-SLS-002",
    dept: "sales",
    name: "Sales Leads Tracker",
    version: "",
    status: "soon",
    featured: false,
    description:
      "Pipeline with follow-up statuses, dates and conditional formatting for the sales team.",
    tags: ["PIPELINE", "FOLLOW-UP"],
    launchKind: "external",
    launchUrl: "#",
    minRole: "employee",
  },
  {
    id: "AOI-OPS-001",
    dept: "operations",
    name: "Shipment Status Dashboard",
    version: "",
    status: "soon",
    featured: false,
    description:
      "One screen for open shipments across all carriers, with exceptions surfaced first.",
    tags: ["TRACKING", "EXCEPTIONS"],
    launchKind: "external",
    launchUrl: "#",
    minRole: "employee",
  },
  {
    id: "AOI-OPS-002",
    dept: "operations",
    name: "Zones & Pricing Manager",
    version: "",
    status: "soon",
    featured: false,
    description:
      "Edit carrier zones and rate cards in one place and export clean reference sheets.",
    tags: ["ZONES", "RATE CARDS"],
    launchKind: "external",
    launchUrl: "#",
    minRole: "manager",
  },
  {
    id: "AOI-CS-001",
    dept: "customer_service",
    name: "Smart Reply Assistant",
    version: "",
    status: "soon",
    featured: false,
    description:
      "Suggested answers for common shipment questions, ready to paste into chat.",
    tags: ["REPLIES", "TEMPLATES"],
    launchKind: "external",
    launchUrl: "#",
    minRole: "employee",
  },
  {
    id: "AOI-CS-002",
    dept: "customer_service",
    name: "Ticket Triage Board",
    version: "",
    status: "soon",
    featured: false,
    description: "Sort incoming issues by urgency and route them to the right owner.",
    tags: ["TICKETS", "ROUTING"],
    launchKind: "external",
    launchUrl: "#",
    minRole: "employee",
  },
];
