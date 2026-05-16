**Marketili — Complete Project Knowledge**



1\. **Project Vision \& Concept:**

The project is a collaborative marketing ecosystem platform that connects Businesses or individuals needing marketing services with (Brands,Agencies,Creative Teams,Freelancers (Influencers,hosts,creatives)) inside one structured professional environment.

full collaboration network That transforms the current informal way of working (Instagram DMs, WhatsApp messages, random spreadsheets, scattered files) into a structured professional ecosystem.focused on the Algerian market.

The app aims to create:

visibility

better matching

more professional collaboration

structured communication

transparent workflows



Replace informal, unstructured hiring of marketing providers with a digital, traceable workflow

Give agencies a full internal workspace (director, commercial, workers) inside the platform



\-It combines:

Marketplace logic

Collaboration tools

Professional paperwork workflows

Team management

Collaboration management

Professional portfolio ecosystem

Project tracking

crm





into one unified system.



**problem:**

Currently, marketing collaboration in the region is highly unstructured.



Common issues:

No organized pitch system

No structured contracts

Lost conversations/files

No project tracking

No traceability

No historical records when workers leave teams

Communication chaos

missing deadlines



Current problems:



hard to find trustworthy providers

difficulty finding serious clients

chaotic communication

visibility issues

poor organization

disconnected tools





Marketili solves this by centralizing the entire lifecycle.



**Long-Term Vision**



The goal is creating a full marketing operations ecosystem where:

Example — Client → Agency:

\-Clients publish opportunities

Providers pitch professionally

Client compares proposals

Client accepts one or multiple pitches

Optional contract draft

Both parties review

Both approve

Contract stored permanently

Contracts and paperwork are handled digitally

Collaboration becomes a project automatically created project

Agencies manage internal operations

Teams collaborate efficiently

Freelancers integrate temporarily into agencies

Workflow progresses through statuses

Historical data remains preserved permanently

Users build professional reputations and visibility

Deliverables are submitted





**similar apps:**

The platform should eventually feel like a hybrid between:

LinkedIn

behance

trello

fiverr

Monday.com

Upwork

Notion

Slack

CRM systems

Marketing agency ERP systems

But specialized specifically for marketing collaboration.



&#x20;



**2. Main Features \& Functionalities**



Supported Roles:

Client

Agency

AgencyMember

Team

TeamMember

Freelancer

Admin



Authentication :

JWT

role-based access

role auto-detection login

authorization middleware

Registration System

Company Registration



Frontend:

PrivateRoute system

unauthorized access page

go back navigation



**registration process:**



\*\*-\*\*Separate user systems

The user chooses:

\-Client:

Person mode

Company mode



\-Agency:

Main company

Filiale / subsidiary

If subsidiary:

they specify which parent company they belong to

Agency Registration Specialties

Agencies choose specialties during registration:

Events

360 Marketing

ATL

BTL

Production

Brand Marketing

These specialties appear:

before the bio in the profile

editable later in profile settings

Post System





\-Team

\-Freelancer

num carte auto entrepreneur





**Contract:**



Contracts Between:

Client ↔ Agency

Client ↔ Freelancer

Agency ↔ Freelancer

Team ↔ Freelancer

Agency ↔ AgencyMember

Contract Goals

The platform should formalize collaboration legally and operationally.

Possible contract types:

Service agreement

Collaboration agreement

Freelance temporary contract CDD

CDI



Important Rule

The contract workflow happens INSIDE the chat system.

No external workflow.

all encrypted flow

Contract Flow

Agency fills Contrat Proforma form

System auto-generates PDF

PDF sent through chat

the client is notified to send a receipt in notifications and chat

Client uploads receipt picture

agency notified to send bon de commande in notifications and chat

Agency sends Bon de Commande

All exchanges stored securely

a success message printed in chat and notification

Contracts and paperwork exchanges should eventually be encrypted in the database.

Includes:

PDFs

receipts

messages

document exchanges

No digital signature system planned for now.



Contracts page(for director and commercial in agency and main account in team and for freelancer and client) includes filters:

client

date

done

resiliation

not completed







**Collaborations:**



Employment-style collaboration

Partnership agreement



If a worker/freelancer leaves:

Account status becomes:

inactive

suspended

archived

NOT deleted.

Their previous work MUST remain attached historically

Old tasks stay linked to original executor

Old project timelines remain intact

Analytics remain accurate

The replacement worker should inherit:

dashboard access

current responsibilities

current ongoing tasks ONLY

NOT historical ownership just observation and reading no modifications



Because:

Projects reference them

Tasks reference them

Deliverables reference them

Activity logs reference them

Contracts reference them

Deleting would break historical integrity.



Restoration System:

if an account isstopped for ending collaboration or job no longer available at the moment that account can later be restored for future collaboration.

This allows:

seasonal freelancers

temporary employees

recurring collaborators

without recreating accounts.



Advanced Collaboration Structure:

Freelancers Inside Agencies

A freelancer may collaborate with multiple agencies.





**posts:**

Clients can create structured marketing requests.

A post may contain:



Title

status

Description

Objectives

Budget range

Benefits instead of direct pricing

Deadline

Region

Required skills

Media uploads

Marketing type

Collaboration type



Important:

Projects May Not Always Have Fixed Price

A post is NOT necessarily monetary.

Some collaborations may offer:

benefits

partnerships

exposure

sponsorship exchange



So posts/pitches should support:



optional pricing

flexible compensation structure



Posts can be:

Public

Directly targeted to specific agencies/providers



Meaning:

A client may directly send a post to:

a specific agency

freelancer

team

Similarly:

Agencies/providers can directly send pitches to targeted clients.





**freelancer Internal Workflow:**

Freelancers Inside Agencies

freelancer Can:

work independently

work under agency/team

A freelancer may collaborate with multiple agencies.

The platform should support:

Freelancer Collaboration Cards

When freelancer logs in they see:

Agencies they collaborate with

Teams they collaborate with

Independent workspace

Each collaboration appears as a card.

Example:

Agency A

Agency B

Team C

Clicking a card switches dashboard context.

Dashboard Context Switching

When freelancer enters Agency A:

They see:

projects only for Agency A

tasks only for Agency A

deadlines only for Agency A

messages only for Agency A

NOT global tasks.

This creates isolated workspaces.



they can also send an application to teams agencies or colaboration proposal to clients or other freelancers







**pitches:**



Pitch Status:



pending →

accepted |

rejected |

withdrawn

When accepted:

all other pitches auto-reject

project auto-creates

post moves to in\_progress

Contract \& Paperwork System



pitch types:

Agency → Client pitch:

highly structured

strategic sections

professional planning

Other pitch types:

more flexible

simpler

different fields

Pitch Types

1\. Agency → Client Pitch

Includes:

objectives

strategy

techniques

pillars

regions

niches

timeline

deliverables

pricing/benefits

notes

stratégie \& planification

idée créative

objectifs

measurable goals

tactics

content pillars

publication calendar

feed organization

competitive analysis

color palette

inspiration

positioning strategy

target audience

demographics

pricing

timeline

attachments

PRAMBULE :

ARTICLE 01 : OBJET DU CONTRAT

ARTICLE 02 : NATURE DES PRESTATIONS

ARTICLE 03 : PERIMETRE DU PROJET ET LIVRABLES

ARTICLE 04 : OBLIGATIONS DES PARTIES

ARTICLE 05 : DISPOSITIONS FINANCIERES

ARTICLE 06 : REVISION DES PRIX

ARTICLE 07 : MODALITES DE PAIEMENT

ARTICLE 08 : DUREE

ARTICLE 09 : CONFIDENTIALITE

ARTICLE 10 : CLAUSE D’EXCLUSIVITE

ARTICLE 11 : FORCE MAJEURE

ARTICLE 12 : DISPOSITIONS DIVERSES

ARTICLE 13 : REGLEMENT DES LITIGES

ARTICLE 14 : RESILIATION

ARTICLE 15 : ELECTION DE DOMICILE

2\. Freelancer → Client Pitch

More flexible:

proposal

services

pricing or compensation

timeline

attachments

3\. Team → Client Pitch

Similar to freelancer but team-oriented.(what team members or tasks will be provided (design edit filmmaker...))

4\. Agency → Freelancer Pitch

Used for hiring/collaboration.

Includes:

CONVENTION DE COLLABORATION

ARTICLE 01 : OBJET DE LA CONVENTION :

ARTICLE 02 – CONDITIONS D'EXPLOITATION DES ATTRIBUTS :

ARTICLE 03 – OBLIGATIONS DE LA PERSONNALITE :

ARTICLE 04 : OBLIGATION ET ENGAGEMENT DE L’AGENCE

ARTICLE 05 : RETRIBUTION, MODALITE ET CONDITION DE PAIEMENT

ARTICLE 06 : LISTE DES RESEAUX SOCIAUX :

Article 07 : DUREE DE LA CONVENTION

Article 08 : CONFIDENTIALITE

Article 09 : LITIGES

Article 10 : AVENANT :

ARTICLE 11 : DATE D’EFFET





**Agency Internal Workflow:**



there might be workers with the same job assigned to same or differentprojects



create internal member accounts

assign members to projects

assign tasks

distribute responsibilities

manage workflows internally



One member can:



handle multiple jobs/tasks

participate in multiple projects



Commercial:

browses posts

identifies opportunities

flags posts



Director:

reviews flagged posts

selects opportunities

sends them to the strategist



Strategist:

prepares pitch and sends them to chef de projet.



chef de projet:

validates pitch

send to client

if not validated it goes back to the strategist and so on .



**history and time stamps:**

Need timestamps for:

post creation

pitch sent

task assigned

project started

completion date

edits

pitch validation

pitch denial

Historical Integrity Is Critical

Never hard-delete:

workers

projects

tasks

contracts

pitches

and everything else

Prefer:

archived

inactive

suspended

and so on.



Deadline Logic:



If deadline passes:

director receives notification

director can manually extend time

Projects should also support:

closest deadline filtering

Calendar System









**Projects:**

Project auto-creates after pitch acceptance.

Project Structure:

Projects appear visually as cards.

Projects are created after pitch acceptance

ONE shared project

Referenced by:

client

provider

But:

viewed differently depending on role

Each project card contains:

progress

client

deadline

status

assigned workers and tasks

progress

statistics

Completed projects:

visually turn grey

Project Detail View

Opening a project displays:

progress bars

tasks

client info

workers

deadlines

changes

deliverables

Task System

Important Logic

Completed projects should visually change.

greyed appearance

archived styling

visual distinction

This helps dashboards remain clean.

ordered:

closest deadline first

Deadline colors:

grey

green

yellow

orange

red







**Tasks:**

Tasks are embedded inside projects.

Task Assignment

Director can assign tasks to:

agency members

freelancers

themselves

Workers can have:

primary specialization

assigned role labels

Users can:

work on multiple projects

receive tasks outside primary labeled role

Example:

A designer may temporarily receive organizational tasks.



Task Status Flow

pending →

in\_progress →

review →

done



taks can be reasigned



ordered:

closest deadline first

Deadline colors:

grey

green

yellow

orange

red





**Profiles:**

Main Four User Profiles



Client Profile:

field of work

activity

previous collaborations



Agency Profile:

previous collaborations

services

portfolio

workers



Freelancer Profile:

skills

collaborations

portfolio



Team Profile:

members

specialization

campaigns



Profiles contain:



bio

specialties

stats

publications

work showcase

media

projects

achievements

Social-Style Posts

Users can post freely like social media.



Can publish:

updates

achievements

campaigns

media

announcements



This creates:

visibility

credibility

portfolio effect





**Notifications:**

Trigger Examples

pitch received

pitch accepted

deadline approaching

overdue project

task assigned

contract signed

collaboration request

account restored

director approval needed



Notifications are categorized.

Categories:

tasks

projects

contracts

deadlines

pitches

admin actions

messages

Users can filter notifications by trigger type.

ordered:



colors:

grey

green

yellow

orange

red



only director sees contract and project notifications ,



**Dashboards:**

Every user has:

calendar

reminders

task dates

project deadlines

Notification System

Each user eventually has:

(personal todo list

reminders

pinned tasks

quick notes )Separate from official project tasks.

activity planning and also everything automatically appears in calendar



Client Dashboard

my posts + create post

browse posts other clients posts or the providers posts

browse providers

pitches received

projects

calendar

profile





Agency Dashboard

browse posts

browse providers

pitches

projects

internal management

analytics

calendars

profile





Freelancer Dashboard

browse posts

browse providers

pitches

collaborations

projects

profile





**Everything**

should support:

search

filters

status filters

date filters

region filters

sorting





**Admin System**:

manage users

disable/enable accounts

access statistics

add fiels and options ,

adds ads

monitor posts

monitor platform activity











**4. System Logic \& Workflows**

Main Lifecycle



Client creates post →

providers browse →

commercial flags →

director reviews →

strategist prepares →

pitch sent →

client accepts →

contract completed

project created →

tasks assigned →

project executed →





**5. Data Relationships \& Architecture**

Architecture Stack



Frontend:

React CRA

Backend:

Express.js

Database:

MongoDB Atlas

ODM:

Mongoose

Uploads:

GridFS

Auth:

JWT

No:

Redux

Zustand

React Context

local storage

Uses:

hooks

services

Database Decision

Separate collections per role.

Reason:

Schemas differ too much.

Collections:

Client

Agency

AgencyMember

Freelancer

Team

TeamMember

Admin

post

task 

pitch



6\. Organizational \& Development Decisions

Always:

inspect current file

identify minimal modification

apply focused change

Never blindly overwrite files.

Naming Conventions

Components:

PascalCase

Services/hooks:

camelCase

CSS:

kebab-case

Important CSS Rule

Different CSS files should use unique class names.

Reason:

avoid collisions and mixups.

Using more CSS files is acceptable if necessarry.

Design Direction

Goal:

premium SaaS feel.

Visual direction:

black/red gradients

smooth animations

clean cards

professional dashboards

modern layouts

No emojis in dashboards.

2\. Development Workflow

Coding approach



Feature by feature — one complete feature at a time, backend then frontend

Minimal changes — only touch files that are directly related to the current task. Never refactor unrelated code

Explain before coding — logic and architecture are discussed before any file is written

Show files before modifying — the developer always pastes the current file content before changes are made. This prevents overwriting newer versions with outdated assumptions

Controlled outputs — each session produces specific named files that map to exact paths in the project



Organizational habits



Backend and frontend are kept completely separate in discussion and in file outputs

Every output file has a comment at the top with its full path (e.g. // backend/controllers/authController.js)

Changes are explained with a summary table at the end of each session listing what changed and why

Bugs are listed before fixes, with the bug number, what it is, why it happens, and what was changed



7\. ***Existing Features Already Working***

multi-role registration

login auto-detection

changing password for members in first login

admin panel

post creation

media uploads

agency member creation

protected routes

landing page

dashboard structure





8\. Existing Problems \& Risks (to fix later in last phase)

Validation Problems

Current issues:

weak validation

numeric names accepted

min/max price inversion accepted

Needed:

stricter backend validation

Security Deferred

Postponed for later:

DDoS protection

advanced encryption

extra hardening

Technical Risks

Linux casing issues

Express route ordering

GridFS timing

notification scaling

role complexity

task synchronization complexity

Important Dependency Lock



axios MUST remain:

0.27.2

Newer versions break CRA webpack.







9\. Future Features Reserved For Later



Not immediate priorities:



AI enhancements

advanced security systems

These should be architecturally anticipated now but implemented later.







10\. Important Hidden Assumptions \& Context

Structured Inputs Philosophy



Anything possible should use:

dropdowns

selectors

radios

checkboxes

Avoid open text fields when structure is possible.

No Meeting Terminology

The platform intentionally avoids:

meeting systems

meeting terminology

scheduling meetings

The focus is workflow execution.











































Frontend language:

French labels

English internal naming

Example:

UI:

“Personne”

“Entreprise”

Code:

individual

company

UX Concepts

closest deadlines first

colored urgency system

searchable/filterable systems

calendar integration

smooth animations

role-based experiences

Current issue:

min/max prices can be inverted.

Need:

min <= max validation

intelligent numeric validation





Avoid:



childish colors

emojis in dashboards

cluttered cards



The system avoids free-text whenever possible.



Uses:



dropdowns

radio buttons

comboboxes

structured selectors

checkboxes





main and alternative scenarios

Advanced security measures are postponed to late-stage development.

No meetings terminology.

no local storage ever



Libraries

LibraryVersionWhyReactCRAFastest setup, team familiaraxios0.27.2 — LOCKEDNewer versions break CRA webpack. Do not upgradeframer-motionlatestAnimations throughout dashboardsmongoose^8.xODM for MongoDBbcryptjs^2.4.3Password hashingjsonwebtokenlatestJWT generation and verificationmulter + multer-gridfs-storagelatestFile uploads to GridFSgridfs-streamlatestServing files from GridFSexpresslatestAPI serverdotenvlatestEnvironment variables

State management



No Redux, no Zustand, no Context

Auth state: useAuth hook reads localStorage on mount

Post state: usePosts and useMyPosts hooks with local useState

Pitch state: usePitches and usePitchesForPost hooks

All hooks follow the same pattern: useState for data + loading + error, useCallback for fetch function, useEffect to trigger on mount 



Pre-save hooks in Mongoose 8 must NOT use next parameter in async hooks — this caused the next is not a function bug across all models

module.exports and exports.X must not be mixed in the same file — caused adminOnly to be undefined

Route order in Express matters — /client/:clientId must be declared before /:id or Express matches the wrong handler

connectDB() must be called before any model is used — mongoURI must never be captured at module load time





7\. Common Mistakes \& Sensitive Areas

File casing (most common bug)

AgencyMember vs Agencymember — Linux is case-sensitive. Windows is not. Every time a new device is used, casing bugs may reappear because it "worked on Windows." Always use exact PascalCase matching the model file name.

Mongoose 8 pre-save hooks

Must be async function() with NO next parameter. The pattern async function(next) causes next is not a function at runtime. This was fixed in all 6 models but any new model must follow the same pattern.

Mixed exports syntax

Never mix exports.X = ... and module.exports = { ... } in the same file. The second one overwrites the first. Use only module.exports for everything.

Route order in Express

Specific routes before generic ones. /pitches/my before /pitches/:id, /pitches/client/:clientId before /pitches/:id. Express matches top-to-bottom.

mongoURI captured at module load time

db.js previously had const mongoURI = process.env.MONGO\_URI at the top of the file — this runs before dotenv loads in server.js, so it captures undefined. Always use process.env.MONGO\_URI inline inside functions, never captured as a module-level constant.

axios version

Must stay at 0.27.2. Newer versions break CRA's webpack configuration. This is a hard lock.

GridFS separate connection

conn is a separate mongoose connection from the main one. If code tries to use conn before connectDB() has been called, it will be undefined. conn is now exported as a function conn() for this reason.

notificationRoutes

/api/notifications was wired in server.js at one point without the route file existing, which crashed the server on startup. It has been removed. Do not re-add it until the notification system is actually built.

AdminDashboard vs AdminPanel

There are two admin interfaces in the codebase. AdminPanel.jsx is a full dark-themed standalone panel (self-contained auth). AdminDashboard.jsx is the lighter version that uses DashboardLayout and relies on PrivateRoute. The current App.js uses AdminDashboard. Do not confuse them.

PitchForm versions

Multiple versions of PitchForm exist in output folders. The correct one is the full 5-step version (version 2 from session history). The broken skeleton version (version 1) only renders two selects and is missing the entire form body.





8\. Collaboration Instructions for Continuing Work

Before writing any code



Paste the current file content — never assume what's in a file. Always share the actual current version before requesting changes

State what's working and what isn't — describe the symptom, not just what you want built

Specify which device/OS — casing bugs behave differently on Windows vs Linux

Confirm which output folder is active — multiple sessions have generated multiple versions of the same file in different output folders



How to avoid breaking existing systems



Never remove a working feature to make room for a new one

Never rename a function, variable, or CSS class that is used in multiple files without checking all usages

Never change the response shape of an API endpoint without updating the frontend service that calls it

Never add a new server.js route without first confirming the route file exists

When adding a new model field, check if any existing controller reads that field and update accordingly

When adding a new memberRole to AgencyMember, update the enum in the model AND the dropdown in CreateMemberForm





Preferred working style



One feature at a time, fully completed (backend + frontend) before moving to the next

Bugs fixed immediately when found, before new features are added

Each session ends with a clear statement of what was completed and what comes next

Files are referenced by their full path from the project root

The conversation summary at session end should always include: what works, what's broken, what's next

















