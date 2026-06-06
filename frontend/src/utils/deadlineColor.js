







export const getDeadlineColor = (deadline) => {
  if (!deadline) return "#9e9e9e";
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  if (days > 14) return "#22c55e";
  if (days >= 7)  return "#f59e0b";
  if (days >= 3)  return "#f97316";
  return "#ef4444";
};




export const getDeadlineLabel = (deadline) => {
  if (!deadline) return "Aucune échéance";
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  if (days < 0)  return `Dépassée de ${Math.abs(days)}j`;
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  return `${days} jours restants`;
};
