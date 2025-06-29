import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export interface PressReleaseGenerationParams {
  companyName: string;
  companyDescription: string;
  eventDescription: string;
  industry: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
}

export interface PressReleaseContent {
  title: string;
  twitterTitle: string;
  summary: string;
  fullContent: string;
}

export async function POST(request: NextRequest) {
  console.log('🔥 API Route: /api/press-release/generate called');
  
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key is missing!');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }
    
    console.log('✅ OpenAI API key found');
    
    // Initialize OpenAI client (only when API is called, not during build)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const params: PressReleaseGenerationParams = await request.json();
    console.log('📝 Received params:', params);

    // Validate required fields
    if (!params.companyName || !params.companyDescription || !params.eventDescription) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: companyName, companyDescription, eventDescription' },
        { status: 400 }
      );
    }

    const prompt = `
      Create a professional press release for the following company and event:
      
      Company: ${params.companyName}
      Company Description: ${params.companyDescription}
      Event/Announcement: ${params.eventDescription}
      Industry: ${params.industry}
      Location: ${params.location}
      Contact: ${params.contactName}, ${params.contactEmail}${params.contactPhone ? `, ${params.contactPhone}` : ''}
      Website: ${params.websiteUrl || 'N/A'}
      
      Please generate:
      1. A compelling title (max 100 characters)
      2. A Twitter-friendly headline (max 80 characters)
      3. A concise summary (max 200 characters)
      4. The full press release content (600-800 words) in a professional format
      
      Format the full content with proper paragraphs, quotes if appropriate, and include:
      - Dateline (Location - Date)
      - Company description paragraph
      - Quote from a company representative
      - Details about the announcement
      - Call to action or forward-looking statement
      - Contact information
      
      Return the results in JSON format with the following keys:
      title, twitterTitle, summary, fullContent
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional PR writer specializing in press releases. Create compelling, newsworthy content that follows industry standards. Always respond with valid JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const responseText = response.choices[0].message.content || '';
    console.log('🤖 Raw OpenAI response:', responseText);
    
    let content;
    try {
      // Try to parse as JSON first
      content = JSON.parse(responseText);
    } catch (jsonError) {
      console.log('⚠️ Response is not valid JSON, attempting to extract JSON...');
      
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          content = JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.error('❌ Failed to extract JSON from response');
          throw new Error('OpenAI response is not valid JSON');
        }
      } else {
        // If no JSON found, create a structured response from the text
        console.log('📝 Creating structured response from text...');
        content = {
          title: `${params.companyName} Announces ${params.eventDescription.substring(0, 50)}...`,
          twitterTitle: `${params.companyName} News: ${params.eventDescription.substring(0, 40)}...`,
          summary: params.eventDescription.substring(0, 200),
          fullContent: responseText
        };
      }
    }
    
    const result: PressReleaseContent = {
      title: content.title || `${params.companyName} Announces Major Development`,
      twitterTitle: content.twitterTitle || `${params.companyName} News Update`,
      summary: content.summary || params.eventDescription.substring(0, 200),
      fullContent: content.fullContent || responseText
    };

    console.log('✅ Successfully generated press release content');
    return NextResponse.json(result);
  } catch (error) {
    console.error('💥 Error generating press release content:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: `Failed to generate press release content: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 