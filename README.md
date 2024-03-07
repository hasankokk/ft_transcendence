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
