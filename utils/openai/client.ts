export interface ScheduledRelease {
  date: string;
  timezone: string;
}

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
  scheduledRelease?: ScheduledRelease | null;
}

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

export interface PressReleaseSubmission {
  title: string;
  content: string;
  summary: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  industry: string;
  location: string;
  scheduledDate?: Date;
}

export interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  confirmationUrl?: string;
  error?: string;
  screenshots?: string[];
}

export interface PurchaseResult {
  success: boolean;
  orderId?: string;
  error?: string;
  accessCredentials?: {
    username?: string;
    password?: string;
    submissionUrl?: string;
  };
}

export interface FullSubmissionResult {
  purchase: PurchaseResult;
  submission: SubmissionResult;
}

/**
 * Generate press release content using OpenAI via API route
 */
export async function generatePressReleaseContent(
  params: PressReleaseGenerationParams
): Promise<PressReleaseContent> {
  try {
    console.log('🚀 Sending request to API with params:', params);
    
    const response = await fetch('/api/press-release/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    console.log('📡 API response status:', response.status);
    console.log('📡 API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const content: PressReleaseContent = await response.json();
    console.log('✅ API response data:', content);
    return content;
  } catch (error) {
    console.error('💥 Error generating press release content:', error);
    throw new Error('Failed to generate press release content');
  }
}

/**
 * Validate press release content against EINNewswire guidelines via API route
 */
export async function validatePressReleaseContent(
  content: PressReleaseContent
): Promise<ValidationResult> {
  try {
    const response = await fetch('/api/press-release/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to validate press release content');
    }

    const result: ValidationResult = await response.json();
    return result;
  } catch (error) {
    console.error('Error validating press release content:', error);
    throw new Error('Failed to validate press release content');
  }
}

/**
 * Submit press release to EINPresswire via automation API route
 */
export async function submitPressRelease(
  pressRelease: PressReleaseSubmission,
  packageType: 'basic' | 'premium' | 'enterprise' = 'basic',
  testMode: boolean = false,
  demoMode: boolean = false
): Promise<FullSubmissionResult> {
  try {
    console.log('🚀 Submitting press release via automation...', { pressRelease, packageType, testMode, demoMode });
    
    const response = await fetch('/api/press-release/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pressRelease, packageType, testMode: false, demoMode: false }),
    });

    console.log('📡 Submission API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Submission API error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
    }

    const result: FullSubmissionResult = await response.json();
    console.log('✅ Submission completed:', result);
    return result;
  } catch (error) {
    console.error('💥 Error submitting press release:', error);
    throw new Error('Failed to submit press release');
  }
}

/**
 * Helper function to convert PressReleaseContent to PressReleaseSubmission
 */
export function contentToSubmission(
  content: PressReleaseContent,
  params: PressReleaseGenerationParams
): PressReleaseSubmission {
  let scheduledDate: Date | undefined;
  
  if (params.scheduledRelease) {
    scheduledDate = new Date(params.scheduledRelease.date);
  }
  
  return {
    title: content.title,
    content: content.fullContent,
    summary: content.summary,
    companyName: params.companyName,
    contactName: params.contactName,
    contactEmail: params.contactEmail,
    contactPhone: params.contactPhone,
    websiteUrl: params.websiteUrl,
    industry: params.industry,
    location: params.location,
    scheduledDate
  };
}


