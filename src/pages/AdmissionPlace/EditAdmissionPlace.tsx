import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useArea } from '../../hooks/Area/useAreas';

import Container from '../../components/Container/Container';
import { useNavigate, useParams } from 'react-router-dom';
import Select from '../../components/InputSelect/Select';
import { LinkButton } from '../../components/Buttons/LinkButton';
import { useEditAdmissionPlaceById } from '../../hooks/AdmissionPlace/useEditAdmissionPlace';
import { useAdmissionPlaceById } from '../../hooks/AdmissionPlace/useAdmissionPlaceById'; // Hook'u import ettik


type Place = {
  id?: string;
  
  area: number;
  address: string;
};

const EditAdmissionPlacesPage = () => {
  const navigate = useNavigate();
  const { admission_id, place_id } = useParams<{ admission_id: string; place_id: string }>();
  const { data: areas } = useArea();

  const { mutateAsync, isPending } = useEditAdmissionPlaceById();
  const queryClient = useQueryClient();
  const { data: admissionPlace } = useAdmissionPlaceById(place_id); // Hook'u kullandık

  const [place, setPlace] = useState<Place>({
 
    area: 0,
    address: '',
  });

  useEffect(() => {
    if (admissionPlace) {
      setPlace({
        id: String(admissionPlace.id),
      
        area: admissionPlace.area || 0,
        address: admissionPlace.address || '',
      });
    }
  }, [admissionPlace]); // admissionPlace değiştiğinde useEffect çalışacak

  const handleChange = (field: keyof Place, value: number | string) => {
    setPlace((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!place.id || !admission_id) return;

      await mutateAsync({
        id: place.id,
        data: {
          admission: parseInt(admission_id),
          address: place.address,
         
          area: place.area,
        },
      });

      queryClient.invalidateQueries({ queryKey: ['admission_places'] });
    
      navigate(`/admissions/${admission_id}/place`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to edit admission place');
    }
  };

  return (
    <div>
      <Container>
        <div className="px-5 py-10">
          <h1 className="text-lg mb-5">Edit Admission Place</h1>

          {/* Form */}
          <div className="grid grid-cols-12 gap-4 py-3">
           
            <div className="mb-2 col-span-3">
              <label className="block text-sm font-medium mb-1 text-formInputText">Area</label>
              <Select
                value={place.area}
                onChange={(value) => handleChange('area', value)}
                placeholder="Select an area"
                options={areas?.results || []}
              />
            </div>
            <div className="mb-6 col-span-6">
              <label className="block text-sm font-medium mb-1 text-formInputText">Address</label>
              <input
                type="text"
                placeholder="Edit address"
                className="w-full p-2 border rounded focus:outline-none text-gray-500"
                value={place.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-12 items-center mt-6">
            <div className="col-span-12 flex justify-end gap-4 items-center">
              <LinkButton
                to={`/admissions/${admission_id}/place`}
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

export default EditAdmissionPlacesPage;