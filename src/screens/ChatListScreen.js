// src/screens/ChatsListScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, FAB } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

export default function ChatsListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const APP_LOGO = require('../../assets/icon.png');

  // Cargar chats y usuario al iniciar
  useEffect(() => {
    loadChats();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadChats();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadChats = async () => {
    setLoading(true);
    
    try {
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // 2. Obtener nombre del perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('perfiles')
        .select('nombre')
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        setUserName(profile.nombre);
      } else {
        // Si no hay perfil, usar el email como fallback
        setUserName(user.email?.split('@')[0] || 'Usuario');
      }

      // 3. Cargar chats del usuario
      const { data, error } = await supabase
        .from('chat_participantes')
        .select(`
          chat_id,
          chats (
            id,
            nombre,
            tipo,
            creado_at
          )
        `)
        .eq('perfil_id', user.id);

      if (error) {
        console.error('Error fetching chats:', error);
      } else {
        const userChats = data.map(item => item.chats).filter(chat => chat !== null);
        setChats(userChats);
      }
      
    } catch (error) {
      console.error('Error en loadChats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { 
        chatId: item.id,
        chatName: item.nombre 
      })}
    >
      <Text style={styles.chatTitle}>{item.nombre}</Text>
      <Text style={styles.chatSubtitle}>
        {item.tipo === 'individual' ? 'Chat individual' : 'Grupo'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} size="large" />
        <Text>Cargando chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con logo placeholder y saludo */}
      <View style={styles.header}>
         <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>💬 ChatApp</Text>
          </View>
      
        </View>
        
        <Text style={styles.greeting}>Hola, {userName} 👋</Text>
        <Text style={styles.subtitle}>
          {chats.length === 0 
            ? 'Comienza creando tu primer chat' 
            : `Tienes ${chats.length} chat${chats.length !== 1 ? 's' : ''} activo${chats.length !== 1 ? 's' : ''}`
          }
        </Text>
      </View>

      {/* Lista de chats */}
      {chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noChatsText}>No hay chats disponibles</Text>
          <Text style={styles.noChatsSubtitle}>Presiona el botón + para crear tu primer chat</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.chatsList}
        />
      )}

      {}
      <FAB
        label="+"
        style={styles.fab}
        size="big"
        onPress={() => navigation.navigate('NewChatScreen')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  logoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#318829ff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  chatsList: {
    flex: 1,
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  chatTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#333',
  },
  chatSubtitle: { 
    fontSize: 14, 
    color: '#666',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 15,
    bottom: 50,
    backgroundColor: '#6dd84dff',
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  noChatsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noChatsSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});