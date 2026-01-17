use crate::Result;

pub struct RawWriter;
pub struct ApfsWriter;
pub struct NtfsWriter;
pub struct ExtWriter;

impl RawWriter {
    pub async fn write_raw(_data: &[u8], _target: &str) -> Result<()> {
        log::info!("Writing raw image to {}", _target);
        Ok(())
    }
}

impl ApfsWriter {
    pub async fn write_apfs(_image: &str, _target: &str) -> Result<()> {
        log::info!("Writing APFS image to {}", _target);
        Ok(())
    }
}

impl NtfsWriter {
    pub async fn write_ntfs(_image: &str, _target: &str) -> Result<()> {
        log::info!("Writing NTFS image to {}", _target);
        Ok(())
    }
}

impl ExtWriter {
    pub async fn write_ext(_image: &str, _target: &str) -> Result<()> {
        log::info!("Writing EXT image to {}", _target);
        Ok(())
    }
}
