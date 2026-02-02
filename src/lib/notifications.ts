/**
 * PWA 푸시 알림 관리
 */

export interface NotificationConfig {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  requireInteraction?: boolean;
  data?: any;
}

/**
 * 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // 브라우저가 알림을 지원하는지 확인
  if (!('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다');
    return false;
  }
  
  // 이미 권한이 있으면 true 반환
  if (Notification.permission === 'granted') {
    return true;
  }
  
  // 권한이 거부되었으면 false 반환
  if (Notification.permission === 'denied') {
    return false;
  }
  
  // 권한 요청
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * 로컬 알림 표시 (즉시 알림)
 */
export function showLocalNotification(
  title: string,
  body: string,
  options?: Partial<NotificationConfig>
): void {
  if (Notification.permission !== 'granted') {
    console.warn('알림 권한이 없습니다');
    return;
  }
  
  const config: NotificationOptions = {
    body,
    icon: options?.icon || '/logo-192.png',
    badge: options?.badge || '/badge-72.png',
    tag: options?.tag,
    vibrate: options?.vibrate || [200, 100, 200],
    requireInteraction: options?.requireInteraction || false,
    data: options?.data,
  };
  
  new Notification(title, config);
}

/**
 * 알림 권한 상태 확인
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * 알림 지원 여부 확인
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}
