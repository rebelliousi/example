import { Route, Routes } from 'react-router-dom';
import { ModalProvider } from './components/Modal/ModalProvider';
import SnackbarProvider from './components/Snackbar/SnackbarProvider';
import LoginPage from './pages/Login/Login';
import ProtectedRoutes from './components/ProtectedRoutes/ProtectedRoutes';
import Layout from './pages/Layout/Layout';
import { Suspense } from 'react';
import LoadingIndicator from './components/Status/LoadingIndicator';
import Welcome from './pages/Welcome/Welcome';
import AdmissionRoutes from './components/Routes/AdmissionRoutes/AdmissionRoutes';
import ExamSubjectsPage from './pages/ExamSubjects/ExamSubjectsList';
import ApplicationListPage from './pages/ApplicationLIst/ApplicationLIstPage';
import AddApplicationPage from './pages/ApplicationLIst/AddApplicationList';
import Dashboard from './pages/Dashboard/Dashboard';
import EditApplicationForm from './pages/ApplicationLIst/EditApplicationList';
import ApplicationDetailPage from './pages/ApplicationDetail/DetailApplication';
import InformationRoutes from './components/Routes/InformationRoutes';

const App: React.FC = () => {
  return (
    <>
      <ModalProvider>
        <SnackbarProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoutes />} />
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <Suspense fallback={<LoadingIndicator />}>
                    <Welcome />
                  </Suspense>
                }
              />
              <Route path="/admissions/*" element={<AdmissionRoutes />} />
              <Route path="/exam_subjects" element={<ExamSubjectsPage />} />

              <Route
                path="/application_list"
                element={<ApplicationListPage />}
              />

              <Route
                path="/application_list/detail/:id"
                element={<ApplicationDetailPage />}
              />
              <Route
                path="/application_list/add"
                element={<AddApplicationPage />}
              />
               
              <Route path="/application_list/edit/:id" element={<EditApplicationForm/>} /> 

              <Route path="/statistics" element={<Dashboard />} />
            </Route>

        <Route path="infos/*" element={<InformationRoutes />} />
          </Routes>
        </SnackbarProvider>
      </ModalProvider>
    </>
  );
};
export default App;
