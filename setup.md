# Family Hub Setup Guide

Bem-vindo ao **Family Hub**! Este guia irá ajudá-lo a configurar o projeto localmente para desenvolvimento.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:
- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- [Rust & Cargo](https://rustup.rs/) (Necessário apenas para compilar o app Desktop com Tauri)
- Conta no [Supabase](https://supabase.com/)

## 🚀 Passo a Passo: Configuração Local

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/family-hub.git
cd family-hub
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
Copie o arquivo `.env.example` para criar o seu próprio arquivo `.env`:
```bash
cp .env.example .env
```

### 4. Configuração do Supabase
O Family Hub utiliza o Supabase como backend (banco de dados e autenticação).

1. Crie uma conta no [Supabase](https://supabase.com/).
2. Crie um novo projeto.
3. No painel do projeto (Settings > API), copie:
   - **Project URL**
   - **Project API Key (anon/public)**
4. Cole esses valores no seu arquivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://SUA_URL_AQUI.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
   ```
5. Para inicializar as tabelas do banco de dados, vá na opção **SQL Editor** do Supabase e execute os scripts localizados na pasta `supabase/` na seguinte ordem:
   - `supabase/migration.sql`
   - `supabase/migration_v2_sync.sql`

### 5. Configuração do OpenWeatherMap (Opcional)
Para usar as funcionalidades de clima, você precisará de uma API key do OpenWeather:
1. Crie uma conta em [OpenWeatherMap](https://openweathermap.org/).
2. Gere uma API Key.
3. Adicione ao seu `.env`:
   ```env
   VITE_OPENWEATHER_KEY=SUA_CHAVE_OPENWEATHER_AQUI
   ```

## 💻 Executando o Projeto

### Rodar no Navegador (Desenvolvimento)
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### Rodar como Aplicativo Desktop (Tauri)
Se quiser testar a versão desktop usando Tauri (requer Rust instalado):
```bash
npm run tauri dev
```

### Compilar Aplicativo Desktop (Tauri)
```bash
npm run tauri build
```

---

*Lembrete de Segurança:* O arquivo `.env` já está no `.gitignore`. Nunca faça o commit das suas chaves de API em um repositório público.
