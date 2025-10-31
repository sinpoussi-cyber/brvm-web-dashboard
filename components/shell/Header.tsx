import Link from 'next/link';

const links = [
  ['Accueil','/'],
  ['Éducation','/education'],
  ['Training','/training'],
  ['Fondamental','/fundamental'],
  ['Technique','/technical'],
  ['Prédictions','/predictions'],
  ['Sociétés','/companies'],
  ['Recommandations','/recommendations'],
  ['Logs','/logs'],
  ['Contact','/contact'],
];

export default function Header(){
  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6 overflow-x-auto">
        <Link href="/" className="font-bold">BRVM Dashboard</Link>
        <nav className="flex gap-4 text-sm text-gray-600">
          {links.map(([label,href]) => <Link key={href} href={href} className="hover:text-black whitespace-nowrap">{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
