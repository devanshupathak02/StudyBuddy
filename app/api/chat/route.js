import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Check if API key is configured
    if (!apiKey) {
      console.error('Gemini API key is not configured');
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please add it to your .env.local file.' },
        { status: 500 }
      );
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Parse the request body
    const { message } = await req.json();

    if (!message) {
      console.error('No message provided in request');
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 }
      );
    }

    console.log('Sending request to Gemini:', message);

    // Use correct model path
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    const response = await result.response;
    const text = response.text();

    console.log('Received response from Gemini:', text);

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Detailed Chat API Error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: error.message || 'Failed to process chat request',
        details: error.code || error.type
      },
      { status: 500 }
    );
  }
}
