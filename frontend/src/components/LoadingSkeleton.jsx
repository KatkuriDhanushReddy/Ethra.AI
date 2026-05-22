export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card p-6 space-y-4">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-6">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-10 w-16" />
        </div>
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6 h-64"><Skeleton className="h-full w-full" /></div>
      <div className="card p-6 h-64"><Skeleton className="h-full w-full" /></div>
    </div>
  </div>
);
