import React from "react";
import { Major } from "../../hooks/Statistics/useStatistics";
import PencilIcon from "../../assets/icons/PencilIcon";
import ExampleIcon from "../../assets/icons/ExampleIcon";

interface ApplicationsTableProps {
  majors: Major[];
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({ majors }) => {
  if (!majors || majors.length === 0) {
    return <div>No major data available.</div>;
  }

  // Calculate totals for each region
  const totals = {
    ahal: 0,
    mary: 0,
    dashoguz: 0,
    lebap: 0,
    balkan: 0,
    girls: 0,
    boys: 0,
  };

  majors.forEach((major) => {
    totals.ahal += major.regions.ahal || 0;
    totals.mary += major.regions.mary || 0;
    totals.dashoguz += major.regions.dashoguz || 0;
    totals.lebap += major.regions.lebap || 0;
    totals.balkan += major.regions.balkan || 0;

    // Sum girls and boys using gender stats from the major object
    // const totalGirls = major.gender_stats?.find((stat) => stat.user__gender === "female")?.count || 0;
    // const totalBoys = major.gender_stats?.find((stat) => stat.user__gender === "male")?.count || 0;

    // totals.girls += totalGirls;
    // totals.boys += totalBoys;
  });

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center justify-center space-x-3"> 
          <ExampleIcon className="text-lg"/>
          <h1 className="text-2xl ">Application Information</h1>
        </div>
        

       <div className="flex gap-4  ">
  <div className="bg-white space-y-1 p-4  w-[100px] h-[70px] flex flex-col justify-center items-center border-l border-r">
    <p className="text-xl text-[#4570EA] font-bold">{totals.ahal}</p>
    <p className="text-sm text-gray-500">Ahal</p>
  </div>
  <div className="bg-white space-y-1 p-4  w-[100px] h-[70px] flex flex-col justify-center items-center border-r">
    <p className="text-xl text-[#4570EA] font-bold">{totals.dashoguz}</p>
    <p className="text-sm text-gray-500">Dasoguz</p>
  </div>
  <div className="bg-white space-y-1 p-4  w-[100px] h-[70px] flex flex-col justify-center items-center border-r">
    <p className="text-xl text-[#4570EA] font-bold">{totals.mary}</p>
    <p className="text-sm text-gray-500">Mary</p>
  </div>
  <div className="bg-white space-y-1 p-4  w-[100px] h-[70px] flex flex-col justify-center items-center border-r">
    <p className="text-xl text-[#4570EA] font-bold">{totals.balkan}</p>
    <p className="text-sm text-gray-500">Balkan</p>
  </div>
  <div className="bg-white space-y-1 p-4  w-[100px] h-[70px] flex flex-col justify-center items-center border-r">
    <p className="text-xl text-[#4570EA] font-bold">{totals.lebap}</p>
    <p className="text-sm text-gray-500">Lebap</p>
  </div>
</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs  text-[#7C8FAC] ">
            <tr>
              <th className="px-4 py-2">No</th>
              <th className="px-4 py-2">Major</th>
              <th className="px-4 py-2">Quote</th>
              <th className="px-4 py-2">Ahal</th>
              <th className="px-4 py-2">Mary</th>
              <th className="px-4 py-2">Dashoguz</th>
              <th className="px-4 py-2">Lebap</th>
              <th className="px-4 py-2">Balkan</th>
              <th className="px-4 py-2">Girls</th>
              <th className="px-4 py-2">Boys</th>
            </tr>
          </thead>
          <tbody>
            {majors.map((item, i) => {
              return (
                <tr key={item.id} className="border-b text-[#2A3547]">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{item.major}</td>
                  <td className="px-4 py-2 text-blue-600">
                    {item.quota}/{item.application_count}
                  </td>
                  <td className="px-4 py-2">{item.regions.ahal}</td>
                  <td className="px-4 py-2">{item.regions.mary}</td>
                  <td className="px-4 py-2">{item.regions.dashoguz}</td>
                  <td className="px-4 py-2">{item.regions.lebap}</td>
                  <td className="px-4 py-2">{item.regions.balkan}</td>
                  <td className="px-4 py-2">
                    {/* {item.gender_stats?.find((stat) => stat.user__gender === "female")?.count || 0} */}
                  </td>
                  <td className="px-4 py-2">
                    {/* {item.gender_stats?.find((stat) => stat.user__gender === "male")?.count || 0} */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsTable;