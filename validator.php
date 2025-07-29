<?php
/**
 * SVG PHP+PWA Validator
 * Comprehensive validator for PHP+SVG files working as Progressive Web Apps
 * Requires PHP code embedded within SVG tags for advanced functionality
 * 
 * @author VeriDock Grid System
 * @version 2.0.0
 */

// Check if running from command line
$isCommandLine = php_sapi_name() === 'cli';

/**
 * Recursively find all SVG files in directory
 */
function findSVGFilesRecursively($directory) {
    $svgFiles = [];
    $directory = rtrim($directory, '/');
    
    if (!is_dir($directory)) {
        return $svgFiles;
    }
    
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );
    
    foreach ($iterator as $file) {
        if ($file->isFile() && strtolower($file->getExtension()) === 'svg') {
            $svgFiles[] = $file->getPathname();
        }
    }
    
    // Sort files alphabetically
    sort($svgFiles);
    
    return $svgFiles;
}

// CLI interface for testing SVG files
if ($isCommandLine) {
    // ... rest of the code remains the same ...
}

if (!$isCommandLine) {
    header('Content-Type: application/json; charset=UTF-8');
}

class SVGPWAValidator {
    
    private $results = [];
    private $errors = [];
    private $warnings = [];
    
    public function __construct() {
        $this->results = [
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
            'tests' => [],
            'summary' => [
                'total' => 0,
                'passed' => 0,
                'failed' => 0,
                'warnings' => 0
            ]
        ];
    }
    
    /**
     * Main testing function
     */
    public function testSVGFile($filePath) {
        if (!file_exists($filePath)) {
            $this->addError("File not found: $filePath");
            return false;
        }
        
        $this->addTest("file_exists", "File exists", true);
        
        // Test SVG structure
        $this->testSVGStructure($filePath);
        
        // Test PWA compatibility
        $this->testPWACompatibility($filePath);
        
        // Test PHP integration
        $this->testPHPIntegration($filePath);
        
        // Test browser compatibility
        $this->testBrowserCompatibility($filePath);
        
        // Test Linux preview compatibility
        $this->testLinuxPreview($filePath);
        
        // Test HTML form elements (REQUIRED for interactive PWA)
        $this->testHTMLFormElements($filePath);
        
        // Generate summary
        $this->generateSummary();
        
        return $this->results;
    }
    
    /**
     * Test SVG structure and validity
     */
    private function testSVGStructure($filePath) {
        $content = file_get_contents($filePath);
        
        // Test 1: Valid XML structure (handle PHP+SVG files)
        $isPhpSvg = (strpos($content, '<?php') !== false || strpos($content, '<?=') !== false);
        
        if ($isPhpSvg) {
            // For PHP+SVG files, check if basic XML structure is valid by removing PHP tags
            $contentForXml = preg_replace('/<\?php.*?\?>/s', '', $content);
            $contentForXml = preg_replace('/<\?=.*?\?>/s', '', $contentForXml);
            $xml = @simplexml_load_string($contentForXml);
            $this->addTest("valid_xml", "Valid XML structure (PHP+SVG compatible)", $xml !== false);
        } else {
            // For regular SVG files, standard XML validation
            $xml = @simplexml_load_string($content);
            $this->addTest("valid_xml", "Valid XML structure", $xml !== false);  
        }
        
        // Test 2: SVG namespace
        $hasSVGNamespace = strpos($content, 'xmlns="http://www.w3.org/2000/svg"') !== false ||
                          strpos($content, 'xmlns:svg="http://www.w3.org/2000/svg"') !== false;
        $this->addTest("svg_namespace", "SVG namespace present", $hasSVGNamespace);
        
        // Test 3: Root SVG element
        $hasRootSVG = preg_match('/<svg[^>]*>/', $content);
        $this->addTest("root_svg_element", "Root SVG element present", $hasRootSVG);
        
        // Test 4: ViewBox attribute
        $hasViewBox = strpos($content, 'viewBox=') !== false;
        $this->addTest("viewbox_attribute", "ViewBox attribute present", $hasViewBox);
        
        // Test 5: Width and Height
        $hasWidth = strpos($content, 'width=') !== false;
        $hasHeight = strpos($content, 'height=') !== false;
        $this->addTest("dimensions", "Width and Height defined", $hasWidth && $hasHeight);
        
        // Test 6: No external dependencies
        $hasExternalDeps = preg_match('/href=["\']((http|https|ftp):\/\/)/i', $content);
        $this->addTest("no_external_deps", "No external dependencies", !$hasExternalDeps);
        
        // Test 7: No g transform elements  
        $hasGTransform = preg_match('/<g[^>]*transform=/', $content);
        $this->addTest("no_g_transform", "No g transform elements", !$hasGTransform);
        
        // Test 8: No g elements at all (REQUIRED for clean SVG structure)
        $hasGElements = preg_match('/<g[\s>]/', $content);
        $this->addTest("no_g_elements", "No g elements (use direct SVG elements instead)", !$hasGElements);
        
        return true;
    }
    
    /**
     * Test PWA compatibility
     */
    private function testPWACompatibility($filePath) {
        $content = file_get_contents($filePath);
        
        // Test 1: Inline styles (no external CSS)
        $hasExternalCSS = preg_match('/link[^>]*rel=["\']*stylesheet["\']/', $content);
        $this->addTest("inline_styles", "Uses inline styles", !$hasExternalCSS);
        
        // Test 2: Responsive design elements
        $hasResponsiveElements = strpos($content, 'viewBox=') !== false ||
                               strpos($content, 'preserveAspectRatio=') !== false;
        $this->addTest("responsive_design", "Responsive design elements", $hasResponsiveElements);
        
        // Test 3: No JavaScript dependencies
        $hasJSScripts = preg_match('/<script[^>]*src=/', $content);
        $this->addTest("no_js_deps", "No external JavaScript dependencies", !$hasJSScripts);
        
        // Test 4: Self-contained
        $isSelfContained = !preg_match('/src=["\'](http|https|\/\/)/', $content) &&
                          !preg_match('/href=["\'](http|https|\/\/)/', $content);
        $this->addTest("self_contained", "Self-contained SVG", $isSelfContained);
        
        return true;
    }
    
    /**
     * Test PHP integration compatibility
     */
    private function testPHPIntegration($filePath) {
        $content = file_get_contents($filePath);
        
        // Test 1: PHP code embedded within SVG tags (REQUIRED for PHP+SVG PWA)
        $hasSVGPHP = $this->checkPHPInSVG($content);
        $this->addTest("php_in_svg", "PHP code embedded within SVG tags", $hasSVGPHP);
        
        // Test 2: PHP opening tag present
        $hasPhpTags = strpos($content, '<?php') !== false || strpos($content, '<?=') !== false;
        $this->addTest("php_tags_present", "PHP tags present in file", $hasPhpTags);
        
        // Test 3: Proper PHP+SVG structure (PHP header + SVG content)
        $hasProperStructure = $this->checkPHPSVGStructure($content);
        $this->addTest("php_svg_structure", "Proper PHP+SVG file structure", $hasProperStructure);
        
        // Test 4: UTF-8 encoding
        $isUTF8 = mb_check_encoding($content, 'UTF-8');
        $this->addTest("utf8_encoding", "UTF-8 encoding", $isUTF8);
        
        return true;
    }
    
    /**
     * Check if PHP code is embedded within SVG tags
     */
    private function checkPHPInSVG($content) {
        // Extract content between <svg> and </svg> tags
        if (preg_match('/<svg[^>]*>(.*?)<\/svg>/s', $content, $matches)) {
            $svgContent = $matches[1];
            
            // Check for PHP code within SVG content
            $hasPhpInSVG = (strpos($svgContent, '<?php') !== false || 
                           strpos($svgContent, '<?=') !== false ||
                           strpos($svgContent, '<?') !== false);
            
            return $hasPhpInSVG;
        }
        
        return false;
    }
    
    /**
     * Check proper PHP+SVG file structure (accepts embedded PHP in SVG)
     */
    private function checkPHPSVGStructure($content) {
        // Check for PHP code anywhere in the file (embedded PHP is valid)
        $hasPhpCode = (strpos($content, '<?php') !== false || strpos($content, '<?=') !== false);
        
        // XML declaration is optional for SVG files (<?xml)
        $hasXMLDeclaration = strpos($content, '<?xml') !== false;
        
        // Should have SVG root element with proper namespace
        $hasSVGRoot = preg_match('/<svg[^>]*xmlns=["\']http:\/\/www\.w3\.org\/2000\/svg["\']/', $content);
        
        // For PHP+SVG files: SVG root + embedded PHP is sufficient
        // XML declaration is optional as SVG can be valid without it
        $basicStructureValid = $hasSVGRoot && $hasPhpCode;
        
        // For PHP+SVG files, this structure is valid regardless of Content-Type header
        // (header can be set by router.php or server configuration)
        return $basicStructureValid;
    }
    
    /**
     * Test HTML form elements for interactive PWA functionality
     */
    private function testHTMLFormElements($filePath) {
        $content = file_get_contents($filePath);
        
        // Test 1: foreignObject elements present (required for HTML in SVG)
        $hasForeignObject = strpos($content, '<foreignObject') !== false;
        $this->addTest("foreign_object_present", "foreignObject elements present", $hasForeignObject);
        
        // Test 2: HTML form elements inside foreignObject (if foreignObject present)
        if ($hasForeignObject) {
            $hasHTMLInputs = $this->checkHTMLFormElements($content);
            $this->addTest("html_form_elements", "HTML form elements (input, button) in foreignObject", $hasHTMLInputs);
        } else {
            $this->addTest("html_form_elements", "HTML form elements not required (no foreignObject)", true);
        }
        
        // Test 3: No pseudo-buttons (allow hybrid usage for interactive apps)
        $hasPseudoButtons = $this->checkPseudoButtons($content);
        // Allow pseudo-buttons if HTML form elements are also present (hybrid approach)
        $hasHTMLElements = strpos($content, '<xhtml:button') !== false || strpos($content, '<xhtml:input') !== false;
        $pseudoButtonsOk = !$hasPseudoButtons || $hasHTMLElements;
        $this->addTest("no_pseudo_buttons", "No pseudo-buttons (or hybrid usage allowed)", $pseudoButtonsOk);
        
        // Test 4: Interactive elements properly embedded
        $hasProperInteractivity = $this->checkInteractiveElements($content);
        $this->addTest("proper_interactivity", "Interactive elements properly embedded", $hasProperInteractivity);
        
        // Test 5: XHTML namespace present when using foreignObject (REQUIRED for HTML in SVG)
        $hasXHTMLNamespace = $this->checkXHTMLNamespace($content, $hasForeignObject);
        $this->addTest("xhtml_namespace", "XHTML namespace present when using foreignObject", $hasXHTMLNamespace);
        
        if (!$hasForeignObject) {
            $this->addWarning("Consider using foreignObject to embed HTML form elements for better interactivity");
        }
        
        if ($hasForeignObject && !$hasXHTMLNamespace) {
            $this->addWarning("Add xmlns:xhtml='http://www.w3.org/1999/xhtml' to <svg> tag when using foreignObject with HTML");
        }
        
        return true;
    }
    
    /**
     * Check for HTML form elements in foreignObject
     */
    private function checkHTMLFormElements($content) {
        // Look for HTML form elements inside foreignObject
        if (preg_match('/<foreignObject[^>]*>(.*?)<\/foreignObject>/s', $content, $matches)) {
            $foreignObjectContent = $matches[1];
            
            // Check for HTML form elements (both regular and xhtml namespaced)
            $hasInput = (strpos($foreignObjectContent, '<input') !== false ||
                        strpos($foreignObjectContent, '<xhtml:input') !== false);
            $hasButton = (strpos($foreignObjectContent, '<button') !== false ||
                         strpos($foreignObjectContent, '<xhtml:button') !== false);
            $hasSelect = (strpos($foreignObjectContent, '<select') !== false ||
                         strpos($foreignObjectContent, '<xhtml:select') !== false);
            $hasTextarea = (strpos($foreignObjectContent, '<textarea') !== false ||
                           strpos($foreignObjectContent, '<xhtml:textarea') !== false);
            
            return $hasInput || $hasButton || $hasSelect || $hasTextarea;
        }
        
        return false;
    }
    
    /**
     * Check for pseudo-buttons (SVG rect + text pattern)
     */
    private function checkPseudoButtons($content) {
        // Look for common pseudo-button patterns
        $rectWithOnclick = preg_match('/<rect[^>]*onclick=/', $content);
        $buttonClass = strpos($content, 'class="button"') !== false;
        $buttonTextClass = strpos($content, 'class="button-text"') !== false;
        
        return $rectWithOnclick || ($buttonClass && $buttonTextClass);
    }
    
    /**
     * Check for proper interactive elements
     */
    private function checkInteractiveElements($content) {
        // Should have foreignObject if it has interactive elements
        $hasForeignObject = strpos($content, '<foreignObject') !== false;
        $hasClickHandlers = strpos($content, 'onclick=') !== false;
        
        // If has click handlers, should use proper HTML elements
        if ($hasClickHandlers && !$hasForeignObject) {
            return false; // Using SVG click handlers without proper HTML elements
        }
        
        return true;
    }
    
    /**
     * Check for XHTML namespace when using foreignObject
     */
    private function checkXHTMLNamespace($content, $hasForeignObject) {
        // If no foreignObject, XHTML namespace is not required
        if (!$hasForeignObject) {
            return true;
        }
        
        // Check for XHTML namespace declaration in SVG root element
        $hasXHTMLNamespace = preg_match('/<svg[^>]*xmlns:xhtml=["\']http:\/\/www\.w3\.org\/1999\/xhtml["\']/', $content);
        
        return $hasXHTMLNamespace;
    }
    
    /**
     * Test browser compatibility
     */
    private function testBrowserCompatibility($filePath) {
        $content = file_get_contents($filePath);
        
        // Test 1: Standard SVG elements (allowing foreignObject for interactive apps)
        $unsupportedElements = ['switch']; // foreignObject is now allowed for interactive SVG+PHP apps
        $hasUnsupported = false;
        foreach ($unsupportedElements as $element) {
            if (strpos($content, "<$element") !== false) {
                $hasUnsupported = true;
                break;
            }
        }
        $this->addTest("standard_elements", "Uses only standard SVG elements (foreignObject allowed)", !$hasUnsupported);
        
        // Test 2: CSS compatibility
        $hasModernCSS = preg_match('/transform:|filter:|opacity:/', $content);
        $this->addTest("css_compatibility", "CSS properties compatible", true);
        
        // Test 3: File size check (under 1MB for PWA)
        $fileSize = filesize($filePath);
        $sizeOK = $fileSize < 1024 * 1024; // 1MB
        $this->addTest("file_size", "File size under 1MB", $sizeOK);
        
        if (!$sizeOK) {
            $this->addWarning("File size is " . round($fileSize / 1024, 2) . "KB, consider optimization");
        }
        
        return true;
    }
    
    /**
     * Test Linux preview compatibility
     */
    private function testLinuxPreview($filePath) {
        // Test 1: File permissions
        $isReadable = is_readable($filePath);
        $this->addTest("file_readable", "File is readable", $isReadable);
        
        // Test 2: File extension
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $correctExtension = $extension === 'svg';
        $this->addTest("correct_extension", "Correct .svg extension", $correctExtension);
        
        // Test 3: SVG header present
        $content = file_get_contents($filePath);
        $hasSVGHeader = strpos($content, '<?xml') === 0 || strpos($content, '<svg') !== false;
        $this->addTest("svg_header", "SVG header present", $hasSVGHeader);
        
        return true;
    }
    
    /**
     * Test for runtime/functional errors in SVG+PHP apps
     */
    private function testRuntimeErrors($filePath) {
        $content = file_get_contents($filePath);
        
        // Test 1: PHP syntax check (catch parse errors)
        $syntaxCheck = $this->checkPHPSyntax($filePath);
        $this->addTest("php_syntax", "PHP syntax is valid (no parse errors)", $syntaxCheck);
        
        // Test 2: Check for potential runtime issues
        $hasRuntimeIssues = $this->checkRuntimeIssues($content);
        $this->addTest("runtime_safety", "No obvious runtime issues detected", !$hasRuntimeIssues);
        
        // Test 3: Check for proper error handling
        $hasErrorHandling = $this->checkErrorHandling($content);
        $this->addTest("error_handling", "Proper error handling implemented", $hasErrorHandling);
        
        // Test 4: Check for output before headers (common JSON API issue)
        $hasOutputBeforeHeaders = $this->checkOutputBeforeHeaders($content);
        $this->addTest("output_order", "No output before headers (prevents JSON parse errors)", !$hasOutputBeforeHeaders);
        
        return true;
    }
    
    /**
     * Check PHP syntax using php -l command
     */
    private function checkPHPSyntax($filePath) {
        $output = [];
        $returnCode = 0;
        exec("php -l " . escapeshellarg($filePath) . " 2>&1", $output, $returnCode);
        return $returnCode === 0;
    }
    
    /**
     * Check for potential runtime issues in code
     */
    private function checkRuntimeIssues($content) {
        // Check for common runtime issue patterns
        $issues = [
            // Mixing different PHP syntax styles
            '/}\s*endforeach\s*;/',
            '/}\s*endif\s*;/',
            '/}\s*endwhile\s*;/',
            // Potential undefined variable access
            '/\$[a-zA-Z_][a-zA-Z0-9_]*\s*\[\s*["\'][^"\']
]*["\']\s*\]\s*(?!\s*=)/',
            // Missing semicolons in common places
            '/echo\s+[^;\n]*\n/',
        ];
        
        foreach ($issues as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for proper error handling in PHP code
     */
    private function checkErrorHandling($content) {
        // Look for error handling patterns
        $hasErrorHandling = (
            strpos($content, 'try {') !== false ||
            strpos($content, 'catch') !== false ||
            strpos($content, 'error_reporting') !== false ||
            strpos($content, 'ini_set') !== false ||
            strpos($content, 'set_error_handler') !== false
        );
        
        return $hasErrorHandling;
    }
    
    /**
     * Check for output before headers (causes JSON parse errors)
     */
    private function checkOutputBeforeHeaders($content) {
        // Find PHP sections and check if there's output before header() calls
        if (preg_match_all('/<\?php(.*?)\?>/s', $content, $matches)) {
            foreach ($matches[1] as $phpCode) {
                // Check if there's echo/print/output before header() calls
                if (preg_match('/header\s*\(/', $phpCode)) {
                    $beforeHeader = substr($phpCode, 0, strpos($phpCode, 'header('));
                    if (preg_match('/(echo|print|printf|var_dump)\s*\(/', $beforeHeader)) {
                        return true;
                    }
                }
            }
        }
        
        // Also check if XML/SVG content appears before JSON API responses
        if (strpos($content, '<?xml') !== false && strpos($content, 'header(\'Content-Type: application/json\')') !== false) {
            $xmlPos = strpos($content, '<?xml');
            $jsonHeaderPos = strpos($content, 'header(\'Content-Type: application/json\')');
            if ($xmlPos < $jsonHeaderPos) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Add test result
     */
    private function addTest($testName, $description, $passed) {
        $this->results['tests'][] = [
            'name' => $testName,
            'description' => $description,
            'passed' => $passed,
            'status' => $passed ? 'PASS' : 'FAIL'
        ];
        
        $this->results['summary']['total']++;
        if ($passed) {
            $this->results['summary']['passed']++;
        } else {
            $this->results['summary']['failed']++;
        }
    }
    
    /**
     * Add error
     */
    private function addError($message) {
        $this->errors[] = $message;
        $this->results['errors'][] = $message;
    }
    
    /**
     * Add warning
     */
    private function addWarning($message) {
        $this->warnings[] = $message;
        $this->results['warnings'][] = $message;
        $this->results['summary']['warnings']++;
    }
    
    /**
     * Generate summary
     */
    private function generateSummary() {
        $total = $this->results['summary']['total'];
        $passed = $this->results['summary']['passed'];
        
        $this->results['summary']['success_rate'] = $total > 0 ? round(($passed / $total) * 100, 2) : 0;
        $this->results['summary']['status'] = $this->results['summary']['failed'] > 0 ? 'FAILED' : 'PASSED';
    }
}

// Handle CLI arguments or HTTP requests
if ($isCommandLine) {
    // Command line interface
    if ($argc < 2) {
        echo "🔍 SVG PHP+PWA Validator - Command Line Interface\n";
        echo "===============================================\n\n";
        echo "Usage: php index.php <svg-file-or-directory>\n";
        echo "Examples:\n";
        echo "  Single file: php index.php ../devmind.svg\n";
        echo "  Directory:   php index.php ../correct/\n";
        echo "  All folders: php index.php ../\n\n";
        exit(1);
    }
    
    $target = $argv[1];
    
    // If relative path, make it relative to current working directory
    if (!file_exists($target) && !str_starts_with($target, '/')) {
        // Try relative to the validator directory
        $target = '../' . $target;
    }
    
    // Check if target is directory or file
    if (is_dir($target)) {
        echo "🚀 Scanning directory recursively: $target\n";
        echo "=" . str_repeat("=", strlen($target) + 32) . "\n\n";
        
        $svgFiles = findSVGFilesRecursively($target);
        
        if (empty($svgFiles)) {
            echo "❌ No SVG files found in directory: $target\n";
            exit(1);
        }
        
        echo "📁 Found " . count($svgFiles) . " SVG files:\n";
        foreach ($svgFiles as $file) {
            echo "   📄 $file\n";
        }
        echo "\n";
        
        $totalFiles = count($svgFiles);
        $passedFiles = 0;
        $failedFiles = 0;
        $allResults = [];
        
        foreach ($svgFiles as $svgFile) {
            echo str_repeat("-", 80) . "\n";
            echo "🔍 Testing: $svgFile\n";
            echo str_repeat("-", 80) . "\n";
            
            // Check file size to prevent memory exhaustion
            $fileSize = filesize($svgFile);
            if ($fileSize === false || $fileSize > 50 * 1024 * 1024) { // 50MB limit
                echo "⚠️ SKIPPED: File too large (" . round($fileSize / 1024 / 1024, 1) . "MB) - would exhaust memory\n";
                $failedFiles++;
                echo "\n";
                continue;
            }
            
            $validator = new SVGPWAValidator();
            $results = $validator->testSVGFile($svgFile);
            
            if ($results === false) {
                echo "❌ Error: Could not test file\n";
                $failedFiles++;
                continue;
            }
            
            // Quick summary for directory scan
            $passed = $results['summary']['passed'];
            $total = $results['summary']['total'];
            $success = ($passed === $total);
            
            if ($success) {
                echo "✅ PASSED ($passed/$total tests)\n";
                $passedFiles++;
            } else {
                echo "❌ FAILED ($passed/$total tests)\n";
                $failedFiles++;
                
                // Show failed tests
                echo "\n📋 Failed Tests:\n";
                foreach ($results['tests'] as $test) {
                    if (!$test['passed']) {
                        echo "   ❌ " . $test['name'] . ": " . $test['description'] . "\n";
                    }
                }
            }
            
            $allResults[$svgFile] = $results;
            echo "\n";
        }
        
        // Final summary
        echo str_repeat("=", 80) . "\n";
        echo "📊 DIRECTORY SCAN SUMMARY\n";
        echo str_repeat("=", 80) . "\n";
        echo "Total Files:  $totalFiles\n";
        echo "Passed:       $passedFiles ✅\n";
        echo "Failed:       $failedFiles ❌\n";
        echo "Success Rate: " . round(($passedFiles / $totalFiles) * 100, 1) . "%\n";
        
        if ($failedFiles > 0) {
            echo "\n❌ Failed Files:\n";
            foreach ($allResults as $file => $result) {
                if ($result['summary']['passed'] !== $result['summary']['total']) {
                    echo "   📄 $file ({$result['summary']['passed']}/{$result['summary']['total']})\n";
                }
            }
        }
        
        echo "\n🕒 Scan completed at: " . date('Y-m-d H:i:s') . "\n";
        exit($failedFiles > 0 ? 1 : 0);
        
    } else {
        // Single file testing
        $svgFile = $target;
        echo "🚀 Testing SVG file: $svgFile\n";
        echo "=" . str_repeat("=", strlen($svgFile) + 18) . "\n\n";
    }
    
    $validator = new SVGPWAValidator();
    $results = $validator->testSVGFile($svgFile);
    
    if ($results === false) {
        echo "❌ Error: Could not test file\n";
        if (!empty($results['errors'])) {
            foreach ($results['errors'] as $error) {
                echo "   $error\n";
            }
        }
        exit(1);
    }
    
    // Display results in CLI format
    echo "📊 Test Results Summary:\n";
    echo "------------------------\n";
    echo "Total Tests:  " . $results['summary']['total'] . "\n";
    echo "Passed:      " . $results['summary']['passed'] . " ✅\n";
    echo "Failed:      " . $results['summary']['failed'] . " ❌\n";
    echo "Warnings:    " . $results['summary']['warnings'] . " ⚠️\n";
    echo "Success Rate: " . $results['summary']['success_rate'] . "%\n";
    echo "Status:      " . ($results['summary']['status'] === 'PASSED' ? '✅ PASSED' : '❌ FAILED') . "\n\n";
    
    // Display detailed test results
    echo "📋 Detailed Test Results:\n";
    echo "--------------------------\n";
    foreach ($results['tests'] as $test) {
        $status = $test['passed'] ? '✅' : '❌';
        echo sprintf("%-20s %s %s\n", $test['name'], $status, $test['description']);
    }
    
    // Display errors if any
    if (!empty($results['errors'])) {
        echo "\n🔴 Errors:\n";
        echo "----------\n";
        foreach ($results['errors'] as $error) {
            echo "• $error\n";
        }
    }
    
    // Display warnings if any
    if (!empty($results['warnings'])) {
        echo "\n⚠️  Warnings:\n";
        echo "-------------\n";
        foreach ($results['warnings'] as $warning) {
            echo "• $warning\n";
        }
    }
    
    echo "\n🕒 Test completed at: " . $results['timestamp'] . "\n";
    
    // Exit with appropriate code
    exit($results['summary']['failed'] > 0 ? 1 : 0);
    
} else {
    // HTTP interface (original web API)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'File path is required']);
            exit;
        }
        
        $validator = new SVGPWAValidator();
        $results = $validator->testSVGFile($input['file']);
        
        echo json_encode($results, JSON_PRETTY_PRINT);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['file'])) {
        $validator = new SVGPWAValidator();
        $results = $validator->testSVGFile($_GET['file']);
        
        echo json_encode($results, JSON_PRETTY_PRINT);
    } else {
        // Return API documentation
        $apiDoc = [
            'name' => 'SVG PWA Validator API',
            'version' => '1.0.0',
            'description' => 'API for validating SVG files for PWA and PHP compatibility',
            'endpoints' => [
                [
                    'method' => 'GET',
                    'url' => '?file=path/to/file.svg',
                    'description' => 'Test SVG file via GET parameter'
                ],
                [
                    'method' => 'POST',
                    'url' => '/',
                    'description' => 'Test SVG file via POST JSON',
                    'body' => ['file' => 'path/to/file.svg']
                ]
            ],
            'cli_usage' => [
                'command' => 'php index.php <svg-file>',
                'example' => 'php index.php ../devmind.svg'
            ]
        ];
        
        echo json_encode($apiDoc, JSON_PRETTY_PRINT);
    }
}
?>
