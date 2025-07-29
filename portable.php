<?php
/**
 * Portable SVG+PHP Launcher
 * Single file launcher that can be run with just PHP
 * Usage: php portable-launcher.php [port]
 */

class PortableLauncher {
    private $port = 8097;
    private $host = 'localhost';
    private $routerContent;

    public function __construct($port = null) {
        if ($port) {
            $this->port = (int)$port;
        }

        // Embedded minimal router
        $this->routerContent = '<?php
// Minimal embedded router for SVG+PHP files
$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$path = __DIR__ . $uri;

// Handle SVG files as PHP
if (preg_match("/\.svg$/", $uri) && file_exists($path)) {
    header("Content-Type: image/svg+xml");

    // Process variables
    $vars = [
        "{APP_TITLE}" => $_ENV["APP_TITLE"] ?? "SVG+PHP App",
        "{APP_VERSION}" => $_ENV["APP_VERSION"] ?? "1.0.0",
        "{CURRENT_TIME}" => date("H:i:s"),
        "{CURRENT_DATE}" => date("Y-m-d"),
        "{PHP_VERSION}" => PHP_VERSION
    ];

    $content = file_get_contents($path);
    $content = str_replace(array_keys($vars), array_values($vars), $content);

    // Execute PHP in SVG
    eval("?>" . $content);
    return true;
}

// Serve static files
if (file_exists($path) && !is_dir($path)) {
    return false;
}

// Default response
http_response_code(404);
echo "Not found: $uri";
';
    }

    public function run() {
        $this->printBanner();

        if (!$this->checkPHP()) {
            return false;
        }

        if (!$this->checkPort()) {
            $this->port = $this->findAvailablePort();
            echo "Using alternative port: {$this->port}\n\n";
        }

        $this->createMinimalRouter();
        $this->createSampleFiles();

        echo "Starting server on http://{$this->host}:{$this->port}\n";
        echo "Press Ctrl+C to stop\n\n";

        // Open browser
        $this->openBrowser("http://{$this->host}:{$this->port}");

        // Start server
        $cmd = sprintf(
            'php -S %s:%d -t %s router-temp.php',
            $this->host,
            $this->port,
            escapeshellarg(getcwd())
        );

        passthru($cmd);

        // Cleanup
        @unlink('router-temp.php');
    }

    private function printBanner() {
        echo <<<BANNER
╔═══════════════════════════════════════════╗
║      SVG+PHP Portable Launcher v1.0       ║
╚═══════════════════════════════════════════╝

BANNER;
    }

    private function checkPHP() {
        if (version_compare(PHP_VERSION, '7.4.0', '<')) {
            echo "Error: PHP 7.4 or higher is required\n";
            echo "Current version: " . PHP_VERSION . "\n";
            return false;
        }

        echo "✓ PHP " . PHP_VERSION . " detected\n";
        return true;
    }

    private function checkPort() {
        $socket = @fsockopen($this->host, $this->port, $errno, $errstr, 1);
        if ($socket) {
            fclose($socket);
            return false;
        }
        return true;
    }

    private function findAvailablePort() {
        $port = $this->port;
        while (!$this->checkPort()) {
            $port++;
            $this->port = $port;
        }
        return $port;
    }

    private function createMinimalRouter() {
        file_put_contents('router-temp.php', $this->routerContent);
    }

    private function createSampleFiles() {
        // Check if sample files already exist
        if (file_exists('sample-calculator.svg')) {
            return;
        }

        echo "Creating sample files...\n";

        // Simple calculator SVG+PHP
        $calculator = '<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <rect width="300" height="400" fill="#2c3e50" rx="10"/>
  <text x="150" y="30" text-anchor="middle" fill="white" font-size="20">{APP_TITLE}</text>

  <!-- Display -->
  <rect x="20" y="50" width="260" height="50" fill="#34495e" rx="5"/>
  <text x="270" y="85" text-anchor="end" fill="white" font-size="24" id="display">0</text>

  <!-- PHP Time Display -->
  <text x="150" y="380" text-anchor="middle" fill="#95a5a6" font-size="12">
    <?php echo "Time: " . date("H:i:s"); ?>
  </text>

  <script><![CDATA[
    let display = document.getElementById("display");
    let currentValue = "0";

    // Simple calculator logic embedded
    document.addEventListener("click", (e) => {
      if (e.target.tagName === "rect" && e.target.classList.contains("btn")) {
        const value = e.target.dataset.value;
        if (value === "C") {
          currentValue = "0";
        } else if (value === "=") {
          try {
            currentValue = eval(currentValue).toString();
          } catch {
            currentValue = "Error";
          }
        } else {
          if (currentValue === "0") currentValue = value;
          else currentValue += value;
        }
        display.textContent = currentValue;
      }
    });
  ]]></script>

  <!-- Calculator buttons -->
  <?php
  $buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["C", "0", "=", "+"]
  ];

  $y = 120;
  foreach ($buttons as $row) {
    $x = 20;
    foreach ($row as $btn) {
      echo \'<rect x="\' . $x . \'" y="\' . $y . \'" width="60" height="40" fill="#3498db" rx="5" class="btn" data-value="\' . $btn . \'" style="cursor:pointer"/>\';
      echo \'<text x="\' . ($x + 30) . \'" y="\' . ($y + 25) . \'" text-anchor="middle" fill="white" font-size="18" pointer-events="none">\' . $btn . \'</text>\';
      $x += 70;
    }
    $y += 50;
  }
  ?>
</svg>';

        file_put_contents('sample-calculator.svg', $calculator);
        echo "✓ Created sample-calculator.svg\n";

        // Create .env file
        if (!file_exists('.env')) {
            $env = <<<ENV
APP_TITLE=Portable SVG Calculator
APP_VERSION=1.0.0
APP_AUTHOR=Developer
ENV;
            file_put_contents('.env', $env);
            echo "✓ Created .env file\n";
        }
    }

    private function openBrowser($url) {
        $os = strtoupper(substr(PHP_OS, 0, 3));

        if ($os === 'WIN') {
            exec("start $url");
        } elseif ($os === 'DAR') {
            exec("open $url");
        } elseif ($os === 'LIN') {
            exec("xdg-open $url 2>/dev/null || gnome-open $url 2>/dev/null");
        }
    }
}

// Run launcher
$port = isset($argv[1]) ? $argv[1] : null;
$launcher = new PortableLauncher($port);
$launcher->run();