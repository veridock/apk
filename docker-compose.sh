version: '3.8'

services:
  svg-php-app:
    build: .
    container_name: svg-php-launcher
    ports:
      - "${PORT:-8097}:80"
    volumes:
      - ./:/var/www/html
      - ./uploads:/var/www/html/uploads
      - ./output:/var/www/html/output
    environment:
      - APP_TITLE=${APP_TITLE:-SVG+PHP Application}
      - APP_VERSION=${APP_VERSION:-1.0.0}
      - APP_AUTHOR=${APP_AUTHOR:-Developer}
      - CALCULATOR_TITLE=${CALCULATOR_TITLE:-PHP Calculator}
      - PHP_DISPLAY_ERRORS=1
      - PHP_ERROR_REPORTING=E_ALL
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health-check.php"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - svg-php-network

  # Optional: Add nginx as reverse proxy for better performance
  nginx:
    image: nginx:alpine
    container_name: svg-php-nginx
    ports:
      - "${NGINX_PORT:-8098}:80"
    volumes:
      - ./:/var/www/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - svg-php-app
    networks:
      - svg-php-network
    profiles:
      - production

networks:
  svg-php-network:
    driver: bridge

volumes:
  uploads:
  output: