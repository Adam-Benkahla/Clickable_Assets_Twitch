import fs from 'node:fs';
import path from 'node:path';

import formidable from 'formidable';
import { NextResponse } from 'next/server';

// Ensure your server is configured to handle file uploads
export const config = {
  api: {
    bodyParser: false, // Disable bodyParser so we can handle the file upload manually
  },
};

// Handle file upload
export async function POST(req: Request) {
  const form = new formidable.IncomingForm();
  form.uploadDir = './public/uploads'; // Folder to store the uploaded files
  form.keepExtensions = true; // Keep file extensions

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(new Error('Error parsing the form data.'));
      }

      // Ensure the directory exists
      const uploadDir = './public/uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save the file URL to the database
      const filePath = files.file[0]?.filepath || '';
      if (!filePath) {
        return resolve(new NextResponse('File upload failed', { status: 400 }));
      }

      // Return the file URL to be used in the frontend
      const fileUrl = `/uploads/${path.basename(filePath)}`;
      return resolve(
        new NextResponse(JSON.stringify({ success: true, fileUrl }), {
          status: 200,
        }),
      );
    });
  });
}
