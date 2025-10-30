export default function Footer(){
  return (
    <footer className="border-t mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500 flex items-center justify-between">
        <div>© {new Date().getFullYear()} BRVM Analysis Suite</div>
        <div>Made for Côte d’Ivoire • v2</div>
      </div>
    </footer>
  );
}
