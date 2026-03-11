// frontend/src/pages/auth/Unauthorized.jsx

import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "../../styles/auth.css";

const Unauthorized = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-code">403</div>
      <h1 className="unauthorized-title">Accès non autorisé</h1>
      <p className="unauthorized-desc">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      {isAuthenticated
        ? <Link to={`/dashboard/${role}`} className="unauthorized-btn">← Retour à mon tableau de bord</Link>
        : <Link to="/login" className="unauthorized-btn">← Se connecter</Link>
      }
    </div>
  );
};

export default Unauthorized;