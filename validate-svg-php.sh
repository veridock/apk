#!/bin/bash
# SVG+PHP Validator
# Specialized validator for SVG files with embedded PHP code
# ========================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

validate_svg_php() {
    local file="$1"
    local errors=0
    
    echo -e "${BLUE}Validating: $file${NC}"
    
    # Check if file exists
    if [ ! -f "$file" ]; then
        echo -e "  ${RED}✗ File not found${NC}"
        return 1
    fi
    
    # Check SVG structure
    if ! grep -q '<svg' "$file"; then
        echo -e "  ${RED}✗ Missing <svg> opening tag${NC}"
        ((errors++))
    else
        echo -e "  ${GREEN}✓ SVG opening tag found${NC}"
    fi
    
    if ! grep -q '</svg>' "$file"; then
        echo -e "  ${RED}✗ Missing </svg> closing tag${NC}"
        ((errors++))
    else
        echo -e "  ${GREEN}✓ SVG closing tag found${NC}"
    fi
    
    # Check PHP syntax by creating temporary file
    if grep -q '<?php' "$file"; then
        echo -e "  ${YELLOW}ℹ PHP code detected${NC}"
        
        # Extract and validate PHP blocks
        temp_php=$(mktemp --suffix=.php)
        echo "<?php" > "$temp_php"
        
        # Extract PHP code blocks and check syntax
        grep -o '<?php.*?>' "$file" | sed 's/<?php//' | sed 's/?>//' >> "$temp_php" 2>/dev/null
        
        if php -l "$temp_php" >/dev/null 2>&1; then
            echo -e "  ${GREEN}✓ PHP syntax valid${NC}"
        else
            echo -e "  ${RED}✗ PHP syntax errors detected${NC}"
            php -l "$temp_php" 2>&1 | grep -v "No syntax errors"
            ((errors++))
        fi
        
        rm -f "$temp_php"
    else
        echo -e "  ${YELLOW}ℹ Pure SVG file (no PHP)${NC}"
        
        # For pure SVG, use XML validation
        if command -v xmllint >/dev/null 2>&1; then
            if xmllint --noout "$file" 2>/dev/null; then
                echo -e "  ${GREEN}✓ XML syntax valid${NC}"
            else
                echo -e "  ${RED}✗ XML syntax errors${NC}"
                ((errors++))
            fi
        fi
    fi
    
    # Check for common SVG+PHP patterns
    if grep -q 'xmlns:xhtml=' "$file"; then
        echo -e "  ${GREEN}✓ XHTML namespace declared${NC}"
    elif grep -q '<?php' "$file"; then
        echo -e "  ${YELLOW}⚠ Consider adding XHTML namespace for PHP compatibility${NC}"
    fi
    
    # Check viewport
    if grep -q 'viewBox=' "$file"; then
        echo -e "  ${GREEN}✓ ViewBox defined${NC}"
    else
        echo -e "  ${YELLOW}⚠ ViewBox not defined (may affect scaling)${NC}"
    fi
    
    # Security checks
    if grep -q 'eval\|exec\|system\|shell_exec' "$file"; then
        echo -e "  ${RED}⚠ SECURITY WARNING: Dangerous PHP functions detected${NC}"
        ((errors++))
    fi
    
    echo
    
    if [ $errors -eq 0 ]; then
        echo -e "  ${GREEN}✅ $file is valid${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $file has $errors error(s)${NC}"
        return 1
    fi
}

# Main execution
echo "SVG+PHP Validator"
echo "=================="
echo

total_files=0
valid_files=0

if [ $# -eq 0 ]; then
    # Validate all SVG files
    for file in *.svg; do
        if [ -f "$file" ]; then
            ((total_files++))
            if validate_svg_php "$file"; then
                ((valid_files++))
            fi
            echo "----------------------------------------"
        fi
    done
else
    # Validate specific files
    for file in "$@"; do
        ((total_files++))
        if validate_svg_php "$file"; then
            ((valid_files++))
        fi
        echo "----------------------------------------"
    done
fi

echo
echo "Summary:"
echo "========"
echo -e "Total files: $total_files"
echo -e "Valid files: ${GREEN}$valid_files${NC}"
echo -e "Invalid files: ${RED}$((total_files - valid_files))${NC}"

if [ $valid_files -eq $total_files ]; then
    echo -e "\n${GREEN}🎉 All files are valid!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some files need attention.${NC}"
    exit 1
fi
