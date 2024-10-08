"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Box, Grid } from '@mui/material';

interface PatientObservationFormProps {
  accessToken: string;
  patientId: string;
}

const PatientObservationForm: React.FC<PatientObservationFormProps> = ({ accessToken, patientId }) => {
  const formatDateTime = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    code: '8480-6', // Default LOINC code
    effectiveDateTime: formatDateTime(new Date()), // Default current date and time
    encounter: 'eqIW.btUCgttCU2sVCsBmIg3', // Default encounter ID
    value: '120', // Default value
  });

  const [responseMessage, setResponseMessage] = useState<string | null>(null); // State for response message
  const [newObservationId, setNewObservationId] = useState<string | null>(null); // State for new observation ID

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      resourceType: 'Observation',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: formData.code,
          },
        ],
      },
      effectiveDateTime: formData.effectiveDateTime.replace(' ', 'T') + ':00Z', // Convert to ISO format
      encounter: { reference: `Encounter/${formData.encounter}` },
      issued: new Date().toISOString(),
      status: 'final',
      subject: { reference: `Patient/${patientId}` },
      valueQuantity: {
        value: formData.value,
        system: 'http://unitsofmeasure.org',
        code: 'mm[Hg]',
      },
    };

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/fhir+json',
    };

    try {
      const response = await axios.post(`/api/observation/create`, payload, { headers });
      const newObservationId = response.data.id;
      setNewObservationId(newObservationId);
      setResponseMessage(`Success: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setResponseMessage(`Error: ${error.response.status} ${error.response.statusText}`);
      } else {
        setResponseMessage('Error: An unknown error occurred');
      }
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Observations
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Code (LOINC)"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date and Time of Observation"
              name="effectiveDateTime"
              value={formData.effectiveDateTime}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Format: YYYY-MM-DD HH:mm"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Encounter ID"
              name="encounter"
              value={formData.encounter}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Patient ID"
              name="subject"
              value={patientId}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Value"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              required
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Box mt={2}>
          <Button variant="contained" color="primary" type="submit">
            Submit Observation
          </Button>
        </Box>
      </form>

      {/* Response Message */}
      {responseMessage && (
        <Box mt={2}>
          <Typography variant="body1" color={responseMessage.startsWith('Success') ? 'green' : 'red'}>
            {responseMessage}
          </Typography>

          {newObservationId && (
            <Typography
              variant="body2"
              color="textPrimary"
              sx={{
                wordBreak: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
              }}
            >
              New Observation ID: {newObservationId}
            </Typography>
          )}

          {responseMessage.startsWith('Success') && (
            <Typography
              variant="body2"
              color="textPrimary"
              sx={{
                wordBreak: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
              }}
            >
              Access Token: {accessToken}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PatientObservationForm;




// "use client";

// import React, { useState } from 'react';
// import axios from 'axios';
// import { TextField, Button, Typography, Box} from '@mui/material';
// import Grid2 from '@mui/material/Grid2';
// //import Grid2 from '@mui/material/Unstable_Grid2';
// // Import Grid2 from Material UI

// interface PatientObservationFormProps {
//   accessToken: string;
//   patientId: string;
// }

// const PatientObservationForm: React.FC<PatientObservationFormProps> = ({ accessToken, patientId }) => {
//   const [formData, setFormData] = useState({
//     code: '8480-6', // Default LOINC code
//     effectiveDateTime: new Date().toISOString().slice(0, 16), // Default current date and time
//     encounter: 'eqIW.btUCgttCU2sVCsBmIg3', // Default encounter ID
//     value: '120', // Default value
//   });

//   const [responseMessage, setResponseMessage] = useState<string | null>(null); // State for response message
//   const [newObservationId, setNewObservationId] = useState<string | null>(null); // State for new observation ID

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const payload = {
//       resourceType: 'Observation',
//       category: [
//         {
//           coding: [
//             {
//               system: 'http://terminology.hl7.org/CodeSystem/observation-category',
//               code: 'vital-signs',
//               display: 'Vital Signs',
//             },
//           ],
//         },
//       ],
//       code: {
//         coding: [
//           {
//             system: 'http://loinc.org',
//             code: formData.code,
//           },
//         ],
//       },
//       effectiveDateTime: formData.effectiveDateTime,
//       encounter: { reference: `Encounter/${formData.encounter}` },
//       issued: new Date().toISOString(),
//       status: 'final',
//       subject: { reference: `Patient/${patientId}` },
//       valueQuantity: {
//         value: formData.value,
//         system: 'http://unitsofmeasure.org',
//         code: 'mm[Hg]',
//       },
//     };

//     const headers = {
//       Authorization: `Bearer ${accessToken}`,
//       'Content-Type': 'application/fhir+json',
//     };
//     try {
//       const response = await axios.post(`/api/observation/create`, payload, { headers });
//       console.log("Full Response:", response.data); // Log the full response
    
//       const newObservationId = response.data.id; // Get the ID directly from the response data
//       setNewObservationId(newObservationId); // Save the observation ID
//       console.log("New Observation ID:", newObservationId); // Debug log for observation ID
    
//       setResponseMessage(`Success: ${response.status} ${response.statusText}`);
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//         setResponseMessage(`Error: ${error.response.status} ${error.response.statusText}`);
//       } else {
//         setResponseMessage('Error: An unknown error occurred');
//       }
//     }
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       {/* Header */}
//       <Typography variant="h4" component="h1" gutterBottom>
//         Observations
//       </Typography>

//       <form onSubmit={handleSubmit}>
//         <Grid2 container spacing={2}> {/* Replaced Grid with Grid2 */}
//           <Grid2 xs={12} sm={6}> {/* Updated Grid to Grid2 */}
//             <TextField
//               fullWidth
//               label="Code (LOINC)"
//               name="code"
//               value={formData.code}
//               onChange={handleInputChange}
//               required
//               variant="outlined"
//             />
//           </Grid2>

//           <Grid2 xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="Date and Time of Observation"
//               type="datetime-local"
//               name="effectiveDateTime"
//               value={formData.effectiveDateTime}
//               onChange={handleInputChange}
//               required
//               InputLabelProps={{
//                 shrink: true,
//               }}
//               variant="outlined"
//             />
//           </Grid2>

//           <Grid2 xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="Encounter ID"
//               name="encounter"
//               value={formData.encounter}
//               onChange={handleInputChange}
//               required
//               variant="outlined"
//             />
//           </Grid2>

//           <Grid2 xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="Patient ID"
//               name="subject"
//               value={patientId}
//               InputProps={{
//                 readOnly: true,
//               }}
//               variant="outlined"
//             />
//           </Grid2>

//           <Grid2 xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="Value"
//               name="value"
//               value={formData.value}
//               onChange={handleInputChange}
//               required
//               variant="outlined"
//             />
//           </Grid2>
//         </Grid2>

//         <Box mt={2}>
//           <Button variant="contained" color="primary" type="submit">
//             Submit Observation
//           </Button>
//         </Box>
//       </form>

//       {/* Response Message */}
//       {responseMessage && (
//         <Box mt={2}>
//           <Typography variant="body1" color={responseMessage.startsWith('Success') ? 'green' : 'red'}>
//             {responseMessage}
//           </Typography>
//           {/* Display new observation ID */}
//           {newObservationId && (
//             <Typography
//               variant="body2"
//               color="textPrimary"
//               sx={{
//                 wordBreak: 'break-word',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 whiteSpace: 'normal',
//               }}
//             >
//               New Observation ID: {newObservationId}
//             </Typography>
//           )}
//           {responseMessage.startsWith('Success') && (
//             <Typography
//               variant="body2"
//               color="textPrimary"
//               sx={{
//                 wordBreak: 'break-word',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 whiteSpace: 'normal',
//               }}
//             >
//               Access Token: {accessToken}
//             </Typography>
//           )}
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default PatientObservationForm;



