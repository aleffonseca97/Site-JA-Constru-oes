export default function ProdutosLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-10 w-64 rounded bg-gray-200" />
          <div className="h-5 w-96 rounded bg-gray-200" />
        </div>
        <div className="h-16 rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square rounded-xl bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-10 rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
