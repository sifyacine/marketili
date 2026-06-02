// backend/utils/buildProjectHistory.js
//
// Assembles a unified, chronological history for a single project by
// DERIVING events from data already captured on the Project, its embedded
// tasks, and the linked Contract. Read-only — no schema changes, no
// migration, and it works on existing/past projects immediately.
//
// Each event has the shape:
//   { id, type, category, at, actorId, actorName, actorRole, title, description, meta }
//
// Categories drive the timeline's filtering/colouring on the frontend:
//   status | deliverable | task | decision | contract | note | member

const STATUS_LABELS = {
  pending:          "Projet en attente",
  pending_contract: "En attente du contrat",
  active:           "Projet activé",
  in_review:        "Projet en révision",
  completed:        "Projet terminé",
  cancelled:        "Projet annulé",
};

function buildProjectHistory(project, contract) {
  const events = [];
  const pid = project._id.toString();

  const push = (e) => {
    if (!e.at) return; // skip events with no timestamp
    events.push({
      id:          e.id,
      type:        e.type,
      category:    e.category,
      at:          e.at,
      actorId:     e.actorId ? e.actorId.toString() : null,
      actorName:   e.actorName || null,
      actorRole:   e.actorRole || null,
      title:       e.title,
      description: e.description || "",
      meta:        e.meta || {},
    });
  };

  // ── Project creation ──
  push({
    id: `proj-created-${pid}`,
    type: "project_created", category: "status",
    at: project.createdAt,
    title: "Projet créé",
    description: project.title || "",
  });

  // ── Status transitions ──
  (project.statusHistory || []).forEach((h, i) => {
    push({
      id: `proj-status-${pid}-${i}`,
      type: "status_change", category: "status",
      at: h.changedAt, actorId: h.changedBy,
      title: STATUS_LABELS[h.status] || `Statut : ${h.status}`,
      description: h.note || "",
      meta: { status: h.status },
    });
  });

  // ── Member assignments ──
  (project.assignedMembers || []).forEach((m, i) => {
    push({
      id: `proj-member-${pid}-${i}`,
      type: "member_assigned", category: "member",
      at: m.assignedAt, actorId: m.memberId, actorName: m.memberName,
      title: "Membre assigné au projet",
      description: m.role ? `${m.memberName || "Membre"} — ${m.role}` : (m.memberName || ""),
      meta: { memberType: m.memberType, role: m.role },
    });
  });

  // ── Project-level deliverables ──
  (project.deliverables || []).forEach((d, i) => {
    push({
      id: `proj-deliv-${pid}-${i}`,
      type: "deliverable_added", category: "deliverable",
      at: d.submittedAt, actorId: d.submittedBy,
      title: "Livrable ajouté",
      description: d.description ? `${d.fileName} — ${d.description}` : (d.fileName || ""),
      meta: { fileUrl: d.fileUrl, fileName: d.fileName, isComplete: !!d.isComplete },
    });
  });

  // ── Project notes (client ↔ provider communication / decisions) ──
  (project.notes || []).forEach((n, i) => {
    push({
      id: `proj-note-${pid}-${i}`,
      type: "note_added", category: "note",
      at: n.createdAt, actorId: n.authorId, actorName: n.authorName, actorRole: n.authorRole,
      title: "Note ajoutée",
      description: n.text || "",
    });
  });

  // ── Tasks and their decisions ──
  (project.tasks || []).forEach((t, ti) => {
    const tid = (t._id || `t${ti}`).toString();

    push({
      id: `task-created-${tid}`,
      type: "task_created", category: "task",
      at: t.createdAt,
      title: "Tâche créée",
      description: t.title || "",
      meta: { taskId: tid, status: t.status, priority: t.priority },
    });

    (t.previousAssignees || []).forEach((p, pi) => {
      push({
        id: `task-handover-${tid}-${pi}`,
        type: "task_reassigned", category: "task",
        at: p.removedAt, actorId: p.memberId, actorName: p.memberName,
        title: "Réassignation de tâche",
        description: `${p.memberName || "Membre"} retiré de « ${t.title} »`,
        meta: { taskId: tid },
      });
    });

    (t.deliverables || []).forEach((d, di) => {
      push({
        id: `task-deliv-${tid}-${di}`,
        type: "task_deliverable", category: "deliverable",
        at: d.submittedAt, actorId: d.submittedBy,
        title: "Livrable de tâche soumis",
        description: d.note ? `« ${t.title} » — ${d.note}` : (d.fileName || t.title || ""),
        meta: { taskId: tid, fileUrl: d.fileUrl, fileName: d.fileName },
      });
    });

    (t.comments || []).forEach((c, ci) => {
      push({
        id: `task-comment-${tid}-${ci}`,
        type: "task_comment", category: "decision",
        at: c.createdAt, actorId: c.authorId, actorName: c.authorName, actorRole: c.authorRole,
        title: "Commentaire sur tâche",
        description: c.text ? `« ${t.title} » : ${c.text}` : "",
        meta: { taskId: tid },
      });
    });
  });

  // ── Contract milestones & documents ──
  if (contract) {
    const cid = contract._id.toString();

    push({
      id: `contract-created-${cid}`,
      type: "contract_created", category: "contract",
      at: contract.createdAt,
      title: "Contrat créé",
      description: contract.title || "Contrat proforma",
      meta: { contractId: cid },
    });

    if (contract.contractPdf && contract.contractPdf.generatedAt) {
      push({
        id: `contract-pdf-${cid}`,
        type: "contract_sent", category: "contract",
        at: contract.contractPdf.generatedAt,
        title: "Contrat proforma envoyé",
        description: contract.contractPdf.filename || "",
        meta: { contractId: cid, fileUrl: contract.contractPdf.url },
      });
    }

    if (contract.receipt && contract.receipt.uploadedAt) {
      push({
        id: `contract-receipt-${cid}`,
        type: "contract_receipt", category: "contract",
        at: contract.receipt.uploadedAt, actorId: contract.receipt.uploadedBy,
        title: "Reçu client reçu",
        description: contract.receipt.filename || "",
        meta: { contractId: cid, fileUrl: contract.receipt.url },
      });
    }

    if (contract.bonDeCommande && contract.bonDeCommande.sentAt) {
      push({
        id: `contract-bdc-${cid}`,
        type: "contract_signed", category: "contract",
        at: contract.bonDeCommande.sentAt, actorId: contract.bonDeCommande.sentBy,
        title: "Bon de commande — contrat finalisé",
        description: contract.bonDeCommande.filename || "",
        meta: { contractId: cid, fileUrl: contract.bonDeCommande.url },
      });
    }

    if (contract.status === "resiliation") {
      const last = [...(contract.statusHistory || [])]
        .reverse()
        .find(h => h.status === "resiliation");
      push({
        id: `contract-resiliation-${cid}`,
        type: "contract_resiliated", category: "contract",
        at: (last && last.changedAt) || contract.updatedAt,
        actorId: last && last.changedBy,
        title: "Contrat résilié",
        description: (last && last.note) || "",
        meta: { contractId: cid },
      });
    }
  }

  // Newest first
  events.sort((a, b) => new Date(b.at) - new Date(a.at));
  return events;
}

module.exports = buildProjectHistory;
