// src/pages/dashboard/AgencyDashboard.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import DashboardLayout    from "../../components/layout/DashboardLayout";
import useAuth            from "../../hooks/useAuth";
import pitchService           from "../../services/pitchService";
import projectService         from "../../services/projectService";
import notificationService    from "../../services/notificationService";
import NotificationsPage      from "./NotificationsPage";
import PitchForm          from "../../components/pitches/PitchForm";
import "../../styles/Dashboard.css";

// ── Role-split views ──
import DirectorOverview     from "./agency/DirectorOverview";
import DirectorFlaggedPosts from "./agency/DirectorFlaggedPosts";
import DirectorClients      from "./agency/DirectorClients";
import DirectorProjects     from "./agency/DirectorProjects";
import DirectorContracts    from "./agency/DirectorContracts";
import DirectorMembers      from "./agency/DirectorMembers";
import DirectorPitches      from "./agency/DirectorPitches";
import CommercialOverview   from "./agency/CommercialOverview";
import CommercialBrowse     from "./agency/CommercialBrowse";
import WorkerOverview       from "./agency/WorkerOverview";
import WorkerTasks          from "./agency/WorkerTasks";
import WorkerCalendar       from "./agency/WorkerCalendar";
import WorkerProjects       from "./agency/WorkerProjects";
import DirectorCalendar     from "./agency/DirectorCalendar";
import PersonalNotes        from "./shared/PersonalNotes";
import { PostCard }         from "./agency/shared";
import { usePosts }         from "../../hooks/usePosts";
import {
  IconHome, IconFlag, IconTarget, IconBriefcase,
  IconUsers, IconCompass, IconCheckSquare, IconCalendar, IconSearch, IconSend, IconFileText, IconBell, IconUser, IconNote,
} from "../../components/ui/Icons";

// ── Role helpers ──────────────────────────────────────────────────────────────
const WORKER_TITLES = ["strategist", "designer", "editor", "smm", "community_manager"];

const getAgencyRole = (user) => {
  if (!user) return "director";
  if (user.role === "agency") return "director";
  const jt = user.jobTitle;
  if (jt === "director")  return "director";
  if (jt === "commercial") return "commercial";
  if (WORKER_TITLES.includes(jt)) return "worker";
  return "worker";
};

// ── Nav configs ───────────────────────────────────────────────────────────────
const NAV_DIRECTOR = [
  { label: "Vue d'ensemble",  icon: <IconHome        size={16} />, path: "/dashboard/agency"           },
  { label: "Posts flaggés",   icon: <IconFlag        size={16} />, path: "/dashboard/agency/flagged"   },
  { label: "Mes offres",      icon: <IconSend        size={16} />, path: "/dashboard/agency/pitches"   },
  { label: "Clients",         icon: <IconTarget      size={16} />, path: "/dashboard/agency/clients"   },
  { label: "Projets",         icon: <IconBriefcase   size={16} />, path: "/dashboard/agency/projects"  },
  { label: "Contrats",        icon: <IconFileText    size={16} />, path: "/dashboard/agency/contracts" },
  { label: "Membres",         icon: <IconUsers       size={16} />, path: "/dashboard/agency/members"   },
  { label: "Parcourir posts", icon: <IconCompass     size={16} />, path: "/dashboard/agency/browse"    },
  { label: "Calendrier",      icon: <IconCalendar    size={16} />, path: "/dashboard/agency/calendar"  },
  { label: "Notes",           icon: <IconNote        size={16} />, path: "/dashboard/agency/notes"     },
];
const NAV_COMMERCIAL = [
  { label: "Vue d'ensemble",  icon: <IconHome        size={16} />, path: "/dashboard/agency"         },
  { label: "Parcourir posts", icon: <IconCompass     size={16} />, path: "/dashboard/agency/browse"  },
];
const NAV_WORKER = [
  { label: "Vue d'ensemble", icon: <IconHome         size={16} />, path: "/dashboard/agency"           },
  { label: "Mes tâches",     icon: <IconCheckSquare  size={16} />, path: "/dashboard/agency/tasks"     },
  { label: "Mes projets",    icon: <IconBriefcase    size={16} />, path: "/dashboard/agency/projects"  },
  { label: "Calendrier",     icon: <IconCalendar     size={16} />, path: "/dashboard/agency/calendar"  },
];

// ── Browse posts (director version with pitch action) ─────────────────────────
const BrowsePosts = ({ onPitch }) => {
  const { posts, loading, applyFilters } = usePosts({ status: "open", limit: 12 });
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Parcourir les posts</h2>
          <p>Trouvez des opportunités et envoyez vos offres</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input className="dash-form-input" placeholder="Rechercher..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && applyFilters({ search })}
          style={{ flex: 1 }} />
        <button className="section-cta-btn" onClick={() => applyFilters({ search })}>
          Rechercher
        </button>
      </div>
      {loading
        ? <div className="spinner-wrap" style={{ padding: 60 }}><div className="spinner" /></div>
        : posts.length === 0
          ? <div className="card"><div className="empty-state" style={{ padding: "64px 24px" }}>
              <div className="empty-state-icon"><IconSearch size={20} /></div>
              <div className="empty-state-title">Aucun post trouvé</div>
            </div></div>
          : <div style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 16 }}>
              {posts.map((post, i) => (
                <PostCard key={post._id} post={post} index={i}
                  actionLabel="Envoyer une offre"
                  onAction={() => onPitch({ post })} />
              ))}
            </div>
      }
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
const AgencyDashboard = () => {
  const { user }   = useAuth();
  const agencyRole = getAgencyRole(user);

  const [pitchTarget,  setPitchTarget]  = useState(null);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [projects,     setProjects]     = useState([]);
  const [dataLoading,  setDataLoading]  = useState(true);
  const [unreadCount,  setUnreadCount]  = useState(0);

  useEffect(() => {
    notificationService.getUnreadCount()
      .then(c => setUnreadCount(c || 0))
      .catch(() => {});
    notificationService.checkDeadlines();
    const iv = setInterval(() =>
      notificationService.getUnreadCount().then(c => setUnreadCount(c || 0)).catch(() => {}),
    30000);
    return () => clearInterval(iv);
  }, []);

  // Director-only prefetch
  useEffect(() => {
    if (agencyRole !== "director" || !user?._id) {
      setDataLoading(false);
      return;
    }
    Promise.all([
      projectService.getFlaggedPosts(user._id)
        .then(d => setFlaggedPosts(d.flaggedPosts || [])),
      projectService.getAgencyProjects(user._id)
        .then(d => setProjects(d.projects || [])),
    ])
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [agencyRole, user?._id]);

  const handlePitchSubmit = async (pitchData) => {
    await pitchService.send({
      ...pitchData,
      postId:     pitchTarget.post._id,
      senderType: "Agency",
      senderId:   user._id,
    });
    if (pitchTarget.flagEntry) {
      try {
        await projectService.markFlaggedAsPitched(user._id, pitchTarget.post._id);
        setFlaggedPosts(prev => prev.map(f =>
          f.post?._id === pitchTarget.post._id ? { ...f, pitched: true } : f
        ));
      } catch {}
    }
    setPitchTarget(null);
  };

  const profilePath = user?.role === "agency"
    ? `/profile/agency/${user?._id}`
    : `/profile/agency_member/${user?._id}`;

  const NAV_DIRECTOR_FULL = [
    ...NAV_DIRECTOR,
    { label: "Notifications", icon: <IconBell size={16} />, path: "/dashboard/agency/notifications",
      badge: unreadCount },
    { label: "Mon profil",    icon: <IconUser size={16} />, path: profilePath },
  ];

  const NAV = agencyRole === "director" ? NAV_DIRECTOR_FULL
    : agencyRole === "commercial" ? NAV_COMMERCIAL
    : NAV_WORKER;

  const topbarTitle = agencyRole === "director"   ? "Espace Agence — Directeur"
    : agencyRole === "commercial" ? "Espace Agence — Commercial"
    : "Espace Agence — Équipe";

  return (
    <>
      <DashboardLayout
        role={user?.role === "agency" ? "agency" : "agency_member"}
        user={user} navItems={NAV} topbarTitle={topbarTitle}>
        <Routes>

          {/* ── Director ── */}
          {agencyRole === "director" && <>
            <Route index element={
              <DirectorOverview user={user} flaggedPosts={flaggedPosts}
                projects={projects} loading={dataLoading} />
            } />
            <Route path="flagged" element={
              <DirectorFlaggedPosts user={user} onPitch={setPitchTarget}
                flaggedPosts={flaggedPosts} loading={dataLoading}
                onRefresh={() =>
                  projectService.getFlaggedPosts(user._id)
                    .then(d => setFlaggedPosts(d.flaggedPosts || []))} />
            } />
            <Route path="pitches"   element={<DirectorPitches   user={user} />} />
            <Route path="clients"   element={<DirectorClients   user={user} />} />
            <Route path="projects"  element={<DirectorProjects  user={user} />} />
            <Route path="contracts"     element={<DirectorContracts  user={user} />} />
            <Route path="members"       element={<DirectorMembers    user={user} />} />
            <Route path="browse"        element={<BrowsePosts onPitch={setPitchTarget} />} />
            <Route path="calendar"      element={<DirectorCalendar user={user} />} />
            <Route path="notes"         element={<PersonalNotes />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </>}

          {/* ── Commercial ── */}
          {agencyRole === "commercial" && <>
            <Route index       element={<CommercialOverview user={user} />} />
            <Route path="browse" element={<CommercialBrowse user={user} />} />
          </>}

          {/* ── Worker ── */}
          {agencyRole === "worker" && <>
            <Route index            element={<WorkerOverview  user={user} />} />
            <Route path="tasks"     element={<WorkerTasks     user={user} />} />
            <Route path="projects"  element={<WorkerProjects  user={user} />} />
            <Route path="calendar"  element={<WorkerCalendar  user={user} />} />
          </>}

          <Route path="*" element={<Navigate to="/dashboard/agency" replace />} />
        </Routes>
      </DashboardLayout>

      <AnimatePresence>
        {pitchTarget && (
          <PitchForm
            post={pitchTarget.post}
            senderType="Agency"
            onClose={() => setPitchTarget(null)}
            onSubmit={handlePitchSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AgencyDashboard;