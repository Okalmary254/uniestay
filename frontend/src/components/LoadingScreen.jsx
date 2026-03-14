export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-teal-400" />
        <span className="text-lg font-semibold text-gray-800">UniStay</span>
      </div>
      <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
