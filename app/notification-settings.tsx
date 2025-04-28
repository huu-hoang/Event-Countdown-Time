import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Button } from 'react-native';
import { useRouter } from 'expo-router';

const options = [
  'No Notification',
  'At time of event',
  '5 minutes before',
  '15 minutes before',
  '30 minutes before',
  '1 hour before',
  '2 hours before',
  '1 day before',
  '1 week before',
  'Custom',
];

export default function NotificationSettingsScreen() {
  const [selected, setSelected] = useState('15 minutes before');
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>
      {options.map(option => (
        <TouchableOpacity key={option} style={styles.option} onPress={() => setSelected(option)}>
          <View style={styles.radioCircle}>
            {selected === option && <View style={styles.selectedDot} />}
          </View>
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
      <Button title="Save" onPress={() => router.back()} color="#6C63FF" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  option: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  radioCircle: { height: 24, width: 24, borderRadius: 12, borderWidth: 2, borderColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  selectedDot: { height: 12, width: 12, borderRadius: 6, backgroundColor: '#6C63FF' },
  optionText: { fontSize: 16 },
}); 