import { Outlet } from 'react-router-dom';
import Container from '../../components/Container/Container';
import React from 'react';
import ArrowRightTabs from '../Tabs/ArrowRIghtTabs';



interface ITab { 
  id: number;
  name: string;
  link: string;
}

const InfoLayout: React.FC = () => {
  const tabs: ITab[] = [
    {
      id: 1,
      name: 'Major',
      link: `/infos/degree-information`,
    },
    {
      id: 2,
      name: 'General information',
      link: `/infos/general-information`,
    },
    {
      id: 3,
      name: 'Guardians',
      link: `/infos/guardians-info`,
    },
    {
      id: 4,
      name: 'Education',
      link: `/infos/education-info`,
    },
    {
      id: 5,
      name: 'Awards',
      link: `/infos/awards-info`,
    },
    {
      id: 6,
      name: 'Other Documents',
      link: `/infos/other-doc-info`,
    },
  ];

  return (
    <Container>
      <div className=" text-primaryText mt-20 text-[14px]">
     
        <div className="pb-4">
                        <ArrowRightTabs  tabs={tabs} />
                    </div>
        <Outlet />
      </div>
  
    </Container>
  );
};

export default InfoLayout;