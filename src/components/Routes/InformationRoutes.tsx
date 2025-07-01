import React, { Suspense, lazy } from 'react';
import LoadingIndicator from '../Status/LoadingIndicator';
import { Route, Routes } from 'react-router-dom';
import InfoLayout from '../InfoLayout/InfoLayout';
import EditDegreeInformationForm from '../../EditClient/EditDegreeInformation';
import EditGeneralInformationForm from '../../EditClient/EditGeneralInformation';
import EditGuardianForm from '../../EditClient/EditGuardiansForm';
import EditEducationInfo from '../../EditClient/EditEducationInfo';
import EditAwardsInfo from '../../EditClient/EditAwardsInfo';
import EditOtherDocuments from '../../EditClient/EditOtherDocuments';
import ClientListPage from '../../pages/Client/ClientListPage';



// Lazy load tanımlamaları
const DegreeInformationForm = lazy(() => import('../../pages/DegreeInformation/DegreeInformation'));
const GeneralInformation = lazy(() => import('../../pages/GeneralInformation/GeneralInformation'));
const GuardiansInfoPage = lazy(() => import('../../pages/GuardiansInfo/GuardiansInfo'));
const EducationInfo = lazy(() => import('../../pages/EducationInfo/EducationInfo'));
const AwardsInfo = lazy(() => import('../../pages/AwardsInfo/AwardsInfo'));
const OtherDocuments = lazy(() => import('../../pages/OhterDocuments/OtherDocuments'));

// Edit formları için lazy load tanımlamaları
// const EditDegreeInformationForm = lazy(() => import('../../pages/DegreeInformation.tsx/EditDegreeInformationForm'));
// const EditGeneralInformationForm = lazy(() => import('../../pages/GeneralInformation/EditGeneralInformationForm'));
// const EditGuardiansInfoPage = lazy(() => import('../../pages/GuardiansInfo/EditGuardiansInfo'));
// const EditEducationInfo = lazy(() => import('../../pages/EducationInfo/EditEducationInfo'));
// const EditAwardsInfo = lazy(() => import('../../pages/AwardsInfo/EditAwardsInfo'));
// const EditOtherDocuments = lazy(() => import('../../pages/OtherDocuments/EditOtherDocuments'));

const InformationRoutes = () => {
    return (
        <Suspense fallback={<LoadingIndicator />}>
            <Routes>
                <Route path="list" element={<ClientListPage />} />
                <Route path="/" element={<InfoLayout />}>
                    {/* Normal formlar */}
                    <Route path="degree-information" element={<DegreeInformationForm />} />
                    <Route path="general-information" element={<GeneralInformation />} />
                    <Route path='guardians-info' element={<GuardiansInfoPage />} />
                    <Route path='education-info' element={<EducationInfo />} />
                    <Route path='awards-info' element={<AwardsInfo />} />
                    <Route path='other-doc-info' element={<OtherDocuments />} />

                    {/* Edit formları */}
                    <Route path="edit-degree-information" element={<EditDegreeInformationForm />} />
                    <Route path="edit-general-information" element={<EditGeneralInformationForm />} />
                    <Route path='edit-guardians-info' element={<EditGuardianForm />}/>
                    <Route path='edit-education-info' element={<EditEducationInfo />} />
                     <Route path='edit-awards-info' element={<EditAwardsInfo/>} />
                     <Route path='edit-other-doc-info' element={<EditOtherDocuments />} /> 
                    {/* <Route path='edit-guardians-info' element={<EditGuardiansInfoPage />} />
                    // <Route path='edit-education-info' element={<EditEducationInfo />} />
                    // <Route path='edit-awards-info' element={<EditAwardsInfo />} />
                    // <Route path='edit-other-doc-info' element={<EditOtherDocuments />} /> */}
                </Route>
            </Routes>
        </Suspense>
    );
};

export default InformationRoutes;