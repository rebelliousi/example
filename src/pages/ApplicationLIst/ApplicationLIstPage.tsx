import { useState } from 'react';
import { useParams } from 'react-router-dom';

import LoadingIndicator from '../../components/Status/LoadingIndicator';
import TableLayout from '../../components/Table/TableLayout';

import { LinkButton } from '../../components/Buttons/LinkButton';
import PlusIcon from '../../assets/icons/PlusIcon';
import { Pagination } from '@mui/material';
import { useApplication } from '../../hooks/ApplicationList/useApplicationLists';
import Container from '../../components/Container/Container';
import ApplicationListItem from '../../components/ApplicationList/ApplicationListItem';

const ApplicationListPage = () => {

  const [page, setPage] = useState<number>(1);
  

  const { data, isSuccess, isLoading } = useApplication(page);

  const totalPages = data ? Math.ceil(data.count / 20) : 0;

  return (
    <div>
      <Container>
        <div className="max-2xl:px-5 pb-10 text-primaryText">
          <div className="h-20 flex items-center justify-between">
            <div>
              <h1 className="text-lg">Applications</h1>
            </div>
            <div className="text-sm flex gap-2">
              <LinkButton   to={`/application_list/add`}
                className="flex items-center gap-2 border px-3 py-2 rounded bg-blue-500 text-white"
              >
                <PlusIcon />
                <h1>Add</h1>
              </LinkButton>
            </div>
          </div>
          <div>
            <TableLayout>
              <div className="py-4 grid grid-cols-12 bg-tableTop px-3 text-tableTopText">
                <div className="col-span-1">
                  <h1>No</h1>
                </div>
                <div className="col-span-3">
                  <h1>Full Name</h1>
                </div>
                <div className="col-span-3">
                  <h1>Major</h1>
                </div>
                <div className="col-span-1">
                  <h1>Region</h1>
                </div>
                <div className="col-span-1">
                  <h1>Year</h1>
                </div>
                <div className="col-span-1">
                  <h1>Status</h1>
                </div>
                <div className="col-span-0"></div>
              </div>

              {isSuccess && data?.results.map((application, index) => (
                <ApplicationListItem
                  key={application.admission}  //id needs here  
                  application={application}
                  index={index + 1 + (page - 1) * 20} 
                />
              ))}
            </TableLayout>

            {isLoading && <LoadingIndicator />}

            {isSuccess && totalPages > 1 && (
              <div className="flex justify-center my-6">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  variant="outlined"
                  shape="rounded"
                />
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ApplicationListPage;
