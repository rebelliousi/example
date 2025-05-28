// SpecialGroups.tsx (or SpecialGroups.jsx)
import React from "react";

interface SpecialGroupsProps {
  vipCount: number;
  orphanCount: number;
}

const groups = [
  { name: "Gulluk eden", key: "vip_count" },
  { name: "Masgalaly", key: "married" },
  { name: "Yetim", key: "orphan_count" },
  { name: "Doly yetim", key: "full_orphan_count" },
  { name: "Yolbasçy", key: "leader_count" },
];

type GroupCountsKey =
  | "vip_count"
  | "orphan_count"
  | "married"
  | "full_orphan_count"
  | "leader_count";

const SpecialGroups: React.FC<SpecialGroupsProps> = ({
  vipCount,
  orphanCount,
}) => {
  const marriedCount = 500;
  const fullOrphanCount = 200;
  const leaderCount = 300;

  const groupCounts: Record<GroupCountsKey, number> = {
    vip_count: vipCount,
    orphan_count: orphanCount,
    married: marriedCount,
    full_orphan_count: fullOrphanCount,
    leader_count: leaderCount,
  };

  return (
    <div className="bg-white rounded-xl shadow p-4  h-[290px]">
      <ul className="space-y-5 text-lg flex flex-col items-center justify-center">
        {groups.map((group, index) => (
          <li key={index} className="grid grid-cols-2 gap-x-4 mt-2 items-start">
            <span className="text-gray-600  text-left">{group.name}</span>
            <span className="text-black pr-1 text-2xl text-left">
              {groupCounts[group.key as GroupCountsKey] || 0}{" "}
              <span className="text-xs pl-2 text-green-600">
                {vipCount
                  ? ((groupCounts[group.key as GroupCountsKey] / 1000) * 100).toFixed(
                      2
                    )
                  : 0}
                %
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpecialGroups;