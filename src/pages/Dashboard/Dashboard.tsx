import ApplicationsByDate from "../../components/Dashboard/ApplicationsByDate";
import ApplicationsTable from "../../components/Dashboard/ApplicationTable";
import ExamResults from "../../components/Dashboard/ExamResults";
import GenderInfo from "../../components/Dashboard/GenderInformation";
import OnlineApplications from "../../components/Dashboard/OnlineApplications";



const Dashboard = () => {
  return (
    <div className="p-6  bg-gray-50">
   

 
      <div className="mb-6">
        <ApplicationsTable />
      </div>

      <div className="flex space-x-5">
        <ApplicationsByDate/>
    
        <GenderInfo />
        <ExamResults />
      
      
        
      </div>
    </div>
  );
};

export default Dashboard;
