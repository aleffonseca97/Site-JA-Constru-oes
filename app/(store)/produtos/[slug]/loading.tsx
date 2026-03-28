export default function ProdutoDetalheLoading() {
  return (
    <div className="ui-container py-8">
      <div className="animate-pulse">
        <div className="mb-4 h-4 w-32 rounded bg-gray-200" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-8 w-32 rounded bg-gray-200" />
            <div className="h-20 w-full rounded bg-gray-200" />
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-12 w-48 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
