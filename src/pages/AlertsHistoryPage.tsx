import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { NotificationItem } from '../types';
import { Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  Trash2
} from 'lucide-react';

export const AlertsHistoryPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setNotifications(StorageService.getNotifications());
  }, []);

  const handleMarkAllRead = () => {
    const notifs = StorageService.getNotifications();
    notifs.forEach((n) => StorageService.markNotificationRead(n.id));
    setNotifications([...StorageService.getNotifications()]);
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange mb-1">
              <Bell className="w-3.5 h-3.5" />
              Notifications & Proximity Warnings
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Hazard Alert History
            </h1>
            <p className="text-sm text-brand-slate mt-1">
              Record of corridor warnings, community confirmations, and road maintenance resolutions.
            </p>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-brand-orange hover:text-brand-orange-hover"
          >
            Mark all read
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                item.read
                  ? 'bg-white border-brand-neutral-grey'
                  : 'bg-brand-soft-blue/40 border-brand-orange/40 shadow-subtle'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  item.type === 'hazard_proximity'
                    ? 'bg-red-100 text-brand-red'
                    : item.type === 'report_confirmed'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-brand-green'
                }`}
              >
                {item.type === 'hazard_proximity' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : item.type === 'report_confirmed' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-brand-navy">{item.title}</h4>
                  <span className="text-[11px] text-brand-slate-light flex-shrink-0">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-brand-slate mt-1 leading-relaxed">{item.message}</p>

                {item.hazardId && (
                  <Link
                    to="/app/map"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:text-brand-orange-hover mt-2"
                  >
                    <span>View on Live Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

