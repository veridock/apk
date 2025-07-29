# 🚀 SVG+PHP Universal Launcher

Kompleksowe rozwiązanie do uruchamiania aplikacji SVG+PHP na dowolnej platformie z łatwą dystrybucją. Projekt umożliwia tworzenie interaktywnych aplikacji używających SVG jako interfejsu użytkownika z logiką PHP w tle.

## 📋 Spis treści

- [Szybki start](#-szybki-start)
- [Wymagania](#-wymagania)
- [Instalacja](#-instalacja)
- [Sposoby uruchomienia](#-sposoby-uruchomienia)
- [Struktura projektu](#-struktura-projektu)
- [Konfiguracja](#-konfiguracja)
- [Deployment](#-deployment)
- [Rozwój aplikacji](#-rozwój-aplikacji)
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

## 💻 Wymagania

### Wymagania minimalne
- PHP 8.0+ (zalecane 8.2+)
- Rozszerzenia PHP: `gd`, `imagick` (opcjonalne dla przetwarzania grafiki)
- Apache/Nginx (dla trybu produkcyjnego) lub wbudowany serwer PHP
- Docker i Docker Compose (dla deployment z kontenerami)

### Wymagania dla zaawansowanych funkcji
- ImageMagick (dla konwersji PDF)
- Ghostscript (dla renderowania PDF)
- Poppler-utils (dla manipulacji PDF)

## 📦 Instalacja
- Opcjonalnie: ImageMagick (dla pdf-processor.svg)

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
php -S localhost:8097 router.php
```

### 2. Tryb CLI (przetwarzanie batch)
```bash
# Renderuj pojedynczy plik
php index.php

# Z parametrami środowiskowymi
APP_TITLE="Moja Aplikacja" php index.php
```

### 3. Tryb produkcyjny (Apache/Nginx)

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.+\.svg)$ router.php?file=$1 [L,QSA]

<FilesMatch "\.svg$">
    SetHandler application/x-httpd-php
</FilesMatch>
```

**Nginx:**
```nginx
location ~ \.svg$ {
    fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root/router.php;
}
```

### 4. Docker Compose
```bash
# Podstawowe uruchomienie
docker-compose up -d

# Z customowymi ustawieniami
PORT=8080 APP_TITLE="Moja Aplikacja" docker-compose up -d

# Tryb produkcyjny z Nginx
docker-compose --profile production up -d
```

## 📁 Struktura projektu

```
veridock-apk/
├── index.html           # Główny interfejs webowy
├── index.php           # Backend PHP
├── portable.php        # Jednoplikowy launcher
├── router-temp.php     # Router tymczasowy
├── .env               # Konfiguracja aplikacji
├── run.bat           # Launcher dla Windows
├── run.sh            # Launcher dla Linux/Mac
├── docker-compose.sh # Skrypt Docker Compose
├── Dockerfile        # Obraz Docker
├── electron-launcher/ # Aplikacja Electron
├── sample-calculator.svg # Przykład kalkulatora SVG
├── LICENSE           # Licencja Apache 2.0
└── README.md        # Dokumentacja
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

## 📈 Optymalizacja wydajności

### 1. Cache SVG output
```php
// W router.php
$cache_file = 'cache/' . md5($uri) . '.svg';
$cache_time = 3600; // 1 godzina

if (file_exists($cache_file) && time() - filemtime($cache_file) < $cache_time) {
    readfile($cache_file);
    exit;
}

// Generate SVG...
file_put_contents($cache_file, $output);
```

### 2. Kompresja Gzip
```php
// Dodaj do router.php
if (!ob_start("ob_gzhandler")) ob_start();
```

### 3. Lazy loading dla dużych SVG
```javascript
// W SVG
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Load complex elements
        }
    });
});
```

## 🔐 Bezpieczeństwo

### Checklist bezpieczeństwa
- [ ] Escapowanie danych użytkownika
- [ ] Walidacja uploadów
- [ ] HTTPS w produkcji
- [ ] Content Security Policy
- [ ] Rate limiting
- [ ] Aktualizacje PHP i zależności

### Przykład zabezpieczonego uploadu
```php
// W pdf-processor.svg
if (isset($_FILES['pdf'])) {
    $allowed = ['application/pdf'];
    $max_size = 50 * 1024 * 1024; // 50MB
    
    if (!in_array($_FILES['pdf']['type'], $allowed)) {
        die('Invalid file type');
    }
    
    if ($_FILES['pdf']['size'] > $max_size) {
        die('File too large');
    }
    
    // Bezpieczna nazwa pliku
    $filename = bin2hex(random_bytes(16)) . '.pdf';
    move_uploaded_file($_FILES['pdf']['tmp_name'], 'uploads/' . $filename);
}
```

## 🎯 Roadmap

- [ ] WebSocket support dla real-time updates
- [ ] PWA manifest generator
- [ ] Visual SVG editor
- [ ] Plugin system
- [ ] Database integration examples
- [ ] Authentication system
- [ ] Multi-language support

## 📝 Licencja

Ten projekt jest dostępny na licencji Apache 2.0. Zobacz plik [LICENSE](LICENSE) dla szczegółów.


---

Made with ❤️ by the SVG+PHP community