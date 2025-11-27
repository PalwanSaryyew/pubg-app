export default function ProductDetailLoading() {
   return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
         <div className="bg-gray-200 dark:bg-gray-700 h-64 w-full rounded-lg mb-4"></div>
         <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
         <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
         <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
         </div>
      </div>
   );
}
