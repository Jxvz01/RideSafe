// ── STATE MANAGEMENT & DATA SYNCING ────────────────────────────
const STATE_KEY = 'ridesafe_state_mysore';

const DEFAULT_RIDERS = [
  {id:'#1042',name:'Rajan Mehta',phone:'9821001042',status:'alert',loc:'Gokulam, Mysore',device:'RSM-204',ping:'2m ago',emergency:'Sunita Mehta (Mother)',shift:'09:00–21:00',alerts:3,lat:12.3243,lon:76.6273,speed:0,signal:'-68dBm',battery:78},
  {id:'#0988',name:'Priya Sharma',phone:'9944000988',status:'warning',loc:'Saraswathipuram, Mysore',device:'RSM-189',ping:'8m ago',emergency:'Raj Sharma (Brother)',shift:'10:00–22:00',alerts:1,lat:12.3025,lon:76.6290,speed:12,signal:'-72dBm',battery:54},
  {id:'#1103',name:'Arjun Patel',phone:'9910001103',status:'warning',loc:'Vijayanagar, Mysore',device:'RSM-211',ping:'14m ago',emergency:'Geeta Patel (Spouse)',shift:'08:00–20:00',alerts:2,lat:12.3385,lon:76.6080,speed:8,signal:'-65dBm',battery:91},
  {id:'#0741',name:'Kavya Nair',phone:'9632000741',status:'active',loc:'Mandi Mohalla, Mysore',device:'RSM-155',ping:'32s ago',emergency:'Suresh Nair (Father)',shift:'07:00–19:00',alerts:0,lat:12.3160,lon:76.6530,speed:28,signal:'-61dBm',battery:88},
  {id:'#0855',name:'Deepak Singh',phone:'9711000855',status:'active',loc:'Kuvempunagar, Mysore',device:'RSM-178',ping:'1m ago',emergency:'Anita Singh (Spouse)',shift:'08:00–20:00',alerts:0,lat:12.2858,lon:76.6200,speed:32,signal:'-70dBm',battery:63},
  {id:'#0612',name:'Mohit Verma',phone:'9898000612',status:'offline',loc:'—',device:'RSM-121',ping:'4h ago',emergency:'Rakhi Verma (Sister)',shift:'Off',alerts:1,lat:12.2965,lon:76.6410,speed:0,signal:'N/A',battery:12},
  {id:'#0924',name:'Swati Reddy',phone:'9900000924',status:'active',loc:'J.P. Nagar, Mysore',device:'RSM-196',ping:'45s ago',emergency:'Ramesh Reddy (Father)',shift:'09:00–21:00',alerts:0,lat:12.2690,lon:76.6450,speed:24,signal:'-59dBm',battery:95},
  {id:'#1001',name:'Rahul Gupta',phone:'9820001001',status:'active',loc:'Jayalakshmipuram, Mysore',device:'RSM-201',ping:'2m ago',emergency:'Meena Gupta (Mother)',shift:'10:00–22:00',alerts:0,lat:12.3160,lon:76.6260,speed:15,signal:'-66dBm',battery:72},
];

const DEFAULT_DEVICES = [
  {id:'RSM-204',rider:'Rajan Mehta #1042',fw:'v2.4.1',batt:'78%',signal:'-68dBm',seen:'2m ago',status:'alert'},
  {id:'RSM-189',rider:'Priya Sharma #0988',fw:'v2.4.1',batt:'54%',signal:'-72dBm',seen:'8m ago',status:'warning'},
  {id:'RSM-211',rider:'Arjun Patel #1103',fw:'v2.4.0',batt:'91%',signal:'-65dBm',seen:'14m ago',status:'warning'},
  {id:'RSM-155',rider:'Kavya Nair #0741',fw:'v2.4.1',batt:'88%',signal:'-61dBm',seen:'32s ago',status:'active'},
  {id:'RSM-178',rider:'Deepak Singh #0855',fw:'v2.4.1',batt:'63%',signal:'-70dBm',seen:'1m ago',status:'active'},
  {id:'RSM-121',rider:'Mohit Verma #0612',fw:'v2.3.8',batt:'12%',signal:'N/A',seen:'4h ago',status:'offline'},
  {id:'RSM-196',rider:'Swati Reddy #0924',fw:'v2.4.1',batt:'95%',signal:'-59dBm',seen:'45s ago',status:'active'},
  {id:'RSM-201',rider:'Rahul Gupta #1001',fw:'v2.4.1',batt:'72%',signal:'-66dBm',seen:'2m ago',status:'active'},
];

const DEFAULT_HISTORY = [
  {dt:'2025-06-15 14:32',rider:'Rajan Mehta #1042',type:'High Impact',loc:'Gokulam, Mysore',sms:'Delivered',outcome:'Pending'},
  {dt:'2025-06-15 11:18',rider:'Arjun Patel #1103',type:'G-Force Limit',loc:'Vijayanagar, Mysore',sms:'Delivered',outcome:'Safe — Override'},
  {dt:'2025-06-15 09:47',rider:'Priya Sharma #0988',type:'G-Force Limit',loc:'Saraswathipuram, Mysore',sms:'Delivered',outcome:'Safe — Override'},
  {dt:'2025-06-14 22:11',rider:'Deepak Singh #0855',type:'Sudden Stop',loc:'Kuvempunagar, Mysore',sms:'Delivered',outcome:'Safe — Override'},
];

const DEFAULT_SMS_LOGS = [
  {time:'14:32:08',rider:'Rajan Mehta #1042',recipient:'Sunita Mehta',type:'SOS ALERT',status:'Delivered',msg:'EMERGENCY: Rajan Mehta may have had an accident near Gokulam. GPS: maps.google.com/?q=12.3243,76.6273'},
  {time:'11:19:01',rider:'Arjun Patel #1103',recipient:'Geeta Patel',type:'SAFE',status:'Delivered',msg:'UPDATE: Arjun Patel is safe. Nothing major — kill switch activated.'},
  {time:'09:47:33',rider:'Priya Sharma #0988',recipient:'Raj Sharma',type:'SOS ALERT',status:'Delivered',msg:'EMERGENCY: Priya Sharma may have had an accident near Saraswathipuram, Mysore.'},
];

const DEFAULT_ALERT_DATA = [
  {time:'14:32',riderId:'#1042',cls:'badge-red',title:'🚨 CRITICAL: High-impact crash — Rajan Mehta #1042',detail:'Gokulam, Mysore · SMS dispatched · SOS Active'},
  {time:'14:24',riderId:'#0988',cls:'badge-orange',title:'⚠️ WARNING: Sudden tilt — Priya Sharma #0988',detail:'Saraswathipuram, Mysore · Awaiting override'},
  {time:'14:18',riderId:'#1103',cls:'badge-orange',title:'⚠️ WARNING: Moderate G-force — Arjun Patel #1103',detail:'Vijayanagar, Mysore · SMS dispatched'},
];

const DEFAULT_SYSTEM_LOGS = [
  {ts:'14:32:08',lvl:'OK',msg:'Incident event received — device RSM-204 — rider #1042'},
  {ts:'14:32:09',lvl:'OK',msg:'GPS coordinates acquired: 12.3243, 76.6273'},
  {ts:'14:32:09',lvl:'WARN',msg:'Kill switch NOT activated — starting countdown T-30s'},
  {ts:'14:32:39',lvl:'OK',msg:'Countdown expired — dispatching SOS SMS'},
  {ts:'14:32:40',lvl:'OK',msg:'SMS sent → Sunita Mehta (emergency contact)'},
  {ts:'14:32:40',lvl:'OK',msg:'SMS logged — ID: INC-2025-0615-042'},
];

let appState = {
  riders: [],
  devices: [],
  history: [],
  sms_logs: [],
  alerts: [],
  sys_logs: []
};

function loadState() {
  const data = localStorage.getItem(STATE_KEY);
  if (data) {
    appState = JSON.parse(data);
    const hasMumbaiCoords = appState.riders && appState.riders.some(r => r.lat > 15);
    if (hasMumbaiCoords) {
      localStorage.removeItem(STATE_KEY);
      localStorage.removeItem('ridesafe_state');
      appState = {
        riders: DEFAULT_RIDERS,
        devices: DEFAULT_DEVICES,
        history: DEFAULT_HISTORY,
        sms_logs: DEFAULT_SMS_LOGS,
        alerts: DEFAULT_ALERT_DATA,
        sys_logs: DEFAULT_SYSTEM_LOGS
      };
      saveState();
    }
  } else {
    appState = {
      riders: DEFAULT_RIDERS,
      devices: DEFAULT_DEVICES,
      history: DEFAULT_HISTORY,
      sms_logs: DEFAULT_SMS_LOGS,
      alerts: DEFAULT_ALERT_DATA,
      sys_logs: DEFAULT_SYSTEM_LOGS
    };
    saveState();
  }

  // Strict Mysore geofencing: keep riders only inside Mysore boundaries and remove them if they are elsewhere
  if (appState.riders) {
    appState.riders = appState.riders.filter(r => {
      return r.lat >= 12.2 && r.lat <= 12.4 && r.lon >= 76.5 && r.lon <= 76.8;
    });
  }

  if (appState.devices && appState.riders) {
    const activeRiderNames = new Set(appState.riders.map(r => `${r.name} ${r.id}`));
    appState.devices = appState.devices.filter(d => activeRiderNames.has(d.rider));
  }

  saveState();
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

// Storage reactive state listener
window.addEventListener('storage', (e) => {
  if (e.key === STATE_KEY) {
    const oldAlertCount = appState.riders.filter(r => r.status === 'alert').length;
    loadState();
    const newAlertCount = appState.riders.filter(r => r.status === 'alert').length;
    
    if (newAlertCount > oldAlertCount) {
      const activeAlerts = appState.riders.filter(r => r.status === 'alert');
      const latest = activeAlerts[activeAlerts.length - 1];
      if (latest) {
        showToast('🚨 CRITICAL ALERT', `${latest.name} (${latest.id}) · ${latest.loc}`, 'error');
      }
    } else if (newAlertCount < oldAlertCount) {
      showToast('Alert Cleared', 'Rider marked safe. Transmissions shut.', 'success');
    }
    
    renderAll();
  }
});

// ── RENDER ENGINE ─────────────────────────────────────────────
const STATUS_MAP = {
  active: { cls: 'badge-green', label: 'Active' },
  alert: { cls: 'badge-red', label: 'Alert' },
  warning: { cls: 'badge-orange', label: 'Warning' },
  offline: { cls: 'badge-gray', label: 'Offline' }
};

function renderAll() {
  updateKpis();
  renderFullRidersTable();
  renderHistoryTable();
  renderSmsLogsTable();
  renderAlertStream();
  updateMapMarkers();
  populateRidersSelect();
}

function updateKpis() {
  const totalRiders = appState.riders.length;
  const activeNow = appState.riders.filter(r => r.status === 'active' || r.status === 'warning').length;
  const activeAlerts = appState.riders.filter(r => r.status === 'alert').length;

  setElementContentBySelector('.kpi-card:nth-child(1) .kpi-val', totalRiders);
  setElementContentBySelector('.kpi-card:nth-child(2) .kpi-val', activeNow);
  
  const alertsVal = document.querySelector('.kpi-card:nth-child(3) .kpi-val');
  if (alertsVal) {
    alertsVal.textContent = activeAlerts;
    alertsVal.style.color = activeAlerts > 0 ? 'var(--red)' : '';
  }

  const alertBadge = document.getElementById('alertCountBadge');
  if (alertBadge) {
    alertBadge.textContent = `${activeAlerts} active`;
    alertBadge.className = activeAlerts > 0 ? 'badge badge-red' : 'badge badge-gray';
  }
}

function setElementContentBySelector(selector, html) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
}

function renderFullRidersTable() {
  const table = document.getElementById('ridersFullTable');
  if (!table) return;

  table.innerHTML = appState.riders.map(r => {
    const s = STATUS_MAP[r.status] || STATUS_MAP.active;
    return `<tr onclick="openInspectorDrawer('${r.id}')" style="cursor:pointer;">
      <td style="font-weight:600; color: var(--txt);">${r.name}</td>
      <td><span style="font-family:var(--mono);font-size:.78rem;color:var(--txt3)">${r.id}</span></td>
      <td style="font-family:var(--mono);font-size:.78rem">${r.phone}</td>
      <td style="font-size:.8rem;color:var(--txt2)">${r.emergency}</td>
      <td style="font-size:.78rem;color:var(--txt3)">${r.shift}</td>
      <td style="text-align:center">${r.alerts > 0 ? `<span class="badge badge-red">${r.alerts}</span>` : `<span class="badge badge-green">0</span>`}</td>
      <td><span class="badge ${s.cls}">${s.label}</span></td>
    </tr>`;
  }).join('');
}

function renderHistoryTable() {
  const table = document.getElementById('historyTable');
  if (!table) return;

  table.innerHTML = appState.history.map(h => {
    const outcomeClass = h.outcome.includes('Safe') ? 'badge-green' : h.outcome === 'Pending' ? 'badge-orange' : 'badge-red';
    const typeClass = h.type.includes('High') ? 'badge-red' : 'badge-orange';
    return `<tr>
      <td><span style="font-family:var(--mono);font-size:.75rem;color:var(--txt3)">${h.dt}</span></td>
      <td style="font-weight:600;font-size:.85rem">${h.rider}</td>
      <td><span class="badge ${typeClass}">${h.type}</span></td>
      <td style="font-size:.8rem;color:var(--txt2)">${h.loc}</td>
      <td><span class="badge badge-green">${h.sms}</span></td>
      <td><span class="badge ${outcomeClass}">${h.outcome}</span></td>
    </tr>`;
  }).join('');
}

function renderSmsLogsTable() {
  const table = document.getElementById('smsTable');
  if (!table) return;

  table.innerHTML = appState.sms_logs.map(s => `<tr>
    <td><span style="font-family:var(--mono);font-size:.75rem;color:var(--txt3)">${s.time}</span></td>
    <td style="font-weight:600;font-size:.82rem">${s.rider.split(' ')[0]}</td>
    <td style="font-size:.82rem;color:var(--txt2)">${s.recipient}</td>
    <td><span class="badge ${s.type === 'SOS ALERT' ? 'badge-red' : 'badge-green'}">${s.type}</span></td>
    <td style="font-size:.72rem;color:var(--txt2);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${s.msg}">${s.msg}</td>
  </tr>`).join('');
}

function renderAlertStream() {
  const stream = document.getElementById('alertStream');
  if (!stream) return;

  const activeAlerts = appState.alerts.filter(a => {
    const rId = a.riderId;
    const rider = appState.riders.find(r => r.id === rId);
    return rider && (rider.status === 'alert' || rider.status === 'warning');
  });

  if (activeAlerts.length === 0) {
    stream.innerHTML = `<div style="font-family:var(--mono); font-size:0.7rem; color:var(--txt3); text-align:center; padding: 24px 0;">No active events reported.</div>`;
    return;
  }

  stream.innerHTML = activeAlerts.map(a => {
    const isRed = a.cls.includes('red');
    const isOrange = a.cls.includes('orange');
    const typeLabel = isRed ? 'Alert' : 'Warning';
    
    return `<div class="as-item" onclick="openInspectorDrawer('${a.riderId}')" style="cursor:pointer; border-left: 2px solid ${isRed ? 'var(--red)' : 'var(--orange)'}; background:rgba(255,255,255,0.01); padding:10px 14px;">
      <div class="as-time" style="font-size:0.65rem;">${a.time}</div>
      <div class="as-content">
        <div class="as-title" style="font-size:0.8rem; font-weight:700;">${a.title.split(' — ')[1] || a.title}</div>
        <div class="as-detail" style="font-size:0.7rem; color:var(--txt2);">${a.detail.split(' · ')[0]}</div>
      </div>
      <span class="badge ${a.cls}" style="font-size:0.55rem; padding: 2px 6px;">${typeLabel}</span>
    </div>`;
  }).join('');
}

// ── CUSTOM OPERATIONAL DRAWER INSPECTOR ───────────────────────
function openInspectorDrawer(riderId) {
  loadState();
  const r = appState.riders.find(rider => rider.id === riderId);
  if (!r) return;

  const drawer = document.getElementById('inspectorDrawer');
  if (!drawer) return;

  drawer.innerHTML = `
    <div class="id-header">
      <div class="id-title">${r.name}</div>
      <div class="id-close" onclick="closeInspectorDrawer()">&times;</div>
    </div>
    
    <div style="display:flex; flex-direction:column; gap:6px;">
      <div class="id-section-title">Enrolled Registry</div>
      <div class="id-grid">
        <div class="id-row"><span class="id-key">Rider ID</span><span class="id-val" style="color:var(--green)">${r.id}</span></div>
        <div class="id-row"><span class="id-key">Phone</span><span class="id-val">${r.phone}</span></div>
        <div class="id-row"><span class="id-key">Shift</span><span class="id-val">${r.shift}</span></div>
        <div class="id-row"><span class="id-key">Emergency</span><span class="id-val" style="font-size:0.7rem;">${r.emergency}</span></div>
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:6px;">
      <div class="id-section-title">Device Telemetry</div>
      <div class="id-grid">
        <div class="id-row"><span class="id-key">Hardware ID</span><span class="id-val" style="color:var(--blue)">${r.device}</span></div>
        <div class="id-row"><span class="id-key">Battery</span><span class="id-val" style="color:${r.battery < 20 ? 'var(--red)' : r.battery < 50 ? 'var(--yellow)' : 'var(--green)'}">${r.battery}%</span></div>
        <div class="id-row"><span class="id-key">Signal</span><span class="id-val">${r.signal}</span></div>
        <div class="id-row"><span class="id-key">Velocity</span><span class="id-val">${r.speed} km/h</span></div>
        <div class="id-row"><span class="id-key">Coordinates</span><span class="id-val" style="font-size:0.7rem;">${r.lat}, ${r.lon}</span></div>
      </div>
    </div>

    <div style="flex:1;"></div>

    <div style="display:flex; flex-direction:column; gap:10px;">
      ${r.status === 'alert' || r.status === 'warning' ? `
        <button class="btn btn-green" onclick="resolveRiderAlert('${r.id}'); closeInspectorDrawer();" style="width:100%; justify-content:center; background:var(--green); color:#05070a; font-weight:700;">Resolve Alarm Status</button>
      ` : `
        <button class="btn btn-outline" onclick="closeInspectorDrawer()" style="width:100%; justify-content:center; border-color:var(--border)">Close Inspector</button>
      `}
    </div>
  `;

  drawer.classList.add('open');
}

function closeInspectorDrawer() {
  const drawer = document.getElementById('inspectorDrawer');
  if (drawer) drawer.classList.remove('open');
}

// ── LEAFLET GIS MAP DRIVER ────────────────────────────────────
let map = null;
let markers = {};

function initMap() {
  const mapElement = document.getElementById('liveMap');
  if (!mapElement) return;

  map = L.map('liveMap', {
    zoomControl: false,
    attributionControl: false
  }).setView([12.2958, 76.6394], 12);

  // CartoDB Dark Matter tile layer - strictly minimal black operations look
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  updateMapMarkers();
}

function updateMapMarkers() {
  if (!map) return;

  // Clear previous
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};

  appState.riders.forEach(r => {
    if (!r.lat || !r.lon) return;

    let markerClass = 'marker-dot-active';
    if (r.status === 'alert') markerClass = 'marker-dot-alert';
    else if (r.status === 'warning') markerClass = 'marker-dot-warning';
    else if (r.status === 'offline') markerClass = 'marker-dot-offline';

    const icon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div class="marker-dot ${markerClass}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    // Disable generic Leaflet popups. Instead, click markers to open side inspector!
    const marker = L.marker([r.lat, r.lon], { icon }).addTo(map);
    marker.on('click', () => {
      map.panTo([r.lat, r.lon]);
      openInspectorDrawer(r.id);
    });
    
    markers[r.id] = marker;

    // Pan map to active high G crash incidents
    if (r.status === 'alert' && r.ping.includes('Just')) {
      map.setView([r.lat, r.lon], 13);
      openInspectorDrawer(r.id);
    }
  });
}

function locateRiderOnMap(riderId) {
  const opsLink = document.querySelector('.sb-link[data-page="ops"]');
  if (opsLink) {
    opsLink.click();
    setTimeout(() => {
      const rider = appState.riders.find(r => r.id === riderId);
      if (rider && map) {
        map.setView([rider.lat, rider.lon], 13);
        openInspectorDrawer(riderId);
      }
    }, 150);
  }
}

// ── INCIDENT RESOLUTION ───────────────────────────────────────
function resolveRiderAlert(riderId) {
  loadState();
  const rider = appState.riders.find(r => r.id === riderId);
  if (!rider) return;

  const oldStatus = rider.status;
  rider.status = 'active';
  rider.alerts = 0;

  const timeStr = new Date().toLocaleTimeString('en-GB');
  const dateStr = new Date().toISOString().split('T')[0] + ' ' + timeStr.substring(0, 5);

  // History log
  appState.history.unshift({
    dt: dateStr,
    rider: `${rider.name} ${rider.id}`,
    type: oldStatus === 'alert' ? 'High Impact' : 'G-Force Limit',
    loc: rider.loc,
    sms: 'Delivered',
    outcome: 'Safe — Override'
  });

  // SMS logs
  appState.sms_logs.unshift({
    time: timeStr,
    rider: `${rider.name} ${rider.id}`,
    recipient: rider.emergency.split(' ')[0],
    type: 'SAFE',
    status: 'Delivered',
    msg: `UPDATE: ${rider.name} is confirmed safe. Operational G-Force alarm cancelled.`
  });

  // Clear live stream alert
  appState.alerts = appState.alerts.filter(a => !a.title.includes(rider.id));

  // Add developer system heartbeats
  appState.sys_logs.push({
    ts: timeStr,
    lvl: 'OK',
    msg: `Operational alarm resolved for ${rider.id}. Haptic dispatch halted.`
  });

  saveState();
  showToast('Alarm Resolved', `Operational security status reset to active for ${rider.name}.`, 'success');
  renderAll();
}

// ── NOTIFICATION TOAST & SYNTH CHIMES ─────────────────────────
function playChime(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    if (type === 'critical') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    console.warn("Synth chime block:", e);
  }
}

function showToast(title, msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-body">
      <div class="toast-title" style="font-family:var(--mono); font-size: 0.72rem; text-transform:uppercase; letter-spacing:0.02em;">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <div class="toast-close" onclick="this.parentElement.remove()">&times;</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(24px)';
    setTimeout(() => toast.remove(), 400);
  }, 5000);

  if (type === 'error' || type === 'critical') playChime('critical');
  else if (type === 'success') playChime('success');
}

// ── CHARTS DRAW ENGINE ────────────────────────────────────────
function drawCharts() {
  // Simplistic layout - no heavy library or huge graphics, pure clean drawing
  const donutCanvas = document.getElementById('donutChart');
  if (donutCanvas && donutCanvas.getContext) {
    const ctx = donutCanvas.getContext('2d');
    ctx.clearRect(0, 0, 160, 160);
    const cx = 80, cy = 80, r = 60, w = 8; // Ultra thin donut ring
    
    const activeAlerts = appState.riders.filter(r => r.status === 'alert').length;
    const activeWarnings = appState.riders.filter(r => r.status === 'warning').length;
    const safeRiders = appState.riders.length - activeAlerts - activeWarnings;
    
    const total = appState.riders.length || 1;
    const pSafe = safeRiders / total;
    const pWarn = activeWarnings / total;
    const pAlert = activeAlerts / total;
    
    const labelPct = document.querySelector('.donut-pct');
    if (labelPct) labelPct.textContent = Math.round(pSafe * 100) + '%';
    
    const slices = [
      { val: pSafe, color: '#10b981' },
      { val: pWarn, color: '#f97316' },
      { val: pAlert, color: '#f43f5e' }
    ];
    
    let start = -Math.PI / 2;
    slices.forEach(s => {
      if (s.val === 0) return;
      const angle = s.val * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.arc(cx, cy, r - w, start + angle, start, true);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      start += angle;
    });
  }
}

// ── INTERACTIVE MODALS ────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

function populateRidersSelect() {
  const select = document.getElementById('devRider');
  if (!select) return;
  select.innerHTML = '<option value="" disabled selected>Select a rider...</option>' + 
    appState.riders.map(r => `<option value="${r.id}">${r.name} (${r.id})</option>`).join('');
}

function saveRider() {
  const name = document.getElementById('riderName').value.trim();
  const phone = document.getElementById('riderPhone').value.trim();
  const emergency = document.getElementById('riderEmergency').value.trim();
  const shift = document.getElementById('riderShift').value;

  if (!name || !phone || !emergency) return;

  const newId = '#' + (1000 + Math.floor(Math.random() * 9000));
  const mysoreLat = 12.2958 + (Math.random() * 0.08 - 0.04);
  const mysoreLon = 76.6394 + (Math.random() * 0.08 - 0.04);

  const newRider = {
    id: newId,
    name: name,
    phone: phone,
    status: 'active',
    loc: 'Gokulam, Mysore',
    device: 'UNPROVISIONED',
    ping: 'Just now',
    emergency: emergency,
    shift: shift,
    alerts: 0,
    lat: mysoreLat,
    lon: mysoreLon,
    speed: 0,
    signal: 'N/A',
    battery: 100
  };

  appState.riders.push(newRider);
  saveState();
  closeModal('addRiderModal');
  showToast('Enrolled successfully', `${name} linked in registry.`, 'success');
  
  document.getElementById('addRiderForm').reset();
  renderAll();
}

function saveDevice() {
  const devId = document.getElementById('devId').value.trim().toUpperCase();
  const riderId = document.getElementById('devRider').value;
  const fw = document.getElementById('devFw').value.trim();
  const batt = document.getElementById('devBatt').value;

  if (!devId || !riderId) return;

  const rider = appState.riders.find(r => r.id === riderId);
  if (!rider) return;

  rider.device = devId;
  rider.battery = parseInt(batt);
  rider.signal = '-55dBm';

  appState.devices.push({
    id: devId,
    rider: `${rider.name} ${rider.id}`,
    fw: fw,
    batt: `${batt}%`,
    signal: '-55dBm',
    seen: 'Just now',
    status: 'active'
  });

  const timeStr = new Date().toLocaleTimeString('en-GB');
  appState.sys_logs.push({
    ts: timeStr,
    lvl: 'OK',
    msg: `Module registered: hardware ${devId} mapped to ${rider.name}.`
  });

  saveState();
  closeModal('registerDeviceModal');
  showToast('Device Provisioned', `IoT device ${devId} linked to rider.`, 'success');
  
  document.getElementById('registerDeviceForm').reset();
  renderAll();
}

// Global exposes for html inline calls
window.openModal = openModal;
window.closeModal = closeModal;
window.saveRider = saveRider;
window.saveDevice = saveDevice;
window.resolveRiderAlert = resolveRiderAlert;
window.locateRiderOnMap = locateRiderOnMap;
window.openInspectorDrawer = openInspectorDrawer;
window.closeInspectorDrawer = closeInspectorDrawer;

// ── SIDEBAR ROUTING ───────────────────────────────────────────
const sbLinks = document.querySelectorAll('.sb-link[data-page]');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');
const TITLES = {
  ops: 'Operational Operations Center',
  directory: 'Fleet Directory Registry',
  journal: 'SMS Transmission Log'
};

sbLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pg = link.dataset.page;
    if (!pg) return;
    
    sbLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    pages.forEach(p => p.classList.add('hidden'));
    const target = document.getElementById('page-' + pg);
    if (target) target.classList.remove('hidden');
    if (pageTitle) pageTitle.textContent = TITLES[pg] || pg;
    
    document.getElementById('mobOverlay')?.classList.remove('show');
    document.getElementById('sidebar')?.classList.remove('open');
    closeInspectorDrawer();
    
    if (pg === 'ops') {
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        } else {
          initMap();
        }
      }, 150);
    }
  });
});

// Mobile sidebar triggers
document.getElementById('mobToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('mobOverlay')?.classList.toggle('show');
});
document.getElementById('mobOverlay')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('mobOverlay')?.classList.remove('show');
});

// ── BOOTSTRAP ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderAll();
  
  // Custom user session load
  const sessionUser = localStorage.getItem('ridesafe_session');
  if (sessionUser) {
    const user = JSON.parse(sessionUser);
    const sbUser = document.querySelector('.sb-user');
    if (sbUser) {
      sbUser.innerHTML = `
        <div class="sb-avatar" style="background:linear-gradient(135deg,#0ea5e9,#10b981); color:#05070a; font-weight:800;">${user.initials}</div>
        <div>
          <div style="font-size:.82rem;font-weight:600; color:var(--txt);">${user.name}</div>
          <div style="font-size:.7rem;color:var(--txt3)">${user.role} · Mysore</div>
        </div>
      `;
    }
  }
  
  // Auto load map
  setTimeout(() => {
    initMap();
  }, 200);
});
