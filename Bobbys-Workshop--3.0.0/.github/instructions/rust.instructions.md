---
applyTo:
  - "crates/**/*"
  - "src-tauri/src/**/*.rs"
  - "**/Cargo.toml"
  - "**/Cargo.lock"
---

# Rust Code Rules

## Prime Directive

**SAFE, IDIOMATIC RUST. NO UNSAFE UNLESS ABSOLUTELY NECESSARY.**

## Core Requirements

### 1. Error Handling

- **Use `Result<T, E>` for fallible operations**
  ```rust
  // ❌ BAD - Panic in library code
  fn read_device_info(path: &str) -> DeviceInfo {
      std::fs::read_to_string(path).unwrap()  // Don't panic!
  }
  
  // ✅ GOOD - Return Result
  fn read_device_info(path: &str) -> Result<DeviceInfo, std::io::Error> {
      let content = std::fs::read_to_string(path)?;
      Ok(parse_device_info(&content)?)
  }
  ```

- **Use custom error types for better context**
  ```rust
  use thiserror::Error;
  
  #[derive(Error, Debug)]
  pub enum DeviceError {
      #[error("Device not found: {0}")]
      NotFound(String),
      
      #[error("USB communication failed: {0}")]
      UsbError(#[from] rusb::Error),
      
      #[error("Invalid firmware format: {0}")]
      InvalidFirmware(String),
  }
  ```

- **Prefer `?` operator over `unwrap()`**
  ```rust
  // ❌ BAD
  let device = find_device().unwrap();
  
  // ✅ GOOD
  let device = find_device()?;
  
  // ✅ ALSO GOOD - With context
  let device = find_device()
      .map_err(|e| DeviceError::NotFound(format!("Failed to find device: {}", e)))?;
  ```

### 2. Memory Safety

- **Avoid `unsafe` unless necessary**
  - If you must use `unsafe`, document why
  - Minimize `unsafe` block scope
  - Add safety comments explaining invariants

  ```rust
  // ✅ Only if truly necessary
  unsafe {
      // SAFETY: We've verified that ptr is valid and aligned,
      // and the data won't be accessed elsewhere.
      std::ptr::write(ptr, value);
  }
  ```

- **Use smart pointers appropriately**
  - `Box<T>` - Single ownership
  - `Rc<T>` - Shared ownership (single thread)
  - `Arc<T>` - Shared ownership (multi-thread)
  - `RefCell<T>` - Interior mutability (single thread)
  - `Mutex<T>` - Interior mutability (multi-thread)

### 3. Ownership & Borrowing

- **Follow Rust ownership rules naturally**
  ```rust
  // ✅ GOOD - Clear ownership
  fn process_device(device: Device) -> Result<ProcessedDevice, Error> {
      // Takes ownership, consumes device
  }
  
  // ✅ GOOD - Borrowing
  fn check_device(device: &Device) -> bool {
      // Borrows, doesn't consume
  }
  
  // ✅ GOOD - Mutable borrow
  fn update_device(device: &mut Device) -> Result<(), Error> {
      // Mutable borrow for in-place modification
  }
  ```

- **Return owned data, accept borrowed data**
  ```rust
  // ✅ GOOD pattern
  fn create_device(name: &str, serial: &str) -> Device {
      Device {
          name: name.to_string(),
          serial: serial.to_string(),
      }
  }
  ```

### 4. Concurrency

- **Use Rust's type system for thread safety**
  ```rust
  use std::sync::{Arc, Mutex};
  use std::thread;
  
  // ✅ GOOD - Thread-safe shared state
  let devices = Arc::new(Mutex::new(Vec::new()));
  let devices_clone = Arc::clone(&devices);
  
  thread::spawn(move || {
      let mut devices = devices_clone.lock().unwrap();
      devices.push(Device::new());
  });
  ```

- **Prefer channels for communication**
  ```rust
  use std::sync::mpsc;
  
  let (tx, rx) = mpsc::channel();
  
  // Producer
  thread::spawn(move || {
      tx.send(device).unwrap();
  });
  
  // Consumer
  let device = rx.recv()?;
  ```

- **Use async/await for I/O bound operations**
  ```rust
  use tokio;
  
  #[tokio::main]
  async fn main() -> Result<(), Error> {
      let devices = scan_devices().await?;
      for device in devices {
          process_device(device).await?;
      }
      Ok(())
  }
  ```

### 5. Code Style (cargo fmt / clippy)

- **Always run `cargo fmt` before committing**
  ```bash
  cargo fmt --all
  ```

- **Always run `cargo clippy` and fix warnings**
  ```bash
  cargo clippy --all-targets --all-features -- -D warnings
  ```

- **Use `#[must_use]` for important return values**
  ```rust
  #[must_use = "Device handle must be properly closed"]
  pub fn open_device() -> Result<DeviceHandle, Error> {
      // ...
  }
  ```

### 6. Documentation

- **Document public APIs**
  ```rust
  /// Opens a USB device by its serial number.
  ///
  /// # Arguments
  ///
  /// * `serial` - The device serial number to search for
  ///
  /// # Returns
  ///
  /// Returns `Ok(Device)` if device found and opened successfully,
  /// `Err(DeviceError)` otherwise.
  ///
  /// # Examples
  ///
  /// ```
  /// let device = open_device("ABC123")?;
  /// ```
  pub fn open_device(serial: &str) -> Result<Device, DeviceError> {
      // Implementation
  }
  ```

- **Document why, not just what**
  ```rust
  // ❌ BAD - States the obvious
  // Increment counter by 1
  counter += 1;
  
  // ✅ GOOD - Explains reasoning
  // Must increment before flush to maintain consistency with device state
  counter += 1;
  ```

### 7. Testing

- **Write unit tests for all public functions**
  ```rust
  #[cfg(test)]
  mod tests {
      use super::*;
  
      #[test]
      fn test_device_parsing() {
          let input = "Device: ABC123";
          let device = parse_device(input).unwrap();
          assert_eq!(device.serial, "ABC123");
      }
  
      #[test]
      fn test_invalid_device_format() {
          let input = "Invalid";
          assert!(parse_device(input).is_err());
      }
  }
  ```

- **Use integration tests for complex workflows**
  ```rust
  // tests/device_integration.rs
  #[test]
  fn test_full_device_workflow() {
      let device = Device::mock();
      device.connect().unwrap();
      device.flash_firmware(FIRMWARE).unwrap();
      assert_eq!(device.status(), DeviceStatus::Ready);
  }
  ```

- **Mock external dependencies in tests**
  ```rust
  #[cfg(test)]
  pub fn mock_usb_device() -> MockDevice {
      MockDevice {
          serial: "TEST123".to_string(),
          // Test-specific implementation
      }
  }
  ```

### 8. Dependencies

- **Minimize dependencies**
  - Only add what you truly need
  - Prefer well-maintained crates
  - Check security advisories (use `cargo audit`)

- **Pin versions in Cargo.toml**
  ```toml
  [dependencies]
  serde = { version = "1.0", features = ["derive"] }
  tokio = { version = "1.35", features = ["full"] }
  thiserror = "1.0"
  ```

- **Keep Cargo.lock in version control**
  - Ensures reproducible builds
  - Commit it for applications
  - May omit for libraries (project-specific choice)

### 9. Platform-Specific Code

- **Use conditional compilation**
  ```rust
  #[cfg(target_os = "windows")]
  fn platform_specific_init() {
      // Windows implementation
  }
  
  #[cfg(target_os = "macos")]
  fn platform_specific_init() {
      // macOS implementation
  }
  
  #[cfg(target_os = "linux")]
  fn platform_specific_init() {
      // Linux implementation
  }
  ```

- **Fail gracefully on unsupported platforms**
  ```rust
  #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
  compile_error!("This platform is not supported");
  ```

### 10. Performance

- **Profile before optimizing**
  - Use `cargo bench` for benchmarks
  - Use `cargo flamegraph` for profiling
  - Optimize hot paths only

- **Use appropriate data structures**
  - `Vec<T>` - Dynamic array
  - `HashMap<K,V>` - Key-value lookup
  - `BTreeMap<K,V>` - Sorted key-value
  - `HashSet<T>` - Unique values

- **Avoid allocations in hot paths**
  ```rust
  // ❌ BAD - Allocates every iteration
  for i in 0..1000 {
      let s = format!("Device {}", i);
      process(&s);
  }
  
  // ✅ GOOD - Reuse buffer
  let mut buffer = String::with_capacity(20);
  for i in 0..1000 {
      buffer.clear();
      write!(&mut buffer, "Device {}", i).unwrap();
      process(&buffer);
  }
  ```

## Pre-Commit Checklist

- [ ] `cargo fmt` applied (code formatted)
- [ ] `cargo clippy` passes with no warnings
- [ ] `cargo test` passes (all tests green)
- [ ] `cargo build --release` succeeds
- [ ] Documentation updated (if public API changed)
- [ ] No `unwrap()` or `panic!()` in library code
- [ ] Error types are descriptive
- [ ] Platform-specific code is gated
- [ ] Unsafe code documented with safety comments

## Common Mistakes to Avoid

1. **Overusing `clone()`** - Understand ownership instead
2. **Using `unwrap()` everywhere** - Proper error handling
3. **Not running clippy** - Miss common mistakes
4. **Fighting the borrow checker** - Usually means design issue
5. **Premature optimization** - Profile first
6. **Too much `unsafe`** - Defeats Rust's safety
7. **Not writing tests** - Rust makes testing easy
8. **Ignoring compiler warnings** - They're usually right

## Cargo Commands Reference

```bash
# Format code
cargo fmt --all

# Check for errors (fast, no codegen)
cargo check

# Run clippy linter
cargo clippy --all-targets --all-features -- -D warnings

# Run tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_device_parsing

# Build debug
cargo build

# Build release (optimized)
cargo build --release

# Run binary
cargo run

# Run with arguments
cargo run -- --device USB0

# Generate docs
cargo doc --open

# Check for security vulnerabilities
cargo audit

# Benchmark
cargo bench
```

## When in Doubt

1. Check Rust official book: https://doc.rust-lang.org/book/
2. Check Rust by Example: https://doc.rust-lang.org/rust-by-example/
3. Check existing codebase patterns
4. Ask in PR comments
5. Prefer safe code over clever code
6. If compiler complains, it's usually right

## Integration with Other Parts

### FFI (Foreign Function Interface)

If exposing Rust to C/Python/Node:
```rust
#[no_mangle]
pub extern "C" fn rust_function(arg: i32) -> i32 {
    // FFI boundary - be extra careful
    // Validate all inputs
    // Never panic across FFI
    arg + 1
}
```

### Tauri Integration

For Tauri commands:
```rust
#[tauri::command]
async fn scan_devices() -> Result<Vec<Device>, String> {
    // Convert errors to String for JS boundary
    scan_devices_impl()
        .await
        .map_err(|e| e.to_string())
}
```

## Emergency Procedures

### If Build Fails
1. Read error message carefully (Rust errors are descriptive)
2. Check for missing dependencies
3. Run `cargo clean && cargo build` (clean build)
4. Check Rust version (`rustc --version`)

### If Tests Fail
1. Run failing test in isolation: `cargo test test_name -- --nocapture`
2. Check for race conditions in concurrent tests
3. Verify test data/mocks are correct
4. Add debug prints to understand failure

### If Clippy Complains
1. Read the lint explanation
2. Most suggestions are good - follow them
3. If you disagree, document why and allow the lint: `#[allow(clippy::lint_name)]`
