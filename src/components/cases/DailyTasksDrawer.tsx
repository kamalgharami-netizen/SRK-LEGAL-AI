import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Scale,
  Clock,
  Share2,
  Volume2,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { DailyTask, LegalCase, CompanyProfile } from '../../types/erp';
import { NotificationService } from '../../services/notificationService';
import { useLanguage } from '../../context/LanguageContext';

interface DailyTasksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DailyTask[];
  cases: LegalCase[];
  company: CompanyProfile;
  onToggleTask: (id: string) => void;
  onSaveTask: (task: DailyTask) => void;
  onDeleteTask: (id: string) => void;
  onSelectCase?: (c: LegalCase) => void;
}

export const DailyTasksDrawer: React.FC<DailyTasksDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  cases,
  company,
  onToggleTask,
  onSaveTask,
  onDeleteTask,
  onSelectCase,
}) => {
  const { t } = useLanguage();
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newCaseId, setNewCaseId] = useState('');
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Cases with hearing today
  const todayHearings = cases.filter((c) => c.nextHearingDate === todayStr);

  // Upcoming hearings in next 7 days (excluding today)
  const upcomingHearings = cases.filter((c) => {
    if (!c.nextHearingDate) return false;
    const diff = (new Date(c.nextHearingDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24);
    return diff > 0 && diff <= 7;
  });

  // Filter tasks
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const matchedCase = cases.find((c) => c.id === newCaseId);

    const task: DailyTask = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      dueDate: newDueDate,
      priority: newPriority,
      isCompleted: false,
      caseId: newCaseId || undefined,
      caseNo: matchedCase?.caseNo || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveTask(task);
    setNewTitle('');
    NotificationService.playAlertChime();
  };

  const handleShareWhatsAppHearing = (c: LegalCase) => {
    const text = t(
      `Dear ${c.partyName},\n\nNotice of Hearing from ${company.name}:\nCase No: ${c.caseNo} (${c.type.toUpperCase()})\nCourt / Authority: ${c.courtOrAuthority}\nHearing is scheduled for TODAY: ${c.nextHearingDate}.\n\nPlease ensure your presence or required papers.\n\nThank you!`,
      `শ্রদ্ধেয় ${c.partyName},\n\n${company.name}-এর জরুরি শুনানি নোটিশ:\nকেস নং: ${c.caseNo} (${c.type.toUpperCase()})\nকর্তৃপক্ষ / আদালত: ${c.courtOrAuthority}\nশুনানির নির্ধারিত তারিখ: আজ (${c.nextHearingDate})।\n\nউপস্থিত থাকার জন্য বিনীত অনুরোধ করা হচ্ছে।\n\nধন্যবাদ!`
    );
    const cleanPhone = (c.partyPhone || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleRequestBrowserAlerts = async () => {
    const granted = await NotificationService.requestPermission();
    setHasRequestedPermission(true);
    NotificationService.playAlertChime();
    if (granted) {
      NotificationService.sendDesktopNotification('SRK ERP Software', {
        body: t(
          `Daily Notifications enabled. You have ${todayHearings.length} hearing(s) and ${pendingTasks.length} task(s) today.`,
          `দৈনিক নোটিফিকেশন চালু হয়েছে। আজ আপনার ${todayHearings.length} টি শুনানি এবং ${pendingTasks.length} টি কাজ রয়েছে।`
        ),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs no-print">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('Daily Notifications & Tasks', 'দৈনিক কাজ ও শুনানির তাগিদ')}</h3>
              <p className="text-[11px] text-slate-500 font-mono">{t('Today:', 'আজ:')} {todayStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => NotificationService.playAlertChime()}
              title={t('Play Daily Alert Chime', 'সতর্কতা শব্দ বাজান')}
              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-200/60"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Browser Desktop Notification Prompt */}
          {'Notification' in window && Notification.permission !== 'granted' && !hasRequestedPermission && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-indigo-900">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="text-[11px] font-medium leading-tight">
                  {t(
                    'Receive browser notifications for daily hearings & tasks',
                    'দৈনিক শুনানি ও কাজের জন্য ব্রাউজার নোটিফিকেশন চালু করুন'
                  )}
                </span>
              </div>
              <button
                onClick={handleRequestBrowserAlerts}
                className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors whitespace-nowrap"
              >
                {t('Enable', 'চালু করুন')}
              </button>
            </div>
          )}

          {/* Section 1: Today's Scheduled Hearings */}
          {todayHearings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-amber-950 font-bold uppercase tracking-wider text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-amber-700" />
                  <span>{t('Hearings Scheduled Today', 'আজকের নির্ধারিত শুনানি')} ({todayHearings.length})</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                  {t('Action Due', 'জরুরি')}
                </span>
              </div>

              <div className="space-y-2">
                {todayHearings.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-white border border-amber-200 shadow-2xs space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <button
                        onClick={() => {
                          if (onSelectCase) onSelectCase(c);
                        }}
                        className="font-mono font-bold text-indigo-700 hover:underline text-left"
                      >
                        {c.caseNo}
                      </button>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        {c.type === 'mutation'
                          ? t('Mutation', 'মিউটেশন')
                          : c.type === 'misc_case'
                          ? t('Misc Case', 'মিস কেস')
                          : c.type === 'rti'
                          ? t('RTI', 'আরটিআই')
                          : t('LR Appeal', 'এলআর আপিল')}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                    <div className="text-[11px] text-slate-600">
                      {t('Client:', 'মক্কেল:')} <span className="font-bold text-slate-800">{c.partyName}</span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                      <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {c.courtOrAuthority}
                      </span>
                      <button
                        onClick={() => handleShareWhatsAppHearing(c)}
                        title={t('Send WhatsApp notice to client', 'মক্কেলকে হোয়াটসঅ্যাপ পাঠান')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        <Share2 className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Quick Add Daily Task */}
          <form onSubmit={handleAddTask} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              {t('+ Add Daily Task / Reminder', '+ নতুন কাজ বা তাগিদ যোগ করুন')}
            </h4>

            <div>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('e.g. Submit mutation certified copy, meet RI...', 'যেমন: পর্চার নকল তোলা, আরও মিটিং...')}
                className="w-full h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">{t('Due Date', 'শেষ তারিখ')}</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">{t('Priority', 'গুরুত্ব')}</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-lg outline-none font-semibold"
                >
                  <option value="high">{t('High Priority', 'জরুরি / উচ্চ')}</option>
                  <option value="medium">{t('Medium Priority', 'সাধারণ / মাধ্যম')}</option>
                  <option value="low">{t('Low Priority', 'কম জরুরি')}</option>
                </select>
              </div>
            </div>

            {cases.length > 0 && (
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">{t('Link Case (Optional)', 'কেসের সাথে যুক্ত করুন')}</label>
                <select
                  value={newCaseId}
                  onChange={(e) => setNewCaseId(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                >
                  <option value="">{t('No linked case', 'কোনো কেসের সাথে যুক্ত নয়')}</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNo} ({c.type.toUpperCase()}) — {c.partyName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-8 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('Add Task', 'কাজ যোগ করুন')}</span>
            </button>
          </form>

          {/* Section 3: Pending Tasks */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                {t('Pending Tasks', 'বাকি কাজসমূহ')} ({pendingTasks.length})
              </h4>
              {pendingTasks.length > 0 && (
                <button
                  onClick={() => {
                    pendingTasks.forEach((t) => onToggleTask(t.id));
                  }}
                  className="text-[10px] text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>{t('Mark All Done', 'সব সম্পন্ন করুন')}</span>
                </button>
              )}
            </div>

            {pendingTasks.length === 0 ? (
              <p className="text-slate-400 text-center py-4 italic">{t('No pending tasks for today!', 'আজকের কোনো কাজ বাকি নেই!')}</p>
            ) : (
              <div className="space-y-1.5">
                {pendingTasks.map((task) => {
                  const isToday = task.dueDate === todayStr;
                  const isPast = task.dueDate < todayStr;

                  return (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors flex items-start gap-2.5 group"
                    >
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 shrink-0"
                      >
                        <Circle className="h-4 w-4" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 leading-snug">{task.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span
                            className={`font-semibold ${
                              isToday
                                ? 'text-amber-800 bg-amber-50 px-1 rounded font-bold'
                                : isPast
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-600'
                            }`}
                          >
                            {t('Due:', 'তারিখ:')} {task.dueDate} {isToday ? t('(Today)', '(আজ)') : ''}
                          </span>

                          <span
                            className={`uppercase font-semibold px-1 rounded font-sans ${
                              task.priority === 'high'
                                ? 'bg-rose-50 text-rose-700'
                                : task.priority === 'medium'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority === 'high'
                              ? t('High', 'জরুরি')
                              : task.priority === 'medium'
                              ? t('Medium', 'সাধারণ')
                              : t('Low', 'কম')}
                          </span>

                          {task.caseNo && <span className="text-indigo-600 font-bold">{task.caseNo}</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Upcoming Hearings in Next 7 Days */}
          {upcomingHearings.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                <span>{t('Hearings in Next 7 Days', 'আগামী ৭ দিনের শুনানি')} ({upcomingHearings.length})</span>
              </div>
              <div className="space-y-1.5">
                {upcomingHearings.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between items-center text-[11px]"
                  >
                    <div>
                      <span className="font-mono font-bold text-indigo-700">{c.caseNo}</span>
                      <span className="text-slate-600 ml-1.5 truncate">{c.partyName}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      {c.nextHearingDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                {t('Completed Tasks', 'সম্পন্ন কাজ')} ({completedTasks.length})
              </h4>
              <div className="space-y-1">
                {completedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2 line-through truncate">
                      <button onClick={() => onToggleTask(t.id)} className="text-emerald-600 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <span className="truncate">{t.title}</span>
                    </div>
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
