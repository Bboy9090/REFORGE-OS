#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use std::sync::Arc;
use tauri::command;

mod launcher;
use launcher::PythonBackend;

// Helper to run Python scripts
fn run_python(script: &str, args: &[&str]) -> Result<String, String> {
    use std::path::PathBuf;
    use std::env;
    
    // Get the workspace root - try multiple methods
    let mut script_path = if let Ok(current_dir) = env::current_dir() {
        // In dev mode, current_dir is usually the workspace root
        let mut path = current_dir;
        // If we're in apps/workshop-ui, go up two levels
        if path.ends_with("workshop-ui") {
            path.pop();
            path.pop();
        } else if path.ends_with("apps") {
            path.pop();
        }
        path.push(script);
        path
    } else {
        // Fallback: try to resolve from executable location
        let mut path = PathBuf::from(env::current_exe().unwrap());
        path.pop(); // Remove exe name
        path.pop(); // Remove debug/release
        path.pop(); // Remove target
        path.pop(); // Remove src-tauri
        path.pop(); // Remove workshop-ui
        path.pop(); // Remove apps
        path.push(script);
        path
    };
    
    let output = Command::new("python")
        .arg(&script_path)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute Python script: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Python script error: {}", stderr))
    }
}

#[command]
async fn analyze_device(device_info: String, actor: String) -> Result<String, String> {
    // Escape the device_info for shell
    let device_info_escaped = device_info.replace('"', "\\\"");
    let actor_escaped = actor.replace('"', "\\\"");
    run_python("reforge_api.py", &["analyze_device", &device_info_escaped, &actor_escaped])
}

#[command]
async fn get_ops_metrics() -> Result<String, String> {
    run_python("reforge_api.py", &["get_ops_metrics"])
}

#[command]
async fn get_compliance_summary(device_id: Option<String>) -> Result<String, String> {
    match device_id {
        Some(id) => run_python("reforge_api.py", &["get_compliance_summary", &id]),
        None => run_python("reforge_api.py", &["get_compliance_summary"])
    }
}

#[command]
async fn export_compliance_report(device_id: String) -> Result<String, String> {
    run_python("reforge_api.py", &["export_compliance_report", &device_id])
}

#[command]
async fn get_certifications() -> Result<String, String> {
    run_python("reforge_api.py", &["get_certifications"])
}

#[command]
async fn get_legal_classification(device_id: Option<String>) -> Result<String, String> {
    match device_id {
        Some(id) => run_python("reforge_api.py", &["get_legal_classification", &id]),
        None => run_python("reforge_api.py", &["get_legal_classification"])
    }
}

#[command]
async fn get_interpretive_context(device_id: Option<String>) -> Result<String, String> {
    match device_id {
        Some(id) => run_python("reforge_api.py", &["get_interpretive_context", &id]),
        None => run_python("reforge_api.py", &["get_interpretive_context"])
    }
}

// BootForge commands
#[command]
async fn list_drives() -> Result<String, String> {
    run_python("bootforge_cli.py", &["list", "--json"])
}

#[command]
async fn get_drive_smart(device_id: String) -> Result<String, String> {
    run_python("bootforge_cli.py", &["smart", &device_id])
}

// Phoenix Key commands
#[command]
async fn list_os_recipes() -> Result<String, String> {
    run_python("phoenix_api_cli.py", &["list", "--json"])
}

#[command]
async fn deploy_os(recipe_key: String, target_dev: String) -> Result<String, String> {
    run_python("phoenix_api_cli.py", &["deploy", &recipe_key, &target_dev, "--verify"])
}

// Bobby Dev Mode commands
#[command]
async fn devmode_list_profiles() -> Result<String, String> {
    run_python("bobby_dev_mode/api_cli.py", &["list-profiles"])
}

#[command]
async fn devmode_run_module(profile: String, module: String) -> Result<String, String> {
    run_python("bobby_dev_mode/api_cli.py", &["run", &profile, &module])
}

// History/CRM commands
#[command]
async fn list_cases() -> Result<String, String> {
    run_python("history_api_cli.py", &["list_cases"])
}

#[command]
async fn load_case(ticket_id: String) -> Result<String, String> {
    run_python("history_api_cli.py", &["load_case", &ticket_id])
}

#[command]
async fn list_master_tickets() -> Result<String, String> {
    run_python("history_api_cli.py", &["list_master_tickets"])
}

#[command]
async fn create_master_ticket(label: String, description: String) -> Result<String, String> {
    run_python("history_api_cli.py", &["create_master_ticket", &label, &description])
}

#[command]
async fn attach_case_to_master(master_id: String, case_id: String) -> Result<String, String> {
    run_python("history_api_cli.py", &["attach_case", &master_id, &case_id])
}

// CRM commands
#[command]
async fn list_customers() -> Result<String, String> {
    run_python("crm_api_cli.py", &["list_customers"])
}

#[command]
async fn add_customer(name: String, phone: String, email: String) -> Result<String, String> {
    run_python("crm_api_cli.py", &["add_customer", &name, &phone, &email])
}

#[command]
async fn list_devices(customer_id: Option<String>) -> Result<String, String> {
    match customer_id {
        Some(id) => run_python("crm_api_cli.py", &["list_devices", &id]),
        None => run_python("crm_api_cli.py", &["list_devices"])
    }
}

#[command]
async fn add_device(customer_id: String, brand: String, model: String, serial: String) -> Result<String, String> {
    run_python("crm_api_cli.py", &["add_device", &customer_id, &brand, &model, &serial])
}

// Case Management commands (repair shop intake)
#[command]
async fn create_repair_case(customer_name: String, customer_email: String, customer_phone: String, notes: String) -> Result<String, String> {
    run_python("cases_api_cli.py", &["create", &customer_name, &customer_email, &customer_phone, &notes])
}

#[command]
async fn list_repair_cases(status: Option<String>) -> Result<String, String> {
    match status {
        Some(s) => run_python("cases_api_cli.py", &["list", &s]),
        None => run_python("cases_api_cli.py", &["list"])
    }
}

#[command]
async fn get_repair_case(case_id: String) -> Result<String, String> {
    run_python("cases_api_cli.py", &["get", &case_id])
}

#[command]
async fn add_device_to_repair_case(case_id: String, platform: String, model: Option<String>, serial: Option<String>, imei: Option<String>) -> Result<String, String> {
    // Build args vector - Python CLI handles optional parameters by checking sys.argv length
    let mut args: Vec<String> = vec!["add-device".to_string(), case_id, platform];
    if let Some(m) = model {
        args.push(m);
        if let Some(s) = serial {
            args.push(s);
            if let Some(i) = imei {
                args.push(i);
            }
        }
    }
    // Convert to string slices for the function call
    let args_refs: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    run_python("cases_api_cli.py", &args_refs)
}

// Reports commands
#[command]
async fn export_case_pdf(ticket_id: String, case_data: String) -> Result<String, String> {
    run_python("reports_api_cli.py", &["export_pdf", &ticket_id, &case_data])
}

// Bobby Dev Mode - list modules
#[command]
async fn devmode_list_modules() -> Result<String, String> {
    run_python("bobby_dev_mode/api_cli.py", &["list-modules"])
}

// BootForge - write image
#[command]
async fn write_image(image_path: String, target_dev: String, verify: bool) -> Result<String, String> {
    if verify {
        run_python("bootforge_cli.py", &["write", &image_path, &target_dev, "--verify", "--yes", "--json"])
    } else {
        run_python("bootforge_cli.py", &["write", &image_path, &target_dev, "--no-verify", "--yes", "--json"])
    }
}

// Phoenix Key - get recipe and recommend
#[command]
async fn get_recipe(key: String) -> Result<String, String> {
    run_python("phoenix_api_cli.py", &["get", &key])
}

#[command]
async fn recommend_recipe(device_id: Option<String>) -> Result<String, String> {
    match device_id {
        Some(id) => run_python("phoenix_api_cli.py", &["recommend", "--device", &id]),
        None => run_python("phoenix_api_cli.py", &["recommend"])
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Get resource directory (where bundled Python lives)
            let resource_dir = app.path_resolver()
                .resource_dir()
                .ok_or("Failed to get resource directory")?;
            
            // Launch Python backend
            let backend = Arc::new(PythonBackend::new());
            match backend.launch(&resource_dir) {
                Ok(port) => {
                    println!("✅ Python backend launched on port {}", port);
                    app.manage(backend);
                    app.manage(port);
                }
                Err(e) => {
                    eprintln!("⚠️ Failed to launch Python backend: {}", e);
                    eprintln!("⚠️ Continuing without backend (dev mode)");
                    // Still manage backend (will be None)
                    app.manage(backend);
                    app.manage(0u16); // Port 0 indicates backend not available
                }
            }
            
            Ok(())
        })
        .on_window_event(|_app, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Backend will be cleaned up via Drop
            }
        })
        .invoke_handler(tauri::generate_handler![
            analyze_device,
            get_ops_metrics,
            get_compliance_summary,
            export_compliance_report,
            get_certifications,
            get_legal_classification,
            get_interpretive_context,
            list_drives,
            get_drive_smart,
            write_image,
            list_os_recipes,
            get_recipe,
            deploy_os,
            recommend_recipe,
            devmode_list_profiles,
            devmode_list_modules,
            devmode_run_module,
            list_cases,
            load_case,
            list_master_tickets,
            create_master_ticket,
            attach_case_to_master,
            list_customers,
            add_customer,
            list_devices,
            add_device,
            create_repair_case,
            list_repair_cases,
            get_repair_case,
            add_device_to_repair_case,
            export_case_pdf,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}