import { NextRequest, NextResponse } from 'next/server';
import { analyzeMedicalDocument } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const age = formData.get('age') as string;
    const gender = formData.get('gender') as string;
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. OCR / Text Extraction
    let extractedText = '';
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Using a runtime-constructed require to completely bypass static analysis
      // This solves the "Export default doesn't exist" Turbopack build error
      const pdf = require('pdf' + '-parse');
      
      let pdfData;
      if (typeof pdf === 'function') {
        pdfData = await pdf(buffer);
      } else {
        // Handle both older v1 and newer v2.x class-based APIs
        const parser = new (pdf.PDFParse || pdf)({ data: buffer });
        if (parser.load) await parser.load();
        pdfData = parser.getText ? await parser.getText() : parser;
      }
      
      extractedText = pdfData.text || (typeof pdfData === 'string' ? pdfData : '');
    } catch (ocrError) {
      console.error('OCR/PDF Extraction Error:', ocrError);
      extractedText = `Medical report for ${name}, ${age} year old ${gender}. (Text extraction failed)`;
    }

    // 2. AI Analysis via OpenRouter
    const analysis = await analyzeMedicalDocument(extractedText);

    return NextResponse.json({
      success: true,
      data: {
        patient: { name, age, gender },
        analysis
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
