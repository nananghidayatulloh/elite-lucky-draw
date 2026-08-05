// assets/db-config.js
const DB_NAME = "EliteLuckyDrawDB";
const CURRENT_VERSION = 29; 

// Data default stages
const DEFAULT_STAGES = [
    { id: 1, stage_name: "Legacy Gala Dinner 2026", prize_name: "Apple Watch Series 11", prize_price: 1799, quota: 250, sequence: 1, drawn_count: 0 },
    { id: 2, stage_name: "Legacy Gala Dinner 2026", prize_name: "DJI Osmo Pocket 4", prize_price: 2599, quota: 250, sequence: 2, drawn_count: 0 },
    { id: 3, stage_name: "Legacy Gala Dinner 2026", prize_name: "iPad Air M3 128GB", prize_price: 2397, quota: 250, sequence: 3, drawn_count: 0 },
    { id: 4, stage_name: "Legacy Gala Dinner 2026", prize_name: "Sharp 55-Inch 4K UHD TV", prize_price: 2500, quota: 250, sequence: 4, drawn_count: 0 },
    { id: 5, stage_name: "Legacy Gala Dinner 2026", prize_name: "Roborock Q10 Vacuum", prize_price: 1799, quota: 250, sequence: 5, drawn_count: 0 }
];

// ========== FUNGSI UNTUK CEK DATABASE ==========
async function isDatabaseExists() {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME);
        request.onsuccess = (e) => {
            const db = e.target.result;
            const exists = db.objectStoreNames.contains("attendances") || 
                           db.objectStoreNames.contains("draw_stages") || 
                           db.objectStoreNames.contains("winners") ||
                           db.objectStoreNames.contains("prizes") ||
                           db.objectStoreNames.contains("bulk_draws") ||
                           db.objectStoreNames.contains("standalone_preset") ||
                           db.objectStoreNames.contains("tables");
            db.close();
            resolve(exists);
        };
        request.onerror = () => resolve(false);
    });
}

async function getCurrentDatabaseVersion() {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME);
        request.onsuccess = (e) => {
            const version = e.target.result.version;
            e.target.result.close();
            resolve(version);
        };
        request.onerror = () => resolve(0);
    });
}

// ========== INISIALISASI DATABASE ==========
async function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, CURRENT_VERSION);
        
        request.onerror = (event) => {
            console.error("[DB] Error:", event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains("prizes")) {
                console.warn("[DB] Tabel 'prizes' tidak ditemukan. Memaksa reset database...");
                db.close();
                const deleteReq = indexedDB.deleteDatabase(DB_NAME);
                deleteReq.onsuccess = () => {
                    initDatabase().then(resolve).catch(reject);
                };
                return;
            }
            
            console.log(`[DB] Opened successfully with version ${db.version}`);
            console.log('[DB] Stores:', Array.from(db.objectStoreNames));
            db.close();
            resolve(true);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log(`[DB] Upgrading schema to version ${CURRENT_VERSION}...`);
            
            // Hapus semua store lama
            if (db.objectStoreNames.contains("attendances")) db.deleteObjectStore("attendances");
            if (db.objectStoreNames.contains("winners")) db.deleteObjectStore("winners");
            if (db.objectStoreNames.contains("draw_stages")) db.deleteObjectStore("draw_stages");
            if (db.objectStoreNames.contains("prizes")) db.deleteObjectStore("prizes");
            if (db.objectStoreNames.contains("bulk_draws")) db.deleteObjectStore("bulk_draws");
            if (db.objectStoreNames.contains("standalone_preset")) db.deleteObjectStore("standalone_preset");
            if (db.objectStoreNames.contains("tables")) db.deleteObjectStore("tables");
            
            // 1. Attendances
            const attendancesStore = db.createObjectStore("attendances", { keyPath: "id" });
            attendancesStore.createIndex("lucky_code", "lucky_code", { unique: true });
            attendancesStore.createIndex("nama", "nama", { unique: false });
            attendancesStore.createIndex("company", "company", { unique: false });
            attendancesStore.createIndex("table_number", "table_number", { unique: false });
            attendancesStore.createIndex("is_winner", "is_winner", { unique: false });
            
            // 2. Winners
            const winnersStore = db.createObjectStore("winners", { keyPath: "id", autoIncrement: true });
            winnersStore.createIndex("attendance_id", "attendance_id", { unique: false });
            winnersStore.createIndex("stage_id", "stage_id", { unique: false });
            winnersStore.createIndex("prize_id", "prize_id", { unique: false });
            winnersStore.createIndex("drawn_at", "drawn_at", { unique: false });
            winnersStore.createIndex("is_redrawn", "is_redrawn", { unique: false }); 
            
            // 3. Draw Stages
            const drawStagesStore = db.createObjectStore("draw_stages", { keyPath: "id" });
            DEFAULT_STAGES.forEach(stage => drawStagesStore.add(stage));
            
            // 4. Prizes
            const prizesStore = db.createObjectStore("prizes", { keyPath: "id" });
            prizesStore.createIndex("type", "type", { unique: false });
            prizesStore.createIndex("round", "round", { unique: false });
            prizesStore.createIndex("is_drawn", "is_drawn", { unique: false });
            
            // 5. Bulk Draws
            const bulkDrawsStore = db.createObjectStore("bulk_draws", { keyPath: "id", autoIncrement: true });
            bulkDrawsStore.createIndex("prize_id", "prize_id", { unique: false });
            bulkDrawsStore.createIndex("table_number", "table_number", { unique: false });
            bulkDrawsStore.createIndex("drawn_at", "drawn_at", { unique: false });

            // 6. STANDALONE PRESET
            console.log('[DB] Creating standalone_preset store...');
            const standalonePresetStore = db.createObjectStore("standalone_preset", { keyPath: "id" });
            standalonePresetStore.createIndex("round", "round", { unique: false });
            standalonePresetStore.createIndex("prize_name", "prize_name", { unique: false });
            standalonePresetStore.createIndex("status", "status", { unique: false });
            standalonePresetStore.createIndex("lucky_number", "lucky_number", { unique: false });
            console.log('[DB] standalone_preset store created successfully');
            
            // 7. TABLES
            console.log('[DB] Creating tables store...');
            const tablesStore = db.createObjectStore("tables", { keyPath: "id", autoIncrement: true });
            tablesStore.createIndex("table_name", "table_name", { unique: false });
            tablesStore.createIndex("total_seats", "total_seats", { unique: false });
            tablesStore.createIndex("created_at", "created_at", { unique: false });
            console.log('[DB] tables store created successfully');
        };
    });
}

// ========== FUNGSI DATABASE LAINNYA ==========
async function getDatabase() {
    await initDatabase();
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, CURRENT_VERSION);
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function getStages() {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(["draw_stages"], "readonly");
        const store = tx.objectStore("draw_stages");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.sort((a,b) => a.sequence - b.sequence));
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

async function getAllAttendances() {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(["attendances"], "readonly");
        const store = tx.objectStore("attendances");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

async function getAllWinners() {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(["winners"], "readonly");
        const store = tx.objectStore("winners");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

async function getPrizes() {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains("prizes")) {
            reject(new Error('Store "prizes" not found! Please upgrade database.'));
            return;
        }
        
        const tx = db.transaction(["prizes"], "readonly");
        const store = tx.objectStore("prizes");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

async function saveWinner(attendanceId, stageId) {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(["winners", "draw_stages"], "readwrite");
        
        const winnersStore = tx.objectStore("winners");
        winnersStore.add({
            attendance_id: attendanceId,
            stage_id: stageId,
            drawn_at: new Date().toISOString()
        });
        
        const stagesStore = tx.objectStore("draw_stages");
        const getStage = stagesStore.get(stageId);
        getStage.onsuccess = () => {
            const stage = getStage.result;
            stage.drawn_count = (stage.drawn_count || 0) + 1;
            stagesStore.put(stage);
        };
        
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
    });
}

async function getFirstAvailableStage() {
    const stages = await getStages();
    return stages.find(s => s.drawn_count < s.quota) || (stages.length > 0 ? stages[0] : null);
}

async function resetDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => {
            console.log("[DB] Database deleted");
            resolve(true);
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

// ========== FUNGSI STANDALONE PRESET ==========
async function getStandalonePresets() {
    const db = await getDatabase();
    if (!db.objectStoreNames.contains("standalone_preset")) {
        console.warn('[DB] Store "standalone_preset" not found');
        db.close();
        return [];
    }
    return new Promise((resolve, reject) => {
        const tx = db.transaction(["standalone_preset"], "readonly");
        const store = tx.objectStore("standalone_preset");
        const request = store.getAll();
        request.onsuccess = () => {
            console.log('[DB] Retrieved', request.result.length, 'standalone presets');
            resolve(request.result);
        };
        request.onerror = () => {
            console.error('[DB] Error getting presets:', request.error);
            reject(request.error);
        };
        tx.oncomplete = () => db.close();
    });
}

async function saveStandalonePreset(data) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, CURRENT_VERSION);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            
            console.log('[DB] Available stores:', Array.from(db.objectStoreNames));
            
            if (!db.objectStoreNames.contains("standalone_preset")) {
                console.error('[DB] Store "standalone_preset" NOT FOUND!');
                db.close();
                reject(new Error('Standalone preset store not found. Please refresh the page.'));
                return;
            }
            
            const tx = db.transaction(["standalone_preset"], "readwrite");
            const store = tx.objectStore("standalone_preset");
            const addRequest = store.add(data);
            
            addRequest.onsuccess = () => {
                console.log('[DB] Saved standalone preset:', data.winner_name);
                resolve();
            };
            
            addRequest.onerror = () => {
                console.error('[DB] Save error:', addRequest.error);
                reject(addRequest.error);
            };
            
            tx.oncomplete = () => {
                db.close();
            };
            
            tx.onerror = () => {
                console.error('[DB] Transaction error:', tx.error);
                db.close();
                reject(tx.error);
            };
        };
        
        request.onerror = function(event) {
            console.error('[DB] Open error:', event.target.error);
            reject(event.target.error);
        };
    });
}

async function updateStandalonePresetStatus(id, status, replacementData = null) {
    const db = await getDatabase();
    if (!db.objectStoreNames.contains("standalone_preset")) {
        return;
    }
    return new Promise((resolve, reject) => {
        const tx = db.transaction(["standalone_preset"], "readwrite");
        const store = tx.objectStore("standalone_preset");
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
            const data = getRequest.result;
            data.status = status;
            data.updated_at = new Date().toISOString();
            if (replacementData) {
                data.replacement_name = replacementData.winner_name;
                data.replacement_lucky = replacementData.lucky_number;
                data.replacement_email = replacementData.winner_email || '';
                data.replacement_table = replacementData.table_number || '';
            }
            store.put(data);
            tx.oncomplete = () => { db.close(); resolve(); };
        };
        getRequest.onerror = () => { db.close(); reject(getRequest.error); };
    });
}

// ========== EKSPORT KE GLOBAL ==========
window.DB_NAME = DB_NAME;
window.DB_VERSION = CURRENT_VERSION;
window.DEFAULT_STAGES = DEFAULT_STAGES;
window.initDatabase = initDatabase;
window.getDatabase = getDatabase;
window.getStages = getStages;
window.getAllAttendances = getAllAttendances;
window.getAllWinners = getAllWinners;
window.getPrizes = getPrizes;
window.saveWinner = saveWinner;
window.getFirstAvailableStage = getFirstAvailableStage;
window.resetDatabase = resetDatabase;
window.isDatabaseExists = isDatabaseExists;
window.getCurrentDatabaseVersion = getCurrentDatabaseVersion;
window.getStandalonePresets = getStandalonePresets;
window.saveStandalonePreset = saveStandalonePreset;
window.updateStandalonePresetStatus = updateStandalonePresetStatus;

console.log('[DB] Config loaded with version', CURRENT_VERSION);