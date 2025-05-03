import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

export type Event = {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  people?: string;
  type?: string;
  reminder?: string;
  customReminder?: string;
  tag?: string;
};

type EventContextType = {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  loading: boolean;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export function useEventContext() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEventContext must be used within EventProvider');
  return ctx;
}

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('events')
      .then(data => {
        if (data) {
          const parsedEvents = JSON.parse(data);
          setEvents(parsedEvents);
          // Schedule notifications for all events
          parsedEvents.forEach((event: Event) => {
            NotificationService.scheduleNotification(event);
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load events from storage:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading) AsyncStorage.setItem('events', JSON.stringify(events));
  }, [events, loading]);

  const addEvent = (event: Event) => {
    console.log('addEvent called', event);
    setEvents(prev => [...prev, event]);
    NotificationService.scheduleNotification(event);
  };

  const updateEvent = (event: Event) => {
    console.log('updateEvent called', event);
    setEvents(prev => {
      const updatedEvents = prev.map(e => e.id === event.id ? event : e);
      // Cancel existing notification and schedule new one
      NotificationService.cancelNotification(event.id);
      NotificationService.scheduleNotification(event);
      return updatedEvents;
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => {
      const filteredEvents = prev.filter(e => e.id !== id);
      // Cancel notification when event is deleted
      NotificationService.cancelNotification(id);
      return filteredEvents;
    });
  };

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, loading }}>
      {children}
    </EventContext.Provider>
  );
}; 