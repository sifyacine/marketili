import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import "../../styles/auth.css";

const Unauthorized = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="unauthorized-page">
      <motion.div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="unauth-badge">
          <span className="unauth-dot" />
          Accès refusé
        </div>

        <div className="unauthorized-code">403</div>

        <h1 className="unauthorized-title">Permission insuffisante</h1>

        <p className="unauthorized-desc">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
          Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur.
        </p>

        {isAuthenticated
          ? (
            <Link to={`/dashboard/${role}`} className="unauthorized-btn">
              ← Retour à mon tableau de bord
            </Link>
          )
          : (
            <Link to="/login" className="unauthorized-btn">
              ← Se connecter
            </Link>
          )
        }
      </motion.div>
    </div>
  );
};

export default Unauthorized;
