# ft_transcendence
![Docker-compose schema](/assets/images/ft_transcendence_schema.png "ft_transcendence schema")

## Makefile
- `make [start, up]` ile container kurulur (--build)
- `make (stop, down)` ile container'ı durdurabilirsiniz
- `make no-build` ile container yeniden kurulmadan başlatılır
- `sudo make (refresh, re)` ile oluşturulmuş image, database, ve migration'lar silinir

## Karşılaşılan hatalar
- Eğer statik dosyalarda yapılan değişiklikler container yeniden kurulduğu halde sayfada görünmüyorsa tarayıcının cache'ini sıfırlamak gerekebilir.
- Eğer hiçbir sayfanın içeriği yüklenmiyorsa ve yerine `{detail: user not found}` içeren bir metin yükleniyorsa `/user/logout/` adresini ziyaret edin veya sitenin çerezlerinden `access_token` ve `refresh_token` değerlerini silin.
- Docker-compose esnasında `services.user-web.depends_on contains unsupported option: 'restart'` hatası çıkıyorsa user-web > depends\_on altında bulunan `restart: true` satırlarını kaldırabilirsiniz.

## Env dosyaları ve değişkenleri

#### GLOBAL_WEB_ALLOWED_HOSTS
Gelen HTTP isteklerinde Host başlığında eşleşmesi gereken adres isimleri
- Kullanan servisler: user-web, game-web, chat-web
- Servise mahsus: `USER_WEB_ALLOWED_HOSTS`, `GAME_WEB_ALLOWED_HOSTS`, `CHAT_WEB_ALLOWED_HOSTS`
- Örnek:
  ```shell
  GLOBAL_WEB_ALLOWED_HOSTS=localhost,ft_transcendence,127.0.0.1,192.168.1.6
  ```

#### CSRF_TRUSTED_ORIGINS
CSRF doğrulaması yapılan POST/PUT/DELETE istekleri için Host başlığında bulunması beklenen adresler
- Kullanan servisler: user-web
- Örnek:
  ```shell
  CSRF_TRUSTED_ORIGINS=https://localhost:3600,https://ft_transcendence:443
  ```

#### JWT_KEY
- Kullanan servisler: user-web, game-web, chat-web

#### OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET / OAUTH_CLIENT_REDIRECT
42 Login API bilgileri
- Kullanan servisler: user-web

#### EMAIL_HOST / EMAIL_HOST_USER / EMAIL_HOST_PASSWORD / EMAIL_PORT
Django tarafından gönderilecek e-postalar için hedef SMTP sunucusunun bilgileri
- Kullanan servisler: user-web

#### POSTGRES_DB / POSTGRES_USER / POSTGRES_PASSWORD
PostreSQL kullanıcı giriş bilgileri
- Kullanan servisler: user-db, user-web

#### USER_WEB_SECRET_KEY / GAME_WEB_SECRET_KEY / CHAT_WEB_SECRET_KEY
Django projelerine ait olan gizli anahtarlar
- Kullanan servisler: user-web, game-web, chat-web
- Not: Web servisi kurulduktan sonra bu değerin değiştirilmemesi gerekir
