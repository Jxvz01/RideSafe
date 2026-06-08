// ═══════════════════════════════════════════
// RIDESAFE RIDER COMPANION - ENGINE
// ═══════════════════════════════════════════

const STATE_KEY = 'ridesafe_state_mysore';

let appState = {
  riders: [],
  devices: [],
  history: [],
  sms_logs: [],
  alerts: [],
  sys_logs: []
};

// BLE state
let bluetoothDevice = null;
let statusCharacteristic = null;
let batteryCharacteristic = null;
let isScanning = false;
let isMockBLE = false;
let mockBleInterval = null;
let bleSignalStrength = '—';
let bleBatteryStatus = '—';
let bleLastSyncTime = 'Never';

// BLE Constants
const RIDESAFE_SERVICE_UUID = '4acc5500-eb40-4cf0-bee7-c3db1e08922c';
const RIDESAFE_CHAR_UUID = '4acc5501-eb40-4cf0-bee7-c3db1e08922c';
const BATTERY_SERVICE_UUID = 'battery_service';
const BATTERY_CHAR_UUID = 'battery_level';

// Local UI state
let activeRider = null;
let isConnected = false;
let isLocationEnabled = false;
let gpsWatcherId = null;
let currentCoords = { lat: 12.2958, lon: 76.6394 }; // Mysore Center
let routeSimInterval = null;
let countdownVal = 10;
let countdownTimer = null;
let alarmAudioInterval = null;
let simulationStep = 0; // 0: Idle, 1: Detected, 2: Countdown, 3: Location, 4: SOS, 5: SMS Delivered
let localActivities = [];
let localMap = null;
let localMarker = null;
let geofenceCircle = null;

// Oscilloscope state
let canvas = null;
let ctx = null;
let animationFrameId = null;
let pointsX = [];
let pointsY = [];
let pointsZ = [];
const maxPoints = 150;
let drawIndex = 0;
let isSpiking = false;
let spikeDecay = 0;
let streamInterval = null;
let streamVals = { ax: 0, ay: 9.81, az: 0 };

// Audio Context
let soundEnabled = true;
let audioCtx = null;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playCompanionChime(type) {
  if (!soundEnabled) return;
  try {
    initAudioContext();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        gain.gain.setValueAtTime(0.02, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.22);
      });
    } else if (type === 'alarm') {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(240, now);
      osc1.frequency.linearRampToValueAtTime(720, now + 0.25);
      osc1.frequency.linearRampToValueAtTime(240, now + 0.5);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(120, now);
      osc2.frequency.linearRampToValueAtTime(360, now + 0.25);
      osc2.frequency.linearRampToValueAtTime(120, now + 0.5);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } else if (type === 'warning') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(293.66, now + 0.15);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    console.warn('Audio contexts not allowed yet', e);
  }
}

function startAlarmSiren() {
  stopAlarmSiren();
  playCompanionChime('alarm');
  alarmAudioInterval = setInterval(() => {
    playCompanionChime('alarm');
  }, 500);
}

function stopAlarmSiren() {
  if (alarmAudioInterval) {
    clearInterval(alarmAudioInterval);
    alarmAudioInterval = null;
  }
}

function loadDbState() {
  const data = localStorage.getItem(STATE_KEY);
  if (data) {
    appState = JSON.parse(data);
  }
}

function saveDbState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(appState));
}

function logActivity(text, highlight = false) {
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  localActivities.unshift({ time, text, highlight });
  if (localActivities.length > 8) localActivities.pop();
  renderActivityLog();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('soundToggleBtn');
  if (btn) {
    btn.innerHTML = soundEnabled ? '🔊 Sound On' : '🔇 Muted';
    btn.classList.toggle('active', soundEnabled);
  }
  playCompanionChime('click');
}

// ── INITIALIZATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadDbState();
  initActiveRider();
  initEventListeners();
  initMapLeaflet();
  initOscilloscope();

  // Listen for state changes from Fleet Admin in other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STATE_KEY) {
      const oldAlertStatus = activeRider ? activeRider.status : 'active';
      loadDbState();
      
      if (activeRider) {
        const updatedRider = appState.riders.find(r => r.id === activeRider.id);
        if (updatedRider) {
          activeRider = updatedRider;
          
          // Re-sync alert state resolved externally
          if ((oldAlertStatus === 'alert' || oldAlertStatus === 'warning') && activeRider.status === 'active') {
            logActivity('Safety status resolved externally by Fleet Admin', true);
            cancelEmergencyWorkflow(false); 
          }
          
          renderAll();
        }
      }
    }
  });

  // Clock
  setInterval(() => {
    const timeEl = document.getElementById('statusBarTime');
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
  }, 1000);

  logActivity('Safety systems diagnostic online', true);
});

function initActiveRider() {
  const savedRiderId = localStorage.getItem('ridesafe_active_rider_id');
  let selected = null;

  if (savedRiderId && appState.riders.length > 0) {
    selected = appState.riders.find(r => r.id === savedRiderId);
  }

  if (!selected && appState.riders.length > 0) {
    selected = appState.riders.find(r => r.id === '#0924') || appState.riders[0];
  }

  if (selected) {
    activeRider = selected;
    localStorage.setItem('ridesafe_active_rider_id', activeRider.id);
  }

  populateRiderDropdown();
  renderAll();
}

function populateRiderDropdown() {
  const select = document.getElementById('riderProfileSelect');
  if (!select) return;

  select.innerHTML = '';
  appState.riders.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.name} (${r.id}) — ${r.device || 'Unlinked'}`;
    if (activeRider && r.id === activeRider.id) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

function changeRiderProfile(riderId) {
  loadDbState();
  const selected = appState.riders.find(r => r.id === riderId);
  if (selected) {
    activeRider = selected;
    localStorage.setItem('ridesafe_active_rider_id', activeRider.id);
    
    disconnectDevice();
    disableLocationServices();
    cancelEmergencyWorkflow(false);

    logActivity(`Loaded security session for ${activeRider.name}`, true);
    playCompanionChime('click');
    renderAll();
    
    if (localMap && activeRider.lat && activeRider.lon) {
      currentCoords = { lat: activeRider.lat, lon: activeRider.lon };
      localMap.setView([currentCoords.lat, currentCoords.lon], 15);
      if (localMarker) {
        localMarker.setLatLng([currentCoords.lat, currentCoords.lon]);
      }
      if (geofenceCircle) {
        geofenceCircle.setLatLng([currentCoords.lat, currentCoords.lon]);
      }
    }
  }
}

// ── LEAFLET MAP DRIVER ────────────────────────────────────────
function initMapLeaflet() {
  const mapEl = document.getElementById('companionMap');
  if (!mapEl) return;

  if (activeRider && activeRider.lat) {
    currentCoords = { lat: activeRider.lat, lon: activeRider.lon };
  }

  localMap = L.map('companionMap', {
    zoomControl: false,
    attributionControl: false
  }).setView([currentCoords.lat, currentCoords.lon], 15);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18
  }).addTo(localMap);

  // Glowing beacon
  const iconHtml = `<div class="marker-dot marker-dot-active" style="background:var(--comp-success); width:14px; height:14px;"><div class="sonar-ring sonar-active" style="background:rgba(72,213,151,0.45)"></div></div>`;
  const customIcon = L.divIcon({
    className: 'companion-map-marker',
    html: iconHtml,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  localMarker = L.marker([currentCoords.lat, currentCoords.lon], { icon: customIcon }).addTo(localMap);
  
  // Mysore Grid geofence boundary circle (400m radius)
  geofenceCircle = L.circle([currentCoords.lat, currentCoords.lon], {
    color: 'rgba(231, 185, 76, 0.15)',
    fillColor: 'rgba(231, 185, 76, 0.02)',
    fillOpacity: 0.3,
    radius: 400,
    weight: 1
  }).addTo(localMap);

  localMap.on('click', (e) => {
    if (!isLocationEnabled) {
      logActivity('Uplink error: Geolocation services are offline');
      return;
    }
    updateGPSPosition(e.latlng.lat, e.latlng.lng, 4);
    logActivity(`GPS anchor point set to: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
    playCompanionChime('click');
  });
}

// ── BLUETOOTH pairing SIMULATOR & WEB BLUETOOTH ──────────────
function scanForDevice() {
  if (isConnected || isScanning) return;
  
  playCompanionChime('click');
  isScanning = true;
  renderAll();
  logActivity('Scanning for RideSafe BLE Beacons...');

  if (navigator.bluetooth) {
    navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: 'RideSafe' },
        { namePrefix: 'ESP32' }
      ],
      optionalServices: [RIDESAFE_SERVICE_UUID, BATTERY_SERVICE_UUID]
    })
    .then(device => {
      bluetoothDevice = device;
      isMockBLE = false;
      isScanning = false;
      logActivity(`BLE Beacon Found: ${device.name}. Ready to connect.`, true);
      playCompanionChime('success');
      
      if (activeRider) {
        loadDbState();
        const rDb = appState.riders.find(r => r.id === activeRider.id);
        if (rDb) {
          rDb.device = device.name;
          saveDbState();
          activeRider = rDb;
        }
      }
      renderAll();
    })
    .catch(err => {
      isScanning = false;
      logActivity(`BLE Scan cancelled or failed: ${err.message}`);
      renderAll();
    });
  } else {
    setTimeout(() => {
      isScanning = false;
      isMockBLE = true;
      bluetoothDevice = {
        name: 'RideSafe-ESP32-RS001',
        id: 'mock-ble-id'
      };
      logActivity(`[FALLBACK] Web Bluetooth unsupported. Found Mock BLE: ${bluetoothDevice.name}`, true);
      playCompanionChime('success');
      
      if (activeRider) {
        loadDbState();
        const rDb = appState.riders.find(r => r.id === activeRider.id);
        if (rDb) {
          rDb.device = bluetoothDevice.name;
          saveDbState();
          activeRider = rDb;
        }
      }
      renderAll();
    }, 1500);
  }
}

function connectDevice() {
  if (isConnected) return;

  if (!bluetoothDevice) {
    logActivity('No device paired. Initializing BLE scan first...');
    scanForDevice();
    return;
  }

  playCompanionChime('click');
  logActivity(`Connecting to GATT server on ${bluetoothDevice.name}...`);

  if (isMockBLE) {
    setTimeout(() => {
      isConnected = true;
      logActivity(`[BLE CONNECTED] Paired with simulated ${bluetoothDevice.name}`, true);
      playCompanionChime('success');
      
      loadDbState();
      const ts = new Date().toLocaleTimeString('en-GB');
      appState.sys_logs.push({
        ts: ts,
        lvl: 'OK',
        msg: `[BLE CONNECTED] Linked with ${bluetoothDevice.name}`
      });
      let devObj = appState.devices.find(d => d.id === 'RS001' || d.rider.includes(activeRider.id));
      if (!devObj) {
        devObj = { id: 'RS001', rider: `${activeRider.name} ${activeRider.id}`, fw: 'v2.4.1', batt: '85%', signal: '-58dBm', seen: 'Just now', status: 'active' };
        appState.devices.push(devObj);
      } else {
        devObj.seen = 'Just now';
        devObj.status = 'active';
      }
      saveDbState();

      bleSignalStrength = '-58 dBm';
      bleBatteryStatus = '85%';
      bleLastSyncTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

      startMockTelemetryInterval();
      renderAll();
    }, 1200);
  } else {
    bluetoothDevice.addEventListener('gattserverdisconnected', onBleDisconnected);

    bluetoothDevice.gatt.connect()
    .then(server => {
      logActivity('GATT server connected. Discovering services...');
      return server.getPrimaryServices();
    })
    .then(services => {
      let statusPromise = null;
      let batteryPromise = null;

      services.forEach(service => {
        if (service.uuid === RIDESAFE_SERVICE_UUID) {
          statusPromise = service.getCharacteristic(RIDESAFE_CHAR_UUID)
            .then(char => {
              statusCharacteristic = char;
              return char.startNotifications().then(() => {
                char.addEventListener('characteristicvaluechanged', handleBleStatusNotification);
                logActivity('Subscribed to RideSafe status notifications.');
              });
            });
        }
        if (service.uuid === '0000180f-0000-1000-8000-00805f9b34fb' || service.uuid === BATTERY_SERVICE_UUID) {
          batteryPromise = service.getCharacteristic('00002a19-0000-1000-8000-00805f9b34fb' || BATTERY_CHAR_UUID)
            .then(char => {
              batteryCharacteristic = char;
              return char.readValue().then(val => {
                const batt = val.getUint8(0);
                bleBatteryStatus = `${batt}%`;
                return char.startNotifications()
                  .then(() => char.addEventListener('characteristicvaluechanged', handleBatteryNotification))
                  .catch(() => {});
              });
            });
        }
      });

      return Promise.all([statusPromise, batteryPromise]);
    })
    .then(() => {
      isConnected = true;
      logActivity(`[BLE CONNECTED] Paired with ${bluetoothDevice.name} successfully`, true);
      playCompanionChime('success');

      bleLastSyncTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
      bleSignalStrength = '-62 dBm';

      loadDbState();
      const ts = new Date().toLocaleTimeString('en-GB');
      appState.sys_logs.push({
        ts: ts,
        lvl: 'OK',
        msg: `[BLE CONNECTED] Linked with ${bluetoothDevice.name}`
      });
      saveDbState();
      
      renderAll();
    })
    .catch(err => {
      logActivity(`BLE Connection failed: ${err.message}`);
    });
  }
}

function disconnectDevice() {
  if (!isConnected) return;

  playCompanionChime('click');
  
  if (isMockBLE) {
    isConnected = false;
    stopMockTelemetryInterval();
    logActivity('BLE connection closed');
    playCompanionChime('warning');
    
    loadDbState();
    const ts = new Date().toLocaleTimeString('en-GB');
    appState.sys_logs.push({
      ts: ts,
      lvl: 'INFO',
      msg: `[BLE DISCONNECTED] Unlinked simulated device`
    });
    saveDbState();
    
    renderAll();
  } else {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect();
    }
  }
}

function onBleDisconnected(event) {
  isConnected = false;
  logActivity(`[BLE DISCONNECTED] Connection lost with ${event.target.name}. Reconnecting in 3s...`, true);
  playCompanionChime('warning');

  loadDbState();
  const ts = new Date().toLocaleTimeString('en-GB');
  appState.sys_logs.push({
    ts: ts,
    lvl: 'WARN',
    msg: `[BLE DISCONNECTED] Lost connection with ${event.target.name}`
  });
  saveDbState();

  renderAll();

  setTimeout(() => {
    if (bluetoothDevice && !isConnected) {
      logActivity(`Auto-reconnecting to BLE device: ${bluetoothDevice.name}...`);
      connectDevice();
    }
  }, 3000);
}

function handleBatteryNotification(event) {
  const batt = event.target.value.getUint8(0);
  bleBatteryStatus = `${batt}%`;
  renderAll();
}

function handleBleStatusNotification(event) {
  const decoder = new TextDecoder('utf-8');
  const rawData = decoder.decode(event.target.value);
  bleLastSyncTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  bleSignalStrength = `${-55 - Math.floor(Math.random() * 14)} dBm`;

  try {
    const payload = JSON.parse(rawData);
    processIncomingBlePayload(payload);
  } catch (err) {
    const cleanStr = rawData.trim().toLowerCase();
    if (['normal', 'warning', 'crash', 'safe'].includes(cleanStr)) {
      processIncomingBlePayload({ deviceId: bluetoothDevice.name, status: cleanStr });
    } else {
      console.warn('Unknown BLE raw message:', rawData);
    }
  }
}

function processIncomingBlePayload(payload) {
  const deviceId = payload.deviceId || 'RS001';
  const status = payload.status || 'normal';

  loadDbState();
  const ts = new Date().toLocaleTimeString('en-GB');
  const payloadStr = JSON.stringify(payload);
  
  appState.sys_logs.push({
    ts: ts,
    lvl: status === 'crash' ? 'ERROR' : status === 'warning' ? 'WARN' : 'OK',
    msg: `[BLE PAYLOAD] Received from ${deviceId}: ${payloadStr}`
  });
  
  let blePayloads = JSON.parse(localStorage.getItem('ridesafe_ble_payloads') || '[]');
  blePayloads.unshift({ ts, deviceId, status, raw: payloadStr });
  if (blePayloads.length > 15) blePayloads.pop();
  localStorage.setItem('ridesafe_ble_payloads', JSON.stringify(blePayloads));
  
  saveDbState();

  if (status === 'crash') {
    logActivity(`[CRASH DETECTED] BLE crash beacon event received from ${deviceId}!`, true);
    triggerBleAccident();
  } else if (status === 'safe') {
    logActivity(`[SAFE OVERRIDE] BLE safe status event received from ${deviceId}.`, true);
    cancelEmergencyWorkflow(true);
  } else if (status === 'warning') {
    logActivity(`[WARNING DETECTED] BLE warning state received from ${deviceId}.`);
    if (activeRider) {
      loadDbState();
      const rDb = appState.riders.find(r => r.id === activeRider.id);
      if (rDb) {
        rDb.status = 'warning';
        saveDbState();
        activeRider = rDb;
      }
      renderAll();
    }
  } else if (status === 'normal') {
    if (activeRider && activeRider.status !== 'active') {
      loadDbState();
      const rDb = appState.riders.find(r => r.id === activeRider.id);
      if (rDb && rDb.status !== 'alert') {
        rDb.status = 'active';
        saveDbState();
        activeRider = rDb;
      }
      renderAll();
    }
  }
}

function startMockTelemetryInterval() {
  stopMockTelemetryInterval();
  let battNum = 85;
  mockBleInterval = setInterval(() => {
    battNum -= (Math.random() > 0.8 ? 1 : 0);
    if (battNum < 10) battNum = 100;
    bleBatteryStatus = `${battNum}%`;
    bleSignalStrength = `${-55 - Math.floor(Math.random() * 12)} dBm`;
    bleLastSyncTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

    const heartbeatPayload = {
      deviceId: bluetoothDevice.name,
      status: activeRider ? (activeRider.status === 'alert' ? 'crash' : activeRider.status === 'warning' ? 'warning' : 'normal') : 'normal'
    };
    processIncomingBlePayload(heartbeatPayload);
    renderAll();
  }, 3000);
}

function stopMockTelemetryInterval() {
  if (mockBleInterval) {
    clearInterval(mockBleInterval);
    mockBleInterval = null;
  }
}

// ── GEOLOCATION INFRASTRUCTURE ────────────────────────────────
function toggleLocationServices() {
  if (isLocationEnabled) {
    disableLocationServices();
  } else {
    enableLocationServices();
  }
}

function enableLocationServices() {
  const btn = document.getElementById('enableLocationBtn');
  if (!btn) return;

  playCompanionChime('click');
  logActivity('Requesting high-accuracy GPS socket authorization...');

  if ('geolocation' in navigator) {
    gpsWatcherId = navigator.geolocation.watchPosition(
      (pos) => {
        isLocationEnabled = true;
        updateGPSPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      (err) => {
        console.warn('GPS hardware access denied, starting simulated path.', err);
        startSimulatedLocationTrack();
      },
      { enableHighAccuracy: true, maximumAge: 6000, timeout: 5000 }
    );
  } else {
    startSimulatedLocationTrack();
  }

  isLocationEnabled = true;
  btn.innerHTML = 'Disable GPS';
  btn.style.background = 'rgba(255,255,255,0.02)';
  btn.style.border = '1px solid var(--comp-border)';
  btn.style.color = 'var(--comp-txt)';
  
  logActivity('Continuous GPS mapping socket established', true);
  renderAll();
}

function disableLocationServices() {
  isLocationEnabled = false;
  
  if (gpsWatcherId) {
    navigator.geolocation.clearWatch(gpsWatcherId);
    gpsWatcherId = null;
  }
  
  if (routeSimInterval) {
    clearInterval(routeSimInterval);
    routeSimInterval = null;
  }

  const btn = document.getElementById('enableLocationBtn');
  if (btn) {
    btn.innerHTML = 'Enable Location';
    btn.style.background = 'var(--comp-accent)';
    btn.style.color = '#000';
    btn.style.border = 'none';
  }

  logActivity('GPS socket disconnected');
  playCompanionChime('warning');
  renderAll();
}

function updateGPSPosition(lat, lon, accuracy = 3) {
  currentCoords = { lat, lon };
  
  if (localMap) {
    localMap.setView([lat, lon], localMap.getZoom());
    if (localMarker) localMarker.setLatLng([lat, lon]);
    if (geofenceCircle) geofenceCircle.setLatLng([lat, lon]);
  }

  // Update DOM coords
  const coordsEl = document.getElementById('gpsCoordsText');
  const accuracyEl = document.getElementById('gpsAccuracyText');
  const syncEl = document.getElementById('gpsLastUpdatedText');

  if (coordsEl) coordsEl.textContent = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  if (accuracyEl) accuracyEl.textContent = `${accuracy.toFixed(0)}m (High Accuracy)`;
  if (syncEl) syncEl.textContent = 'Just now';

  const overlayCoordsEl = document.getElementById('emergencyCoordsDisplay');
  if (overlayCoordsEl) {
    overlayCoordsEl.textContent = `GPS Coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)} (±${accuracy.toFixed(0)}m)`;
  }

  // Sync to database
  loadDbState();
  const rDb = appState.riders.find(r => r.id === activeRider.id);
  if (rDb) {
    rDb.lat = Number(lat.toFixed(5));
    rDb.lon = Number(lon.toFixed(5));
    rDb.ping = 'Just now';
    rDb.loc = getLocAddressDescription(lat, lon);
    
    const timeStr = new Date().toLocaleTimeString('en-GB');
    appState.sys_logs.push({
      ts: timeStr,
      lvl: 'OK',
      msg: `[GPS UPDATED] Coords: ${rDb.lat}, ${rDb.lon} | Acc: ${accuracy.toFixed(0)}m`
    });
    
    saveDbState();
  }

  renderAll();
}

function getLocAddressDescription(lat, lon) {
  if (lat > 12.32) return 'Gokulam, Mysore';
  if (lat < 12.29) return 'Kuvempunagar, Mysore';
  if (lon > 76.64) return 'Mandi Mohalla, Mysore';
  if (lon < 76.62) return 'Vijayanagar, Mysore';
  return 'Saraswathipuram, Mysore';
}

function startSimulatedLocationTrack() {
  if (routeSimInterval) clearInterval(routeSimInterval);
  
  let lat = activeRider ? activeRider.lat : 12.3243;
  let lon = activeRider ? activeRider.lon : 76.6273;

  isLocationEnabled = true;
  updateGPSPosition(lat, lon, 8);

  routeSimInterval = setInterval(() => {
    lat += (Math.random() * 0.0006 - 0.0003);
    lon += (Math.random() * 0.0006 - 0.0003);
    
    // Boundary check
    if (lat < 12.2 || lat > 12.4) lat = 12.3243;
    if (lon < 76.5 || lon > 76.8) lon = 76.6273;

    updateGPSPosition(lat, lon, 4 + Math.random()*3);
  }, 4000);
}

// ── TELEMETRY CANVASES WAVE OSCILLOSCOPE ──────────────────────
function initOscilloscope() {
  canvas = document.getElementById('companionOscilloscope');
  if (!canvas) return;

  const parent = canvas.parentElement;
  canvas.width = parent.clientWidth;
  canvas.height = parent.clientHeight || 200;

  ctx = canvas.getContext('2d');

  for (let i = 0; i < maxPoints; i++) {
    pointsX.push(0);
    pointsY.push(0);
    pointsZ.push(0);
  }

  if (streamInterval) clearInterval(streamInterval);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  // Live telemetry loop
  streamInterval = setInterval(() => {
    let noise = () => (Math.random() * 0.3 - 0.15);
    
    if (isSpiking) {
      streamVals.ax = (-8.2 + Math.random() * 16).toFixed(2);
      streamVals.ay = (19.4 + Math.random() * 8).toFixed(2);
      streamVals.az = (-4.8 + Math.random() * 10).toFixed(2);
    } else if (isConnected) {
      streamVals.ax = (noise()).toFixed(2);
      streamVals.ay = (9.81 + noise() * 0.4).toFixed(2);
      streamVals.az = (noise()).toFixed(2);
    } else {
      streamVals.ax = '0.00';
      streamVals.ay = '0.00';
      streamVals.az = '0.00';
    }

    const axEl = document.getElementById('scopeValAX');
    const ayEl = document.getElementById('scopeValAY');
    const azEl = document.getElementById('scopeValAZ');

    if (axEl) axEl.textContent = `${streamVals.ax} g`;
    if (ayEl) ayEl.textContent = `${streamVals.ay} g`;
    if (azEl) azEl.textContent = `${streamVals.az} g`;
  }, 800);

  animateScope();
}

function animateScope() {
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
  ctx.lineWidth = 0.8;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw G threshold dash lines
  ctx.strokeStyle = 'rgba(255, 93, 93, 0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  [height * 0.3 - 22, height * 0.3 + 22, height * 0.5 - 30, height * 0.5 + 30].forEach(lineY => {
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(width, lineY);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // Shift buffer
  pointsX.shift();
  pointsY.shift();
  pointsZ.shift();

  let tx, ty, tz;
  if (isSpiking) {
    tx = Math.sin(drawIndex * 0.75) * 32 * spikeDecay + (Math.random() * 8 - 4) * spikeDecay;
    ty = Math.cos(drawIndex * 0.6) * 40 * spikeDecay + (Math.random() * 10 - 5) * spikeDecay;
    tz = Math.sin(drawIndex * 1.1) * 22 * spikeDecay + (Math.random() * 6 - 3) * spikeDecay;

    spikeDecay -= 0.006;
    if (spikeDecay <= 0) {
      spikeDecay = 0;
      isSpiking = false;
      logActivity('G-Force telemetry baseline restored');
    }
  } else if (isConnected) {
    tx = Math.sin(drawIndex * 0.12) * 1.8 + (Math.random() * 1.5 - 0.75);
    ty = Math.cos(drawIndex * 0.1) * 1.4 + (Math.random() * 1.5 - 0.75);
    tz = Math.sin(drawIndex * 0.15) * 0.8 + (Math.random() * 0.8 - 0.4);
  } else {
    tx = 0;
    ty = 0;
    tz = 0;
  }

  pointsX.push(tx);
  pointsY.push(ty);
  pointsZ.push(tz);

  drawIndex++;

  drawTelemetryLine(pointsX, '#00d4ff', height * 0.3); // AX
  drawTelemetryLine(pointsY, '#a78bfa', height * 0.5); // AY
  drawTelemetryLine(pointsZ, '#48d597', height * 0.7); // AZ

  // Labels
  ctx.font = '700 8px monospace';
  ctx.fillStyle = '#00d4ff';
  ctx.fillText('AX (ACCEL_X)', 12, height * 0.3 - 6);
  ctx.fillStyle = '#a78bfa';
  ctx.fillText('AY (ACCEL_Y)', 12, height * 0.5 - 6);
  ctx.fillStyle = '#48d597';
  ctx.fillText('AZ (ACCEL_Z)', 12, height * 0.7 - 6);

  animationFrameId = requestAnimationFrame(animateScope);
}

function drawTelemetryLine(points, color, midY) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  
  const step = canvas.width / (maxPoints - 1);
  points.forEach((val, i) => {
    const x = i * step;
    const y = midY + val;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.globalAlpha = 1.0;
}

// ── EMERGENCY CONTACTS CRUD ──────────────────────────────────
function getContactsKey() {
  return `ridesafe_contacts_list_${activeRider.id}`;
}

function loadEmergencyContacts() {
  const data = localStorage.getItem(getContactsKey());
  if (data) return JSON.parse(data);

  const defaultList = [];
  if (activeRider && activeRider.emergency) {
    const text = activeRider.emergency;
    const relMatch = text.match(/([^(]+)\(([^)]+)\)/);
    if (relMatch) {
      defaultList.push({
        name: relMatch[1].trim(),
        relationship: relMatch[2].trim(),
        phone: activeRider.phone ? activeRider.phone.replace(/.$/, '8') : '9944000988',
        priority: 'primary'
      });
    } else {
      defaultList.push({
        name: text,
        relationship: 'Contact',
        phone: '9944000988',
        priority: 'primary'
      });
    }
  }
  return defaultList;
}

function saveEmergencyContacts(list) {
  localStorage.setItem(getContactsKey(), JSON.stringify(list));
  if (activeRider) {
    loadDbState();
    const rDb = appState.riders.find(r => r.id === activeRider.id);
    if (rDb) {
      if (list.length > 0) {
        const sorted = [...list].sort((a,b) => (a.priority === 'primary' ? -1 : 1));
        const pri = sorted[0];
        rDb.emergency = `${pri.name} (${pri.relationship})`;
      } else {
        rDb.emergency = 'No Registered Contacts';
      }
      saveDbState();
      activeRider = rDb;
    }
  }
}

function openAddContactModal() {
  const list = loadEmergencyContacts();
  if (list.length >= 3) {
    logActivity('Uplink failed: Priority index cap exceeded (max 3)');
    return;
  }
  playCompanionChime('click');
  document.getElementById('contactModalOverlay').classList.add('show');
}

function closeAddContactModal() {
  document.getElementById('contactModalOverlay').classList.remove('show');
  document.getElementById('contactForm').reset();
}

function submitAddContactForm(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const rel = document.getElementById('contactRel').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const pri = document.getElementById('contactPriority').value;

  if (!name || !rel || !phone) return;

  const list = loadEmergencyContacts();
  if (pri === 'primary') {
    list.forEach(c => c.priority = 'secondary');
  }
  list.push({ name, relationship: rel, phone, priority: pri });
  saveEmergencyContacts(list);
  closeAddContactModal();

  logActivity(`Emergency dispatch routing added: ${name}`);
  playCompanionChime('success');
  renderAll();
}

function deleteEmergencyContact(idx) {
  playCompanionChime('click');
  const list = loadEmergencyContacts();
  const deleted = list[idx];
  list.splice(idx, 1);

  if (deleted.priority === 'primary' && list.length > 0) {
    list[0].priority = 'primary';
  }

  saveEmergencyContacts(list);
  logActivity(`Removed emergency contact: ${deleted.name}`);
  renderAll();
}

function renderEmergencyContactsUI() {
  const container = document.getElementById('emergencyContactsList');
  if (!container) return;

  const list = loadEmergencyContacts();
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column:span 3; font-size:0.75rem; color:var(--comp-muted); text-align:center; padding:20px 0;">No priority emergency contacts registered.</div>`;
    const iconEl = document.getElementById('heroMiniContacts');
    if (iconEl) {
      iconEl.textContent = 'None Ready';
      iconEl.style.color = 'var(--comp-danger)';
    }
    return;
  }

  list.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = 'contact-card-item';

    card.innerHTML = `
      <div class="contact-card-top">
        <span class="contact-p-badge" style="${c.priority === 'primary' ? 'background:rgba(72,213,151,0.08); border-color:rgba(72,213,151,0.2); color:var(--comp-success);' : ''}">${c.priority}</span>
        <button class="btn-delete-contact" onclick="deleteEmergencyContact(${idx})" style="background:none; border:none; color:var(--comp-danger); cursor:pointer; font-size:1.1rem; opacity:0.6; transition:0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">×</button>
      </div>
      <div class="contact-card-bottom">
        <h5>${c.name}</h5>
        <p>${c.relationship} · <span style="font-family:monospace">${c.phone}</span></p>
      </div>
    `;
    container.appendChild(card);
  });

  const iconEl = document.getElementById('heroMiniContacts');
  if (iconEl) {
    iconEl.textContent = `${list.length} Priority Contact${list.length > 1 ? 's' : ''}`;
    iconEl.style.color = 'var(--comp-success)';
  }
}

// ── EMERGENCY SOS SIGNAL COUNTDOWN ───────────────────────────
function triggerSimulatedAccident() {
  if (!isConnected) {
    logActivity('Exception block: Pair device to activate diagnostics');
    return;
  }
  
  playCompanionChime('click');
  logActivity('⚡ Test SOS Beacon clicked: Simulating BLE crash payload...');

  const crashPayload = {
    deviceId: bluetoothDevice ? bluetoothDevice.name : 'RS001',
    status: 'crash'
  };
  processIncomingBlePayload(crashPayload);
}

function triggerBleAccident() {
  playCompanionChime('click');
  logActivity('⚡ ACCELEROMETER CRITICAL: High-G impact signature received via BLE!', true);

  isSpiking = true;
  spikeDecay = 1.0;

  // Reset and display overlay
  const overlay = document.getElementById('emergencyOverlay');
  if (overlay) overlay.classList.add('show');
  
  const headline = document.getElementById('emergencyOverlayHeadline');
  if (headline) headline.textContent = 'Possible Incident Detected';
  const timerWrap = document.getElementById('emergencyTimerWrapper');
  if (timerWrap) timerWrap.style.display = 'flex';
  const subtitle = document.getElementById('emergencyOverlaySubtitle');
  if (subtitle) {
    subtitle.innerHTML = 'The RideSafe IoT sensors have registered a critical impact signature.';
  }
  const actionGroup = document.getElementById('emergencyOverlayActions');
  if (actionGroup) {
    actionGroup.innerHTML = `
      <button class="btn-emergency-cancel" onclick="riderConfirmSafe()">I'm Safe (Cancel Alert)</button>
      <button class="btn-emergency-confirm" onclick="triggerSOSImmediately()">Trigger SOS Now</button>
    `;
  }

  startAlarmSiren();

  simulationStep = 1;
  updateWorkflowTimeline();

  countdownVal = 10;
  updateCountdownTimerUI();

  // Retrieve smartphone GPS coordinates
  if (!isLocationEnabled) {
    enableLocationServices();
  } else {
    const overlayCoordsEl = document.getElementById('emergencyCoordsDisplay');
    if (overlayCoordsEl && currentCoords) {
      overlayCoordsEl.textContent = `GPS Coordinates: ${currentCoords.lat.toFixed(5)}, ${currentCoords.lon.toFixed(5)}`;
    }
  }

  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdownVal--;
    updateCountdownTimerUI();

    if (countdownVal === 1) {
      simulationStep = 3; // Location Retrieved
      updateWorkflowTimeline();
    }

    if (countdownVal <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      dispatchSOSAlert();
    }
  }, 1000);

  updateSafetyHeroVisuals('emergency');
}

function updateCountdownTimerUI() {
  const numEl = document.getElementById('countdownNumber');
  const fillEl = document.getElementById('countdownFill');
  if (numEl) numEl.textContent = countdownVal;
  
  if (fillEl) {
    const maxDash = 440;
    const offset = maxDash - (maxDash * (countdownVal / 10));
    fillEl.style.strokeDashoffset = offset;
  }
}

function riderConfirmSafe() {
  playCompanionChime('click');
  cancelEmergencyWorkflow(true);
}

function cancelEmergencyWorkflow(updateDb = true) {
  document.getElementById('emergencyOverlay').classList.remove('show');
  stopAlarmSiren();

  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  simulationStep = 0;
  updateWorkflowTimeline();

  logActivity('🛡️ Protection active: Safe confirmation override authenticated');
  playCompanionChime('success');

  if (updateDb && activeRider) {
    loadDbState();
    const rDb = appState.riders.find(r => r.id === activeRider.id);
    if (rDb) {
      const wasAlert = rDb.status === 'alert' || rDb.status === 'warning';
      rDb.status = 'active';
      rDb.alerts = 0;

      if (wasAlert) {
        const timeStr = new Date().toLocaleTimeString('en-GB');
        const dateStr = new Date().toISOString().split('T')[0] + ' ' + timeStr.substring(0, 5);

        appState.history.unshift({
          dt: dateStr,
          rider: `${rDb.name} ${rDb.id}`,
          type: 'G-Force Limit',
          loc: rDb.loc || 'Saraswathipuram, Mysore',
          sms: 'Delivered',
          outcome: 'False Alarm'
        });

        const contacts = loadEmergencyContacts();
        const priName = contacts.length > 0 ? contacts[0].name : 'Contacts';

        appState.sms_logs.unshift({
          time: timeStr,
          rider: `${rDb.name} ${rDb.id}`,
          recipient: priName,
          type: 'SAFE',
          status: 'Delivered',
          msg: `UPDATE: ${rDb.name} marked safe. Operational emergency reset.`
        });

        appState.sys_logs.push({
          ts: timeStr,
          lvl: 'OK',
          msg: `[FLEET SYNCED] Accident countdown cancelled by rider ${rDb.id} using manual override. False Alarm logged.`
        });
      }
      saveDbState();
      activeRider = rDb;
    }
  }

  updateSafetyHeroVisuals('protected');
  renderAll();
}

function triggerSOSImmediately() {
  playCompanionChime('click');
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  dispatchSOSAlert();
}

function dispatchSOSAlert() {
  stopAlarmSiren();
  simulationStep = 4; // SOS Generated
  updateWorkflowTimeline();
  logActivity('🚨 DISPATCH: Broadcast payload sent to Mysore Operations Center...');

  setTimeout(() => {
    simulationStep = 5; // SMS Delivered
    updateWorkflowTimeline();
    logActivity('📲 SMS payload transmitted to priority emergency contacts.', true);

    if (activeRider) {
      loadDbState();
      const rDb = appState.riders.find(r => r.id === activeRider.id);
      if (rDb) {
        rDb.status = 'alert';
        rDb.alerts = (rDb.alerts || 0) + 1;
        rDb.ping = 'Just now';

        const timeStr = new Date().toLocaleTimeString('en-GB');
        const contacts = loadEmergencyContacts();
        const pri = contacts.length > 0 ? contacts[0] : { name: 'Emergency Contacts', phone: '9944000988' };

        appState.sms_logs.unshift({
          time: timeStr,
          rider: `${rDb.name} ${rDb.id}`,
          recipient: pri.name,
          type: 'SOS ALERT',
          status: 'Delivered',
          msg: `EMERGENCY: ${rDb.name} crashed near ${rDb.loc}. GPS: maps.google.com/?q=${currentCoords.lat.toFixed(5)},${currentCoords.lon.toFixed(5)}`
        });

        appState.alerts.unshift({
          time: timeStr.substring(0, 5),
          riderId: rDb.id,
          cls: 'badge-red',
          title: `🚨 CRITICAL: Crash detection trigger — ${rDb.name} ${rDb.id}`,
          detail: `${rDb.loc} · SMS Broadcast active · G-Peak: 4.8G`
        });

        appState.sys_logs.push({
          ts: timeStr,
          lvl: 'ERROR',
          msg: `[SOS GENERATED] Crash incident triggered — device ${rDb.device} assigned to ${rDb.name} (${rDb.id}).`
        });

        saveDbState();
        activeRider = rDb;
      }
    }

    const headline = document.getElementById('emergencyOverlayHeadline');
    const timerWrap = document.getElementById('emergencyTimerWrapper');
    const subtitle = document.getElementById('emergencyOverlaySubtitle');
    const actionGroup = document.getElementById('emergencyOverlayActions');

    if (headline) headline.textContent = 'SOS DISPATCHED';
    if (timerWrap) timerWrap.style.display = 'none';
    if (subtitle) {
      subtitle.innerHTML = `<span style="color:var(--comp-success); font-weight:700;">BROADCAST SOCKET ACTIVE</span><br>GPS telemetry packets sent to Fleet Admin. Local emergency contacts notified.`;
    }
    if (actionGroup) {
      actionGroup.innerHTML = `<button class="btn-emergency-cancel" onclick="riderConfirmSafe()" style="width:100%;">I'M SAFE (RESOLVE ALARM)</button>`;
    }

    updateSafetyHeroVisuals('emergency');
    renderAll();
  }, 1000);
}

function updateWorkflowTimeline() {
  const steps = document.querySelectorAll('.timeline-step-node');
  steps.forEach((node, idx) => {
    const num = idx + 1;
    if (num <= simulationStep) {
      node.classList.add('active');
      const circle = node.querySelector('.timeline-circle');
      if (circle) circle.textContent = '✓';
    } else {
      node.classList.remove('active');
      const circle = node.querySelector('.timeline-circle');
      if (circle) circle.textContent = num;
    }
  });
}

// ── RENDER ENGINE ─────────────────────────────────────────────
function renderAll() {
  if (!activeRider) return;

  renderAccountInfo();
  renderEmergencyContactsUI();
  renderDeviceSection();
  renderActivityLog();
  updateSafetyHeroVisuals(activeRider.status === 'alert' ? 'emergency' : activeRider.status === 'warning' ? 'warning' : 'protected');
}

function renderAccountInfo() {
  const nameEl = document.getElementById('infoRiderName');
  const idEl = document.getElementById('infoRiderId');
  const bikeEl = document.getElementById('infoAssignedBike');
  const contactEl = document.getElementById('infoContactNumber');
  const fleetEl = document.getElementById('infoFleetName');

  if (nameEl) nameEl.textContent = activeRider.name;
  if (idEl) idEl.textContent = activeRider.id;
  if (contactEl) contactEl.textContent = activeRider.phone;
  if (bikeEl) bikeEl.textContent = `KA-09-EW-${activeRider.id.replace('#', '')}`;
  if (fleetEl) fleetEl.textContent = activeRider.shift === 'Off' ? 'MySQL Standby' : 'Zepto Mysore West';
}

function renderDeviceSection() {
  const devIdEl = document.getElementById('companionDeviceId');
  const devStatusEl = document.getElementById('companionDeviceStatus');
  const devSignalEl = document.getElementById('companionDeviceSignal');
  const devBatteryEl = document.getElementById('companionDeviceBattery');
  const devLastSyncEl = document.getElementById('companionDeviceLastSync');
  const devMsgEl = document.getElementById('companionDeviceAlertMsg');

  const scanBtn = document.getElementById('scanDeviceBtn');
  const connectBtn = document.getElementById('connectDeviceBtn');
  const disconnectBtn = document.getElementById('disconnectDeviceBtn');

  const heroMiniDev = document.getElementById('heroMiniDevice');
  const heroMiniBatt = document.getElementById('heroMiniBattery');

  // Disable/enable buttons appropriately based on scanning and connection status
  if (isScanning) {
    if (scanBtn) { scanBtn.disabled = true; scanBtn.textContent = 'Scanning...'; }
    if (connectBtn) { connectBtn.disabled = true; }
    if (disconnectBtn) { disconnectBtn.disabled = true; }
  } else if (isConnected) {
    if (scanBtn) { scanBtn.disabled = true; }
    if (connectBtn) { connectBtn.disabled = true; connectBtn.textContent = 'Connect Device'; }
    if (disconnectBtn) { disconnectBtn.disabled = false; }
  } else {
    if (scanBtn) { scanBtn.disabled = false; scanBtn.textContent = 'Scan For Device'; }
    if (connectBtn) {
      connectBtn.disabled = !bluetoothDevice;
      connectBtn.textContent = 'Connect Device';
    }
    if (disconnectBtn) { disconnectBtn.disabled = true; }
  }

  if (isConnected) {
    if (devIdEl) devIdEl.textContent = (bluetoothDevice && bluetoothDevice.name) ? bluetoothDevice.name : (activeRider.device || 'RSM-201');
    if (devStatusEl) {
      devStatusEl.textContent = 'Connected';
      devStatusEl.style.color = 'var(--comp-success)';
    }
    if (devSignalEl) devSignalEl.textContent = bleSignalStrength;
    if (devBatteryEl) {
      devBatteryEl.textContent = bleBatteryStatus;
      devBatteryEl.style.color = 'var(--comp-success)';
    }
    if (devLastSyncEl) devLastSyncEl.textContent = bleLastSyncTime;
    if (devMsgEl) {
      devMsgEl.style.display = 'block';
      devMsgEl.textContent = 'Device connected & actively monitoring.';
    }

    if (heroMiniDev) {
      heroMiniDev.textContent = (bluetoothDevice && bluetoothDevice.name) ? bluetoothDevice.name : (activeRider.device || 'RSM-201');
      heroMiniDev.style.color = 'var(--comp-success)';
    }
    if (heroMiniBatt) {
      heroMiniBatt.textContent = bleBatteryStatus;
    }
  } else {
    if (devIdEl) devIdEl.textContent = bluetoothDevice ? bluetoothDevice.name : 'No hardware paired';
    if (devStatusEl) {
      devStatusEl.textContent = bluetoothDevice ? 'Ready to Connect' : 'Disconnected';
      devStatusEl.style.color = bluetoothDevice ? 'var(--comp-accent)' : 'var(--comp-danger)';
    }
    if (devSignalEl) devSignalEl.textContent = '—';
    if (devBatteryEl) {
      devBatteryEl.textContent = '—';
      devBatteryEl.style.color = '';
    }
    if (devLastSyncEl) devLastSyncEl.textContent = bleLastSyncTime || 'Never';
    if (devMsgEl) devMsgEl.style.display = 'none';

    if (heroMiniDev) {
      heroMiniDev.textContent = 'Unpaired';
      heroMiniDev.style.color = 'var(--comp-danger)';
    }
    if (heroMiniBatt) {
      heroMiniBatt.textContent = '—';
    }
  }
}

function updateSafetyHeroVisuals(state) {
  const outer = document.getElementById('statusHeroRing');
  const label = document.getElementById('statusHeroLabel');
  const desc = document.getElementById('statusHeroDesc');

  if (!outer) return;
  outer.className = 'status-circle-outer';

  if (state === 'emergency') {
    outer.classList.add('state-emergency');
    if (label) label.textContent = 'SOS Active';
    if (desc) desc.textContent = 'Alerting operations dispatcher';
    label.style.color = 'var(--comp-danger)';
  } else if (state === 'warning') {
    outer.classList.add('state-warning');
    if (label) label.textContent = 'Warning';
    if (desc) desc.textContent = 'G-Force vector deviation';
    label.style.color = '#f97316';
  } else if (isConnected && isLocationEnabled) {
    outer.classList.add('state-protected');
    if (label) label.textContent = 'Protected';
    if (desc) desc.textContent = 'Safety system armed';
    label.style.color = 'var(--comp-success)';
  } else {
    outer.classList.add('state-monitoring');
    if (label) label.textContent = 'Monitoring';
    if (desc) desc.textContent = 'Sensors waiting for BLE link';
    label.style.color = 'var(--comp-accent)';
  }
}

function renderActivityLog() {
  const container = document.getElementById('recentActivityTimeline');
  if (!container) return;

  container.innerHTML = '';
  if (localActivities.length === 0) {
    container.innerHTML = `<div style="font-size:0.7rem; color:var(--comp-muted); padding:8px 0;">No activities logged. Pair device to begin.</div>`;
    return;
  }

  localActivities.forEach(act => {
    const item = document.createElement('div');
    item.className = act.highlight ? 'activity-item highlight' : 'activity-item';
    item.innerHTML = `
      <div class="activity-item-time">${act.time}</div>
      <div class="activity-item-text">${act.text}</div>
    `;
    container.appendChild(item);
  });
}

function initEventListeners() {
  const profileSelect = document.getElementById('riderProfileSelect');
  if (profileSelect) {
    profileSelect.addEventListener('change', (e) => changeRiderProfile(e.target.value));
  }

  const scanBtn = document.getElementById('scanDeviceBtn');
  if (scanBtn) scanBtn.addEventListener('click', scanForDevice);

  const connectBtn = document.getElementById('connectDeviceBtn');
  if (connectBtn) connectBtn.addEventListener('click', connectDevice);

  const disconnectBtn = document.getElementById('disconnectDeviceBtn');
  if (disconnectBtn) disconnectBtn.addEventListener('click', disconnectDevice);

  const locationBtn = document.getElementById('enableLocationBtn');
  if (locationBtn) locationBtn.addEventListener('click', toggleLocationServices);

  const addContactBtn = document.getElementById('addContactBtn');
  if (addContactBtn) addContactBtn.addEventListener('click', openAddContactModal);

  const cancelContactBtn = document.getElementById('cancelContactBtn');
  if (cancelContactBtn) cancelContactBtn.addEventListener('click', closeAddContactModal);

  const contactForm = document.getElementById('contactForm');
  if (contactForm) contactForm.addEventListener('submit', submitAddContactForm);

  const simCrashBtn = document.getElementById('simAccidentBtn');
  if (simCrashBtn) simCrashBtn.addEventListener('click', triggerSimulatedAccident);

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleSound);
}
