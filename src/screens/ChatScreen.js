// src/screens/ChatScreen.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Avatar } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';
import { CommandService } from '../services/commandService';
import { AIService } from '../services/aiService';
import { N8nService } from '../services/n8nService';

const IA_ASSISTANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

export default function ChatScreen({ route }) {
  const { chatId, chatName } = route.params;
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const flatListRef = useRef(null);

  // Función para detectar comandos de IA
  const esComandoIA = (texto) => {
    return texto.trim().toLowerCase().startsWith('@ia');
  };

  // Función para extraer el prompt del comando
  const extraerPromptIA = (comando) => {
    return comando.replace(/^@ia\s+/i, '').trim();
  };

  // Función para procesar con IA
 const procesarConIA = async (prompt) => {
  try {
    console.log('🔮 Procesando con IA...');
    const respuesta = await AIService.procesarPrompt(prompt);
    
    // ✅ VALIDAR RESPUESTA NO VACÍA
    if (!respuesta || respuesta.trim() === '') {
      console.log('⚠️ Respuesta vacía, usando fallback');
      return await generarRespuestaFallback(prompt);
    }
    
    return respuesta;
  } catch (error) {
    console.error('❌ Error en procesarConIA:', error);
    return await generarRespuestaFallback(prompt);
  }
};


  // Obtener usuario actual y su perfil
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
      
      if (user) {
        const { data: profile } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    cargarMensajes();
    suscribirMensajesRealtime();

    return () => {
      supabase.removeAllChannels();
    };
  }, [chatId]);

  const suscribirMensajesRealtime = () => {
    const canal = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          console.log('🔔 Nuevo mensaje en tiempo real:', payload);
          const mensajeConRemitente = await cargarInfoRemitente(payload.new);
          setMensajes(prev => [...prev, mensajeConRemitente]);
        }
      )
      .subscribe((status) => {
        console.log('Estado de suscripción:', status);
      });

    return canal;
  };

  const cargarInfoRemitente = async (mensaje) => {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('id, nombre, avatar_url')
      .eq('id', mensaje.perfil_id)
      .single();

    return {
      ...mensaje,
      perfiles: perfil || { nombre: 'Usuario', id: mensaje.perfil_id }
    };
  };

  const cargarMensajes = async () => {
    const { data, error } = await supabase
      .from('mensajes')
      .select(`
        *,
        perfiles:perfil_id (
          id,
          nombre,
          avatar_url
        )
      `)
      .eq('chat_id', chatId)
      .order('enviado_at', { ascending: true });

    if (!error) {
      console.log('Mensajes cargados:', data?.length);
      setMensajes(data || []);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } else {
      console.error('Error cargando mensajes:', error);
    }
  };

  // Función para manejar comandos con acciones
// En ChatScreen.js - agregar import


// Reemplazar la función procesarComandoConAccion
const procesarComandoConAccion = async (command, params, context) => {
  try {
    console.log('🎯 Enviando comando a n8n:', command, params);
    
    const n8nData = {
      type: command.type,
      action: command.action,
      params: params,
      context: {
        chatId,
        chatName,
        userName: userProfile?.nombre,
        userId: userId
      }
    };

    // ✅ ENVIAR A n8n
    const resultado = await N8nService.sendCommandToN8n(n8nData);
    
    // ✅ USAR RESPUESTA REAL DE n8n
    if (resultado.success) {
      return `✅ **${resultado.message || 'Comando ejecutado'}**\n\n${resultado.data?.details || 'Acción completada exitosamente'}`;
    } else {
      return `❌ **Error**: ${resultado.error?.message || 'No se pudo ejecutar el comando'}`;
    }
    
  } catch (error) {
    console.error('💥 Error en comando:', error);
    return `❌ **Error al procesar comando**: ${error.message}`;
  }
};
  // Procesar comando / consulta de IA
  const procesarComandoIA = async () => {
    try {
      console.log('🚀 INICIANDO procesarComandoIA');
      setLoading(true);
      
      console.log('📝 Extrayendo prompt...');
      const prompt = extraerPromptIA(nuevoMensaje);
      console.log('✅ Prompt extraído:', prompt);
      
      if (!prompt) {
        console.log('❌ Prompt vacío');
        setLoading(false);
        alert('Por favor escribe tu solicitud después de @ia');
        return;
      }

      console.log('🎯 Detectando comando...');
      const command = CommandService.detectCommand(prompt);
      console.log('✅ Comando detectado:', command);
      
      console.log('💾 Creando mensaje temporal...');
      const mensajePensando = {
        id: `temp-ia-${Date.now()}`,
        chat_id: chatId,
        perfil_id: IA_ASSISTANT_ID,
        contenido: command ? "🎯 Ejecutando comando..." : "🤔 Procesando tu solicitud...",
        enviado_at: new Date().toISOString(),
        perfiles: {
          id: IA_ASSISTANT_ID,
          nombre: 'Asistente IA',
          avatar_url: null
        }
      };
      
      console.log('📤 Agregando a mensajes...');
      setMensajes(prev => [...prev, mensajePensando]);
      console.log('🧹 Limpiando input...');
      setNuevoMensaje('');
      console.log('✅ Input limpiado');

      let respuesta;
      
      if (command) {
        console.log('🔧 Procesando comando con acción');
        const params = CommandService.extractParams(command, prompt);
        console.log("parámetro extraídos", params)
        respuesta = await procesarComandoConAccion(command, params, {
          chatId,
          chatName, 
          userName: userProfile?.nombre
        });
      } else {
        console.log('🧠 Procesando con IA normal');
        respuesta = await procesarConIA(prompt);
      }
      
      console.log('✅ Respuesta obtenida:', respuesta);

      console.log('💾 Guardando en BD...');
      const { error } = await supabase.from('mensajes').insert({
        chat_id: chatId,
        perfil_id: IA_ASSISTANT_ID,
        contenido: respuesta,
      });

      if (error) {
        console.log('❌ Error BD:', error);
        throw error;
      }
      
      console.log('✅ Mensaje guardado en BD');

      console.log('🗑️ Eliminando mensaje temporal');
      setMensajes(prev => prev.filter(msg => msg.id !== mensajePensando.id));
      console.log('✅ Mensaje temporal eliminado');

    } catch (error) {
      console.error('💥 ERROR CAPTURADO:', error);
      
      const mensajeError = `❌ Error: ${error.message || 'Desconocido'}`;
      console.log('🔄 Actualizando mensaje con error:', mensajeError);
      
      setMensajes(prev => 
        prev.map(msg => 
          msg.id === mensajePensando.id 
            ? { 
                ...msg, 
                contenido: mensajeError,
                enviado_at: new Date().toISOString()
              }
            : msg
        )
      );
    } finally {
      console.log('🏁 FINALIZANDO - quitando loading');
      setLoading(false);
      console.log('✅ Loading quitado');
    }
  };
  const generarRespuestaFallback = async (prompt) => {
  console.log('🔄 Usando respuesta de fallback para:', prompt);
  
  // Detectar intención para respuesta contextual
  if (prompt.includes('reunión') || prompt.includes('reunion')) {
    return `📅 **Asistente para Reuniones**
    
He detectado que quieres organizar una reunión.

*Para usar el comando de calendario, escribe:*
@ia crear reunión a las [hora] sobre [tema]

*Ejemplos:*
• "@ia crear reunión a las 16:00 sobre el proyecto nuevo"
• "@ia agendar reunión para mañana sobre avances"`;
  }
  
  if (prompt.includes('correo') || prompt.includes('email')) {
    return `📧 **Asistente para Emails**
    
Parece que quieres redactar un correo.

*Para usar el comando de email, escribe:*
@ia enviar correo a [persona] sobre [tema]

*Ejemplos:*
• "@ia enviar correo a Juan sobre la reunión"
• "@ia redactar email para el equipo sobre actualizaciones"`;
  }
  
  return `🤖 **Asistente IA**
  
He procesado: "${prompt}"

*Comandos disponibles:*
📧 @ia enviar correo a [persona] sobre [tema]
📅 @ia crear reunión a las [hora] sobre [tema]
📝 @ia crear tarea sobre [descripción]

*¿En qué más puedo ayudarte?*`;
};

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    if (esComandoIA(nuevoMensaje)) {
      await procesarComandoIA();
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      alert('No hay sesión activa');
      return;
    }

    const { error } = await supabase.from('mensajes').insert({
      chat_id: chatId,
      perfil_id: user.id,
      contenido: nuevoMensaje.trim(),
    });

    setLoading(false);
    if (!error) {
      setNuevoMensaje('');
    } else {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar mensaje');
    }
  };

  const renderItem = useCallback(({ item }) => {
    const esMio = item.perfil_id === userId;
    const esIA = item.perfil_id === IA_ASSISTANT_ID;
    
    return (
      <View style={[
        styles.messageContainer,
        esMio ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        
        {!esMio && item.perfiles && (
          <View style={styles.senderInfo}>
            <Avatar.Text 
              size={24} 
              label={esIA ? '🤖' : (item.perfiles.nombre?.charAt(0)?.toUpperCase() || 'U')} 
              style={[
                styles.avatar,
                esIA ? styles.iaAvatar : styles.userAvatar
              ]}
            />
            <Text style={[
              styles.senderName,
              esIA ? styles.iaSenderName : styles.userSenderName
            ]}>
              {item.perfiles.nombre || 'Usuario'}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          esMio ? styles.myMessage : (esIA ? styles.iaMessage : styles.otherMessage)
        ]}>
          <Text style={[
            styles.messageText,
            esMio ? styles.myMessageText : (esIA ? styles.iaMessageText : styles.otherMessageText)
          ]}>
            {item.contenido}
          </Text>
          <Text style={[
            styles.timestamp,
            esMio ? styles.myTimestamp : (esIA ? styles.iaTimestamp : styles.otherTimestamp)
          ]}>
            {new Date(item.enviado_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  }, [userId]);

 return (
  <KeyboardAvoidingView 
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // ⭐ NUEVO
  >
    <Text variant="titleLarge" style={styles.title}>
      {chatName}
    </Text>

    <FlatList
      ref={flatListRef}
      data={mensajes}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }}
      style={styles.messagesList}
      contentContainerStyle={styles.messagesContent} // ⭐ NUEVO
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={7}
      removeClippedSubviews={Platform.OS === 'android'}
    />

    <View style={styles.inputContainer}>
      <TextInput
        placeholder="Escribe un mensaje..."
        value={nuevoMensaje}
        onChangeText={setNuevoMensaje}
        style={styles.input}
        mode="outlined"
        multiline
      />
      <Button 
        mode="contained" 
        onPress={enviarMensaje} 
        loading={loading}
        disabled={loading || !nuevoMensaje.trim()}
        style={styles.sendButton}
      >
        Enviar
      </Button>
    </View>
  </KeyboardAvoidingView>
);
}

// ESTILOS
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#dbeed4ff',
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 10,
    fontWeight: 'bold',
    paddingTop: 10, 
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: { 
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 8,
  },
  avatar: {
    marginRight: 6,
  },
  iaAvatar: {
    backgroundColor: '#8B5CF6',
  },
  userAvatar: {
    backgroundColor: '#14631bff',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  iaSenderName: {
    color: '#8B5CF6',
  },
  userSenderName: {
    color: '#14631bff',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#86c081ff',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#14631bff',
    borderBottomLeftRadius: 4,
  },
  iaMessage: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#FFF',
  },
  iaMessageText: {
    color: '#374151',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  myTimestamp: {
    color: '#e8f5e9',
  },
  otherTimestamp: {
    color: '#e8f5e9',
  },
  iaTimestamp: {
    color: '#6B7280',
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ffffffff',
    minHeight: 80,
  },
  input: { 
    flex: 1, 
    marginRight: 12,
    maxHeight: 150,
    backgroundColor: '#dcf5eaff',
    height: 90,
  },
  sendButton: {
    borderRadius: 20,
    minWidth: 40,
    height: 90,
    backgroundColor: '#61e677ff',
    justifyContent: 'center',
  }
});