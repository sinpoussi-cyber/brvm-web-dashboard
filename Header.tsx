import { useUser } from '@/hooks/useUser';

export default function Header() {
  const { user, logout } = useUser();

  return (
    <header className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-50">
      <div className="font-bold text-xl">📈 BRVM Dashboard</div>
      {user ? (
        <div className="flex items-center gap-4">
          <span>👋 Bonjour, {user.first_name}</span>
          <button
            onClick={logout}
            className="px-3 py-1 border rounded-lg hover:bg-gray-100"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <div className="space-x-3">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Se connecter
          </a>
          <a
            href="/auth/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            Créer un compte
          </a>
        </div>
      )}
    </header>
  );
}
