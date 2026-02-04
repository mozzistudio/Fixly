import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-5-20250929';

// Cost per 1M tokens (approximate, update as needed)
const INPUT_COST_PER_MILLION = 3.0;
const OUTPUT_COST_PER_MILLION = 15.0;

interface DiagnoseInput {
  organizationId: string;
  ticketId: string;
  device: {
    type: string;
    brand: string;
    model: string;
  };
  issueDescription: string;
  attachments: { url: string; type: string }[];
}

interface EstimateInput {
  organizationId: string;
  ticketId: string;
  device: {
    type: string;
    brand: string;
    model: string;
  };
  issueDescription: string;
  aiDiagnosis: string | null;
  inventory: {
    name: string;
    price: number;
    quantity: number;
  }[];
}

interface SummarizeInput {
  organizationId: string;
  ticketId: string;
  ticket: any;
}

interface WhatsAppReplyInput {
  organizationId: string;
  ticketId: string;
  customerName: string;
  ticketCode: string;
  ticketStatus: string;
  deviceInfo?: string;
  conversationHistory: { direction: string; body: string }[];
  latestMessage: string;
  language: string;
}

async function logInteraction(
  organizationId: string,
  ticketId: string | undefined,
  type: 'DIAGNOSIS' | 'ESTIMATE' | 'REPLY' | 'SUMMARIZE' | 'CATEGORIZE',
  prompt: string,
  response: string,
  inputTokens: number,
  outputTokens: number,
  durationMs: number
) {
  const cost =
    (inputTokens * INPUT_COST_PER_MILLION) / 1000000 +
    (outputTokens * OUTPUT_COST_PER_MILLION) / 1000000;

  await prisma.aIInteraction.create({
    data: {
      organizationId,
      ticketId,
      type,
      prompt,
      response,
      model: MODEL,
      inputTokens,
      outputTokens,
      cost,
      durationMs,
    },
  });
}

export const aiService = {
  async diagnose(input: DiagnoseInput) {
    const startTime = Date.now();

    const prompt = `You are a repair shop diagnostic assistant. Analyze the following repair request and provide a structured diagnosis.

**Device:** ${input.device.brand} ${input.device.model} (${input.device.type})
**Customer description:** ${input.issueDescription}
**Photos attached:** ${input.attachments.length} image(s)

Based on this information, provide a diagnosis in the following JSON format:
{
  "diagnosis": "Brief summary of likely issue",
  "confidence": 0.0-1.0,
  "possibleCauses": ["cause1", "cause2"],
  "recommendedRepairs": [
    { "repair": "description", "estimatedTime": "Xh", "priority": "required|recommended|optional" }
  ],
  "requiredParts": [
    { "part": "name", "estimatedCost": X.XX }
  ],
  "riskFactors": ["any warnings or things to check"],
  "estimatedTotalCost": { "min": X, "max": X },
  "estimatedCompletionTime": "Xh-Xh"
}

Respond ONLY with valid JSON, no additional text.`;

    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const durationMs = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      await logInteraction(
        input.organizationId,
        input.ticketId,
        'DIAGNOSIS',
        prompt,
        responseText,
        response.usage.input_tokens,
        response.usage.output_tokens,
        durationMs
      );

      // Parse JSON response
      const diagnosis = JSON.parse(responseText);
      return diagnosis;
    } catch (error) {
      logger.error('AI diagnosis failed:', error);
      throw error;
    }
  },

  async estimate(input: EstimateInput) {
    const startTime = Date.now();

    const inventoryList = input.inventory
      .map((item) => `- ${item.name}: $${item.price} (${item.quantity} in stock)`)
      .join('\n');

    const prompt = `You are a repair shop estimating assistant. Create a cost estimate for the following repair.

**Device:** ${input.device.brand} ${input.device.model} (${input.device.type})
**Issue:** ${input.issueDescription}
${input.aiDiagnosis ? `**AI Diagnosis:** ${input.aiDiagnosis}` : ''}

**Available Parts in Inventory:**
${inventoryList}

Provide a detailed cost estimate in JSON format:
{
  "lineItems": [
    { "type": "labor|part", "description": "...", "quantity": 1, "unitPrice": X.XX, "total": X.XX, "partName": "optional - matching inventory name" }
  ],
  "subtotal": X.XX,
  "estimatedTax": X.XX,
  "total": X.XX,
  "notes": "Any important notes about the estimate",
  "confidence": 0.0-1.0
}

Match parts to inventory when possible. Include labor charges. Respond ONLY with valid JSON.`;

    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const durationMs = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      await logInteraction(
        input.organizationId,
        input.ticketId,
        'ESTIMATE',
        prompt,
        responseText,
        response.usage.input_tokens,
        response.usage.output_tokens,
        durationMs
      );

      return JSON.parse(responseText);
    } catch (error) {
      logger.error('AI estimate failed:', error);
      throw error;
    }
  },

  async summarize(input: SummarizeInput) {
    const startTime = Date.now();

    const notes = input.ticket.notes
      ?.map((n: any) => `[${n.createdAt}] ${n.content}`)
      .join('\n');

    const statusHistory = input.ticket.statusLogs
      ?.map((s: any) => `${s.fromStatus || 'NEW'} → ${s.toStatus} (${s.createdAt})`)
      .join('\n');

    const prompt = `Summarize this repair ticket for a technician handoff. Be concise but comprehensive.

**Ticket:** ${input.ticket.code}
**Device:** ${input.ticket.device.brand} ${input.ticket.device.model}
**Customer:** ${input.ticket.customer.firstName} ${input.ticket.customer.lastName}
**Current Status:** ${input.ticket.status}
**Original Issue:** ${input.ticket.issueDescription}
${input.ticket.aiDiagnosis ? `**AI Diagnosis:** ${input.ticket.aiDiagnosis}` : ''}

**Status History:**
${statusHistory || 'None'}

**Notes:**
${notes || 'None'}

Write a 2-3 paragraph summary covering:
1. What the customer reported and initial findings
2. Work done so far and current status
3. What remains to be done and any important notes

Keep it professional and factual.`;

    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const durationMs = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      await logInteraction(
        input.organizationId,
        input.ticketId,
        'SUMMARIZE',
        prompt,
        responseText,
        response.usage.input_tokens,
        response.usage.output_tokens,
        durationMs
      );

      return responseText;
    } catch (error) {
      logger.error('AI summarize failed:', error);
      throw error;
    }
  },

  async generateWhatsAppReply(input: WhatsAppReplyInput) {
    const startTime = Date.now();

    const history = input.conversationHistory
      .slice(-5)
      .map((m) => `${m.direction === 'INBOUND' ? 'Customer' : 'Shop'}: ${m.body}`)
      .join('\n');

    const prompt = `You are a friendly repair shop assistant composing a WhatsApp message for a customer.

**Customer name:** ${input.customerName}
**Ticket:** ${input.ticketCode} - Status: ${input.ticketStatus}
${input.deviceInfo ? `**Device:** ${input.deviceInfo}` : ''}

**Recent conversation:**
${history || 'No previous messages'}

**Customer's latest message:** ${input.latestMessage}

Write a brief, friendly WhatsApp reply in ${input.language === 'es' ? 'Spanish' : input.language === 'fr' ? 'French' : 'English'}.
- Keep it conversational and warm
- Use 1-2 emojis maximum
- Be helpful and informative
- If asking about status, give a clear update
- Max 3 short paragraphs
- Don't be overly formal

Respond with the message only, no JSON or formatting.`;

    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      const durationMs = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      await logInteraction(
        input.organizationId,
        input.ticketId,
        'REPLY',
        prompt,
        responseText,
        response.usage.input_tokens,
        response.usage.output_tokens,
        durationMs
      );

      return responseText;
    } catch (error) {
      logger.error('AI WhatsApp reply failed:', error);
      throw error;
    }
  },

  async categorize(
    organizationId: string,
    ticketId: string,
    issueDescription: string,
    deviceType: string
  ) {
    const startTime = Date.now();

    const prompt = `Categorize this repair issue and suggest priority.

**Device Type:** ${deviceType}
**Issue Description:** ${issueDescription}

Respond in JSON format:
{
  "category": "screen_damage|battery_issue|charging_port|water_damage|software_issue|camera_issue|speaker_microphone|button_issue|network_connectivity|storage_issue|overheating|other",
  "priority": "low|medium|high|urgent",
  "tags": ["relevant", "tags"],
  "reasoning": "Brief explanation"
}

JSON only.`;

    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      const durationMs = Date.now() - startTime;
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      await logInteraction(
        organizationId,
        ticketId,
        'CATEGORIZE',
        prompt,
        responseText,
        response.usage.input_tokens,
        response.usage.output_tokens,
        durationMs
      );

      return JSON.parse(responseText);
    } catch (error) {
      logger.error('AI categorize failed:', error);
      throw error;
    }
  },
};
