"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/apiClient";
import { FileText, Users, BookOpen, Flag } from "lucide-react";
import Badge from "@/components/ui/badge";

type SummaryResponse = {
  success: boolean;
  message?: string | null;
  data: {
    reportCount: number;
    documentCount: number;
    subjectCount: number;
    userCount: number;
    topRatings: Array<{
      documentId: number;
      documentTitle: string;
      totalRatings: number;
      avgRating: number;
    }>;
    topDownloads: Array<{
      documentId: number;
      documentTitle: string;
      totalDownloads: number;
      lastDownloadedDate?: string;
    }>;
  } | null;
};

function StatsCard({
  title,
  value,
  Icon,
  colorStart,
  colorEnd,
}: {
  title: string;
  value: number;
  Icon: any;
  colorStart?: string;
  colorEnd?: string;
}) {
  const start = colorStart || "#e2e8f0";
  const end = colorEnd || "#60a5fa";

  return (
    <div
      className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-4 flex items-center gap-4"
      style={{ borderLeft: `4px solid ${end}` }}
    >
      <div
        className="p-3 rounded-md"
        style={{ background: `linear-gradient(135deg, ${start}, ${end})` }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold" style={{ color: end }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function VerticalBarChart({
  title,
  items,
  valueFormatter,
  maxValue,
}: {
  title: string;
  items: { label: string; value: number }[];
  valueFormatter?: (v: number) => string;
  maxValue?: number;
}) {
  const max = Math.max(1, maxValue ?? Math.max(...items.map((t) => t.value)));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="w-full flex gap-2 items-end h-64 lg:h-80 overflow-hidden">
        {items.map((it) => {
          const safeValue = Math.max(0, Number(it.value) || 0);
          const maxNumeric = Math.max(1, Number(max) || 1);
          const topFlex = Math.max(0, maxNumeric - safeValue);
          const bottomFlex = Math.max(0.0001, safeValue);

          return (
            <div
              key={it.label}
              className="flex-1 flex flex-col items-center h-full min-w-0"
            >
              {/* numeric value */}
              <div className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                {valueFormatter ? valueFormatter(it.value) : it.value}
              </div>

              {/* bar area: use flex column with spacer and filled bar so heights are proportional */}
              <div
                className="w-full h-full flex flex-col rounded-t-md overflow-hidden"
                style={{ background: "transparent" }}
              >
                <div style={{ flexGrow: topFlex, minHeight: 2 }} />
                <div
                  title={`${it.label}: ${it.value}`}
                  style={{
                    flexGrow: bottomFlex,
                    transition: "flex-grow 400ms, background 300ms",
                    background: "linear-gradient(180deg, #60a5fa, #2563eb)",
                  }}
                />
              </div>

              <div className="mt-2 text-xs text-center truncate w-full text-slate-700 dark:text-slate-200 px-1">
                {it.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get<SummaryResponse>("/interaction/api/Statistics/summary")
      .then((res) => {
        if (!mounted) return;
        if (res && res.data) {
          setSummary(res.data);
        } else {
          setError(res?.message || "Empty response");
        }
      })
      .catch((e) => {
        console.error(e);
        setError(e?.message || "Failed to load summary");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const topDownloads = useMemo(() => {
    if (!summary?.topDownloads) return [] as { label: string; value: number }[];
    return summary.topDownloads
      .slice(0, 5)
      .map((d) => ({ label: d.documentTitle, value: d.totalDownloads })) as {
      label: string;
      value: number;
    }[];
  }, [summary]);

  const topRatings = useMemo(() => {
    if (!summary?.topRatings) return [] as { label: string; value: number }[];
    return summary.topRatings.slice(0, 5).map((d) => ({
      label: d.documentTitle,
      value: Math.round(d.avgRating * 10) / 10,
    })) as { label: string; value: number }[];
  }, [summary]);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <Badge variant="default">Công Chúa Điện Hạ Vạn Tuế</Badge>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Reports"
              value={summary?.reportCount ?? 0}
              Icon={Flag}
              colorStart="#fee2e2"
              colorEnd="#ef4444"
            />
            <StatsCard
              title="Documents"
              value={summary?.documentCount ?? 0}
              Icon={FileText}
              colorStart="#e0e7ff"
              colorEnd="#4f46e5"
            />
            <StatsCard
              title="Subjects"
              value={summary?.subjectCount ?? 0}
              Icon={BookOpen}
              colorStart="#dcfce7"
              colorEnd="#10b981"
            />
            <StatsCard
              title="Users"
              value={summary?.userCount ?? 0}
              Icon={Users}
              colorStart="#fff7ed"
              colorEnd="#f59e0b"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VerticalBarChart
              title="Top 5 Downloads"
              items={topDownloads}
              valueFormatter={(v) => `${v}`}
            />
            <VerticalBarChart
              title="Top 5 Ratings (avg)"
              items={topRatings}
              valueFormatter={(v) => `${v}`}
              maxValue={5}
            />
          </div>
        </>
      )}
    </div>
  );
}
