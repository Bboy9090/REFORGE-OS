use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::path::Path;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, State};

#[derive(Clone)]
pub struct BootForgeState {
    flash_jobs: Arc<Mutex<HashMap<String, FlashOperation>>>,
    flash_job_children: Arc<Mutex<HashMap<String, Arc<Mutex<Option<Child>>>>>>,
    flash_history: Arc<Mutex<Vec<FlashOperation>>>,
    device_monitor_stop: Arc<Mutex<Option<std::sync::mpsc::Sender<()>>>>,
}

impl BootForgeState {
    pub fn new() -> Self {
        Self {
            flash_jobs: Arc::new(Mutex::new(HashMap::new())),
            flash_job_children: Arc::new(Mutex::new(HashMap::new())),
            flash_history: Arc::new(Mutex::new(Vec::new())),
            device_monitor_stop: Arc::new(Mutex::new(None)),
        }
    }
}

fn unix_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_else(|_| Duration::from_secs(0))
        .as_millis() as u64
}

fn next_job_id() -> String {
    // No placeholders: job IDs must be unique.
    // UUID v4 is the simplest robust choice.
    uuid::Uuid::new_v4().to_string()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FlashJobConfig {
    pub device_serial: String,
    pub device_brand: String,
    pub flash_method: String,
    pub partitions: Vec<FlashPartition>,
    pub verify_after_flash: bool,
    pub auto_reboot: bool,
    pub wipe_user_data: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FlashPartition {
    pub name: String,
    pub image_path: String,
    pub size: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FlashProgress {
    pub job_id: String,
    pub device_serial: String,
    pub device_brand: String,
    pub status: String,
    pub current_partition: Option<String>,
    pub overall_progress: u32,
    pub partition_progress: u32,
    pub bytes_transferred: u64,
    pub total_bytes: u64,
    pub transfer_speed: u64,
    pub estimated_time_remaining: u64,
    pub current_stage: String,
    pub started_at: u64,
    pub paused_at: Option<u64>,
    pub completed_at: Option<u64>,
    pub error: Option<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FlashOperation {
    pub id: String,
    pub job_config: FlashJobConfig,
    pub progress: FlashProgress,
    pub logs: Vec<String>,
    pub can_pause: bool,
    pub can_resume: bool,
    pub can_cancel: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RealTimeFlashUpdateData {
    pub status: Option<String>,
    pub progress: Option<u32>,
    pub message: Option<String>,
    pub bytes_transferred: Option<u64>,
    pub transfer_speed: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RealTimeFlashUpdate {
    #[serde(rename = "type")]
    pub kind: String,
    pub job_id: String,
    pub timestamp: u64,
    pub data: RealTimeFlashUpdateData,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FlashStartResponse {
    pub job_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FlashActionResponse {
    pub success: bool,
    pub message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BootForgeRawDevice {
    pub serial: String,
    pub is_bootloader: bool,
    pub is_recovery: bool,
    pub is_dfu: bool,
    pub is_edl: bool,
    pub capabilities: Vec<String>,
    pub brand: Option<String>,
    pub model: Option<String>,
}

fn emit_flash(app: &AppHandle, update: RealTimeFlashUpdate) {
    // Ignore emit errors (window may be closed), but never fabricate success.
    let _ = app.emit_all("flash-progress", update);
}

fn emit_device_event(app: &AppHandle, payload: serde_json::Value) {
    let _ = app.emit_all("device-events", payload);
}

fn run_tool_lines(
    mut child: Child,
    on_line: impl Fn(String) + Send + Sync + 'static,
) -> Result<i32, String> {
    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "Failed to capture stdout".to_string())?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| "Failed to capture stderr".to_string())?;

    let on_line = Arc::new(on_line);

    let out_handle = {
        let on_line = Arc::clone(&on_line);
        std::thread::spawn(move || {
            let reader = std::io::BufReader::new(stdout);
            for line in std::io::BufRead::lines(reader).flatten() {
                on_line(line);
            }
        })
    };

    let err_handle = {
        let on_line = Arc::clone(&on_line);
        std::thread::spawn(move || {
            let reader = std::io::BufReader::new(stderr);
            for line in std::io::BufRead::lines(reader).flatten() {
                on_line(line);
            }
        })
    };

    let status = child
        .wait()
        .map_err(|e| format!("Process wait failed: {e}"))?;

    let _ = out_handle.join();
    let _ = err_handle.join();

    Ok(status.code().unwrap_or(1))
}

fn run_adb_devices() -> Result<Vec<String>, String> {
    let output = Command::new("adb")
        .args(["devices", "-l"])
        .output()
        .map_err(|e| format!("Failed to run adb: {e}. Install Android platform-tools and ensure adb is on PATH."))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("adb devices failed: {stderr}"));
    }

    let text = String::from_utf8_lossy(&output.stdout);
    let mut serials = Vec::new();

    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if line.starts_with("List of devices") {
            continue;
        }
        let mut parts = line.split_whitespace();
        let serial = match parts.next() {
            Some(s) => s,
            None => continue,
        };
        if serial == "*" {
            continue;
        }
        // adb prints an empty list as just the header.
        // Only include plausible serials.
        if serial.len() >= 3 {
            serials.push(serial.to_string());
        }
    }

    Ok(serials)
}

fn run_fastboot_devices() -> Result<Vec<String>, String> {
    let output = Command::new("fastboot")
        .arg("devices")
        .output()
        .map_err(|e| format!("Failed to run fastboot: {e}. Install Android platform-tools and ensure fastboot is on PATH."))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("fastboot devices failed: {stderr}"));
    }

    let text = String::from_utf8_lossy(&output.stdout);
    let mut serials = Vec::new();

    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let mut parts = line.split_whitespace();
        let serial = match parts.next() {
            Some(s) => s,
            None => continue,
        };
        if serial.len() >= 3 {
            serials.push(serial.to_string());
        }
    }

    Ok(serials)
}

#[tauri::command]
pub fn bootforge_backend_status() -> Result<String, String> {
    Ok("Backend: tauri-inprocess (adb/fastboot via child processes)".to_string())
}

#[tauri::command]
pub fn bootforge_scan_devices() -> Result<Vec<BootForgeRawDevice>, String> {
    let mut errors: Vec<String> = Vec::new();

    let adb_devices = match run_adb_devices() {
        Ok(s) => s,
        Err(e) => {
            errors.push(e);
            Vec::new()
        }
    };

    let fastboot_devices = match run_fastboot_devices() {
        Ok(s) => s,
        Err(e) => {
            errors.push(e);
            Vec::new()
        }
    };

    if adb_devices.is_empty() && fastboot_devices.is_empty() && !errors.is_empty() {
        return Err(errors.join("\n"));
    }

    let mut devices = Vec::new();

    for serial in adb_devices {
        devices.push(BootForgeRawDevice {
            serial,
            is_bootloader: false,
            is_recovery: false,
            is_dfu: false,
            is_edl: false,
            capabilities: vec!["adb-sideload".to_string()],
            brand: None,
            model: None,
        });
    }

    for serial in fastboot_devices {
        devices.push(BootForgeRawDevice {
            serial,
            is_bootloader: true,
            is_recovery: false,
            is_dfu: false,
            is_edl: false,
            capabilities: vec!["fastboot".to_string()],
            brand: None,
            model: None,
        });
    }

    Ok(devices)
}

#[tauri::command]
pub fn bootforge_flash_start(
    app: AppHandle,
    state: State<'_, BootForgeState>,
    config: FlashJobConfig,
) -> Result<FlashStartResponse, String> {
    if config.flash_method != "fastboot" {
        return Err(format!(
            "Flash method '{}' is not supported by the in-process backend. Use fastboot.",
            config.flash_method
        ));
    }

    if config.device_serial.trim().is_empty() {
        return Err("deviceSerial is required".to_string());
    }

    if config.partitions.is_empty() {
        return Err("At least one partition is required".to_string());
    }

    for p in &config.partitions {
        if p.name.trim().is_empty() {
            return Err("Partition name is required".to_string());
        }
        if p.image_path.trim().is_empty() {
            return Err(format!("imagePath is required for partition {}", p.name));
        }
        if !Path::new(&p.image_path).exists() {
            return Err(format!("Image not found: {}", p.image_path));
        }
    }

    let job_id = next_job_id();

    let total_bytes: u64 = config.partitions.iter().map(|p| p.size).sum();

    let progress = FlashProgress {
        job_id: job_id.clone(),
        device_serial: config.device_serial.clone(),
        device_brand: config.device_brand.clone(),
        status: "preparing".to_string(),
        current_partition: None,
        overall_progress: 0,
        partition_progress: 0,
        bytes_transferred: 0,
        total_bytes,
        transfer_speed: 0,
        estimated_time_remaining: 0,
        current_stage: "Queued".to_string(),
        started_at: unix_ms(),
        paused_at: None,
        completed_at: None,
        error: None,
        warnings: Vec::new(),
    };

    let operation = FlashOperation {
        id: job_id.clone(),
        job_config: config.clone(),
        progress,
        logs: Vec::new(),
        can_pause: false,
        can_resume: false,
        can_cancel: true,
    };

    {
        let mut jobs = state
            .flash_jobs
            .lock()
            .map_err(|_| "Internal lock poisoned".to_string())?;
        jobs.insert(job_id.clone(), operation);
    }

    let child_holder: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));
    {
        let mut children = state
            .flash_job_children
            .lock()
            .map_err(|_| "Internal lock poisoned".to_string())?;
        children.insert(job_id.clone(), Arc::clone(&child_holder));
    }

    let app_clone = app.clone();
    let state_clone = BootForgeState {
        flash_jobs: Arc::clone(&state.flash_jobs),
        flash_job_children: Arc::clone(&state.flash_job_children),
        flash_history: Arc::clone(&state.flash_history),
        device_monitor_stop: Arc::clone(&state.device_monitor_stop),
    };
    let config_clone = config.clone();
    let job_id_clone = job_id.clone();

    std::thread::spawn(move || {
        run_fastboot_flash_job(app_clone, state_clone, job_id_clone, config_clone, child_holder);
    });

    Ok(FlashStartResponse { job_id })
}

fn append_log(state: &BootForgeState, job_id: &str, line: String) {
    if let Ok(mut jobs) = state.flash_jobs.lock() {
        if let Some(op) = jobs.get_mut(job_id) {
            op.logs.push(line);
        }
    }
}

fn set_status(state: &BootForgeState, job_id: &str, status: &str, stage: &str) {
    if let Ok(mut jobs) = state.flash_jobs.lock() {
        if let Some(op) = jobs.get_mut(job_id) {
            op.progress.status = status.to_string();
            op.progress.current_stage = stage.to_string();
            if status == "completed" || status == "failed" || status == "cancelled" {
                op.progress.completed_at = Some(unix_ms());
            }
        }
    }
}

fn set_progress(state: &BootForgeState, job_id: &str, overall: u32, current_partition: Option<String>) {
    if let Ok(mut jobs) = state.flash_jobs.lock() {
        if let Some(op) = jobs.get_mut(job_id) {
            op.progress.overall_progress = overall;
            op.progress.current_partition = current_partition;
        }
    }
}

fn fail_job(state: &BootForgeState, job_id: &str, error: String) {
    if let Ok(mut jobs) = state.flash_jobs.lock() {
        if let Some(op) = jobs.get_mut(job_id) {
            op.progress.status = "failed".to_string();
            op.progress.error = Some(error);
            op.progress.completed_at = Some(unix_ms());
        }
    }
}

fn complete_job(state: &BootForgeState, job_id: &str) {
    if let Ok(mut jobs) = state.flash_jobs.lock() {
        if let Some(op) = jobs.get_mut(job_id) {
            op.progress.status = "completed".to_string();
            op.progress.overall_progress = 100;
            op.progress.completed_at = Some(unix_ms());
        }
    }
}

fn archive_job(state: &BootForgeState, job_id: &str) {
    let op = {
        let mut jobs = match state.flash_jobs.lock() {
            Ok(guard) => guard,
            Err(poisoned) => poisoned.into_inner(),
        };
        jobs.remove(job_id)
    };

    if let Some(op) = op {
        if let Ok(mut history) = state.flash_history.lock() {
            history.insert(0, op);
            if history.len() > 200 {
                history.truncate(200);
            }
        }
    }

    if let Ok(mut children) = state.flash_job_children.lock() {
        children.remove(job_id);
    }
}

fn run_fastboot_flash_job(
    app: AppHandle,
    state: BootForgeState,
    job_id: String,
    config: FlashJobConfig,
    child_holder: Arc<Mutex<Option<Child>>>,
) {
    set_status(&state, &job_id, "preparing", "Preparing");
    emit_flash(
        &app,
        RealTimeFlashUpdate {
            kind: "status".to_string(),
            job_id: job_id.clone(),
            timestamp: unix_ms(),
            data: RealTimeFlashUpdateData {
                status: Some("preparing".to_string()),
                progress: Some(0),
                message: Some("Preparing fastboot job".to_string()),
                bytes_transferred: None,
                transfer_speed: None,
            },
        },
    );

    let total = config.partitions.len().max(1) as u32;

    for (idx, part) in config.partitions.iter().enumerate() {
        set_status(&state, &job_id, "flashing", &format!("Flashing {}", part.name));
        set_progress(&state, &job_id, (idx as u32 * 100) / total, Some(part.name.clone()));

        emit_flash(
            &app,
            RealTimeFlashUpdate {
                kind: "status".to_string(),
                job_id: job_id.clone(),
                timestamp: unix_ms(),
                data: RealTimeFlashUpdateData {
                    status: Some("flashing".to_string()),
                    progress: Some((idx as u32 * 100) / total),
                    message: Some(format!("Flashing partition {}", part.name)),
                    bytes_transferred: None,
                    transfer_speed: None,
                },
            },
        );

        let mut cmd = Command::new("fastboot");
        cmd.args(["-s", &config.device_serial, "flash", &part.name, &part.image_path])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let child = match cmd.spawn() {
            Ok(c) => c,
            Err(e) => {
                let msg = format!(
                    "Failed to spawn fastboot. Ensure platform-tools are installed and on PATH. Error: {e}"
                );
                fail_job(&state, &job_id, msg.clone());
                emit_flash(
                    &app,
                    RealTimeFlashUpdate {
                        kind: "error".to_string(),
                        job_id: job_id.clone(),
                        timestamp: unix_ms(),
                        data: RealTimeFlashUpdateData {
                            status: Some("failed".to_string()),
                            progress: None,
                            message: Some(msg),
                            bytes_transferred: None,
                            transfer_speed: None,
                        },
                    },
                );
                archive_job(&state, &job_id);
                return;
            }
        };

        {
            if let Ok(mut holder) = child_holder.lock() {
                *holder = Some(child);
            }
        }

        let exit_code = {
            let holder = Arc::clone(&child_holder);
            let on_line = move |line: String| {
                append_log(&state, &job_id, line.clone());
                emit_flash(
                    &app,
                    RealTimeFlashUpdate {
                        kind: "log".to_string(),
                        job_id: job_id.clone(),
                        timestamp: unix_ms(),
                        data: RealTimeFlashUpdateData {
                            status: None,
                            progress: None,
                            message: Some(line),
                            bytes_transferred: None,
                            transfer_speed: None,
                        },
                    },
                );
            };

            let child_opt = {
                let mut guard = holder.lock().unwrap_or_else(|p| p.into_inner());
                guard.take()
            };

            match child_opt {
                Some(child) => run_tool_lines(child, on_line).unwrap_or_else(|_| 1),
                None => 1,
            }
        };

        if exit_code != 0 {
            let msg = format!("fastboot flash {} failed with exit code {}", part.name, exit_code);
            fail_job(&state, &job_id, msg.clone());
            emit_flash(
                &app,
                RealTimeFlashUpdate {
                    kind: "error".to_string(),
                    job_id: job_id.clone(),
                    timestamp: unix_ms(),
                    data: RealTimeFlashUpdateData {
                        status: Some("failed".to_string()),
                        progress: None,
                        message: Some(msg),
                        bytes_transferred: None,
                        transfer_speed: None,
                    },
                },
            );
            archive_job(&state, &job_id);
            return;
        }

        let next_progress = (((idx as u32) + 1) * 100) / total;
        set_progress(&state, &job_id, next_progress, Some(part.name.clone()));
        emit_flash(
            &app,
            RealTimeFlashUpdate {
                kind: "progress".to_string(),
                job_id: job_id.clone(),
                timestamp: unix_ms(),
                data: RealTimeFlashUpdateData {
                    status: Some("flashing".to_string()),
                    progress: Some(next_progress),
                    message: Some(format!("Flashed {}", part.name)),
                    bytes_transferred: None,
                    transfer_speed: None,
                },
            },
        );
    }

    if config.auto_reboot {
        let _ = Command::new("fastboot")
            .args(["-s", &config.device_serial, "reboot"])
            .output();
        append_log(&state, &job_id, "Issued fastboot reboot".to_string());
    }

    complete_job(&state, &job_id);
    emit_flash(
        &app,
        RealTimeFlashUpdate {
            kind: "status".to_string(),
            job_id: job_id.clone(),
            timestamp: unix_ms(),
            data: RealTimeFlashUpdateData {
                status: Some("completed".to_string()),
                progress: Some(100),
                message: Some("Flash completed".to_string()),
                bytes_transferred: None,
                transfer_speed: None,
            },
        },
    );

    archive_job(&state, &job_id);
}

#[tauri::command]
pub fn bootforge_flash_cancel(
    state: State<'_, BootForgeState>,
    job_id: String,
) -> Result<FlashActionResponse, String> {
    if job_id.trim().is_empty() {
        return Err("jobId is required".to_string());
    }

    let child_arc = {
        let children = state
            .flash_job_children
            .lock()
            .map_err(|_| "Internal lock poisoned".to_string())?;
        children.get(&job_id).cloned()
    };

    if let Some(child_holder) = child_arc {
        if let Ok(mut child_opt) = child_holder.lock() {
            if let Some(mut child) = child_opt.take() {
                let _ = child.kill();
                let _ = child.wait();
            }
        }
    }

    // Mark cancelled if present.
    {
        let mut jobs = state
            .flash_jobs
            .lock()
            .map_err(|_| "Internal lock poisoned".to_string())?;
        if let Some(op) = jobs.get_mut(&job_id) {
            op.progress.status = "cancelled".to_string();
            op.progress.completed_at = Some(unix_ms());
        }
    }

    Ok(FlashActionResponse {
        success: true,
        message: Some("Cancel requested".to_string()),
    })
}

#[tauri::command]
pub fn bootforge_flash_active_operations(
    state: State<'_, BootForgeState>,
) -> Result<Vec<FlashOperation>, String> {
    let jobs = state
        .flash_jobs
        .lock()
        .map_err(|_| "Internal lock poisoned".to_string())?;

    Ok(jobs.values().cloned().collect())
}

#[tauri::command]
pub fn bootforge_flash_history(
    state: State<'_, BootForgeState>,
    limit: Option<usize>,
) -> Result<Vec<FlashOperation>, String> {
    let limit = limit.unwrap_or(50).min(200);
    let history = state
        .flash_history
        .lock()
        .map_err(|_| "Internal lock poisoned".to_string())?;

    Ok(history.iter().take(limit).cloned().collect())
}

pub fn start_device_monitor(app: AppHandle, state: BootForgeState) {
    let (tx, rx) = std::sync::mpsc::channel::<()>();

    {
        let mut stop = state
            .device_monitor_stop
            .lock()
            .unwrap_or_else(|p| p.into_inner());
        *stop = Some(tx);
    }

    std::thread::spawn(move || {
        // Use bootforgeusb (rusb-based) to detect USB changes even when adb isn't authorized.
        let mut last: HashSet<String> = HashSet::new();

        loop {
            if rx.try_recv().is_ok() {
                break;
            }

            let current = match bootforgeusb::scan() {
                Ok(devs) => devs
                    .into_iter()
                    .map(|d| d.device_uid)
                    .collect::<HashSet<String>>(),
                Err(_) => HashSet::new(),
            };

            for added in current.difference(&last) {
                emit_device_event(
                    &app,
                    serde_json::json!({
                        "type": "device_connected",
                        "timestamp": unix_ms(),
                        "deviceUid": added,
                    }),
                );
            }

            for removed in last.difference(&current) {
                emit_device_event(
                    &app,
                    serde_json::json!({
                        "type": "device_disconnected",
                        "timestamp": unix_ms(),
                        "deviceUid": removed,
                    }),
                );
            }

            last = current;
            std::thread::sleep(Duration::from_secs(2));
        }
    });
}

pub fn stop_device_monitor(state: &BootForgeState) {
    let stop = {
        let mut guard = state
            .device_monitor_stop
            .lock()
            .unwrap_or_else(|p| p.into_inner());
        guard.take()
    };

    if let Some(tx) = stop {
        let _ = tx.send(());
    }
}
