# 🚀 SVG+PHP Universal Launcher

[![PHP Version](https://img.shields.io/badge/PHP-8.0%2B-blue)](https://php.net)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](docker-compose.yml)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey)](#)
[![Validation](https://img.shields.io/badge/Validation-31%20Checks-success)](validator.php)

Kompleksowe, profesjonalne rozwiązanie do tworzenia i dystrybucji aplikacji SVG+PHP na dowolnej platformie. Projekt umożliwia budowanie zaawansowanych, interaktywnych aplikacji używających SVG jako interfejsu użytkownika z potencjałem pełnego PHP jako backendu.

> 🌟 **Gotowy do produkcji** - Pełny stack z walidacją, testami, Dockerem i automatyczną dystrybucją!

## 🎆 **Kluczowe funkcje:**

### 🚀 **Core System**
- 🌐 **Uniwersalny launcher** - działa na Windows, Linux, macOS
- 📱 **Progressive Web App** - kompatybilność z PWA
- 🎨 **SVG+PHP** - interaktywne aplikacje z logiką PHP
- ⚡ **Portable mode** - jednoplikowy launcher bez instalacji

### 🔒 **Bezpieczeństwo i walidacja**
- 🛡️ **validator.php** - 31 typów kontroli bezpieczeństwa i jakości
- 🔍 **Wykrywanie niebezpiecznych funkcji** PHP
- 🛡️ **Ochrona XSS i SQL injection**
- ✅ **Walidacja struktur XML/SVG** z obsługą PHP

### 📦 **Deployment i dystrybucja**
- 🎯 **build-dist.sh** - automatyczne pakiety dla wszystkich platform
- 🐳 **Docker + Nginx** - gotowy stack produkcyjny
- 🖥️ **Aplikacja Electron** - natywny desktop
- 📋 **CI/CD ready** - kompleksowy system testów

### 🛠️ **Developer Experience**
- 🧪 **test.sh** - automatyczne testy całego stacku
- 📊 **Szczegółowe raporty** walidacji i testów
- 🔧 **Hot-reload** wsparcie dla development
- 📖 **Kompleksowa dokumentacja** z przykładami

## 📋 Spis treści

- [Szybki start](#-szybki-start)
- [Instalacja](#-instalacja)
- [Sposoby uruchomienia](#-sposoby-uruchomienia)
- [Walidacja i testowanie](#-walidacja-i-testowanie)
- [Struktura projektu](#-struktura-projektu)
- [Deployment i dystrybucja](#-deployment-i-dystrybucja)
- [Troubleshooting](#-troubleshooting)

## 🎯 Szybki start

### Opcja 1: Portable Launcher (najprostszy)
```bash
# Uruchom bezpośrednio z katalogu projektu
php portable.php

# Lub na konkretnym porcie
php portable.php 8080
```

### Opcja 2: Skrypty natywne

**Windows:**
```batch
run.bat
```

**Linux/Mac:**
```bash
chmod +x run.sh
./run.sh
```

### Opcja 3: Docker
```bash
docker-compose up -d
```

## 📦 Instalacja

**Wymagania:** PHP 8.0+, opcjonalnie Docker
- Opcjonalnie: ImageMagick (dla pdf.php.svg)

### Windows

#### XAMPP (rekomendowane)
1. Pobierz XAMPP z [apachefriends.org](https://www.apachefriends.org/)
2. Zainstaluj w domyślnej lokalizacji
3. Skopiuj pliki projektu do `C:\xampp\htdocs\svg-php`
4. Uruchom Apache z panelu kontrolnego XAMPP

#### Standalone PHP
1. Pobierz PHP z [windows.php.net](https://windows.php.net/download/)
2. Rozpakuj do `C:\php`
3. Dodaj `C:\php` do zmiennej PATH
4. Uruchom `run.bat`

### Linux

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install php php-cli php-gd imagemagick

# Klonuj repozytorium
git clone https://github.com/veridock/apk.git
cd svg-php-launcher

# Uruchom
./run.sh
```

#### Fedora/CentOS
```bash
sudo dnf install php php-cli php-gd ImageMagick

# Reszta jak wyżej
```

### macOS
```bash
# Instalacja przez Homebrew
brew install php imagemagick

# Klonuj i uruchom
git clone https://github.com/veridock/apk.git
cd svg-php-launcher
./run.sh
```

## 🚀 Sposoby uruchomienia

### 1. Tryb developerski (Built-in Server)
```bash
# Uruchom serwer z routerem
php -S localhost:8097 router.php

# Lub bezpośrednio index.html (dla statycznych plików)
php -S localhost:8097
```

### 2. Tryb CLI (przetwarzanie batch)
```bash
# Renderuj plik SVG przez router
php router.php sample-calculator.svg

# Z parametrami środowiskowymi
APP_TITLE="Moja Aplikacja" php router.php pdf.php.svg
```

## 🔍 Walidacja i testowanie

### Zaawansowana walidacja SVG+PHP

Projekt zawiera profesjonalny system walidacji `validator.php` z kontrolami:

```bash
# Walidacja wszystkich plików SVG
php validator.php

# Walidacja konkretnego pliku
php validator.php sample-calculator.svg

# Walidacja rekurencyjna
php validator.php . --recursive

# Tryb cichy (tylko błędy)
php validator.php --quiet
```

**Sprawdzane aspekty:**
- ✅ **Struktura XML/SVG** - poprawność składni z obsługą PHP
- ✅ **Kompatybilność PWA** - responsive design, self-contained
- ✅ **Integracja PHP** - osadzony kod PHP w SVG
- ✅ **Bezpieczeństwo** - wykrywanie niebezpiecznych funkcji
- ✅ **Elementy HTML** - foreignObject i XHTML namespace
- ✅ **Optymalizacja** - rozmiar pliku, external dependencies

### Kompleksowy system testów

```bash
# Uruchom pełny zestaw testów
./test.sh

# Komponenty testowane:
# - Środowisko PHP (wersja, CLI)
# - Struktura plików projektu
# - Walidacja SVG+PHP przez validator.php
# - Składnia PHP wszystkich plików
# - Konfiguracja Docker (jeśli dostępna)
```

**Przykład wyniku walidacji:**
```
🚀 Testing SVG file: sample-calculator.svg
=========================================

Total Tests:  31
Passed:      29 ✅  (93.55%)
Failed:      2 ❌
Warnings:    2 ⚠️
Status:      ✅ PASSED
```

## 📁 Struktura projektu

```
veridock-apk/
├── index.html              # Główny interfejs webowy
├── portable.php           # Jednoplikowy launcher
├── router.php             # Główny router PHP
├── router-temp.php        # Router tymczasowy
├── validator.php          # ⭐ Zaawansowany system walidacji SVG+PHP
├── .env                   # Konfiguracja aplikacji
├── .gitignore            # Pliki ignorowane przez Git
├── 🔧 SKRYPTY URUCHAMIANIA
├── run.bat               # Launcher dla Windows
├── run.sh                # Launcher dla Linux/Mac
├── test.sh               # ⭐ Kompleksowy system testów
├── build-dist.sh         # ⭐ Generator dystrybucji multiplatform
├── 🐳 DEPLOYMENT
├── Dockerfile            # Obraz Docker
├── docker-compose.yml    # ⭐ Orkiestracja Docker z bazą danych
├── docker-compose.sh     # Pomocniczy skrypt Docker
├── nginx.conf            # ⭐ Konfiguracja Nginx dla produkcji
├── 📁 KATALOGI ROBOCZE
├── uploads/              # Katalog na przesłane pliki
├── output/               # Katalog na pliki wyjściowe
├── debug.log             # Logi debugowania
├── 🖥️ APLIKACJA DESKTOP
├── electron-launcher/    # Aplikacja Electron Desktop
│   ├── main.js          # Główny proces Electron
│   ├── renderer.js      # Proces renderowania
│   ├── package.json     # Zależności Electron
│   ├── assets/          # Zasoby aplikacji
│   └── dist/           # Skompilowana aplikacja
├── 🎨 PRZYKŁADY SVG+PHP
├── pdf.php.svg           # Procesor PDF z interfejsem SVG
├── sample-calculator.svg # Przykład: kalkulator
├── sample-clock.svg      # Przykład: zegar
├── sample-tic-tac-toe.svg # Przykład: kółko i krzyżyk
├── 📄 DOKUMENTACJA
├── LICENSE               # Licencja Apache 2.0
└── README.md            # Dokumentacja
```

## ⚙️ Konfiguracja

### Plik .env
```env
# Podstawowe ustawienia
APP_TITLE=Moja Aplikacja SVG+PHP
APP_VERSION=1.0.0
APP_AUTHOR=Jan Kowalski
APP_BASE_URL=http://localhost:8097

# Ustawienia aplikacji
CALCULATOR_TITLE=Zaawansowany Kalkulator
PDF_MAX_SIZE=50M

# Ustawienia serwera
SERVER_PORT=8097
TIMEZONE=Europe/Warsaw
```

### Zmienne dostępne w SVG

Router automatycznie zastępuje następujące placeholdery:

| Placeholder | Opis | Przykład |
|------------|------|----------|
| `{APP_TITLE}` | Tytuł aplikacji | "Moja Aplikacja" |
| `{APP_VERSION}` | Wersja | "1.0.0" |
| `{APP_AUTHOR}` | Autor | "Developer" |
| `{CURRENT_TIME}` | Aktualny czas | "14:30:45" |
| `{CURRENT_DATE}` | Aktualna data | "2025-01-29" |
| `{PHP_VERSION}` | Wersja PHP | "8.2.0" |
| `{USER_NAME}` | Nazwa użytkownika | "user" |
| `{HOST_NAME}` | Nazwa hosta | "localhost" |

### Priorytet zmiennych

1. Argumenty CLI
2. Parametry GET
3. Parametry POST
4. Zmienne środowiskowe
5. Plik .env
6. Wartości domyślne

## 🌐 Deployment

### Hosting współdzielony (Shared Hosting)

1. Wgraj pliki przez FTP
2. Ustaw uprawnienia:
   ```bash
   chmod 755 router.php
   chmod 755 uploads output
   ```
3. Skonfiguruj .htaccess (jeśli Apache)

### VPS/Dedykowany serwer

```bash
# Instalacja
cd /var/www
git clone https://github.com/veridock/apk.git
cd svg-php-launcher

# Uprawnienia
chown -R www-data:www-data .
chmod -R 755 uploads output

# Systemd service
sudo nano /etc/systemd/system/svg-php.service
```

**svg-php.service:**
```ini
[Unit]
Description=SVG+PHP Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/svg-php-launcher
ExecStart=/usr/bin/php -S 0.0.0.0:8097 router.php
Restart=always

[Install]
WantedBy=multi-user.target
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: svg-php-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: svg-php
  template:
    metadata:
      labels:
        app: svg-php
    spec:
      containers:
      - name: app
        image: your-registry/svg-php:latest
        ports:
        - containerPort: 80
        env:
        - name: APP_TITLE
          value: "Production SVG App"
```

## 🛠️ Rozwój aplikacji

### Tworzenie nowej aplikacji SVG+PHP

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xhtml="http://www.w3.org/1999/xhtml"
     width="400" height="300">
  
  <title>{APP_TITLE}</title>
  
  <!-- PHP Logic -->
  <?php
  $data = [
    'time' => date('H:i:s'),
    'user' => $_ENV['USER'] ?? 'Guest'
  ];
  ?>
  
  <!-- SVG Elements -->
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <text x="200" y="50" text-anchor="middle" font-size="24">
    Welcome <?= htmlspecialchars($data['user']) ?>
  </text>
  
  <!-- Interactive elements -->
  <foreignObject x="50" y="100" width="300" height="50">
    <xhtml:input type="text" placeholder="Enter text..." 
                 style="width:100%; padding:10px;"/>
  </foreignObject>
  
  <!-- JavaScript -->
  <script><![CDATA[
    console.log('SVG+PHP App loaded at <?= $data['time'] ?>');
  ]]></script>
</svg>
```

### Best Practices

1. **Bezpieczeństwo:**
   - Zawsze escapuj dane użytkownika
   - Używaj `htmlspecialchars()` dla output
   - Waliduj uploady

2. **Wydajność:**
   - Minimalizuj PHP w pętlach SVG
   - Używaj cache dla statycznych danych
   - Optymalizuj rozmiar SVG

3. **Kompatybilność:**
   - Testuj w różnych przeglądarkach
   - Używaj fallbacków dla starszych przeglądarek
   - Zachowaj responsywność

## 📊 Monitoring

### Logi aplikacji
```bash
# Docker logs
docker-compose logs -f

# PHP error log
tail -f /var/log/php_errors.log
```

### Health check endpoint
```php
// health-check.php
<?php
$status = [
    'status' => 'ok',
    'timestamp' => time(),
    'php_version' => PHP_VERSION,
    'memory_usage' => memory_get_usage(true)
];

header('Content-Type: application/json');
echo json_encode($status);
```

## 🤝 Wsparcie

- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Wiki:** [Project Wiki](https://github.com/your-repo/wiki)
- **Discussions:** [GitHub Discussions](https://github.com/your-repo/discussions)

## 🔧 Rozwiązywanie problemów

### Problem: "PHP not found"
```bash
# Windows
set PATH=%PATH%;C:\php

# Linux/Mac
export PATH=$PATH:/usr/local/bin/php
```

### Problem: "Port already in use"
```bash
# Znajdź proces używający portu
lsof -i :8097  # Linux/Mac
netstat -ano | findstr :8097  # Windows

# Użyj alternatywnego portu
php -S localhost:8098 router.php
```

### Problem: "Permission denied"
```bash
# Linux/Mac
chmod +x run.sh
chmod -R 755 uploads output

# SELinux (CentOS/RHEL)
setsebool -P httpd_unified 1
```

### Problem: "SVG not rendering"
1. Sprawdź Content-Type header
2. Usuń BOM z pliku SVG
3. Sprawdź poprawność XML

## 📚 Przykłady użycia

### 1. Dashboard z danymi real-time
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <?php
  // Pobierz dane z API lub bazy
  $cpu_usage = sys_getloadavg()[0] * 100;
  $memory = memory_get_usage(true) / 1024 / 1024;
  $time = date('H:i:s');
  ?>
  
  <text x="400" y="30" text-anchor="middle" font-size="24">
    System Monitor - <?= $time ?>
  </text>
  
  <!-- CPU Usage Bar -->
  <rect x="50" y="100" width="700" height="30" fill="#ddd"/>
  <rect x="50" y="100" width="<?= $cpu_usage * 7 ?>" height="30" fill="#3498db"/>
  <text x="400" y="120" text-anchor="middle" fill="white">
    CPU: <?= round($cpu_usage, 2) ?>%
  </text>
</svg>
```

### 2. Formularz z walidacją
```xml
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <?php
  $error = '';
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
      if (!$email) {
          $error = 'Invalid email address';
      }
  }
  ?>
  
  <foreignObject x="50" y="50" width="300" height="200">
    <xhtml:form method="post" action="">
      <xhtml:input type="email" name="email" required=""
                   style="width:100%; padding:10px;"/>
      <?php if ($error): ?>
        <xhtml:div style="color:red;"><?= $error ?></xhtml:div>
      <?php endif; ?>
      <xhtml:button type="submit">Submit</xhtml:button>
    </xhtml:form>
  </foreignObject>
</svg>
```

### 3. Generator wykresów
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
  <?php
  $data = [
    'Jan' => 65, 'Feb' => 59, 'Mar' => 80,
    'Apr' => 81, 'May' => 56, 'Jun' => 55
  ];
  
  $x = 50;
  $max_value = max($data);
  
  foreach ($data as $month => $value):
    $height = ($value / $max_value) * 300;
    $y = 350 - $height;
  ?>
    <rect x="<?= $x ?>" y="<?= $y ?>" 
          width="80" height="<?= $height ?>"
          fill="#3498db" opacity="0.8"/>
    <text x="<?= $x + 40 ?>" y="370" 
          text-anchor="middle"><?= $month ?></text>
    <text x="<?= $x + 40 ?>" y="<?= $y - 5 ?>" 
          text-anchor="middle"><?= $value ?></text>
  <?php
    $x += 120;
  endforeach;
  ?>
</svg>
```

## 🚀 Zaawansowane funkcje

### Hot Reload Development
```bash
# Instalacja nodemon
npm install -g nodemon

# Uruchom z auto-reload
nodemon --exec "php -S localhost:8097 router.php" --ext svg,php
```

### Bundling dla produkcji
```php
// build.php - Bundler dla SVG+PHP
<?php
$files = glob('*.svg');
$bundle = [];

foreach ($files as $file) {
    $content = file_get_contents($file);
    // Minifikacja
    $content = preg_replace('/\s+/', ' ', $content);
    $content = preg_replace('/<!--.*?-->/', '', $content);
    
    $bundle[basename($file)] = base64_encode($content);
}

// Zapisz bundle
file_put_contents('bundle.json', json_encode($bundle));
echo "Bundle created with " . count($files) . " files\n";
?>
```

### Integracja z CI/CD

**GitHub Actions:**
```yaml
name: Deploy SVG+PHP App

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.0'
    
    - name: Test SVG files
      run: php index.php .
    
    - name: Build Docker image
      run: docker build -t svg-php-app .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push svg-php-app
```

### Monitoring z Prometheus
```php
// metrics.php
<?php
header('Content-Type: text/plain');

// Prometheus format
echo "# HELP svg_php_requests_total Total requests\n";
echo "# TYPE svg_php_requests_total counter\n";
echo "svg_php_requests_total " . ($_SESSION['requests'] ?? 0) . "\n";

echo "# HELP svg_php_memory_usage Memory usage in bytes\n";
echo "# TYPE svg_php_memory_usage gauge\n";
echo "svg_php_memory_usage " . memory_get_usage() . "\n";
?>
```



## 🔧 Troubleshooting

### Częste problemy:

**Problem:** `PHP not found`
```bash
# Ubuntu/Debian
sudo apt install php php-cli

# macOS
brew install php

# Windows
# Pobierz z https://windows.php.net/download/
```

**Problem:** `Port already in use`
```bash
# Użyj innego portu
php portable.php 8080

# Lub zatrzymaj inne serwery
sudo lsof -ti:8097 | xargs kill -9
```

**Problem:** `Permission denied`
```bash
# Linux/macOS - napraw uprawnienia
chmod +x *.sh
```

**Problem:** `xmllint --noout *.svg` pokazuje błędy
```bash
# To jest NORMALNE dla plików SVG+PHP!
# Pliki z kodem PHP nie są poprawnym XML-em

# Użyj zaawansowanego walidatora SVG+PHP:
php validator.php              # Wszystkie pliki SVG
php validator.php plik.svg     # Konkretny plik
php validator.php . --recursive # Rekurencyjnie

# Lub testuj komponenty osobno:
php -l router.php  # Walidacja PHP
grep -c "<svg" *.svg  # Sprawdź strukturę SVG
```

**Problem:** SVG nie ładuje się
- Sprawdź router PHP: `php -l router.php`
- Pełna walidacja: `php validator.php plik.svg`
- Sprawdź logi: `tail -f debug.log`
- Uruchom przez router: `php router.php plik.svg`

## 📝 Licencja

Ten projekt jest dostępny na licencji Apache 2.0. Zobacz plik [LICENSE](LICENSE) dla szczegółów.

---

⭐ **Jeśli projekt Ci się podoba, zostaw gwiazdkę na GitHub!**

📧 **Pytania i sugestie:** [Utwórz issue](https://github.com/your-repo/issues)ty