// src/screens/ChatScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

export default function ChatScreen({ route }) {
  const { chatId, chatName } = route.params;
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const flatListRef = useRef(null);

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    cargarMensajes();
    suscribirMensajesRealtime();

    return () => {
      // Limpiar suscripción al desmontar
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
        (payload) => {
          console.log('🔔 Nuevo mensaje en tiempo real:', payload);
          setMensajes(prev => [...prev, payload.new]);
        }
      )
      .subscribe((status) => {
        console.log('Estado de suscripción:', status);
      });

    return canal;
  };

  const cargarMensajes = async () => {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('chat_id', chatId)
      .order('enviado_at', { ascending: true });

    if (!error) {
      console.log('Mensajes cargados:', data?.length);
      setMensajes(data || []);
    } else {
      console.error('Error cargando mensajes:', error);
    }
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

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

  const renderItem = ({ item }) => {
    const esMio = item.perfil_id === userId;
    
    return (
      <View style={[
        styles.messageContainer,
        esMio ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          esMio ? styles.myMessage : styles.otherMessage
        ]}>
          <Text style={styles.messageText}>{item.contenido}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.enviado_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text variant="titleLarge" style={styles.title}>
        {chatName}
      </Text>

      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        style={styles.messagesList}
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#dbeed4ff',
    padding: 10 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 10,
    fontWeight: 'bold'
  },
  messagesList: {
    flex: 1,
    marginBottom: 10,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
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
  messageText: {
    fontSize: 16,
    color: '#ffffffff',
  },
  myMessageText: {
    color: '#FFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#ffffffff',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', // Cambiado a 'flex-end'
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ffffffff',
    minHeight: 80, // Altura mínima reducida
  },
  input: { 
    flex: 1, 
    marginRight: 12,
    maxHeight: 100,
    backgroundColor: '#dcf5eaff',
    height: 90, // Altura fija más pequeña
  },
  sendButton: {
    borderRadius: 20,
    minWidth: 40,
    height: 90, // Misma altura que el input
    backgroundColor: '#61e677ff',
    justifyContent: 'center',}
}); 