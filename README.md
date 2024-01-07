# ft_transcendence

## Makefile
- `sudo make [start, up]` ile container kurabilirsiniz
- `sudo make (stop, down)` ile container'ı durdurabilirsiniz
- `sudo make (refresh, re)` ile oluşturulmuş image, database, ve migration'lar silinir
- `make migrations` debugging amaçlıdır,  silinecek migration dosyalarını gösterir

## Karşılaşılan hatalar
- `42_Logo.svg.png` dosyası GET request ile sunucudan istendiğinden dolayı şu an yüklenmemektedir
- register formu ile POST request atıldığında "Bad Request 400" hatası alınıyor. Ancak kullanıcılar admin panelinden eklendiğinde problemsiz bir şekilde login edilebiliyor
- 42auth ile girilirken "The redirect uri included is not valid." hatası alınıyor

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
