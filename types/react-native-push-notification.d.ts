declare module 'react-native-push-notification' {
  interface PushNotificationObject {
    id?: string;
    title?: string;
    message: string;
    userInfo?: any;
    playSound?: boolean;
    soundName?: string;
    number?: number;
    repeatType?: string;
    vibrate?: boolean;
    vibration?: number;
    channelId?: string;
    date?: Date;
  }

  interface PushNotification {
    configure(options: {
      onRegister?: (token: { token: string; os: string }) => void;
      onNotification?: (notification: any) => void;
      permissions?: {
        alert?: boolean;
        badge?: boolean;
        sound?: boolean;
      };
      popInitialNotification?: boolean;
      requestPermissions?: boolean;
      getInitialNotification?: boolean;
    }): void;

    localNotificationSchedule(notification: PushNotificationObject): void;
    localNotification(notification: PushNotificationObject): void;
    cancelLocalNotifications(options: { id: string }): void;
    createChannel(
      channel: {
        channelId: string;
        channelName: string;
        channelDescription: string;
        soundName: string;
        importance: number;
        vibrate: boolean;
      },
      callback: (created: boolean) => void
    ): void;
  }

  const PushNotification: PushNotification;
  export default PushNotification;
} 