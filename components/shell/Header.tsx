import Link from 'next/link';

const links: Array<[string, string]> = [
  ['Accueil', '/'],
  ['Sociétés', '/companies'],
  ['Technique', '/technical'],
  ['Fondamental', '/fundamental'],
  ['Recommandations', '/recommendations'],
  ['Training', '/training'],
  ['Éducation', '/education'],
  ['Contact', '/contact'],
];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6 overflow-x-auto">
        <Link href="/" className="font-bold whitespace-nowrap">
          BRVM Dashboard
        </Link>
        <nav className="flex gap-4 text-sm text-gray-600">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-black whitespace-nowrap">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
