use super::detect::{detect_devices, UsbDeviceInfo, DeviceEvent};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{broadcast, RwLock};
use tokio::time::interval;

#[derive(Debug, Clone)]
pub struct WatcherConfig {
    pub poll_interval: Duration,
    pub event_buffer_size: usize,
    pub auto_probe: bool,
}

impl Default for WatcherConfig {
    fn default() -> Self {
        WatcherConfig {
            poll_interval: Duration::from_millis(500),
            event_buffer_size: 256,
            auto_probe: true,
        }
    }
}

pub struct DeviceWatcher {
    config: WatcherConfig,
    devices: Arc<RwLock<HashMap<String, UsbDeviceInfo>>>,
    event_tx: broadcast::Sender<DeviceEvent>,
    running: Arc<RwLock<bool>>,
}

impl DeviceWatcher {
    pub fn new(config: WatcherConfig) -> Self {
        let (event_tx, _) = broadcast::channel(config.event_buffer_size);
        
        DeviceWatcher {
            config,
            devices: Arc::new(RwLock::new(HashMap::new())),
            event_tx,
            running: Arc::new(RwLock::new(false)),
        }
    }
    
    pub fn subscribe(&self) -> broadcast::Receiver<DeviceEvent> {
        self.event_tx.subscribe()
    }
    
    pub async fn get_devices(&self) -> Vec<UsbDeviceInfo> {
        let devices = self.devices.read().await;
        devices.values().cloned().collect()
    }
    
    pub async fn get_device(&self, serial: &str) -> Option<UsbDeviceInfo> {
        let devices = self.devices.read().await;
        devices.values().find(|d| {
            d.serial.as_ref().map_or(false, |s| s == serial)
        }).cloned()
    }
    
    pub async fn start(&self) {
        {
            let mut running = self.running.write().await;
            if *running {
                log::warn!("[DeviceWatcher] Already running");
                return;
            }
            *running = true;
        }
        
        log::info!("[DeviceWatcher] Starting USB device monitoring (interval: {:?})", 
            self.config.poll_interval);
        
        let devices = self.devices.clone();
        let event_tx = self.event_tx.clone();
        let poll_interval = self.config.poll_interval;
        let running = self.running.clone();
        
        tokio::spawn(async move {
            let mut interval = interval(poll_interval);
            
            loop {
                interval.tick().await;
                
                {
                    let is_running = running.read().await;
                    if !*is_running {
                        log::info!("[DeviceWatcher] Stopping...");
                        break;
                    }
                }
                
                match detect_devices() {
                    Ok(current_devices) => {
                        let mut known_devices = devices.write().await;
                        
                        let current_keys: std::collections::HashSet<String> = 
                            current_devices.iter()
                                .map(|d| d.unique_key())
                                .collect();
                        
                        let known_keys: std::collections::HashSet<String> = 
                            known_devices.keys().cloned().collect();
                        
                        for device in &current_devices {
                            let key = device.unique_key();
                            if !known_keys.contains(&key) {
                                log::info!("[DeviceWatcher] Device connected: {}", key);
                                let _ = event_tx.send(DeviceEvent::Connected(device.clone()));
                                known_devices.insert(key, device.clone());
                            } else {
                                let existing = known_devices.get(&key).unwrap();
                                if existing.mode != device.mode {
                                    log::info!("[DeviceWatcher] Mode changed: {:?} -> {:?}", 
                                        existing.mode, device.mode);
                                    let _ = event_tx.send(DeviceEvent::ModeChanged {
                                        id: device.id,
                                        old_mode: existing.mode,
                                        new_mode: device.mode,
                                    });
                                }
                                known_devices.insert(key, device.clone());
                            }
                        }
                        
                        let disconnected: Vec<_> = known_keys.difference(&current_keys)
                            .cloned()
                            .collect();
                        
                        for key in disconnected {
                            if let Some(device) = known_devices.remove(&key) {
                                log::info!("[DeviceWatcher] Device disconnected: {}", key);
                                let _ = event_tx.send(DeviceEvent::Disconnected {
                                    id: device.id,
                                    serial: device.serial,
                                });
                            }
                        }
                    }
                    Err(e) => {
                        log::error!("[DeviceWatcher] Scan error: {}", e);
                    }
                }
            }
        });
    }
    
    pub async fn stop(&self) {
        let mut running = self.running.write().await;
        *running = false;
        log::info!("[DeviceWatcher] Stop signal sent");
    }
    
    pub async fn is_running(&self) -> bool {
        *self.running.read().await
    }
    
    pub fn device_count(&self) -> usize {
        self.event_tx.receiver_count()
    }
}

impl Default for DeviceWatcher {
    fn default() -> Self {
        Self::new(WatcherConfig::default())
    }
}
