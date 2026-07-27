# ThreatSequence

### AI-Assisted Security Operations and Behavioral Threat Analysis

ThreatSequence is an interactive security operations dashboard that correlates simulated security telemetry, reconstructs attack behavior, assesses incident risk, and supports an analyst response workflow from detection through resolution.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_ThreatSequence-22c55e?style=for-the-badge)](https://threat-sequence.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-View_Source-181717?style=for-the-badge&logo=github)](https://github.com/Zachary200114/ThreatSequence)

Built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **Lucide React**.

> **Project status:** Complete portfolio prototype. All incidents, telemetry, predictions, and AI assessments are simulated for demonstration purposes.

<p align="center">
  <img
    src="assets/ai-analysis.png"
    alt="ThreatSequence AI analysis showing incident reasoning, supporting evidence, risk predictions, and recommended actions"
    width="100%"
  >
</p>

---

## Overview

Security analysts rarely investigate a single alert in isolation. They correlate activity across endpoints, networks, identities, cloud services, and email systems to determine what happened, how events are connected, and what an attacker may do next.

ThreatSequence demonstrates that process through a unified SOC interface. The application:

- Correlates related security activity into prioritized incidents
- Organizes events into behavioral attack sequences
- Maps observed behaviors to MITRE ATT&CK techniques
- Produces explainable, simulated risk assessments
- Predicts likely next-stage attacker behavior
- Guides analysts through investigation and response

---

## Core Features

### Incident Detection and Investigation

- Search and filter incidents by title, ID, host, severity, status, or MITRE ATT&CK technique
- Compare incident timelines, confidence levels, supporting signals, and predicted actions
- Review endpoint, identity, network, cloud, email, and file activity in one workspace
- Open complete incident and AI-analysis views for deeper investigation

### Behavioral Attack Sequencing

- Reconstruct related events as an ordered attack path
- Display the security stage, source, timestamp, confidence, and technique for each event
- Connect individual alerts into a readable incident narrative
- Highlight the predicted next action based on the current sequence

### Analyst Response Workflow

- Assign incidents to an analyst
- Add persistent investigation notes
- Change incident severity and response status
- Move cases through acknowledgment, investigation, containment, and resolution
- Export the complete workspace as JSON

### Live SOC Simulation

- Generate fictional telemetry automatically or manually
- Pause, resume, and adjust simulation speed
- Enable or disable individual telemetry sources
- Escalate incidents as new supporting activity appears
- Track live event counts, ingestion rate, and source health

### Workspace Experience

- Receive incident-linked notifications with unread tracking
- Preserve incidents, notes, assignments, notifications, and settings after refresh
- Switch between dashboard themes
- Use a protected reset to restore the original demonstration state
- Navigate the dashboard on desktop, tablet, or mobile

---

## Interface

### Behavioral Attack Graph

The Attack Graph converts correlated telemetry into an ordered behavioral path. Each stage shows what was observed, where it originated, how it relates to the incident, and which MITRE ATT&CK technique it represents.

<p align="center">
  <img
    src="assets/attack-graph.png"
    alt="ThreatSequence behavioral attack graph with correlated security events and MITRE ATT&CK techniques"
    width="100%"
  >
</p>

---

### Telemetry Health

The Telemetry workspace displays connected security sources, ingestion activity, event volume, and pipeline health. Analysts can control the simulation and watch new events affect the broader environment.

<p align="center">
  <img
    src="assets/telem.png"
    alt="ThreatSequence telemetry dashboard showing event volume, ingestion activity, and connected security sources"
    width="100%"
  >
</p>

---

### Settings and Notifications

The settings panel controls simulation speed, alert thresholds, data sources, and appearance. The notification center tracks unread security activity and links alerts directly to their associated incidents.

<table>
  <tr>
    <td align="center" width="50%"><strong>Workspace Settings</strong></td>
    <td align="center" width="50%"><strong>Security Notifications</strong></td>
  </tr>
  <tr>
    <td valign="top">
      <img src="assets/dashboard-settings.png" alt="ThreatSequence simulation, telemetry-source, and appearance settings">
    </td>
    <td valign="top">
      <img src="assets/noti.png" alt="ThreatSequence security notification center with unread incident alerts">
    </td>
  </tr>
</table>

---

## How It Works

1. **Generate telemetry**  
   Client-side generators create fictional endpoint, identity, network, cloud, email, and file events.

2. **Correlate activity**  
   Related events are grouped into an incident and arranged into a behavioral sequence.

3. **Assess the incident**  
   Predefined analysis logic provides a confidence score, risk estimate, supporting evidence, and predicted next action.

4. **Support analyst response**  
   The analyst can assign ownership, add notes, adjust severity, contain activity, and resolve the incident.

5. **Preserve the workspace**  
   Browser storage retains the investigation state, preferences, and notifications after a refresh.

---

## Technology

- **Framework:** Next.js and React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Persistence:** Browser `localStorage`
- **Deployment:** Vercel

---

## Run Locally

### Requirements

- Node.js 20 or newer
- npm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Zachary200114/ThreatSequence.git
   ```

2. Enter the project directory:

   ```bash
   cd ThreatSequence
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Suggested Demo

To explore the primary workflows:

1. Select incidents with different severities and compare their timelines.
2. Search by incident ID, host, title, severity, or MITRE ATT&CK technique.
3. Review the selected incident in the Attack Graph and AI Analysis views.
4. Generate a telemetry event, then pause or change the simulation speed.
5. Assign an analyst, add an investigation note, and update the incident status.
6. Refresh the page to confirm the workspace persists.
7. Export the workspace as JSON.

---

## Project Structure

```text
ThreatSequence/
├── assets/
│   ├── ai-analysis.png
│   ├── attack-graph.png
│   ├── dashboard-settings.png
│   ├── noti.png
│   └── telem.png
├── public/
├── src/
│   └── app/
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

## Scope and Limitations

- All incidents, alerts, hosts, identities, and telemetry are fictional.
- AI conclusions use predefined scenarios and client-side demonstration logic.
- No live SIEM, EDR, identity provider, cloud platform, or threat-intelligence feed is connected.
- Workspace data is stored separately in each visitor’s browser.
- The application does not include authentication, a shared backend, or multi-user collaboration.
- ThreatSequence should not be used for production monitoring or automated security decisions.

---

## Future Development

- Backend API and database persistence
- Authentication and role-based access control
- Real-time, multi-user case collaboration
- Sanitized public security-dataset ingestion
- Auditable live-model outputs and analyst feedback
- Automated accessibility and application testing

---

## Author

**Zachary Ryan**

U.S. Navy veteran and cybersecurity researcher focused on security operations, AI security, and cybersecurity governance.

- [Live ThreatSequence Application](https://threat-sequence.vercel.app)
- [GitHub Profile](https://github.com/Zachary200114)
