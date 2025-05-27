import React from "react";
import OnlineApplications from "./OnlineApplications";
import { GenderStat, RegionApplication } from "../../hooks/Statistics/useStatistics";


interface ApplicationsByDateProps {
  totalApplications: number;
  genderStats: GenderStat[];
  applicationsByRegion: RegionApplication[];
  // totalOnlineApplications: number;
  // totalVerified: number;
  // totalWaiting: number;
}

const ApplicationsByDate: React.FC<ApplicationsByDateProps> = ({
  totalApplications,
  genderStats,
  applicationsByRegion,
  // totalOnlineApplications,
  // totalVerified,
  // totalWaiting,
}) => {
    // Calculate gender percentages
    const totalGirls = genderStats?.find((stat) => stat.user__gender === "female")?.count || 0;
    const totalBoys = genderStats?.find((stat) => stat.user__gender === "male")?.count || 0;
    const total = totalGirls + totalBoys;

    const girlsPercentage = total ? ((totalGirls / total) * 100).toFixed(2) : 0;
    const boysPercentage = total ? ((totalBoys / total) * 100).toFixed(2) : 0;

    // Calculate region totals
    const regionTotals = {
      ahal: applicationsByRegion?.find((region) => region.user__area__region === "ahal")?.count || 0,
      mary: applicationsByRegion?.find((region) => region.user__area__region === "mary")?.count || 0,
      balkan: applicationsByRegion?.find((region) => region.user__area__region === "balkan")?.count || 0,
      dashoguz: applicationsByRegion?.find((region) => region.user__area__region === "dashoguz")?.count || 0,
      lebap: applicationsByRegion?.find((region) => region.user__area__region === "lebap")?.count || 0,
    };

    //  //Calculate verified and waiting percentages
    //  const verifiedPercentage = totalOnlineApplications ? ((totalVerified / totalOnlineApplications) * 100).toFixed(2) : 0;
    //  const waitingPercentage = totalOnlineApplications ? ((totalWaiting / totalOnlineApplications) * 100).toFixed(2) : 0;

  return (
    <div className="flex flex-col space-y-5">
      <div className="bg-white rounded-xl shadow p-4 w-full h-56">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold">Applications by date</h3>
          <span className="text-xs text-gray-400">19.04.2025</span>
        </div>

        {/* Region Filters */}
        <div className="flex items-center gap-4 text-sm mb-4 text-gray-600 flex-wrap">
          <span className="font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">All</span>
          <span>Lebap</span>
          <span>Mary</span>
          <span>Balkan</span>
          <span>Ahal</span>
          <span>Dasoguz</span>
        </div>

        {/* Statistic Box */}
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center justify-start mt-6">
            <div className="flex items-center gap-4 bg-blue-50 py-2 px-2">
              <h1 className="text-5xl font-bold text-blue-600">{totalApplications}</h1>
              <span className="text-sm text-gray-500">
                Total <br />
                application
              </span>
            </div>
          </div>

          {/* Gender Info */}
          <div className="pl-2 flex justify-start mt-6 gap-6 text-sm">
            <div className="border-r">
              Girls: <strong>{totalGirls}</strong> ({girlsPercentage}%)
            </div>
            <div>
              Boys: <strong>{totalBoys}</strong> ({boysPercentage}%)
            </div>
          </div>
        </div>
      </div>
      <div>
        <OnlineApplications
        //  totalOnlineApplications={totalOnlineApplications}
        //  totalVerified={totalVerified}
        //  totalWaiting={totalWaiting}
        //  verifiedPercentage={verifiedPercentage}
        //  waitingPercentage={waitingPercentage}
        />
      </div>
    </div>
  );
};

export default ApplicationsByDate;