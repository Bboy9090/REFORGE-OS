use clap::{Parser, Subcommand};
use libbootforge::usb::detect_devices;
use log::info;

#[derive(Parser)]
#[command(name = "bootforge")]
#[command(about = "libBootForge USB orchestration CLI", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scan for USB devices
    Scan,
    /// Write image to device
    Write {
        #[arg(short, long)]
        image: String,
        #[arg(short, long)]
        target: String,
    },
    /// Detect device mode
    Detect {
        #[arg(short, long)]
        serial: Option<String>,
    },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Scan => {
            info!("Scanning USB devices...");
            let devices = detect_devices()?;
            if devices.is_empty() {
                println!("No devices found.");
            } else {
                println!("Found {} device(s):", devices.len());
                for dev in devices {
                    println!(
                        "  {:?} - {} {} ({}:{})",
                        dev.platform,
                        dev.manufacturer.unwrap_or_default(),
                        dev.product.unwrap_or_default(),
                        dev.vendor_id,
                        dev.product_id
                    );
                }
            }
        }
        Commands::Write { image, target } => {
            println!("Would write {} to {}", image, target);
        }
        Commands::Detect { serial } => {
            println!("Detecting device mode for {:?}", serial);
        }
    }

    Ok(())
}
