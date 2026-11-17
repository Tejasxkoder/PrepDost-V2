import type { Route } from "next";
import {
  Building2,
  Code,
  LayoutGrid,
  type LucideIcon,
  MessageSquareText,
  Mic,
  Settings,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavItem {
  href: Route;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar (max 5). */
  mobile: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutGrid, mobile: true },
  { href: ROUTES.interviews, label: "AI Interviews", icon: MessageSquareText, mobile: true },
  { href: ROUTES.dsa, label: "DSA Practice", icon: Code, mobile: true },
  { href: ROUTES.voice, label: "Voice Mode", icon: Mic, mobile: true },
  { href: ROUTES.companies, label: "Company Prep", icon: Building2, mobile: false },
  { href: ROUTES.settings, label: "Settings", icon: Settings, mobile: true },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
