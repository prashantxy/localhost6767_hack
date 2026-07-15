// src-tauri/src/lib.rs

#[derive(serde::Serialize)]
struct Source {
    title: String,
    timestamp: String,
    confidence: f64,
    #[serde(rename = "type")] 
    source_type: String,
}

#[derive(serde::Serialize)]
struct AiResponse {
    answer: String,
    sources: Vec<Source>,
}

#[tauri::command]
async fn query_memory_pipeline(query: String) -> Result<AiResponse, String> {
    Ok(AiResponse {
        answer: format!("Based on your memories about '{}'...", query),
        // Empty vector for now until you connect your actual Supermemory DB
        sources: vec![], 
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 1. Initialize the global shortcut plugin so the Cmd+Shift+Space hotkey works
        .plugin(tauri_plugin_global_shortcut::Builder::new().build()) 
        
        // 2. Register your custom backend command
        .invoke_handler(tauri::generate_handler![query_memory_pipeline]) 
        
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}