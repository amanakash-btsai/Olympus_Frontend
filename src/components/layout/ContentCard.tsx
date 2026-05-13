interface ContentCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function ContentCard({ title, subtitle, actions, children }: ContentCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      {(title || actions) && (
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
