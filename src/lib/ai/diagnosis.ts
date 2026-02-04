import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DiagnosisInput {
  category: string;
  description: string;
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  symptoms?: string[];
}

export interface DiagnosisResult {
  diagnosis: string;
  possibleCauses: string[];
  recommendedActions: string[];
  estimatedCostRange: {
    min: number;
    max: number;
  };
  urgencyLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  confidence: number;
  diyPossible: boolean;
  diyInstructions?: string;
  warningNotes?: string[];
}

export async function generateRepairDiagnosis(input: DiagnosisInput): Promise<DiagnosisResult> {
  const prompt = buildDiagnosisPrompt(input);

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an expert repair technician AI assistant for Fixly, an AI-powered repair shop platform.
Your job is to analyze repair requests and provide accurate diagnoses, cost estimates, and recommendations.
Always respond with valid JSON matching the specified format.
Be helpful but also honest about limitations and when professional help is needed.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return JSON.parse(content) as DiagnosisResult;
}

function buildDiagnosisPrompt(input: DiagnosisInput): string {
  let prompt = `Analyze this repair request and provide a diagnosis:

Category: ${input.category}
Description: ${input.description}`;

  if (input.deviceType) {
    prompt += `\nDevice Type: ${input.deviceType}`;
  }
  if (input.deviceBrand) {
    prompt += `\nBrand: ${input.deviceBrand}`;
  }
  if (input.deviceModel) {
    prompt += `\nModel: ${input.deviceModel}`;
  }
  if (input.symptoms && input.symptoms.length > 0) {
    prompt += `\nSymptoms: ${input.symptoms.join(', ')}`;
  }

  prompt += `

Respond with a JSON object containing:
{
  "diagnosis": "Clear explanation of the likely issue",
  "possibleCauses": ["Array of possible root causes"],
  "recommendedActions": ["Array of recommended steps to fix"],
  "estimatedCostRange": { "min": number, "max": number },
  "urgencyLevel": "LOW" | "NORMAL" | "HIGH" | "EMERGENCY",
  "confidence": 0.0 to 1.0,
  "diyPossible": boolean,
  "diyInstructions": "If DIY is possible, provide safe instructions",
  "warningNotes": ["Any safety warnings or important notes"]
}`;

  return prompt;
}

export async function generateChatResponse(
  repairContext: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a helpful repair assistant for Fixly.
Context about the current repair request: ${repairContext}

Help the user with questions about their repair, provide guidance, and collect additional information if needed.
Be friendly, professional, and concise.`,
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: userMessage,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
}

export async function suggestRepairShops(
  diagnosis: DiagnosisResult,
  category: string,
  location?: { latitude: number; longitude: number }
): Promise<{
  criteria: string[];
  searchTerms: string[];
}> {
  const prompt = `Based on this repair diagnosis, suggest what to look for in a repair shop:

Diagnosis: ${diagnosis.diagnosis}
Category: ${category}
Estimated Cost: $${diagnosis.estimatedCostRange.min} - $${diagnosis.estimatedCostRange.max}
Urgency: ${diagnosis.urgencyLevel}

Respond with JSON:
{
  "criteria": ["Array of criteria to look for in a repair shop"],
  "searchTerms": ["Relevant search terms to find appropriate shops"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'You are a helpful assistant for finding repair services.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return { criteria: [], searchTerms: [] };
  }

  return JSON.parse(content);
}
