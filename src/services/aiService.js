    // src/services/aiService.js
    import { GoogleGenerativeAI } from '@google/generative-ai';

    const GEMINI_API_KEY = 'AIzaSyA4xAf0WRJj7_jhD0kKk5d7moQYuZbWHhg';

    export class AIService {
      static genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      
      static modelosPrioritarios = [
   
        'gemini-2.0-flash-lite-preview',           
        'gemini-2.0-flash-lite-preview-02-05',     
        
      
        'gemini-2.5-flash',                        
        'gemini-2.5-flash-preview-05-20',        
        
        
        'gemini-2.0-flash-thinking-exp',         
        'gemini-2.0-flash-thinking-exp-01-21',     
        
      
        'gemini-2.0-pro-exp',                      
        'gemini-exp-1206',                         
      ];

      static async procesarPrompt(prompt) {
        let ultimoError = null;
        
        // Probar modelos en orden de prioridad
        for (const modelo of this.modelosPrioritarios) {
          try {
            console.log(`🔮 Probando: ${modelo}`);
            
            const respuesta = await this.probarModeloEspecifico(modelo, prompt);
            console.log(`✅ Éxito con: ${modelo}`);
            return respuesta;
            
          } catch (error) {
            console.log(`❌ Falló ${modelo}:`, error.message);
            ultimoError = error;
            
            // Si es error de quota, continuar con siguiente modelo
            if (error.message.includes('quota') || error.message.includes('429')) {
              continue;
            }
            
            // Si es otro error, continuar igual
            continue;
          }
        }
        
        // Si todos fallan
        return this.mensajeErrorFinal(ultimoError);
      }

      static async probarModeloEspecifico(modelo, prompt) {
  try {
    const model = this.genAI.getGenerativeModel({ 
      model: modelo,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const texto = response.text();
    
    // ✅ VALIDAR QUE LA RESPUESTA NO ESTÉ VACÍA
    if (!texto || texto.trim() === '') {
      throw new Error('Respuesta vacía recibida de Gemini');
    }
    
    return texto;
    
  } catch (error) {
    console.error(`❌ Error con modelo ${modelo}:`, error);
    throw error;
  }
}
      static mensajeErrorFinal(error) {
        const mensajeBase = `🤖 **Asistente IA - Límites Alcanzados**

    He intentado todos los modelos disponibles pero todos han alcanzado sus límites gratuitos.

    *Los modelos más económicos probados:*
    ⚡ **Gemini 2.0 Flash-Lite** (más económico)
    ⚡ **Gemini 2.5 Flash** 
    ⚡ **Varios modelos experimentales**

    *Próximos pasos:*
    ⏰ **Espera 1-2 minutos** - los límites se reinician automáticamente
    🔄 **Prueba de nuevo** - funcionará pronto
    💬 **Chat normal** - sigue disponible

    `;

        if (error?.message.includes('quota')) {
          return mensajeBase + `*Error específico:* Límite de cuota excedido`;
        }
        
        return mensajeBase + `*Estado:* Todos los modelos probados están limitados temporalmente`;
      }

      // Método para ver qué modelos estamos usando
      static getModelosActivos() {
        return this.modelosPrioritarios.slice(0, 3); // Mostrar primeros 3
      }
    }