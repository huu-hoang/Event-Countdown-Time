import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventContext } from '../context/EventContext';
import { Ionicons } from '@expo/vector-icons';

const TAGS = ['Work', 'Personal', 'Holiday'];
const REMINDER_OPTIONS = [
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

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Remove any non-digit characters
  const cleaned = dateStr.replace(/\D/g, '');
  
  // Format as dd/mm/yyyy
  let formatted = '';
  if (cleaned.length > 0) {
    formatted = cleaned.slice(0, 2);
    if (cleaned.length > 2) {
      formatted += '/' + cleaned.slice(2, 4);
      if (cleaned.length > 4) {
        formatted += '/' + cleaned.slice(4, 8);
      }
    }
  }
  return formatted;
}

export default function CreateEventScreen() {
  const router = useRouter();
  const { addEvent, events } = useEventContext();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [people, setPeople] = useState('');
  const [type, setType] = useState('');
  const [reminder, setReminder] = useState('');
  const [customReminder, setCustomReminder] = useState('');
  const [tag, setTag] = useState('Work');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState('00');
  const [tempMinute, setTempMinute] = useState('00');
  const [currentTime, setCurrentTime] = useState(new Date());

  const dynamicTags = useMemo(() => {
    const tagSet = new Set(events.map(e => e.tag).filter(Boolean));
    return Array.from(new Set([...TAGS, ...tagSet]));
  }, [events]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function getNotificationTime(): string | null {
    if (!date || !time) return null;
    const [day, month, year] = date.split('/');
    if (!day || !month || !year) return null;
    const [hour, minute] = time.split(':');
    let eventDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    let reminderMinutes = 0;
    switch (reminder) {
      case 'At time of event': reminderMinutes = 0; break;
      case '5 minutes before': reminderMinutes = 5; break;
      case '15 minutes before': reminderMinutes = 15; break;
      case '30 minutes before': reminderMinutes = 30; break;
      case '1 hour before': reminderMinutes = 60; break;
      case '2 hours before': reminderMinutes = 120; break;
      case '1 day before': reminderMinutes = 1440; break;
      case '1 week before': reminderMinutes = 10080; break;
      default: reminderMinutes = 0;
    }
    if (reminder === 'Custom' && customReminder) {
      const custom = parseInt(customReminder);
      if (!isNaN(custom)) reminderMinutes = custom;
    }
    const notifyDate = new Date(eventDate.getTime() - reminderMinutes * 60 * 1000);
    return notifyDate.toLocaleString();
  }

  function handleSave() {
    if (!title || !date) return;
    
    // Convert dd/mm/yyyy to yyyy-mm-dd for storage
    const [day, month, year] = date.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    
    addEvent({
      id: Date.now().toString(),
      title,
      date: formattedDate,
      time,
      location,
      description,
      people,
      type,
      reminder,
      customReminder,
      tag,
    });
    router.back();
  }

  function openTimePicker() {
    if (time) {
      const [h, m] = time.split(':');
      setTempHour(h.padStart(2, '0'));
      setTempMinute(m.padStart(2, '0'));
    } else {
      setTempHour('00');
      setTempMinute('00');
    }
    setShowTimePicker(true);
  }

  function confirmTime() {
    setTime(`${tempHour}:${tempMinute}`);
    setShowTimePicker(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.deviceTimeContainer}>
          <Text style={styles.deviceTimeLabel}>Device Time: <Text style={styles.deviceTimeValue}>{currentTime.toLocaleString()}</Text></Text>
          {date && time && reminder && (
            <Text style={styles.deviceTimeLabel}>Notification will fire at: <Text style={styles.deviceTimeValue}>{getNotificationTime()}</Text></Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Event Title" 
            value={title} 
            onChangeText={setTitle}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="DD/MM/YYYY" 
              value={date}
              onChangeText={(text) => setDate(formatDate(text))}
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="time-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TouchableOpacity style={{ flex: 1 }} onPress={openTimePicker}>
              <Text style={[styles.input, { color: time ? '#1F2937' : '#9CA3AF' }]}> 
                {time ? time : 'HH:MM'}
              </Text>
            </TouchableOpacity>
          </View>
          <Modal
            visible={showTimePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowTimePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Time</Text>
                <View style={styles.pickerRow}>
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map(h => (
                      <Pressable key={h} onPress={() => setTempHour(h)}>
                        <Text style={[styles.pickerItem, tempHour === h && styles.pickerItemSelected]}>{h}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Text style={styles.pickerColon}>:</Text>
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                      <Pressable key={m} onPress={() => setTempMinute(m)}>
                        <Text style={[styles.pickerItem, tempMinute === m && styles.pickerItemSelected]}>{m}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalButton} onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={confirmTime}>
                    <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Location" 
              value={location} 
              onChangeText={setLocation}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Description" 
              value={description} 
              onChangeText={setDescription}
              multiline
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="people-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="People" 
              value={people} 
              onChangeText={setPeople}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagRow}>
            {dynamicTags.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tagBtn, tag === t && styles.tagBtnActive]}
                onPress={() => setTag(t || 'Work')}
              >
                <Text style={[styles.tagBtnText, tag === t && styles.tagBtnTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder</Text>
          <View style={styles.reminderContainer}>
            {REMINDER_OPTIONS.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.reminderOption, reminder === option && styles.reminderOptionActive]}
                onPress={() => setReminder(option)}
              >
                <View style={styles.radioCircle}>
                  {reminder === option && <View style={styles.selectedDot} />}
                </View>
                <Text style={[styles.reminderText, reminder === option && styles.reminderTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            {reminder === 'Custom' && (
              <View style={styles.customReminderContainer}>
                <TextInput
                  style={styles.customReminderInput}
                  placeholder="Enter custom reminder (e.g., 10 days before)"
                  value={customReminder}
                  onChangeText={setCustomReminder}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Create Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  tagBtnActive: {
    backgroundColor: '#6C63FF',
  },
  tagBtnText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  tagBtnTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reminderContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  reminderOptionActive: {
    backgroundColor: '#E0E7FF',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#6C63FF',
  },
  reminderText: {
    fontSize: 14,
    color: '#4B5563',
  },
  reminderTextActive: {
    color: '#6C63FF',
    fontWeight: '500',
  },
  customReminderContainer: {
    marginTop: 8,
    padding: 8,
  },
  customReminderInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  pickerColumn: {
    height: 120,
    width: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  pickerItem: {
    fontSize: 24,
    color: '#4B5563',
    textAlign: 'center',
    paddingVertical: 6,
  },
  pickerItemSelected: {
    color: '#6C63FF',
    fontWeight: 'bold',
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  pickerColon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6C63FF',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deviceTimeContainer: {
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  deviceTimeLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  deviceTimeValue: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
}); 