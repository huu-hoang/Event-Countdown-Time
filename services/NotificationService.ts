import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
  reminder?: string;
  customReminderTime?: number;
  time?: string;
}

class NotificationService {
  private isConfigured = false;

  constructor() {
    // Don't automatically configure in constructor
  }

  configure = async () => {
    if (this.isConfigured) return;

    try {
      // Only request permissions on Android
      if (Platform.OS === 'android') {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log('Notification permission status:', status);
        if (status !== 'granted') {
          console.warn('Permission to receive notifications was denied');
          // Still set isConfigured to true to avoid infinite loop
          this.isConfigured = true;
          return;
        }
      }
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to configure notifications:', error);
      this.isConfigured = true;
    }
  }

  scheduleNotification = async (event: Event) => {
    console.log('scheduleNotification called', event);
    if (!this.isConfigured) {
      await this.configure();
    }

    if (!event.reminder) return;

    const notificationTime = this.calculateNotificationTime(event);
    if (!notificationTime) return;

    try {
      console.log('About to calculate seconds for notification:', notificationTime.toLocaleString(), notificationTime.getTime(), Date.now());
      const seconds = Math.floor((notificationTime.getTime() - Date.now()) / 1000);
      console.log('Seconds until notification:', seconds);
      if (seconds <= 0) {
        console.warn(`Notification for event '${event.title}' not scheduled: time is in the past (${notificationTime.toLocaleString()})`);
        return; // Don't schedule past notifications
      }
      console.log(`Scheduling notification for event '${event.title}' at ${notificationTime.toLocaleString()} (in ${seconds} seconds)`);
      const content: any = {
        title: `🔔 ${event.title}`,
        body: event.description || 'Upcoming event reminder',
        sound: true,
        data: { eventId: event.id },
      };
      if (Platform.OS === 'android') {
        content.channelId = 'default';
      }
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: ({ seconds, repeats: false } as any),
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  private calculateNotificationTime = (event: Event): Date | null => {
    if (!event.date) return null;

    // Ensure event.date is a string in yyyy-mm-dd format
    let year = '', month = '', day = '';
    const dateStr = String(event.date);
    [year, month, day] = dateStr.split('-');
    let [hour, minute] = (event.time || '00:00').split(':');
    if (
      !year || isNaN(Number(year)) ||
      !month || isNaN(Number(month)) ||
      !day || isNaN(Number(day)) ||
      !hour || isNaN(Number(hour)) ||
      !minute || isNaN(Number(minute))
    ) {
      console.warn('Invalid date or time for notification:', { year, month, day, hour, minute });
      return null;
    }
    const eventDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    );

    let reminderMinutes = this.getMinutesFromReminderOption(event.reminder || '');
    if (event.customReminderTime) {
      reminderMinutes = event.customReminderTime;
    }
    if (reminderMinutes === null || reminderMinutes === undefined) return null;

    const notificationTime = new Date(eventDate.getTime() - (reminderMinutes * 60 * 1000));
    return notificationTime;
  }

  private getMinutesFromReminderOption = (reminder: string): number => {
    switch (reminder) {
      case 'At time of event': return 0;
      case '5 minutes before': return 5;
      case '15 minutes before': return 15;
      case '30 minutes before': return 30;
      case '1 hour before': return 60;
      case '2 hours before': return 120;
      case '1 day before': return 1440;
      case '2 days before': return 2880;
      case '1 week before': return 10080;
      default: return 0;
    }
  }

  cancelNotification = async (eventId: string) => {
    if (!this.isConfigured) {
      await this.configure();
    }

    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationToCancel = notifications.find(n => n.content.data?.eventId === eventId);
      if (notificationToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notificationToCancel.identifier);
      }
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  playNotificationSound = async () => {
    if (!this.isConfigured) {
      await this.configure();
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test',
          body: 'Test notification sound',
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }
}

export default new NotificationService(); 