import { Card, CardContent } from "@/components/ui/card";
import React from "react";

type DailyContribution = {
  date: string;
  contributionCount: number;
};

interface MonthlyActivityProps {
  monthlyContributions: DailyContribution[];
  thisMonthTotal: number;
  totalCommits: number;
  totalIssues: number;
  totalPullRequests: number;
  totalReviews: number;
}

const MonthlyActivity: React.FC<MonthlyActivityProps> = ({
  monthlyContributions,
  thisMonthTotal,
  totalCommits,
  totalIssues,
  totalPullRequests,
  totalReviews,
}) => {
  const today = new Date();
  // GitHub returns contribution dates in UTC. Use the same timezone here so
  // dates around midnight and month boundaries land in the correct cell.
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();

  const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
  const startDayOfWeek = firstDayOfMonth.getUTCDay();

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const contributionsMap = new Map<string, number>();
  monthlyContributions.forEach((contribution) => {
    contributionsMap.set(contribution.date, contribution.contributionCount);
  });

  return (
    <div className="lg:col-span-2">
      <Card className="parchment-panel rounded-none border-2 py-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-stone-800">
              今月の活動地図
            </h2>
            <span className="border border-stone-700/30 bg-amber-950/10 px-2 py-1 font-mono text-sm font-bold text-stone-700">
              活動合計: {thisMonthTotal}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: "コミット", value: totalCommits, color: "text-lime-200" },
              { label: "Issue", value: totalIssues, color: "text-yellow-200" },
              {
                label: "Pull Request",
                value: totalPullRequests,
                color: "text-cyan-200",
              },
              { label: "レビュー", value: totalReviews, color: "text-pink-200" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="parchment-inset p-3 text-center">
                <div className="font-mono text-lg font-black text-emerald-900">
                  {metric.value}
                </div>
                <div className="text-xs font-bold text-stone-700">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          <p className="mb-4 text-sm text-stone-700">
            カレンダーと活動合計はContribution全体、レベル・コインはコミット数を基準にしています。
          </p>

          <div className="parchment-inset guild-grid-runes p-4">
            <div className="grid grid-cols-7 gap-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <div
                  key={day}
                  className="text-center font-mono text-xs font-bold text-stone-700">
                  {day}
                </div>
              ))}

              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`}></div>
              ))}

              {monthDays.map((day) => {
                const dateStr = `${year}-${String(month + 1).padStart(
                  2,
                  "0"
                )}-${String(day).padStart(2, "0")}`;
                const contributions = contributionsMap.get(dateStr) || 0;
                const bgColor =
                  contributions === 0
                    ? "bg-green-800/50"
                    : contributions <= 2
                    ? "bg-lime-700"
                    : contributions <= 4
                    ? "bg-lime-500"
                    : "bg-lime-300";
                const textColor =
                  contributions > 2
                    ? "text-white [text-shadow:1px_1px_1px_rgba(0,0,0,0.6)]"
                    : "text-lime-100";
                const borderColor =
                  contributions === 0
                    ? "border-green-600/50"
                    : "border-lime-400";

                return (
                  <div
                    key={day}
                    className={`flex aspect-square flex-col items-center justify-center border-2 ${bgColor} ${borderColor} p-1`}>
                    <div className="mb-1 text-xs font-bold text-stone-700/70">
                      {day}
                    </div>
                    <div
                      className={`font-mono text-sm font-black ${textColor}`}>
                      {contributions}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-lg font-black text-emerald-900">
            足跡を刻み、地図を緑で満たそう。
          </p>
          <p className="mt-1 text-center font-mono text-sm text-stone-600">
            継続は力なり - 毎日少しずつでも成長しよう
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
export default MonthlyActivity;
