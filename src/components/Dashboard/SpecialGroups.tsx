import React from "react";

const groups = [
  "Gulluk eden",
  "Masgalaly",
  "Yetim",
  "Doly yetim",
  "Yolbasçy",
];

const SpecialGroups = () => {
  return (
    <div className="bg-white rounded-xl shadow p-4 w-[302px]  h-[260px]">
     
      <ul className="space-y-5 text-lg  flex flex-col items-center justify-center" >
        {groups.map((group, index) => (
          <li key={index} className="grid grid-cols-2 space-x-10  mt-2">
            <span className=" text-gray-600">{group}</span>
            <span className="text-black pr-1 text-xl">1245 <span className="text-xs  pl-2 text-green-600 ">15%</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpecialGroups;
