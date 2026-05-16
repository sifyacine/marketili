import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import DashboardLayout     from "../../components/layout/DashboardLayout";
import useAuth             from "../../hooks/useAuth";
import pitchService        from "../../services/pitchService";
import notificationService from "../../services/notificationService";
import PitchForm           from "../../components/pitches/PitchForm";
import NotificationsPage   from "./NotificationsPage";
import { PostCard }        from "./agency/shared";
import { usePosts }        from "../../hooks/usePosts";

// ── Lead views ──
import TeamLeadOverview  from "./team/TeamLeadOverview";
import TeamLeadMembers   from "./team/TeamLeadMembers";
import TeamLeadProjects  from "./team/TeamLeadProjects";
import TeamLeadPitches   from "./team/TeamLeadPitches";

// ── Member views (reuse agency worker components — same endpoints) ──
import WorkerTasks    from "./agency/WorkerTasks";
import WorkerCalendar from "./agency/WorkerCalendar";
import TeamMemberOverview from "./team/TeamMemberOverview";

import PersonalNotes from "./shared/PersonalNotes";
import "../../styles/Dashboard.css";
import {
  IconHome, IconUsers, IconCompass, IconSend,
  IconBriefcase, IconBell, IconUser, IconCheckSquare, IconCalendar, IconNote,
} from "../../components/ui/Icons";

// ── Browse posts (team lead) ──────────────────────────────────────────────────
const BrowsePosts = ({ onPitch }) => {
  const { posts, loading, applyFilters } = usePosts({ status: "open", limit: 12 });
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Explorer les posts</h2>
          <p>Trouvez des opportunités pour votre équipe</p>
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
const TeamDashboard = () => {
  const { user } = useAuth();
  const isLead   = user?.role === "team";

  const [pitchTarget, setPitchTarget] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationService.getUnreadCount()
      .then(c => setUnreadCount(c || 0))
      .catch(() => {});
    const iv = setInterval(() =>
      notificationService.getUnreadCount()
        .then(c => setUnreadCount(c || 0))
        .catch(() => {}),
    30000);
    return () => clearInterval(iv);
  }, []);

  const handlePitchSubmit = async (pitchData) => {
    await pitchService.send({
      ...pitchData,
      postId:     pitchTarget.post._id,
      senderType: "Team",
      senderId:   user._id,
    });
    setPitchTarget(null);
  };

  const profileRole = user?.role === "team" ? "team" : "team_member";
  const profilePath = `/profile/${profileRole}/${user?._id}`;

  const NAV_LEAD = [
    { label: "Vue d'ensemble", icon: <IconHome      size={16} />, path: "/dashboard/team"              },
    { label: "Explorer",       icon: <IconCompass   size={16} />, path: "/dashboard/team/browse"       },
    { label: "Mes offres",     icon: <IconSend      size={16} />, path: "/dashboard/team/pitches"      },
    { label: "Projets",        icon: <IconBriefcase size={16} />, path: "/dashboard/team/projects"     },
    { label: "Membres",        icon: <IconUsers     size={16} />, path: "/dashboard/team/members"       },
    { label: "Notes",          icon: <IconNote      size={16} />, path: "/dashboard/team/notes"         },
    { label: "Notifications",  icon: <IconBell      size={16} />, path: "/dashboard/team/notifications",
      badge: unreadCount },
    { label: "Mon profil",     icon: <IconUser      size={16} />, path: profilePath                    },
  ];

  const NAV_MEMBER = [
    { label: "Vue d'ensemble", icon: <IconHome         size={16} />, path: "/dashboard/team"          },
    { label: "Mes tâches",     icon: <IconCheckSquare  size={16} />, path: "/dashboard/team/tasks"    },
    { label: "Calendrier",     icon: <IconCalendar     size={16} />, path: "/dashboard/team/calendar" },
    { label: "Mon profil",     icon: <IconUser         size={16} />, path: profilePath                },
  ];

  const NAV        = isLead ? NAV_LEAD : NAV_MEMBER;
  const topbarTitle = isLead ? "Espace Équipe — Lead" : "Espace Équipe — Membre";

  return (
    <>
      <DashboardLayout
        role={user?.role}
        user={user}
        navItems={NAV}
        topbarTitle={topbarTitle}>
        <Routes>

          {/* ── Lead routes ── */}
          {isLead && <>
            <Route index element={<TeamLeadOverview user={user} />} />
            <Route path="browse"        element={<BrowsePosts onPitch={setPitchTarget} />} />
            <Route path="pitches"       element={<TeamLeadPitches user={user} />} />
            <Route path="projects"      element={<TeamLeadProjects user={user} />} />
            <Route path="members"       element={<TeamLeadMembers />} />
            <Route path="notes"         element={<PersonalNotes />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </>}

          {/* ── Member routes ── */}
          {!isLead && <>
            <Route index           element={<TeamMemberOverview user={user} />} />
            <Route path="tasks"    element={<WorkerTasks    user={user} />} />
            <Route path="calendar" element={<WorkerCalendar user={user} />} />
          </>}

          <Route path="*" element={<Navigate to="/dashboard/team" replace />} />
        </Routes>
      </DashboardLayout>

      <AnimatePresence>
        {pitchTarget && (
          <PitchForm
            post={pitchTarget.post}
            senderType="Team"
            onClose={() => setPitchTarget(null)}
            onSubmit={handlePitchSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TeamDashboard;
