import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoadingIndicator from '../../Status/LoadingIndicator';

import AdmissionListPage from '../../../pages/Admission/AdmissionList';
import Major from '../../../pages/Major/MajorList';
import AdmissionLayout from '../../AdmissionLayout/AdmissionLayout';
import ExamListPage from '../../../pages/Exam/AdmissionExamList';
import AdmissionPlaceListPage from '../../../pages/AdmissionPlace/AdmissionPlaceList';
import AddAdmissionPlacesPage from '../../../pages/AdmissionPlace/AddAdmissionPlace';
import EditAdmissionPlacesPage from '../../../pages/AdmissionPlace/EditAdmissionPlace';
import AdmissionStaffList from '../../../pages/AdmissionStaff/AdmissionStaff';
import AddAdmissionStaffPage from '../../../pages/AdmissionStaff/AddAdmissionStaff';
import EditAdmissionStaffPage from '../../../pages/AdmissionStaff/EditAdmissionStaff';
import AddAdmissionExamPage from '../../../pages/Exam/AddAdmissionExam';
import EditAdmissionExamPage from '../../../pages/Exam/EditAdmissionExam';
import ExamDetail from '../../Exam/ExamDetail';



const AdmissionRoutes = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Routes>
        <Route path='list' element={<AdmissionListPage />} />
        <Route path=':admission_id' element={<AdmissionLayout />}>
          <Route path='majors' element={<Major />} />
          <Route path='exams' element={<ExamListPage/>}/>
          <Route path='place' element={<AdmissionPlaceListPage/>}/> 
          <Route path='staff' element={<AdmissionStaffList/>}/>
        </Route> 
    
        <Route path=":admission_id/place/add" element={<AddAdmissionPlacesPage />} />
        <Route path=':admission_id/place/:place_id/edit' element={<EditAdmissionPlacesPage/>}/>
        
        <Route path=":admission_id/staff/add" element={<AddAdmissionStaffPage />} />
        <Route path=':admission_id/staff/:staff_id/edit' element={<EditAdmissionStaffPage/>}/>
     
        <Route path=":admission_id/exams/add" element={<AddAdmissionExamPage />} />
  <Route path=":admission_id/exams/major/:major_id/edit" element={<EditAdmissionExamPage />} />
        <Route path=":admission_id/exams/major/:major_id" element={<ExamDetail />} />

      </Routes>
    </Suspense>
  );
};

export default AdmissionRoutes;
