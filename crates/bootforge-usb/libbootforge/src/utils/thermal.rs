use crate::Result;
use crate::BootforgeError;

pub struct ThermalMonitor {
    max_temp_celsius: f32,
}

impl ThermalMonitor {
    pub fn new(max_temp: f32) -> Self {
        ThermalMonitor {
            max_temp_celsius: max_temp,
        }
    }

    pub async fn check_temperature(&self) -> Result<f32> {
        log::warn!("System temperature monitoring not yet implemented");
        // TODO: Implement temperature reading from /sys/class/thermal/thermal_zone*/temp
        // On Linux: cat /sys/class/thermal/thermal_zone0/temp
        // On macOS: use system_profiler or sysctl
        // For now, return error instead of fake temperature
        Err(BootforgeError::Thermal("Temperature monitoring not yet implemented. Cannot read system temperature.".to_string()))
    }

    pub async fn is_safe(&self) -> Result<bool> {
        // This will now propagate the error from check_temperature
        let temp = self.check_temperature().await?;
        Ok(temp < self.max_temp_celsius)
    }
}
