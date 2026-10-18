# Geometri Atölyesi

Türkçe, mobil uyumlu, bağımlılıksız bir geometri öğrenme uygulaması. İlk bölüm **Temel Şekiller**, ikinci bölüm **Temel Trigonometri**'dir.

## İlk bölümdeki altı şekil

1. **1 birimlik doğru parçası** — başlangıç uzunluğu 1'dir. A ve B ayrı ayrı sürüklenince uzunluk değişir; gövde sürüklenince ikisi birlikte taşınır ve mevcut uzunluk korunur. Uzunluk kaydırıcısı, animasyon ve sıfırlama vardır.
2. **İkizkenar dik üçgen** — iki birim kenar, 90° merkez açı, √2 hipotenüs; diğer iki iç açı da canlı gösterilir.
3. **Eşkenar üçgen** — iki birim kenar arasındaki açının 60°'ye ulaşmasıyla üçüncü kenar da 1 olur; tüm iç açılar görünür.
4. **√2 kenarlı ikizkenar üçgen** — iki yan kenar √2'de sabit; taban 0–2,82 birim aralığında açılabilir (teorik sınır 2√2). Tepe ve iki taban açısı canlı değişir. **1’e getir** düğmesi özel 1 birim konumuna döndürür.
5. **Birim kare** — köşegen √2 ve iki renkli eş ikizkenar dik üçgen; 45° ve 90° açıları gösterilir.
6. **Birim çeyrek çember** — yarıçap 1, 90° = π/2 radyan; yay π/2 ve kiriş √2. Kiriş/yay uzunlukları çizim üzerinde canlı güncellenir; tam çember arka planda sürekli görünür.

Tüm derslerde 2B SVG çizimler, sürgüler ve oynatılabilir animasyonlar vardır. 3B görünüm şimdilik arayüzde bulunmaz.

## İkinci bölüm: Temel Trigonometri

**trigonometri.html** sayfası üst menüden veya soldaki konu listesinden açılır. Her başlık etkileşimli bir karttır:

1. **Derece–radyan** — açı, yarıçap ve yay uzunluğu ile s/r=θ.
2. **Dik üçgende sinüs** — sin θ=karşı/hipotenüs ve açının etkisi.
3. **Dik üçgende kosinüs** — cos θ=komşu/hipotenüs ve açının etkisi.
4. **Sinüs grafiği** — 0°–360° eğri, birim çemberde düşey koordinat ve referans dik üçgen.
5. **Kosinüs grafiği** — 0°–360° eğri, yatay koordinat ve referans dik üçgen.
6. **Önemli açılar tablosu** — 0°–360° seçilebilir 17 açı; sin, cos, tan, cot tam değerleri ve tanımsız durumlar.
7. **sin x + cos x** — iki işaretli izdüşümün toplamı, √2 sin(x+45°) özdeşliği.
8. **sin x − cos x** — izdüşümlerin farkı, √2 sin(x−45°) özdeşliği.
9. **sin x · cos x** — izdüşümlerden oluşan dikdörtgenin alanı ve ½ sin(2x) özdeşliği.

Üçgen kartları 1°–89° aralığında gerçek bir dik üçgen gösterir. Birim çember grafiklerinde tüm 0°–360° açıları, ilgili referans açısı ve işaretler gösterilir. Tüm çizimler yalnızca 2B SVG kullanır.

## Çalıştırma

Yalnızca statik dosyalar kullanılır. Harici kütüphane, API veya internet bağlantısı gerekmez.

- **index.html** dosyasını modern bir tarayıcıda açın. Dosya protokolünde ES modülleri engellenirse, klasörde **python3 -m http.server 8000** çalıştırın ve **http://localhost:8000** adresini ziyaret edin.
- GitHub Pages için **Settings → Pages → Deploy from a branch → main → /(root)** seçimini yapın (PR birleştirildikten sonra).
- Testler: **npm test** (her iki bölümün testleri birlikte çalışır).

## Dosyalar

- *index.html*: temel şekiller, erişilebilir kontroller ve konu bağlantıları
- *trigonometri.html*: dokuz temel trigonometri kartı ve tablo
- *style.css*: ortak kompakt, üst navbar'lı ve mobil uyumlu arayüz
- *trigonometri.css*: ikinci konunun kart ve tablo düzeni
- *app.mjs*: saf geometri hesapları, SVG çizimleri ve sürükleme/animasyon
- *trigonometri.mjs*: trigonometrik hesaplar, tam açı değerleri, grafikler ve animasyon
- *tests/geometry.test.mjs*: doğruluk ve uzunluk koruma testleri
- *tests/trigonometry.test.mjs*: radyan, oran, grafik, özdeşlik ve özel açı testleri

Hiçbir kullanıcı verisi sunucuya gönderilmez. Sonraki bölümler istek üzerine eklenecektir.
