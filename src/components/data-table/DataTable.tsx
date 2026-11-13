"use client";

import {
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  Menu,
  MoreHorizontal,
} from "lucide-react";
import { useTranslation } from "@/components/i18n/useTranslation";
import { AnimatePresence, motion } from "framer-motion";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  actions?: ActionDef<T>[];
  emptyState?: ReactNode;
  defaultSortBy?: keyof T;
  defaultSortDir?: "asc" | "desc";
}

interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface ActionDef<T> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "outline";
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  actions,
  emptyState,
  defaultSortBy,
  defaultSortDir = "desc",
}: DataTableProps<T>) {
  const { lang, isRTL } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof T | string>(
    defaultSortBy || (columns[0]?.key as keyof T)
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((c) => c.key)
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) => {
      return columns.some((col) => {
        const val = row[col.key as keyof T];
        return val != null && String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, columns]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortBy as keyof T];
      const bVal = b[sortBy as keyof T];
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortBy, sortDir]);

  const handleSort = useCallback((key: keyof T | string) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  }, [sortBy]);

  const visibleColumnsList = useMemo(
    () => columns.filter((c) => visibleColumns.includes(c.key as string)),
    [columns, visibleColumns]
  );

  const t = (key: string) => {
    const dict = lang === "ar" ? arLabels : enLabels;
    return (dict as Record<string, string>)[key] || key;
  };

  const enLabels = {
    search: "Search",
    filter: "Filter",
    columns: "Columns",
    noResults: "No results found",
    actions: "Actions",
    createdAt: "Created at",
  };

  const arLabels = {
    search: "بحث",
    filter: "تصفية",
    columns: "الأعمدة",
    noResults: "لا توجد نتائج",
    actions: "إجراءات",
    createdAt: "تاريخ الإنشاء",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder={t("search")}
            className="pl-9 glass-input pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setColumnMenuOpen(!columnMenuOpen)}>
            <Filter className="w-4 h-4 mr-2" /> {t("filter")}
            <ChevronDown className="w-3 h-3 ml-1 transition-transform duration-200" />
          </Button>

          {actions && actions.length > 0 && (
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Column visibility menu */}
      <AnimatePresence>
        {columnMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-bg-card border border-border-subtle rounded-xl shadow-lg z-50"
          >
            <div className="p-3">
              <p className="text-xs font-medium text-text-muted mb-3">{t("columns")}</p>
              {columns.map((col) => (
                <div key={String(col.key)} className="flex items-center justify-between p-2 hover:bg-bg-card-hover rounded-lg cursor-pointer group">
                  <span className="text-sm text-text-secondary">{col.header}</span>
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key as string)}
                    onChange={(e) => {
                      setVisibleColumns((prev) =>
                        e.target.checked
                          ? [...prev, col.key as string]
                          : prev.filter((k) => k !== col.key)
                      );
                    }}
                    className="rounded text-neon-blue-600 focus:ring-neon-blue-500"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sortedData.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          {emptyState || (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-bg-card-hover flex items-center justify-center mx-auto mb-3 opacity-50">
                <Search className="w-6 h-6 text-text-muted" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">{t("noResults")}</h3>
              <p className="text-text-muted">Adjust your search or filter criteria.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-border-subtle">
          <Table>
            <TableHeader>
              <TableRow className="bg-bg-card-hover border-b border-border-subtle">
                {visibleColumnsList.map((col) => (
                  <TableHead
                    key={String(col.key)}
                    className={cn(
                      "px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider",
                      col.align && `text-${col.align}`,
                      col.sortable && "cursor-pointer select-none hover:text-text-primary"
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    {col.header}
                    {col.sortable && (
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 ml-1 opacity-50",
                          sortBy === col.key &&
                            (sortDir === "asc" ? "-rotate-180" : "") +
                            " transition-transform duration-200"
                        )}
                      />
                    )}
                  </TableHead>
                ))}
                {actions && (
                  <TableHead className="px-4 py-3 text-center w-20">
                    {t("actions")}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="border-b border-border-subtle hover:bg-bg-card-hover transition-colors group"
                >
                  {visibleColumnsList.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={cn("px-4 py-4", col.align && `text-${col.align}`)}
                    >
                      {col.cell ? col.cell(row) : (
                        <span className={cn(
                          "text-text-secondary",
                          col.align === "right" && "font-mono text-xs"
                        )}>
                          {String(row[col.key as keyof T] ?? "-")}
                        </span>
                      )}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {actions.map((action) => (
                          <Button
                            key={action.label}
                            size="icon"
                            variant={action.variant || "outline"}
                            className={cn("p-1.5", action.className)}
                            onClick={() => action.onClick(row)}
                            aria-label={action.label}
                          >
                            <action.icon className="w-4 h-4" />
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}