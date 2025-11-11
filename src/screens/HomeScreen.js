// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { supabase } from '../lib/supabaseClient';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.text}>
        Bienvenido
      </Text>
      {user && (
        <Text variant="bodyLarge" style={styles.text}>
          {user.email}
        </Text>
      )}
      <Button
        mode="contained"
        style={styles.button}
        onPress={handleLogout}
      >
        Cerrar sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { marginBottom: 10 },
  button: { marginTop: 20, width: '60%' },
});
