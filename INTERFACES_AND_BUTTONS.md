# Marketili — Profiles, Interfaces & Buttons Reference

This document maps **each profile (role)** → **each interface (page)** → **each button / control and its functionality**.

It is organized as:

```
1- Profile
   a- Interface (page)
      I- Button / control — what it does
```

> Marketili has 5 base roles: **Client**, **Agency** (with internal sub‑roles), **Team** (lead / member), **Freelancer**, and **Admin**.
> Many controls are shared across dashboards (sidebar, top bar, messaging, notifications, notes, history, calendar, profile). These are documented once in **Section 0 — Shared UI** and referenced from each profile.

---

## 0 — Shared UI (present in every logged‑in dashboard)

### 0.a — Sidebar (DashboardLayout)
- **I- Collapse / expand sidebar (‹ / ›)** — toggles the sidebar between full width (labels shown) and icon‑only.
- **I- Nav links** — each menu item navigates to its page (e.g. *Vue d'ensemble*, *Messages*, *Notifications*…). The active item is highlighted; some carry an unread **badge** number.
- **I- User chip** — shows avatar/initials, display name and role label (not clickable).
- **I- Déconnexion (logout)** — clears the session and redirects to `/login`.

### 0.b — Top bar (DashboardLayout)
- **I- Hamburger (☰)** — opens/closes the sidebar drawer on mobile.
- **I- Messagerie icon (✉)** — appears only when there are unread chat messages; navigates to the role's Messages page.
- **I- Notification bell (🔔)** — opens the notifications dropdown.
  - **Tout marquer lu** — marks all notifications read.
  - **A notification row** — marks it read and navigates to its linked page.
  - **Voir toutes les notifications →** — opens the full Notifications page.

### 0.c — Messages page (shared by all roles)
- **I- Conversation row** — opens that thread in the right panel.
- **I- ← (back)** — returns from a thread to the conversation list (mobile).
- **Chat window (inside the thread):**
  - **I- 📎 Attach** — opens the file picker (image/PDF/video).
  - **I- Retirer** — removes the selected attachment before sending.
  - **I- Text input (Enter)** — sends the typed message.
  - **I- Envoyer** — sends the message (text and/or file).

### 0.d — Notifications page (shared)
- **I- Tout marquer comme lu** — marks every notification read.
- **I- Category tabs** (Tous, Offres, Projets, Contrats, Tâches, Délais, Messages, Admin) — filter by category.
- **I- Search box** — filters notifications by title/body text.
- **I- Notification card** — click marks read + navigates to its link.
- **I- Marquer lu** — marks a single notification read.
- **I- ✕ (delete)** — deletes the notification.
- **I- Page numbers** — pagination.

### 0.e — Notes page (shared — "Mes notes")
- **I- Épingler (checkbox)** — pin the new note to the top.
- **I- Rappel (date)** — attach a reminder date to the new note.
- **I- Ajouter** — creates the note.
- **I- Done checkbox** — toggles a note as done/undone (strikethrough).
- **I- ☆ Pin toggle** — pins/unpins a note.
- **I- × Delete** — deletes the note.

### 0.f — History page (shared — "Historique")
- **I- Filter tabs** (Toutes, Offres envoyées, Offres acceptées, Projets, Contrats, Posts) — filter the activity timeline.
- **I- ← Précédent / Suivant →** — paginate the timeline.

### 0.g — Calendar page (shared — Client/Director/Worker/Freelancer)
- **I- ← / → (month arrows)** — move to previous / next month.
- **I- Day cells** — show deadlines/events (projects, tasks, posts) for that day.

### 0.h — Profile page (dashboard "Mon profil" + public ProfilePage)
- **I- Modifier** — switches the profile into edit mode.
- **I- Enregistrer** — saves profile changes.
- **I- Annuler** — discards edits.
- **I- Avatar camera (📷)** — uploads a new avatar/logo.
- **I- TagInput → Ajouter** — adds a skill/specialty/category tag (× on a tag removes it).
- **Publications feed (PostFeed):**
  - **I- Publier / Annuler** — toggles the "new publication" form.
  - **I- Post type select** — Mise à jour / Réalisation / Campagne / Annonce.
  - **I- Publier →** — posts the update.
  - **I- ✕ on a post** — deletes that publication (owner only).

---

## 1 — Public & Auth interfaces (before/around login)

### 1.a — Login (`/login`)
- **I- Afficher / Masquer** — toggles password visibility.
- **I- Mot de passe oublié ?** — forgot‑password link.
- **I- Se connecter →** — submits credentials; routes the user to their role dashboard (members with `mustChangePassword` go to `/change-password`).
- **I- Créer un compte** — link to the Register page.

### 1.b — Register (`/register`)
- **I- Role / account‑type selection** — choose the kind of account (client, agency, team, freelancer).
- **I- Form fields + submit** — creates the account, then redirects to the dashboard/login.
- **I- Link to login** — go back to sign‑in.

### 1.c — Change password (`/change-password`)
- **I- Submit** — sets a new password for first‑login members, then forwards to their dashboard.

### 1.d — Public profile (`/profile/:role/:id` — ProfilePage)
- **I- ← Retour** — browser back.
- **I- Modifier le profil** — (owner only) go to the edit page.
- **I- Envoyer une proposition** — (provider viewing a client) opens the proposal modal → fill Titre/Description/Date limite → **Envoyer →** creates a client‑targeted post; **Annuler** closes.
- **I- ✉ Envoyer un message** — (any logged‑in viewer) starts/opens a direct conversation and jumps to Messages.
- **I- Portfolio "Voir →" / social links** — open external links.
- Includes the shared **Publications** feed (see 0.h).

### 1.e — Edit profile (`/profile/:role/:id/edit` — EditProfilePage)
- **I- Enregistrer / Annuler** — save or discard profile edits.
- **I- Avatar camera, TagInputs** — see 0.h.

### 1.f — Browse providers (`/browse` — BrowseProvidersPage)
- **I- Type tabs** (Tous / Agences / Équipes / Freelancers) — filter by provider type.
- **I- Search + Spécialité + Région + Chercher** — filter the provider list.
- **I- Provider card** — opens that provider's public profile.
- **I- + Collaborer** — (freelancer only, on agency/team cards) opens the Collaboration Request modal.
- **I- Page numbers** — pagination.

#### Collaboration Request modal (CollaborationRequestModal)
- **I- Rôle proposé (select)** — optional proposed role.
- **I- Message de présentation** — pitch text.
- **I- Envoyer la demande** — sends the collaboration request.
- **I- Annuler / ✕ / Fermer** — close the modal.

---

## 2 — CLIENT

Sidebar: Vue d'ensemble · Mes posts · Explorer · Offres reçues · Projets · Contrats · Calendrier · Notes · Historique · Messages · Notifications · Mon profil.

### 2.a — Vue d'ensemble (Overview)
- **I- Stat cards** (Total posts, Actifs, En cours, Offres reçues) — each navigates to the related page.
- **I- Voir tout →** — opens Mes posts.
- **I- + Créer un post** (card CTA and empty state) — opens the Create Post modal.

### 2.b — Mes posts (Posts)
- **I- + Nouveau post** — opens the Create Post modal.
- **PostsDataGrid:**
  - **I- Search box** — filter posts by title/description.
  - **I- Status tabs** (Tous / Ouverts / En cours / Fermés) — filter by status.
  - **I- Sortable column headers** (Titre, Offres, Échéance, Créé le) — sort the table.
  - **I- Fermer** — closes a post (pending pitches get rejected; confirmation prompt).
  - **I- Réactiver** — reopens a closed post.
  - **I- Sup.** — permanently deletes a post that has 0 pitches (confirmation prompt).

#### Create Post modal (3 steps)
- **Step 1 — Brief:** title, description, objectives, marketing type, region, deadline; **Type de collaboration** buttons; **Catégories** toggle chips; **Compétences requises** tag input (**+ Ajouter**, ✕ to remove); **Suivant →**.
- **Step 2 — Médias:** drag‑drop/click **upload zone**; **✕** removes a media preview; **← Retour** / **Suivant →**.
- **Step 3 — Termes & Ciblage:** **Compensation** buttons (Monétaire/Avantages/Mixte); budget min/max; benefits text; **Visibilité** Public/Privé; (private) provider search + select; (public) **Cibler des prestataires** chips; **← Retour**; **Publier le post**.
- **I- ✕ (modal close)** — closes without saving.

### 2.c — Explorer (Browse posts)
- **I- Status tabs** (Ouverts / En cours / Réactivés / Fermés) — filter.
- **I- Search** — search by title/description.
- **I- Filter dropdowns** (marketing type, collaboration type, region) — refine.
- **I- Filtrer** — applies filters; **Réinit.** — resets them.
- **I- Post card** — opens the read‑only post detail; **← Retour** returns.
- **I- ← Précédent / Suivant →** — pagination.

### 2.d — Offres reçues (Pitches received)
- **I- Stat cards** (En attente / Acceptées / Rejetées / Retirées) — counts.
- **I- Search + status filter tabs** — filter pitches.
- **I- Voir détail** — opens the pitch detail modal (strategy/content/analysis/audience/price); **✕** closes.
- **I- Accepter** — opens the Accept modal:
  - **Démarrer directement** vs **Avec contrat** (radio) — choose start mode.
  - **Confirmer** — accepts the pitch (auto‑rejects other pending pitches; creates the project or starts the contract flow); **Annuler** closes.
- **I- Rejeter** — rejects the pitch (prompts for an optional reason).

### 2.e — Projets (Projects)
- **I- Status filter pills** (Tous / Actifs / En révision / Terminés / Annulés) — filter.
- **I- Project card** — opens the read‑only project detail.
- **Project detail tabs:** **Détail du projet**, **Notes**, **Messagerie**.
  - **Notes → Envoyer la note** — posts a note to the provider.
  - **Messagerie** — embedded chat (see 0.c).
  - Deliverables are view/download links (read‑only for client).
  - **I- ← Retour** — back to the project list.

### 2.f — Contrats (Contracts)
- **I- Status filter pills** (Tous / À confirmer / Reçu confirmé / Finalisés / Résiliés) — filter.
- **I- Contract card** — opens the contract detail (with a status stepper).
- **Contract detail:**
  - **I- Visualiser** — opens the contract PDF / bon de commande in a viewer; **↓** downloads it.
  - **I- Envoyer le reçu** — (status "sent") uploads the client's payment receipt to confirm.
  - **I- Demander la résiliation** — opens the resiliation form → optional motif → **Confirmer** / **Annuler**.
  - **I- ← Retour** — back to the contract list.

### 2.g–2.k — Calendrier / Notes / Historique / Messages / Notifications / Mon profil
- See **Section 0** (shared). Profile = ClientProfile (Modifier/Enregistrer + Publications feed).

---

## 3 — AGENCY

The agency dashboard renders different navs/pages depending on the member's `jobTitle`. There are 5 internal roles: **Director**, **Sub‑Director** (creative/marketing/production director), **Commercial**, **Manager** (art director, strategist, digital/project/social‑media manager), and **Worker** (senior/junior).

### 3.1 — DIRECTOR
Sidebar: Vue d'ensemble · Posts flaggés · Mes offres · Clients · Projets · Contrats · Membres · Parcourir posts · Calendrier · Analytique · Historique · Notes · Messages · Notifications · Mon profil.

#### 3.1.a — Vue d'ensemble
- **I- Stat cards** (Projets actifs, Offres en attente, Offres acceptées, Posts flaggés) — navigate to the related page.
- **I- Voir tout →** cards — open flagged posts / projects.

#### 3.1.b — Posts flaggés (Flagged posts — DirectorFlaggedPosts)
- **I- Filter pills** — filter flagged posts (e.g. à traiter / assignés / pitchés).
- **I- Assigner à un stratège** (member selector) — sends the flagged post to a chosen strategist.
- **I- Envoyer une offre** — opens the Pitch form for that post (and marks the flag as pitched).

#### 3.1.c — Mes offres (Sent pitches — DirectorPitches)
- **I- Status tabs / Internal‑workflow toggle** — switch between client status (En attente/Acceptées/…) and internal status filters.
- **I- Search** — by post/client.
- **I- Voir détail** — opens the pitch detail modal.
- **I- Voir les actions internes / Masquer** — expands the internal approval workflow:
  - *Strategist:* **Soumettre au chef de projet**.
  - *Chef de projet:* **Valider** / **Retourner au stratège**.
  - *Director:* **Envoyer au client**.
  - (Optional internal notes textarea accompanies the action.)
- **I- Retirer** — withdraws a pending pitch (confirmation).

#### 3.1.d — Clients (DirectorClients)
- **I- Client row** — opens client detail with their projects.
- **I- Voir profil** — opens the client's profile modal.
- **I- ← Retour** — back to the client list.

#### 3.1.e — Projets (DirectorProjects) — the agency project hub
- **I- Status filter pills** — filter projects.
- **I- Project card** — opens the project detail.
- **Project detail tabs:** Détail / Messagerie.
  - **I- Status select** — change project status (pending→active→in_review→completed/cancelled).
  - **I- Prolonger le délai** — reveals a new‑deadline form → **Enregistrer** / **Annuler**.
  - **I- + Assigner un membre** — reveals assign form (member + role) → **Assigner**.
  - **I- + Créer un contrat** — opens the "Créer un contrat" modal (when no contract exists).
  - **I- + Soumettre un livrable** — reveals deliverable form (file URL, name, description) → **Soumettre** / **Annuler**.
  - **I- + Ajouter une tâche** — reveals task form (title, priority, assignee, due date, description) → **Ajouter la tâche** / **Annuler**.
  - **I- ← Retour** — back to the project list.

#### 3.1.f — Contrats (DirectorContracts)
- **I- Status filter pills** — filter contracts.
- **I- Date range (from/to) + reset** — filter by date.
- **I- Contract card** — opens contract detail.
- **I- Visualiser** — open a contract document in the viewer.
- **I- Générer le bon de commande** — reveals the BDC form → submit (sends BDC to the client, finalizes contract).
- **I- Demander la résiliation** — opens resiliation form → **Confirmer** / **Annuler**.

#### 3.1.g — Membres (DirectorMembers)
- **I- + Créer un membre** — opens the "Créer un membre" modal (member form) → **Créer le membre** / **✕**.
- **I- Role selector per member** — changes a member's job title.
- **I- Historique (per member)** — opens a member's activity history.
- **I- Voir membres inactifs / Restaurer** — show inactive members and restore an account.
- **Collaboration requests tab** (from freelancers):
  - **I- Accepter** — accepts the collaboration request.
  - **I- Refuser** — reveals a motif input → **Confirmer** / **✕**.
- **Freelancers tab:**
  - **I- Brancher / attacher un freelance** — search by name, select, choose role → attach.
  - **I- Convention (per freelancer)** — opens the Convention de collaboration form.
  - **I- Détacher** — reveals **Confirmer** / **Annuler** to detach a freelancer.

#### 3.1.h — Parcourir posts (BrowsePosts)
- **I- Search + Rechercher** — find open posts.
- **I- Envoyer une offre** — opens the Pitch form for the post.

#### 3.1.i — Analytique (DirectorAnalytics)
- Read‑only charts/metrics (no action buttons beyond any range filters).

#### 3.1.j — Calendrier / Historique / Notes / Messages / Notifications / Mon profil
- See Section 0. Profile = AgencyProfile.

#### Pitch form (shared — used wherever "Envoyer une offre" appears)
- Agency pitch = **5 steps** (Stratégie, Contenu, Analyse, Audience, Prix & Délai); Team/Freelancer = **2 steps** (Description, Prix & Délai).
- **I- Suivant → / ← Retour** — step navigation.
- **I- File input** — optional attachment.
- **I- Envoyer l'offre** — submits the pitch.
- **I- ✕** — close.

### 3.2 — SUB‑DIRECTOR (Creative / Marketing / Production Director)
Sidebar: Vue d'ensemble · Posts signalés · Parcourir posts · Projets · Calendrier · Messages · Mon profil.
- **Posts signalés** — same flagged‑posts controls as 3.1.b (assign to strategist, Envoyer une offre).
- **Parcourir posts** — browse + flag (CommercialBrowse, see 3.3.b).
- **Projets** — WorkerProjects detail (status, deliverables, tasks — see 3.5.c).
- Calendrier / Messages / Mon profil — shared.

### 3.3 — COMMERCIAL
Sidebar: Vue d'ensemble · Parcourir posts · Mes projets · Messages · Notifications · Notes · Mon profil.

#### 3.3.a — Vue d'ensemble (CommercialOverview)
- **I- Stat / shortcut cards** — navigate to Mes projets / Parcourir posts.

#### 3.3.b — Parcourir posts (CommercialBrowse)
- **I- Filtres toggle** — show/hide filters.
- **I- Signaler au directeur** — opens the flag modal → confirm to flag the post for the director (button shows **✓ Signalé** once flagged); **✕** closes.

#### 3.3.c — Mes projets (CommercialProjects)
- **I- Project card** — open detail.
- **I- Deliverable complete toggle** — mark a deliverable/checklist item complete.
- Messages / Notifications / Notes / Mon profil — shared.

### 3.4 — MANAGER (Art Director, Strategist, Digital/Project/Social‑Media Manager)
Sidebar: Vue d'ensemble · Mes tâches · Mes projets · Calendrier · Messages · Mon profil.
- **Mes tâches** — WorkerTasks (see 3.5.b).
- **Mes projets** — WorkerProjects (see 3.5.c).
- Others — shared.

### 3.5 — WORKER (Senior / Junior)
Sidebar: Vue d'ensemble · Mes tâches · Calendrier · Messages · Mon profil.

#### 3.5.a — Vue d'ensemble (WorkerOverview)
- **I- Stat cards** (Tâches assignées, Terminées, Échéance aujourd'hui, En retard) — navigate to Mes tâches.

#### 3.5.b — Mes tâches (WorkerTasks)
- **I- Search** — filter tasks.
- **I- Status select per task** (À faire / En cours / En révision / Terminé) — updates task status.
- **I- Commentaires / Masquer** — expand the task comment thread.
- **I- Envoyer** — posts a comment on the task.

#### 3.5.c — Mes projets (WorkerProjects)
- **I- Project card** — open project detail (status, deliverables, tasks — same controls as 3.1.e where permitted).
- Calendrier / Messages / Mon profil — shared.

---

## 4 — TEAM

### 4.1 — TEAM LEAD (`role = team`)
Sidebar: Vue d'ensemble · Explorer · Mes offres · Projets · Contrats · Historique · Membres · Notes · Messages · Notifications · Mon profil.

#### 4.1.a — Vue d'ensemble (TeamLeadOverview)
- **I- Explorer les posts** — go to Explorer.
- **I- Stat cards** — navigate to related pages.

#### 4.1.b — Explorer (BrowsePosts)
- **I- Search + Rechercher** — find open posts.
- **I- Envoyer une offre** — opens the Pitch form (2‑step team pitch).

#### 4.1.c — Mes offres (TeamLeadPitches)
- **I- Status filter tabs + search** — filter sent pitches.
- **I- Voir détail** — open pitch detail.
- **I- Retirer** — withdraw a pending pitch.

#### 4.1.d — Projets (TeamLeadProjects)
- **I- Project card** — open detail with status, members, deliverables and tasks controls (same family as 3.1.e).

#### 4.1.e — Contrats (ProviderContracts)
- **I- Status filter pills** — filter.
- **I- Contract card** — open detail.
- **I- Remplir le Contrat Proforma** — (draft) opens the proforma form → generates a PDF and sends it to the client.
- **I- Ignorer — démarrer le projet** — skip the contract and start the project directly.
- **I- Confirmer et démarrer le projet** — (after client receipt) finalize the contract and activate the project.
- **I- Visualiser / ↓** — view/download the contract PDF.
- **I- ← Retour** — back to list.

#### 4.1.f — Membres (TeamLeadMembers)
- **I- + Ajouter un membre** — reveals the member form → **Créer le membre**.
- (member rows manage the team's members)

#### 4.1.g — Historique / Notes / Messages / Notifications / Mon profil
- Shared. Profile = TeamProfile.

### 4.2 — TEAM MEMBER (`role = team_member`)
Sidebar: Vue d'ensemble · Mes tâches · Mes projets · Calendrier · Notes · Messages · Notifications · Mon profil.
- **Mes tâches** — WorkerTasks (status select, comments, Envoyer — see 3.5.b).
- **Mes projets** — TeamMemberProjects (project detail, deliverables/tasks where permitted).
- **Calendrier** — WorkerCalendar (month nav).
- Notes / Messages / Notifications / Mon profil — shared.

---

## 5 — FREELANCER

Sidebar: Accueil · Collaborations · Clients · Explorer · Mes offres · Mes projets · Contrats · Calendrier · Historique · Notes · Messages · Notifications · Mon profil.

A top **Context bar** appears when working inside an agency context:
- **I- Revenir à mon espace** — exits the agency context back to the freelancer's own space.

### 5.a — Accueil (FreelancerOverview)
- **I- Explorer les posts** — go to Explorer (shown in own/independent context).
- **I- Context switch cards** — switch between independent space and agency collaborations.

### 5.b — Collaborations (FreelancerCollaborations)
- **I- Tabs:** *Collaborations actives* / *Mes demandes*.
- **Collaborations actives:**
  - **I- Espace indépendant card** — switch to personal context.
  - **I- Agency card** — switch into that agency's context.
- **Mes demandes (sent requests):**
  - **I- Status filter** (Toutes / En attente / Acceptées / Refusées / Retirées).
  - **I- Retirer** — withdraws a pending collaboration request.

### 5.c — Clients (FreelancerClients)
- **I- Search** — filter clients.
- **I- Client row** — opens the client's projects.
- **I- Voir profil** — opens the client profile modal (**Fermer** to close).
- **I- ✉ Message** — starts/opens a direct conversation with the client.
- **I- ← Retour** — back to the client list.

### 5.d — Explorer (FreelancerBrowse)
- **I- Search + Rechercher** — find open posts.
- **I- Envoyer une offre** — opens the Pitch form (2‑step freelancer pitch).

### 5.e — Mes offres (FreelancerPitches)
- **I- Status filter + search** — filter sent pitches.
- **I- Voir détail** — open pitch detail.
- **I- Retirer** — withdraw a pending pitch.

### 5.f — Mes projets (FreelancerProjects)
- **I- Project card** — open detail (status, deliverables submission, tasks, messaging — same family as the provider project detail).

### 5.g — Contrats (ProviderContracts)
- Same controls as Team Lead contracts (4.1.e): **Remplir le Contrat Proforma**, **Ignorer — démarrer le projet**, **Confirmer et démarrer le projet**, **Visualiser/↓**, **← Retour**.

### 5.h — Calendrier / Historique / Notes / Messages / Notifications / Mon profil
- Shared. Profile = FreelancerProfile.

#### Contrat Proforma form (ContratProformaForm) & Convention de collaboration (ConventionCollaborationForm)
- Multi‑field contract/convention forms with **Submit** (generate PDF / create the agreement) and **Cancel/✕** buttons.

---

## 6 — ADMIN (`/admin`)

The admin dashboard is a single shell with a left nav switching between panels: Overview, Users, Stats, Posts, Activity, Ads, Activity log.

### 6.a — Overview (OverviewPanel)
- **I- KPI / stat cards** — platform metrics.
- **I- Voir tout →** (Inscriptions récentes) — go to Users.
- **I- Voir tout →** (Journal d'activité) — go to the Activity log.

### 6.b — Utilisateurs (UsersPanel)
- **I- Role filter (select)** — filter by role.
- **I- Search + Rechercher** — search by name/email.
- **I- Désactiver / Activer** — toggles a user account's active state.

### 6.c — Statistiques (StatsPanel)
- Read‑only metric sections (users, posts, projects) — no action buttons.

### 6.d — Posts (PostsPanel — moderation)
- **I- Status filter (select)** — All/Open/In progress/Closed.
- **I- Search + Rechercher** — find by title/client.
- **I- Retirer** — opens the remove modal → optional reason → **Confirmer le retrait** / **Annuler** (closes the post).
- **I- Réactiver** — opens the reactivate modal → **Confirmer la réactivation** / **Annuler** (reopens a closed post).
- **I- ← Précédent / Suivant →** — pagination.

### 6.e — Activité (ActivityPanel)
- Read‑only feeds of recent registrations, posts and pitches (last 24h).

### 6.f — Publicités (AdsPanel)
- **I- Nouvelle publicité / Annuler** — toggles the create‑ad form.
- **Create ad form:** title, image URL, link URL, placement (banner/sidebar/card), **target‑role checkboxes** → **Créer la publicité**.
- **I- Activer / Désactiver** — toggle an ad's active state.
- **I- Supprimer** — deletes an ad (confirmation prompt).

### 6.g — Journal d'administration (ActivityLogPanel)
- **I- Action‑type filter (select)** — filter admin actions (e.g. post_removed, post_reactivated).
- **I- Pagination** — page through the log.

---

## Appendix — Quick button index by recurring action

| Action button | Where it appears | What it does |
|---|---|---|
| **Envoyer une offre** | Browse posts (Agency/Team/Freelancer) | Opens the multi‑step Pitch form |
| **Accepter / Rejeter** | Client → Offres reçues | Accept (with/without contract) or reject a pitch |
| **Retirer** | Provider → Mes offres; Freelancer collab requests | Withdraw a pending pitch/request |
| **Signaler au directeur** | Commercial/Sub‑director browse | Flag a post for the director |
| **Assigner à un stratège** | Director flagged posts | Route a flagged post to a strategist |
| **+ Créer un post / Nouveau post** | Client overview/posts | Open Create Post modal |
| **+ Créer un membre / Ajouter un membre** | Director/Team members | Add a staff member |
| **+ Collaborer** | Browse providers (freelancer) | Send a collaboration request |
| **Remplir le Contrat Proforma** | Provider contracts (draft) | Generate & send contract PDF |
| **Envoyer le reçu** | Client contract (sent) | Upload payment receipt |
| **Confirmer et démarrer le projet** | Provider contract (acknowledged) | Finalize contract, activate project |
| **Demander la résiliation** | Client/Director contracts | Start contract termination |
| **✉ Message / Envoyer un message** | Profiles, Freelancer clients | Open a direct conversation |
| **Désactiver / Activer / Retirer / Réactiver** | Admin users & posts | Moderate accounts and posts |

---

*Generated from the frontend source (`frontend/src/pages` and `frontend/src/components`). Button labels are in French as they appear in the UI.*
