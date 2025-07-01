import React, { memo } from 'react';

interface MajorDisplayProps {
    majorName: string;
}

const MajorDisplay : React.FC<MajorDisplayProps> = memo(({majorName}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-1 text-formInputText">
        Major
      </label>
      <div
        className="w-96 h-auto rounded  text-gray-600 bg-white p-2 border border-gray-300"
        style={{ border: '1px solid #ccc' }}
      >
        {majorName}
      </div>
    </div>
  );
});

export default MajorDisplay;