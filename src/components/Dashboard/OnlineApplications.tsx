import React, { useState } from "react";
import ExampleIcon from "../../assets/icons/ExampleIcon";

interface OnlineApplicationsProps {
  applicationStatus: { status: "PENDING" | "APPROVED" | "REJECTED"; count: number; }[];
  applicationsByRegion: { user__area__region: "ashgabat" | "ahal" | "balkan" | "dashoguz" | "lebap" | "mary" | null; count: number; }[];
}

const OnlineApplications: React.FC<OnlineApplicationsProps> = ({ applicationStatus, applicationsByRegion }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Filtrelenmiş başvurular
  const filteredApplicationsByRegion = selectedRegion
    ? applicationsByRegion?.filter(
        (region) => region.user__area__region === selectedRegion
      )
    : applicationsByRegion;

    //Toplam Başvuru Sayısı (Filtrelenmiş veya Tüm)
    const totalApplicantsForRegion = filteredApplicationsByRegion?.reduce((sum, region) => sum + region.count, 0) || 0;

    // Duruma Göre Başvuruları Filtreleme
    const verified = applicationStatus?.find(status => status.status === "APPROVED")?.count || 0;
    const waiting = applicationStatus?.find(status => status.status === "PENDING")?.count || 0;

  const verifiedPercentage = totalApplicantsForRegion ? ((verified / totalApplicantsForRegion) * 100).toFixed(2) : "0.00";
  const waitingPercentage = totalApplicantsForRegion ? ((waiting / totalApplicantsForRegion) * 100).toFixed(2) : "0.00";

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full h-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <ExampleIcon />
          <h3 className="text-md font-semibold">
            Online applications
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <ExampleIcon />
          <span className="text-sm text-gray-400">19.04.2025</span>
        </div>
      </div>

      {/* Region Filters */}
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

      {/* Statistic Box */}
      <div className="grid grid-cols-12 gap-2 mt-10">
        <div className="col-span-5 flex items-center gap-4 bg-blue-50 py-3 px-3 rounded">
          <h1 className="text-5xl font-bold text-blue-600">{totalApplicantsForRegion}</h1>
          <span className="text-sm text-gray-500">
            Total <br /> applicants
          </span>
        </div>

        {/* Verified & Waiting */}
        <div className="col-span-7 pl-2 flex items-center gap-6 text-sm">
          <div className="border-r pr-4 flex flex-col items-start">
            <h1 className="text-md text-[#7C8FAC]"> Verified: </h1>
            <div className="flex space-x-2 items-baseline">
              <h1 className="text-3xl font-semibold">{verified}</h1>
              <p className="text-[#7C8FAC]">({verifiedPercentage}%)</p>
            </div>
          </div>

          <div className="flex flex-col items-start">
            <h1 className="text-md text-[#7C8FAC]"> Waiting: </h1>
            <div className="flex space-x-2 items-baseline">
              <h1 className="text-3xl font-semibold">{waiting}</h1>
              <p className="text-[#7C8FAC]">({waitingPercentage}%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineApplications;