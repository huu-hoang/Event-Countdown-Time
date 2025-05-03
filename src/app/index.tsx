import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventContext } from '../context/EventContext';
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

function getDaysRemaining(dateStr: string) {
  const eventDate = new Date(dateStr);
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function formatTime(timeStr: string | undefined): string {
  if (!timeStr) return '';
  // Remove any non-digit characters
  const cleaned = timeStr.replace(/\D/g, '');
  if (cleaned.length < 3) return cleaned; // Not enough digits for HHmm
  let hours = parseInt(cleaned.slice(0, 2), 10);
  let minutes = parseInt(cleaned.slice(2, 4) || '0', 10);
  // Clamp hours and minutes to valid ranges
  hours = Math.max(0, Math.min(23, hours));
  minutes = Math.max(0, Math.min(59, minutes));
  // Format as HH:mm (24-hour)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function getNewYearCountdown() {
  const now = new Date();
  const newYear = new Date('2026-01-01T00:00:00');
  const diff = newYear.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
}

const TAGS = ['All', 'Work', 'Personal', 'Holiday'];
const DATE_FILTERS = ['All', 'Upcoming', 'Expired'];

export default function HomeScreen() {
  const router = useRouter();
  const { events, loading } = useEventContext();
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [countdown, setCountdown] = useState(getNewYearCountdown());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getNewYearCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const days = getDaysRemaining(event.date);
      const tagMatch = selectedTag === 'All' || event.tag === selectedTag;
      const dateMatch =
        selectedDate === 'All' ||
        (selectedDate === 'Upcoming' && days >= 0) ||
        (selectedDate === 'Expired' && days < 0);
      return tagMatch && dateMatch;
    });
  }, [events, selectedTag, selectedDate]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.countdownCard}>
        <Text style={styles.countdownTitle}>New Year 2026</Text>
        <Text style={styles.countdownTime}>{countdown}</Text>
      </View>
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.filterBtn, selectedTag === tag && styles.filterBtnActive]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={[styles.filterText, selectedTag === tag && styles.filterTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {DATE_FILTERS.map(dateF => (
            <TouchableOpacity
              key={dateF}
              style={[styles.filterBtn, selectedDate === dateF && styles.filterBtnActive]}
              onPress={() => setSelectedDate(dateF)}
            >
              <Text style={[styles.filterText, selectedDate === dateF && styles.filterTextActive]}>{dateF}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <Text style={styles.upcomingTitle}>Upcoming Events</Text>
      {filteredEvents.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <MaterialIcons name="event-busy" size={64} color="#E5E7EB" style={{ marginBottom: 16 }} />
          <Text style={{ color: '#888', fontSize: 18 }}>No events found for this filter.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const days = getDaysRemaining(item.date);
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: '/edit-event', params: { id: item.id } })}
                style={styles.eventTouchable}
              >
                <View style={styles.eventItem}>
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{item.title}</Text>
                      {item.tag && (
                        <View style={[styles.tag, { backgroundColor: item.tag === 'Work' ? '#E0E7FF' : item.tag === 'Personal' ? '#FCE7F3' : '#FEF9C3' }]}>
                          <Text style={{ color: '#333', fontSize: 12 }}>{item.tag}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.eventDetails}>
                      <View style={styles.dateTimeContainer}>
                        <MaterialIcons name="calendar-today" size={16} color="#6B7280" style={styles.icon} />
                        <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
                      </View>
                      {item.time && (
                        <View style={styles.dateTimeContainer}>
                          <MaterialIcons name="access-time" size={16} color="#6B7280" style={styles.icon} />
                          <Text style={styles.eventTime}>{formatTime(item.time)}</Text>
                        </View>
                      )}
                      {item.location && (
                        <View style={styles.dateTimeContainer}>
                          <MaterialIcons name="location-on" size={16} color="#6B7280" style={styles.icon} />
                          <Text style={styles.eventLocation}>{item.location}</Text>
                        </View>
                      )}
                    </View>
                    {item.description && (
                      <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionText} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>
                    )}
                    <View style={styles.footer}>
                      <Text style={[styles.eventDays, days < 0 && styles.expiredText]}>
                        {days >= 0 ? `${days} days remaining` : 'Expired'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.7}
        onPress={() => router.push('/create-event')}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  countdownCard: { backgroundColor: '#6C63FF', borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  countdownTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  countdownTime: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  filterRow: { marginBottom: 12 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  filterBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  filterText: { color: '#333', fontWeight: 'bold' },
  filterTextActive: { color: '#fff' },
  upcomingTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  eventTouchable: { marginBottom: 12 },
  eventItem: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 8 },
  eventDetails: {
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  eventDate: { color: '#6B7280', fontSize: 14 },
  eventTime: { color: '#6B7280', fontSize: 14 },
  eventLocation: { color: '#6B7280', fontSize: 14 },
  descriptionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  descriptionText: { color: '#4B5563', fontSize: 14, lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  eventDays: { color: '#6C63FF', fontWeight: 'bold', fontSize: 14 },
  expiredText: { color: '#EF4444' },
  tag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  fab: { position: 'absolute', right: 24, bottom: 32, backgroundColor: '#6C63FF', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8 },
}); 