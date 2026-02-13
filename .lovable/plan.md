

## NetScope — WebRTC Network Simulation Platform (Demo/POC)

### Overview
A demo platform where users simulate WebRTC video call quality under different network conditions. Users configure participants with network profiles, watch a live simulation with real-time metrics, trigger network events, and review test results — all with mock data (no real Docker/VNC).

---

### Page 1: Home
- Clean landing with NetScope branding (blue theme)
- "Start New Test" CTA button
- List of recent tests (from Supabase) with status badges
- Click a past test to view its results

### Page 2: Test Configuration (`/test/new`)
- **Meeting URL** input field
- **Duration** input (seconds)
- **Participant list** — add/remove participants, each with:
  - Role dropdown (Teacher / Student)
  - Name input
  - Network profile dropdown (Good, WiFi Good, Jio 4G Good, Jio 4G Poor, Airtel 4G, 3G, 2G)
- "Start Test" button → saves config to Supabase and navigates to running page

### Page 3: Test Running (`/test/:id/running`)
- **Responsive grid of participant cards** (2×2 or wrapping)
  - Each card shows: name, network profile badge, mock VNC placeholder (📺 icon with name/port), live FPS + resolution display, status indicator (🟢🟡🔴)
  - Per-participant controls: "Signal Drop" button, network profile dropdown
- **Progress bar** showing elapsed time vs. total duration
- **"Stop Test" button**
- **Live FPS chart** (Recharts line chart) — one line per participant, updating every second
- Metrics simulation runs in-browser:
  - Good profile → ~30 FPS, 720p
  - Jio 4G Poor → ~18 FPS, 480p
  - 3G → ~10 FPS, 360p
  - Signal drop → 0 FPS for 5 seconds then recovers
- When duration completes, auto-navigate to results page

### Page 4: Test Results (`/test/:id/results`)
- **Summary card**: duration, participant count, issues detected
- **Results table**: Participant | Network | Avg FPS | Resolution | Freeze Count | Pass/Warn/Fail status
  - Status thresholds: Avg FPS < 15 = Fail, < 24 = Warn, else Pass
- **Issues list** (Low FPS, Excessive Freezing, Quality Degradation)
- "Download Report" button (JSON export)
- "New Test" button

---

### Backend (Supabase)
- **Tables**: `profiles` (network presets, seeded), `tests`, `participants`, `metrics`
- Metrics are saved to Supabase during simulation and queried for results
- No edge functions needed — all simulation logic runs client-side
- RLS policies for data access

### Design
- Blue primary color scheme (#3B82F6)
- Clean card-based layout with shadows
- Status colors: Green/Yellow/Red
- Responsive design for desktop viewing
- Professional header with "NetScope" branding

### Simulation Engine (Client-side)
- Uses `setInterval` (1s) to generate mock metrics based on network profile
- Signal drop temporarily zeroes out metrics
- Dynamic network profile changes update metric generation in real-time
- All metrics stored in Supabase for persistence and results display

