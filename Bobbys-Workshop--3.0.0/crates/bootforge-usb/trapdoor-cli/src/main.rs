use clap::{Parser, Subcommand};
use libbootforge::trapdoor::BobbyDevBridge;
use std::io::{self, Read};
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "trapdoor_cli")]
#[command(about = "Trapdoor CLI wrapper for Python/TypeScript integration", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
    
    /// Tools directory path
    #[arg(long)]
    tools_dir: Option<PathBuf>,
}

#[derive(Subcommand)]
enum Commands {
    /// Execute a tool with arguments (reads JSON from stdin)
    Execute,
    
    /// Check if a tool is available
    Check {
        /// Tool name to check
        tool: String,
    },
    
    /// Get tool information
    Info {
        /// Tool name
        tool: String,
    },
    
    /// List all available tools
    List,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();
    
    let cli = Cli::parse();
    
    let bridge = if let Some(tools_dir) = cli.tools_dir {
        BobbyDevBridge::with_tools_dir(tools_dir)
    } else {
        BobbyDevBridge::new()
    };
    
    match cli.command {
        Commands::Execute => {
            // Read JSON request from stdin
            let mut buffer = String::new();
            io::stdin().read_to_string(&mut buffer)?;
            
            let response = bridge.execute_tool_json(&buffer).await;
            println!("{}", response);
        }
        Commands::Check { tool } => {
            let info_json = bridge.get_tool_info_json(&tool);
            let info: serde_json::Value = serde_json::from_str(&info_json)?;
            
            if info["available"].as_bool().unwrap_or(false) {
                std::process::exit(0);
            } else {
                eprintln!("Tool '{}' is not available", tool);
                std::process::exit(1);
            }
        }
        Commands::Info { tool } => {
            let info_json = bridge.get_tool_info_json(&tool);
            println!("{}", info_json);
        }
        Commands::List => {
            let tools_json = bridge.list_available_tools_json();
            println!("{}", tools_json);
        }
    }
    
    Ok(())
}
