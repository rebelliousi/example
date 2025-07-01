import React from 'react';
import { Link } from 'react-router-dom';

import LoadingIndicator from '../../components/Status/LoadingIndicator';
import { useApplication, type IApplication } from '../../hooks/ApplicationList/useApplicationLists';  // Doğru hook ve tipi import et
// import { useQuery } from '@tanstack/react-query'; // Bu satıra gerek yok, hook zaten bunu kullanıyor

const ApplicationIndexPage = () => {
  const page = 1;
  const { data, isLoading, error } = useApplication(page); // Doğru hook'u kullan

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data || !data.results) {  // data.results kontrolünü yap
    return <div>No data available.</div>;
  }

  return (
    <div>
      <h1>Application</h1>
      <ul>
        {data.results.map((application: IApplication) => ( // Doğru tipi kullan
          <li key={application.id}>
            <Link to={`/applications/${application.id}`}>
              {application.full_name} ({application.primary_major.major})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApplicationIndexPage;