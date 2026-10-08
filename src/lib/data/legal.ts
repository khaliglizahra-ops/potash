export interface LegalDoc {
  slug: string;
  title: string;
  sections: { h: string; p: string[] }[];
}

const SELLER = "Nükleon Lab, İvedik OSB, Öz Ankara San. Sit. 1464 (675). Sokak No: 37, Yenimahalle / Ankara · info@nukleonlab.com.tr · +90 312 395 66 13";

export const LEGAL: LegalDoc[] = [
  {
    slug: "kvkk",
    title: "KVKK Aydınlatma Metni",
    sections: [
      { h: "Veri sorumlusu", p: [`6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu: ${SELLER}.`] },
      { h: "İşlenen veriler ve amaçlar", p: ["Ad soyad, firma, vergi bilgileri, telefon, e-posta ve adres bilgileriniz; sipariş ve teklif süreçlerinin yürütülmesi, faturalandırma, teslimat, teknik destek ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir."] },
      { h: "Aktarım", p: ["Verileriniz; ödeme kuruluşu (iyzico), kargo firmaları ve yasal olarak yetkili kurumlar dışında üçüncü kişilerle paylaşılmaz. Kart bilgileriniz sitemizde işlenmez ve saklanmaz."] },
      { h: "Haklarınız", p: ["KVKK madde 11 uyarınca verilerinize erişme, düzeltme, silme ve işlemeye itiraz etme haklarınızı info@nukleonlab.com.tr adresine yazarak kullanabilirsiniz."] },
    ],
  },
  {
    slug: "gizlilik",
    title: "Gizlilik ve Çerez Politikası",
    sections: [
      { h: "Toplanan bilgiler", p: ["Sipariş, teklif ve destek formlarında verdiğiniz bilgiler ile oturum için gereken teknik çerezler kullanılır."] },
      { h: "Çerezler", p: ["Sitemiz oturum ve sepet işlevi için zorunlu çerezleri ve tarayıcı depolamasını kullanır. Analiz veya reklam çerezleri onayınız olmadan yüklenmez."] },
      { h: "İletişim", p: [`Sorularınız için: ${SELLER}.`] },
    ],
  },
  {
    slug: "mesafeli-satis",
    title: "Mesafeli Satış Sözleşmesi",
    sections: [
      { h: "Taraflar", p: [`Satıcı: ${SELLER}. Alıcı: sipariş sırasında bilgilerini giren kişi veya kurum.`] },
      { h: "Konu", p: ["İşbu sözleşme, alıcının sitede sipariş ettiği ürünlerin satışı, teslimi ve tarafların hak ve yükümlülüklerini düzenler. Ürün bedelleri KDV hariç gösterilir; KDV sepette ayrıca hesaplanır."] },
      { h: "Teslimat", p: ["Stokta bulunan ürünler sipariş onayından sonra kargoya verilir. Siparişe özel üretilen cihazların tahmini üretim süresi ürün sayfasında belirtilir. Sepet tutarı 25.000 ₺ ve üzeri siparişlerde kargo ücretsizdir."] },
      { h: "Cayma hakkı", p: ["Tüketici sıfatındaki alıcılar teslimden itibaren 14 gün içinde cayma hakkını kullanabilir. Alıcının talebi veya kişisel ihtiyaçları doğrultusunda özel olarak üretilen cihazlar cayma hakkı kapsamı dışındadır. Ticari alıcılar için cayma hakkı doğmaz; iade koşulları ayrıca yazılı olarak belirlenir."] },
      { h: "Garanti ve servis", p: ["Ürünler üretim ve işçilik hatalarına karşı ürün sayfasında belirtilen süre boyunca garantilidir."] },
    ],
  },
  {
    slug: "iade-iptal",
    title: "İade ve İptal Koşulları",
    sections: [
      { h: "İptal", p: ["Üretime alınmamış siparişler ücretsiz iptal edilebilir. Üretime alınmış siparişlerde iptal koşulları satış ekibiyle yazılı olarak belirlenir."] },
      { h: "İade", p: ["Hasarlı veya hatalı ürün tesliminde, teslim anında tutanak tutturulması ve 3 gün içinde bize bildirilmesi gerekir. İade onaylanan ürünlerde bedel, ödeme yöntemiyle aynı kanaldan iade edilir."] },
    ],
  },
];

export const legalBySlug = (slug: string) => LEGAL.find((l) => l.slug === slug);
