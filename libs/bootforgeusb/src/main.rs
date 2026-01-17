use bootforgeusb;
use std::env;

fn main() {
    env_logger::init();
    
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        print_usage();
        return;
    }
    
    match args[1].as_str() {
        "scan" => {
            let json_mode = args.get(2).map(|s| s == "--json").unwrap_or(false);
            scan_devices(json_mode);
        }
        "version" => {
            println!("BootForgeUSB v{}", env!("CARGO_PKG_VERSION"));
            println!("Evidence-based device detection for Pandora Codex");
        }
        "help" | "--help" | "-h" => {
            print_usage();
        }
        _ => {
            eprintln!("Unknown command: {}", args[1]);
            print_usage();
            std::process::exit(1);
        }
    }
}

fn scan_devices(json_mode: bool) {
    match bootforgeusb::scan() {
        Ok(devices) => {
            if json_mode {
                match serde_json::to_string_pretty(&devices) {
                    Ok(json) => println!("{}", json),
                    Err(e) => {
                        eprintln!("Failed to serialize results: {}", e);
                        std::process::exit(1);
                    }
                }
            } else {
                println!("=== BootForgeUSB Device Scan ===\n");
                println!("Found {} devices\n", devices.len());
                
                for device in devices {
                    println!("Device: {}", device.device_uid);
                    println!("  Platform: {}", device.platform_hint);
                    println!("  Mode: {}", device.mode);
                    println!("  Confidence: {:.1}%", device.confidence * 100.0);
                    println!("  USB: VID:{} PID:{}", device.evidence.usb.vid, device.evidence.usb.pid);
                    
                    if let Some(manufacturer) = &device.evidence.usb.manufacturer {
                        println!("  Manufacturer: {}", manufacturer);
                    }
                    
                    if let Some(product) = &device.evidence.usb.product {
                        println!("  Product: {}", product);
                    }
                    
                    if let Some(serial) = &device.evidence.usb.serial {
                        println!("  Serial: {}", serial);
                    }
                    
                    println!("  Tools:");
                    for (tool, evidence) in &device.evidence.tools {
                        let status = if evidence.seen {
                            "CONFIRMED"
                        } else if evidence.present {
                            "PRESENT"
                        } else {
                            "MISSING"
                        };
                        println!("    {} - {}", tool, status);
                    }
                    
                    if !device.notes.is_empty() {
                        println!("  Notes:");
                        for note in &device.notes {
                            println!("    - {}", note);
                        }
                    }
                    
                    println!();
                }
            }
        }
        Err(e) => {
            eprintln!("Scan failed: {}", e);
            std::process::exit(1);
        }
    }
}

fn print_usage() {
    println!("BootForgeUSB - Evidence-based device detection");
    println!("\nUsage:");
    println!("  bootforgeusb scan [--json]    Scan connected USB devices");
    println!("  bootforgeusb version          Show version information");
    println!("  bootforgeusb help             Show this help message");
    println!("\nOptions:");
    println!("  --json    Output results as JSON");
    println!("\nExamples:");
    println!("  bootforgeusb scan");
    println!("  bootforgeusb scan --json | jq");
    println!("\nEnvironment:");
    println!("  RUST_LOG=debug    Enable debug logging");
}
