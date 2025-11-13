// src/services/n8nService.js
export class N8nService {
  static WEBHOOK_URL = 'https://app-chat.app.n8n.cloud/webhook/chat-command';

  static async sendCommandToN8n(commandData) {
    try {
      console.log('🚀 Enviando a n8n:', commandData);
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: commandData.type,
          action: commandData.action,
          params: commandData.params,
          context: commandData.context,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Error n8n: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Respuesta n8n:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error enviando a n8n:', error);
      throw new Error(`No se pudo procesar el comando: ${error.message}`);
    }
  }
}