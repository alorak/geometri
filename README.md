# Geometri Atölyesi

Türkçe, etkileşimli, bağımlılıksız bir geometri öğrenme uygulaması. İlk bölüm **Temel Şekiller**'dir.

## İlk bölümdeki altı şekil

1. **1 birimlik doğru parçası** — AB uzunluğunun 0'dan 1'e uzaması.
2. **İkizkenar dik üçgen** — iki birim kenar, 90° açı ve √2 hipotenüs.
3. **Eşkenar üçgen** — iki birim kenar arasındaki açının 60°'ye ulaşması, üçüncü kenarın 1 olması.
4. **√2 kenarlı ikizkenar üçgen** — eşit yan kenarlar √2, taban 1; tepe açısı yaklaşık 41,41°.
5. **Birim kare** — köşegen √2 ve iki eş ikizkenar dik üçgen.
6. **Birim çeyrek çember** — yarıçap 1, 90° = π/2 radyan; yay π/2 ve kiriş √2. Tam çember karşılaştırması.

Her çizimin yanında kaydırıcı ve animasyon düğmesi bulunur. Üstteki **2B / 3B** anahtarı tüm çizimleri değiştirir. 3B görünüm, düzlemsel şekilleri *temsili bir kalınlıkla* gösterir; matematiksel uzunluklar ve açılar yine 2B düzleme aittir.

## Çalıştırma

Yalnızca statik dosyalar kullanılır, harici kütüphane, API veya internet bağlantısı gerekmez.

- *index.html* dosyasını modern bir tarayıcıda açın. ES modüllerini dosya protokolü üzerinden kısıtlayan tarayıcılarda yerel HTTP sunucusu kullanın: **python3 -m http.server 8000**. Sonra **http://localhost:8000** adresine gidin.
- GitHub Pages için **Settings → Pages → Deploy from a branch → main → /(root)** yolunu seçin (birleştirmeden sonra). Özel derleme gerekmez.
- Matematik testleri: **npm test** veya **node --test tests/geometry.test.mjs**.

## Teknik yapı

- *index.html*: erişilebilir ders içeriği ve kontroller
- *style.css*: açık temalı, mobil uyumlu arayüz
- *app.mjs*: saf geometri hesapları, SVG 2B çizim, temsili 3B izdüşüm ve animasyon
- *tests/geometry.test.mjs*: ölçü ve matematik bağıntısı testleri

Arayüz Türkçedir; çizimler kullanıcı verisini sunucuya göndermez. Sonraki başlıklar (**Dönüşümler**, **3B Cisimler**) menüde gelecek bölümler olarak işaretlidir.
