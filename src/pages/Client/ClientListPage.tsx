import React from 'react';
import { Link } from 'react-router-dom';

import LoadingIndicator from '../../components/Status/LoadingIndicator'; // Yükleme göstergesi
import { Client, useClients } from '../../hooks/Client/useClients';




const ClientListPage = () => {
  const page = 1; // Başlangıç sayfa numarası (isteğe bağlı)
  const { data, isLoading, error } = useClients(page); // Hook'u kullan
  console.log(data)

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data || !data.results) {
    return <div>No data available.</div>; // Veri yoksa
  }

  return (
    <div>
      <h1>Client List</h1>
      <ul>
        {data.results.map((client: Client) => (
          <li key={client.id}>
            <Link to={`/clients/${client.id}`}>
              {client.full_name} ({client.primary_major.major}) {/* Gösterilecek bilgiler */}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientListPage;