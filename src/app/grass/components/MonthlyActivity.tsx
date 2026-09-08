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
      <Card className="bg-gradient-to-b from-green-800/95 to-green-900/95 border-4 border-lime-400 shadow-2xl pixel-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-100 font-mono pixel-text">
              📈 今月の草
            </h2>
            <span className="bg-green-700 text-green-100 py-1 px-2 rounded font-mono text-sm pixel-text">
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
                className="bg-green-700/60 border-2 border-green-400/70 p-3 text-center">
                <div className={`text-lg font-bold pixel-text ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="text-xs text-green-100 pixel-text">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          <p className="text-green-100 text-sm pixel-text mb-4">
            カレンダーと活動合計はContribution全体、レベル・コインはコミット数を基準にしています。
          </p>

          <div className="bg-green-700/60 p-4 rounded pixel-border border-2 border-lime-400">
            <div className="grid grid-cols-7 gap-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <div
                  key={day}
                  className="text-center font-bold text-lime-300 pixel-text text-xs">
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
                    className={`aspect-square rounded pixel-border border-2 flex flex-col items-center justify-center ${bgColor} ${borderColor} p-1`}>
                    <div className="text-xs text-green-200/80 pixel-text mb-1">
                      {day}
                    </div>
                    <div
                      className={`font-bold text-sm pixel-text ${textColor}`}>
                      {contributions}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-green-200 font-mono text-lg pixel-text mt-4 text-center">
            🌱 活動の草を育てよう！
          </p>
          <p className="text-green-300 font-mono text-sm pixel-text mt-1 text-center">
            継続は力なり - 毎日少しずつでも成長しよう
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
export default MonthlyActivity;
