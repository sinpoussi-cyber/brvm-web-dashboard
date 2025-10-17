// ==============================================================================
// SCRIPT DE VÉRIFICATION - Vérifie que tous les fichiers sont présents
// ==============================================================================
// Usage: node verify-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la structure du projet BRVM Dashboard...\n');

const requiredFiles = {
  'Configuration': [
    'package.json',
    'postcss.config.js',
    'next.config.js',
    'tailwind.config.ts',
    'tsconfig.json',
    '.gitignore',
    '.env.example',
    'README.md'
  ],
  'Types': [
    'src/types/api.ts',
    'src/types/company.ts',
    'src/types/portfolio.ts',
    'src/types/user.ts'
  ],
  'Utils': [
    'src/lib/utils/formatters.ts',
    'src/lib/utils/constants.ts',
    'src/lib/utils/validators.ts',
    'src/lib/utils/cn.ts'
  ],
  'API Clients': [
    'src/lib/api/client.ts',
    'src/lib/api/auth.ts',
    'src/lib/api/companies.ts',
    'src/lib/api/market.ts',
    'src/lib/api/portfolio.ts',
    'src/lib/api/users.ts'
  ],
  'Hooks': [
    'src/lib/hooks/useAuth.ts',
    'src/lib/hooks/useCompanies.ts',
    'src/lib/hooks/useMarketData.ts',
    'src/lib/hooks/usePortfolio.ts'
  ],
  'Stores': [
    'src/lib/store/authStore.ts',
    'src/lib/store/portfolioStore.ts',
    'src/lib/store/preferencesStore.ts'
  ],
  'UI Components': [
    'src/components/ui/button.tsx',
    'src/components/ui/card.tsx',
    'src/components/ui/input.tsx',
    'src/components/ui/table.tsx',
    'src/components/ui/badge.tsx',
    'src/components/ui/skeleton.tsx'
  ],
  'Charts': [
    'src/components/charts/PriceChart.tsx',
    'src/components/charts/SectorChart.tsx'
  ],
  'App Pages': [
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/app/globals.css',
    'src/app/(auth)/login/page.tsx',
    'src/app/(auth)/register/page.tsx',
    'src/app/(dashboard)/layout.tsx',
    'src/app/(dashboard)/dashboard/page.tsx',
    'src/app/(dashboard)/companies/page.tsx',
    'src/app/(dashboard)/companies/[symbol]/page.tsx',
    'src/app/(dashboard)/portfolio/page.tsx',
    'src/app/(dashboard)/settings/page.tsx'
  ]
};

let totalFiles = 0;
let missingFiles = 0;
let presentFiles = 0;

console.log('='='.repeat(60));

for (const [category, files] of Object.entries(requiredFiles)) {
  console.log(`\n📁 ${category}:`);
  
  for (const file of files) {
    totalFiles++;
    const exists = fs.existsSync(file);
    
    if (exists) {
      console.log(`  ✅ ${file}`);
      presentFiles++;
    } else {
      console.log(`  ❌ ${file} - MANQUANT`);
      missingFiles++;
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 RÉSUMÉ:');
console.log(`   Total de fichiers : ${totalFiles}`);
console.log(`   ✅ Présents : ${presentFiles}`);
console.log(`   ❌ Manquants : ${missingFiles}`);

const percentage = Math.round((presentFiles / totalFiles) * 100);
console.log(`   📈 Progression : ${percentage}%`);

if (missingFiles === 0) {
  console.log('\n🎉 PARFAIT ! Tous les fichiers sont présents.');
  console.log('\n📝 Prochaines étapes :');
  console.log('   1. npm install');
  console.log('   2. Créer .env.local depuis .env.example');
  console.log('   3. npm run dev');
  console.log('   4. Ouvrir http://localhost:3000');
} else {
  console.log(`\n⚠️  Il manque ${missingFiles} fichier(s).`);
  console.log('\n📝 Créez les fichiers manquants avant de continuer.');
  console.log('   Référez-vous à CHECKLIST_FICHIERS_A_CREER.md');
}

console.log('\n' + '='.repeat(60) + '\n');

// Vérifier node_modules
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules présent');
} else {
  console.log('⚠️  node_modules absent - Exécutez: npm install');
}

// Vérifier .env.local
if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local présent');
} else {
  console.log('⚠️  .env.local absent - Créez-le depuis .env.example');
}

console.log('');
