// app/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material'; // Material UI components
import Image from 'next/image'; // Next.js image component
import Link from 'next/link'; // Next.js link component
import PatientObservationForm from './components/PatientObservationForm';
import './styles/HomePage.css'; // Import HomePage styles

const Page: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const patientId = urlParams.get('patientId');

    if (accessToken && patientId) {
      setAccessToken(accessToken);
      setPatientId(patientId);
    }
  }, []);

  const handleSignIn = () => {
    const authorizeUrl = `${process.env.NEXT_PUBLIC_FHIR_SERVER_A}/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=http://localhost:3000/api/auth/callback&scope=openid%20patient.read%20patient/Observation.c`;
    window.location.href = authorizeUrl;
  };

  return (
    <Container>
      {/* Logo Section */}
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Image src="/apottilabs.png" alt="Apotti Labs Logo" width={200} height={100} />
      </Box>

      {/* Welcome Section */}
      <Typography 
        variant="h4" 
        align="center" 
        gutterBottom 
        sx={{ color: '#333' }} // Darker text color for visibility
      >
        Welcome to Apotti Patient Standalone Create Observations
      </Typography>

      {/* Sign In Section */}
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSignIn}
          sx={{ padding: '10px 20px' }}
        >
          Sign In
        </Button>
      </Box>

      {/* Display Patient Data and Observation Form if Signed In */}
      {accessToken && patientId ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6">Patient ID: {patientId}</Typography>

          {/* Link to Patient Data */}
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              component={Link} 
              href={`/patient/${patientId}?accessToken=${accessToken}`}
            >
              View Patient Data
            </Button>
          </Box>

          {/* Observation Form */}
          <Box sx={{ mt: 4 }}>
            <PatientObservationForm accessToken={accessToken} patientId={patientId} />
          </Box>
        </Box>
      ) : (
        <Typography 
          variant="body1" 
          align="center" 
          sx={{ mt: 4, color: '#333' }} // Darker text color for visibility
        >
          Please sign in to access your data.
        </Typography>
      )}
    </Container>
  );
};

export default Page;




// // app/page.tsx
// "use client";

// import './styles/HomePage.css'; // Import HomePage styles
// import React, { useEffect, useState } from 'react';
// import PatientObservationForm from './components/PatientObservationForm';
// import Image from 'next/image';
// import Link from 'next/link';

// console.log('inside page.tsx');

// const Page: React.FC = () => {
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [patientId, setPatientId] = useState<string | null>(null);

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const accessToken = urlParams.get('accessToken');
//     const patientId = urlParams.get('patientId');

//     if (accessToken && patientId) {
//       setAccessToken(accessToken);
//       setPatientId(patientId);
//     }
//   }, []);

//   const handleSignIn = () => {
//     const authorizeUrl = `${process.env.NEXT_PUBLIC_FHIR_SERVER_A}/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=http://localhost:3000/api/auth/callback&scope=openid%20patient.read%20patient/Observation.c`;
//     //const authorizeUrl = `${process.env.NEXT_PUBLIC_FHIR_SERVER_A}/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=http://localhost:3000/api/auth/callback&scope=openid%20patient.read%20patient/Observation.c%20fhirUser`;
  
//     window.location.href = authorizeUrl;
//   };
  
  
//   return (
//     <div>
//       <div className="container">
//         {/* Image on top of the welcome screen */}
//         <div className="image-container">
//           <Image src="/apottilabs.png" alt="Apotti Labs Logo" width={200} height={100} />
//         </div>

//         <h1>Welcome to Apotti Patient Standalone Create Observations</h1>
//         <button className="sign-in-button" onClick={handleSignIn}>Sign In</button>

//         {accessToken && patientId ? (
//           <div>
//             <h2>Patient ID: {patientId}</h2>
//             {/* Update link to point to the correct patient page */}
//             <Link href={`/patient/${patientId}?accessToken=${accessToken}`}>
//               View Patient Data
//             </Link>
//             {/* Render the observation form or other components here */}
//             <PatientObservationForm accessToken={accessToken} patientId={patientId} />
//           </div>
//         ) : (
//           <div className="sign-in-message">
//     Please sign in to access your data.
// </div>

//         )}
//       </div>
//     </div>
//   );
// };

// export default Page;
