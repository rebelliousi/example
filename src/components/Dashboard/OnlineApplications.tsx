import React from "react";
import ExampleIcon from "../../assets/icons/ExampleIcon";

const OnlineApplications = () => {
  // Placeholder data for demonstration
  const totalApplicants = 500;
  const verified = 375;
  const waiting = 125;

  const verifiedPercentage = ((verified / totalApplicants) * 100).toFixed(2);
  const waitingPercentage = ((waiting / totalApplicants) * 100).toFixed(2);

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full h-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <ExampleIcon/>
            <h3 className="text-md font-semibold">
           Online applications</h3>

          </div>
        <div className="flex items-center space-x-2">
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
          <h1 className="text-5xl font-bold text-blue-600">{totalApplicants}</h1>
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