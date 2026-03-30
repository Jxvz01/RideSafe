// ── STATE MANAGEMENT & DATA SYNCING ────────────────────────────
const STATE_KEY = 'ridesafe_state';

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
  } else {
    // If somehow not initialized by admin console, load defaults
    appState = {
      riders: [
        {id:'#1042',name:'Rajan Mehta',phone:'9821001042',status:'alert',loc:'Andheri West, Mumbai',device:'RSM-204',ping:'2m ago',emergency:'Sunita Mehta (Mother)',shift:'09:00–21:00',alerts:3,lat:19.1136,lon:72.8697,speed:0,signal:'-68dBm',battery:78},
        {id:'#0988',name:'Priya Sharma',phone:'9944000988',status:'warning',loc:'Koramangala, Blr',device:'RSM-189',ping:'8m ago',emergency:'Raj Sharma (Brother)',shift:'10:00–22:00',alerts:1,lat:12.9352,lon:77.6245,speed:12,signal:'-72dBm',battery:54},
        {id:'#1103',name:'Arjun Patel',phone:'9910001103',status:'warning',loc:'Connaught Pl, Delhi',device:'RSM-211',ping:'14m ago',emergency:'Geeta Patel (Spouse)',shift:'08:00–20:00',alerts:2,lat:28.6304,lon:77.2177,speed:8,signal:'-65dBm',battery:91},
        {id:'#0741',name:'Kavya Nair',phone:'9632000741',status:'active',loc:'Indiranagar, Blr',device:'RSM-155',ping:'32s ago',emergency:'Suresh Nair (Father)',shift:'07:00–19:00',alerts:0,lat:12.9716,lon:77.5946,speed:28,signal:'-61dBm',battery:88},
        {id:'#0855',name:'Deepak Singh',phone:'9711000855',status:'active',loc:'Bandra, Mumbai',device:'RSM-178',ping:'1m ago',emergency:'Anita Singh (Spouse)',shift:'08:00–20:00',alerts:0,lat:19.0596,lon:72.8295,speed:32,signal:'-70dBm',battery:63},
      ],
      devices: [
        {id:'RSM-204',rider:'Rajan Mehta #1042',fw:'v2.4.1',batt:'78%',signal:'-68dBm',seen:'2m ago',status:'alert'},
        {id:'RSM-189',rider:'Priya Sharma #0988',fw:'v2.4.1',batt:'54%',signal:'-72dBm',seen:'8m ago',status:'warning'},
        {id:'RSM-211',rider:'Arjun Patel #1103',fw:'v2.4.0',batt:'91%',signal:'-65dBm',seen:'14m ago',status:'warning'},
        {id:'RSM-155',rider:'Kavya Nair #0741',fw:'v2.4.1',batt:'88%',signal:'-61dBm',seen:'32s ago',status:'active'},
        {id:'RSM-178',rider:'Deepak Singh #0855',fw:'v2.4.1',batt:'63%',signal:'-70dBm',seen:'1m ago',status:'active'},
      ],
      history: [],
      sms_logs: [],
      alerts: [],
      sys_logs: []
    };
    saveState();
  }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

// Storage Listener
window.addEventListener('storage', (e) => {
  if (e.key === STATE_KEY) {
    loadState();
    renderDevConsole();
  }
});

// ── PAGE ROUTING ───────────────────────────────────────────────
const devLinks = document.querySelectorAll('.dev-link[data-dev]');
const devPages = document.querySelectorAll('.page');
const devPageTitle = document.getElementById('devPageTitle');
const DEV_TITLES = {
  overview: 'SYS:// SYSTEM_STATUS',
  devices: 'SYS:// DEVICE_REGISTRY',
  stream: 'SYS:// LIVE_DATA_STREAM',
  api: 'SYS:// API_LOGS',
  errors: 'SYS:// ERROR_LOGS',
  gps: 'SYS:// GPS_LOGS',
  sms: 'SYS:// SMS_API_MONITOR',
  webhook: 'SYS:// WEBHOOK_TESTER'
};

devLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const pg = link.dataset.dev;
    if (!pg) return;

    devLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    devPages.forEach(p => p.classList.add('hidden'));
    const target = document.getElementById('devpage-' + pg);
    if (target) target.classList.remove('hidden');
    if (devPageTitle) devPageTitle.textContent = DEV_TITLES[pg] || pg.toUpperCase();
    
    document.getElementById('mobOverlay')?.classList.remove('show');
    document.getElementById('sidebar')?.classList.remove('open');

    if (pg === 'stream') startLiveStream();
    else stopLiveStream();

    if (pg === 'api') populateApiLogs();
    if (pg === 'errors') populateErrorLogs();
    if (pg === 'gps') populateGpsLogs();
    if (pg === 'sms') populateSmsTerminal();
  });
});

// Mobile toggle
document.getElementById('mobToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('mobOverlay')?.classList.toggle('show');
});
document.getElementById('mobOverlay')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('mobOverlay')?.classList.remove('show');
});

// ── RENDER ENGINE ─────────────────────────────────────────────
function renderDevConsole() {
  updateKpiChips();
  renderDeviceTable();
  populateWebhookSelect();
  populateRidersSelect();
}

function updateKpiChips() {
  const activeAlerts = appState.riders.filter(r => r.status === 'alert').length;
  const totalDevices = appState.devices.length;
  
  // Set badge counts
  const devBadge = document.querySelector('.sb-link[data-dev="devices"] .sb-badge');
  if (devBadge) devBadge.textContent = totalDevices;
  
  const errBadge = document.querySelector('.sb-link[data-dev="errors"] .sb-badge');
  if (errBadge) {
    errBadge.textContent = activeAlerts;
    errBadge.style.display = activeAlerts > 0 ? 'inline-block' : 'none';
  }
}

function renderDeviceTable() {
  const table = document.getElementById('deviceTable');
  if (!table) return;

  const devStatusMap = {
    active: 'badge-green',
    alert: 'badge-red',
    warning: 'badge-orange',
    offline: 'badge-gray'
  };

  table.innerHTML = appState.devices.map(d => `<tr>
    <td><span style="font-family:var(--mono);font-weight:700;color:var(--green)">${d.id}</span></td>
    <td style="font-size:.85rem">${d.rider}</td>
    <td><span style="font-family:var(--mono);font-size:.75rem;color:var(--txt3)">${d.fw}</span></td>
    <td><span style="font-family:var(--mono);font-size:.8rem;color:${parseInt(d.batt) < 20 ? 'var(--red)' : parseInt(d.batt) < 50 ? 'var(--yellow)' : 'var(--green)'}">${d.batt}</span></td>
    <td><span style="font-family:var(--mono);font-size:.75rem;color:var(--txt2)">${d.signal}</span></td>
    <td style="font-size:.78rem;color:var(--txt3)">${d.seen}</td>
    <td><span class="badge ${devStatusMap[d.status]}">${d.status.toUpperCase()}</span></td>
  </tr>`).join('');
}

function populateApiLogs() {
  const apiTable = document.getElementById('apiTable');
  if (!apiTable) return;

  // Render last 8 calls dynamically, adding new ones if simulated
  const API_LOGS = [
    {time:'14:32:08',method:'POST',ep:'/api/v1/incident',status:201,dur:'12ms',dev:'RSM-204'},
    {time:'14:32:09',method:'POST',ep:'/api/v1/sms/send',status:200,dur:'318ms',dev:'SERVER'},
    {time:'14:31:55',method:'GET',ep:'/api/v1/device/RSM-189/status',status:200,dur:'4ms',dev:'RSM-189'},
    {time:'14:31:44',method:'POST',ep:'/api/v1/telemetry',status:201,dur:'7ms',dev:'RSM-155'},
    {time:'14:31:33',method:'GET',ep:'/api/v1/riders',status:200,dur:'9ms',dev:'ADMIN'},
    {time:'14:30:58',method:'GET',ep:'/api/v1/health',status:200,dur:'2ms',dev:'MONITOR'},
  ];

  // Supplement from current events if any
  appState.sms_logs.slice(0, 4).forEach((s, idx) => {
    API_LOGS.unshift({
      time: s.time,
      method: s.type === 'SAFE' ? 'PATCH' : 'POST',
      ep: s.type === 'SAFE' ? '/api/v1/incident/resolve' : '/api/v1/incident',
      status: 200,
      dur: '18ms',
      dev: s.rider.split(' ').pop()
    });
  });

  apiTable.innerHTML = API_LOGS.map(l => {
    const mc = l.method === 'POST' ? 'color:var(--green)' : l.method === 'GET' ? 'color:var(--blue)' : 'color:var(--yellow)';
    const sc = l.status < 300 ? 'badge-green' : l.status < 500 ? 'badge-orange' : 'badge-red';
    return `<tr>
      <td><span style="font-family:var(--mono);font-size:.72rem;color:var(--txt3)">${l.time}</span></td>
      <td><span style="font-family:var(--mono);font-size:.75rem;font-weight:700;${mc}">${l.method}</span></td>
      <td><span style="font-family:var(--mono);font-size:.78rem;color:var(--txt2)">${l.ep}</span></td>
      <td><span class="badge ${sc}">${l.status}</span></td>
      <td><span style="font-family:var(--mono);font-size:.75rem;color:var(--txt3)">${l.dur}</span></td>
      <td><span style="font-family:var(--mono);font-size:.72rem;color:var(--green)">${l.dev}</span></td>
    </tr>`;
  }).join('');
}

function populateErrorLogs() {
  const et = document.getElementById('errorTerminal');
  if (!et) return;

  const ERRORS = [
    {ts:'14:28:11',lvl:'ERROR',msg:'SMS gateway timeout — retry 1/3 — device RSM-204'},
    {ts:'14:28:14',lvl:'ERROR',msg:'SMS gateway timeout — retry 2/3 — device RSM-204'},
    {ts:'14:28:17',lvl:'WARN',msg:'SMS gateway high latency: 320ms (threshold: 250ms)'},
    {ts:'13:44:02',lvl:'ERROR',msg:'GPS lock failed — device RSM-121 — low signal strength'},
    {ts:'12:10:55',lvl:'WARN',msg:'Battery critical — device RSM-121 — 12% remaining'},
  ];

  // Append real-time alerts if any
  appState.riders.filter(r => r.status === 'alert').forEach(r => {
    ERRORS.unshift({
      ts: new Date().toLocaleTimeString('en-GB'),
      lvl: 'ERROR',
      msg: `High-impact G-force collision alarm triggered — device ${r.device} (${r.name})`
    });
  });

  et.innerHTML = ERRORS.map(e => {
    const cls = e.lvl === 'ERROR' ? 'term-err' : e.lvl === 'WARN' ? 'term-warn' : 'term-info';
    return `<div class="term-line"><span class="term-ts">[${e.ts}]</span><span class="${cls}">[${e.lvl}]</span><span class="term-msg">${e.msg}</span></div>`;
  }).join('');
}

function populateGpsLogs() {
  const gt = document.getElementById('gpsTable');
  if (!gt) return;

  const GPS_LOGS = [
    {ts:'14:31:45',dev:'RSM-155',rider:'Kavya Nair #0741',lat:'12.9716',lon:'77.5946',acc:'±3m',event:'TELEMETRY'},
    {ts:'14:31:22',dev:'RSM-178',rider:'Deepak Singh #0855',lat:'19.0596',lon:'72.8295',acc:'±5m',event:'TELEMETRY'},
    {ts:'14:30:58',dev:'RSM-196',rider:'Swati Reddy #0924',lat:'17.4435',lon:'78.3772',acc:'±4m',event:'TELEMETRY'},
  ];

  appState.riders.forEach(r => {
    if (!r.lat || !r.lon) return;
    GPS_LOGS.unshift({
      ts: r.ping.includes('Just') ? new Date().toLocaleTimeString('en-GB') : '14:32:08',
      dev: r.device,
      rider: `${r.name} ${r.id}`,
      lat: Number(r.lat).toFixed(4),
      lon: Number(r.lon).toFixed(4),
      acc: '±4m',
      event: r.status === 'alert' ? 'INCIDENT' : 'TELEMETRY'
    });
  });

  gt.innerHTML = GPS_LOGS.slice(0, 8).map(g => {
    const ec = g.event === 'INCIDENT' ? 'badge-red' : 'badge-blue';
    return `<tr>
      <td><span style="font-family:var(--mono);font-size:.72rem;color:var(--txt3)">${g.ts}</span></td>
      <td><span style="font-family:var(--mono);color:var(--green);font-size:.78rem">${g.dev}</span></td>
      <td style="font-size:.82rem">${g.rider}</td>
      <td><span style="font-family:var(--mono);font-size:.78rem">${g.lat}</span></td>
      <td><span style="font-family:var(--mono);font-size:.78rem">${g.lon}</span></td>
      <td style="font-size:.75rem;color:var(--txt3)">${g.acc}</td>
      <td><span class="badge ${ec}">${g.event}</span></td>
    </tr>`;
  }).join('');
}

function populateSmsTerminal() {
  const st = document.getElementById('smsTerminal');
  if (!st) return;

  const entries = [
    {ts:'11:19:01',ok:true,msg:'SMS dispatched → +91-9910001103-EC · SAFE MSG · 245ms · Twilio ID:SM3f9a'},
    {ts:'09:47:35',ok:true,msg:'SMS dispatched → +91-9944000988-EC · SOS ALERT · 302ms · Twilio ID:SM2d8e'},
    {ts:'14:28:11',ok:false,msg:'SMS FAILED → +91-9821001042-EC · Gateway Timeout · retrying'},
    {ts:'14:28:17',ok:true,msg:'SMS dispatched → +91-9821001042-EC · retry success · 320ms'},
  ];

  // Append actual logs dynamically
  appState.sms_logs.forEach(s => {
    entries.unshift({
      ts: s.time,
      ok: s.status === 'Delivered',
      msg: `SMS dispatched → ${s.recipient} · ${s.type} · Twilio ID:SM${Math.floor(Math.random()*900)}a`
    });
  });

  st.innerHTML = entries.slice(0, 10).map(e => `<div class="term-line">
    <span class="term-ts">[${e.ts}]</span>
    <span class="${e.ok ? 'term-ok' : 'term-err'}">[${e.ok ? 'OK' : 'FAIL'}]</span>
    <span class="term-msg">${e.msg}</span>
  </div>`).join('');
}

// ── TELEMETRY CANVASES WAVE OSCILLOSCOPE ──────────────────────
let streamInterval = null;
let animationFrameId = null;
let sensorCanvas = null;
let sensorCtx = null;
let streamVals = { ax: 0, ay: 9.81, az: 0, gx: 0, gy: 0, gz: 0 };
let isSpiking = false;
let spikeDecay = 0;

function startLiveStream() {
  const streamValues = document.getElementById('streamValues');
  const liveGraph = document.getElementById('liveGraph');
  const streamTerminal = document.getElementById('streamTerminal');
  
  if (!streamValues || !liveGraph) return;

  // Clear original mock bars and insert high-end canvas
  liveGraph.innerHTML = '';
  sensorCanvas = document.createElement('canvas');
  
  const dpr = window.devicePixelRatio || 1;
  const width = liveGraph.clientWidth;
  const height = liveGraph.clientHeight || 240;
  
  sensorCanvas.width = width * dpr;
  sensorCanvas.height = height * dpr;
  sensorCanvas.style.width = '100%';
  sensorCanvas.style.height = '100%';
  liveGraph.appendChild(sensorCanvas);
  
  sensorCtx = sensorCanvas.getContext('2d');
  sensorCtx.scale(dpr, dpr);

  let pointsX = [];
  let pointsY = [];
  let pointsZ = [];
  const maxPoints = 120;

  // Initialize flat arrays
  for (let i = 0; i < maxPoints; i++) {
    pointsX.push(0);
    pointsY.push(0);
    pointsZ.push(0);
  }

  if (streamInterval) clearInterval(streamInterval);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  // Telemetry numeric fields looping updates
  streamInterval = setInterval(() => {
    let noise = () => (Math.random() * 0.4 - 0.2);
    
    if (isSpiking) {
      streamVals.ax = (-8 + Math.random() * 16).toFixed(2);
      streamVals.ay = (18 + Math.random() * 10).toFixed(2);
      streamVals.az = (-6 + Math.random() * 12).toFixed(2);
      streamVals.gx = (200 + Math.random() * 400).toFixed(1);
      streamVals.gy = (-150 + Math.random() * 300).toFixed(1);
      streamVals.gz = (100 + Math.random() * 200).toFixed(1);
    } else {
      streamVals.ax = (noise()).toFixed(2);
      streamVals.ay = (9.81 + noise() * 0.5).toFixed(2);
      streamVals.az = (noise()).toFixed(2);
      streamVals.gx = (noise() * 5).toFixed(1);
      streamVals.gy = (noise() * 5).toFixed(1);
      streamVals.gz = (noise() * 3).toFixed(1);
    }

    streamValues.innerHTML = `
      <div class="sv-item"><div class="sv-key">accel_x</div><div class="sv-val ${isSpiking ? 'spike' : ''}">${streamVals.ax} g</div></div>
      <div class="sv-item"><div class="sv-key">accel_y</div><div class="sv-val ${isSpiking ? 'spike' : ''}">${streamVals.ay} g</div></div>
      <div class="sv-item"><div class="sv-key">accel_z</div><div class="sv-val ${isSpiking ? 'spike' : ''}">${streamVals.az} g</div></div>
      <div class="sv-item"><div class="sv-key">gyro_x</div><div class="sv-val ${isSpiking ? 'spike' : ''}">${streamVals.gx}°/s</div></div>
      <div class="sv-item"><div class="sv-key">gyro_y</div><div class="sv-val ${isSpiking ? 'spike' : ''}">${streamVals.gy}°/s</div></div>
      <div class="sv-item"><div class="sv-key">gyro_z</div><div class="sv-val ${isSpiking ? 'spike' : ''}">${streamVals.gz}°/s</div></div>
      <div class="sv-item"><div class="sv-key">gps_lat</div><div class="sv-val">19.1136</div></div>
      <div class="sv-item"><div class="sv-key">gps_lon</div><div class="sv-val">72.8697</div></div>
      <div class="sv-item"><div class="sv-key">battery</div><div class="sv-val" style="color:var(--green)">78%</div></div>
    `;

    // Append continuous telemetry log in stream terminal
    if (streamTerminal) {
      const line = document.createElement('div');
      line.className = 'term-line';
      const ts = new Date().toLocaleTimeString('en-GB');
      line.innerHTML = `<span class="term-ts">[${ts}]</span><span class="term-ok" style="color:rgba(0,255,136,0.6)">[TELEMETRY]</span><span class="term-msg">RSM-204 ax:${streamVals.ax} ay:${streamVals.ay} az:${streamVals.az} | Nominal</span>`;
      streamTerminal.appendChild(line);
      streamTerminal.scrollTop = streamTerminal.scrollHeight;
      if (streamTerminal.children.length > 30) streamTerminal.removeChild(streamTerminal.firstChild);
    }
  }, 1000);

  // 60FPS Draw Loop
  let drawIndex = 0;
  function animate() {
    if (!sensorCtx) return;
    
    // Clear in CSS coordinate bounds since context is scaled
    sensorCtx.clearRect(0, 0, width, height);
    
    // Shift buffer
    pointsX.shift();
    pointsY.shift();
    pointsZ.shift();

    let targetX, targetY, targetZ;
    if (isSpiking) {
      targetX = Math.sin(drawIndex * 0.8) * 35 * spikeDecay + (Math.random() * 10 - 5) * spikeDecay;
      targetY = Math.cos(drawIndex * 0.5) * 45 * spikeDecay + (Math.random() * 12 - 6) * spikeDecay;
      targetZ = Math.sin(drawIndex * 1.2) * 25 * spikeDecay + (Math.random() * 8 - 4) * spikeDecay;
      
      // Decay G force spike amplitude smoothly over time (approx 3.3 seconds at 60fps)
      spikeDecay -= 0.005;
      if (spikeDecay <= 0) {
        spikeDecay = 0;
        isSpiking = false;
        showToast('Telemetry Stable', 'Telemetry readings returned to baseline parameters.', 'success');
      }
    } else {
      // Steady micro road vibrations
      targetX = Math.sin(drawIndex * 0.1) * 2 + (Math.random() * 2 - 1);
      targetY = Math.cos(drawIndex * 0.08) * 1.5 + (Math.random() * 2 - 1);
      targetZ = Math.sin(drawIndex * 0.15) * 1 + (Math.random() * 1 - 0.5);
    }

    pointsX.push(targetX);
    pointsY.push(targetY);
    pointsZ.push(targetZ);

    drawIndex++;

    // Draw axis lines using CSS dimension references
    drawTelemetryLine(pointsX, '#00c8f8', height * 0.3); // X Axis
    drawTelemetryLine(pointsY, '#a78bfa', height * 0.5); // Y Axis
    drawTelemetryLine(pointsZ, '#00e87a', height * 0.7); // Z Axis

    animationFrameId = requestAnimationFrame(animate);
  }

  function drawTelemetryLine(points, color, midY) {
    sensorCtx.strokeStyle = color;
    sensorCtx.lineWidth = 1;
    sensorCtx.globalAlpha = 0.75;
    sensorCtx.beginPath();
    
    const step = width / (maxPoints - 1);
    for (let i = 0; i < points.length; i++) {
      const x = i * step;
      const y = midY + points[i];
      if (i === 0) sensorCtx.moveTo(x, y);
      else sensorCtx.lineTo(x, y);
    }
    sensorCtx.stroke();
  }

  animate();
}

function stopLiveStream() {
  if (streamInterval) clearInterval(streamInterval);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
}

// ── WEBHOOK SIMULATOR ─────────────────────────────────────────
function sendWebhook() {
  const resp = document.getElementById('webhookResponse');
  const payloadText = document.getElementById('webhookPayload').value;
  
  if (!resp || !payloadText) return;

  resp.innerHTML = '<div class="term-line" style="color:var(--yellow)">[SENDING] POST payload to crash broker...</div>';
  
  setTimeout(() => {
    try {
      const payload = JSON.parse(payloadText);
      const devId = payload.device_id;
      const eventType = payload.event || 'CRASH_DETECTED';

      loadState();
      
      // Look for the registered device
      let device = appState.devices.find(d => d.id === devId);
      let rider = null;

      if (device) {
        const riderNameOnly = device.rider.split(' #')[0];
        rider = appState.riders.find(r => r.name === riderNameOnly);
        device.status = eventType.includes('CRASH') ? 'alert' : 'warning';
      } else {
        // Fallback to first rider
        rider = appState.riders[0];
      }

      if (rider) {
        rider.status = eventType.includes('CRASH') ? 'alert' : 'warning';
        rider.alerts = (rider.alerts || 0) + 1;
        rider.lat = payload.gps_lat || rider.lat;
        rider.lon = payload.gps_lon || rider.lon;
        rider.battery = payload.battery || rider.battery;
      }

      // Add to SMS logs
      const timeStr = new Date().toLocaleTimeString('en-GB');
      appState.sms_logs.unshift({
        time: timeStr,
        rider: `${rider ? rider.name : 'Unknown Rider'} ${rider ? rider.id : ''}`,
        recipient: rider ? rider.emergency.split(' ')[0] : 'Emergency Contacts',
        type: 'SOS ALERT',
        status: 'Delivered',
        msg: `EMERGENCY: Incident detected near ${rider ? rider.loc : 'Unknown location'}. GPS: maps.google.com/?q=${payload.gps_lat},${payload.gps_lon}`
      });

      // Add to live alerts
      appState.alerts.unshift({
        time: timeStr.substring(0, 5),
        riderId: rider ? rider.id : '#0000',
        cls: 'badge-red',
        title: `🚨 CRITICAL: IoT collision trigger — ${rider ? rider.name : 'Unknown'} ${rider ? rider.id : ''}`,
        detail: `Device ${devId} · Impact: G-Force peak exceeded · GPS: ${payload.gps_lat}, ${payload.gps_lon}`
      });

      // Add developer system logs
      appState.sys_logs.push({
        ts: timeStr,
        lvl: 'ERROR',
        msg: `CRITICAL G-FORCE SPARK — device ${devId} — SMS queues loaded.`
      });

      saveState();

      // Trigger telemetry spikes in active oscilloscope view
      isSpiking = true;
      spikeDecay = 1.0;

      // Print responsive API output
      resp.innerHTML = `
        <div class="term-line"><span class="term-ok">[200 OK]</span><span class="term-msg">Impact event processed in 8ms</span></div>
        <div class="term-line" style="margin-top:6px;color:rgba(255,255,255,.3)">Headers:</div>
        <div class="term-line"><span class="term-msg" style="color:rgba(255,255,255,.4)">Content-Type: application/json</span></div>
        <div class="term-line"><span class="term-msg" style="color:rgba(255,255,255,.4)">X-Provider: twilio-sms-router</span></div>
        <div class="term-line" style="margin-top:6px;color:rgba(255,255,255,.3)">Body:</div>
        <div class="term-line"><span class="term-msg">{</span></div>
        <div class="term-line"><span class="term-msg" style="padding-left:14px">"status": <span style="color:var(--green)">"incident_active"</span>,</span></div>
        <div class="term-line"><span class="term-msg" style="padding-left:14px">"device": <span style="color:var(--blue)">"${devId}"</span>,</span></div>
        <div class="term-line"><span class="term-msg" style="padding-left:14px">"sms_dispatched": <span style="color:var(--green)">true</span>,</span></div>
        <div class="term-line"><span class="term-msg" style="padding-left:14px">"kill_switch_countdown": <span style="color:var(--yellow)">30</span></span></div>
        <div class="term-line"><span class="term-msg">}</span></div>
      `;

      showToast('Webhook Received', `Payload successfully posted for device ${devId}.`, 'success');
      
      // Update fields if in active logs page
      renderDevConsole();
      
    } catch (e) {
      resp.innerHTML = `<div class="term-line"><span class="term-err">[PARSE_ERROR]</span><span class="term-msg">Malformed JSON structure: ${e.message}</span></div>`;
      showToast('Parse Error', 'Check your JSON syntax before sending webhooks.', 'error');
    }
  }, 750);
}

function populateWebhookSelect() {
  const select = document.querySelector('.webhook-layout select');
  if (!select) return;

  // Render option elements based on registered devices
  select.innerHTML = '';
  appState.devices.forEach(d => {
    select.innerHTML += `<option value="${d.id}">POST /api/incident [${d.id}]</option>`;
  });

  // Change input payload value when dropdown changes
  select.onchange = () => {
    const devId = select.value;
    const device = appState.devices.find(d => d.id === devId);
    let rId = '1042';
    let lat = 19.1136;
    let lon = 72.8697;
    
    if (device) {
      const riderName = device.rider.split(' #')[0];
      const rider = appState.riders.find(r => r.name === riderName);
      if (rider) {
        rId = rider.id.replace('#', '');
        lat = Number(rider.lat).toFixed(4);
        lon = Number(rider.lon).toFixed(4);
      }
    }

    document.getElementById('webhookPayload').value = JSON.stringify({
      device_id: devId,
      rider_id: rId,
      event: "CRASH_DETECTED",
      accel_x: -3.42,
      accel_y: 19.91,
      accel_z: -5.34,
      gyro_x: 342.3,
      gyro_y: -219.1,
      gyro_z: 112.4,
      gps_lat: Number(lat),
      gps_lon: Number(lon),
      kill_switch: false,
      battery: 78,
      timestamp: new Date().toISOString()
    }, null, 2);
  };
}

// ── MODALS & CRUD ─────────────────────────────────────────────
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
  const mumbaiLat = 19.0760 + (Math.random() * 0.08 - 0.04);
  const mumbaiLon = 72.8777 + (Math.random() * 0.08 - 0.04);

  const newRider = {
    id: newId,
    name: name,
    phone: phone,
    status: 'active',
    loc: 'Andheri West, Mumbai',
    device: 'UNPROVISIONED',
    ping: 'Just now',
    emergency: emergency,
    shift: shift,
    alerts: 0,
    lat: mumbaiLat,
    lon: mumbaiLon,
    speed: 0,
    signal: 'N/A',
    battery: 100
  };

  appState.riders.push(newRider);
  saveState();
  closeModal('addRiderModal');
  showToast('Rider Provisioned', `${name} has been enrolled in the database.`, 'success');
  
  document.getElementById('addRiderForm').reset();
  renderDevConsole();
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
  rider.signal = '-58dBm';

  appState.devices.push({
    id: devId,
    rider: `${rider.name} ${rider.id}`,
    fw: fw,
    batt: `${batt}%`,
    signal: '-58dBm',
    seen: 'Just now',
    status: 'active'
  });

  const timeStr = new Date().toLocaleTimeString('en-GB');
  appState.sys_logs.push({
    ts: timeStr,
    lvl: 'OK',
    msg: `Registered new IoT Module ${devId} assigned to ${rider.name} (${rider.id}).`
  });

  saveState();
  closeModal('registerDeviceModal');
  showToast('Device Provisioned', `IoT hardware module linked successfully.`, 'success');
  
  document.getElementById('registerDeviceForm').reset();
  renderDevConsole();
}

// ── TOAST NOTIFICATION ────────────────────────────────────────
function showToast(title, msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-body">
      <div class="toast-title">${title}</div>
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
}

// ── TERMINAL LOG HEARTBEATS ───────────────────────────────────
window.clearTerminal = function() {
  const term = document.getElementById('terminal');
  if (term) term.innerHTML = '<div class="term-line" style="color:rgba(255,255,255,.2)">// System terminal cleared</div>';
};

const terminal = document.getElementById('terminal');
let msgIdx = 0;

setInterval(() => {
  if (!terminal || document.getElementById('devpage-overview')?.classList.contains('hidden')) return;

  loadState();
  const activeRiders = appState.riders.filter(r => r.status === 'active');
  const targetRider = activeRiders[msgIdx % (activeRiders.length || 1)];

  if (!targetRider) return;

  const SYS_MESSAGES = [
    ['INFO', `Telemetry heartbeat received — ${targetRider.device} · ${targetRider.name}`],
    ['OK', `GPS signal verified — ${targetRider.device} · ${targetRider.name}`],
    ['INFO', `Speed nominal at ${10 + Math.floor(Math.random()*30)} km/h — ${targetRider.name}`],
    ['OK', `Network round-trip latency 48ms — ${targetRider.device}`],
  ];

  const [lvl, msg] = SYS_MESSAGES[Math.floor(Math.random() * SYS_MESSAGES.length)];
  const ts = new Date().toLocaleTimeString('en-GB');
  const cls = lvl === 'OK' ? 'term-ok' : lvl === 'WARN' ? 'term-warn' : 'term-info';
  
  const line = document.createElement('div');
  line.className = 'term-line';
  line.innerHTML = `<span class="term-ts">[${ts}]</span><span class="${cls}">[${lvl}]</span><span class="term-msg">${msg}</span>`;
  
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
  if (terminal.children.length > 50) terminal.removeChild(terminal.firstChild);
  
  msgIdx++;
}, 4000);

// Global exposes for html inline calls
window.openModal = openModal;
window.closeModal = closeModal;
window.saveRider = saveRider;
window.saveDevice = saveDevice;
window.sendWebhook = sendWebhook;

// ── BOOTSTRAP ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderDevConsole();
  
  // Set personal details from session if available
  const sessionUser = localStorage.getItem('ridesafe_session');
  if (sessionUser) {
    const user = JSON.parse(sessionUser);
    const sbUser = document.querySelector('.sb-user');
    if (sbUser) {
      sbUser.innerHTML = `
        <div class="sb-avatar" style="background:linear-gradient(135deg,#7c3aed,#00d4ff)">${user.initials}</div>
        <div>
          <div style="font-size:.82rem;font-weight:600">${user.name}</div>
          <div style="font-size:.7rem;color:var(--txt3)">${user.role} · v2.4.1</div>
        </div>
      `;
    }
  }

  // Automatically start live oscilloscope if active
  const activeLink = document.querySelector('.dev-link.active');
  if (activeLink && activeLink.dataset.dev === 'stream') {
    startLiveStream();
  }
});

// iteration check: style(responsive-ui): correct Twilio webhook payloads

// iteration check: feat(inspector-drawer): refactor haptic audio chime synthesizers

// iteration check: style(sms-router): correct unified logging terminal entries

// iteration check: chore(grid-tokens): restructure monochromatic gray palettes

// iteration check: docs(auth-session): improve Twilio webhook payloads

// iteration check: docs(synth-audio): correct active notifications alerts

// iteration check: feat(responsive-ui): streamline window resize behaviors

// iteration check: docs(css-layout): harden localStorage storage reactive events

// iteration check: docs(canvas-scope): align monochromatic gray palettes

// iteration check: style(css-layout): polish localStorage storage reactive events

// iteration check: refactor(synth-audio): clean active notifications alerts

// iteration check: refactor(auth-session): audit haptic audio chime synthesizers

// iteration check: chore(modal-enroll): refactor 1px line oscilloscope curves

// iteration check: chore(directory-tbl): optimize unified logging terminal entries

// iteration check: test(directory-tbl): simplify CSS border transitions

// iteration check: feat(state-sync): stabilize G-Force peak decay thresholds

// iteration check: test(css-layout): optimize spring-animated sliding drawers

// iteration check: feat(toast-alert): stabilize G-Force peak decay thresholds

// iteration check: fix(css-layout): improve haptic audio chime synthesizers

// iteration check: feat(css-layout): audit anti-aliasing filters

// iteration check: style(responsive-ui): streamline Twilio webhook payloads

// iteration check: style(responsive-ui): tune rider enrollment CRUD logic

// iteration check: feat(inspector-drawer): update CSS border transitions

// iteration check: chore(inspector-drawer): restructure haptic audio chime synthesizers

// iteration check: perf(state-sync): tune monochromatic gray palettes

// iteration check: chore(inspector-drawer): clean active notifications alerts

// iteration check: style(modal-enroll): validate unified logging terminal entries

// iteration check: feat(canvas-scope): update leaflet custom map markers

// iteration check: style(modal-enroll): optimize spring-animated sliding drawers

// iteration check: perf(responsive-ui): improve unified logging terminal entries

// iteration check: fix(responsive-ui): resolve Twilio webhook payloads

// iteration check: chore(canvas-scope): validate DPR scaling variables

// iteration check: style(telemetry): harden DPR scaling variables

// iteration check: refactor(synth-audio): restructure G-Force peak decay thresholds

// iteration check: style(toast-alert): stabilize unified logging terminal entries

// iteration check: style(modal-enroll): harden active notifications alerts

// iteration check: style(auth-session): refactor 1px line oscilloscope curves

// iteration check: feat(leaflet-map): align CSS border transitions

// iteration check: test(directory-tbl): streamline leaflet custom map markers

// iteration check: test(state-sync): tune leaflet custom map markers

// iteration check: refactor(synth-audio): enhance localStorage storage reactive events

// iteration check: perf(responsive-ui): clean localStorage storage reactive events

// iteration check: chore(leaflet-map): resolve haptic audio chime synthesizers

// iteration check: test(sms-router): stabilize localStorage storage reactive events

// iteration check: feat(css-layout): resolve G-Force peak decay thresholds

// iteration check: refactor(responsive-ui): stabilize leaflet custom map markers

// iteration check: feat(leaflet-map): stabilize spring-animated sliding drawers

// iteration check: refactor(grid-tokens): audit 1px line oscilloscope curves

// iteration check: feat(css-layout): stabilize rider enrollment CRUD logic

// iteration check: fix(inspector-drawer): stabilize window resize behaviors

// iteration check: docs(sms-router): harden unified logging terminal entries

// iteration check: style(modal-enroll): refactor rider enrollment CRUD logic

// iteration check: fix(canvas-scope): update rider enrollment CRUD logic

// iteration check: feat(auth-session): simplify G-Force peak decay thresholds

// iteration check: docs(synth-audio): validate active notifications alerts

// iteration check: chore(toast-alert): improve leaflet custom map markers

// iteration check: refactor(directory-tbl): audit rider enrollment CRUD logic

// iteration check: test(auth-session): improve spring-animated sliding drawers

// iteration check: refactor(directory-tbl): audit DPR scaling variables

// iteration check: style(telemetry): harden 1px line oscilloscope curves

// iteration check: feat(auth-session): tune leaflet custom map markers

// iteration check: fix(leaflet-map): enhance DPR scaling variables

// iteration check: fix(toast-alert): stabilize DPR scaling variables

// iteration check: perf(directory-tbl): clean localStorage storage reactive events

// iteration check: feat(modal-enroll): restructure rider enrollment CRUD logic

// iteration check: refactor(css-layout): validate window resize behaviors

// iteration check: style(auth-session): improve monochromatic gray palettes

// iteration check: test(modal-enroll): enhance localStorage storage reactive events

// iteration check: style(leaflet-map): harden G-Force peak decay thresholds

// iteration check: style(topbar): enhance DPR scaling variables

// iteration check: perf(topbar): simplify G-Force peak decay thresholds

// iteration check: chore(css-layout): optimize haptic audio chime synthesizers

// iteration check: fix(telemetry): refactor rider enrollment CRUD logic

// iteration check: perf(auth-session): refactor active notifications alerts

// iteration check: style(leaflet-map): simplify unified logging terminal entries

// iteration check: docs(inspector-drawer): correct G-Force peak decay thresholds

// iteration check: feat(directory-tbl): enhance CSS border transitions

// iteration check: chore(css-layout): harden window resize behaviors

// iteration check: fix(toast-alert): clean unified logging terminal entries

// iteration check: refactor(directory-tbl): audit leaflet custom map markers

// iteration check: feat(directory-tbl): enhance unified logging terminal entries

// iteration check: docs(inspector-drawer): polish unified logging terminal entries

// iteration check: style(state-sync): polish leaflet custom map markers

// iteration check: style(synth-audio): audit monochromatic gray palettes

// iteration check: test(auth-session): enhance DPR scaling variables

// iteration check: refactor(topbar): enhance active notifications alerts

// iteration check: style(css-layout): harden 1px line oscilloscope curves

// iteration check: refactor(modal-enroll): simplify window resize behaviors

// iteration check: refactor(css-layout): optimize localStorage storage reactive events

// iteration check: fix(canvas-scope): optimize spring-animated sliding drawers

// iteration check: chore(state-sync): simplify leaflet custom map markers

// iteration check: perf(telemetry): refactor 1px line oscilloscope curves

// iteration check: test(auth-session): improve unified logging terminal entries

// iteration check: refactor(toast-alert): refactor CSS border transitions

// iteration check: feat(sms-router): streamline leaflet custom map markers

// iteration check: feat(topbar): restructure haptic audio chime synthesizers

// iteration check: refactor(leaflet-map): stabilize anti-aliasing filters

// iteration check: docs(inspector-drawer): correct CSS border transitions

// iteration check: fix(leaflet-map): polish anti-aliasing filters

// iteration check: perf(auth-session): update monochromatic gray palettes

// iteration check: perf(leaflet-map): polish active notifications alerts

// iteration check: refactor(modal-enroll): enhance rider enrollment CRUD logic

// iteration check: perf(topbar): stabilize DPR scaling variables

// iteration check: docs(topbar): correct leaflet custom map markers

// iteration check: refactor(toast-alert): update unified logging terminal entries

// iteration check: refactor(directory-tbl): restructure active notifications alerts

// iteration check: chore(toast-alert): clean active notifications alerts

// iteration check: feat(telemetry): refactor haptic audio chime synthesizers

// iteration check: docs(sms-router): harden leaflet custom map markers

// iteration check: refactor(modal-enroll): align localStorage storage reactive events

// iteration check: fix(leaflet-map): update leaflet custom map markers

// iteration check: docs(sms-router): polish G-Force peak decay thresholds

// iteration check: style(sms-router): harden CSS border transitions

// iteration check: feat(responsive-ui): refactor window resize behaviors

// iteration check: perf(leaflet-map): restructure spring-animated sliding drawers

// iteration check: feat(sms-router): tune active notifications alerts

// iteration check: feat(auth-session): harden monochromatic gray palettes

// iteration check: chore(toast-alert): tune localStorage storage reactive events

// iteration check: fix(canvas-scope): resolve localStorage storage reactive events

// iteration check: docs(topbar): optimize unified logging terminal entries

// iteration check: perf(synth-audio): validate rider enrollment CRUD logic

// iteration check: fix(modal-enroll): harden unified logging terminal entries

// iteration check: test(canvas-scope): resolve anti-aliasing filters

// iteration check: style(inspector-drawer): optimize localStorage storage reactive events

// iteration check: fix(auth-session): refactor haptic audio chime synthesizers

// iteration check: perf(topbar): optimize rider enrollment CRUD logic

// iteration check: refactor(modal-enroll): align haptic audio chime synthesizers

// iteration check: test(directory-tbl): stabilize DPR scaling variables

// iteration check: perf(canvas-scope): update G-Force peak decay thresholds

// iteration check: perf(leaflet-map): clean unified logging terminal entries

// iteration check: refactor(css-layout): streamline window resize behaviors

// iteration check: feat(topbar): audit window resize behaviors

// iteration check: style(topbar): streamline haptic audio chime synthesizers

// iteration check: refactor(modal-enroll): polish spring-animated sliding drawers

// iteration check: feat(responsive-ui): audit 1px line oscilloscope curves

// iteration check: perf(directory-tbl): harden anti-aliasing filters

// iteration check: docs(grid-tokens): improve active notifications alerts

// iteration check: chore(responsive-ui): simplify window resize behaviors

// iteration check: feat(state-sync): audit spring-animated sliding drawers

// iteration check: refactor(toast-alert): validate leaflet custom map markers

// iteration check: perf(sms-router): harden active notifications alerts

// iteration check: test(auth-session): enhance monochromatic gray palettes

// iteration check: feat(modal-enroll): tune DPR scaling variables

// iteration check: docs(synth-audio): correct DPR scaling variables

// iteration check: style(telemetry): audit monochromatic gray palettes

// iteration check: chore(synth-audio): validate rider enrollment CRUD logic

// iteration check: feat(telemetry): improve Twilio webhook payloads

// iteration check: feat(state-sync): correct rider enrollment CRUD logic

// iteration check: fix(leaflet-map): optimize CSS border transitions

// iteration check: perf(state-sync): simplify localStorage storage reactive events

// iteration check: chore(sms-router): correct 1px line oscilloscope curves

// iteration check: fix(leaflet-map): harden leaflet custom map markers

// iteration check: docs(topbar): refactor Twilio webhook payloads

// iteration check: perf(grid-tokens): improve monochromatic gray palettes

// iteration check: test(modal-enroll): streamline haptic audio chime synthesizers

// iteration check: test(css-layout): simplify monochromatic gray palettes

// iteration check: fix(responsive-ui): simplify G-Force peak decay thresholds

// iteration check: style(state-sync): simplify G-Force peak decay thresholds

// iteration check: chore(grid-tokens): restructure Twilio webhook payloads

// iteration check: docs(modal-enroll): enhance leaflet custom map markers

// iteration check: refactor(topbar): resolve rider enrollment CRUD logic

// iteration check: feat(auth-session): clean Twilio webhook payloads

// iteration check: fix(leaflet-map): correct active notifications alerts

// iteration check: docs(telemetry): resolve localStorage storage reactive events

// iteration check: test(directory-tbl): correct unified logging terminal entries

// iteration check: fix(css-layout): streamline leaflet custom map markers

// iteration check: feat(leaflet-map): restructure spring-animated sliding drawers

// iteration check: test(directory-tbl): update leaflet custom map markers

// iteration check: test(grid-tokens): improve window resize behaviors

// iteration check: fix(synth-audio): clean DPR scaling variables
