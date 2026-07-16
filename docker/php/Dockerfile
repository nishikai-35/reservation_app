FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    curl \
    cron \
    default-mysql-client \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


RUN docker-php-ext-install \
    pdo_mysql \
    zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# cron設定
COPY docker/php/laravel-cron /etc/cron.d/laravel-cron

RUN chmod 0644 /etc/cron.d/laravel-cron \
    && crontab /etc/cron.d/laravel-cron

WORKDIR /var/www/html

# start.sh設定
COPY docker/php/start.sh /start.sh

RUN chmod +x /start.sh

CMD ["/start.sh"]