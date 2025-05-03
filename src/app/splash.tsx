import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.logo} />
      <Text style={styles.title}>Event Countdown Time</Text>
      <Button title="Get Started" onPress={() => router.replace('/')} color="#6C63FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6C63FF', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32 },
}); 