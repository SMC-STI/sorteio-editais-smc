#  Deploy de Aplicação Sorteio-editais SMC em Next.js e Ubuntu 22.04 (Azure VM)

Este guia detalha o processo completo para fazer o deploy da aplicação [Next.js](https://nextjs.org/) em uma máquina virtual (VM) rodando Ubuntu 22.04 no Azure, utilizando **Node.js**, **PM2** e **Nginx** como proxy reverso.


##  Pré-requisitos

- VM Ubuntu 22.04 criada no Microsoft Azure
- Acesso SSH à máquina virtual
- Repositório da aplicação Next.js (GitHub, GitLab, etc)
- Domínio configurado e apontando para a VM (opcional, mas recomendado)
- O nome da aplicação neste manual é ''nextjstapp'' caso necessário este nome pode ser mudado durante a implantação.
---

##  Instalar Dependências Básicas

<code>
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm git nginx
</code>

## Clonar e Configurar a Aplicação

<code>
git clone https://github.com/SMC-STI/sorteio-editais-smc
cd sorteio-editais-smc
npm install
npm run build
</code>

## Executar com PM2
<code>
sudo npm install -g pm2
pm2 start npm --name "nextjsapp" -- start
pm2 save
pm2 startup
</code>

## Configurar Nginx como Proxy Reverso
<code>
sudo nano /etc/nginx/sites-available/nextjsapp
</code>
(substitua ***SEU_DOMINIO.com)
<code><pre>server {
    listen 80;
    server_name ***SEU_DOMINIO.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}</code></pre> 

Ative e valide a configuração:

<code>sudo ln -s /etc/nginx/sites-available/nextjsapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
</code>

## Instalar Certbot e obter Certificado SSL
<code>
sudo apt update
sudo apt install certbot python3-certbot-nginx
</code>

Execute o Certbot

<code>
sudo certbot --nginx -d seu_dominio.com -d www.seu_dominio.com #Lembre-se de colocar o domínio disponibilizado
sudo certbot renew --dry-run # Teste renovação automática
pm2 restart nextjsapp # Reinicia a aplicação no pm2
</code>


## Comandos Úteis
<code><pre>
pm2 list             # Lista apps gerenciadas
pm2 logs             # Ver logs em tempo real
pm2 restart nextjsapp # Reinicia a aplicação
pm2 delete nextjsapp  # Remove app do PM2
</pre></code>

## Resolvendo Erros Comuns
Nginx falha ao iniciar
<code>
>ls -l /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/nextjsapp 
sudo systemctl restart nginx
</code>



 
