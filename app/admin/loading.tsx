export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-gray-800" />
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-12 w-12 rounded bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-gray-800" />
                <div className="h-4 w-1/4 rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
