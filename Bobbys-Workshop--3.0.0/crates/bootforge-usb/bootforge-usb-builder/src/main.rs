use clap::Parser;
use log::info;

#[derive(Parser)]
#[command(name = "bootforge-usb-builder")]
#[command(about = "Create bootable BootForge USB with partitions", long_about = None)]
struct Args {
    /// Target device (e.g., /dev/sdb)
    #[arg(short, long)]
    device: String,

    /// Create private/encrypted partition
    #[arg(short, long)]
    private: bool,

    /// Encryption password
    #[arg(short, long)]
    password: Option<String>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .init();

    let args = Args::parse();

    info!("Building BootForge USB on {}", args.device);
    info!("Private partition: {}", args.private);

    if args.private && args.password.is_none() {
        eprintln!("Error: --password required when --private is set");
        std::process::exit(1);
    }

    println!("BootForge USB builder initialized (stub)");
    println!("  Device: {}", args.device);
    println!("  Private: {}", args.private);

    Ok(())
}
