# Installation

Le déploiement se fait sans terminal : tu forkes le dépôt, tu le branches sur Vercel, puis tu
renseignes les variables d'environnement. La page **/setup** de ton site vérifie chaque variable en
direct et affiche ce qui manque.

## 1. Vercel

1. Importe ton fork GitHub dans Vercel.
2. Renseigne **Root Directory** : `web`.
3. Active **Include files outside the root directory in the Build Step** (l'app lit `design/tokens.json`).
4. Une fois l'étape Supabase faite, ajoute chaque variable ci-dessous dans **Settings > Environment Variables**, puis redéploie.

## 2. Supabase

1. Crée un projet Supabase.
2. Lie le projet puis applique les migrations : `supabase link --project-ref <ref>` puis `supabase db push`.
3. Copie l'URL et les clés depuis **Project Settings > API** dans les variables ci-dessous.

Variables à renseigner dans Vercel :

- `SUPABASE_URL` : URL du projet.
- `SUPABASE_ANON_KEY` : clé `anon` (publique).
- `SUPABASE_SERVICE_ROLE_KEY` : clé `service_role` (secrète, jamais côté navigateur).
- `NEXT_PUBLIC_SUPABASE_URL` : même valeur que `SUPABASE_URL`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : même valeur que `SUPABASE_ANON_KEY`.

Checklist de sécurité du tableau de bord hébergé :

- [ ] **Auth > Providers > Email** : désactive les inscriptions une fois les deux partenaires créés.
- [ ] **Auth > Password security** : protection contre les mots de passe fuités activée, longueur minimale 8.
- [ ] **Auth > Sessions** : durée de vie limitée et délai d'inactivité.
- [ ] **Database > Settings** : Enforce SSL activé, restrictions réseau (allowlist). L'app utilise HTTPS, seul Postgres direct est concerné.
- [ ] **Advisors > Security Advisor** : aucun WARN.

---

Firebase (notifications) et les clés générées (chiffrement, rappels) seront ajoutés avec les
fonctionnalités qui les utilisent.
