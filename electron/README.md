# 🖥️ SVG+PHP Electron Launcher

Natywna aplikacja desktop pozwalająca uruchamiać pliki SVG+PHP poprzez podwójne kliknięcie, zachowując jednocześnie możliwość podglądu SVG w systemie.

## 🎯 Główne funkcje

### 1. **Podwójne kliknięcie = Aplikacja**
- Kliknij dwukrotnie plik `.svg` → uruchamia się jako aplikacja
- Kliknij prawym → "Otwórz za pomocą" → wybierz podgląd obrazu

### 2. **Wbudowany serwer PHP**
- Automatyczne wykrywanie PHP w systemie
- Możliwość dołączenia PHP do aplikacji
- Izolowany serwer dla każdego pliku SVG

### 3. **Zarządzanie zmiennymi środowiskowymi**
- Edytor .env wbudowany w aplikację
- Ładowanie z folderu SVG lub profilu użytkownika
- Hot-reload po zmianie zmiennych

### 4. **Integracja z systemem**
- Rejestracja jako domyślna aplikacja dla SVG+PHP
- Ikona w zasobniku systemowym
- Menu kontekstowe w eksploratorze plików

## 📦 Instalacja

### Opcja 1: Gotowe wydanie
```bash
# Windows
Pobierz SVG-PHP-Launcher-Setup-1.0.0.exe

# macOS
Pobierz SVG-PHP-Launcher-1.0.0.dmg

# Linux
Pobierz SVG-PHP-Launcher-1.0.0.AppImage
chmod +x SVG-PHP-Launcher-1.0.0.AppImage
./SVG-PHP-Launcher-1.0.0.AppImage
```

### Opcja 2: Kompilacja ze źródeł
```bash
# Klonuj repozytorium
git clone https://github.com/veridock/apk.git
cd electron

# Zainstaluj zależności
npm install

# Uruchom w trybie deweloperskim
npm start

# Zbuduj dla swojej platformy
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

## 🚀 Użycie

### Podstawowe uruchomienie

1. **Przeciągnij i upuść**
   - Przeciągnij plik SVG na ikonę aplikacji
   - Lub upuść w oknie powitalnym

2. **Podwójne kliknięcie**
   - Po instalacji, kliknij dwukrotnie dowolny plik .svg
   - Aplikacja automatycznie się uruchomi

3. **Linia poleceń**
   ```bash
   svg-php-launcher calculator.svg
   ```

### Menu aplikacji

- **File → Open SVG**: Otwórz plik SVG
- **File → Reload**: Odśwież bieżącą aplikację
- **View → Dev Tools**: Narzędzia deweloperskie
- **Tools → .env Editor**: Edytuj zmienne środowiskowe
- **Tools → PHP Info**: Informacje o PHP

## ⚙️ Konfiguracja

### Struktura folderów
```
~/                              # Folder użytkownika
├── .svg-php-launcher/         # Dane aplikacji
│   ├── .env                   # Globalne zmienne
│   ├── recent-files.json      # Ostatnio otwarte
│   └── settings.json          # Ustawienia
│
/path/to/your/svg/
├── calculator.svg             # Twój plik SVG
└── .env                       # Lokalne zmienne (priorytet)
```

### Plik .env
```env
# Ustawienia aplikacji
APP_TITLE=Moja Aplikacja
APP_VERSION=2.0.0
APP_AUTHOR=Jan Kowalski

# Ustawienia PHP
PHP_MEMORY_LIMIT=256M
PHP_MAX_EXECUTION_TIME=300

# Custom zmienne
API_KEY=your-api-key
DATABASE_PATH=./data.db
```

### Priorytet zmiennych
1. `.env` w folderze z plikiem SVG
2. `.env` w folderze konfiguracji użytkownika
3. Zmienne systemowe
4. Wartości domyślne

## 🔧 Zaawansowane funkcje

### Bundling PHP z aplikacją

Aby aplikacja działała bez zainstalowanego PHP:

1. **Windows**
   ```bash
   # Pobierz PHP
   mkdir php/win
   curl -L https://windows.php.net/downloads/releases/php-8.2.0-Win32-vs16-x64.zip -o php.zip
   unzip php.zip -d php/win/
   
   # Zbuduj z PHP
   npm run build-win
   ```

2. **macOS/Linux**
   - PHP jest zazwyczaj preinstalowane
   - Opcjonalnie można dołączyć binaria

### Własne protokoły URL

Aplikacja rejestruje protokół `svg-php://`:
```html
<a href="svg-php://open/calculator.svg">Otwórz kalkulator</a>
```

### API dla rozszerzeń

```javascript
// W pliku SVG można używać API Electron
if (window.api) {
    // Pobierz zmienne środowiskowe
    const vars = await window.api.getEnvVars();
    
    // Otwórz folder
    window.api.openSVGDirectory();
    
    // System info
    const info = await window.api.getSystemInfo();
}
```

## 🎨 Dostosowywanie

### Własna ikona aplikacji

1. Utwórz ikonę w formacie SVG (512x512)
2. Umieść w `assets/icon.svg`
3. Uruchom skrypt budowania:
   ```bash
   ./build.sh
   ```

### Splash screen

Edytuj `welcome.html` aby dostosować ekran powitalny.

### Motywy

Aplikacja wspiera ciemny motyw systemu automatycznie.

## 🐛 Rozwiązywanie problemów

### "PHP not found"
- **Windows**: Zainstaluj XAMPP lub pobierz PHP
- **macOS**: `brew install php`
- **Linux**: `sudo apt install php`

### SVG nie uruchamia się jako aplikacja
1. Sprawdź rejestrację typu pliku
2. Windows: "Otwórz za pomocą" → "Wybierz inną aplikację"
3. macOS: "Pobierz informacje" → "Otwórz za pomocą"

### Port zajęty
Aplikacja automatycznie znajdzie wolny port (9876+)

## 🔐 Bezpieczeństwo

- PHP działa w trybie lokalnym (localhost only)
- Każdy SVG ma izolowany kontekst
- Brak dostępu do systemu plików poza folderem SVG
- Content Security Policy aktywne

## 📊 Wydajność

- Lazy loading dla dużych SVG
- Cache dla statycznych zasobów
- Minimalne zużycie pamięci (~50MB)
- Szybki start (<2s)

## 🚧 Roadmap

- [ ] Wsparcie dla wielu okien
- [ ] Synchronizacja ustawień w chmurze
- [ ] Marketplace dla SVG apps
- [ ] Debugger PHP wbudowany
- [ ] Live reload dla deweloperów
- [ ] Export do standalone executable

## 📝 Licencja

Apache 2.0 License - zobacz [LICENSE](LICENSE)

## 🤝 Współpraca

1. Fork repozytorium
2. Stwórz branch (`git checkout -b feature/AmazingFeature`)
3. Commit zmiany (`git commit -m 'Add AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

---

Made with ❤️ using Electron + PHP + SVG