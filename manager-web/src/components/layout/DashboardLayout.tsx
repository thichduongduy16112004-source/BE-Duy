import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import type { AuthUser, ClassSummary } from "../../types/teacher";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  classes: ClassSummary[];
  selectedClassId: string | null;
  user: AuthUser;
  onSelectClass: (classId: string) => void;
  onLogout: () => void;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  classes,
  selectedClassId,
  user,
  onSelectClass,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans">
      <Sidebar
        classes={classes}
        selectedClassId={selectedClassId}
        user={user}
        onSelectClass={onSelectClass}
        onLogout={onLogout}
      />
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-header)]">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </header>
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
