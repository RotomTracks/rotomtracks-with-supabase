import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';

export async function notify(title: string, body?: string) {
  let granted = await isPermissionGranted();
  if (!granted) {
    const p = await requestPermission();
    granted = p === 'granted';
  }
  if (granted) {
    sendNotification({ title, body });
  }
}



