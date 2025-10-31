'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Company = { symbol: string; company_name: string };
type Props = {
  onSelect: (symbol: string) => void;
};

export default function CompanySelect({ onSelect }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc('list_companies');
      if (!error && data) setCompanies(data);
    })();
  }, []);

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelected(val);
    onSelect(val);
  }

  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm text-gray-600">Sélectionnez une société :</label>
      <select
        value={selected}
        onChange={handleSelect}
        className="border rounded-xl p-2 w-full bg-white"
      >
        <option value="">— Choisir —</option>
        {companies.map((c) => (
          <option key={c.symbol} value={c.symbol}>
            {c.company_name} ({c.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}
