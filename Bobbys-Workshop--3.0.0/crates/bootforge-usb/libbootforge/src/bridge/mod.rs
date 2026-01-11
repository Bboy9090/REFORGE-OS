use crate::{Result, BootforgeError};
use crate::usb::{DeviceEvent, DeviceWatcher, WatcherConfig, UsbDeviceInfo};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum BridgeMessage {
    DeviceList(Vec<UsbDeviceInfo>),
    DeviceEvent(DeviceEvent),
    ScanRequest,
    ScanResponse { devices: Vec<UsbDeviceInfo>, scan_time_ms: u64 },
    Error { code: String, message: String },
    Ping,
    Pong { timestamp: i64 },
}

pub struct BootforgeBridge {
    watcher: Arc<DeviceWatcher>,
    running: Arc<RwLock<bool>>,
}

impl BootforgeBridge {
    pub fn new() -> Self {
        let config = WatcherConfig::default();
        BootforgeBridge {
            watcher: Arc::new(DeviceWatcher::new(config)),
            running: Arc::new(RwLock::new(false)),
        }
    }
    
    pub fn with_config(config: WatcherConfig) -> Self {
        BootforgeBridge {
            watcher: Arc::new(DeviceWatcher::new(config)),
            running: Arc::new(RwLock::new(false)),
        }
    }
    
    pub async fn start(&self) -> Result<()> {
        let mut running = self.running.write().await;
        if *running {
            return Err(BootforgeError::Bridge("Bridge already running".to_string()));
        }
        *running = true;
        
        self.watcher.start().await;
        log::info!("[BootforgeBridge] Started");
        
        Ok(())
    }
    
    pub async fn stop(&self) -> Result<()> {
        let mut running = self.running.write().await;
        *running = false;
        
        self.watcher.stop().await;
        log::info!("[BootforgeBridge] Stopped");
        
        Ok(())
    }
    
    pub fn subscribe(&self) -> tokio::sync::broadcast::Receiver<DeviceEvent> {
        self.watcher.subscribe()
    }
    
    pub async fn get_devices(&self) -> Vec<UsbDeviceInfo> {
        self.watcher.get_devices().await
    }
    
    pub async fn scan_devices(&self) -> Result<BridgeMessage> {
        let start = std::time::Instant::now();
        let devices = crate::usb::detect_devices()?;
        let elapsed = start.elapsed().as_millis() as u64;
        
        Ok(BridgeMessage::ScanResponse { 
            devices, 
            scan_time_ms: elapsed 
        })
    }
    
    pub async fn handle_message(&self, msg: BridgeMessage) -> Result<BridgeMessage> {
        match msg {
            BridgeMessage::ScanRequest => {
                self.scan_devices().await
            }
            BridgeMessage::Ping => {
                Ok(BridgeMessage::Pong { 
                    timestamp: chrono::Utc::now().timestamp_millis() 
                })
            }
            _ => {
                Err(BootforgeError::Bridge("Unsupported message type".to_string()))
            }
        }
    }
    
    pub fn to_json<T: Serialize>(msg: &T) -> Result<String> {
        serde_json::to_string(msg)
            .map_err(|e| BootforgeError::Bridge(format!("JSON serialize error: {}", e)))
    }
    
    pub fn from_json(json: &str) -> Result<BridgeMessage> {
        serde_json::from_str(json)
            .map_err(|e| BootforgeError::Bridge(format!("JSON parse error: {}", e)))
    }
}

impl Default for BootforgeBridge {
    fn default() -> Self {
        Self::new()
    }
}
