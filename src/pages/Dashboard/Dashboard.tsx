
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
    return (
      <div>
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  if (!statistics) {
    return <div>No data available.</div>;
  }

  const maleCount = statistics.gender_stats.find(stat => stat.user__gender === 'male')?.count || 0;
  const femaleCount = statistics.gender_stats.find(stat => stat.user__gender === 'female')?.count || 0;
  const malePercentage = statistics.gender_stats.find(stat => stat.user__gender === 'male')?.percentage || 0;
  const femalePercentage = statistics.gender_stats.find(stat => stat.user__gender === 'female')?.percentage || 0;


  return (
    <div className="p-6 bg-gray-50 max-2xl:px-5 ">
      <div className="mb-6">
        <ApplicationsTable majors={statistics.majors} />
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5">
          <ApplicationsByDate
            genderStats={statistics.gender_stats}
            applicationsByRegion={statistics.applications_by_region}
          />
        </div>
        <div className="col-span-3">
          <GenderInfo maleCount={maleCount} femaleCount={femaleCount} malePercentage={malePercentage} femalePercentage={femalePercentage} />
        </div>
        <div className="col-span-4">
          <ExamResults />
        </div>

     <div className="col-span-5  mt-[-35px]">
        <OnlineApplications
          applicationStatus={statistics.application_status}
          applicationsByRegion={statistics.applications_by_region}
        />
        </div>
        <div className="col-span-3  mt-[-110px]">
          <SpecialGroups vipCount={statistics.special_cases?.vip_count || 0} orphanCount={statistics.special_cases?.orphan_count || 0} />
        </div>

        <div className="col-span-1"></div>
      </div>
    </div>
  );
};

export default Dashboard;