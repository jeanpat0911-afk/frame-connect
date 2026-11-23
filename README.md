# FRAME — code à importer

## Import rapide
1. Décompresse ce dossier.
2. Crée un projet sur https://supabase.com
3. Dans Supabase > SQL Editor, colle et exécute `supabase/schema.sql`.
4. Dans Supabase > Project Settings > API, copie l'URL et la clé `anon`/publishable.
5. Crée `.env.local` à la racine et remplis :
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
6. Importe le dossier dans un dépôt GitHub, puis connecte-le à https://vercel.com.
7. Ajoute les deux variables d'environnement dans Vercel et déploie.

## Lancer en local
`npm install` puis `npm run dev`.

Ce MVP comprend inscription, création de profil, annuaire filtrable et demandes de shooting. Il ne comprend pas encore chat temps réel, paiements, calendrier synchronisé ni modération avancée. Configure la confirmation email dans Supabase selon ton choix. Ne publie jamais de clé `service_role` dans le navigateur.
