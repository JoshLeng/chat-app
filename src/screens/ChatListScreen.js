// src/screens/ChatsListScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, FAB } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

export default function ChatsListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar chats al iniciar y cuando la pantalla recibe foco
  useEffect(() => {
    loadChats();
    
    // Escuchar cuando la pantalla recibe foco (al volver de otra pantalla)
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
      console.log('Usuario ID:', user?.id);
      
      if (!user) {
        console.log('No hay usuario autenticado');
        setLoading(false);
        return;
      }

      // 2. Verificar/Crear perfil
      const { data: profile } = await supabase
        .from('perfiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.log('Creando perfil...');
        await supabase.from('perfiles').insert({
          id: user.id,
          nombre: user.email?.split('@')[0] || 'Usuario'
        });
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
        console.log('Chats encontrados:', data);
        // Extraer los chats del resultado y filtrar nulos
        const userChats = data.map(item => item.chats).filter(chat => chat !== null);
        setChats(userChats);
        console.log('Chats procesados:', userChats);
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
      {chats.length === 0 ? (
        <View style={styles.center}>
          <Text>No hay chats disponibles</Text>
          <Text>Crea tu primer chat presionando el botón +</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NewChatScreen')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  chatTitle: { fontSize: 18, fontWeight: 'bold' },
  chatSubtitle: { fontSize: 14, color: '#666' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
});