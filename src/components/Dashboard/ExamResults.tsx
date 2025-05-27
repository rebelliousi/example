

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
      <h3 className="text-lg font-semibold mb-4">Exam Results (Passed)</h3>

      {/* Region filters */}
      <div className="flex items-center gap-3 text-sm mb-4 text-gray-600">
        {["All", "Lebap", "Mary", "Balkan", "Ahal", "Dasoguz"].map((region) => (
          <span
            key={region}
            className="font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded cursor-pointer hover:bg-blue-200"
          >
            {region}
          </span>
        ))}
      </div>

      {/* Exams list */}
      <ul className="space-y-3 text-lg flex  flex-col items-center">
        {exams.map((exam, idx) => (
          <div key={idx} className="grid grid-cols-2 space-x-3">
            <span>{exam.name}</span>
            <span className="">
              {exam.result} <span className="text-blue-600">{exam.percentage}</span>
            </span>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default ExamResults;