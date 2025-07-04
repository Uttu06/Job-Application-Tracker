import { Interview, Application } from '../types';

export interface Reminder {
  id: string;
  userId: string;
  type: 'interview' | 'follow-up' | 'application-deadline' | 'custom';
  title: string;
  message: string;
  scheduledDate: Date;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';
  isCompleted: boolean;
  relatedApplicationId?: string;
  relatedInterviewId?: string;
  notificationMethods: ('email' | 'browser' | 'sms')[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  smsNotifications: boolean;
  interviewReminders: {
    enabled: boolean;
    timeBefore: number; // minutes
  };
  followUpReminders: {
    enabled: boolean;
    daysAfterApplication: number;
    daysAfterInterview: number;
  };
  applicationDeadlines: {
    enabled: boolean;
    daysBefore: number;
  };
}

class ReminderService {
  private reminders: Reminder[] = [];
  private settings: ReminderSettings = {
    emailNotifications: true,
    browserNotifications: true,
    smsNotifications: false,
    interviewReminders: {
      enabled: true,
      timeBefore: 60, // 1 hour before
    },
    followUpReminders: {
      enabled: true,
      daysAfterApplication: 7,
      daysAfterInterview: 3,
    },
    applicationDeadlines: {
      enabled: true,
      daysBefore: 1,
    },
  };

  constructor() {
    this.initializeBrowserNotifications();
    this.startReminderChecker();
  }

  // Initialize browser notifications
  private async initializeBrowserNotifications(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  // Start the reminder checking service
  private startReminderChecker(): void {
    // Check for due reminders every minute
    setInterval(() => {
      this.checkDueReminders();
    }, 60000);

    // Initial check
    this.checkDueReminders();
  }

  // Check for due reminders and trigger notifications
  private async checkDueReminders(): Promise<void> {
    const now = new Date();
    const dueReminders = this.reminders.filter(
      reminder => !reminder.isCompleted && reminder.scheduledDate <= now
    );

    for (const reminder of dueReminders) {
      await this.triggerReminder(reminder);
      
      if (!reminder.isRecurring) {
        reminder.isCompleted = true;
      } else {
        // Schedule next occurrence for recurring reminders
        this.scheduleNextOccurrence(reminder);
      }
    }
  }

  // Trigger a reminder notification
  private async triggerReminder(reminder: Reminder): Promise<void> {
    const { notificationMethods, title, message } = reminder;

    // Browser notification
    if (notificationMethods.includes('browser') && this.settings.browserNotifications) {
      this.showBrowserNotification(title, message);
    }

    // Email notification (would integrate with email service)
    if (notificationMethods.includes('email') && this.settings.emailNotifications) {
      await this.sendEmailNotification(reminder);
    }

    // SMS notification (would integrate with SMS service)
    if (notificationMethods.includes('sms') && this.settings.smsNotifications) {
      await this.sendSMSNotification(reminder);
    }

    // Log the reminder trigger
    console.log(`Reminder triggered: ${title} - ${message}`);
  }

  // Show browser notification
  private showBrowserNotification(title: string, message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'job-tracker-reminder',
      });
    }
  }

  // Send email notification (placeholder - would integrate with email service)
  private async sendEmailNotification(reminder: Reminder): Promise<void> {
    try {
      // This would integrate with an email service like SendGrid, AWS SES, etc.
      console.log('Email notification would be sent:', reminder);
      
      // Example API call to email service
      // await fetch('/api/notifications/email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: userEmail,
      //     subject: reminder.title,
      //     body: reminder.message,
      //   }),
      // });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  // Send SMS notification (placeholder - would integrate with SMS service)
  private async sendSMSNotification(reminder: Reminder): Promise<void> {
    try {
      // This would integrate with an SMS service like Twilio, AWS SNS, etc.
      console.log('SMS notification would be sent:', reminder);
      
      // Example API call to SMS service
      // await fetch('/api/notifications/sms', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: userPhone,
      //     message: `${reminder.title}: ${reminder.message}`,
      //   }),
      // });
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  // Schedule next occurrence for recurring reminders
  private scheduleNextOccurrence(reminder: Reminder): void {
    const { recurringInterval } = reminder;
    const nextDate = new Date(reminder.scheduledDate);

    switch (recurringInterval) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }

    reminder.scheduledDate = nextDate;
    reminder.updatedAt = new Date();
  }

  // Create a new reminder
  async createReminder(reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reminder> {
    const reminder: Reminder = {
      ...reminderData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reminders.push(reminder);
    await this.saveReminders();
    return reminder;
  }

  // Update an existing reminder
  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const reminderIndex = this.reminders.findIndex(r => r.id === id);
    if (reminderIndex === -1) {
      throw new Error('Reminder not found');
    }

    this.reminders[reminderIndex] = {
      ...this.reminders[reminderIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await this.saveReminders();
    return this.reminders[reminderIndex];
  }

  // Delete a reminder
  async deleteReminder(id: string): Promise<void> {
    this.reminders = this.reminders.filter(r => r.id !== id);
    await this.saveReminders();
  }

  // Get all reminders for a user
  getReminders(userId: string): Reminder[] {
    return this.reminders.filter(r => r.userId === userId);
  }

  // Get upcoming reminders
  getUpcomingReminders(userId: string, days: number = 7): Reminder[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return this.reminders.filter(
      r => r.userId === userId && 
           !r.isCompleted && 
           r.scheduledDate >= now && 
           r.scheduledDate <= futureDate
    );
  }

  // Auto-create reminders for interviews
  async createInterviewReminders(interview: Interview): Promise<void> {
    if (!this.settings.interviewReminders.enabled) return;

    const interviewDate = new Date(interview.date);
    const reminderDate = new Date(interviewDate.getTime() - (this.settings.interviewReminders.timeBefore * 60000));

    await this.createReminder({
      userId: interview.userId,
      type: 'interview',
      title: `Upcoming Interview: ${interview.companyName}`,
      message: `You have an interview with ${interview.companyName} for ${interview.applicationTitle} in ${this.settings.interviewReminders.timeBefore} minutes.`,
      scheduledDate: reminderDate,
      isRecurring: false,
      isCompleted: false,
      relatedApplicationId: interview.applicationId,
      relatedInterviewId: interview.id,
      notificationMethods: ['browser', 'email'],
    });
  }

  // Auto-create follow-up reminders
  async createFollowUpReminders(application: Application): Promise<void> {
    if (!this.settings.followUpReminders.enabled) return;

    const applicationDate = new Date(application.applicationDate);
    const followUpDate = new Date(applicationDate.getTime() + (this.settings.followUpReminders.daysAfterApplication * 24 * 60 * 60 * 1000));

    await this.createReminder({
      userId: application.userId,
      type: 'follow-up',
      title: `Follow-up Reminder: ${application.companyName}`,
      message: `It's been ${this.settings.followUpReminders.daysAfterApplication} days since you applied to ${application.companyName} for ${application.jobTitle}. Consider following up.`,
      scheduledDate: followUpDate,
      isRecurring: false,
      isCompleted: false,
      relatedApplicationId: application.id,
      notificationMethods: ['browser', 'email'],
    });
  }

  // Update reminder settings
  updateSettings(newSettings: Partial<ReminderSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Get current settings
  getSettings(): ReminderSettings {
    return { ...this.settings };
  }

  // Save reminders to localStorage (in production, this would be saved to the backend)
  private async saveReminders(): Promise<void> {
    try {
      localStorage.setItem('job-tracker-reminders', JSON.stringify(this.reminders));
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  }

  // Load reminders from localStorage
  async loadReminders(): Promise<void> {
    try {
      const saved = localStorage.getItem('job-tracker-reminders');
      if (saved) {
        this.reminders = JSON.parse(saved).map((r: any) => ({
          ...r,
          scheduledDate: new Date(r.scheduledDate),
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  }

  // Save settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('job-tracker-reminder-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save reminder settings:', error);
    }
  }

  // Load settings from localStorage
  loadSettings(): void {
    try {
      const saved = localStorage.getItem('job-tracker-reminder-settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load reminder settings:', error);
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clear all completed reminders
  async clearCompletedReminders(userId: string): Promise<void> {
    this.reminders = this.reminders.filter(
      r => !(r.userId === userId && r.isCompleted)
    );
    await this.saveReminders();
  }

  // Snooze a reminder
  async snoozeReminder(id: string, minutes: number): Promise<void> {
    const reminder = this.reminders.find(r => r.id === id);
    if (reminder) {
      reminder.scheduledDate = new Date(Date.now() + (minutes * 60000));
      reminder.updatedAt = new Date();
      await this.saveReminders();
    }
  }
}

// Create and export singleton instance
export const reminderService = new ReminderService();
export default reminderService;

