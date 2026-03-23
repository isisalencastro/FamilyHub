use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaChatRequest {
    pub model: String,
    pub messages: Vec<OllamaMessage>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaChatResponse {
    pub message: Option<OllamaMessage>,
    pub done: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModel {
    pub name: String,
    pub size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaModelsResponse {
    pub models: Vec<OllamaModel>,
}

/// Send a chat message to Ollama and get a response
#[tauri::command]
async fn chat_with_ollama(
    model: String,
    messages: Vec<OllamaMessage>,
    system_prompt: String,
    ollama_host: Option<String>,
) -> Result<String, String> {
    let host = ollama_host.unwrap_or_else(|| "localhost:11434".to_string());
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| format!("Erro ao criar client HTTP: {}", e))?;

    let mut all_messages = vec![OllamaMessage {
        role: "system".to_string(),
        content: system_prompt,
    }];
    all_messages.extend(messages);

    let request = OllamaChatRequest {
        model,
        messages: all_messages,
        stream: false,
    };

    let response = client
        .post(format!("http://{}/api/chat", host))
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("Erro ao conectar com Ollama ({}): {}. Verifique se o Ollama está rodando.", host, e))?;

    let chat_response: OllamaChatResponse = response
        .json()
        .await
        .map_err(|e| format!("Erro ao processar resposta do Ollama: {}", e))?;

    match chat_response.message {
        Some(msg) => Ok(msg.content),
        None => Err("Ollama não retornou uma resposta".to_string()),
    }
}

/// List available Ollama models
#[tauri::command]
async fn list_ollama_models(ollama_host: Option<String>) -> Result<Vec<String>, String> {
    let host = ollama_host.unwrap_or_else(|| "localhost:11434".to_string());
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Erro ao criar client: {}", e))?;

    let response = client
        .get(format!("http://{}/api/tags", host))
        .send()
        .await
        .map_err(|e| format!("Erro ao conectar com Ollama ({}): {}", host, e))?;

    let models_response: OllamaModelsResponse = response
        .json()
        .await
        .map_err(|e| format!("Erro ao processar modelos: {}", e))?;

    Ok(models_response
        .models
        .into_iter()
        .map(|m| m.name)
        .collect())
}

/// Check if Ollama is running
#[tauri::command]
async fn check_ollama_status(ollama_host: Option<String>) -> Result<bool, String> {
    let host = ollama_host.unwrap_or_else(|| "localhost:11434".to_string());
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .map_err(|_| "Erro".to_string())?;

    match client.get(format!("http://{}", host)).send().await {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .build()
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            chat_with_ollama,
            list_ollama_models,
            check_ollama_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Ring AI");
}
