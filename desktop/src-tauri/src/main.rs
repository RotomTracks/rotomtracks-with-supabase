#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// use tauri::Manager;

fn main() {
	tauri::Builder::default()
		.plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_notification::init())
		.on_window_event(|window, event| {
			if let tauri::WindowEvent::CloseRequested { api, .. } = event {
				let _ = window.hide();
				api.prevent_close();
			}
		})
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}



