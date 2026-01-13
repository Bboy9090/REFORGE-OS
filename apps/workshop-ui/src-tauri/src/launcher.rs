// REFORGE OS - Python Worker Auto-Launcher
// Launches bundled Python runtime and manages lifecycle

use std::process::{Child, Command, Stdio};
use std::path::PathBuf;
use std::io::{BufRead, BufReader};
use std::sync::{Arc, Mutex};

pub struct PythonBackend {
    process: Arc<Mutex<Option<Child>>>,
    port: Arc<Mutex<Option<u16>>>,
}

impl PythonBackend {
    pub fn new() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
            port: Arc::new(Mutex::new(None)),
        }
    }

    pub fn launch(&self, app_dir: &PathBuf) -> Result<u16, Box<dyn std::error::Error>> {
        // Resolve Python executable path
        // In bundled app: app_dir/python/bin/python (or python.exe on Windows)
        // In dev: use system python
        let python_exe = if cfg!(windows) {
            app_dir.join("python").join("python.exe")
        } else {
            app_dir.join("python").join("bin").join("python3")
        };

        // Fallback to system Python if bundled not found (dev mode)
        let python_path = if python_exe.exists() {
            python_exe
        } else {
            // Dev mode: use system Python
            PathBuf::from(if cfg!(windows) { "python" } else { "python3" })
        };

        // Resolve Python app script
        // In bundle: app_dir/python/app/main.py
        // In dev: ../../python/app/main.py (relative to src-tauri)
        let script_path = app_dir.join("python").join("app").join("main.py");
        
        // If script doesn't exist in bundle, try relative path (dev mode)
        let script = if script_path.exists() {
            script_path
        } else {
            // Dev mode: go up from src-tauri/resources to project root
            let mut dev_script = app_dir.clone();
            dev_script.pop(); // resources
            dev_script.pop(); // src-tauri
            dev_script.pop(); // workshop-ui
            dev_script.pop(); // apps
            dev_script.push("python");
            dev_script.push("app");
            dev_script.push("main.py");
            dev_script
        };
        
        if !script.exists() {
            return Err(format!("Python script not found: {:?}", script).into());
        }

        // Set working directory to script's parent
        let working_dir = script.parent()
            .ok_or("Failed to get script directory")?;
        
        // Spawn Python process
        let mut cmd = Command::new(&python_path);
        cmd.current_dir(working_dir)
           .arg(&script)
           .arg("--port")
           .arg("8001") // Fixed port for ForgeWorks API
           .env("POLICY_MODE", "public")
           .stdout(Stdio::piped())
           .stderr(Stdio::piped());

        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        }

        let mut child = cmd.spawn()?;

        // Use fixed port 8001 (as specified in command)
        let port = 8001u16;
        
        // Give Python a moment to start
        std::thread::sleep(Duration::from_millis(1000));
        
        // Verify backend is running by checking health endpoint
        let health_url = format!("http://127.0.0.1:{}/health", port);
        let mut attempts = 0;
        let max_attempts = 20; // 10 seconds total
        
        while attempts < max_attempts {
            if let Ok(response) = reqwest::blocking::get(&health_url) {
                if response.status().is_success() {
                    println!("✅ Python backend health check passed on port {}", port);
                    break;
                }
            }
            attempts += 1;
            if attempts < max_attempts {
                std::thread::sleep(Duration::from_millis(500));
            }
        }
        
        if attempts >= max_attempts {
            return Err("Python backend failed to start or health check failed after 10 seconds".into());
        }

        // Store process and port
        *self.process.lock().unwrap() = Some(child);
        *self.port.lock().unwrap() = Some(port);

        Ok(port)
    }

    pub fn get_port(&self) -> Option<u16> {
        *self.port.lock().unwrap()
    }

    pub fn shutdown(&self) {
        if let Some(mut child) = self.process.lock().unwrap().take() {
            #[cfg(unix)]
            {
                use std::os::unix::process::CommandExt;
                let _ = child.kill();
            }
            #[cfg(windows)]
            {
                let _ = child.kill();
            }
        }
        *self.port.lock().unwrap() = None;
    }
}

impl Drop for PythonBackend {
    fn drop(&mut self) {
        self.shutdown();
    }
}
