# Installation

Le déploiement se fait sans terminal : forkez le dépôt, branchez-le sur Vercel, puis renseignez
les variables d'environnement. La page **/setup** de votre site vérifie chaque variable en direct
et affiche ce qui manque. Elle reprend les mêmes étapes que ce guide (synchronisation vérifiée par
`web/src/features/setup/installDoc.test.ts`).

## 1. Vercel

1. Importez votre fork GitHub dans Vercel.
2. Root Directory : `web`.
3. Activez « Include files outside the root directory in the Build Step » (l'app lit `design/tokens.json`).
4. Une fois l'étape Supabase faite, ajoutez chaque variable ci-dessous dans **Settings > Environment Variables**, puis redéployez.

## 2. Supabase

1. Créez un projet Supabase.
2. Liez le projet puis appliquez les migrations : `supabase link --project-ref <ref>` puis `supabase db push`.
3. Copiez l'URL et les clés depuis **Project Settings > API** dans les variables ci-dessous.

Variables à renseigner dans Vercel :

- `SUPABASE_URL` : URL du projet.
- `SUPABASE_ANON_KEY` : clé `anon` (publique).
- `SUPABASE_SERVICE_ROLE_KEY` : clé `service_role` (secrète, jamais côté navigateur).
- `NEXT_PUBLIC_SUPABASE_URL` : même valeur que `SUPABASE_URL`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : même valeur que `SUPABASE_ANON_KEY`.

Checklist de sécurité du tableau de bord hébergé :

- [ ] **Auth > Providers > Email** : désactivez les inscriptions une fois les deux partenaires créés.
- [ ] **Auth > Password security** : longueur minimale 8, protection contre les mots de passe fuités activée (plan Pro).
- [ ] **Auth > Sessions** : durée de vie limitée et délai d'inactivité (plan Pro).
- [ ] **Database > Settings** : Enforce SSL activé, restrictions réseau (allowlist). L'app utilise HTTPS, seul Postgres direct est concerné.
- [ ] **Advisors > Security Advisor** : aucun WARN.

---

Firebase (notifications) et les clés générées (chiffrement, rappels) seront ajoutés avec les
fonctionnalités qui les utilisent.
