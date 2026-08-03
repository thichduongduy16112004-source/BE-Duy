import { BookOpen, ClipboardList, LayoutDashboard, LogOut, Users } from "lucide-react";
import type { AuthUser, ClassSummary } from "../../types/teacher";

interface SidebarProps {
  classes: ClassSummary[];
  selectedClassId: string | null;
  activeTab: string;
  user: AuthUser;
  onSelectClass: (classId: string) => void;
  onSelectTab: (tabId: string) => void;
  onLogout: () => void;
}

const managementItems = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "students", label: "Học sinh", icon: Users },
  { id: "lessons", label: "Bài học", icon: BookOpen },
  { id: "assignments", label: "Bài tập", icon: ClipboardList },
];

export function Sidebar({ classes, selectedClassId, activeTab, user, onSelectClass, onSelectTab, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
        <h1 className="text-lg font-bold tracking-tight">HISTORY ALIVE</h1>
        <span className="ml-2 text-[10px] uppercase font-semibold text-[var(--color-brand)] bg-[#faf8f3] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
          Teacher
        </span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Lớp của tôi
        </div>
        <div className="space-y-1 mb-6">
          {classes.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">Chưa có lớp học</p>
          ) : classes.map((classItem) => (
            <button
              key={classItem.id}
              onClick={() => onSelectClass(classItem.id)}
              className={`w-full text-left px-3 py-2 rounded-md font-medium text-sm border transition-colors ${
                selectedClassId === classItem.id
                  ? "bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-header)]"
                  : "border-transparent text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="block truncate">{classItem.name}</span>
              <span className="text-xs text-gray-400">{classItem.student_count} học sinh</span>
            </button>
          ))}
        </div>

        <div className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Quản lý
        </div>
        <nav className="space-y-1" aria-label="Manager sections">
          {managementItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-[#faf8f3] text-[var(--color-brand)] font-semibold"
                    : "text-gray-500 font-medium hover:bg-gray-50 hover:text-[var(--color-header)]"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center font-bold text-sm">
              {user.full_name?.charAt(0) || "G"}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name || user.email}</p>
              <p className="text-xs text-gray-500 truncate">Teacher Portal</p>
            </div>
          </div>
          <button
            title="Đăng xuất"
            onClick={onLogout}
            className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
