import React from "react";
import OnlineApplications from "./OnlineApplications";
import { GenderStat, RegionApplication } from "../../hooks/Statistics/useStatistics";
import ExampleIcon from "../../assets/icons/ExampleIcon";


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
    <div className="flex flex-col space-y-2">
      <div className="bg-white rounded-xl shadow p-5 w-full h-auto ">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <ExampleIcon/>
            <h3 className="text-md font-semibold">
            Applications by date</h3>

          </div>
          <div className="flex  items-center space-x-2"> 
            <ExampleIcon/>
              <span className="text-sm text-gray-400">19.04.2025</span>
          </div>
          
        
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
        <div className="grid grid-cols-12 gap-2 mt-10">
          <div className="col-span-5 flex items-center gap-4 bg-blue-50 py-3 px-3 rounded">
            <h1 className="text-5xl font-bold text-blue-600">{totalApplications}</h1>
            <span className="text-sm text-gray-500">
              Total <br />
              application
            </span>
          </div>

          {/* Gender Info */}
          <div className="col-span-7 pl-2 flex items-center gap-6 text-sm">
            <div className="border-r pr-4 flex flex-col items-start">
              <h1 className="text-md text-[#7C8FAC]"> Girls: </h1>
              <div className="flex space-x-2  items-baseline" >
                 <h1 className="text-3xl font-semibold">{totalGirls}</h1>
                 <p className="text-[#7C8FAC]"> ({girlsPercentage}%)</p>
              </div>
             
            </div>
             <div className="flex flex-col items-start">
              <h1 className="text-md text-[#7C8FAC]"> Boys: </h1>
              <div className="flex space-x-2 items-baseline">
                <h1 className="text-3xl font-semibold">{totalBoys}</h1>
                <p className="text-[#7C8FAC]">({boysPercentage}%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        </div>
    </div>
  );
};

export default ApplicationsByDate;