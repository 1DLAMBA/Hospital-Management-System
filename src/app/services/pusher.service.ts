import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  private pusherInstance: Pusher | null = null;
  private channel: any = null;
  private notificationsChannel: any = null;
  private connectionState$ = new BehaviorSubject<string>('disconnected');

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.pusherInstance) {
      return; // Already initialized
    }

    const pusherKey = environment.pusher?.key || '45cde359e2dec89841a7';
    const pusherCluster = environment.pusher?.cluster || 'mt1';

    Pusher.logToConsole = !environment.production;

    this.pusherInstance = new Pusher(pusherKey, {
      cluster: pusherCluster,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      disabledTransports: [],
      activityTimeout: 30000,
      pongTimeout: 6000,
      enableStats: false,
    });

    // Connection state management
    this.pusherInstance.connection.bind('state_change', (states: any) => {
      this.connectionState$.next(states.current);
      console.log(`[PusherService] State: ${states.previous} -> ${states.current}`);
    });

    this.pusherInstance.connection.bind('connected', () => {
      console.log('[PusherService] ✅ Connected');
    });

    this.pusherInstance.connection.bind('disconnected', () => {
      console.warn('[PusherService] Disconnected');
    });

    this.pusherInstance.connection.bind('error', (err: any) => {
      console.error('[PusherService] Connection error:', err);
    });

    this.pusherInstance.connection.bind('failed', () => {
      console.error('[PusherService] Connection failed completely');
    });

    this.pusherInstance.connection.bind('retry', () => {
      console.log('[PusherService] 🔄 Retrying connection...');
    });

    // Subscribe to messaging channel
    this.channel = this.pusherInstance.subscribe('messaging-channel');

    this.channel.bind('pusher:subscription_succeeded', () => {
      console.log('[PusherService] ✅ Subscribed to messaging-channel');
    });

    this.channel.bind('pusher:subscription_error', (status: any) => {
      console.error('[PusherService] Subscription error:', status);
    });

    // Subscribe to notifications channel
    this.notificationsChannel = this.pusherInstance.subscribe('notifications-channel');

    this.notificationsChannel.bind('pusher:subscription_succeeded', () => {
      console.log('[PusherService] ✅ Subscribed to notifications-channel');
    });

    this.notificationsChannel.bind('pusher:subscription_error', (status: any) => {
      console.error('[PusherService] Notifications subscription error:', status);
    });

    // Bind to ALL events for debugging (helps identify if events are being received)
    this.channel.bind_global((eventName: string, data: any) => {
      console.log(`[PusherService] 📨 Global event received: ${eventName}`, data);
    });
  }

  getChannel(): any {
    if (!this.channel) {
      this.initialize();
    }
    return this.channel;
  }

  bind(eventName: string, callback: (data: any) => void): void {
    const channel = this.getChannel();
    channel.bind(eventName, callback);
  }

  bindToNotifications(eventName: string, callback: (data: any) => void): void {
    if (!this.notificationsChannel) {
      this.initialize();
    }
    this.notificationsChannel.bind(eventName, callback);
  }

  unbind(eventName: string, callback?: (data: any) => void): void {
    if (this.channel) {
      if (callback) {
        this.channel.unbind(eventName, callback);
      } else {
        this.channel.unbind(eventName);
      }
    }
  }

  unbindFromNotifications(eventName: string, callback?: (data: any) => void): void {
    if (this.notificationsChannel) {
      if (callback) {
        this.notificationsChannel.unbind(eventName, callback);
      } else {
        this.notificationsChannel.unbind(eventName);
      }
    }
  }

  getConnectionState(): Observable<string> {
    return this.connectionState$.asObservable();
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.unbind_all();
      this.pusherInstance?.unsubscribe('messaging-channel');
    }
    if (this.notificationsChannel) {
      this.notificationsChannel.unbind_all();
      this.pusherInstance?.unsubscribe('notifications-channel');
    }
    if (this.pusherInstance) {
      this.pusherInstance.disconnect();
      this.pusherInstance = null;
      this.channel = null;
      this.notificationsChannel = null;
    }
  }
}


