use std::io::Read;
use std::time::Duration;

use anyhow::{Context, Result, ensure};
use reqwest::blocking::{Client, Response};
use reqwest::redirect::{Action, Attempt, Policy};
use semver::Version;
use serde::{Deserialize, Serialize};

pub const WEBSITE_URL: &str = "https://yulab-smu.top/Rho/";
pub const SOURCE_URL: &str = "https://github.com/YuLab-SMU/Rho";
const MAX_MANIFEST_BYTES: u64 = 64 * 1024;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ReleaseChannel {
    Stable,
    Development,
}

impl ReleaseChannel {
    pub fn for_version(version: &Version) -> Self {
        if version.pre.is_empty() {
            Self::Stable
        } else {
            Self::Development
        }
    }

    fn as_str(self) -> &'static str {
        match self {
            Self::Stable => "stable",
            Self::Development => "development",
        }
    }

    fn manifest_url(self) -> String {
        format!("{WEBSITE_URL}updates/{}.json", self.as_str())
    }
}

#[derive(Debug, Deserialize)]
struct UpdateManifest {
    schema_version: u32,
    channel: String,
    version: String,
    published_at: String,
    summary: String,
    release_page_url: String,
    github_release_url: String,
    artifacts: UpdateArtifacts,
}

#[derive(Debug, Deserialize)]
struct UpdateArtifacts {
    windows_x86_64: UpdateArtifact,
    #[serde(default)]
    macos_aarch64: Option<UpdateArtifact>,
}

#[derive(Debug, Deserialize)]
struct UpdateArtifact {
    url: String,
    sha256: String,
    size: u64,
}

#[derive(Debug, Serialize)]
pub struct UpdateCheckResult {
    pub status: &'static str,
    pub channel: ReleaseChannel,
    pub installed_version: String,
    pub available_version: String,
    pub published_at: String,
    pub summary: String,
    pub release_page_url: String,
}

pub fn check_for_updates(installed: &str) -> Result<UpdateCheckResult> {
    let installed_version = Version::parse(installed).context("installed version is not SemVer")?;
    let channel = ReleaseChannel::for_version(&installed_version);
    let client = Client::builder()
        .connect_timeout(Duration::from_secs(5))
        .timeout(Duration::from_secs(10))
        .redirect(Policy::custom(manifest_redirect))
        .user_agent(format!("Rho/{installed}"))
        .build()
        .context("creating update client")?;
    let response = client
        .get(channel.manifest_url())
        .send()
        .context("UPDATE_NETWORK: could not reach the update service")?;
    let bytes = bounded_response(response)?;
    evaluate_manifest(installed, channel, &bytes)
}

fn manifest_redirect(attempt: Attempt<'_>) -> Action {
    let allowed = attempt.url().scheme() == "https"
        && attempt.url().host_str() == Some("yulab-smu.top")
        && attempt.url().path().starts_with("/Rho/");
    if !allowed {
        return attempt.error("update manifest redirect left the Rho website");
    }
    if attempt.previous().len() >= 3 {
        return attempt.error("too many update manifest redirects");
    }
    attempt.follow()
}

fn bounded_response(response: Response) -> Result<Vec<u8>> {
    ensure!(
        response.status().is_success(),
        "UPDATE_HTTP: update service returned HTTP {}",
        response.status()
    );
    if let Some(length) = response.content_length() {
        ensure!(
            length <= MAX_MANIFEST_BYTES,
            "UPDATE_INVALID: manifest is too large"
        );
    }
    let mut bytes = Vec::new();
    response
        .take(MAX_MANIFEST_BYTES + 1)
        .read_to_end(&mut bytes)
        .context("UPDATE_NETWORK: could not read the update manifest")?;
    ensure!(
        bytes.len() as u64 <= MAX_MANIFEST_BYTES,
        "UPDATE_INVALID: manifest is too large"
    );
    Ok(bytes)
}

fn evaluate_manifest(
    installed: &str,
    requested_channel: ReleaseChannel,
    bytes: &[u8],
) -> Result<UpdateCheckResult> {
    let manifest: UpdateManifest =
        serde_json::from_slice(bytes).context("UPDATE_INVALID: manifest is not valid JSON")?;
    validate_manifest(&manifest, requested_channel)?;
    let installed_version = Version::parse(installed).context("installed version is not SemVer")?;
    let available_version =
        Version::parse(&manifest.version).context("UPDATE_INVALID: version is not SemVer")?;
    let status = match available_version.cmp(&installed_version) {
        std::cmp::Ordering::Greater => "update_available",
        std::cmp::Ordering::Equal => "up_to_date",
        std::cmp::Ordering::Less => "newer_than_feed",
    };
    Ok(UpdateCheckResult {
        status,
        channel: requested_channel,
        installed_version: installed.to_string(),
        available_version: manifest.version,
        published_at: manifest.published_at,
        summary: manifest.summary,
        release_page_url: manifest.release_page_url,
    })
}

fn validate_manifest(manifest: &UpdateManifest, requested_channel: ReleaseChannel) -> Result<()> {
    validate_manifest_for_platform(manifest, requested_channel, current_update_platform())
}

fn current_update_platform() -> &'static str {
    if cfg!(all(target_os = "macos", target_arch = "aarch64")) {
        "macos_aarch64"
    } else if cfg!(all(target_os = "windows", target_arch = "x86_64")) {
        "windows_x86_64"
    } else {
        "unsupported"
    }
}

fn validate_manifest_for_platform(
    manifest: &UpdateManifest,
    requested_channel: ReleaseChannel,
    platform: &str,
) -> Result<()> {
    ensure!(
        manifest.schema_version == 1,
        "UPDATE_INVALID: unsupported schema version"
    );
    ensure!(
        manifest.channel == requested_channel.as_str(),
        "UPDATE_INVALID: channel mismatch"
    );
    let version =
        Version::parse(&manifest.version).context("UPDATE_INVALID: version is not SemVer")?;
    if requested_channel == ReleaseChannel::Stable {
        ensure!(
            version.pre.is_empty(),
            "UPDATE_INVALID: stable feed contains a prerelease"
        );
    }
    ensure!(
        chrono::DateTime::parse_from_rfc3339(&manifest.published_at).is_ok(),
        "UPDATE_INVALID: published_at is not RFC 3339"
    );
    ensure!(
        !manifest.summary.chars().any(char::is_control) && manifest.summary.chars().count() <= 500,
        "UPDATE_INVALID: summary is not bounded plain text"
    );
    validate_rho_page_url(&manifest.release_page_url)?;
    validate_github_release_url(&manifest.github_release_url, false)?;
    validate_artifact(&manifest.artifacts.windows_x86_64)?;
    if let Some(artifact) = &manifest.artifacts.macos_aarch64 {
        validate_artifact(artifact)?;
    }
    match platform {
        "windows_x86_64" => {}
        "macos_aarch64" => ensure!(
            manifest.artifacts.macos_aarch64.is_some(),
            "UPDATE_PLATFORM_UNAVAILABLE: this release has no Apple Silicon installer"
        ),
        _ => ensure!(
            false,
            "UPDATE_PLATFORM_UNAVAILABLE: this platform has no supported installer"
        ),
    }
    Ok(())
}

fn validate_artifact(artifact: &UpdateArtifact) -> Result<()> {
    validate_github_release_url(&artifact.url, true)?;
    ensure!(
        artifact.sha256.len() == 64
            && artifact
                .sha256
                .chars()
                .all(|ch| ch.is_ascii_hexdigit() && !ch.is_ascii_uppercase()),
        "UPDATE_INVALID: SHA-256 is invalid"
    );
    ensure!(
        artifact.size > 0,
        "UPDATE_INVALID: artifact size is invalid"
    );
    Ok(())
}

pub fn validate_product_url(value: &str) -> Result<()> {
    let url = reqwest::Url::parse(value).context("UPDATE_INVALID: release page URL is invalid")?;
    let rho_page = url.scheme() == "https"
        && url.host_str() == Some("yulab-smu.top")
        && (url.path() == "/Rho" || url.path().starts_with("/Rho/"));
    let source = url.scheme() == "https"
        && url.host_str() == Some("github.com")
        && (url.path() == "/YuLab-SMU/Rho" || url.path() == "/YuLab-SMU/Rho/");
    ensure!(
        rho_page || source,
        "UPDATE_INVALID: release page URL is not allowlisted"
    );
    ensure!(
        url.username().is_empty() && url.password().is_none(),
        "UPDATE_INVALID: URL credentials are forbidden"
    );
    ensure!(
        url.query().is_none() && url.fragment().is_none(),
        "UPDATE_INVALID: URL query and fragment are forbidden"
    );
    Ok(())
}

fn validate_rho_page_url(value: &str) -> Result<()> {
    validate_product_url(value)?;
    let url = reqwest::Url::parse(value)?;
    ensure!(
        url.host_str() == Some("yulab-smu.top"),
        "UPDATE_INVALID: release page must use the Rho website"
    );
    Ok(())
}

fn validate_github_release_url(value: &str, download: bool) -> Result<()> {
    let url = reqwest::Url::parse(value).context("UPDATE_INVALID: GitHub URL is invalid")?;
    let required = if download {
        "/YuLab-SMU/Rho/releases/download/"
    } else {
        "/YuLab-SMU/Rho/releases/"
    };
    ensure!(
        url.scheme() == "https"
            && url.host_str() == Some("github.com")
            && url.path().starts_with(required),
        "UPDATE_INVALID: GitHub URL is not allowlisted"
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn manifest(channel: &str, version: &str) -> Vec<u8> {
        serde_json::to_vec(&json!({
            "schema_version": 1,
            "channel": channel,
            "version": version,
            "published_at": "2026-07-25T00:00:00Z",
            "summary": "A bounded release summary.",
            "release_page_url": "https://yulab-smu.top/Rho/",
            "github_release_url": format!("https://github.com/YuLab-SMU/Rho/releases/tag/v{version}"),
            "artifacts": { "windows_x86_64": {
                "url": format!("https://github.com/YuLab-SMU/Rho/releases/download/v{version}/Rho_{version}_x64-setup.exe"),
                "sha256": "97bc0a0aad9889c9027e30e07dd3a5ef38885c43e5ace5dbb14aaf8bca0ef019",
                "size": 15854119
            }, "macos_aarch64": {
                "url": format!("https://github.com/YuLab-SMU/Rho/releases/download/v{version}/Rho_{version}_aarch64.dmg"),
                "sha256": "97bc0a0aad9889c9027e30e07dd3a5ef38885c43e5ace5dbb14aaf8bca0ef019",
                "size": 20554119
            }}
        })).unwrap()
    }

    #[test]
    fn derives_release_channel() {
        assert_eq!(
            ReleaseChannel::for_version(&Version::parse("0.2.0").unwrap()),
            ReleaseChannel::Stable
        );
        assert_eq!(
            ReleaseChannel::for_version(&Version::parse("0.2.0-dev.12").unwrap()),
            ReleaseChannel::Development
        );
    }

    #[test]
    fn compares_development_versions_as_semver() {
        let result = evaluate_manifest(
            "0.2.0-dev.9",
            ReleaseChannel::Development,
            &manifest("development", "0.2.0-dev.12"),
        )
        .unwrap();
        assert_eq!(result.status, "update_available");
        let stable = evaluate_manifest(
            "0.2.0-dev.12",
            ReleaseChannel::Development,
            &manifest("development", "0.2.0"),
        )
        .unwrap();
        assert_eq!(stable.status, "update_available");
    }

    #[test]
    fn reports_equal_and_newer_local_versions() {
        assert_eq!(
            evaluate_manifest(
                "0.2.0",
                ReleaseChannel::Stable,
                &manifest("stable", "0.2.0")
            )
            .unwrap()
            .status,
            "up_to_date"
        );
        assert_eq!(
            evaluate_manifest(
                "0.3.0",
                ReleaseChannel::Stable,
                &manifest("stable", "0.2.0")
            )
            .unwrap()
            .status,
            "newer_than_feed"
        );
    }

    #[test]
    fn stable_rejects_prerelease_and_channel_mismatch() {
        assert!(
            evaluate_manifest(
                "0.2.0",
                ReleaseChannel::Stable,
                &manifest("stable", "0.3.0-dev.1")
            )
            .is_err()
        );
        assert!(
            evaluate_manifest(
                "0.2.0",
                ReleaseChannel::Stable,
                &manifest("development", "0.3.0")
            )
            .is_err()
        );
    }

    #[test]
    fn rejects_untrusted_urls_and_invalid_fields() {
        let mut value: serde_json::Value =
            serde_json::from_slice(&manifest("development", "0.2.0-dev.12")).unwrap();
        value["release_page_url"] = json!("https://example.test/Rho/");
        assert!(
            evaluate_manifest(
                "0.2.0-dev.1",
                ReleaseChannel::Development,
                &serde_json::to_vec(&value).unwrap()
            )
            .is_err()
        );
        value["release_page_url"] = json!("https://yulab-smu.top/Rho/");
        value["artifacts"]["windows_x86_64"]["sha256"] = json!("ABC");
        assert!(
            evaluate_manifest(
                "0.2.0-dev.1",
                ReleaseChannel::Development,
                &serde_json::to_vec(&value).unwrap()
            )
            .is_err()
        );
    }

    #[test]
    fn accepts_optional_apple_silicon_artifact() {
        let mut value: serde_json::Value =
            serde_json::from_slice(&manifest("development", "0.4.0-dev.1")).unwrap();
        value["artifacts"]["macos_aarch64"] = json!({
            "url": "https://github.com/YuLab-SMU/Rho/releases/download/v0.4.0-dev.1/Rho_0.4.0-dev.1_aarch64.dmg",
            "sha256": "a".repeat(64),
            "size": 20_000_000
        });
        assert!(
            evaluate_manifest(
                "0.4.0-dev.0",
                ReleaseChannel::Development,
                &serde_json::to_vec(&value).unwrap()
            )
            .is_ok()
        );
    }

    #[test]
    fn preserves_windows_only_compatibility_but_reports_missing_macos_artifact() {
        let mut value: serde_json::Value =
            serde_json::from_slice(&manifest("development", "0.4.0-dev.1")).unwrap();
        value["artifacts"]
            .as_object_mut()
            .unwrap()
            .remove("macos_aarch64");
        let parsed: UpdateManifest = serde_json::from_value(value).unwrap();
        assert!(
            validate_manifest_for_platform(&parsed, ReleaseChannel::Development, "windows_x86_64")
                .is_ok()
        );
        let error =
            validate_manifest_for_platform(&parsed, ReleaseChannel::Development, "macos_aarch64")
                .unwrap_err();
        assert!(error.to_string().contains("UPDATE_PLATFORM_UNAVAILABLE"));
    }

    #[test]
    fn rejects_invalid_apple_silicon_artifact() {
        let mut value: serde_json::Value =
            serde_json::from_slice(&manifest("development", "0.4.0-dev.1")).unwrap();
        value["artifacts"]["macos_aarch64"] = json!({
            "url": "https://example.test/Rho_0.4.0-dev.1_aarch64.dmg",
            "sha256": "a".repeat(64),
            "size": 20_000_000
        });
        assert!(
            evaluate_manifest(
                "0.4.0-dev.0",
                ReleaseChannel::Development,
                &serde_json::to_vec(&value).unwrap()
            )
            .is_err()
        );
        value["artifacts"]["macos_aarch64"]["url"] = json!(
            "https://github.com/YuLab-SMU/Rho/releases/download/v0.4.0-dev.1/Rho_0.4.0-dev.1_aarch64.dmg"
        );
        value["artifacts"]["macos_aarch64"]["sha256"] = json!("ABC");
        assert!(
            evaluate_manifest(
                "0.4.0-dev.0",
                ReleaseChannel::Development,
                &serde_json::to_vec(&value).unwrap()
            )
            .is_err()
        );
        value["artifacts"]["macos_aarch64"]["sha256"] = json!("a".repeat(64));
        value["artifacts"]["macos_aarch64"]["size"] = json!(0);
        assert!(
            evaluate_manifest(
                "0.4.0-dev.0",
                ReleaseChannel::Development,
                &serde_json::to_vec(&value).unwrap()
            )
            .is_err()
        );
    }
}
