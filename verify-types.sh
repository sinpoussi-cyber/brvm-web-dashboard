#!/bin/bash

# ==============================================================================
# Script de vérification des types - BRVM Dashboard
# ==============================================================================

echo "🔍 Vérification de la structure des types..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Vérifier que les fichiers existent
echo "📁 Vérification des fichiers..."

files=(
    "src/types/company.ts"
    "src/types/api.ts"
    "src/lib/api/companies.ts"
    "src/lib/hooks/useCompanies.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file existe"
    else
        echo -e "${RED}✗${NC} $file manquant"
        ((errors++))
    fi
done

echo ""

# Vérifier que companiesApi.ts n'existe plus
if [ -f "src/lib/api/companiesApi.ts" ]; then
    echo -e "${RED}✗${NC} src/lib/api/companiesApi.ts existe encore (à supprimer)"
    ((errors++))
else
    echo -e "${GREEN}✓${NC} Ancien fichier companiesApi.ts supprimé"
fi

echo ""
echo "📝 Vérification du contenu..."

# Vérifier src/types/company.ts
if grep -q "ComparableCompany" "src/types/company.ts" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} src/types/company.ts contient ComparableCompany"
else
    echo -e "${RED}✗${NC} src/types/company.ts ne contient pas ComparableCompany"
    ((errors++))
fi

if grep -q "ComparableCompaniesResponse" "src/types/company.ts" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} src/types/company.ts contient ComparableCompaniesResponse"
else
    echo -e "${RED}✗${NC} src/types/company.ts ne contient pas ComparableCompaniesResponse"
    ((errors++))
fi

# Vérifier src/types/api.ts
if grep -q "export type.*from './company'" "src/types/api.ts" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} src/types/api.ts ré-exporte les types depuis company.ts"
else
    echo -e "${RED}✗${NC} src/types/api.ts ne ré-exporte pas les types depuis company.ts"
    ((errors++))
fi

# Vérifier src/lib/api/companies.ts
if grep -q "@/types/company" "src/lib/api/companies.ts" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} src/lib/api/companies.ts importe depuis @/types/company"
else
    echo -e "${RED}✗${NC} src/lib/api/companies.ts n'importe pas depuis @/types/company"
    ((errors++))
fi

if grep -q "@/types/api" "src/lib/api/companies.ts" 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC}  src/lib/api/companies.ts importe encore depuis @/types/api"
    ((warnings++))
fi

# Vérifier src/lib/hooks/useCompanies.ts
if grep -q "../api/companies" "src/lib/hooks/useCompanies.ts" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} src/lib/hooks/useCompanies.ts importe depuis ../api/companies"
else
    echo -e "${RED}✗${NC} src/lib/hooks/useCompanies.ts n'importe pas depuis ../api/companies"
    ((errors++))
fi

if grep -q "companiesApi" "src/lib/hooks/useCompanies.ts" 2>/dev/null; then
    echo -e "${YELLOW}⚠${NC}  src/lib/hooks/useCompanies.ts référence encore companiesApi"
    ((warnings++))
fi

echo ""
echo "================================"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les tests ont réussi !${NC}"
    echo ""
    echo "Vous pouvez maintenant exécuter :"
    echo "  npm run build"
    exit 0
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $warnings avertissement(s)${NC}"
    echo ""
    echo "Vous pouvez tester avec :"
    echo "  npm run build"
    exit 0
else
    echo -e "${RED}❌ $errors erreur(s) détectée(s)${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $warnings avertissement(s)${NC}"
    fi
    echo ""
    echo "Corrigez les erreurs avant de continuer."
    exit 1
fi
