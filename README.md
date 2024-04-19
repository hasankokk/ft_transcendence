# ft_transcendence
![Docker-compose schema](/assets/images/ft_transcendence_schema.png "ft_transcendence schema")

## Makefile
- `sudo make [start, up]` ile container kurabilirsiniz
- `sudo make (stop, down)` ile container'ı durdurabilirsiniz
- `sudo make (refresh, re)` ile oluşturulmuş image, database, ve migration'lar silinir
- `make migrations` debugging amaçlıdır,  silinecek migration dosyalarını gösterir

## Karşılaşılan hatalar
- Docker-compose esnasında `services.user-web.depends_on contains unsupported option: 'restart'` hatası çıkıyorsa user-web > depends_on altında bulunan `restart: true` satırlarını kaldırabilirsiniz.

## Container yapısı
- Django'ya ait dosyalar bind volume ile container'a yansıdığı için Gunicorn tarafından takip edilen dosyalar üzerinde yapılan değişiklikler server'i veya container'ı kapatıp açmaya ihtiyaç duymadan anında sayfa üzerinde görmeyi sağlar.
  - Gunicorn `--reload` opsiyonu varsa django dosyalarında değişiklik olduğu zaman Gunicorn yeniden yüklenir.
  - Gunicorn `--reload-extra-file <path>` opsiyonu varsa `<path>` adresinde bulunan html dosyalarındaki değişiklikler takip edilir.
- ❗Konteynır başlatılırken `BASEDIR/static` klasörü içindeki dosyalar `BASEDIR/staticfiles` içine kopyalanır. Eğer sunucu çalışırken statik dosyalarda yaptığınız değişiklikleri dinamik olarak (sunucuyu kapatıp açmadan) görmek istiyorsanız `BASEDIR/staticfiles` içinde değişiklik yapmalısınız.
  - ❗`staticfiles` dinamik olarak kullanıldığından dolayı kalıcı olmasını istediğiniz değişiklikleri mutlaka `static` içinde de kaydetmelisiniz.
  - ❗`make re` kullanıldığında `staticfiles` klasörü silinir.
- Eğer statik dosyalarda yapılan değişiklikler sayfada görünmüyorsa tarayıcının cache'ini sıfırlamak gerekebilir.

## Klasör yapısı
- Django'ya ait bütün dosyalar `BASEDIR = "src/web/ft_transcendence/"` de yer alıyor
- HTML dosyaları `BASEDIR/templates` içinde uygulamaya göre sınıflandırılmış şekilde bulunur
	- HTML dosyaları içinde js, css dosyalarını link gösterirken şu yapı kullanılmalıdır
	```html
	 <link rel="stylesheet" href="{% static 'styles/global.css' %}" />
    <link rel="stylesheet" href="{% static 'styles/nav.css' %}" />
	```
	HTML dosyalarında `{ ... }`  şeklinde köşeli parantez içinde yazılan kısımlar django tarafından render edilir, yukarıdaki kod örneğinde href değerleri django tarafından sırayla
	`BASEDIR/static/styles/global.css` ve
	`BASEDIR/static/styles/nav.css`
	olarak değiştirilecektir.
- JS, CSS dosyaları `BASEDIR/static` içinde uygulamalara göre sınıflandırılmış şekilde bulunur
- Kullanıcı avatarları `BASEDIR/media/image/user` içinde kaydedilecektir

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

#### OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET
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
