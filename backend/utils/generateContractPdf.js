// backend/utils/generateContractPdf.js
const PDFDocument = require("pdfkit");

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("fr-DZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

const generateContractPdf = (contract) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: "A4" });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const addArticle = (num, title, content) => {
      doc.moveDown(0.8);
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#1a1a1a")
        .text(`ARTICLE ${num} : ${title}`);
      doc.moveDown(0.3);
      if (content) {
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#333")
          .text(content, { lineGap: 3 });
      }
    };

    const addField = (label, value) => {
      if (!value) return;
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#333")
        .text(`${label} : `, { continued: true });
      doc.fontSize(9).font("Helvetica").fillColor("#000").text(value);
    };

    // ── HEADER ──
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#c0152a")
      .text("CONTRAT PROFORMA", { align: "center" });
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(contract.title || "Convention de prestation de services", {
        align: "center",
      });
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#666")
      .text(`Référence : ${contract._id}`, { align: "center" });
    doc.text(`Date : ${fmtDate(contract.createdAt)}`, { align: "center" });
    doc.moveDown(1);

    // ── PRÉAMBULE ──
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("PRÉAMBULE", { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#333")
      .text("Entre les soussignés :", { lineGap: 3 });
    doc.moveDown(0.4);
    doc.fontSize(9).font("Helvetica-Bold").text("PARTIE A — Prestataire :");
    doc
      .fontSize(9)
      .font("Helvetica")
      .text(contract.partyAName || "—");
    doc.moveDown(0.4);
    doc.fontSize(9).font("Helvetica-Bold").text("PARTIE B — Client :");
    doc
      .fontSize(9)
      .font("Helvetica")
      .text(contract.partyBName || "—");
    doc.moveDown(0.4);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#333")
      .text("Il a été arrêté et convenu ce qui suit :", { lineGap: 3 });

    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke("#ccc");

    // ── ARTICLES 01–03 ──
    addArticle("01", "OBJET DU CONTRAT", contract.objet || "Non défini.");
    addArticle(
      "02",
      "NATURE DES PRESTATIONS",
      contract.prestations || "Non défini."
    );
    addArticle(
      "03",
      "PÉRIMÈTRE DU PROJET ET LIVRABLES",
      contract.livrables || "Non défini."
    );
    addArticle(
      "04",
      "OBLIGATIONS DES PARTIES",
      "Chaque partie s'engage à respecter les termes du présent contrat et à coopérer de bonne foi pour atteindre les objectifs définis."
    );

    // ── ARTICLE 05 — Financial ──
    doc.moveDown(0.8);
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .text("ARTICLE 05 : DISPOSITIONS FINANCIÈRES");
    doc.moveDown(0.3);
    if (contract.financialTerms?.amount) {
      addField(
        "Montant",
        `${contract.financialTerms.amount.toLocaleString("fr-DZ")} ${
          contract.financialTerms.currency || "DZD"
        }`
      );
    }
    if (contract.financialTerms?.paymentMethod) {
      addField("Mode de paiement", contract.financialTerms.paymentMethod);
    }

    addArticle(
      "06",
      "RÉVISION DES PRIX",
      "Les prix convenus sont fermes et non révisables pendant la durée du contrat, sauf accord écrit des deux parties."
    );
    addArticle(
      "07",
      "MODALITÉS DE PAIEMENT",
      contract.financialTerms?.paymentSchedule ||
        "Selon accord entre les parties."
    );

    // ── ARTICLE 08 — Duration ──
    doc.moveDown(0.8);
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .text("ARTICLE 08 : DURÉE");
    doc.moveDown(0.3);
    addField("Date de début", fmtDate(contract.duration?.startDate));
    addField("Date de fin", fmtDate(contract.duration?.endDate));
    if (contract.duration?.notes) {
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#333")
        .text(contract.duration.notes, { lineGap: 3 });
    }

    addArticle(
      "09",
      "CONFIDENTIALITÉ",
      contract.confidentialityClause
        ? "Les parties s'engagent à maintenir la stricte confidentialité de toutes les informations échangées dans le cadre du présent contrat."
        : "Sans clause de confidentialité particulière."
    );
    addArticle(
      "10",
      "CLAUSE D'EXCLUSIVITÉ",
      contract.exclusivityClause
        ? "Le prestataire s'engage à ne pas travailler pour des concurrents directs du client pendant la durée du contrat."
        : "Aucune exclusivité n'est prévue par le présent contrat."
    );
    addArticle(
      "11",
      "FORCE MAJEURE",
      "Aucune des parties ne sera tenue responsable de l'inexécution de ses obligations résultant d'un cas de force majeure tel que défini par la loi algérienne."
    );
    addArticle(
      "12",
      "DISPOSITIONS DIVERSES",
      contract.additionalClauses || "Sans disposition particulière."
    );
    addArticle(
      "13",
      "RÈGLEMENT DES LITIGES",
      "Tout litige relatif à l'interprétation ou à l'exécution du présent contrat sera soumis, à défaut d'accord amiable, aux tribunaux compétents de la wilaya où le prestataire est établi."
    );
    addArticle(
      "14",
      "RÉSILIATION",
      contract.resiliationTerms ||
        "Le présent contrat peut être résilié par l'une ou l'autre des parties sous réserve d'un préavis de 15 jours notifié par écrit."
    );
    addArticle(
      "15",
      "ÉLECTION DE DOMICILE",
      `Pour l'exécution du présent contrat, les parties font élection de domicile à leurs adresses respectives :\n- Partie A : ${
        contract.partyAName || "—"
      }\n- Partie B : ${contract.partyBName || "—"}`
    );

    // ── SIGNATURES ──
    doc.moveDown(1.5);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke("#ccc");
    doc.moveDown(0.8);
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("SIGNATURES");
    doc.moveDown(0.6);

    const sigY = doc.y;
    doc
      .fontSize(9)
      .font("Helvetica")
      .text("Fait à ____________, le _______________", 60, sigY);
    doc.text(
      "Fait à ____________, le _______________",
      310,
      sigY
    );

    doc.moveDown(0.6);
    const sig2Y = doc.y;
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("Partie A — Prestataire", 60, sig2Y);
    doc.text("Partie B — Client", 310, sig2Y);

    doc.moveDown(0.3);
    const sig3Y = doc.y;
    doc
      .fontSize(9)
      .font("Helvetica")
      .text(contract.partyAName || "________________", 60, sig3Y);
    doc.text(contract.partyBName || "________________", 310, sig3Y);

    doc.moveDown(1.8);
    const sig4Y = doc.y;
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#555")
      .text("Signature :  ________________________", 60, sig4Y);
    doc.text("Signature :  ________________________", 310, sig4Y);

    doc.end();
  });

module.exports = generateContractPdf;
