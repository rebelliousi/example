import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingIndicator from "../../components/Status/LoadingIndicator";
import { useApplicationById } from "../../hooks/ApplicationList/useApplicationListById";
import Container from "../../components/Container/Container";
// import img from "../../../public/img/logo 1.png";

import MajorSelection from "./MajorSelection";
import GuardiansInfo from "./RelationsInfo";
import InstitutionsInfo from "./InstitutionsInfo";
import OlympicsInfo from "./OlympicsInfo";
import DocumentsInfo from "./DocumentsInfo";
import PersonalInformation from "./PersonalInfo";
import { useDocument } from "../../hooks/Documents/useDocuments";

import { type Guardian, type GuardianRelation } from "./RelationsInfo";

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: applicationData, isLoading } = useApplicationById(id as string);
  const { data } = useDocument();

  useEffect(() => {
    if (applicationData) {
      console.log("ApplicationDetails - API'den gelen applicationData:", applicationData);
    }
  }, [applicationData]);

  if (!id) {
    return <p>Application ID not found in URL.</p>;
  }

  if (isLoading || !applicationData) {
    return (
      <div className="flex items-center justify-center">
        <LoadingIndicator />;
      </div>
    );
  }

  const userDocumentsWithFilePaths = applicationData.user.documents.map(
    (doc) => ({
      ...doc,
      documentFilePaths: doc.file ? [doc.file.path] : [],
    })
  );

  const guardiansWithDocumentsFilePaths = applicationData.user.guardians.map(
    (guardian) => ({
      ...guardian,
      documentFilePaths: guardian.documents.map((doc) =>
        doc.file ? doc.file.path : ""
      ),
      relation: guardian.relation as GuardianRelation,
    })
  );

  const institutionsWithCertificatesFilePaths =
    applicationData.institutions.map((institution) => ({
      ...institution,
      certificateFilePaths: institution.certificates.map((cert) => cert.path),
    }));

  const olympicsWithFilesFilePaths = applicationData.olympics.map(
    (olympic) => ({
      ...olympic,
      olympicFilePaths: olympic.files.map((file) => file.path),
    })
  );

  const userWithDocuments = {
    ...applicationData.user,
    documents: userDocumentsWithFilePaths,
    guardians: guardiansWithDocumentsFilePaths,
  };

  console.log("ApplicationDetails - userWithDocuments:", userWithDocuments);

//   const getAcademicYear = (year: string | undefined) => {
//     if (!year) return "";
//     return `${year}-${parseInt(year) + 1}`;
//   };

  return (
    <Container>
      <div className="p-10 mt-5">
        {/* <div className="w-full flex  flex-col items-center justify-center mb-20">
          <img src={img} alt="" className="mb-7 w-24" />
          <h1 className="text-[18px] mb-3">
            TURKMENISTANYN OGUZ HAN ADYDAKY INZENER TEHNOLOGIYALAR UNIWERSITETI
          </h1>
          <p>{getAcademicYear(data?.results[0].year)} YYL</p>
        </div> */}
        <MajorSelection
          primaryMajorId={applicationData.primary_major}
          admissionMajorIds={applicationData.admission_major}
          degree={applicationData.degree}
        />
        <PersonalInformation personalInfo={userWithDocuments} />

        <GuardiansInfo
          guardians={guardiansWithDocumentsFilePaths as Guardian[]}
        />
        <InstitutionsInfo
          institutions={institutionsWithCertificatesFilePaths}
        />
        <OlympicsInfo olympics={olympicsWithFilesFilePaths} />
        <DocumentsInfo documents={userDocumentsWithFilePaths} />
      </div>
    </Container>
  );
};

export default ApplicationDetails;