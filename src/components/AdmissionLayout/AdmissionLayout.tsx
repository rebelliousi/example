

import { Outlet, NavLink, useParams } from 'react-router-dom';
import { useAdmissionById } from '../../hooks/Admission/useAdmissonById';
import Container from '../Container/Container';


const AdmissionLayout = () => {
  const { admission_id } = useParams<{ admission_id: string }>();
  const { data: admission} = useAdmissionById(admission_id);

  return (
    <Container>
      <div className="px-1 pb-10 text-primaryText">
        <div className="h-20 flex items-center justify-between">
          <div>
            <h1 className="text-lg">{admission?.academic_year}</h1>
          </div>
          <div className="flex space-x-6 text-sm text-[#7C8FAC]">
            <NavLink
              to={`/admissions/${admission_id}/majors`}
              className={({ isActive }) =>
                `flex items-center justify-center pb-2 ${isActive ? 'text-blue-500 border-b-[1px] border-blue-500 pb-2' : ''}`
              }
            >
              Majors
            </NavLink>
            <NavLink
              to={`/admissions/${admission_id}/exams`}
              className={({ isActive }) =>
                `flex items-center justify-center  pb-2 ${isActive ? 'text-blue-500 border-b-[1px] border-blue-500 pb-2' : ''}`
              }
            >
              Exams
            </NavLink>
            <NavLink
              to={`/admissions/${admission_id}/place`}
              className={({ isActive }) =>
                `flex items-center justify-center pb-2 ${isActive ? 'text-blue-500 border-b-[1px] border-blue-500 pb-2' : ''}`
              }
            >
              Admission Place
            </NavLink>
            <NavLink
              to={`/admissions/${admission_id}/staff`}
              className={({ isActive }) =>
                `flex items-center justify-center  pb-2 ${isActive ? 'text-blue-500 border-b-[1px] border-blue-500 pb-2' : ''}`
              }
            >
              Admission Staff
            </NavLink>
          </div>
        </div>

        <Outlet />
      </div>
    </Container>
  );
};

export default AdmissionLayout;
