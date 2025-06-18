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

    // Parse the request body
    const { content, subject, difficulty, questionCount } = await req.json();

    if (!content || !subject || !difficulty || !questionCount) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters: content, subject, difficulty, questionCount' },
        { status: 400 }
      );
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Map question count to actual numbers
    const questionCountMap = {
      'minimum': 5,
      'moderate': 10,
      'maximum': 15
    };

    const numberOfQuestions = questionCountMap[questionCount] || 10;

    // Create a comprehensive prompt for quiz generation
    const quizPrompt = `You are an expert quiz generator. Create a quiz based on the provided content with the following specifications:

SUBJECT: ${subject}
DIFFICULTY LEVEL: ${difficulty}
NUMBER OF QUESTIONS: ${numberOfQuestions}

CONTENT TO GENERATE QUESTIONS FROM:
${content}

REQUIREMENTS:
1. Generate exactly ${numberOfQuestions} multiple-choice questions
2. Each question should have 4 options (A, B, C, D)
3. Questions must be directly based on the provided content
4. Difficulty should match the specified level (${difficulty})
5. Include detailed explanations for correct answers
6. Questions should test understanding, not just memorization
7. Make questions engaging and educational

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "sourceContent": "Brief preview of the content used",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct"
    }
  ]
}

IMPORTANT:
- correctAnswer should be 0, 1, 2, or 3 (corresponding to A, B, C, D)
- Questions must be factual and accurate based on the provided content
- Explanations should be educational and help with learning
- Make sure all questions are answerable from the given content
- Vary question types (factual, conceptual, application-based)
- Ensure questions are appropriate for the specified difficulty level

Generate the quiz now:`;

    console.log('Generating quiz with parameters:', { subject, difficulty, questionCount, contentLength: content.length });

    // Use correct model path
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    // Generate quiz content
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: quizPrompt }] }
      ],
    });

    const response = await result.response;
    const text = response.text();

    console.log('Received quiz response from Gemini:', text);

    // Try to parse the JSON response
    let quizData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        quizData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse quiz response from AI' },
        { status: 500 }
      );
    }

    // Validate the quiz structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      console.error('Invalid quiz structure received');
      return NextResponse.json(
        { error: 'Invalid quiz structure received from AI' },
        { status: 500 }
      );
    }

    // Ensure we have the correct number of questions
    if (quizData.questions.length !== numberOfQuestions) {
      console.warn(`Expected ${numberOfQuestions} questions, got ${quizData.questions.length}`);
    }

    return NextResponse.json({ quiz: quizData });
  } catch (error) {
    console.error('Detailed Quiz Generation API Error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate quiz',
        details: error.code || error.type
      },
      { status: 500 }
    );
  }
} 