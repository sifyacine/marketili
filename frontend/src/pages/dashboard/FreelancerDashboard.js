import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import DashboardLayout       from "../../components/layout/DashboardLayout";
import useAuth               from "../../hooks/useAuth";
import freelancerService     from "../../services/freelancerService";
import pitchService          from "../../services/pitchService";
import notificationService   from "../../services/notificationService";
import PitchForm             from "../../components/pitches/PitchForm";
import NotificationsPage     from "./NotificationsPage";
import FreelancerOverview    from "./freelancer/FreelancerOverview";
import FreelancerCollaborations from "./freelancer/FreelancerCollaborations";
import FreelancerBrowse      from "./freelancer/FreelancerBrowse";
import FreelancerPitches     from "./freelancer/FreelancerPitches";
import FreelancerProjects    from "./freelancer/FreelancerProjects";
import FreelancerCalendar    from "./freelancer/FreelancerCalendar";
import FreelancerProfile     from "./freelancer/FreelancerProfile";
import FreelancerClients     from "./freelancer/FreelancerClients";
import PersonalNotes         from "./shared/PersonalNotes";
import ProviderContracts     from "../../components/contracts/ProviderContracts";
import HistoryPage           from "./shared/HistoryPage";
import "../../styles/Dashboard.css";
import MessagesPage from "./shared/MessagesPage";
import {
  IconHome, IconUsers, IconCompass, IconSend,
  IconBriefcase, IconFileText, IconBell, IconUser, IconCalendar, IconNote, IconClock, IconMail, IconTarget,
} from "../../components/ui/Icons";

const ContextBar = ({ collaborations, activeContext, onSwitch }) => {
  if (!activeContext) return null;
  const collab = collaborations.find(c => c.agency?._id === activeContext);
  const name   = collab?.agency?.agencyName || "Agence";

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      style={{
        background: "linear-gradient(90deg, #0c1a2e 0%, #0e2340 100%)",
        borderBottom: "1px solid #1e3a5f",
        padding: "10px 28px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontSize: "0.82rem",
        color: "rgba(255,255,255,0.75)",
      }}>
      <span style={{ fontWeight: 600, color: "#fff" }}>
        Contexte agence : {name}
      </span>
      <span style={{ color: "rgba(255,255,255,0.35)" }}>|</span>
      <button
        onClick={() => onSwitch(null)}
        style={{
          background: "rgba(255,255,255,0.08)", border: "none",
          color: "rgba(255,255,255,0.8)", fontSize: "0.78rem",
          padding: "3px 12px", borderRadius: 20, cursor: "pointer",
          fontFamily: "inherit", fontWeight: 600,
        }}>
        Revenir à mon espace
      </button>
    </motion.div>
  );
};

const FreelancerDashboard = () => {
  const { user }      = useAuth();
  const navigate      = useNavigate();

  const [collaborations, setCollaborations] = useState([]);
  const [activeContext,  setActiveContext]  = useState(null);
  const [pitchTarget,    setPitchTarget]    = useState(null);
  const [unreadCount,    setUnreadCount]    = useState(0);

  useEffect(() => {
    if (!user?._id) return;
    freelancerService.getCollaborations(user._id)
      .then(d => setCollaborations(d.collaborations || []))
      .catch(() => {});
  }, [user?._id]);

  useEffect(() => {
    notificationService.getUnreadCount()
      .then(c => setUnreadCount(c || 0))
      .catch(() => {});
    notificationService.checkDeadlines();
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
      senderType: "Freelancer",
      senderId:   user._id,
    });
    setPitchTarget(null);
  };

  const NAV = [
    { label: "Accueil",          icon: <IconHome      size={16} />, path: "/dashboard/freelancer"                },
    { label: "Collaborations",   icon: <IconUsers     size={16} />, path: "/dashboard/freelancer/collaborations" },
    { label: "Clients",          icon: <IconTarget    size={16} />, path: "/dashboard/freelancer/clients"         },
    { label: "Explorer",         icon: <IconCompass   size={16} />, path: "/dashboard/freelancer/browse"         },
    { label: "Mes offres",       icon: <IconSend      size={16} />, path: "/dashboard/freelancer/pitches"        },
    { label: "Mes projets",      icon: <IconBriefcase size={16} />, path: "/dashboard/freelancer/projects"       },
    { label: "Contrats",         icon: <IconFileText  size={16} />, path: "/dashboard/freelancer/contracts"      },
    { label: "Calendrier",       icon: <IconCalendar  size={16} />, path: "/dashboard/freelancer/calendar"       },
    { label: "Historique",       icon: <IconClock     size={16} />, path: "/dashboard/freelancer/history"        },
    { label: "Notes",            icon: <IconNote      size={16} />, path: "/dashboard/freelancer/notes"          },
    { label: "Messages",          icon: <IconMail      size={16} />, path: "/dashboard/freelancer/messages"        },
    { label: "Notifications",    icon: <IconBell      size={16} />, path: "/dashboard/freelancer/notifications",
      badge: unreadCount },
    { label: "Mon profil",       icon: <IconUser      size={16} />, path: "/dashboard/freelancer/profile"        },
  ];

  const topbarTitle = activeContext
    ? `Freelancer — ${collaborations.find(c => c.agency?._id === activeContext)?.agency?.agencyName || "Agence"}`
    : "Espace Freelancer";

  return (
    <>
      <DashboardLayout
        role="freelancer"
        user={user}
        navItems={NAV}
        topbarTitle={topbarTitle}>
        <AnimatePresence>
          {activeContext && (
            <ContextBar
              collaborations={collaborations}
              activeContext={activeContext}
              onSwitch={setActiveContext}
            />
          )}
        </AnimatePresence>
        <Routes>
          <Route index element={
            <FreelancerOverview
              user={user}
              collaborations={collaborations}
              activeContext={activeContext}
              onSwitchContext={setActiveContext}
            />
          } />

          <Route path="collaborations" element={
            <FreelancerCollaborations
              collaborations={collaborations}
              activeContext={activeContext}
              onSwitchContext={(id) => {
                setActiveContext(id);
                navigate("/dashboard/freelancer");
              }}
            />
          } />

          <Route path="browse" element={
            <FreelancerBrowse onPitch={setPitchTarget} />
          } />

          <Route path="pitches" element={
            <FreelancerPitches user={user} />
          } />

          <Route path="projects" element={
            <FreelancerProjects user={user} activeContext={activeContext} />
          } />

          <Route path="clients"       element={<FreelancerClients user={user} />} />
          <Route path="contracts"     element={<ProviderContracts user={user} partyType="Freelancer" />} />
          <Route path="history"       element={<HistoryPage />} />
          <Route path="calendar"      element={<FreelancerCalendar user={user} />} />
          <Route path="notes"         element={<PersonalNotes />} />
          <Route path="messages"      element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile"       element={<FreelancerProfile />} />

          <Route path="*" element={<Navigate to="/dashboard/freelancer" replace />} />
        </Routes>
      </DashboardLayout>

      <AnimatePresence>
        {pitchTarget && (
          <PitchForm
            post={pitchTarget.post}
            senderType="Freelancer"
            onClose={() => setPitchTarget(null)}
            onSubmit={handlePitchSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FreelancerDashboard;
