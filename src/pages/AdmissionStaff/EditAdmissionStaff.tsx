import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmissionPlaces } from '../../hooks/AdmissionPlace/useAdmissionPlaces';
import { useStaffs } from '../../hooks/Staff/useStaffs';
import { toast } from 'react-hot-toast';
import Select from '../../components/InputSelect/Select';
import Container from '../../components/Container/Container';
import { IPlace } from '../../hooks/AdmissionPlace/useAdmissionPlaces';
import { IStaff } from '../../models/models';
import { useEditAdmissionStaffById } from '../../hooks/AdmissionStaff/useEditAdmissionStaff';
import { useState, useEffect } from 'react'; // useEffect'i import et


import { useAdmissionStaffById } from '../../hooks/AdmissionStaff/useAdmissionStaffById';

enum Role {
  DIRECTOR = 'DIRECTOR',
  REGISTRAR = 'REGISTRAR',
}


export interface IStaffId {
  id: number;
  admission: number;
  place: number;
  role: 'DIRECTOR' | 'REGISTRAR';
  staff: number;
}

const EditAdmissionStaffPage = () => {
  const { admission_id, staff_id } = useParams<{ admission_id: string; staff_id: string }>(); // Tip belirlemesi daha iyi
  const navigate = useNavigate();


  const { data: existingStaffData, isLoading: isLoadingExistingStaff } = useAdmissionStaffById(staff_id);

  const { data: staffs } = useStaffs(Number(admission_id));
  const { data: places } = useAdmissionPlaces(Number(admission_id));
  const { mutateAsync, isPending } = useEditAdmissionStaffById();

  const [staffInput, setStaffInput] = useState({
    staff: 0,
    role: Role.DIRECTOR, 
    place: 0,
  });

  
  useEffect(() => {
    if (existingStaffData) {
      setStaffInput({
        staff: existingStaffData.staff,
        role: existingStaffData.role as Role, 
        place: existingStaffData.place,
      });
    }
  }, [existingStaffData]); 

  const handleChange = (
    field: keyof typeof staffInput,
    value: string | number
  ) => {
    setStaffInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!staff_id || !admission_id) {
        toast.error('Staff ID or Admission ID is missing.');
        return;
      }

      await mutateAsync({
        id: staff_id, // useEditAdmissionStaffById string ID bekliyor olabilir, kontrol et
        data: {
          admission: parseInt(admission_id),
          ...staffInput,
        },
      });

     
      navigate(`/admissions/${admission_id}/staff`); // Güncelleme sonrası yönlendirme
    } catch (_) {
      toast.error('Failed to update admission staff');
    }
  };

  const staffOptions =
    staffs?.results.map((s: IStaff) => ({ id: s.id, name: s.name })) || [];

  const placeOptions =
    places?.places.map((p: IPlace) => ({ id: p.id, name: p.region_name })) ||
    [];

  const roleOptions = Object.values(Role).map((role) => ({
    id: role,
    name: role.charAt(0) + role.slice(1).toLowerCase(),
  }));

  // Yükleme durumunu ele alabilirsin (isteğe bağlı)
  

  return (
    <Container>
      <div className="px-5 py-10  ">
        <h1 className="text-lg mb-5">Edit Admission Staff</h1>

        <div className='flex flex-col '>
          {/* Staff */}
          <div className="mb-5 ">
            <label className="block text-sm font-medium mb-1">Staff</label>
            <Select
              value={staffInput.staff}
              onChange={(val) => handleChange('staff', val)}
              options={staffOptions}
              className="w-[462px]"
              // placeholder={staffInput.staff === 0 ? "Select Staff" : undefined} // İsteğe bağlı
            />
          </div>

          {/* Place */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1">Place</label>
            <Select
              value={staffInput.place}
              onChange={(val) => handleChange('place', val)}
              options={placeOptions}
              className="w-[462px]"
              // placeholder={staffInput.place === 0 ? "Select Place" : undefined} // İsteğe bağlı
            />
          </div>
          {/* Role */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1">Role</label>
            <Select
              value={staffInput.role}
              onChange={(val) => handleChange('role', val as Role)} // val'ın Role tipinde olduğunu belirt
              options={roleOptions}
              className="w-[462px]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          {/* Cancel butonu genellikle bir önceki sayfaya veya listeleme sayfasına döner */}
          <Link
            to={`/admissions/${admission_id}/staff`}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={isPending || isLoadingExistingStaff} // Kaydetme işlemi veya veri yükleniyorsa butonu devre dışı bırak
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Container>
  );
};

export default EditAdmissionStaffPage;