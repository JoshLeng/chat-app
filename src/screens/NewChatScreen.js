// src/screens/NewChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

export default function NewChatScreen({ navigation }) {
  const [chatName, setChatName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre')
      .ilike('nombre', `%${query}%`)
      .neq('id', user.id)
      .limit(10);

    if (!error) setSearchResults(data || []);
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => 
      prev.some(u => u.id === user.id) 
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeUser = (userId) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const createChat = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecciona al menos un usuario');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    try {
      // Determinar tipo de chat
      const tipoChat = selectedUsers.length > 1 ? 'grupo' : 'individual';
      
      // Nombre automático para grupos
      let nombreChat = chatName;
      if (!nombreChat) {
        if (tipoChat === 'individual') {
          nombreChat = `Chat con ${selectedUsers[0].nombre}`;
        } else {
          const nombres = selectedUsers.map(u => u.nombre).join(', ');
          nombreChat = `Grupo: ${nombres}`;
        }
      }

      // 1. Crear el chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          nombre: nombreChat,
          tipo: tipoChat,
          creado_por: user.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // 2. Agregar participantes (yo + usuarios seleccionados)
      const participantes = [
        { chat_id: chat.id, perfil_id: user.id }, // Yo mismo
        ...selectedUsers.map(user => ({ chat_id: chat.id, perfil_id: user.id }))
      ];

      const { error: participantsError } = await supabase
        .from('chat_participantes')
        .insert(participantes);

      if (participantsError) throw participantsError;

      navigation.reset({
        index: 0,
        routes: [
          { name: 'Chats' },
          { name: 'Chat', params: { chatId: chat.id, chatName: chat.nombre } }
        ],
      });
    } catch (error) {
      console.error('Error creando chat:', error);
      alert('Error al crear el chat: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Nombre del chats"
        value={chatName}
        onChangeText={setChatName}
        style={styles.input}
        placeholder="Dejar vacío para nombre automático"
      />

      {/* Usuarios seleccionados */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersContainer}>
          <Text style={styles.sectionTitle}>Usuarios seleccionados:</Text>
          <ScrollView horizontal style={styles.chipsContainer}>
            {selectedUsers.map(user => (
              <View key={user.id} style={styles.chip}>
                <Text style={styles.chipText}>{user.nombre}</Text>
                <TouchableOpacity 
                  onPress={() => removeUser(user.id)}
                  style={styles.chipClose}
                >
                  <Text style={styles.chipCloseText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.userCount}>
            {selectedUsers.length} usuario(s) seleccionado(s) - 
            {selectedUsers.length > 1 ? ' Chat grupal' : ' Chat individual'}
          </Text>
        </View>
      )}

      <TextInput
        label="Buscar usuarios"
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          searchUsers(text);
        }}
        style={styles.input}
        placeholder="Escribe al menos 2 caracteres..."
      />

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.sectionTitle}>Resultados de búsqueda:</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  selectedUsers.some(u => u.id === item.id) && styles.selectedUser
                ]}
                onPress={() => toggleUserSelection(item)}
              >
                <Text style={styles.userName}>{item.nombre}</Text>
                {selectedUsers.some(u => u.id === item.id) && (
                  <Text style={styles.selectedText}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            style={styles.searchList}
          />
        </View>
      )}

      <Button
        mode="contained"
        onPress={createChat}
        loading={loading}
        disabled={loading || selectedUsers.length === 0}
        style={styles.button}
      >
        {selectedUsers.length > 1 ? 'Crear Grupo' : 'Crear Chat'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  selectedUsersContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  chipText: {
    fontSize: 14,
    color: '#1976d2',
    marginRight: 6,
  },
  chipClose: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipCloseText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  userCount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  searchResults: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  searchList: {
    maxHeight: 150,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedUser: {
    backgroundColor: '#e3f2fd',
  },
  userName: {
    fontSize: 16,
  },
  selectedText: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
    
  },
});