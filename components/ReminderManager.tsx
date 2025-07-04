import React, { useState, useEffect } from 'react';
import { reminderService, Reminder, ReminderSettings } from '../services/reminderService';
import { Bell, Plus, Edit, Trash2, Clock, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ReminderManagerProps {
  onClose?: () => void;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<ReminderSettings>(reminderService.getSettings());
  const [showSettings, setShowSettings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    if (user) {
      loadReminders();
      reminderService.loadSettings();
      setSettings(reminderService.getSettings());
    }
  }, [user]);

  const loadReminders = async () => {
    if (user) {
      await reminderService.loadReminders();
      setReminders(reminderService.getReminders(user.uid));
    }
  };

  const handleCreateReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await reminderService.createReminder(reminderData);
      await loadReminders();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  const handleUpdateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      await reminderService.updateReminder(id, updates);
      await loadReminders();
      setEditingReminder(null);
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await reminderService.deleteReminder(id);
      await loadReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<ReminderSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    reminderService.updateSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleSnoozeReminder = async (id: string, minutes: number) => {
    try {
      await reminderService.snoozeReminder(id, minutes);
      await loadReminders();
    } catch (error) {
      console.error('Failed to snooze reminder:', error);
    }
  };

  const getUpcomingReminders = () => {
    return reminders.filter(r => !r.isCompleted && new Date(r.scheduledDate) > new Date());
  };

  const getOverdueReminders = () => {
    return reminders.filter(r => !r.isCompleted && new Date(r.scheduledDate) <= new Date());
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getReminderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'interview':
        return <Clock className="w-4 h-4" />;
      case 'follow-up':
        return <Bell className="w-4 h-4" />;
      case 'application-deadline':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Reminder Manager
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reminder</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {showSettings && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Notifications
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleUpdateSettings({ emailNotifications: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Browser Notifications
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.browserNotifications}
                    onChange={(e) => handleUpdateSettings({ browserNotifications: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Interview Reminders
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.interviewReminders.enabled}
                    onChange={(e) => handleUpdateSettings({ 
                      interviewReminders: { ...settings.interviewReminders, enabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Follow-up Reminders
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.followUpReminders.enabled}
                    onChange={(e) => handleUpdateSettings({ 
                      followUpReminders: { ...settings.followUpReminders, enabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Overdue Reminders */}
          {getOverdueReminders().length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Overdue Reminders ({getOverdueReminders().length})
              </h3>
              <div className="space-y-2">
                {getOverdueReminders().map((reminder) => (
                  <div key={reminder.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-red-600 dark:text-red-400 mt-1">
                          {getReminderIcon(reminder.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {reminder.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reminder.message}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Due: {formatDate(reminder.scheduledDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSnoozeReminder(reminder.id, 30)}
                          className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          Snooze 30m
                        </button>
                        <button
                          onClick={() => handleUpdateReminder(reminder.id, { isCompleted: true })}
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Upcoming Reminders ({getUpcomingReminders().length})
            </h3>
            {getUpcomingReminders().length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No upcoming reminders. Click "Add Reminder" to create one.
              </p>
            ) : (
              <div className="space-y-2">
                {getUpcomingReminders().map((reminder) => (
                  <div key={reminder.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600 dark:text-blue-400 mt-1">
                          {getReminderIcon(reminder.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {reminder.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reminder.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Scheduled: {formatDate(reminder.scheduledDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingReminder(reminder)}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Reminder Modal */}
      {(showAddForm || editingReminder) && (
        <ReminderForm
          reminder={editingReminder}
          userId={user.uid}
          onSave={editingReminder ? 
            (updates) => handleUpdateReminder(editingReminder.id, updates) :
            handleCreateReminder
          }
          onCancel={() => {
            setShowAddForm(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
};

interface ReminderFormProps {
  reminder?: Reminder | null;
  userId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ reminder, userId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    message: reminder?.message || '',
    type: reminder?.type || 'custom' as Reminder['type'],
    scheduledDate: reminder?.scheduledDate ? 
      new Date(reminder.scheduledDate).toISOString().slice(0, 16) : 
      new Date().toISOString().slice(0, 16),
    isRecurring: reminder?.isRecurring || false,
    recurringInterval: reminder?.recurringInterval || 'weekly' as 'daily' | 'weekly' | 'monthly',
    notificationMethods: reminder?.notificationMethods || ['browser'] as ('email' | 'browser' | 'sms')[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      userId,
      scheduledDate: new Date(formData.scheduledDate),
      isCompleted: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {reminder ? 'Edit Reminder' : 'Add New Reminder'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Reminder['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="custom">Custom</option>
                <option value="interview">Interview</option>
                <option value="follow-up">Follow-up</option>
                <option value="application-deadline">Application Deadline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recurring reminder
              </label>
            </div>
            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Repeat Interval
                </label>
                <select
                  value={formData.recurringInterval}
                  onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {reminder ? 'Update' : 'Create'} Reminder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReminderManager;

