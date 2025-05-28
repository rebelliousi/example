import React, { useState } from "react";
import { GenderStat, RegionApplication } from "../../hooks/Statistics/useStatistics";
import ExampleIcon from "../../assets/icons/ExampleIcon";

interface ApplicationsByDateProps {
    genderStats: GenderStat[];
    applicationsByRegion: RegionApplication[];
}

const ApplicationsByDate: React.FC<ApplicationsByDateProps> = ({
    genderStats,
    applicationsByRegion,
}) => {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  
    const filteredApplicationsByRegion = applicationsByRegion?.filter(
        (region) => selectedRegion === null || region.user__area__region === selectedRegion
    );


    const totalApplicationsForRegion = filteredApplicationsByRegion?.reduce((sum, region) => sum + region.count, 0) || 0;


    const totalGirlsAllRegions = genderStats?.find(stat => stat.user__gender === "female")?.count || 0;
    const totalBoysAllRegions = genderStats?.find(stat => stat.user__gender === "male")?.count || 0;
    const totalAllRegions = totalGirlsAllRegions + totalBoysAllRegions;

    const girlsPercentageAllRegions = totalAllRegions ? (totalGirlsAllRegions / totalAllRegions) * 100 : 0;
    const boysPercentageAllRegions = totalAllRegions ? (totalBoysAllRegions / totalAllRegions) * 100 : 0;

 
    const estimatedRegionGirls = totalApplicationsForRegion * (girlsPercentageAllRegions / 100);
    const estimatedRegionBoys = totalApplicationsForRegion * (boysPercentageAllRegions / 100);

    return (
        <div className="bg-white rounded-xl shadow p-5 w-full h-auto">
       
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <ExampleIcon />
                    <h3 className="text-md font-semibold">Applications by date</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <ExampleIcon />
                    <span className="text-sm text-gray-400">19.04.2025</span>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm mb-4 text-gray-600 flex-wrap">
                <button
                    className={`font-medium px-2 py-1 rounded ${selectedRegion === null ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setSelectedRegion(null)}
                >
                    All
                </button>
                <button
                    className={`px-2 py-1 rounded ${selectedRegion === "lebap" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setSelectedRegion("lebap")}
                >
                    Lebap
                </button>
                <button
                    className={`px-2 py-1 rounded ${selectedRegion === "mary" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setSelectedRegion("mary")}
                >
                    Mary
                </button>
                <button
                    className={`px-2 py-1 rounded ${selectedRegion === "balkan" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setSelectedRegion("balkan")}
                >
                    Balkan
                </button>
                <button
                    className={`px-2 py-1 rounded ${selectedRegion === "ahal" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setSelectedRegion("ahal")}
                >
                    Ahal
                </button>
                <button
                    className={`px-2 py-1 rounded ${selectedRegion === "dashoguz" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => setSelectedRegion("dashoguz")}
                >
                    Dasoguz
                </button>
            </div>

    
            <div className="grid grid-cols-12 gap-2 mt-10">
                <div className="col-span-5 flex items-center gap-4 bg-blue-50 py-3 px-3 rounded">
                    <h1 className="text-5xl font-bold text-blue-600">{totalApplicationsForRegion}</h1>
                    <span className="text-sm text-gray-500">
                        Total <br />
                        application
                    </span>
                </div>

           
                <div className="col-span-7 pl-2 flex items-center gap-6 text-sm">
                    <div className="border-r pr-4 flex flex-col items-start">
                        <h1 className="text-md text-[#7C8FAC]"> Girls: </h1>
                        <div className="flex space-x-2  items-baseline">
                            <h1 className="text-3xl font-semibold">{estimatedRegionGirls.toFixed(0)}</h1>
                            <p className="text-[#7C8FAC]"> ({girlsPercentageAllRegions.toFixed(2)}%)</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-start">
                        <h1 className="text-md text-[#7C8FAC]"> Boys: </h1>
                        <div className="flex space-x-2 items-baseline">
                            <h1 className="text-3xl font-semibold">{estimatedRegionBoys.toFixed(0)}</h1>
                            <p className="text-[#7C8FAC]">({boysPercentageAllRegions.toFixed(2)}%)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationsByDate;