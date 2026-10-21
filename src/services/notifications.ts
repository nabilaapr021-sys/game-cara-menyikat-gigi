import { ReminderSettings } from '../types';
import { getReminderSettings, getTodayString } from './storage';
import { sounds } from './sound';

let tickerInterval: number | null = null;
const NOTIFIED_KEY = 'sikat_gigi_last_notified_slot';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

export async function sendLocalNotification(title: string, body: string, tag: string = 'brush_reminder'): Promise<boolean> {
  // Play soft chime sound
  sounds.playAlarm();

  if (!isNotificationSupported()) return false;

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag,
          vibrate: [200, 100, 200],
          data: { url: '/' },
        } as NotificationOptions);
        return true;
      }
    }

    // Direct Notification fallback
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag,
    });
    return true;
  } catch (err) {
    console.warn('Local notification delivery note:', err);
    return false;
  }
}

export async function triggerTestNotification(): Promise<boolean> {
  const settings = getReminderSettings();
  const userName = settings.customName || 'Sahabat Cilik';
  return sendLocalNotification(
    `🪥 Halo ${userName}! (Tes Pengingat)`,
    'Pengingat sikat gigi offline aktif! Saatnya bersihkan gigimu dari kuman agar selalu sehat dan berkilau ⭐',
    'test_reminder_' + Date.now()
  );
}

// Background scheduler ticker inside the browser session
export function startNotificationTicker(onReminderTriggered?: (type: 'morning' | 'night') => void) {
  if (tickerInterval) clearInterval(tickerInterval);

  const check = async () => {
    const settings: ReminderSettings = getReminderSettings();
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const today = getTodayString();

    const lastNotified = localStorage.getItem(NOTIFIED_KEY) || '';

    // Check Morning Reminder
    if (settings.morningEnabled && settings.morningTime === currentTimeStr) {
      const slotId = `${today}_morning_${currentTimeStr}`;
      if (lastNotified !== slotId) {
        localStorage.setItem(NOTIFIED_KEY, slotId);
        const name = settings.customName || 'Sahabat Cilik';
        await sendLocalNotification(
          `☀️ Waktunya Sikat Gigi Pagi, ${name}!`,
          'Ayo bersihkan sisa sarapan agar kuman gula tidak merusak email gigimu. Buka game 2 menit sekarang!'
        );
        if (onReminderTriggered) onReminderTriggered('morning');
      }
    }

    // Check Night Reminder
    if (settings.nightEnabled && settings.nightTime === currentTimeStr) {
      const slotId = `${today}_night_${currentTimeStr}`;
      if (lastNotified !== slotId) {
        localStorage.setItem(NOTIFIED_KEY, slotId);
        const name = settings.customName || 'Sahabat Cilik';
        await sendLocalNotification(
          `🌙 Waktunya Sikat Gigi Malam, ${name}!`,
          'Kuman gigi paling aktif saat tidur! Ayo sikat gigimu 2 menit agar gigi bersih dan mimpi indah 🦷✨'
        );
        if (onReminderTriggered) onReminderTriggered('night');
      }
    }
  };

  // Run immediately then every 30 seconds
  check();
  tickerInterval = window.setInterval(check, 30000);
}

export function stopNotificationTicker() {
  if (tickerInterval) {
    clearInterval(tickerInterval);
    tickerInterval = null;
  }
}
