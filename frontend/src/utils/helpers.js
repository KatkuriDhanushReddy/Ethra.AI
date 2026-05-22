export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const priorityColors = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
};

export const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const projectStatusColors = {
  planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  on_hold: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  completed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};
