// src/services/commandService.js
export class CommandService {
  ///////prueba
  static commands = {
    'email': {
    pattern: /(?:enviar|redactar|crear|mandar|escribir)\s+(?:correo|email|mail)\s+(?:a|para|dirigido a|destinado a)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\s+(?:sobre|acerca de|con|relacionado con)\s+(.+))?/i,
    action: 'sendEmail',
    description: 'Enviar correo electrónico'
  },
  'calendar': {
    pattern: /(?:crear|agendar|programar|agenda|organizar|coordinar)\s+(?:una\s+)?(?:reuni[oó]n|evento|meeting|cita|encuentro)(?:\s+(?:para|el|a)\s+(mañana|pasado\s+mañana|hoy|esta\s+semana|próxima\s+semana))?(?:\s+(?:sobre|acerca de|para|de)\s+(.+))?/i,
    action: 'createEvent', 
    description: 'Crear evento en calendario'
  },
  'task': {
    pattern: /(?:crear|agregar|anotar|registrar)\s+(?:tarea|recordatorio|nota|pendiente)\s+(?:sobre|para|acerca de)\s+(.+)/i,
    action: 'createTask',
    description: 'Crear tarea o recordatorio'
  }
};

  static detectCommand(prompt) {
    const promptLower = prompt.toLowerCase();
    console.log('🔍 Buscando comando en:', promptLower);
    
    for (const [commandName, commandConfig] of Object.entries(this.commands)) {
      const match = promptLower.match(commandConfig.pattern);
      if (match) {
        console.log(`✅ Comando detectado: ${commandName}`, match);
        return {
          type: commandName,
          action: commandConfig.action,
          matches: match,
          fullMatch: match[0]
        };
      } else {
        console.log(`❌ No coincide con: ${commandName}`);
      }
    }
    
    console.log('❌ Ningún comando detectado');
    return null;
  }

  // En CommandService - mejorar extractParams
static extractParams(command, originalPrompt) {  
  switch (command.type) {
    case 'email':
      return {
        destinatario: command.matches[1],
        titulo: command.matches[2] || 'Sin asunto',
        cuerpo: command.matches[2] || 'Sin contenido', 
        comando: 'email'
      };
   case 'calendar':
  return {
    titulo: command.matches[2] || 'Reunión importante', // ⭐ ESTE DEBE SER matches[2]
    fecha: 'hoy', 
    hora: command.matches[1] || 'por definir',
    comando: 'calendar'
  };
    case 'task':
      return {
        titulo: command.matches[1],
        descripcion: command.matches[1] || 'Sin descripción',
        prioridad: 'media',
        comando: 'task'
      };
    default:
      return { comando: command.type };
  }
}
  static extractEmailBody(fullMatch) {
    const bodyMatch = fullMatch.match(/sobre\s+(.+)/i);
    return bodyMatch ? bodyMatch[1] : 'Por favor proporcionar más detalles.';
  }

  static extractContext(fullMatch) {
    const contextMatch = fullMatch.match(/(?:sobre|para|acerca de)\s+(.+)/i);
    return contextMatch ? contextMatch[1] : 'Tema por definir';
  }
}