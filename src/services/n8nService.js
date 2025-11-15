export class N8nService {
  static WEBHOOK_URL = 'https://app-chat.app.n8n.cloud/webhook/chat-command';

  static async sendCommandToN8n(commandData) {
    try {
      console.log('🚀 Enviando a n8n:', commandData);
      
      // ⭐ ADAPTAR PARÁMETROS SEGÚN EL TIPO DE COMANDO
      let params = {};
      
      switch(commandData.type) {
        case 'email':
          params = {
            destinatario: commandData.params.destinatario,
            titulo: commandData.params.titulo,
            cuerpo: commandData.params.cuerpo || commandData.params.titulo // fallback
          };
          break;
          
        case 'calendar':
          params = {
            titulo: commandData.params.titulo,
            fecha: commandData.params.fecha || 'hoy', // fallback
            hora: commandData.params.hora || '12:00'  // fallback
          };
          break;
          
        case 'task':
          params = {
            titulo: commandData.params.titulo,
            descripcion: commandData.params.descripcion || commandData.params.titulo, // fallback
            prioridad: commandData.params.prioridad || 'media' // fallback
          };
          break;
      }
      
      // ⭐ SOLO ENVIAR COMMAND Y PARAMS (como en Insomnia)
      const requestBody = {
        command: commandData.type,
        params: params
      };
      
      console.log('📦 JSON que se enviará:', JSON.stringify(requestBody, null, 2));
      console.log('🔗 URL:', this.WEBHOOK_URL);
      
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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