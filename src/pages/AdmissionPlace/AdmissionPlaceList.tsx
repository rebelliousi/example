import PlusIcon from '../../assets/icons/PlusIcon';
import LoadingIndicator from '../../components/Status/LoadingIndicator';
import TableLayout from '../../components/Table/TableLayout';
import AdmissionPlaceListItem from '../../components/AdmissionPlaces/AdmissionPlaceListItem';
import { LinkButton } from '../../components/Buttons/LinkButton';
import { useParams } from 'react-router-dom';
import { useAdmissionPlaces } from '../../hooks/AdmissionPlace/useAdmissionPlaces';

const AdmissionPlaceListPage = () => {
  const { admission_id } = useParams();


  const { data, isSuccess, isLoading} = useAdmissionPlaces(Number(admission_id));




  return (
    <div>
      <div className="flex justify-start mb-4">
        <LinkButton
          to={`/admissions/${admission_id}/place/add`}
          className="bg-blue-500 w-[100px] text-sm text-white px-2 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
        >
          <PlusIcon className="mr-2" />
          <span>Add</span>
        </LinkButton>
      </div>

      <TableLayout>
        <div className="py-4 grid grid-cols-12 bg-tableTop px-3 text-tableTopText">
          <div className="col-span-1">No</div>
          <div className="col-span-2">Area</div>
          <div className="col-span-2">Address</div>
          <div className="col-span-5"></div>
        </div>

        {isSuccess && data?.places?.map((place, index) => (
          <AdmissionPlaceListItem
            key={place.id}
            place={place}
            index={index}
          />
        ))}
      </TableLayout>

      {isLoading && <LoadingIndicator />}
    </div>
  );
};

export default AdmissionPlaceListPage;
