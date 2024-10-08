import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: Request, { params }: { params: { patientId: string } }) {
  const { patientId } = params; // Extracting the patientId from the parameters
  const accessToken = req.headers.get('Authorization')?.split(' ')[1];

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
  }

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_FHIR_SERVER}/Patient/${patientId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching patient data:', error);
    return NextResponse.json({ error: 'Error fetching patient data' }, { status: 500 });
  }
}



