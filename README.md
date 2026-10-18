# Geometri Atölyesi

Türkçe, mobil uyumlu, bağımlılıksız bir geometri öğrenme uygulaması. İlk bölüm **Temel Şekiller**'dir.

## İlk bölümdeki altı şekil

1. **1 birimlik doğru parçası** — başlangıç uzunluğu 1'dir. A ve B ayrı ayrı sürüklenince uzunluk değişir; gövde sürüklenince ikisi birlikte taşınır ve mevcut uzunluk korunur. Uzunluk kaydırıcısı, animasyon ve sıfırlama vardır.
2. **İkizkenar dik üçgen** — iki birim kenar, 90° merkez açı, √2 hipotenüs; diğer iki iç açı da canlı gösterilir.
3. **Eşkenar üçgen** — iki birim kenar arasındaki açının 60°'ye ulaşmasıyla üçüncü kenar da 1 olur; tüm iç açılar görünür.
4. **√2 kenarlı ikizkenar üçgen** — iki yan kenar √2'de sabit; taban 0–2,82 birim aralığında açılabilir (teorik sınır 2√2). Tepe ve iki taban açısı canlı değişir. **1’e getir** düğmesi özel 1 birim konumuna döndürür.
5. **Birim kare** — köşegen √2 ve iki renkli eş ikizkenar dik üçgen; 45° ve 90° açıları gösterilir.
6. **Birim çeyrek çember** — yarıçap 1, 90° = π/2 radyan; yay π/2 ve kiriş √2. Kiriş/yay uzunlukları çizim üzerinde canlı güncellenir; tam çember arka planda sürekli görünür.

Tüm derslerde 2B SVG çizimler, sürgüler ve oynatılabilir animasyonlar vardır. 3B görünüm şimdilik arayüzde bulunmaz.

## Çalıştırma

Yalnızca statik dosyalar kullanılır. Harici kütüphane, API veya internet bağlantısı gerekmez.

- **index.html** dosyasını modern bir tarayıcıda açın. Dosya protokolünde ES modülleri engellenirse, klasörde **python3 -m http.server 8000** çalıştırın ve **http://localhost:8000** adresini ziyaret edin.
- GitHub Pages için **Settings → Pages → Deploy from a branch → main → /(root)** seçimini yapın (PR birleştirildikten sonra).
- Testler: **npm test** veya **node --test tests/geometry.test.mjs**.

## Dosyalar

- *index.html*: dersler ve erişilebilir kontroller
- *style.css*: kompakt, üst navbar'lı, açık temalı ve mobil uyumlu arayüz
- *app.mjs*: saf geometri hesapları, SVG çizimleri ve sürükleme/animasyon
- *tests/geometry.test.mjs*: doğruluk ve uzunluk koruma testleri

Hiçbir kullanıcı verisi sunucuya gönderilmez. Sonraki bölümler istek üzerine eklenecektir.
