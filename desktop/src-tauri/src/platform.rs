use std::ffi::OsString;
use std::path::Path;
use std::process::Command;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum DesktopPlatform {
    Windows,
    Macos,
    Linux,
}

#[derive(Debug, Eq, PartialEq)]
struct CommandSpec {
    program: OsString,
    arguments: Vec<OsString>,
}

fn current_platform() -> DesktopPlatform {
    if cfg!(target_os = "windows") {
        DesktopPlatform::Windows
    } else if cfg!(target_os = "macos") {
        DesktopPlatform::Macos
    } else {
        DesktopPlatform::Linux
    }
}

fn open_url_spec(platform: DesktopPlatform, url: &str) -> CommandSpec {
    match platform {
        DesktopPlatform::Windows => CommandSpec {
            program: "explorer.exe".into(),
            arguments: vec![url.into()],
        },
        DesktopPlatform::Macos => CommandSpec {
            program: "open".into(),
            arguments: vec![url.into()],
        },
        DesktopPlatform::Linux => CommandSpec {
            program: "xdg-open".into(),
            arguments: vec![url.into()],
        },
    }
}

fn reveal_path_spec(platform: DesktopPlatform, path: &Path) -> CommandSpec {
    match platform {
        DesktopPlatform::Windows => CommandSpec {
            program: "explorer.exe".into(),
            arguments: vec!["/select,".into(), path.as_os_str().to_owned()],
        },
        DesktopPlatform::Macos => CommandSpec {
            program: "open".into(),
            arguments: vec!["-R".into(), path.as_os_str().to_owned()],
        },
        DesktopPlatform::Linux => CommandSpec {
            program: "xdg-open".into(),
            arguments: vec![path.parent().unwrap_or(path).as_os_str().to_owned()],
        },
    }
}

fn command_from_spec(spec: CommandSpec) -> Command {
    let mut command = Command::new(spec.program);
    command.args(spec.arguments);
    command
}

pub fn open_url_command(url: &str) -> Command {
    command_from_spec(open_url_spec(current_platform(), url))
}

pub fn reveal_path_command(path: &Path) -> Command {
    command_from_spec(reveal_path_spec(current_platform(), path))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn macos_open_specs_preserve_urls_and_unicode_paths() {
        assert_eq!(
            open_url_spec(DesktopPlatform::Macos, "https://yulab-smu.top/Rho/"),
            CommandSpec {
                program: "open".into(),
                arguments: vec!["https://yulab-smu.top/Rho/".into()],
            }
        );
        let path = PathBuf::from("/Users/研究者/Rho logs/startup.log");
        assert_eq!(
            reveal_path_spec(DesktopPlatform::Macos, &path),
            CommandSpec {
                program: "open".into(),
                arguments: vec!["-R".into(), path.into_os_string()],
            }
        );
    }

    #[test]
    fn windows_open_specs_retain_existing_behavior() {
        let path = PathBuf::from(r"C:\Users\Example User\Rho\startup.log");
        assert_eq!(
            open_url_spec(DesktopPlatform::Windows, "https://github.com/YuLab-SMU/Rho"),
            CommandSpec {
                program: "explorer.exe".into(),
                arguments: vec!["https://github.com/YuLab-SMU/Rho".into()],
            }
        );
        assert_eq!(
            reveal_path_spec(DesktopPlatform::Windows, &path),
            CommandSpec {
                program: "explorer.exe".into(),
                arguments: vec!["/select,".into(), path.into_os_string()],
            }
        );
    }

    #[test]
    fn linux_reveal_opens_the_parent_directory() {
        let path = PathBuf::from("/tmp/Rho logs/startup.log");
        assert_eq!(
            reveal_path_spec(DesktopPlatform::Linux, &path),
            CommandSpec {
                program: "xdg-open".into(),
                arguments: vec![PathBuf::from("/tmp/Rho logs").into_os_string()],
            }
        );
    }
}
