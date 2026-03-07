/**
 * Notification service that works in both Tauri and Browser environments.
 * - Tauri: Uses native OS notifications via tauri-plugin-notification (if available)
 * - Browser: Uses the Web Notifications API
 */

import { isTauri } from '@/lib/ollamaClient';

let permissionGranted = false;

/** Request notification permission (browser only — Tauri auto-grants) */
export async function requestNotificationPermission(): Promise<boolean> {
    if (isTauri()) {
        try {
            const pluginPath = '@tauri-apps/plugin-notification';
            const mod = await import(/* @vite-ignore */ pluginPath);
            let perm = await mod.isPermissionGranted();
            if (!perm) {
                const result = await mod.requestPermission();
                perm = result === 'granted';
            }
            permissionGranted = perm;
            return perm;
        } catch {
            // fallback to browser
        }
    }

    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            permissionGranted = true;
            return true;
        }
        if (Notification.permission !== 'denied') {
            const result = await Notification.requestPermission();
            permissionGranted = result === 'granted';
            return permissionGranted;
        }
    }
    return false;
}

/** Send a notification */
export async function sendNotification(title: string, body: string) {
    if (!permissionGranted) {
        const ok = await requestNotificationPermission();
        if (!ok) return;
    }

    if (isTauri()) {
        try {
            const pluginPath = '@tauri-apps/plugin-notification';
            const mod = await import(/* @vite-ignore */ pluginPath);
            mod.sendNotification({ title, body });
            return;
        } catch {
            // fallback to browser
        }
    }

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/favicon.svg',
        });
    }
}

/**
 * Check tasks and calendar events and send reminder notifications.
 * Call this periodically (e.g., every 30 minutes from App.tsx).
 */
export function checkReminders(
    tasks: { id: string; title: string; status: string; dueDate?: string }[],
    calendarEvents?: { id: string; title: string; date: string }[]
) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const notifiedKey = `notified-${today}`;
    const alreadyNotified: string[] = JSON.parse(localStorage.getItem(notifiedKey) || '[]');

    // Tasks due today
    const dueTodayTasks = tasks.filter(
        (t) => t.status !== 'done' && t.dueDate && t.dueDate.startsWith(today)
    );

    for (const task of dueTodayTasks) {
        const nid = `task-${task.id}`;
        if (!alreadyNotified.includes(nid)) {
            sendNotification(
                '📋 Lembrete de Tarefa',
                `"${task.title}" vence hoje!`
            );
            alreadyNotified.push(nid);
        }
    }

    // Calendar events today
    if (calendarEvents) {
        const todayEvents = calendarEvents.filter((e) => e.date === today);
        for (const event of todayEvents) {
            const nid = `event-${event.id}`;
            if (!alreadyNotified.includes(nid)) {
                sendNotification(
                    '🗓️ Evento Hoje',
                    `"${event.title}" está agendado para hoje!`
                );
                alreadyNotified.push(nid);
            }
        }
    }

    localStorage.setItem(notifiedKey, JSON.stringify(alreadyNotified));
}
