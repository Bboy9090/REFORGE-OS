// REFORGE OS - Python Worker HTTP Client
// Rust authoritative layer that calls Python worker service

use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Serialize)]
pub struct PyInspectRequest<T> {
    pub device_id: String,
    pub platform: String,
    pub payload: T,
}

#[derive(Deserialize)]
pub struct PyResponse<T> {
    pub ok: bool,
    pub data: Option<T>,
    pub warnings: Vec<String>,
}

#[derive(Deserialize, Default, Debug, Clone)]
pub struct InspectFlags {
    pub activation_locked: Option<bool>,
    pub mdm_enrolled: Option<bool>,
    pub frp_locked: Option<bool>,
    pub efi_locked: Option<bool>,
}

#[derive(Deserialize)]
pub struct HealthStatus {
    pub status: String,
    pub version: String,
    pub uptime_ms: u64,
}

pub struct PyWorkerClient {
    base_url: String,
    client: reqwest::Client,
}

impl PyWorkerClient {
    pub fn new(port: u16) -> Self {
        Self {
            base_url: format!("http://127.0.0.1:{}", port),
            client: reqwest::Client::new(),
        }
    }

    pub async fn health(&self) -> anyhow::Result<HealthStatus> {
        let res = self
            .client
            .get(format!("{}/health", self.base_url))
            .send()
            .await?;

        if !res.status().is_success() {
            anyhow::bail!("Python backend unhealthy: {}", res.status());
        }

        let health: HealthStatus = res.json().await?;
        Ok(health)
    }

    pub async fn inspect_basic(
        &self,
        device_id: &str,
        platform: &str,
    ) -> anyhow::Result<InspectFlags> {
        let req = PyInspectRequest {
            device_id: device_id.to_string(),
            platform: platform.to_string(),
            payload: serde_json::json!({}),
        };

        let res: PyResponse<InspectFlags> = self
            .client
            .post(format!("{}/inspect/basic", self.base_url))
            .json(&req)
            .send()
            .await?
            .json()
            .await?;

        if !res.ok {
            anyhow::bail!("Inspect failed: {:?}", res.warnings);
        }

        Ok(res.data.unwrap_or_default())
    }

    pub async fn inspect_deep(
        &self,
        device_id: &str,
        platform: &str,
    ) -> anyhow::Result<serde_json::Value> {
        let req = PyInspectRequest {
            device_id: device_id.to_string(),
            platform: platform.to_string(),
            payload: serde_json::json!({}),
        };

        let res: PyResponse<serde_json::Value> = self
            .client
            .post(format!("{}/inspect/deep", self.base_url))
            .json(&req)
            .send()
            .await?
            .json()
            .await?;

        if !res.ok {
            anyhow::bail!("Deep inspect failed: {:?}", res.warnings);
        }

        Ok(res.data.unwrap_or(serde_json::json!({})))
    }
}

// Global client instance (managed by Tauri)
pub type PyWorkerClientArc = Arc<Mutex<Option<PyWorkerClient>>>;
