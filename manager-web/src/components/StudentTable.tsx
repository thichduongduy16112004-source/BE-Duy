import React, { useState } from "react";
import type { StudentSummary } from "../types/teacher";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { StudentDetailPanel } from "./StudentDetailPanel";
import { ChevronDown, ChevronRight, Search, Filter } from "lucide-react";

interface StudentTableProps {
  students: StudentSummary[];
  classId: string;
}

export function StudentTable({ students, classId }: StudentTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupport, setFilterSupport] = useState<"all" | "needs_support" | "stable">("all");

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupport = 
      filterSupport === "all" ? true :
      filterSupport === "needs_support" ? s.needs_support : !s.needs_support;
    return matchesSearch && matchesSupport;
  });

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm overflow-hidden mt-6">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-gray-50/50">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm học sinh..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select 
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] sm:text-sm rounded-md"
            value={filterSupport}
            onChange={(e) => setFilterSupport(e.target.value as any)}
          >
            <option value="all">Tất cả học sinh</option>
            <option value="needs_support">Cần hỗ trợ</option>
            <option value="stable">Ổn định</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiến độ khóa học</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm TB</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <React.Fragment key={student.user_id}>
                <tr 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedId === student.user_id ? 'bg-blue-50/30' : ''}`}
                  onClick={() => toggleExpand(student.user_id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expandedId === student.user_id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        {student.full_name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                        <div className="text-sm text-gray-500">ID: {student.user_id.split('_')[1]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-48 flex items-center">
                      <ProgressBar percent={student.progress_percent} className="flex-1 mr-3" />
                      <span className="text-sm text-gray-700 w-8">{student.progress_percent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {student.avg_score !== null ? student.avg_score.toFixed(1) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge needsSupport={student.needs_support} />
                  </td>
                </tr>
                {expandedId === student.user_id && (
                  <tr>
                    <td colSpan={5} className="p-0 border-b-2 border-gray-100">
                      <StudentDetailPanel classId={classId} studentId={student.user_id} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy học sinh nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

