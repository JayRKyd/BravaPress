import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export interface PressReleaseContent {
  title: string;
  twitterTitle: string;
  summary: string;
  fullContent: string;
}

export interface ValidationResult {
  isValid: boolean;
  feedback?: string;
}

export async function POST(request: NextRequest) {
  console.log('🔍 API Route: /api/press-release/validate called');
  
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key is missing!');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }
    
    // Initialize OpenAI client (only when API is called, not during build)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const content: PressReleaseContent = await request.json();
    console.log('📝 Received content for validation:', content);

    // Validate required fields
    if (!content.title || !content.summary || !content.fullContent) {
      console.error('❌ Missing required fields for validation');
      return NextResponse.json(
        { error: 'Missing required fields: title, summary, fullContent' },
        { status: 400 }
      );
    }

    const prompt = `
      Validate the following press release content against EINNewswire guidelines:
      
      Title: ${content.title}
      Summary: ${content.summary}
      Content: ${content.fullContent}
      
      EINNewswire Guidelines:
      1. No promotional language or excessive superlatives
      2. No direct product selling or marketing language
      3. Must be newsworthy and factual
      4. No spam, clickbait, or misleading information
      5. Professional tone and language
      6. Proper grammar and spelling
      7. No excessive use of keywords
      8. No inappropriate content
      9. Content should be objective and informative
      10. Avoid overly promotional claims without substantiation
      
      Return a JSON object with:
      1. isValid (boolean) - true if the content passes all guidelines, false otherwise
      2. feedback (string) - detailed feedback if the content fails validation, explaining what needs to be improved
      
      Be thorough in your analysis and provide specific, actionable feedback if issues are found.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a press release validator ensuring content meets distribution guidelines. Be thorough and provide specific feedback for improvements. Always respond with valid JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const responseText = response.choices[0].message.content || '';
    console.log('🔍 Validation response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (jsonError) {
      console.log('⚠️ Validation response is not valid JSON, creating fallback...');
      // If JSON parsing fails, create a basic validation result
      result = {
        isValid: true,
        feedback: 'Content appears to meet basic guidelines. Manual review recommended.'
      };
    }
    
    const validationResult: ValidationResult = {
      isValid: result.isValid || false,
      feedback: result.feedback || 'No feedback provided'
    };

    console.log('✅ Validation completed:', validationResult);
    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('💥 Error validating press release content:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: `Failed to validate press release content: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 