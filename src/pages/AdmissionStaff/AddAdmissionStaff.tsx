import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAddAdmissionStaff } from '../../hooks/AdmissionStaff/useAddAdmissionStaff';
import { toast } from 'react-hot-toast';
import Select from '../../components/InputSelect/Select';
import Container from '../../components/Container/Container';
import TrashIcon from '../../assets/icons/TrashIcon';
import { LinkButton } from '../../components/Buttons/LinkButton';

import { useStaffs } from '../../hooks/Staff/useStaffs';
import { IStaff } from '../../models/models';

enum Role {
  DIRECTOR = 'DIRECTOR',
  REGISTRAR = 'REGISTRAR',
}

type StaffInput = {
  staff: number;
  role: Role;
  place: number;
};

const AddAdmissionStaffPage = () => {
  const { admission_id } = useParams();
  const navigate = useNavigate();
  const { data: staffs } = useStaffs(1);

  const { mutateAsync, isPending } = useAddAdmissionStaff();

  const [staffInputs, setStaffInputs] = useState<StaffInput[]>([
    { staff: 0, role: Role.DIRECTOR, place: 0 },
  ]);

  const staffOptions =
    staffs?.results.map((s: IStaff) => ({ id: s.id, name: s.name })) || [];

  
  const roleOptions = Object.values(Role).map((role) => ({
    id: role,
    name: role.charAt(0) + role.slice(1).toLowerCase(),
  }));

  const handleRemoveStaff = (index: number) => {
    const newInputs = staffInputs.filter((_, i) => i !== index);
    setStaffInputs(newInputs);
  };

  const handleChange = (
    index: number,
    field: keyof StaffInput,
    value: string | number
  ) => {
    const updated = [...staffInputs];
    updated[index][field] = value as never;
    setStaffInputs(updated);
  };

  const handleSave = async () => {
    try {
      if (!admission_id) return;

      for (const input of staffInputs) {
        await mutateAsync({
          admission: parseInt(admission_id),
          staff: input.staff,
          role: input.role,
          place: input.place,
        });
      }

      toast.success('Admission staff successfully added');
      setStaffInputs([{ staff: 0, role: Role.DIRECTOR, place: 0 }]);
      navigate(`/admissions/${admission_id}/staff`);
    } catch (_) {
      toast.error('Failed to add admission staff');
    }
  };

  return (
    <div>
      <Container>
        <div className="px-5 py-10">
          <h1 className="text-lg mb-5">Add Admission Staff</h1>

          {staffInputs.map((input, index) => (
            <div key={index} className="flex flex-col space-y-5 py-3">
              {/* Staff */}
              <div className="col-span-4">
                <label className="block text-sm font-medium mb-1 text-formInputText">Staff</label>
                <Select
                  value={input.staff}
                  onChange={(value) => handleChange(index, 'staff', value)}
                  placeholder="Select a staff"
                  options={staffOptions}
                  className='w-[462px]'
                />
              </div>

              

              {/* Role */}
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-1 text-formInputText">Role</label>
                <Select
                  value={input.role}
                  onChange={(value) => handleChange(index, 'role', value)}
                  placeholder="Select a role"
                  options={roleOptions}
                  className="w-[462px]"
                />
              </div>

              {/* Remove Button */}
              <div className="col-span-1 flex items-center">
                {staffInputs.length > 1 && (
                  <button type="button" onClick={() => handleRemoveStaff(index)}>
                    <TrashIcon size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Bottom Buttons */}
          <div className="grid grid-cols-12 items-center mt-6">
            <div className="col-span-12 flex justify-end gap-4 items-center">
              <LinkButton
                to={`/admissions/${admission_id}/staff`}
                type="button"
                variant="cancel"
                className="px-4 py-5"
              >
                Cancel
              </LinkButton>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AddAdmissionStaffPage;
