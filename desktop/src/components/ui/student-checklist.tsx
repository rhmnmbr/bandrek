import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "./checkbox";
import { SearchInput } from "./input";

export interface StudentItem {
  id: string;
  nama: string;
  kelasId?: string;
  kelasNama?: string;
  jenjang?: "SD" | "SMP" | "SMA" | string;
}

export interface StudentGroup {
  id: string;
  nama: string;
  students: StudentItem[];
}

export interface StudentChecklistProps {
  groups: StudentGroup[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
  maxHeight?: string;
}

export const StudentChecklist: React.FC<StudentChecklistProps> = ({
  groups,
  selectedIds,
  onChange,
  className,
  maxHeight = "280px",
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Flatten all students
  const allStudents = React.useMemo(() => {
    const map = new Map<string, StudentItem>();
    groups.forEach((g) => {
      g.students.forEach((s) => map.set(s.id, s));
    });
    return Array.from(map.values());
  }, [groups]);

  // Filter groups and students by search query
  const filteredGroups = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return groups;

    return groups
      .map((g) => {
        const matched = g.students.filter((s) => s.nama.toLowerCase().includes(q));
        return { ...g, students: matched };
      })
      .filter((g) => g.students.length > 0);
  }, [groups, searchQuery]);

  const totalSelectedCount = selectedIds.length;

  const handleToggleStudent = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleToggleGroup = (group: StudentGroup) => {
    const groupStudentIds = group.students.map((s) => s.id);
    const allInGroupSelected = groupStudentIds.every((id) => selectedIds.includes(id));

    if (allInGroupSelected) {
      // Unselect all in this group
      onChange(selectedIds.filter((id) => !groupStudentIds.includes(id)));
    } else {
      // Select all in this group
      const newSelected = new Set([...selectedIds, ...groupStudentIds]);
      onChange(Array.from(newSelected));
    }
  };

  const handleSelectAll = () => {
    onChange(allStudents.map((s) => s.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div
      className={cn(
        "flex flex-col border border-[var(--color-border)] rounded-[var(--radius-md)] bg-white overflow-hidden text-[12.5px]",
        className
      )}
    >
      {/* Search & Actions Header */}
      <div className="p-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] flex flex-col gap-2">
        <SearchInput
          placeholder="Cari nama siswa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery("")}
        />
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] px-0.5">
          <span>
            <strong className="font-mono text-[var(--color-text)] font-semibold">
              {totalSelectedCount}
            </strong>{" "}
            dari {allStudents.length} siswa dipilih
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[var(--color-brand)] hover:underline cursor-pointer"
            >
              Pilih semua
            </button>
            <span className="text-[var(--color-border-strong)]">·</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[var(--color-brand)] hover:underline cursor-pointer"
            >
              Bersihkan
            </button>
          </div>
        </div>
      </div>

      {/* Grouped Checklist */}
      <div className="overflow-y-auto divide-y divide-[var(--color-border-subtle)]" style={{ maxHeight }}>
        {filteredGroups.length === 0 ? (
          <div className="p-6 text-center text-[var(--color-text-muted)] text-[12px]">
            Tidak ada siswa yang cocok dengan &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredGroups.map((group) => {
            const groupStudentIds = group.students.map((s) => s.id);
            const selectedInGroup = groupStudentIds.filter((id) => selectedIds.includes(id));
            const isAllGroupSelected =
              groupStudentIds.length > 0 && selectedInGroup.length === groupStudentIds.length;
            const isSomeGroupSelected =
              selectedInGroup.length > 0 && selectedInGroup.length < groupStudentIds.length;

            return (
              <div key={group.id} className="p-1.5">
                {/* Group Header */}
                <div className="flex items-center justify-between px-2 py-1 bg-[var(--color-surface-alt)] rounded-[var(--radius-sm)] mb-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isAllGroupSelected ? true : isSomeGroupSelected ? "indeterminate" : false}
                      onCheckedChange={() => handleToggleGroup(group)}
                      id={`group-${group.id}`}
                    />
                    <label
                      htmlFor={`group-${group.id}`}
                      className="font-semibold text-[11.5px] cursor-pointer text-[var(--color-text-secondary)]"
                    >
                      {group.nama}
                    </label>
                  </div>
                  <span className="text-[10.5px] font-mono text-[var(--color-text-muted)]">
                    {selectedInGroup.length}/{group.students.length}
                  </span>
                </div>

                {/* Group Student List */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pl-4 pr-1">
                  {group.students.map((student) => {
                    const isChecked = selectedIds.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        className={cn(
                          "flex items-center gap-2 px-1.5 py-0.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-alt)] transition-colors",
                          isChecked && "bg-[var(--color-brand-subtle)]/40"
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleStudent(student.id)}
                          id={`student-${student.id}`}
                        />
                        <label
                          htmlFor={`student-${student.id}`}
                          className="truncate cursor-pointer text-[12px] flex-1 select-none"
                          title={student.nama}
                        >
                          {student.nama}
                        </label>
                        {student.jenjang && (
                          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                            {student.jenjang}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

