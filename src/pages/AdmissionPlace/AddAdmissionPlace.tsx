import { useState } from 'react';
import { useAddAdmissionPlaces } from '../../hooks/AdmissionPlace/useAddAdmissionPlace';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useArea } from '../../hooks/Area/useAreas';
import { useRegions } from '../../hooks/Regions/useRegions';
import Container from '../../components/Container/Container';
import { useNavigate, useParams } from 'react-router-dom';

import TrashIcon from '../../assets/icons/TrashIcon';
import Select from '../../components/InputSelect/Select';
import PlusIcon from '../../assets/icons/PlusIcon';
import { LinkButton } from '../../components/Buttons/LinkButton';

type Place = {
  region: number;
  area: number;
  address: string;
};

const AddAdmissionPlacesPage = () => {
  const navigate=useNavigate()
  const { admission_id } = useParams();
  const { data: areas } = useArea();
  const { data: regions } = useRegions();
  const { mutateAsync, isPending } = useAddAdmissionPlaces();
  const queryClient = useQueryClient();

  const [places, setPlaces] = useState<Place[]>([
    { region: 0, area: 0, address: '' },
  ]);

  const handleAddForm = () => {
    setPlaces([...places, { region: 0, area: 0, address: '' }]);
  };

  const handleRemoveForm = (index: number) => {
    const newPlaces = places.filter((_, i) => i !== index);
    setPlaces(newPlaces);
  };

  const handleChange = (
    index: number,
    field: keyof Place,
    value: number | string
  ) => {
    const newPlaces = [...places];
    newPlaces[index][field] = value as never;
    setPlaces(newPlaces);
  };

  const handleAdd = async () => {
    try {
      if (!admission_id) return;
      for (const place of places) {
        await mutateAsync({
          admission: parseInt(admission_id),
          ...place,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['admission_places'] });
      toast.success('All admission places successfully added');
      setPlaces([{ region: 0, area: 0, address: '' }]);
      navigate(`/admissions/${admission_id}/place`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add admission places');
    }
  };

  return (
    <div>
      <Container>
        <div className="px-5 py-10">
          <h1 className="text-lg mb-5">Add Admission Places</h1>

          {places.map((place, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 py-3">
              {/* Region */}
              <div className="mb-2 col-span-2">
                <label className="block font-medium mb-1 text-formInputText text-sm">Region</label>
                <Select
                  value={place.region}
                  onChange={(value) => handleChange(index, 'region', value)}
                  placeholder="Select a region"
                  options={regions?.results || []}
                />
              </div>

              {/* Area */}
              <div className="mb-2 col-span-3">
                <label className="block text-sm font-medium mb-1 text-formInputText">Area</label>
                <Select
                  value={place.area}
                  onChange={(value) => handleChange(index, 'area', value)}
                  placeholder="Select an area"
                  options={areas?.results || []}
                />
              </div>

              {/* Address */}
              <div className="mb-6 col-span-6 justify-end">
                <label className="block text-sm font-medium mb-1 text-formInputText">Address</label>
                <input
                  type="text"
                  placeholder="Add an address"
                  className="w-full p-2 border rounded focus:outline-none text-gray-600"
                  value={place.address}
                  onChange={(e) => handleChange(index, 'address', e.target.value)}
                />
              </div>

              {/* Remove Button */}
              <div className="col-span-1 flex items-center">
                {places.length > 1 && (
                  <button type="button" onClick={() => handleRemoveForm(index)}>
                    <TrashIcon size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Form Button + Action Buttons - SAME LINE */}
          {/* Action buttons and Add button in the same horizontal line */}
<div className="grid grid-cols-12 items-center mt-6">
  {/* Add Place */}
  <div className="col-span-6">
    <button
      type="button"
      onClick={handleAddForm}
      className="px-8 py-2 flex items-center gap-2 border-blue-500 border text-blue-500 rounded"
    >
      <PlusIcon /> Add place
    </button>
  </div>

  {/* Cancel and Save buttons */}
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
      onClick={handleAdd}
      disabled={isPending}
      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
    >
      {isPending ? 'Adding...' : 'Add'}
    </button>
  </div>
</div>

        </div>
      </Container>
    </div>
  );
};

export default AddAdmissionPlacesPage;
