# Task 06 — Contracts

## What's Already Done
- Contract types: service_agreement, collaboration, cdd, cdi, project
- Full status flow: draft → sent → acknowledged → signed → resiliation
- Create, update (draft), send, upload receipt, send bon de commande, resiliate
- Get by party, by project, by ID
- Client contracts page (list + status filter + detail view)
- Client receipt upload form (for "sent" status)

---

## Goals
- Agency can create a contract from within the project detail view
- Auto-generate a PDF from the contract form data (Contrat Proforma)
- Contract workflow happens inside the chat system (long-term: after chat is built)
- Contract page has filters: client, date, status (done / resiliation / not completed)
- Only director sees contract notifications
- Resiliation UI available to both parties

---

## Backend Tasks

- [ ] **Add PDF generation for contracts**
  - Install: `npm install pdfkit` (or `puppeteer` for HTML→PDF)
  - File: new `backend/utils/generateContractPdf.js`
  - Takes a contract object, returns a PDF buffer
  - Add: `GET /contracts/:id/pdf` — streams the generated PDF to the client
  - Store the fileId in `contract.contractPdf` after generation
  - Note: deferred — requires pdfkit install

- [x] **Add date and client filter to GET /contracts**
  - File: `backend/controllers/contractController.js` → `getContracts`
  - Add query params: `fromDate`, `toDate`
  - Filter accordingly before returning

- [x] **Add Agency ↔ AgencyMember contract party support**
  - File: `backend/models/Contract.js`
  - Added `"AgencyMember"` to `partyBType` enum

- [ ] **Wire contract notifications** (do after task 08_notifications)
  - On `sendContract`: notify client → "Contrat envoyé, veuillez envoyer un reçu"
  - On `uploadReceipt`: notify agency director → "Reçu reçu, envoyez le bon de commande"
  - On `sendBonDeCommande`: notify both parties → "Contrat signé"
  - Only director receives these (check recipientRole in Notification.notify())

---

## Frontend Tasks

- [x] **Add "Créer un contrat" button in agency project detail**
  - Already exists in DirectorProjects.js ContractModal
  - Multi-section form with all contract fields

- [ ] **Add PDF download button to contract detail view**
  - Deferred — requires PDF generation backend (pdfkit)
  - Links already shown when contractPdf.url exists

- [x] **Add resiliation initiation UI**
  - File: DirectorContracts.js + ClientContractDetail
  - "Demander la résiliation" button with inline reason form
  - Calls `contractService.resiliate(id, initiatedBy, reason)`

- [x] **Add date + client filters to contracts list**
  - File: DirectorContracts.js
  - Date range pickers (Du / Au) + status filter tabs
  - Wire to `contractService.getAll()` with fromDate/toDate params

- [x] **Build agency contracts page (director)**
  - File: new `DirectorContracts.js`
  - Animated contract list with status left-border + mini stepper preview
  - Status step indicator, workflow action card per status
  - Resiliation zone with inline confirm form
  - Added to AgencyDashboard NAV_DIRECTOR + route `/contracts`
  - Client contracts enhanced: left border, stepper, resiliation UI
