"use client"; // Ensure this is a client component

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from '@mui/material'; // Material UI components
import PatientObservationForm from '../../components/PatientObservationForm';

const PatientPage = ({ params }: { params: { patientId: string } }) => {
  const [patientData, setPatientData] = useState<{
    name: { text: string }[];
    id: string;
    birthDate: string;
    address: { text: string }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const accessToken = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('accessToken') || '' // Provide a fallback
    : '';

  useEffect(() => {
    if (!accessToken) {
      console.error('Access token not found');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/patient/${params.patientId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setPatientData(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error fetching patient data:', error.response?.data);
        } else {
          console.error('An unexpected error occurred:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.patientId, accessToken]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading patient data...
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: 'white', // Ensure the background is white
        minHeight: '100vh',
        color: 'black', // Ensure text color is black
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Patient Information
      </Typography>

      {patientData ? (
        <Grid container spacing={4} direction="column" alignItems="flex-start">
          {/* Patient Information Table */}
          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ backgroundColor: 'white', maxWidth: '500px' }}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">Name:</Typography>
                    </TableCell>
                    <TableCell>{patientData.name?.[0]?.text || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">ID:</Typography>
                    </TableCell>
                    <TableCell>{patientData.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">Date of Birth:</Typography>
                    </TableCell>
                    <TableCell>{patientData.birthDate || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">Address:</Typography>
                    </TableCell>
                    <TableCell>{patientData.address?.[0]?.text || 'N/A'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Patient Observation Form - Below the table, aligned left */}
          <Grid item xs={12} sx={{ width: '100%', maxWidth: '500px' }}>
            <PatientObservationForm patientId={params.patientId} accessToken={accessToken} />
          </Grid>
        </Grid>
      ) : (
        <Typography>No patient data found.</Typography>
      )}
    </Box>
  );
};

export default PatientPage;
