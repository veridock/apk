FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    imagemagick \
    libmagickwand-dev \
    ghostscript \
    poppler-utils \
    curl \
    zip \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN pecl install imagick \
    && docker-php-ext-enable imagick \
    && docker-php-ext-install pdo pdo_mysql opcache

# Enable Apache modules
RUN a2enmod rewrite headers expires

# Configure PHP
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY <<EOF $PHP_INI_DIR/conf.d/custom.ini
upload_max_filesize = 50M
post_max_size = 50M
memory_limit = 256M
max_execution_time = 300
display_errors = Off
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
date.timezone = UTC
EOF

# Configure Apache to handle SVG files with PHP
COPY <<EOF /etc/apache2/sites-available/000-default.conf
<VirtualHost *:80>
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # Handle SVG files with PHP
        <FilesMatch "\.svg$">
            SetHandler application/x-httpd-php
        </FilesMatch>
    </Directory>

    # Security headers
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"

    # Enable compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json image/svg+xml
    </IfModule>

    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF

# Create required directories
RUN mkdir -p /var/www/html/uploads /var/www/html/output \
    && chown -R www-data:www-data /var/www/html/uploads /var/www/html/output \
    && chmod -R 755 /var/www/html/uploads /var/www/html/output

# Copy application files
COPY . /var/www/html/

# Create health check script
RUN echo '<?php echo "OK"; ?>' > /var/www/html/health-check.php

# Set working directory
WORKDIR /var/www/html

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]