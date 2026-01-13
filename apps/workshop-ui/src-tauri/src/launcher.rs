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
        let script_path = app_dir.join("python").join("app").join("main.py");
        
        // If script doesn't exist in bundle, try relative path (dev mode)
        let script = if script_path.exists() {
            script_path
        } else {
            // Dev mode: assume we're in project root
            PathBuf::from("python/app/main.py")
        };

        // Spawn Python process
        let mut cmd = Command::new(&python_path);
        cmd.arg(&script)
           .arg("--policy-mode")
           .arg("public")
           .arg("--port")
           .arg("0") // Auto-assign port
           .stdout(Stdio::piped())
           .stderr(Stdio::piped());

        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        }

        let mut child = cmd.spawn()?;

        // Read port from stdout (Python prints port number)
        let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
        let reader = BufReader::new(stdout);
        
        // Read first line (should be port number)
        let mut port = None;
        for line in reader.lines() {
            if let Ok(line) = line {
                if let Ok(p) = line.trim().parse::<u16>() {
                    port = Some(p);
                    break;
                }
            }
        }

        let port = port.ok_or("Failed to read port from Python worker")?;

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
