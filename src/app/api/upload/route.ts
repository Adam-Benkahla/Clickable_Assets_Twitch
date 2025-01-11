import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensures compatibility with file handling

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
  }

  // Process the uploaded file (e.g., save it to storage)
  return NextResponse.json({ success: true, message: 'File uploaded successfully.' });
}
