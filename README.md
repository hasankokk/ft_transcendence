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
