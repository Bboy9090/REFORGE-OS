//! Thermal Monitoring Module
//! 
//! Provides real-time temperature monitoring for safe imaging operations.
//! Monitors device thermals via ADB/protocol queries and system sensors.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ThermalZone {
    Battery,
    CPU,
    GPU,
    Modem,
    Storage,
    Skin,
    Ambient,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ThermalState {
    Normal,
    Warm,
    Hot,
    Critical,
    Shutdown,
}

impl ThermalState {
    pub fn from_celsius(temp: f32) -> Self {
        Self::from_celsius_with_config(temp, &ThermalConfig::default())
    }

    pub fn from_celsius_with_config(temp: f32, config: &ThermalConfig) -> Self {
        if temp >= config.shutdown_threshold_celsius {
            ThermalState::Shutdown
        } else if temp >= config.critical_threshold_celsius {
            ThermalState::Critical
        } else if temp >= config.warn_threshold_celsius + 5.0 {
            ThermalState::Hot
        } else if temp >= config.warn_threshold_celsius {
            ThermalState::Warm
        } else {
            ThermalState::Normal
        }
    }

    pub fn is_safe_for_imaging(&self) -> bool {
        matches!(self, ThermalState::Normal | ThermalState::Warm)
    }

    pub fn recommended_action(&self) -> &'static str {
        match self {
            ThermalState::Normal => "Proceed with imaging",
            ThermalState::Warm => "Proceed with monitoring",
            ThermalState::Hot => "Pause imaging, allow cooldown",
            ThermalState::Critical => "Stop immediately, critical temperature",
            ThermalState::Shutdown => "Emergency stop, device may shut down",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermalReading {
    pub zone: ThermalZone,
    pub temperature_celsius: f32,
    pub state: ThermalState,
    pub timestamp: u64,
}

impl ThermalReading {
    pub fn new(zone: ThermalZone, temp_celsius: f32) -> Self {
        Self::with_config(zone, temp_celsius, &ThermalConfig::default())
    }

    pub fn with_config(zone: ThermalZone, temp_celsius: f32, config: &ThermalConfig) -> Self {
        Self {
            zone,
            temperature_celsius: temp_celsius,
            state: ThermalState::from_celsius_with_config(temp_celsius, config),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermalSnapshot {
    pub device_id: String,
    pub readings: Vec<ThermalReading>,
    pub overall_state: ThermalState,
    pub max_temperature: f32,
    pub avg_temperature: f32,
    pub safe_for_imaging: bool,
    pub timestamp: u64,
}

impl ThermalSnapshot {
    pub fn from_readings(device_id: String, readings: Vec<ThermalReading>) -> Self {
        Self::from_readings_with_config(device_id, readings, &ThermalConfig::default())
    }

    pub fn from_readings_with_config(device_id: String, readings: Vec<ThermalReading>, config: &ThermalConfig) -> Self {
        let max_temp = readings
            .iter()
            .map(|r| r.temperature_celsius)
            .fold(0.0_f32, |a, b| a.max(b));
        
        let avg_temp = if readings.is_empty() {
            0.0
        } else {
            readings.iter().map(|r| r.temperature_celsius).sum::<f32>() / readings.len() as f32
        };

        let overall_state = ThermalState::from_celsius_with_config(max_temp, config);
        let safe_for_imaging = overall_state.is_safe_for_imaging();

        Self {
            device_id,
            readings,
            overall_state,
            max_temperature: max_temp,
            avg_temperature: avg_temp,
            safe_for_imaging,
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermalConfig {
    pub poll_interval_ms: u64,
    pub warn_threshold_celsius: f32,
    pub critical_threshold_celsius: f32,
    pub shutdown_threshold_celsius: f32,
    pub auto_pause_on_hot: bool,
    pub max_history_size: usize,
}

impl Default for ThermalConfig {
    fn default() -> Self {
        Self {
            poll_interval_ms: 2000,
            warn_threshold_celsius: 45.0,
            critical_threshold_celsius: 55.0,
            shutdown_threshold_celsius: 65.0,
            auto_pause_on_hot: true,
            max_history_size: 100,
        }
    }
}

pub struct ThermalMonitor {
    config: ThermalConfig,
    history: HashMap<String, Vec<ThermalSnapshot>>,
    last_poll: Option<Instant>,
}

impl ThermalMonitor {
    pub fn new(config: ThermalConfig) -> Self {
        Self {
            config,
            history: HashMap::new(),
            last_poll: None,
        }
    }

    pub fn should_poll(&self) -> bool {
        match self.last_poll {
            Some(last) => last.elapsed() >= Duration::from_millis(self.config.poll_interval_ms),
            None => true,
        }
    }

    pub fn record_snapshot(&mut self, snapshot: ThermalSnapshot) {
        let device_id = snapshot.device_id.clone();
        let history = self.history.entry(device_id).or_insert_with(Vec::new);
        
        history.push(snapshot);
        
        if history.len() > self.config.max_history_size {
            history.remove(0);
        }

        self.last_poll = Some(Instant::now());
    }

    pub fn get_latest(&self, device_id: &str) -> Option<&ThermalSnapshot> {
        self.history.get(device_id).and_then(|h| h.last())
    }

    pub fn get_history(&self, device_id: &str) -> Option<&Vec<ThermalSnapshot>> {
        self.history.get(device_id)
    }

    pub fn is_safe_for_imaging(&self, device_id: &str) -> bool {
        self.get_latest(device_id)
            .map(|s| s.safe_for_imaging)
            .unwrap_or(true)
    }

    pub fn get_temperature_trend(&self, device_id: &str) -> Option<f32> {
        let history = self.history.get(device_id)?;
        if history.len() < 2 {
            return None;
        }

        let recent = &history[history.len() - 1];
        let previous = &history[history.len() - 2];
        
        Some(recent.max_temperature - previous.max_temperature)
    }

    pub fn parse_android_thermal_output(output: &str) -> Vec<ThermalReading> {
        Self::parse_android_thermal_output_with_config(output, &ThermalConfig::default())
    }

    pub fn parse_android_thermal_output_with_config(output: &str, config: &ThermalConfig) -> Vec<ThermalReading> {
        let mut readings = Vec::new();

        for line in output.lines() {
            let line = line.trim();
            
            if let Some((zone_name, temp_str)) = line.split_once(':') {
                let zone = match zone_name.to_lowercase().as_str() {
                    s if s.contains("battery") => ThermalZone::Battery,
                    s if s.contains("cpu") => ThermalZone::CPU,
                    s if s.contains("gpu") => ThermalZone::GPU,
                    s if s.contains("modem") => ThermalZone::Modem,
                    s if s.contains("storage") || s.contains("ufs") => ThermalZone::Storage,
                    s if s.contains("skin") => ThermalZone::Skin,
                    s if s.contains("ambient") => ThermalZone::Ambient,
                    _ => ThermalZone::Unknown,
                };

                let temp_str = temp_str.trim();
                let temp: f32 = temp_str
                    .chars()
                    .take_while(|c| c.is_ascii_digit() || *c == '.' || *c == '-')
                    .collect::<String>()
                    .parse()
                    .unwrap_or(0.0);

                let temp_celsius = if temp > 1000.0 {
                    temp / 1000.0
                } else if temp > 100.0 {
                    temp / 10.0
                } else {
                    temp
                };

                if temp_celsius > 0.0 && temp_celsius < 150.0 {
                    readings.push(ThermalReading::with_config(zone, temp_celsius, config));
                }
            }
        }

        readings
    }

    pub fn create_snapshot(&self, device_id: String, readings: Vec<ThermalReading>) -> ThermalSnapshot {
        ThermalSnapshot::from_readings_with_config(device_id, readings, &self.config)
    }

    pub fn adb_thermal_commands() -> Vec<&'static str> {
        vec![
            "cat /sys/class/thermal/thermal_zone*/temp",
            "dumpsys thermalservice",
            "dumpsys battery",
            "cat /sys/class/power_supply/battery/temp",
        ]
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermalEvent {
    pub device_id: String,
    pub event_type: ThermalEventType,
    pub snapshot: ThermalSnapshot,
    pub message: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ThermalEventType {
    Normal,
    Warning,
    Critical,
    CooldownComplete,
    ImagingPaused,
    ImagingResumed,
}

impl ThermalEvent {
    pub fn from_snapshot(device_id: String, snapshot: ThermalSnapshot) -> Self {
        let event_type = match snapshot.overall_state {
            ThermalState::Normal => ThermalEventType::Normal,
            ThermalState::Warm => ThermalEventType::Normal,
            ThermalState::Hot => ThermalEventType::Warning,
            ThermalState::Critical | ThermalState::Shutdown => ThermalEventType::Critical,
        };

        let message = format!(
            "Device {} thermal: {:.1}°C ({})",
            device_id,
            snapshot.max_temperature,
            snapshot.overall_state.recommended_action()
        );

        Self {
            device_id,
            event_type,
            snapshot,
            message,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_thermal_state_classification() {
        assert_eq!(ThermalState::from_celsius(25.0), ThermalState::Normal);
        assert_eq!(ThermalState::from_celsius(45.0), ThermalState::Warm);
        assert_eq!(ThermalState::from_celsius(55.0), ThermalState::Hot);
        assert_eq!(ThermalState::from_celsius(65.0), ThermalState::Critical);
        assert_eq!(ThermalState::from_celsius(75.0), ThermalState::Shutdown);
    }

    #[test]
    fn test_safe_for_imaging() {
        assert!(ThermalState::Normal.is_safe_for_imaging());
        assert!(ThermalState::Warm.is_safe_for_imaging());
        assert!(!ThermalState::Hot.is_safe_for_imaging());
        assert!(!ThermalState::Critical.is_safe_for_imaging());
    }

    #[test]
    fn test_parse_thermal_output() {
        let output = "battery: 32000\ncpu: 45000\ngpu: 42000";
        let readings = ThermalMonitor::parse_android_thermal_output(output);
        
        assert_eq!(readings.len(), 3);
        assert!((readings[0].temperature_celsius - 32.0).abs() < 0.1);
    }

    #[test]
    fn test_thermal_snapshot() {
        let readings = vec![
            ThermalReading::new(ThermalZone::Battery, 35.0),
            ThermalReading::new(ThermalZone::CPU, 55.0),
        ];
        
        let snapshot = ThermalSnapshot::from_readings("test-device".to_string(), readings);
        
        assert_eq!(snapshot.max_temperature, 55.0);
        assert_eq!(snapshot.overall_state, ThermalState::Hot);
        assert!(!snapshot.safe_for_imaging);
    }
}
