// Capacitor Local Notification utility for TapGas
// Uses Capacitor Local Notifications if available, otherwise falls back to browser Notification API


import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';


export async function requestLocalNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } else if ('Notification' in window) {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}


export async function scheduleOrderReminderNotification(delayMs = 2 * 60 * 1000) {
  if (Capacitor.isNativePlatform()) {
    // Schedule with Capacitor
    const triggerDate = new Date(Date.now() + delayMs);
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Gasman Order Reminder',
          body: 'Remember to schedule a gas refill if you are running low or empty!',
          id: Math.floor(Math.random() * 100000),
          schedule: { at: triggerDate },
        },
      ],
    });
  } else if ('Notification' in window) {
    setTimeout(() => {
      new Notification('Gasman Order Reminder', {
        body: 'Remember to schedule a gas refill if you are running low or empty!',
        icon: '/tapgas/vite.svg',
        tag: 'order-reminder',
      });
    }, delayMs);
  }
}
