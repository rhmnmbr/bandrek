// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use tauri::Manager;

#[cfg(target_os = "windows")]
fn apply_windows_taskbar_icon(hwnd: isize) {
    use windows_sys::Win32::System::LibraryLoader::GetModuleHandleW;
    use windows_sys::Win32::UI::Shell::SetCurrentProcessExplicitAppUserModelID;
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetSystemMetrics, LoadImageW, SendMessageW, ICON_BIG, ICON_SMALL, IMAGE_ICON,
        LR_DEFAULTSIZE, SM_CXSMICON, SM_CYSMICON, WM_SETICON,
    };

    unsafe {
        // Explicitly set AppUserModelID so Windows Taskbar pins and identifies Bandrek independently
        let app_id: [u16; 16] = [
            'c' as u16, 'o' as u16, 'm' as u16, '.' as u16,
            'b' as u16, 'a' as u16, 'n' as u16, 'd' as u16,
            'r' as u16, 'e' as u16, 'k' as u16, '.' as u16,
            'a' as u16, 'p' as u16, 'p' as u16, 0,
        ];
        let _ = SetCurrentProcessExplicitAppUserModelID(app_id.as_ptr());

        let h_instance = GetModuleHandleW(std::ptr::null());
        // 32512 is the IDI_APPLICATION resource embedded by tauri-build
        let h_icon_big = LoadImageW(
            h_instance,
            32512 as *const u16,
            IMAGE_ICON,
            0,
            0,
            LR_DEFAULTSIZE,
        );
        let h_icon_small = LoadImageW(
            h_instance,
            32512 as *const u16,
            IMAGE_ICON,
            GetSystemMetrics(SM_CXSMICON),
            GetSystemMetrics(SM_CYSMICON),
            0,
        );

        if !h_icon_big.is_null() {
            SendMessageW(hwnd as _, WM_SETICON, ICON_BIG as _, h_icon_big as _);
        }
        if !h_icon_small.is_null() {
            SendMessageW(hwnd as _, WM_SETICON, ICON_SMALL as _, h_icon_small as _);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                if let Some(icon) = app.default_window_icon() {
                    let _ = window.set_icon(icon.clone());
                }
                #[cfg(target_os = "windows")]
                if let Ok(hwnd) = window.hwnd() {
                    apply_windows_taskbar_icon(hwnd.0 as _);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


