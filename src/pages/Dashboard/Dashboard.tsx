import ApplicationsByDate from '../../components/Dashboard/ApplicationsByDate';

import ExamResults from '../../components/Dashboard/ExamResults';

import { useStatistics } from '../../hooks/Statistics/useStatistics'; // Adjust path

import ApplicationsTable from '../../components/Dashboard/ApplicationTable';
import GenderInfo from '../../components/Dashboard/GenderInformation';
import LoadingIndicator from '../../components/Status/LoadingIndicator';

const Dashboard = () => {
  const { data: statistics, isLoading, isError, error } = useStatistics();

  if (isLoading) {
    return <div ><LoadingIndicator/></div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>; // Use optional chaining
  }

  if (!statistics) {
    return <div>No data available.</div>;
  }

  return (
    <div className="p-6  bg-gray-50">
      <div className="mb-6">
        <ApplicationsTable
          majors={statistics.majors}
        
        />
      </div>

      <div className="flex space-x-5">
         <ApplicationsByDate
          totalApplications={statistics.total_applications}
          genderStats={statistics.gender_stats}
          applicationsByRegion={statistics.applications_by_region}
          // totalOnlineApplications={statistics.total_online_applications}
          // totalVerified={statistics.total_verified}
          // totalWaiting={statistics.total_waiting}
        />
        <GenderInfo
        // genderStats={statistics.gender_stats} /> 
        />

        <ExamResults />
      </div>
    </div>
  );
};

export default Dashboard;
