# API-POSTS

Este é um projeto contruído com laravel 9. Para rodá-lo é necessário ter instalado docker desktop.


## Comando docker

    ./vendor/bin/sail up

## Dê permissão para a pasta storage

    lourdilene@lourdilene-Inspiron-5558:~$ cd php-projects/
    lourdilene@lourdilene-Inspiron-5558:~/php-projects$ cd api-posts
    lourdilene@lourdilene-Inspiron-5558:~/php-projects/api-posts$ chmod 777 -R storage

## Acesse o app

    http://localhost/

## Migrations
Acesse o docker e execute as migrations:

    lourdilene@lourdilene-Inspiron-5558:~/php-projects/api-posts$ docker exec -it api-posts-laravel.test-1 bash      
    root@e917382508cb:/var/www/html# php artisan migrate

## Rode os tests

    php artisan test

# Endpoinst
Na pasta do projeto, vá até a pasta 'insomia'. Clique na pasta para que a página abra no navegador. 
![](insomia/2022-08-16_23-27.png)

A página abrirá no navegador da seguinte forma:
![](insomia/2022-08-16_23-27_1.png)

Primeiro crie um usuário e em seguida copie o token para acessar os endpoints.

![](insomia/2022-08-16_23-07.png)






