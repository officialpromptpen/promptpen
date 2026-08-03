import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsSectionLayoutProps {
  children: ReactNode;
  description: string;
  title: string;
}

export function SettingsSectionLayout({
  children,
  description,
  title,
}: SettingsSectionLayoutProps) {
  return (
    <div className="pp:mx-auto pp:max-w-6xl pp:space-y-6 pp:px-6 pp:py-8 lg:pp:px-8">
      <header>
        <h1 className="pp:font-semibold pp:text-2xl pp:tracking-tight">
          {title}
        </h1>
        <p className="pp:mt-1 pp:text-muted-foreground pp:text-sm">
          {description}
        </p>
      </header>
      {children}
    </div>
  );
}

interface StatusNoticeProps {
  icon: ReactNode;
  message: string;
  tone: "error" | "success";
}

export function StatusNotice({ icon, message, tone }: StatusNoticeProps) {
  return (
    <div
      className={cn(
        "pp:flex pp:items-center pp:gap-2 pp:rounded-md pp:border pp:px-3 pp:py-2 pp:text-sm",
        tone === "success"
          ? "pp:border-green-500/30 pp:bg-green-500/10 pp:text-green-700"
          : "pp:border-destructive/40 pp:bg-destructive/10 pp:text-destructive"
      )}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
}