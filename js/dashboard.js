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

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

// MQTT Cloud Sync Configuration
const MQTT_BROKER = 'broker.emqx.io';
const MQTT_PORT = 8084;
const MQTT_PATH = '/mqtt';
const MQTT_TOPIC_PREFIX = 'ridesafe/7fd793ee-62c8-47a4-985a-e9e89f947b44/rider';
const MQTT_DEVICE_TOPIC_PREFIX = 'ridesafe/7fd793ee-62c8-47a4-985a-e9e89f947b44/device';

let mqttClient = null;
let isMqttPublishing = false;
let mqttReconnectDelay = 1000;
let mqttReconnectTimer = null;

function mqttDoConnect() {
  if (!mqttClient) return;
  mqttClient.connect({
    useSSL: true,
    keepAliveInterval: 30,
    cleanSession: true,
    timeout: 10,
    onSuccess: () => {
      console.log('MQTT Connected (Admin)');
      mqttReconnectDelay = 1000; // Reset backoff on success
      mqttClient.subscribe(MQTT_TOPIC_PREFIX + '/+');
      mqttClient.subscribe(MQTT_DEVICE_TOPIC_PREFIX + '/+');
    },
    onFailure: (err) => {
      console.warn('MQTT Connect Failed (Admin):', err.errorMessage || err);
      scheduleMqttReconnect();
    }
  });
}

function scheduleMqttReconnect() {
  if (mqttReconnectTimer) clearTimeout(mqttReconnectTimer);
  const delay = Math.min(mqttReconnectDelay, 30000);
  console.log('MQTT reconnecting in ' + delay + 'ms...');
  mqttReconnectTimer = setTimeout(() => {
    mqttReconnectDelay = Math.min(mqttReconnectDelay * 1.5, 30000);
    mqttDoConnect();
  }, delay);
}

function initMqtt() {
  if (typeof Paho === 'undefined') {
    console.warn('Paho MQTT library not loaded — retrying in 1s');
    setTimeout(initMqtt, 1000);
    return;
  }
  const clientId = 'admin_dashboard_' + Math.random().toString(16).substr(2, 8);
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, MQTT_PATH, clientId);

  mqttClient.onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.warn('MQTT Connection Lost:', responseObject.errorMessage);
      scheduleMqttReconnect();
    }
  };

  mqttClient.onMessageArrived = (message) => {
    try {
      const topic = message.destinationName;
      const payload = JSON.parse(message.payloadString);

      if (topic.startsWith(MQTT_TOPIC_PREFIX + '/')) {
        const riderId = topic.split('/').pop();
        loadState();
        
        let rDb = appState.riders.find(r => r.id === riderId);
        if (!rDb) {
          rDb = { id: riderId };
          appState.riders.push(rDb);
        }
        
        const oldStatus = rDb.status;

        Object.assign(rDb, payload);
        saveState();
        
        if (oldStatus !== 'alert' && rDb.status === 'alert') {
          showToast('🚨 CRITICAL ALERT', `${rDb.name} (${rDb.id}) · ${rDb.loc}`, 'error');
          if (map && rDb.lat && rDb.lon) {
            map.setView([rDb.lat, rDb.lon], 14);
            openInspectorDrawer(rDb.id);
          }
        } else if (oldStatus === 'alert' && rDb.status === 'active') {
          showToast('Alert Cleared', 'Rider marked safe. Transmissions shut.', 'success');
        }

        renderAll();
      } else if (topic.startsWith(MQTT_DEVICE_TOPIC_PREFIX + '/')) {
        const devId = topic.split('/').pop();
        loadState();
        let devObj = appState.devices.find(d => d.id === devId);
        if (!devObj) {
          devObj = { id: devId, ...payload };
          appState.devices.push(devObj);
        } else {
          Object.assign(devObj, payload);
        }
        saveState();
        renderAll();
      }
    } catch (e) {
      console.error('MQTT parse error:', e);
    }
  };

  mqttDoConnect();
}

function publishRiderState(rider) {
  if (mqttClient && mqttClient.isConnected()) {
    try {
      const topic = `${MQTT_TOPIC_PREFIX}/${rider.id}`;
      const payload = JSON.stringify({
        name: rider.name,
        status: rider.status,
        lat: rider.lat,
        lon: rider.lon,
        ping: rider.ping,
        loc: rider.loc,
        alerts: rider.alerts,
        device: rider.device,
        battery: rider.battery,
        signal: rider.signal,
        speed: rider.speed,
        emergency: rider.emergency
      });
      const message = new Paho.MQTT.Message(payload);
      message.destinationName = topic;
      message.retained = true;
      mqttClient.send(message);
    } catch (e) {
      console.error('MQTT publish error:', e);
      scheduleMqttReconnect();
    }
  }
}

function publishDeviceState(dev) {
  if (mqttClient && mqttClient.isConnected()) {
    try {
      const topic = `${MQTT_DEVICE_TOPIC_PREFIX}/${dev.id}`;
      const payload = JSON.stringify({
        rider: dev.rider,
        fw: dev.fw,
        batt: dev.batt,
        signal: dev.signal,
        seen: dev.seen,
        status: dev.status
      });
      const message = new Paho.MQTT.Message(payload);
      message.destinationName = topic;
      message.retained = true;
      mqttClient.send(message);
    } catch (e) {
      console.error('MQTT publish error:', e);
      scheduleMqttReconnect();
    }
  }
}

function loadState() {
  const data = localStorage.getItem(STATE_KEY);
  if (data) {
    try {
      appState = JSON.parse(data);
    } catch (e) {
      console.warn("Error parsing localStorage state, resetting...", e);
      appState = {
        riders: DEFAULT_RIDERS,
        devices: DEFAULT_DEVICES,
        history: DEFAULT_HISTORY,
        sms_logs: DEFAULT_SMS_LOGS,
        alerts: DEFAULT_ALERT_DATA,
        sys_logs: DEFAULT_SYSTEM_LOGS,
        version: 2
      };
      saveState();
      return;
    }
    
    // Automatically migrate/reset state if loading old version format (fixes cached "6 active" issues)
    if (!appState.version || appState.version < 2) {
      appState = {
        riders: DEFAULT_RIDERS,
        devices: DEFAULT_DEVICES,
        history: DEFAULT_HISTORY,
        sms_logs: DEFAULT_SMS_LOGS,
        alerts: DEFAULT_ALERT_DATA,
        sys_logs: DEFAULT_SYSTEM_LOGS,
        version: 2
      };
      saveState();
      return;
    }

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
        sys_logs: DEFAULT_SYSTEM_LOGS,
        version: 2
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
      sys_logs: DEFAULT_SYSTEM_LOGS,
      version: 2
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
      const numIdx = activeAlerts.length - 1;
      const latest = (numIdx >= 0) ? activeAlerts.find((_, i) => i === numIdx) : null;
      if (latest) {
        showToast('🚨 CRITICAL ALERT', `${latest.name} (${latest.id}) · ${latest.loc}`, 'error');
        // Center the map on active crash coordinate immediately
        if (map && latest.lat && latest.lon) {
          map.setView([latest.lat, latest.lon], 14);
          openInspectorDrawer(latest.id);
        }
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
  updateActiveFleetSession();
}

function updateActiveFleetSession() {
  const nameEl = document.getElementById('opsActiveRiderName');
  const countEl = document.getElementById('opsActiveConnectedCount');
  if (!nameEl && !countEl) return;

  const activeRiders = appState.riders.filter(r => r.status === 'active' || r.status === 'warning' || r.status === 'alert');
  
  if (nameEl) {
    if (activeRiders.length > 0) {
      nameEl.textContent = activeRiders.map(r => r.name).join(', ');
      nameEl.style.color = 'var(--green)';
    } else {
      nameEl.textContent = 'None';
      nameEl.style.color = 'var(--txt3)';
    }
  }
  
  if (countEl) {
    let connectedCount = 0;
    activeRiders.forEach(r => {
      const dev = appState.devices.find(d => d.rider.includes(r.id) && d.status !== 'offline');
      if (dev) {
        connectedCount++;
      }
    });
    countEl.textContent = `${connectedCount} connected`;
    if (connectedCount > 0) {
      countEl.style.color = 'var(--blue)';
    } else {
      countEl.style.color = 'var(--txt3)';
    }
  }
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

function setElementContentBySelector(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function renderFullRidersTable() {
  const table = document.getElementById('ridersFullTable');
  if (!table) return;

  table.innerHTML = '';
  appState.riders.forEach(r => {
    let s;
    switch (r.status) {
      case 'active':
        s = STATUS_MAP.active;
        break;
      case 'alert':
        s = STATUS_MAP.alert;
        break;
      case 'warning':
        s = STATUS_MAP.warning;
        break;
      case 'offline':
        s = STATUS_MAP.offline;
        break;
      default:
        s = STATUS_MAP.active;
    }

    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => openInspectorDrawer(r.id));

    const tdName = document.createElement('td');
    tdName.style.fontWeight = '600';
    tdName.style.color = 'var(--txt)';
    tdName.textContent = r.name;

    const tdId = document.createElement('td');
    const spanId = document.createElement('span');
    spanId.style.fontFamily = 'var(--mono)';
    spanId.style.fontSize = '.78rem';
    spanId.style.color = 'var(--txt3)';
    spanId.textContent = r.id;
    tdId.appendChild(spanId);

    const tdPhone = document.createElement('td');
    tdPhone.style.fontFamily = 'var(--mono)';
    tdPhone.style.fontSize = '.78rem';
    tdPhone.textContent = r.phone;

    const tdEmergency = document.createElement('td');
    tdEmergency.style.fontSize = '.8rem';
    tdEmergency.style.color = 'var(--txt2)';
    tdEmergency.textContent = r.emergency;

    const tdShift = document.createElement('td');
    tdShift.style.fontSize = '.78rem';
    tdShift.style.color = 'var(--txt3)';
    tdShift.textContent = r.shift;

    const tdAlerts = document.createElement('td');
    tdAlerts.style.textAlign = 'center';
    const spanAlerts = document.createElement('span');
    if (r.alerts > 0) {
      spanAlerts.className = 'badge badge-red';
      spanAlerts.textContent = r.alerts;
    } else {
      spanAlerts.className = 'badge badge-green';
      spanAlerts.textContent = '0';
    }
    tdAlerts.appendChild(spanAlerts);

    const tdStatus = document.createElement('td');
    const spanStatus = document.createElement('span');
    spanStatus.className = `badge ${s.cls}`;
    spanStatus.textContent = s.label;
    tdStatus.appendChild(spanStatus);

    tr.appendChild(tdName);
    tr.appendChild(tdId);
    tr.appendChild(tdPhone);
    tr.appendChild(tdEmergency);
    tr.appendChild(tdShift);
    tr.appendChild(tdAlerts);
    tr.appendChild(tdStatus);

    table.appendChild(tr);
  });
}

function renderHistoryTable() {
  const table = document.getElementById('historyTable');
  if (!table) return;

  table.innerHTML = '';
  appState.history.forEach(h => {
    const outcomeClass = (h.outcome.includes('Safe') || h.outcome.includes('Cancelled') || h.outcome.includes('False') || h.outcome.includes('Alarm') || h.outcome.includes('Rider')) ? 'badge-green' : h.outcome === 'Pending' ? 'badge-orange' : 'badge-red';
    const typeClass = h.type.includes('High') ? 'badge-red' : 'badge-orange';

    const tr = document.createElement('tr');

    const tdDt = document.createElement('td');
    const spanDt = document.createElement('span');
    spanDt.style.fontFamily = 'var(--mono)';
    spanDt.style.fontSize = '.75rem';
    spanDt.style.color = 'var(--txt3)';
    spanDt.textContent = h.dt;
    tdDt.appendChild(spanDt);

    const tdRider = document.createElement('td');
    tdRider.style.fontWeight = '600';
    tdRider.style.fontSize = '.85rem';
    tdRider.textContent = h.rider;

    const tdType = document.createElement('td');
    const spanType = document.createElement('span');
    spanType.className = `badge ${typeClass}`;
    spanType.textContent = h.type;
    tdType.appendChild(spanType);

    const tdLoc = document.createElement('td');
    tdLoc.style.fontSize = '.8rem';
    tdLoc.style.color = 'var(--txt2)';
    tdLoc.textContent = h.loc;

    const tdSms = document.createElement('td');
    const spanSms = document.createElement('span');
    spanSms.className = 'badge badge-green';
    spanSms.textContent = h.sms;
    tdSms.appendChild(spanSms);

    const tdOutcome = document.createElement('td');
    const spanOutcome = document.createElement('span');
    spanOutcome.className = `badge ${outcomeClass}`;
    spanOutcome.textContent = h.outcome;
    tdOutcome.appendChild(spanOutcome);

    tr.appendChild(tdDt);
    tr.appendChild(tdRider);
    tr.appendChild(tdType);
    tr.appendChild(tdLoc);
    tr.appendChild(tdSms);
    tr.appendChild(tdOutcome);

    table.appendChild(tr);
  });
}

function renderSmsLogsTable() {
  const table = document.getElementById('smsTable');
  if (!table) return;

  table.innerHTML = '';
  appState.sms_logs.forEach(s => {
    const tr = document.createElement('tr');

    const tdTime = document.createElement('td');
    const spanTime = document.createElement('span');
    spanTime.style.fontFamily = 'var(--mono)';
    spanTime.style.fontSize = '.75rem';
    spanTime.style.color = 'var(--txt3)';
    spanTime.textContent = s.time;
    tdTime.appendChild(spanTime);

    const tdRider = document.createElement('td');
    tdRider.style.fontWeight = '600';
    tdRider.style.fontSize = '.82rem';
    tdRider.textContent = s.rider.split(' ')[0];
    
    const tdRecipient = document.createElement('td');
    tdRecipient.style.fontSize = '.82rem';
    tdRecipient.style.color = 'var(--txt2)';
    tdRecipient.textContent = s.recipient;

    const tdType = document.createElement('td');
    const spanType = document.createElement('span');
    spanType.className = `badge ${s.type === 'SOS ALERT' ? 'badge-red' : 'badge-green'}`;
    spanType.textContent = s.type;
    tdType.appendChild(spanType);

    const tdMsg = document.createElement('td');
    tdMsg.style.fontSize = '.72rem';
    tdMsg.style.color = 'var(--txt2)';
    tdMsg.style.maxWidth = '180px';
    tdMsg.style.overflow = 'hidden';
    tdMsg.style.textOverflow = 'ellipsis';
    tdMsg.style.whiteSpace = 'nowrap';
    tdMsg.title = s.msg;
    tdMsg.textContent = s.msg;

    tr.appendChild(tdTime);
    tr.appendChild(tdRider);
    tr.appendChild(tdRecipient);
    tr.appendChild(tdType);
    tr.appendChild(tdMsg);

    table.appendChild(tr);
  });
}

function renderAlertStream() {
  const stream = document.getElementById('alertStream');
  if (!stream) return;

  const activeAlerts = appState.alerts.filter(a => {
    const rId = a.riderId;
    const rider = appState.riders.find(r => r.id === rId);
    return rider && (rider.status === 'alert' || rider.status === 'warning');
  });

  stream.innerHTML = '';
  if (activeAlerts.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.style.fontFamily = 'var(--mono)';
    emptyDiv.style.fontSize = '0.7rem';
    emptyDiv.style.color = 'var(--txt3)';
    emptyDiv.style.textAlign = 'center';
    emptyDiv.style.padding = '24px 0';
    emptyDiv.textContent = 'No active events reported.';
    stream.appendChild(emptyDiv);
    return;
  }

  activeAlerts.forEach(a => {
    const rId = a.riderId;
    const rider = appState.riders.find(r => r.id === rId);
    
    const isRed = rider ? (rider.status === 'alert') : a.cls.includes('red');
    const severityLabel = isRed ? '🚨 CRITICAL ALERT' : '⚠️ WARNING';
    const statusLabel = isRed ? 'SOS DISPATCHED' : 'AWAITING OVERRIDE';
    
    const smsLog = appState.sms_logs.find(s => s.rider.includes(rId));
    const smsState = smsLog ? smsLog.status : 'Delivered';

    const item = document.createElement('div');
    item.className = 'as-item';
    item.style.borderLeft = `3px solid ${isRed ? 'var(--red)' : 'var(--orange)'}`;
    item.style.background = 'rgba(255,255,255,0.015)';
    item.style.padding = '14px';
    item.style.borderRadius = '12px';
    item.style.marginBottom = '8px';
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.gap = '8px';
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => openInspectorDrawer(a.riderId));

    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.justifyContent = 'space-between';
    topRow.style.alignItems = 'center';

    const labelSpan = document.createElement('span');
    labelSpan.style.fontWeight = '800';
    labelSpan.style.fontSize = '0.75rem';
    labelSpan.style.color = isRed ? 'var(--red)' : 'var(--orange)';
    labelSpan.textContent = severityLabel;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'as-time';
    timeSpan.style.fontSize = '0.65rem';
    timeSpan.style.color = 'var(--txt3)';
    timeSpan.textContent = a.time;

    topRow.appendChild(labelSpan);
    topRow.appendChild(timeSpan);

    const title = document.createElement('div');
    title.style.fontSize = '0.85rem';
    title.style.fontWeight = '700';
    title.style.color = 'var(--txt)';
    title.textContent = `${rider ? rider.name : 'Unknown Rider'} (${rId})`;

    const devDetails = document.createElement('div');
    devDetails.style.fontSize = '0.75rem';
    devDetails.style.color = 'var(--txt2)';
    devDetails.textContent = 'Device ID: ';
    const devSpan = document.createElement('span');
    devSpan.style.fontFamily = 'monospace';
    devSpan.style.color = 'var(--blue)';
    devSpan.textContent = rider ? rider.device : '—';
    devDetails.appendChild(devSpan);

    const locDetails = document.createElement('div');
    locDetails.style.fontSize = '0.75rem';
    locDetails.style.color = 'var(--txt2)';
    locDetails.textContent = `Location: ${rider ? rider.loc : '—'} (${rider ? rider.lat : '—'}, ${rider ? rider.lon : '—'})`;

    const bottomRow = document.createElement('div');
    bottomRow.style.display = 'flex';
    bottomRow.style.justifyContent = 'space-between';
    bottomRow.style.alignItems = 'center';
    bottomRow.style.borderTop = '1px solid var(--border)';
    bottomRow.style.paddingTop = '8px';
    bottomRow.style.marginTop = '4px';

    const responseSpan = document.createElement('span');
    responseSpan.style.fontSize = '0.68rem';
    responseSpan.style.color = 'var(--txt3)';
    responseSpan.textContent = 'Response: ';
    const respStrong = document.createElement('strong');
    respStrong.style.color = isRed ? 'var(--red)' : 'var(--orange)';
    respStrong.textContent = statusLabel;
    responseSpan.appendChild(respStrong);

    const smsSpan = document.createElement('span');
    smsSpan.style.fontSize = '0.68rem';
    smsSpan.style.color = 'var(--txt3)';
    smsSpan.textContent = 'SMS: ';
    const smsStrong = document.createElement('strong');
    smsStrong.style.color = 'var(--green)';
    smsStrong.textContent = smsState;
    smsSpan.appendChild(smsStrong);

    bottomRow.appendChild(responseSpan);
    bottomRow.appendChild(smsSpan);

    item.appendChild(topRow);
    item.appendChild(title);
    item.appendChild(devDetails);
    item.appendChild(locDetails);
    item.appendChild(bottomRow);

    stream.appendChild(item);
  });
}

function openInspectorDrawer(riderId) {
  loadState();
  const r = appState.riders.find(rider => rider.id === riderId);
  if (!r) return;

  const drawer = document.getElementById('inspectorDrawer');
  if (!drawer) return;

  drawer.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'id-header';
  
  const title = document.createElement('div');
  title.className = 'id-title';
  title.textContent = r.name;
  
  const closeBtn = document.createElement('div');
  closeBtn.className = 'id-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', closeInspectorDrawer);
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  drawer.appendChild(header);

  function createRow(key, val, valStyle = {}) {
    const row = document.createElement('div');
    row.className = 'id-row';
    const keySpan = document.createElement('span');
    keySpan.className = 'id-key';
    keySpan.textContent = key;
    const valSpan = document.createElement('span');
    valSpan.className = 'id-val';
    valSpan.textContent = val;
    Object.assign(valSpan.style, valStyle);
    row.appendChild(keySpan);
    row.appendChild(valSpan);
    return row;
  }

  const registryGroup = document.createElement('div');
  registryGroup.style.display = 'flex';
  registryGroup.style.flexDirection = 'column';
  registryGroup.style.gap = '6px';

  const regTitle = document.createElement('div');
  regTitle.className = 'id-section-title';
  regTitle.textContent = 'Enrolled Registry';
  registryGroup.appendChild(regTitle);

  const regGrid = document.createElement('div');
  regGrid.className = 'id-grid';
  regGrid.appendChild(createRow('Rider ID', r.id, { color: 'var(--green)' }));
  regGrid.appendChild(createRow('Phone', r.phone));
  regGrid.appendChild(createRow('Shift', r.shift));
  regGrid.appendChild(createRow('Emergency', r.emergency, { fontSize: '0.7rem' }));
  registryGroup.appendChild(regGrid);
  
  drawer.appendChild(registryGroup);

  const telemetryGroup = document.createElement('div');
  telemetryGroup.style.display = 'flex';
  telemetryGroup.style.flexDirection = 'column';
  telemetryGroup.style.gap = '6px';

  const telTitle = document.createElement('div');
  telTitle.className = 'id-section-title';
  telTitle.textContent = 'Device Telemetry';
  telemetryGroup.appendChild(telTitle);

  const telGrid = document.createElement('div');
  telGrid.className = 'id-grid';
  telGrid.appendChild(createRow('Hardware ID', r.device, { color: 'var(--blue)' }));
  
  const battColor = r.battery < 20 ? 'var(--red)' : r.battery < 50 ? 'var(--yellow)' : 'var(--green)';
  telGrid.appendChild(createRow('Battery', `${r.battery}%`, { color: battColor }));
  telGrid.appendChild(createRow('Signal', r.signal));
  telGrid.appendChild(createRow('Velocity', `${r.speed} km/h`));
  telGrid.appendChild(createRow('Coordinates', `${r.lat}, ${r.lon}`, { fontSize: '0.7rem' }));
  telemetryGroup.appendChild(telGrid);

  drawer.appendChild(telemetryGroup);

  const spacer = document.createElement('div');
  spacer.style.flex = '1';
  drawer.appendChild(spacer);

  const actionsGroup = document.createElement('div');
  actionsGroup.style.display = 'flex';
  actionsGroup.style.flexDirection = 'column';
  actionsGroup.style.gap = '10px';

  if (r.status === 'alert' || r.status === 'warning') {
    const resolveBtn = document.createElement('button');
    resolveBtn.className = 'btn btn-green';
    resolveBtn.style.width = '100%';
    resolveBtn.style.justifyContent = 'center';
    resolveBtn.style.background = 'var(--green)';
    resolveBtn.style.color = '#05070a';
    resolveBtn.style.fontWeight = '700';
    resolveBtn.textContent = 'Resolve Alarm Status';
    resolveBtn.addEventListener('click', () => {
      resolveRiderAlert(r.id);
      closeInspectorDrawer();
    });
    actionsGroup.appendChild(resolveBtn);
  } else {
    const closeInspectorBtn = document.createElement('button');
    closeInspectorBtn.className = 'btn btn-outline';
    closeInspectorBtn.style.width = '100%';
    closeInspectorBtn.style.justifyContent = 'center';
    closeInspectorBtn.style.borderColor = 'var(--border)';
    closeInspectorBtn.textContent = 'Close Inspector';
    closeInspectorBtn.addEventListener('click', closeInspectorDrawer);
    actionsGroup.appendChild(closeInspectorBtn);
  }

  drawer.appendChild(actionsGroup);
  drawer.classList.add('open');
}

  drawer.classList.add('open');
}

function closeInspectorDrawer() {
  const drawer = document.getElementById('inspectorDrawer');
  if (drawer) drawer.classList.remove('open');
}

// ── LEAFLET GIS MAP DRIVER ────────────────────────────────────
let map = null;
const markers = new Map();

function initMap() {
  if (typeof L === 'undefined') return;
  if (map) return;
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

  // Force Leaflet recalculation on container resize / display toggle (resolves standard grey Leaflet rendering glitch)
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 100);

  try {
    const resizeObserver = new ResizeObserver(() => {
      if (map) map.invalidateSize();
    });
    resizeObserver.observe(mapElement);
  } catch (e) {
    console.warn("ResizeObserver not supported or failed to bind on liveMap:", e);
  }
}

function updateMapMarkers() {
  if (!map) return;

  const updatedRiderIds = new Set();

  appState.riders.forEach(r => {
    if (!r.lat || !r.lon) return;
    updatedRiderIds.add(r.id);

    let markerClass = 'marker-dot-active';
    if (r.status === 'alert') markerClass = 'marker-dot-alert';
    else if (r.status === 'warning') markerClass = 'marker-dot-warning';
    else if (r.status === 'offline') markerClass = 'marker-dot-offline';

    const iconHtml = `<div class="marker-dot ${markerClass}"></div>`;

    let marker = markers.get(r.id);
    if (marker) {
      marker.setLatLng([r.lat, r.lon]);
      const currentIcon = marker.options.icon;
      if (!currentIcon || currentIcon.options.html !== iconHtml) {
        marker.setIcon(L.divIcon({
          className: 'custom-map-marker',
          html: iconHtml,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        }));
      }
    } else {
      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: iconHtml,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      marker = L.marker([r.lat, r.lon], { icon }).addTo(map);
      marker.on('click', () => {
        map.panTo([r.lat, r.lon]);
        openInspectorDrawer(r.id);
      });
      markers.set(r.id, marker);
    }

    // Pan map to active high G crash incidents
    if (r.status === 'alert' && r.ping && typeof r.ping === 'string' && r.ping.includes('Just')) {
      map.setView([r.lat, r.lon], 13);
      openInspectorDrawer(r.id);
    }
  });

  // Clean up markers for offline/removed riders
  markers.forEach((marker, riderId) => {
    if (!updatedRiderIds.has(riderId)) {
      map.removeLayer(marker);
      markers.delete(riderId);
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
  publishRiderState(rider);
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

  const body = document.createElement('div');
  body.className = 'toast-body';

  const titleEl = document.createElement('div');
  titleEl.className = 'toast-title';
  titleEl.style.fontFamily = 'var(--mono)';
  titleEl.style.fontSize = '0.72rem';
  titleEl.style.textTransform = 'uppercase';
  titleEl.style.letterSpacing = '0.02em';
  titleEl.textContent = title;

  const msgEl = document.createElement('div');
  msgEl.className = 'toast-msg';
  msgEl.textContent = msg;

  body.appendChild(titleEl);
  body.appendChild(msgEl);

  const closeEl = document.createElement('div');
  closeEl.className = 'toast-close';
  closeEl.innerHTML = '&times;';
  closeEl.addEventListener('click', () => {
    toast.remove();
  });

  toast.appendChild(body);
  toast.appendChild(closeEl);
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

  select.innerHTML = '';
  
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.disabled = true;
  defaultOpt.selected = true;
  defaultOpt.textContent = 'Select a rider...';
  select.appendChild(defaultOpt);

  appState.riders.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.name} (${r.id})`;
    select.appendChild(opt);
  });
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
  publishRiderState(newRider);
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
  const devObj = appState.devices.find(d => d.id === devId);
  if (devObj) publishDeviceState(devObj);
  publishRiderState(rider);

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
    
    let titleText = pg;
    switch (pg) {
      case 'ops':
        titleText = 'Operational Operations Center';
        break;
      case 'directory':
        titleText = 'Fleet Directory Registry';
        break;
      case 'journal':
        titleText = 'SMS Transmission Log';
        break;
    }
    if (pageTitle) pageTitle.textContent = titleText;
    
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
  initMqtt();
  
  // Custom user session load
  const sessionUser = localStorage.getItem('ridesafe_session');
  if (sessionUser) {
    const user = JSON.parse(sessionUser);
    const sbUser = document.querySelector('.sb-user');
    if (sbUser) {
      sbUser.innerHTML = '';
      
      const avatar = document.createElement('div');
      avatar.className = 'sb-avatar';
      avatar.style.background = 'linear-gradient(135deg,#0ea5e9,#10b981)';
      avatar.style.color = '#05070a';
      avatar.style.fontWeight = '800';
      avatar.textContent = user.initials;
      
      const details = document.createElement('div');
      
      const nameEl = document.createElement('div');
      nameEl.style.fontSize = '.82rem';
      nameEl.style.fontWeight = '600';
      nameEl.style.color = 'var(--txt)';
      nameEl.textContent = user.name;
      
      const roleEl = document.createElement('div');
      roleEl.style.fontSize = '.7rem';
      roleEl.style.color = 'var(--txt3)';
      roleEl.textContent = `${user.role} · Mysore`;
      
      details.appendChild(nameEl);
      details.appendChild(roleEl);
      
      sbUser.appendChild(avatar);
      sbUser.appendChild(details);
    }
  }
  
  // Auto load map with safe polling
  let mapInitTimer = setInterval(() => {
    if (typeof L !== 'undefined') {
      clearInterval(mapInitTimer);
      initMap();
    }
  }, 50);
});
