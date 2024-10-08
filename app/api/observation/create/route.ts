import { NextResponse } from 'next/server';
import axios from 'axios';

console.log('observation/create/route POST begins');

// POST handler for creating a new Observation in the FHIR server
export async function POST(request: Request) {
  try {
    // Log the raw body content before parsing
    const rawBody = await request.text();  // Capture raw text from the request body
    console.log('Raw request body:', rawBody);

    // Parse the raw body into JSON
    const parsedBody = JSON.parse(rawBody);  // Parse the request body as JSON
    console.log('Parsed Body:', parsedBody);

    // Manually extract accessToken from headers (if present in headers) or elsewhere
    const accessToken = request.headers.get('Authorization')?.split(' ')[1]; // Extract token from the Authorization header
    console.log('accessToken:', accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    if (!parsedBody || !parsedBody.code || !parsedBody.effectiveDateTime || !parsedBody.encounter || !parsedBody.valueQuantity) {
      return NextResponse.json({ error: 'Invalid observation data...' }, { status: 400 });
    }

    console.log('**Validation passed, preparing to send to FHIR server');

    // Prepare the FHIR server URL
    const fhirServerUrl = process.env.NEXT_PUBLIC_FHIR_SERVER;

    if (!fhirServerUrl) {
      throw new Error('FHIR server URL not set in environment variables');
    }

    // Set headers with the extracted accessToken
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/fhir+json',
    };

    // Log payload and headers for debugging purposes
    console.log('Payload:', JSON.stringify(parsedBody, null, 2));
    console.log('Headers:', headers);

    // Make the POST request to the FHIR server to create the observation
    const postResponse = await axios.post(
      `${fhirServerUrl}/Observation`,  // FHIR server URL for Observation resource
      parsedBody,  // The observation data
      { headers, validateStatus: () => true }
    );

    // Log the response data from the POST request
    console.log('>>FHIR server POST response:', postResponse.data);
    console.log(">>postResponse.headers['location']:", postResponse.headers['location']);

    // Fetch the new observation if 'Location' header is missing
    if (!postResponse.headers['location']) {
      console.log('Location header missing, fetching latest observation manually...');

      // Fetch the latest observation based on encounter, code, and effectiveDateTime
      const searchResponse = await axios.get(
        `${fhirServerUrl}/Observation`,
        {
          headers,
          params: {
            encounter: parsedBody.encounter,
            code: parsedBody.code.coding[0].code,
            'date': parsedBody.effectiveDateTime,
            _sort: '-date', // Sort by the most recent
            _count: 1,      // Limit to 1 result
          },
        }
      );

      // Log the search response for debugging
      console.log('FHIR server search response:', searchResponse.data);

      // Ensure at least one observation was returned
      const latestObservation = searchResponse.data.entry?.[0]?.resource;
      if (latestObservation) {
        console.log('Latest observation found:', latestObservation);
        // Return the newly created observation
        return NextResponse.json(latestObservation, { status: 201 });
      } else {
        console.error('No matching observation found in search response');
        return NextResponse.json({ error: 'No matching observation found' }, { status: 404 });
      }
    } else {
      // If 'Location' header is present, extract the observation ID from it
      const location = postResponse.headers['location'];
      const newObservationId = location ? location.split('/').pop() : null; // Extract ID from Location header
      console.log('New Observation ID:', newObservationId); // Debug log for observation ID

      // Return a response including the new observation ID and data
      return NextResponse.json({ id: newObservationId, ...postResponse.data }, { status: 201 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error creating or fetching observation:', errorMessage);

    // Check if the error is from the axios request
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
      return NextResponse.json({ error: error.response.data }, { status: error.response.status });
    }

    // Return a generic error response if the error is not from axios
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
