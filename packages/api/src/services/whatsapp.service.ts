import { logger } from '../utils/logger';

interface SendMessageInput {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  body: string;
  templateName?: string;
  templateParams?: string[];
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export const whatsappService = {
  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    const { phoneNumberId, accessToken, to, body, templateName, templateParams } = input;

    // Format phone number (remove any non-numeric characters except +)
    const formattedPhone = to.replace(/[^\d+]/g, '').replace(/^\+/, '');

    try {
      let payload: any;

      if (templateName) {
        // Send template message (for initiating conversations or status updates)
        payload = {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: templateParams
              ? [
                  {
                    type: 'body',
                    parameters: templateParams.map((text) => ({ type: 'text', text })),
                  },
                ]
              : [],
          },
        };
      } else {
        // Send text message (within 24-hour window)
        payload = {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body },
        };
      }

      const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('WhatsApp API error:', data);
        return {
          success: false,
          error: data.error?.message || 'Failed to send message',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (error) {
      logger.error('WhatsApp send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async sendStatusUpdate(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    ticketCode: string,
    status: string,
    shopName: string
  ): Promise<SendMessageResult> {
    const statusMessages: Record<string, string> = {
      CHECKED_IN: `Your device has been checked in and is in our queue.`,
      DIAGNOSING: `Our technician is now diagnosing your device.`,
      WAITING_APPROVAL: `We've completed the diagnosis. Please review and approve the repair estimate.`,
      WAITING_PARTS: `We're waiting for parts to arrive. We'll update you once they're in.`,
      IN_REPAIR: `Good news! The repair is now in progress.`,
      QUALITY_CHECK: `Repair is complete! We're doing final quality checks.`,
      REPAIRED: `Your device has been repaired and tested successfully!`,
      READY_PICKUP: `Great news! Your device is ready for pickup.`,
    };

    const statusMessage = statusMessages[status];
    if (!statusMessage) {
      return { success: false, error: 'No message template for this status' };
    }

    const body = `Hi! Update on your repair (${ticketCode}):\n\n${statusMessage}\n\nReply to this message if you have any questions.\n\n- ${shopName}`;

    return this.sendMessage({
      phoneNumberId,
      accessToken,
      to,
      body,
    });
  },

  async getMessageTemplates(phoneNumberId: string, accessToken: string) {
    try {
      const response = await fetch(
        `${WHATSAPP_API_URL}/${phoneNumberId}/message_templates`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      logger.error('Failed to fetch WhatsApp templates:', error);
      return [];
    }
  },

  async getPhoneNumberInfo(phoneNumberId: string, accessToken: string) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return await response.json();
    } catch (error) {
      logger.error('Failed to fetch phone number info:', error);
      return null;
    }
  },
};
