import React from "react";
import ExampleIcon from "../../assets/icons/ExampleIcon";

interface GenderInfoProps {
  maleCount: number;
  femaleCount: number;
  malePercentage: number;
  femalePercentage: number;
}

const GenderInfo: React.FC<GenderInfoProps> = ({ maleCount, femaleCount, malePercentage, femalePercentage }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 h-auto flex flex-col items-start space-y-4">
      {/* Başlık */}
      <div className="flex items-center space-x-3">
        <ExampleIcon />
        <h3 className="text-lg font-semibold">Gender information</h3>
      </div>

      {/* İçerik */}
      <div className="grid grid-cols-12 gap-4 w-full mt-7">
        {/* Girls */}
      <div className="text-center col-span-6 border-r flex items-start justify-start">
  <div className="flex flex-col items-start">
    <h1 className="text-md text-[#7C8FAC] mb-1">Girls</h1>
    <div className="flex items-baseline space-x-2">
      <div className="text-4xl font-bold text-blue-600">{femaleCount}</div>
      <div className="text-sm text-blue-500 bg-[#EBF3FE] p-1 rounded"><h1 className="text-[#4570EA]">{femalePercentage.toFixed(1)}%</h1></div>
    </div>
  </div>
</div>

        {/* Boys */}
          <div className="text-center col-span-6  flex items-start justify-start">
  <div className="flex flex-col items-start">
    <h1 className="text-md text-[#7C8FAC] mb-1">Boys</h1>
    <div className="flex items-baseline space-x-2">
      <div className="text-4xl font-bold text-blue-600">{maleCount}</div>
      <div className="text-sm text-blue-500 bg-[#EBF3FE] p-1 rounded"><h1 className="text-[#4570EA]">{malePercentage.toFixed(1)}%</h1></div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default GenderInfo;


//  <div className="text-center col-span-6">
//           <div className="text-3xl font-bold text-blue-600">{maleCount}</div>
//           <div className="text-sm text-gray-500">Boys</div>
//           <div className="text-xs text-blue-500 mt-1">{malePercentage.toFixed(1)}%</div>
//         </div>