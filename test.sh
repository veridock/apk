#!/bin/bash
# Test Suite for SVG+PHP Universal Launcher
# =========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

echo "SVG+PHP Launcher Test Suite"
echo "==========================="
echo

# Test function
test_case() {
    local name="$1"
    local command="$2"
    local expected_exit_code="${3:-0}"
    
    echo -n "Testing: $name... "
    
    if eval "$command" >/dev/null 2>&1; then
        local exit_code=$?
        if [ $exit_code -eq $expected_exit_code ]; then
            echo -e "${GREEN}PASS${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}FAIL${NC} (exit code: $exit_code, expected: $expected_exit_code)"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

# PHP Tests
echo "PHP Environment Tests:"
echo "----------------------"
test_case "PHP Installation" "command -v php"
test_case "PHP Version 8.0+" "php -r 'exit(version_compare(PHP_VERSION, \"8.0\") >= 0 ? 0 : 1);'"
test_case "PHP CLI SAPI" "php -r 'exit(php_sapi_name() === \"cli\" ? 0 : 1);'"

echo

# File Structure Tests  
echo "File Structure Tests:"
echo "--------------------"
test_case "index.html exists" "test -f index.html"
test_case "portable.php exists" "test -f portable.php"
test_case "router.php exists" "test -f router.php"
test_case "Dockerfile exists" "test -f Dockerfile"
test_case "uploads directory" "test -d uploads"
test_case "output directory" "test -d output"

echo

# SVG Files Tests
echo "SVG Files Tests:"
echo "---------------"
for svg_file in *.svg; do
    if [ -f "$svg_file" ]; then
        test_case "$svg_file syntax" "xmllint --noout \"$svg_file\""
    fi
done

echo

# PHP Syntax Tests
echo "PHP Syntax Tests:"
echo "----------------"
for php_file in *.php; do
    if [ -f "$php_file" ]; then
        test_case "$php_file syntax" "php -l \"$php_file\""
    fi
done

echo

# Functional Tests
echo "Functional Tests:"
echo "----------------"
test_case "Portable launcher syntax" "php -l portable.php"
test_case "Router functionality" "php router.php sample-calculator.svg" "0"

# Docker Tests (if available)
if command -v docker >/dev/null 2>&1; then
    echo
    echo "Docker Tests:"
    echo "------------"
    test_case "Docker available" "docker --version"
    test_case "Dockerfile syntax" "docker build -t svg-php-test . --dry-run" "0"
    
    if command -v docker-compose >/dev/null 2>&1; then
        test_case "Docker Compose syntax" "docker-compose config -q"
    fi
fi

echo
echo "Test Results:"
echo "============="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total:  $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! ✅${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed! ❌${NC}"
    exit 1
fi
