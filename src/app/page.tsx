"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CloudDownload,
  Database,
  Gauge,
  FileKey,
  Filter,
  Globe2,
  LayoutDashboard,
  Menu,
  MessageSquarePlus,
  Network,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Search,
  Server,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  UserRound,
  Users,
  Waypoints,
  Wifi,
  X,
  Zap,
} from "lucide-react";

type View =
  | "overview"
  | "incidents"
  | "attackGraph"
  | "aiAnalysis"
  | "telemetry";

type IncidentStatus =
  | "Open"
  | "Acknowledged"
  | "Investigating"
  | "Contained"
  | "Resolved";

type Analyst = "Unassigned" | "Zachary Ryan" | "Maya Chen" | "Jordan Lee";

type InvestigationNote = {
  id: number;
  author: string;
  text: string;
  createdAt: string;
};

type IncidentWorkflow = {
  status: IncidentStatus;
  assignee: Analyst;
  acknowledged: boolean;
  notes: InvestigationNote[];
  updatedAt: string;
};

type WorkflowMap = Record<string, IncidentWorkflow>;

type ThemePreference = "Midnight" | "Blue Glow";

type SettingsState = {
  simulationEnabled: boolean;
  simulationSpeed: number;
  alertThreshold: number;
  theme: ThemePreference;
  sourceEnabled: Record<string, boolean>;
};

type LiveEvent = {
  id: number;
  incidentId: string;
  source: string;
  title: string;
  detail: string;
  severity: "Critical" | "High" | "Medium" | "Info";
  timestamp: string;
};

type PersistedState = {
  activeView?: View;
  selectedIncidentId?: string;
  notifications?: typeof initialNotifications;
  workflows?: WorkflowMap;
  settings?: SettingsState;
  eventCount?: number;
  liveEvents?: LiveEvent[];
  simulatedIncidentVisible?: boolean;
  severityOverrides?: Record<string, "Critical" | "High" | "Medium">;
  simulationCursor?: number;
};

const STORAGE_KEY = "threatsequence-workspace-v2";

const navigation: {
  name: string;
  view: View;
  icon: typeof LayoutDashboard;
}[] = [
  { name: "Overview", view: "overview", icon: LayoutDashboard },
  { name: "Incidents", view: "incidents", icon: ShieldAlert },
  { name: "Attack Graph", view: "attackGraph", icon: Waypoints },
  { name: "AI Analysis", view: "aiAnalysis", icon: BrainCircuit },
  { name: "Telemetry", view: "telemetry", icon: Radio },
];

const incidents = [
  {
    id: "INC-2026-0719",
    title: "Credential Access Sequence",
    severity: "Critical",
    status: "Open",
    severityColor: "bg-red-500/15 text-red-300 ring-red-500/30",
    host: "WIN-FIN-04",
    technique: "T1003",
    time: "4 min ago",
    duration: "2m 23s observed",
    sequenceConfidence: "96.4%",
    predictedAction:
      "The model predicts attempted external transfer with 78% confidence.",
    events: [
      {
        time: "12:41:03",
        stage: "Execution",
        title: "Encoded PowerShell launched",
        description:
          "Obfuscated command executed through a user-initiated process.",
        technique: "T1059.001",
        source: "Process telemetry",
        icon: Terminal,
        color: "text-blue-300",
        background: "bg-blue-500/15",
        ring: "ring-blue-500/30",
        line: "from-blue-500/60 to-violet-500/40",
      },
      {
        time: "12:41:19",
        stage: "Credential Access",
        title: "LSASS memory access detected",
        description:
          "Untrusted process requested access to protected credential memory.",
        technique: "T1003.001",
        source: "Endpoint detection",
        icon: FileKey,
        color: "text-red-300",
        background: "bg-red-500/15",
        ring: "ring-red-500/30",
        line: "from-violet-500/50 to-red-500/50",
      },
      {
        time: "12:42:07",
        stage: "Discovery",
        title: "Domain trust enumeration",
        description:
          "Account and domain relationships were queried in rapid succession.",
        technique: "T1482",
        source: "Identity telemetry",
        icon: Network,
        color: "text-violet-300",
        background: "bg-violet-500/15",
        ring: "ring-violet-500/30",
        line: "from-red-500/50 to-orange-500/50",
      },
      {
        time: "12:43:26",
        stage: "Collection",
        title: "Sensitive archive created",
        description:
          "Financial documents were compressed into a temporary directory.",
        technique: "T1560.001",
        source: "File telemetry",
        icon: Database,
        color: "text-orange-300",
        background: "bg-orange-500/15",
        ring: "ring-orange-500/30",
        line: "",
      },
    ],
    assessment: {
      label: "Critical threat",
      title: "Probable credential-theft campaign",
      description:
        "The observed sequence strongly resembles an active intrusion progressing toward data exfiltration.",
      confidence: "94.2%",
      action: "Escalate now",
      border: "border-red-500/25",
      gradient:
        "bg-gradient-to-br from-red-500/15 via-red-500/5 to-transparent",
      iconBackground: "bg-red-500/15",
      iconColor: "text-red-300",
      iconRing: "ring-red-500/30",
      textColor: "text-red-300",
      divider: "border-red-500/15",
      badge: "bg-red-500/15 text-red-300 ring-red-500/25",
      risks: [
        { label: "Credential compromise", value: 96, color: "bg-red-400" },
        { label: "Lateral movement", value: 84, color: "bg-orange-400" },
        { label: "Data exfiltration", value: 78, color: "bg-amber-400" },
      ],
      signals: [
        "PowerShell execution immediately preceded credential-memory access.",
        "Domain discovery activity matches known lateral-movement preparation.",
        "Archive creation suggests collection before attempted external transfer.",
      ],
      response:
        "Isolate WIN-FIN-04, revoke active sessions, preserve volatile memory, and begin credential-reset procedures.",
      reasoning: [
        {
          title: "Temporal correlation",
          detail:
            "Four high-risk behaviors occurred within 143 seconds, making an accidental sequence unlikely.",
        },
        {
          title: "Technique progression",
          detail:
            "Execution moved into credential access, discovery, and collection in an order consistent with hands-on intrusion activity.",
        },
        {
          title: "Baseline deviation",
          detail:
            "WIN-FIN-04 has no prior LSASS access or bulk archive behavior in its 30-day baseline.",
        },
      ],
      responseSteps: [
        "Network-isolate WIN-FIN-04 while preserving endpoint telemetry.",
        "Revoke active user sessions and rotate exposed privileged credentials.",
        "Capture volatile memory and the complete PowerShell process tree.",
        "Search the environment for the same hashes, commands, and destination indicators.",
      ],
    },
  },
  {
    id: "INC-2026-0718",
    title: "Suspicious PowerShell Chain",
    severity: "High",
    status: "Investigating",
    severityColor: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
    host: "WKSTN-22",
    technique: "T1059.001",
    time: "11 min ago",
    duration: "1m 48s observed",
    sequenceConfidence: "89.7%",
    predictedAction:
      "The model predicts persistence establishment with 67% confidence.",
    events: [
      {
        time: "12:33:11",
        stage: "Initial Access",
        title: "Office document spawned PowerShell",
        description:
          "A document process launched a hidden PowerShell child process.",
        technique: "T1204.002",
        source: "Process telemetry",
        icon: FileKey,
        color: "text-blue-300",
        background: "bg-blue-500/15",
        ring: "ring-blue-500/30",
        line: "from-blue-500/60 to-cyan-500/40",
      },
      {
        time: "12:33:25",
        stage: "Execution",
        title: "Remote script downloaded",
        description:
          "PowerShell retrieved an encoded script from a newly observed domain.",
        technique: "T1059.001",
        source: "Network telemetry",
        icon: Terminal,
        color: "text-cyan-300",
        background: "bg-cyan-500/15",
        ring: "ring-cyan-500/30",
        line: "from-cyan-500/50 to-violet-500/50",
      },
      {
        time: "12:34:02",
        stage: "Defense Evasion",
        title: "Security exclusions modified",
        description:
          "The process attempted to add a temporary antivirus exclusion.",
        technique: "T1562.001",
        source: "Endpoint detection",
        icon: ShieldAlert,
        color: "text-violet-300",
        background: "bg-violet-500/15",
        ring: "ring-violet-500/30",
        line: "from-violet-500/50 to-orange-500/50",
      },
      {
        time: "12:34:59",
        stage: "Persistence",
        title: "Scheduled task registration attempted",
        description:
          "A recurring task was created to relaunch the downloaded payload.",
        technique: "T1053.005",
        source: "Windows telemetry",
        icon: Clock,
        color: "text-orange-300",
        background: "bg-orange-500/15",
        ring: "ring-orange-500/30",
        line: "",
      },
    ],
    assessment: {
      label: "High-risk activity",
      title: "Probable malicious PowerShell execution",
      description:
        "The activity resembles a staged payload attempting defense evasion and persistent execution.",
      confidence: "89.7%",
      action: "Investigate now",
      border: "border-orange-500/25",
      gradient:
        "bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-transparent",
      iconBackground: "bg-orange-500/15",
      iconColor: "text-orange-300",
      iconRing: "ring-orange-500/30",
      textColor: "text-orange-300",
      divider: "border-orange-500/15",
      badge: "bg-orange-500/15 text-orange-300 ring-orange-500/25",
      risks: [
        { label: "Malware execution", value: 91, color: "bg-orange-400" },
        { label: "Persistence", value: 67, color: "bg-amber-400" },
        { label: "Credential compromise", value: 43, color: "bg-blue-400" },
      ],
      signals: [
        "An Office process launched PowerShell with hidden-window parameters.",
        "The downloaded script originated from a newly observed external domain.",
        "Security-control modification preceded scheduled-task creation.",
      ],
      response:
        "Contain WKSTN-22, terminate the PowerShell process tree, remove the scheduled task, and collect the downloaded payload.",
      reasoning: [
        {
          title: "Parent-child anomaly",
          detail:
            "The Office-to-PowerShell process relationship is rare for this user and host.",
        },
        {
          title: "Layered evasion",
          detail:
            "Encoded content, hidden execution, and antivirus exclusions collectively increase malicious likelihood.",
        },
        {
          title: "Persistence intent",
          detail:
            "The scheduled task referenced the newly downloaded payload and was configured to recur.",
        },
      ],
      responseSteps: [
        "Contain WKSTN-22 and terminate the suspicious process tree.",
        "Remove the scheduled task and restore modified security settings.",
        "Collect the document, script, and downloaded payload for analysis.",
        "Block the external domain and hunt for matching PowerShell arguments.",
      ],
    },
  },
  {
    id: "INC-2026-0717",
    title: "Unusual External Connection",
    severity: "Medium",
    status: "Monitoring",
    severityColor: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
    host: "LINUX-SRV-03",
    technique: "T1071.001",
    time: "24 min ago",
    duration: "4m 12s observed",
    sequenceConfidence: "76.8%",
    predictedAction:
      "The model predicts recurring command-and-control traffic with 58% confidence.",
    events: [
      {
        time: "12:18:44",
        stage: "Network Activity",
        title: "New external destination contacted",
        description:
          "The server initiated an encrypted session with a rare destination.",
        technique: "T1071.001",
        source: "Network telemetry",
        icon: Globe2,
        color: "text-blue-300",
        background: "bg-blue-500/15",
        ring: "ring-blue-500/30",
        line: "from-blue-500/60 to-cyan-500/40",
      },
      {
        time: "12:19:21",
        stage: "Command and Control",
        title: "Periodic HTTPS callbacks detected",
        description:
          "Connections repeated at intervals inconsistent with normal traffic.",
        technique: "T1071.001",
        source: "Proxy telemetry",
        icon: Radio,
        color: "text-cyan-300",
        background: "bg-cyan-500/15",
        ring: "ring-cyan-500/30",
        line: "from-cyan-500/50 to-violet-500/50",
      },
      {
        time: "12:20:38",
        stage: "Discovery",
        title: "Local network interfaces queried",
        description:
          "A shell process enumerated network routes and interface details.",
        technique: "T1016",
        source: "Linux audit logs",
        icon: Network,
        color: "text-violet-300",
        background: "bg-violet-500/15",
        ring: "ring-violet-500/30",
        line: "from-violet-500/50 to-amber-500/50",
      },
      {
        time: "12:22:56",
        stage: "Monitoring",
        title: "Connection pattern repeated",
        description:
          "A second outbound session matched the earlier destination and size.",
        technique: "T1071",
        source: "Flow telemetry",
        icon: Server,
        color: "text-amber-300",
        background: "bg-amber-500/15",
        ring: "ring-amber-500/30",
        line: "",
      },
    ],
    assessment: {
      label: "Suspicious activity",
      title: "Possible command-and-control beaconing",
      description:
        "The outbound pattern is anomalous, but additional telemetry is needed to confirm malicious control traffic.",
      confidence: "76.8%",
      action: "Review activity",
      border: "border-amber-500/25",
      gradient:
        "bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent",
      iconBackground: "bg-amber-500/15",
      iconColor: "text-amber-300",
      iconRing: "ring-amber-500/30",
      textColor: "text-amber-300",
      divider: "border-amber-500/15",
      badge: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
      risks: [
        { label: "Command and control", value: 76, color: "bg-amber-400" },
        { label: "Host compromise", value: 61, color: "bg-orange-400" },
        { label: "Data exfiltration", value: 38, color: "bg-blue-400" },
      ],
      signals: [
        "The destination has not appeared in the previous 30 days of traffic.",
        "Outbound sessions occurred at consistently timed intervals.",
        "Network discovery commands appeared during the connection window.",
      ],
      response:
        "Inspect LINUX-SRV-03 processes, validate the destination domain, capture related network traffic, and increase host monitoring.",
      reasoning: [
        {
          title: "Periodic behavior",
          detail:
            "Outbound sessions show low timing variance commonly associated with automated beaconing.",
        },
        {
          title: "Destination rarity",
          detail:
            "The external destination is new to the environment and uncommon across peer systems.",
        },
        {
          title: "Incomplete confirmation",
          detail:
            "Encrypted payload content is unavailable, so the model keeps confidence below the escalation threshold.",
        },
      ],
      responseSteps: [
        "Inspect current processes and persistence mechanisms on LINUX-SRV-03.",
        "Validate ownership, age, and reputation of the external destination.",
        "Capture full packet and DNS telemetry for subsequent callbacks.",
        "Increase monitoring while comparing activity with peer Linux servers.",
      ],
    },
  },
];

const simulatedIncident: (typeof incidents)[number] = {
  id: "INC-2026-0720",
  title: "Impossible Cloud Sign-In",
  severity: "High",
  status: "Open",
  severityColor: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  host: "AZURE-ID-01",
  technique: "T1078.004",
  time: "just now",
  duration: "1m 06s observed",
  sequenceConfidence: "91.3%",
  predictedAction:
    "The model predicts attempted mailbox and cloud-resource discovery with 73% confidence.",
  events: [
    {
      time: "13:06:02",
      stage: "Initial Access",
      title: "Impossible-travel sign-in accepted",
      description:
        "A valid account authenticated from a new geography minutes after local activity.",
      technique: "T1078.004",
      source: "Identity telemetry",
      icon: UserRound,
      color: "text-blue-300",
      background: "bg-blue-500/15",
      ring: "ring-blue-500/30",
      line: "from-blue-500/60 to-cyan-500/40",
    },
    {
      time: "13:06:18",
      stage: "Discovery",
      title: "Cloud directory enumerated",
      description:
        "The session queried users, roles, groups, and application registrations.",
      technique: "T1087.004",
      source: "Cloud audit logs",
      icon: CloudDownload,
      color: "text-cyan-300",
      background: "bg-cyan-500/15",
      ring: "ring-cyan-500/30",
      line: "from-cyan-500/50 to-violet-500/50",
    },
    {
      time: "13:06:41",
      stage: "Collection",
      title: "Mailbox search volume spiked",
      description:
        "The identity issued multiple broad searches across executive mailboxes.",
      technique: "T1114.002",
      source: "Email security",
      icon: Database,
      color: "text-violet-300",
      background: "bg-violet-500/15",
      ring: "ring-violet-500/30",
      line: "from-violet-500/50 to-orange-500/50",
    },
    {
      time: "13:07:08",
      stage: "Persistence",
      title: "OAuth consent grant attempted",
      description:
        "The session attempted to authorize a previously unseen cloud application.",
      technique: "T1098.003",
      source: "Cloud audit logs",
      icon: ShieldAlert,
      color: "text-orange-300",
      background: "bg-orange-500/15",
      ring: "ring-orange-500/30",
      line: "",
    },
  ],
  assessment: {
    label: "High-risk activity",
    title: "Probable cloud-account takeover",
    description:
      "The identity sequence combines impossible travel, rapid discovery, mailbox collection, and an attempted persistence mechanism.",
    confidence: "91.3%",
    action: "Contain account",
    border: "border-orange-500/25",
    gradient:
      "bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-transparent",
    iconBackground: "bg-orange-500/15",
    iconColor: "text-orange-300",
    iconRing: "ring-orange-500/30",
    textColor: "text-orange-300",
    divider: "border-orange-500/15",
    badge: "bg-orange-500/15 text-orange-300 ring-orange-500/25",
    risks: [
      { label: "Account compromise", value: 94, color: "bg-orange-400" },
      { label: "Cloud persistence", value: 73, color: "bg-amber-400" },
      { label: "Data collection", value: 68, color: "bg-blue-400" },
    ],
    signals: [
      "The source geography is absent from the user and tenant baseline.",
      "Directory discovery began sixteen seconds after authentication.",
      "The OAuth application has never appeared in the environment.",
    ],
    response:
      "Disable the account, revoke tokens, reject the OAuth grant, validate recent mailbox access, and reset credentials.",
    reasoning: [
      {
        title: "Identity impossibility",
        detail:
          "The same account authenticated from locations that cannot be traveled between during the observed interval.",
      },
      {
        title: "Rapid cloud discovery",
        detail:
          "Directory and role enumeration occurred immediately after the anomalous authentication.",
      },
      {
        title: "Persistence attempt",
        detail:
          "The new OAuth consent request could preserve access after the current session is revoked.",
      },
    ],
    responseSteps: [
      "Disable the affected identity and revoke every active refresh token.",
      "Block the source address and reject the unfamiliar OAuth consent grant.",
      "Reset credentials and require phishing-resistant multifactor authentication.",
      "Review mailbox, directory, and cloud-resource access for related activity.",
    ],
  },
};

const allIncidentTemplates = [simulatedIncident, ...incidents];

const severityStyles = {
  Critical: "bg-red-500/15 text-red-300 ring-red-500/30",
  High: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  Medium: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
};

const analysts: Analyst[] = [
  "Unassigned",
  "Zachary Ryan",
  "Maya Chen",
  "Jordan Lee",
];

const responseStatuses: IncidentStatus[] = [
  "Acknowledged",
  "Investigating",
  "Contained",
  "Resolved",
];

const initialWorkflows: WorkflowMap = Object.fromEntries(
  allIncidentTemplates.map((incident) => {
    const status: IncidentStatus =
      incident.status === "Investigating"
        ? "Investigating"
        : incident.status === "Open"
          ? "Open"
          : "Acknowledged";

    return [
      incident.id,
      {
        status,
        assignee: "Unassigned" as Analyst,
        acknowledged: status !== "Open",
        notes: [],
        updatedAt: "Not updated",
      },
    ];
  }),
);

const initialNotifications = [
  {
    id: 1,
    incidentId: "INC-2026-0719",
    title: "Critical incident detected",
    detail: "Credential access sequence on WIN-FIN-04",
    time: "4m",
    read: false,
    color: "bg-red-400",
  },
  {
    id: 2,
    incidentId: "INC-2026-0718",
    title: "Persistence attempt observed",
    detail: "Scheduled task created on WKSTN-22",
    time: "11m",
    read: false,
    color: "bg-orange-400",
  },
  {
    id: 3,
    incidentId: "INC-2026-0717",
    title: "Rare destination contacted",
    detail: "Beacon-like traffic from LINUX-SRV-03",
    time: "24m",
    read: true,
    color: "bg-amber-400",
  },
];

const telemetrySources = [
  {
    name: "Endpoint detection",
    events: "782K",
    health: 99.8,
    status: "Online",
  },
  { name: "Network telemetry", events: "641K", health: 99.2, status: "Online" },
  {
    name: "Identity telemetry",
    events: "418K",
    health: 98.6,
    status: "Online",
  },
  { name: "Cloud audit logs", events: "327K", health: 97.9, status: "Online" },
  { name: "Email security", events: "201K", health: 96.4, status: "Degraded" },
];

const defaultSettings: SettingsState = {
  simulationEnabled: true,
  simulationSpeed: 8000,
  alertThreshold: 70,
  theme: "Midnight",
  sourceEnabled: Object.fromEntries(
    telemetrySources.map((source) => [source.name, true]),
  ),
};

const simulationEvents = [
  {
    incidentId: "INC-2026-0717",
    source: "Network telemetry",
    title: "Beacon interval repeated",
    detail: "A third HTTPS callback matched the prior destination and cadence.",
    severity: "Medium" as const,
  },
  {
    incidentId: "INC-2026-0718",
    source: "Endpoint detection",
    title: "Persistence artifact confirmed",
    detail: "The scheduled task referenced the downloaded PowerShell payload.",
    severity: "High" as const,
  },
  {
    incidentId: "INC-2026-0719",
    source: "Identity telemetry",
    title: "Privileged session reused",
    detail: "A harvested token authenticated to a second financial system.",
    severity: "Critical" as const,
    severityChange: { incidentId: "INC-2026-0718", severity: "Critical" },
  },
  {
    incidentId: "INC-2026-0720",
    source: "Cloud audit logs",
    title: "New cloud identity sequence",
    detail:
      "Impossible travel was followed by directory and mailbox discovery.",
    severity: "High" as const,
    createsIncident: true,
  },
  {
    incidentId: "INC-2026-0720",
    source: "Email security",
    title: "OAuth persistence attempt",
    detail: "An unfamiliar application requested offline mailbox access.",
    severity: "High" as const,
  },
  {
    incidentId: "INC-2026-0719",
    source: "Endpoint detection",
    title: "Containment signal received",
    detail: "WIN-FIN-04 stopped sending network telemetry after isolation.",
    severity: "Info" as const,
  },
];

function formatEventCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function currentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function notificationColor(severity: LiveEvent["severity"]) {
  if (severity === "Critical") return "bg-red-400";
  if (severity === "High") return "bg-orange-400";
  if (severity === "Medium") return "bg-amber-400";
  return "bg-blue-400";
}

function IncidentCard({
  incident,
  selected,
  onSelect,
}: {
  incident: (typeof incidents)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group w-full rounded-xl border p-4 text-left transition ${
        selected
          ? "border-blue-500/40 bg-blue-500/10 shadow-[0_10px_30px_rgba(37,99,235,0.08)]"
          : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${incident.severityColor}`}
            >
              {incident.severity}
            </span>
            <span className="rounded-full bg-slate-800/80 px-2 py-1 text-[10px] font-semibold text-slate-400">
              {incident.status}
            </span>
            <span className="text-[11px] text-slate-600">{incident.id}</span>
          </div>
          <p className="truncate text-sm font-semibold text-slate-200">
            {incident.title}
          </p>
        </div>
        <ChevronRight
          size={17}
          className={`mt-1 shrink-0 transition ${
            selected
              ? "translate-x-0.5 text-blue-400"
              : "text-slate-600 group-hover:translate-x-0.5 group-hover:text-blue-400"
          }`}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Server size={13} />
          {incident.host}
        </span>
        <span className="font-mono text-blue-400">{incident.technique}</span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} />
          {incident.time}
        </span>
      </div>
    </button>
  );
}

function Timeline({ incident }: { incident: (typeof incidents)[number] }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a111e] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-5 sm:px-6">
        <div>
          <h3 className="font-semibold">Attack Timeline</h3>
          <p className="mt-1 text-sm text-slate-500">
            AI-reconstructed behavioral sequence
          </p>
        </div>
        <div className="shrink-0 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-right">
          <p className="text-[9px] uppercase tracking-wider text-slate-500">
            Confidence
          </p>
          <p className="mt-0.5 text-sm font-semibold text-blue-300">
            {incident.sequenceConfidence}
          </p>
        </div>
      </div>
      <div className="border-b border-slate-800 bg-slate-950/30 px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-slate-500">{incident.id}</span>
          <ChevronRight size={12} className="text-slate-700" />
          <span className="font-medium text-slate-300">{incident.title}</span>
          <span className="flex items-center gap-1.5 text-slate-500 sm:ml-auto">
            <Clock size={12} />
            {incident.duration}
          </span>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">
        {incident.events.map((event, index) => {
          const Icon = event.icon;
          const isLast = index === incident.events.length - 1;
          return (
            <div
              key={`${incident.id}-${event.time}`}
              className="relative flex gap-3 sm:gap-4"
            >
              <div className="flex w-10 shrink-0 flex-col items-center sm:w-11">
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl ${event.background} ${event.color} ring-1 ${event.ring} shadow-lg`}
                >
                  <Icon size={17} />
                </div>
                {!isLast && (
                  <div
                    className={`h-[84px] w-px bg-gradient-to-b ${event.line}`}
                  />
                )}
              </div>
              <div className={`min-w-0 flex-1 ${isLast ? "pb-1" : "pb-5"}`}>
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-[0.12em] ${event.color}`}
                  >
                    {event.stage}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span className="font-mono text-[11px] text-slate-600">
                    {event.time}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  {event.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {event.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-900 px-2 py-1 font-mono text-[10px] text-blue-400 ring-1 ring-slate-800">
                    {event.technique}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {event.source}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
            <BrainCircuit size={15} />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-200">
              Predicted next action
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {incident.predictedAction}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function Assessment({
  incident,
  onOpen,
}: {
  incident: (typeof incidents)[number];
  onOpen: () => void;
}) {
  const assessment = incident.assessment;
  return (
    <article className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-[#0a111e] shadow-[0_20px_60px_rgba(0,80,180,0.08)]">
      <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <BrainCircuit size={19} className="text-blue-400" />
              AI Assessment
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Model reasoning and risk prediction
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-300 ring-1 ring-cyan-500/25">
            <Sparkles size={11} />
            LIVE
          </span>
        </div>
      </div>
      <div className="p-5">
        <div
          className={`rounded-xl border p-4 ${assessment.border} ${assessment.gradient}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${assessment.iconBackground} ${assessment.iconColor} ${assessment.iconRing}`}
            >
              <AlertTriangle size={19} />
            </div>
            <div>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.15em] ${assessment.textColor}`}
              >
                {assessment.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                {assessment.title}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {assessment.description}
              </p>
            </div>
          </div>
          <div
            className={`mt-4 flex items-end justify-between border-t pt-4 ${assessment.divider}`}
          >
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Assessment confidence
              </p>
              <p
                className={`mt-1 text-2xl font-semibold ${assessment.textColor}`}
              >
                {assessment.confidence}
              </p>
            </div>
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-semibold ring-1 ${assessment.badge}`}
            >
              {assessment.action}
            </span>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-300">
              Predicted risk
            </p>
            <p className="text-[10px] text-slate-600">Next 30 minutes</p>
          </div>
          <div className="space-y-4">
            {assessment.risks.map((risk) => (
              <div key={risk.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{risk.label}</span>
                  <span className="font-mono text-slate-300">
                    {risk.value}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${risk.color}`}
                    style={{ width: `${risk.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="my-5 h-px bg-slate-800" />
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ShieldCheck size={15} className="text-blue-400" />
            Supporting signals
          </p>
          <div className="space-y-3">
            {assessment.signals.map((signal) => (
              <div key={signal} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={14}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <p className="text-xs leading-5 text-slate-500">{signal}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-300">
            Recommended response
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {assessment.response}
          </p>
        </div>
      </div>
      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500/15 px-4 py-3 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30 transition hover:bg-blue-500/25"
        >
          Open full AI analysis
          <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("overview");
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidents[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workflows, setWorkflows] = useState<WorkflowMap>(initialWorkflows);
  const [noteDraft, setNoteDraft] = useState("");
  const [settingsState, setSettingsState] =
    useState<SettingsState>(defaultSettings);
  const [eventCount, setEventCount] = useState(2_400_000);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [simulationCursor, setSimulationCursor] = useState(0);
  const [simulatedIncidentVisible, setSimulatedIncidentVisible] =
    useState(false);
  const [severityOverrides, setSeverityOverrides] = useState<
    Record<string, "Critical" | "High" | "Medium">
  >({});
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayIncidents = useMemo(() => {
    const available = simulatedIncidentVisible
      ? [simulatedIncident, ...incidents]
      : incidents;

    return available.map((incident) => {
      const severity = severityOverrides[incident.id] ?? incident.severity;
      const workflow = workflows[incident.id];

      return {
        ...incident,
        severity,
        severityColor:
          severityStyles[severity as keyof typeof severityStyles] ??
          incident.severityColor,
        status: workflow?.status ?? incident.status,
      };
    });
  }, [severityOverrides, simulatedIncidentVisible, workflows]);

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return displayIncidents.filter((incident) => {
      const matchesQuery = [
        incident.id,
        incident.title,
        incident.severity,
        incident.status,
        incident.host,
        incident.technique,
      ].some((value) => value.toLowerCase().includes(query));
      const matchesSeverity =
        severityFilter === "All" || incident.severity === severityFilter;
      return matchesQuery && matchesSeverity;
    });
  }, [displayIncidents, searchQuery, severityFilter]);

  const selectedIncident =
    displayIncidents.find((incident) => incident.id === selectedIncidentId) ??
    displayIncidents[0];

  const selectedWorkflow =
    workflows[selectedIncident.id] ?? initialWorkflows[selectedIncident.id];

  const enabledSourceCount = telemetrySources.filter(
    (source) => settingsState.sourceEnabled[source.name],
  ).length;

  const telemetryHealth =
    enabledSourceCount === 0
      ? 0
      : telemetrySources
          .filter((source) => settingsState.sourceEnabled[source.name])
          .reduce((sum, source) => sum + source.health, 0) / enabledSourceCount;

  const activeIncidentCount = displayIncidents.filter(
    (incident) => workflows[incident.id]?.status !== "Resolved",
  ).length;

  const dashboardMetrics = [
    {
      label: "Active Incidents",
      value: activeIncidentCount.toString(),
      detail: `${displayIncidents.filter((incident) => incident.severity === "Critical").length} critical`,
      color: "text-red-400",
    },
    {
      label: "Events Analyzed",
      value: formatEventCount(eventCount),
      detail: settingsState.simulationEnabled
        ? "Live simulation"
        : "Simulation paused",
      color: "text-blue-400",
    },
    {
      label: "Model Confidence",
      value: "94.2%",
      detail: `${settingsState.alertThreshold}% alert threshold`,
      color: "text-cyan-400",
    },
    {
      label: "Telemetry Health",
      value: `${telemetryHealth.toFixed(1)}%`,
      detail: `${enabledSourceCount} of ${telemetrySources.length} sources enabled`,
      color: enabledSourceCount > 0 ? "text-emerald-400" : "text-red-400",
    },
  ];

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const saved = JSON.parse(stored) as PersistedState;
        if (saved.activeView) setActiveView(saved.activeView);
        if (saved.selectedIncidentId) {
          setSelectedIncidentId(saved.selectedIncidentId);
        }
        if (saved.notifications) setNotifications(saved.notifications);
        if (saved.workflows) {
          setWorkflows({ ...initialWorkflows, ...saved.workflows });
        }
        if (saved.settings) {
          setSettingsState({
            ...defaultSettings,
            ...saved.settings,
            sourceEnabled: {
              ...defaultSettings.sourceEnabled,
              ...saved.settings.sourceEnabled,
            },
          });
        }
        if (typeof saved.eventCount === "number") {
          setEventCount(saved.eventCount);
        }
        if (saved.liveEvents) setLiveEvents(saved.liveEvents);
        if (typeof saved.simulatedIncidentVisible === "boolean") {
          setSimulatedIncidentVisible(saved.simulatedIncidentVisible);
        }
        if (saved.severityOverrides) {
          setSeverityOverrides(saved.severityOverrides);
        }
        if (typeof saved.simulationCursor === "number") {
          setSimulationCursor(saved.simulationCursor);
        }
      }
    } catch {
      setToast("Saved workspace could not be restored. Defaults were loaded.");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const state: PersistedState = {
      activeView,
      selectedIncidentId,
      notifications,
      workflows,
      settings: settingsState,
      eventCount,
      liveEvents,
      simulatedIncidentVisible,
      severityOverrides,
      simulationCursor,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setToast("Changes could not be saved in this browser.");
    }
  }, [
    activeView,
    eventCount,
    hydrated,
    liveEvents,
    notifications,
    selectedIncidentId,
    settingsState,
    severityOverrides,
    simulatedIncidentVisible,
    simulationCursor,
    workflows,
  ]);

  const processSimulationStep = useCallback(() => {
    const template =
      simulationEvents[simulationCursor % simulationEvents.length];
    setSimulationCursor((current) => current + 1);

    if (!settingsState.sourceEnabled[template.source]) return;

    const nextEvent: LiveEvent = {
      id: Date.now(),
      incidentId: template.incidentId,
      source: template.source,
      title: template.title,
      detail: template.detail,
      severity: template.severity,
      timestamp: currentTime(),
    };

    setLiveEvents((current) => [nextEvent, ...current].slice(0, 10));
    setEventCount((current) => current + 2400 + (simulationCursor % 5) * 380);

    if (template.severityChange) {
      setSeverityOverrides((current) => ({
        ...current,
        [template.severityChange.incidentId]: template.severityChange
          .severity as "Critical",
      }));
      setToast("INC-2026-0718 escalated to Critical.");
    }

    if (template.createsIncident && !simulatedIncidentVisible) {
      setSimulatedIncidentVisible(true);
      setToast("New incident INC-2026-0720 added to the queue.");
    }

    const severityScore = {
      Critical: 96,
      High: 84,
      Medium: 66,
      Info: 25,
    }[template.severity];

    if (severityScore >= settingsState.alertThreshold) {
      setNotifications((current) => {
        const nextNotification = {
          id: Date.now() + 1,
          incidentId: template.incidentId,
          title: template.title,
          detail: template.detail,
          time: "now",
          read: false,
          color: notificationColor(template.severity),
        };
        return [nextNotification, ...current].slice(0, 8);
      });
    }
  }, [
    settingsState.alertThreshold,
    settingsState.sourceEnabled,
    simulatedIncidentVisible,
    simulationCursor,
  ]);

  useEffect(() => {
    if (
      !hydrated ||
      !settingsState.simulationEnabled ||
      enabledSourceCount === 0
    ) {
      return;
    }

    const timer = window.setInterval(
      processSimulationStep,
      settingsState.simulationSpeed,
    );
    return () => window.clearInterval(timer);
  }, [
    enabledSourceCount,
    hydrated,
    processSimulationStep,
    settingsState.simulationEnabled,
    settingsState.simulationSpeed,
  ]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const closeFloatingMenus = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", closeFloatingMenus);
    return () => document.removeEventListener("mousedown", closeFloatingMenus);
  }, []);

  const navigate = (view: View) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectIncident = (
    incidentId: string,
    destination: View = "overview",
  ) => {
    setSelectedIncidentId(incidentId);
    setActiveView(destination);
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openNotification = (notificationId: number, incidentId: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    );
    if (incidentId === simulatedIncident.id) {
      setSimulatedIncidentVisible(true);
    }
    selectIncident(incidentId);
  };

  const updateWorkflow = (
    incidentId: string,
    updates: Partial<IncidentWorkflow>,
    message?: string,
  ) => {
    setWorkflows((current) => ({
      ...current,
      [incidentId]: {
        ...(current[incidentId] ?? initialWorkflows[incidentId]),
        ...updates,
        updatedAt: currentTime(),
      },
    }));
    if (message) setToast(message);
  };

  const setIncidentStatus = (status: IncidentStatus) => {
    updateWorkflow(
      selectedIncident.id,
      {
        status,
        acknowledged: status !== "Open",
      },
      `${selectedIncident.id} moved to ${status}.`,
    );
  };

  const addInvestigationNote = () => {
    const text = noteDraft.trim();
    if (!text) {
      setToast("Write a note before adding it.");
      return;
    }

    const note: InvestigationNote = {
      id: Date.now(),
      author: "Zachary Ryan",
      text,
      createdAt: currentTime(),
    };

    updateWorkflow(selectedIncident.id, {
      notes: [...(selectedWorkflow?.notes ?? []), note],
    });
    setNoteDraft("");
    setToast("Investigation note saved.");
  };

  const exportWorkspace = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      incidents: displayIncidents.map((incident) => ({
        id: incident.id,
        title: incident.title,
        severity: incident.severity,
        host: incident.host,
        technique: incident.technique,
        workflow: workflows[incident.id],
      })),
      liveEvents,
      settings: settingsState,
    };

    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "threatsequence-workspace.json";
      anchor.click();
      URL.revokeObjectURL(url);
      setToast("Workspace export downloaded.");
    } catch {
      setToast("Workspace export could not be created.");
    }
  };

  const resetWorkspace = () => {
    if (!resetArmed) {
      setResetArmed(true);
      setToast("Select reset again to confirm.");
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    setActiveView("overview");
    setSelectedIncidentId(incidents[0].id);
    setNotifications(initialNotifications);
    setWorkflows(initialWorkflows);
    setSettingsState(defaultSettings);
    setEventCount(2_400_000);
    setLiveEvents([]);
    setSimulationCursor(0);
    setSimulatedIncidentVisible(false);
    setSeverityOverrides({});
    setSearchQuery("");
    setSeverityFilter("All");
    setSettingsOpen(false);
    setResetArmed(false);
    setToast("ThreatSequence workspace reset.");
  };

  const pageTitles: Record<View, { title: string; subtitle: string }> = {
    overview: {
      title: "Mission Control",
      subtitle: "Live AI threat detection and attack-sequence analysis",
    },
    incidents: {
      title: "Incident Center",
      subtitle: "Search, filter, and investigate prioritized threats",
    },
    attackGraph: {
      title: "Attack Graph",
      subtitle: "Visual progression of the selected behavioral sequence",
    },
    aiAnalysis: {
      title: "AI Analysis",
      subtitle: "Expanded reasoning, evidence, risk, and response guidance",
    },
    telemetry: {
      title: "Telemetry",
      subtitle: "Ingestion health and security-data coverage",
    },
  };

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-[#080e19]">
      <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-400/30">
            <Activity size={22} />
          </div>
          <div>
            <p className="font-semibold tracking-wide">ThreatSequence</p>
            <p className="text-xs text-slate-500">AI Security Operations</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="space-y-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.view;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => navigate(item.view)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                active
                  ? "bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-slate-800 p-4">
        <div
          className={`rounded-xl border p-4 ${
            enabledSourceCount > 0
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-red-500/20 bg-red-500/5"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              enabledSourceCount > 0 ? "text-emerald-300" : "text-red-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                enabledSourceCount > 0
                  ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                  : "bg-red-400"
              }`}
            />
            {enabledSourceCount > 0 ? "System operational" : "Sources disabled"}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            {enabledSourceCount} of {telemetrySources.length} telemetry sources
            enabled
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSettingsOpen(true);
            setMobileMenuOpen(false);
          }}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
        >
          <Settings size={17} />
          Settings
        </button>
      </div>
    </aside>
  );

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050a12] text-slate-100">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-400/30">
            <Activity size={27} />
          </div>
          <p className="mt-5 text-sm font-semibold">Loading ThreatSequence</p>
          <p className="mt-2 text-xs text-slate-600">
            Restoring the analyst workspace
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen text-slate-100 transition-colors ${
        settingsState.theme === "Blue Glow" ? "bg-[#030914]" : "bg-[#050a12]"
      }`}
    >
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        {sidebar}
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative h-full w-64 shadow-2xl">{sidebar}</div>
        </div>
      )}

      <section className="lg:ml-64">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-3 border-b border-slate-800 bg-[#080e19]/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5 text-slate-400 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold sm:text-xl">
                {pageTitles[activeView].title}
              </h1>
              <p className="hidden truncate text-sm text-slate-500 sm:block">
                {pageTitles[activeView].subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="hidden w-56 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 transition focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 md:flex xl:w-64">
              <Search size={16} className="shrink-0 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => {
                  if (activeView !== "overview" && activeView !== "incidents") {
                    setActiveView("incidents");
                  }
                }}
                placeholder="Search incidents"
                aria-label="Search incidents"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear incident search"
                  className="flex h-5 w-5 items-center justify-center rounded text-slate-500 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={() =>
                setSettingsState((current) => ({
                  ...current,
                  simulationEnabled: !current.simulationEnabled,
                }))
              }
              className={`hidden items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition sm:flex ${
                settingsState.simulationEnabled
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-800 bg-slate-900/70 text-slate-400"
              }`}
            >
              {settingsState.simulationEnabled ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )}
              {settingsState.simulationEnabled ? "Live" : "Paused"}
            </button>

            <div ref={notificationRef} className="relative">
              <button
                type="button"
                aria-label="Open notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative rounded-lg border border-slate-800 bg-slate-900/70 p-2.5 text-slate-400 transition hover:border-slate-700 hover:text-white"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-[#080e19]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-[#0a111e] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold">Notifications</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {unreadCount} unread security alerts
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((current) =>
                          current.map((item) => ({ ...item, read: true })),
                        )
                      }
                      disabled={unreadCount === 0}
                      className="text-[11px] font-semibold text-blue-400 transition hover:text-blue-300 disabled:cursor-default disabled:text-slate-600"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div>
                    {notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() =>
                          openNotification(
                            notification.id,
                            notification.incidentId,
                          )
                        }
                        className={`flex w-full gap-3 border-b border-slate-800/80 px-4 py-4 text-left transition last:border-0 hover:bg-slate-800/50 ${
                          notification.read ? "bg-transparent" : "bg-blue-500/5"
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${notification.color} ${
                            notification.read ? "opacity-30" : ""
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-3">
                            <span
                              className={`truncate text-xs font-semibold ${
                                notification.read
                                  ? "text-slate-400"
                                  : "text-slate-200"
                              }`}
                            >
                              {notification.title}
                            </span>
                            <span className="shrink-0 text-[10px] text-slate-600">
                              {notification.time}
                            </span>
                          </span>
                          <span className="mt-1 block text-[11px] leading-5 text-slate-500">
                            {notification.detail}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Open settings"
              onClick={() => setSettingsOpen(true)}
              className="hidden rounded-lg border border-slate-800 bg-slate-900/70 p-2.5 text-slate-400 transition hover:border-slate-700 hover:text-white sm:block"
            >
              <Settings size={18} />
            </button>

            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label="Open analyst profile"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-300 ring-1 ring-blue-400/30 transition hover:bg-blue-500/30"
              >
                ZR
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-700 bg-[#0a111e] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                  <div className="border-b border-slate-800 p-4">
                    <p className="text-sm font-semibold">Zachary Ryan</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Lead SOC Analyst
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(true);
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                    >
                      <SlidersHorizontal size={15} />
                      Workspace settings
                    </button>
                    <button
                      type="button"
                      onClick={exportWorkspace}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
                    >
                      <CloudDownload size={15} />
                      Export workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <label className="mb-5 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2.5 transition focus-within:border-blue-500/50 md:hidden">
            <Search size={16} className="shrink-0 text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => {
                if (activeView !== "overview" && activeView !== "incidents") {
                  setActiveView("incidents");
                }
              }}
              placeholder="Search incidents"
              aria-label="Search incidents"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear incident search"
                className="text-slate-500"
              >
                <X size={15} />
              </button>
            )}
          </label>

          {activeView === "overview" && (
            <>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                    Operational overview
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Security environment
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={processSimulationStep}
                    disabled={enabledSourceCount === 0}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Zap size={14} />
                    Generate event
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettingsState((current) => ({
                        ...current,
                        simulationEnabled: !current.simulationEnabled,
                      }))
                    }
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      settingsState.simulationEnabled
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-700 bg-slate-900/70 text-slate-400"
                    }`}
                  >
                    {settingsState.simulationEnabled ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                    {settingsState.simulationEnabled
                      ? "Pause stream"
                      : "Resume stream"}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardMetrics.map((metric) => (
                  <article
                    key={metric.label}
                    className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-[#0a111e] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
                  >
                    <p className="text-sm text-slate-500">{metric.label}</p>
                    <p
                      className={`mt-3 text-3xl font-semibold ${metric.color}`}
                    >
                      {metric.value}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {metric.detail}
                    </p>
                  </article>
                ))}
              </div>

              <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0a111e]">
                <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Wifi
                        size={15}
                        className={
                          settingsState.simulationEnabled
                            ? "text-emerald-400"
                            : "text-slate-600"
                        }
                      />
                      Live telemetry stream
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Simulated signals feed the same incident and notification
                      state
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-600">
                    {settingsState.simulationEnabled
                      ? `Next event in ${settingsState.simulationSpeed / 1000}s`
                      : "Stream paused"}
                  </span>
                </div>
                {liveEvents.length > 0 ? (
                  <div className="grid gap-px bg-slate-800 lg:grid-cols-2">
                    {liveEvents.slice(0, 4).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          if (event.incidentId === simulatedIncident.id) {
                            setSimulatedIncidentVisible(true);
                          }
                          selectIncident(event.incidentId);
                        }}
                        className="flex items-start gap-3 bg-[#0a111e] px-5 py-4 text-left transition hover:bg-slate-900/80"
                      >
                        <span
                          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${notificationColor(event.severity)}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-300">
                              {event.title}
                            </span>
                            <span className="font-mono text-[10px] text-slate-600">
                              {event.timestamp}
                            </span>
                          </span>
                          <span className="mt-1 block text-[11px] leading-5 text-slate-500">
                            {event.source} • {event.detail}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center">
                    <Radio size={21} className="mx-auto text-slate-700" />
                    <p className="mt-3 text-xs text-slate-500">
                      Waiting for the next simulated security event.
                    </p>
                  </div>
                )}
              </section>

              <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_1.4fr_1fr]">
                <article className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a111e] shadow-xl">
                  <div className="flex items-start justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
                    <div>
                      <h3 className="font-semibold">Active Incidents</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Prioritized threats requiring review
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-300 ring-1 ring-red-500/30">
                      {searchQuery.trim()
                        ? `${filteredIncidents.length} shown`
                        : `${activeIncidentCount} active`}
                    </span>
                  </div>
                  <div className="space-y-3 p-4">
                    {filteredIncidents.map((incident) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        selected={incident.id === selectedIncidentId}
                        onSelect={() => setSelectedIncidentId(incident.id)}
                      />
                    ))}
                    {filteredIncidents.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 px-5 py-10 text-center">
                        <Search size={22} className="mx-auto text-slate-600" />
                        <p className="mt-3 text-sm font-semibold text-slate-300">
                          No incidents found
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          No incidents match “{searchQuery}”.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="mt-4 text-xs font-semibold text-blue-400 hover:text-blue-300"
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-800 px-5 py-4">
                    <button
                      type="button"
                      onClick={() => navigate("incidents")}
                      className="flex w-full items-center justify-center gap-2 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                    >
                      View all incidents
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </article>

                <Timeline
                  key={`timeline-${selectedIncident.id}`}
                  incident={selectedIncident}
                />
                <Assessment
                  key={`assessment-${selectedIncident.id}`}
                  incident={selectedIncident}
                  onOpen={() => navigate("aiAnalysis")}
                />
              </div>
            </>
          )}

          {activeView === "incidents" && (
            <div>
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                    Investigation queue
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                    All incidents
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {filteredIncidents.length} of {displayIncidents.length}{" "}
                    loaded incidents shown
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["All", "Critical", "High", "Medium"].map((severity) => (
                    <button
                      key={severity}
                      type="button"
                      onClick={() => setSeverityFilter(severity)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ring-1 transition ${
                        severityFilter === severity
                          ? "bg-blue-500/15 text-blue-300 ring-blue-500/30"
                          : "bg-slate-900/60 text-slate-500 ring-slate-800 hover:text-slate-300"
                      }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a111e]">
                  <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4 text-xs text-slate-500">
                    <Filter size={14} />
                    Severity: {severityFilter}
                    {searchQuery && <span>• Search: “{searchQuery}”</span>}
                  </div>
                  <div className="space-y-3 p-4">
                    {filteredIncidents.map((incident) => (
                      <IncidentCard
                        key={incident.id}
                        incident={incident}
                        selected={incident.id === selectedIncidentId}
                        onSelect={() => setSelectedIncidentId(incident.id)}
                      />
                    ))}
                    {filteredIncidents.length === 0 && (
                      <div className="px-4 py-12 text-center">
                        <Search size={24} className="mx-auto text-slate-700" />
                        <p className="mt-3 text-sm font-semibold text-slate-300">
                          No matching incidents
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSeverityFilter("All");
                          }}
                          className="mt-3 text-xs font-semibold text-blue-400"
                        >
                          Reset filters
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-[#0a111e] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${selectedIncident.severityColor}`}
                          >
                            {selectedIncident.severity}
                          </span>
                          <span className="text-xs text-slate-500">
                            {selectedIncident.status}
                          </span>
                        </div>
                        <h3 className="mt-3 text-xl font-semibold">
                          {selectedIncident.title}
                        </h3>
                        <p className="mt-1 font-mono text-xs text-slate-500">
                          {selectedIncident.id}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("aiAnalysis")}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-500/15 px-4 py-2.5 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30"
                      >
                        Full AI analysis
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        ["Host", selectedIncident.host],
                        ["Technique", selectedIncident.technique],
                        ["Confidence", selectedIncident.sequenceConfidence],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            {label}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-300">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a111e]">
                    <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div>
                        <h3 className="flex items-center gap-2 font-semibold">
                          <Users size={17} className="text-blue-400" />
                          Analyst response workflow
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Assignment, lifecycle status, and investigation notes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-slate-600">
                          Assigned to
                        </span>
                        <select
                          value={selectedWorkflow?.assignee ?? "Unassigned"}
                          onChange={(event) =>
                            updateWorkflow(
                              selectedIncident.id,
                              { assignee: event.target.value as Analyst },
                              `${selectedIncident.id} assigned to ${event.target.value}.`,
                            )
                          }
                          className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500/50"
                        >
                          {analysts.map((analyst) => (
                            <option key={analyst} value={analyst}>
                              {analyst}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="grid gap-2 sm:grid-cols-4">
                        {responseStatuses.map((status) => {
                          const active = selectedWorkflow?.status === status;
                          const complete =
                            responseStatuses.indexOf(
                              selectedWorkflow?.status as IncidentStatus,
                            ) > responseStatuses.indexOf(status);
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setIncidentStatus(status)}
                              className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                                active
                                  ? "border-blue-500/40 bg-blue-500/15 text-blue-200"
                                  : complete
                                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                                    : "border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                              }`}
                            >
                              <span className="flex items-center justify-center gap-2">
                                {complete ? (
                                  <CheckCircle2 size={14} />
                                ) : (
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                )}
                                {status}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                        <div>
                          <label
                            htmlFor="investigation-note"
                            className="text-xs font-semibold text-slate-300"
                          >
                            Add investigation note
                          </label>
                          <textarea
                            id="investigation-note"
                            value={noteDraft}
                            onChange={(event) =>
                              setNoteDraft(event.target.value)
                            }
                            placeholder="Document evidence, decisions, or next actions..."
                            rows={4}
                            className="mt-3 w-full resize-none rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-300 outline-none placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                          />
                          <button
                            type="button"
                            onClick={addInvestigationNote}
                            className="mt-3 flex items-center gap-2 rounded-lg bg-blue-500/15 px-4 py-2.5 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30 transition hover:bg-blue-500/25"
                          >
                            <MessageSquarePlus size={14} />
                            Save note
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-300">
                              Activity notes
                            </p>
                            <span className="text-[10px] text-slate-600">
                              {selectedWorkflow?.notes.length ?? 0} saved
                            </span>
                          </div>
                          <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
                            {selectedWorkflow?.notes.length ? (
                              selectedWorkflow.notes
                                .slice()
                                .reverse()
                                .map((note) => (
                                  <div
                                    key={note.id}
                                    className="rounded-xl border border-slate-800 bg-slate-900/35 p-3"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-[10px] font-semibold text-blue-300">
                                        {note.author}
                                      </span>
                                      <span className="font-mono text-[9px] text-slate-700">
                                        {note.createdAt}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                      {note.text}
                                    </p>
                                  </div>
                                ))
                            ) : (
                              <div className="rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center">
                                <MessageSquarePlus
                                  size={19}
                                  className="mx-auto text-slate-700"
                                />
                                <p className="mt-2 text-[11px] text-slate-600">
                                  No investigation notes yet
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Timeline incident={selectedIncident} />
                </section>
              </div>
            </div>
          )}

          {activeView === "attackGraph" && (
            <div>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                    Behavioral path
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                    {selectedIncident.title}
                  </h2>
                  <p className="mt-2 font-mono text-xs text-slate-500">
                    {selectedIncident.id} • {selectedIncident.host}
                  </p>
                </div>
                <select
                  value={selectedIncidentId}
                  onChange={(event) =>
                    setSelectedIncidentId(event.target.value)
                  }
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-slate-300 outline-none"
                >
                  {displayIncidents.map((incident) => (
                    <option key={incident.id} value={incident.id}>
                      {incident.id} — {incident.title}
                    </option>
                  ))}
                </select>
              </div>

              <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a111e]">
                <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">Sequence graph</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Ordered techniques and observed relationships
                      </p>
                    </div>
                    <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/20">
                      {selectedIncident.sequenceConfidence}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto p-6 sm:p-10">
                  <div className="flex min-w-[760px] items-center justify-center">
                    {selectedIncident.events.map((event, index) => {
                      const Icon = event.icon;
                      return (
                        <div key={event.time} className="flex items-center">
                          <div className="w-40 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-4 text-center shadow-xl">
                            <div
                              className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${event.background} ${event.color} ring-1 ${event.ring}`}
                            >
                              <Icon size={18} />
                            </div>
                            <p
                              className={`mt-3 text-[10px] font-bold uppercase ${event.color}`}
                            >
                              {event.stage}
                            </p>
                            <p className="mt-2 text-xs font-semibold leading-5 text-slate-300">
                              {event.title}
                            </p>
                            <p className="mt-2 font-mono text-[10px] text-blue-400">
                              {event.technique}
                            </p>
                          </div>
                          {index < selectedIncident.events.length - 1 && (
                            <div className="relative h-px w-12 bg-gradient-to-r from-blue-500/30 to-blue-400">
                              <ChevronRight
                                size={16}
                                className="absolute -right-2 -top-2 text-blue-400"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-px border-t border-slate-800 bg-slate-800 sm:grid-cols-3">
                  {[
                    [
                      "Observed nodes",
                      selectedIncident.events.length.toString(),
                    ],
                    ["Primary host", selectedIncident.host],
                    ["Likely next step", selectedIncident.predictedAction],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#0a111e] p-5">
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        {label}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeView === "aiAnalysis" && (
            <div>
              <button
                type="button"
                onClick={() => navigate("overview")}
                className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-blue-300"
              >
                <ArrowLeft size={14} />
                Back to overview
              </button>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${selectedIncident.severityColor}`}
                    >
                      {selectedIncident.severity}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {selectedIncident.id}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                    {selectedIncident.assessment.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Full model analysis for {selectedIncident.host}
                  </p>
                </div>
                <select
                  value={selectedIncidentId}
                  onChange={(event) =>
                    setSelectedIncidentId(event.target.value)
                  }
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-slate-300 outline-none"
                >
                  {displayIncidents.map((incident) => (
                    <option key={incident.id} value={incident.id}>
                      {incident.id} — {incident.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-800 bg-[#0a111e] p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${selectedIncident.assessment.iconBackground} ${selectedIncident.assessment.iconColor} ring-1 ${selectedIncident.assessment.iconRing}`}
                      >
                        <BrainCircuit size={22} />
                      </div>
                      <div>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-[0.16em] ${selectedIncident.assessment.textColor}`}
                        >
                          Model conclusion
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          {selectedIncident.assessment.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {selectedIncident.assessment.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {[
                        ["Confidence", selectedIncident.assessment.confidence],
                        ["Sequence", selectedIncident.sequenceConfidence],
                        [
                          "Events linked",
                          selectedIncident.events.length.toString(),
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            {label}
                          </p>
                          <p className="mt-2 text-xl font-semibold text-blue-300">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-800 bg-[#0a111e] p-5 sm:p-6">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Sparkles size={17} className="text-cyan-400" />
                      Model reasoning
                    </h3>
                    <div className="mt-5 space-y-3">
                      {selectedIncident.assessment.reasoning.map(
                        (reason, index) => (
                          <div
                            key={reason.title}
                            className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/20">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-slate-300">
                                {reason.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {reason.detail}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 sm:p-6">
                    <h3 className="flex items-center gap-2 font-semibold text-blue-200">
                      <ShieldCheck size={18} />
                      Recommended response plan
                    </h3>
                    <div className="mt-5 space-y-3">
                      {selectedIncident.assessment.responseSteps.map(
                        (step, index) => (
                          <div key={step} className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-300 ring-1 ring-blue-500/30">
                              {index + 1}
                            </span>
                            <p className="pt-0.5 text-sm leading-5 text-slate-400">
                              {step}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <Assessment
                    incident={selectedIncident}
                    onOpen={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  />
                  <section className="rounded-2xl border border-slate-800 bg-[#0a111e] p-5">
                    <h3 className="text-sm font-semibold">Evidence coverage</h3>
                    <div className="mt-4 space-y-3">
                      {selectedIncident.events.map((event) => (
                        <div
                          key={event.time}
                          className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/40 px-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-400">
                              {event.source}
                            </p>
                            <p className="mt-1 font-mono text-[10px] text-slate-600">
                              {event.technique}
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                            <Check size={12} />
                            Correlated
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {activeView === "telemetry" && (
            <div>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                    Data pipeline
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                    Telemetry health
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {eventCount.toLocaleString()} security events analyzed
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={processSimulationStep}
                    disabled={enabledSourceCount === 0}
                    className="flex items-center gap-2 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2.5 text-xs font-semibold text-blue-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Zap size={14} />
                    Generate signal
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettingsState((current) => ({
                        ...current,
                        simulationEnabled: !current.simulationEnabled,
                      }))
                    }
                    className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2.5 text-xs font-semibold text-slate-400"
                  >
                    {settingsState.simulationEnabled ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                    {settingsState.simulationEnabled ? "Pause" : "Resume"}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  [
                    "Sources enabled",
                    `${enabledSourceCount} / ${telemetrySources.length}`,
                    enabledSourceCount > 0
                      ? "text-emerald-400"
                      : "text-red-400",
                  ],
                  [
                    "Ingestion rate",
                    settingsState.simulationEnabled && enabledSourceCount > 0
                      ? "28.4K/min"
                      : "0/min",
                    "text-blue-400",
                  ],
                  [
                    "Pipeline health",
                    `${telemetryHealth.toFixed(1)}%`,
                    "text-cyan-400",
                  ],
                ].map(([label, value, color]) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-[#0a111e] p-5"
                  >
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className={`mt-3 text-2xl font-semibold ${color}`}>
                      {value}
                    </p>
                  </article>
                ))}
              </div>

              <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0a111e]">
                <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
                  <h3 className="font-semibold">Connected sources</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Event volume and source availability
                  </p>
                </div>
                <div className="divide-y divide-slate-800">
                  {telemetrySources.map((source) => {
                    const enabled = settingsState.sourceEnabled[source.name];
                    return (
                      <div
                        key={source.name}
                        className={`grid gap-4 px-5 py-5 transition sm:grid-cols-[1.2fr_0.6fr_1fr_0.6fr] sm:items-center sm:px-6 ${
                          enabled ? "" : "opacity-45"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                            <Radio size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-300">
                              {source.name}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-600">
                              {enabled
                                ? "Last event 2s ago"
                                : "Source disabled"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            Events
                          </p>
                          <p className="mt-1 font-mono text-xs text-slate-400">
                            {source.events}
                          </p>
                        </div>
                        <div>
                          <div className="mb-1.5 flex justify-between text-[10px]">
                            <span className="text-slate-600">Health</span>
                            <span className="text-slate-400">
                              {source.health}%
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                !enabled
                                  ? "bg-slate-700"
                                  : source.health > 97
                                    ? "bg-emerald-400"
                                    : "bg-amber-400"
                              }`}
                              style={{
                                width: enabled ? `${source.health}%` : "0%",
                              }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={enabled}
                          onClick={() =>
                            setSettingsState((current) => ({
                              ...current,
                              sourceEnabled: {
                                ...current.sourceEnabled,
                                [source.name]: !enabled,
                              },
                            }))
                          }
                          className={`flex w-fit items-center gap-2 rounded-full px-2.5 py-1.5 text-[10px] font-semibold ring-1 transition ${
                            enabled
                              ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20"
                              : "bg-slate-800 text-slate-500 ring-slate-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              enabled ? "bg-emerald-400" : "bg-slate-600"
                            }`}
                          />
                          {enabled ? source.status : "Disabled"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0a111e]">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
                  <div>
                    <h3 className="font-semibold">Recent live signals</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Latest events generated by the telemetry simulator
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-300 ring-1 ring-blue-500/20">
                    {liveEvents.length} buffered
                  </span>
                </div>
                <div className="divide-y divide-slate-800">
                  {liveEvents.length ? (
                    liveEvents.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => selectIncident(event.incidentId)}
                        className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-slate-900/50 sm:grid-cols-[0.7fr_1fr_2fr_0.5fr] sm:items-center sm:px-6"
                      >
                        <span className="font-mono text-[10px] text-slate-600">
                          {event.timestamp}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {event.source}
                        </span>
                        <span>
                          <span className="block text-xs font-semibold text-slate-300">
                            {event.title}
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-600">
                            {event.detail}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span
                            className={`h-2 w-2 rounded-full ${notificationColor(event.severity)}`}
                          />
                          {event.severity}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-12 text-center">
                      <Radio size={23} className="mx-auto text-slate-700" />
                      <p className="mt-3 text-xs text-slate-500">
                        No simulated events have arrived yet.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>

      {settingsOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => {
              setSettingsOpen(false);
              setResetArmed(false);
            }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <aside className="relative h-full w-full max-w-md overflow-y-auto border-l border-slate-700 bg-[#080e19] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#080e19]/95 px-5 py-5 backdrop-blur">
              <div>
                <h2 className="flex items-center gap-2 font-semibold">
                  <Settings size={18} className="text-blue-400" />
                  Dashboard settings
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Simulation, alerts, sources, and local workspace data
                </p>
              </div>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => {
                  setSettingsOpen(false);
                  setResetArmed(false);
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <section className="rounded-2xl border border-slate-800 bg-[#0a111e] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Gauge size={16} className="text-emerald-400" />
                      Live simulation
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Automatically create and correlate telemetry
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settingsState.simulationEnabled}
                    onClick={() =>
                      setSettingsState((current) => ({
                        ...current,
                        simulationEnabled: !current.simulationEnabled,
                      }))
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      settingsState.simulationEnabled
                        ? "bg-emerald-500"
                        : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        settingsState.simulationEnabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <label className="mt-5 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Event interval
                </label>
                <select
                  value={settingsState.simulationSpeed}
                  onChange={(event) =>
                    setSettingsState((current) => ({
                      ...current,
                      simulationSpeed: Number(event.target.value),
                    }))
                  }
                  className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500/50"
                >
                  <option value={4000}>Every 4 seconds</option>
                  <option value={8000}>Every 8 seconds</option>
                  <option value={15000}>Every 15 seconds</option>
                </select>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="alert-threshold"
                      className="text-[10px] font-semibold uppercase tracking-wider text-slate-600"
                    >
                      Alert threshold
                    </label>
                    <span className="font-mono text-xs text-blue-300">
                      {settingsState.alertThreshold}%
                    </span>
                  </div>
                  <input
                    id="alert-threshold"
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={settingsState.alertThreshold}
                    onChange={(event) =>
                      setSettingsState((current) => ({
                        ...current,
                        alertThreshold: Number(event.target.value),
                      }))
                    }
                    className="mt-3 w-full accent-blue-500"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-[#0a111e] p-5">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Radio size={16} className="text-blue-400" />
                  Telemetry sources
                </p>
                <div className="mt-4 space-y-2">
                  {telemetrySources.map((source) => {
                    const enabled = settingsState.sourceEnabled[source.name];
                    return (
                      <button
                        key={source.name}
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        onClick={() =>
                          setSettingsState((current) => ({
                            ...current,
                            sourceEnabled: {
                              ...current.sourceEnabled,
                              [source.name]: !enabled,
                            },
                          }))
                        }
                        className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/35 px-3 py-3 text-left"
                      >
                        <span>
                          <span className="block text-xs font-semibold text-slate-400">
                            {source.name}
                          </span>
                          <span className="mt-1 block text-[10px] text-slate-600">
                            {source.events} events • {source.health}% health
                          </span>
                        </span>
                        <span
                          className={`relative h-5 w-9 rounded-full transition ${
                            enabled ? "bg-blue-500" : "bg-slate-700"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${
                              enabled ? "left-5" : "left-1"
                            }`}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-[#0a111e] p-5">
                <p className="text-sm font-semibold">Appearance</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Choose the dashboard background treatment
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(["Midnight", "Blue Glow"] as ThemePreference[]).map(
                    (theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() =>
                          setSettingsState((current) => ({
                            ...current,
                            theme,
                          }))
                        }
                        className={`rounded-xl border p-3 text-left transition ${
                          settingsState.theme === theme
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
                            : "border-slate-800 bg-slate-900/35 text-slate-500"
                        }`}
                      >
                        <span
                          className={`mb-3 block h-10 rounded-lg ${
                            theme === "Midnight"
                              ? "bg-gradient-to-br from-[#050a12] to-slate-900"
                              : "bg-gradient-to-br from-[#030914] to-blue-950"
                          } ring-1 ring-slate-700`}
                        />
                        <span className="text-xs font-semibold">{theme}</span>
                      </button>
                    ),
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                <p className="text-sm font-semibold text-blue-200">
                  Persistent workspace
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Incident status, assignments, notes, notifications, settings,
                  and simulated events are saved automatically in this browser.
                </p>
                <button
                  type="button"
                  onClick={exportWorkspace}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500/15 px-4 py-2.5 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30"
                >
                  <CloudDownload size={14} />
                  Export workspace JSON
                </button>
              </section>

              <button
                type="button"
                onClick={resetWorkspace}
                onBlur={() => setResetArmed(false)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition ${
                  resetArmed
                    ? "border-red-500/40 bg-red-500/15 text-red-200"
                    : "border-slate-800 bg-slate-900/40 text-slate-500 hover:border-red-500/30 hover:text-red-300"
                }`}
              >
                {resetArmed ? (
                  <AlertTriangle size={14} />
                ) : (
                  <RotateCcw size={14} />
                )}
                {resetArmed ? "Confirm workspace reset" : "Reset workspace"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[90] flex max-w-sm items-start gap-3 rounded-xl border border-blue-500/25 bg-[#0a111e] px-4 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.5)]"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-400" />
          <p className="text-xs leading-5 text-slate-300">{toast}</p>
        </div>
      )}
    </main>
  );
}
