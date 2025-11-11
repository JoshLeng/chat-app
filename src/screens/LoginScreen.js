// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // VERIFICACIÓN MÍNIMA: Asegurar que el perfil existe
    if (data.user) {
      const { data: profile } = await supabase
        .from('perfiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        // Crear perfil solo si no existe
        await supabase.from('perfiles').insert({
          id: data.user.id,
          nombre: email.split('@')[0],
          avatar_url: null
        });
      }
    }

    setLoading(false);
    console.log('Login exitoso, redirigiendo...');
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Iniciar Sesión
      </Text>

      <TextInput
        label="Correo Electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Iniciar sesión
      </Button>

      <Button mode="text" onPress={() => navigation.navigate('Register')}>
        Crear cuenta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 10 },
  button: { marginTop: 10 },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
});