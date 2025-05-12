import React from "react";

const data = [
  {
    major: "Mobile and network engineering",
    quote: "64/100",
    ahal: "20/5",
    mary: "20/5",
    dashoguz: "20/5",
    lebap: "20/5",
    balkan: "20/5",
    girls: "123",
    boys: "123",
  },
  {
    major: "Mobile and network engineering",
    quote: "64/100",
    ahal: "20/5",
    mary: "20/5",
    dashoguz: "20/5",
    lebap: "20/5",
    balkan: "20/5",
    girls: "123",
    boys: "123",
  },
  {
    major: "Mobile and network engineering",
    quote: "64/100",
    ahal: "20/5",
    mary: "20/5",
    dashoguz: "20/5",
    lebap: "20/5",
    balkan: "20/5",
    girls: "123",
    boys: "123",
  },
  {
    major: "Mobile and network engineering",
    quote: "64/100",
    ahal: "20/5",
    mary: "20/5",
    dashoguz: "20/5",
    lebap: "20/5",
    balkan: "20/5",
    girls: "123",
    boys: "123",
  },
  {
    major: "Mobile and network engineering",
    quote: "64/100",
    ahal: "20/5",
    mary: "20/5",
    dashoguz: "20/5",
    lebap: "20/5",
    balkan: "20/5",
    girls: "123",
    boys: "123",
  },
  {
    major: "Mobile and network engineering",
    quote: "64/100",
    ahal: "20/5",
    mary: "20/5",
    dashoguz: "20/5",
    lebap: "20/5",
    balkan: "20/5",
    girls: "123",
    boys: "123",
  },
]

const ApplicationsTable = () => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
  <h1 className="text-2xl font-bold">Application Information</h1>

  <div className="flex gap-4 ">
  <div className="bg-white space-y-1 p-4 shadow-sm border-r flex flex-col items-center">
    <p className="text-xl font-bold">1,245</p>
      <p className="text-sm text-gray-500"> Ahal</p>
    
    </div>
    <div className="bg-white space-y-1 p-4 shadow-sm border-r flex flex-col items-center">
    <p className="text-xl font-bold">1,245</p>
      <p className="text-sm text-gray-500"> Dasoguz</p>
    
    </div>
    <div className="bg-white space-y-1 p-4 shadow-sm border-r flex flex-col items-center">
    <p className="text-xl font-bold">1,245</p>
      <p className="text-sm text-gray-500"> Mary</p>
    
    </div>
    <div className="bg-white space-y-1 p-4 shadow-sm border-r flex flex-col items-center">
    <p className="text-xl font-bold">1,245</p>
      <p className="text-sm text-gray-500"> Balkan</p>
    
    </div>
    <div className="bg-white space-y-1 p-4 shadow-sm border-r flex flex-col items-center">
    <p className="text-xl font-bold">1,245</p>
      <p className="text-sm text-gray-500"> Lebap</p>
    
    </div>
  </div>
</div>
     
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
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
            {data.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{item.major}</td>
                <td className="px-4 py-2 text-blue-600">{item.quote}</td>
                <td className="px-4 py-2">{item.ahal}</td>
                <td className="px-4 py-2">{item.mary}</td>
                <td className="px-4 py-2">{item.dashoguz}</td>
                <td className="px-4 py-2">{item.lebap}</td>
                <td className="px-4 py-2">{item.balkan}</td>
                <td className="px-4 py-2">{item.girls}</td>
                <td className="px-4 py-2">{item.boys}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};

export default ApplicationsTable;
