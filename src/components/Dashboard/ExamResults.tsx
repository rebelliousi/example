import React from "react";
import ExampleIcon from "../../assets/icons/ExampleIcon";

interface Exam {
  name: string;
  result: string;
  percentage: string;
}

const exams: Exam[] = [
  { name: "Exam 1", result: "123/1234", percentage: "15%" },
  { name: "Exam 2", result: "123/1234", percentage: "15%" },
  { name: "Exam 3", result: "123/1234", percentage: "15%" },
];

const ExamResults = () => {
  return (
    <div className="bg-white rounded-xl shadow p-4 h-[260px]">
     <div className="flex items-center space-x-2 mb-3">
            <ExampleIcon/>
            <h3 className="text-md font-semibold">
           Exam Results</h3>

          </div>

      {/* Region filters */}
       <div className="flex items-center gap-4 text-sm mb-4 text-gray-600 flex-wrap">
        <span className="font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">All</span>
        <span>Lebap</span>
        <span>Mary</span>
        <span>Balkan</span>
        <span>Ahal</span>
        <span>Dasoguz</span>
      </div>

      {/* Exams list */}
     <ul className="flex flex-col justify-between p-3 space-y-5"> {/* space-y-3 eklendi */}
  {exams.map((exam, idx) => (
    <li key={idx} className="grid grid-cols-2 gap-x-3">
      <div className="text-[#2A3547] text-md flex space-x-2 ">
         <ExampleIcon/>
         <span>{exam.name}</span>
      </div>
     
      <div className="flex justify-end space-x-2 items-baseline ">

        <p className="text-[19px]">{exam.result}</p>
         <div className="text-[#4570EA] text-[12px] bg-[#EBF3FE] rounded p-[1px]">{exam.percentage}</div>
      </div>
    </li>
  ))}
</ul>
    </div>
  );
};

export default ExamResults;