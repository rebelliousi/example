import ApplicationsByDate from '../../components/Dashboard/ApplicationsByDate';
import ExamResults from '../../components/Dashboard/ExamResults';
import { useStatistics } from '../../hooks/Statistics/useStatistics';
import ApplicationsTable from '../../components/Dashboard/ApplicationTable';
import GenderInfo from '../../components/Dashboard/GenderInformation';
import LoadingIndicator from '../../components/Status/LoadingIndicator';
import SpecialGroups from '../../components/Dashboard/SpecialGroups';
import OnlineApplications from '../../components/Dashboard/OnlineApplications';
import React from 'react';

const Dashboard = () => {
  const { data: statistics, isLoading, isError, error } = useStatistics();

  if (isLoading) {
    return <div ><LoadingIndicator/></div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  if (!statistics) {
    return <div>No data available.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 max-2xl:px-5 ">
      <div className="mb-6">
        <ApplicationsTable majors={statistics.majors} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* 1. Satır */}
        <div className="col-span-1">
          <ApplicationsByDate
            totalApplications={statistics.total_applications}
            genderStats={statistics.gender_stats}
            applicationsByRegion={statistics.applications_by_region}
          />
        </div>
        <div className="col-span-1">
          <GenderInfo
           
           // GenderInfo'nun yüksekliğini küçültmek için
          />
        </div>
        <div className="col-span-1">
          <ExamResults />
        </div>

        {/* 2. Satır */}
        <div className="col-span-1">
          <OnlineApplications />
        </div>
        <div className="col-span-1">
          <SpecialGroups />
        </div>
        {/* 3.Sutun bos */}
        <div className="col-span-1">
        </div>
      </div>
    </div>
  );
};

export default Dashboard;