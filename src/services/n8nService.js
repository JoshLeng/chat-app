// src/services/n8nService.js
export class N8nService {
  static WEBHOOK_URL = 'https://app-chat.app.n8n.cloud/webhook/chat-command';

  static async sendCommandToN8n(commandData) {
    try {
      console.log('🚀 Enviando a n8n:', commandData);
      
      // ⭐ DEBUG DETALLADO DEL JSON
      const requestBody = {
        command: commandData.type,
        action: commandData.action,
        params: commandData.params,
        context: commandData.context,
        timestamp: new Date().toISOString()
      };
      
      console.log('📦 JSON que se enviará:', JSON.stringify(requestBody, null, 2));
      console.log('🔗 URL:', this.WEBHOOK_URL);
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Devuelve el JSON de la respuesta (o ajusta según necesites)
      return await response.json();
    } catch (error) {
      console.error('Error sending command to n8n:', error);
      throw error;
    }
  }
}