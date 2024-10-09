import { NextResponse } from 'next/server';
import axios from 'axios';

// Define a type for the OperationOutcome issue
interface OperationOutcomeIssue {
  severity: string;
  code: string;
  diagnostics?: string;
}

// POST handler for creating a new Observation in the FHIR server
export async function POST(request: Request) {
  try {
    // Capture raw text from the request body
    const rawBody = await request.text();
    // Parse the raw body into JSON
    const parsedBody = JSON.parse(rawBody);

    // Manually extract accessToken from headers
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    if (!parsedBody || !parsedBody.code || !parsedBody.effectiveDateTime || !parsedBody.encounter || !parsedBody.valueQuantity) {
      return NextResponse.json({ error: 'Invalid observation data. Required fields: code, effectiveDateTime, encounter, valueQuantity' }, { status: 400 });
    }

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

    // Make the POST request to the FHIR server to create the observation
    const postResponse = await axios.post(
      `${fhirServerUrl}/Observation`,
      parsedBody,
      { headers, validateStatus: () => true }
    );

    // Handle different response cases
    if (postResponse.status >= 200 && postResponse.status < 300) {
      // Successful post, check for 'Location' header
      const location = postResponse.headers['location'];
      const newObservationId = location ? location.split('/').pop() : null;

      // Return the success response with the new observation ID
      return NextResponse.json(
        { id: newObservationId, ...postResponse.data },
        { status: postResponse.status }
      );
    } else if (postResponse.data.resourceType === "OperationOutcome") {
      // Handle OperationOutcome errors from the FHIR server
      const issues = (postResponse.data.issue as OperationOutcomeIssue[])
        .map((issue) => issue.diagnostics || "No diagnostics provided")
        .join(", ");
      return NextResponse.json({ error: `FHIR server error: ${issues}` }, { status: postResponse.status });
    } else {
      // Return a generic error for unsuccessful post responses
      return NextResponse.json(
        { error: `Unexpected error from FHIR server: ${postResponse.statusText}` },
        { status: postResponse.status }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check if the error is from the axios request
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json({ error: error.response.data }, { status: error.response.status });
    }

    // Return a generic error response if the error is not from axios
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
