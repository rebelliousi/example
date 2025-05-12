import React from "react";
import SpecialGroups from "./SpecialGroups";

const GenderInfo = () => {
  return (
    <div className="bg-white rounded-xl shadow p-4 w-[302px] h-[170px] flex flex-col items-center space-y-10">
      {/* Başlık */}
      <h3 className="text-md font-semibold ">Gender information</h3>

      {/* İçerik */}
      <div className="flex justify-around items-center h-full">
        {/* Girls */}
        <div className="pr-10 border-r text-center">
          <div className="text-3xl font-bold text-blue-600">1234</div>
          <div className="text-sm text-gray-500">Girls</div>
          <div className="text-xs text-blue-500 mt-1">15%</div>
        </div>

        {/* Boys */}
        <div className="pl-4 text-center">
          <div className="text-3xl font-bold text-blue-600">1234</div>
          <div className="text-sm text-gray-500">Boys</div>
          <div className="text-xs text-blue-500 mt-1">15%</div>
        </div>
      </div>
      <SpecialGroups />
    </div>
  );
};

export default GenderInfo;
