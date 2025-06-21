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
    const { message, file } = await req.json();

    if (!message && !file) {
      console.error('No message or file provided in request');
      return NextResponse.json(
        { error: 'No message or file provided' },
        { status: 400 }
      );
    }

    console.log('Sending request to Gemini with message:', message);

    const userParts = [];

    if (file) {
      // file is a base64 data URL e.g. "data:image/png;base64,iVBORw0KGgo..."
      try {
        const file_parts = file.split(",");
        const mime_type = file_parts[0].match(/:(.*?);/)[1];
        const base64_data = file_parts[1];
    
        userParts.push({
          inline_data: {
            data: base64_data,
            mime_type: mime_type,
          }
        });
      } catch (e) {
        console.error('Invalid file data format', e);
        return NextResponse.json(
          { error: 'Invalid file data format. Please provide a valid base64 data URL.' },
          { status: 400 }
        );
      }
    }

    if (message) {
      userParts.push({ text: message });
    }

    // Enhanced system prompt for better formatting
    const systemPrompt = `You are StudyBuddy AI, a friendly and knowledgeable teaching assistant. Your role is to help students with their studies by providing clear, well-structured, and engaging explanations.

When a user uploads a file (image, PDF, or document), your primary task is to analyze its content and use it to answer the user's request. If the user asks a question about the file, provide a detailed answer based on the information within it. If they ask you to summarize it, provide a concise summary.

IMPORTANT FORMATTING GUIDELINES:
1. Use markdown formatting to make your responses visually appealing and easy to read
2. Use headers (# ## ###) to organize information clearly
3. Use **bold** and *italic* text to emphasize important points
4. Use bullet points (- or *) for lists and steps
5. Use \`code\` for inline code or technical terms
6. Use code blocks with language specification for programming examples:
   \`\`\`javascript
   // Your code here
   \`\`\`
7. Use numbered lists (1. 2. 3.) for step-by-step instructions
8. Break up long responses with clear sections and headers
9. Be conversational and encouraging while maintaining educational value
10. Include relevant examples and analogies when helpful

RESPONSE STYLE:
- Be clear, concise, and engaging
- Use a friendly and encouraging tone
- Provide practical examples when relevant
- Break complex topics into digestible sections
- Use visual formatting to improve readability
- Always aim to help the student understand, not just memorize

Remember: Your responses should be educational, well-formatted, and visually appealing to help students learn effectively.`;

    // Use correct model path
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    // Generate content with enhanced prompt
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand! I'm StudyBuddy AI, ready to help students with clear, well-formatted, and engaging explanations. I'll use markdown formatting, headers, lists, code blocks, and visual elements to make learning easier and more enjoyable. How can I help you today?" }] },
        { role: "user", parts: userParts }
      ],
    });

    const response = await result.response;
    const text = response.text();

    console.log('Received response from Gemini:', text);

    return NextResponse.json({ message: text });
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
