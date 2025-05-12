import React from "react";
import OnlineApplications from "./OnlineApplications";

const ApplicationsByDate = () => {
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
      <div className="flex items-center justify-start mt-6   " >
        <div className="flex items-center gap-4 bg-blue-50 py-2 px-2" >
          <h1 className="text-5xl font-bold text-blue-600">123</h1>
          <span className="text-sm text-gray-500">Total  <br />application</span>
        </div>
      </div>

      {/* Gender Info */}
      <div className="pl-2 flex justify-start mt-6 gap-6 text-sm">
        <div className="border-r">Girls: <strong>123</strong> (15%)</div>
        <div>Boys: <strong>123</strong> (15%)</div>
      </div>
    </div>

      </div>
      <div>
      <OnlineApplications/>
      </div>
     

    </div>
 
     
  );
};

export default ApplicationsByDate;
