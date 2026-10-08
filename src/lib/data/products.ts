import type { Product, TechnicalSpecifications } from "../types";

/**
 * Seed catalogue.
 *
 * Names, codes and photos follow nukleonlab.com.tr. Technical values and prices
 * are placeholders (`specsDraft: true`) until the factory's data sheets are
 * entered through the admin panel.
 */

const P = "/img/products/";
const R = "/img/renders/";
const GENERAL_CATALOG = { title: "Nükleon Genel Ürün Kataloğu", url: "http://katalog.nukleonlab.com.tr", kind: "katalog" as const };

interface Family {
  description: string;
  highlights: string[];
  faq: { q: string; a: string }[];
}

const FAMILIES: Record<string, Family> = {
  incubator: {
    description:
      "Mikrobiyoloji, hücre kültürü hazırlığı ve kalite kontrol laboratuvarlarının günlük işi sıcaklığı sabit tutmaktır. Bu inkübatör, mikroişlemcili PID kontrolü ve zorlanmış hava sirkülasyonuyla çalışma haznesinin her rafında aynı sıcaklığı hedefler. İç hazne paslanmaz çeliktir, kolay silinir; çift cidarlı kapı ve gözlem camı, kapıyı açmadan numuneyi kontrol etmenize izin verir.",
    highlights: ["Mikroişlemcili PID sıcaklık kontrolü", "Paslanmaz çelik iç hazne ve ayarlanabilir raflar", "Bağımsız aşırı sıcaklık koruması", "Ankara'da üretim, yerinde servis"],
    faq: [
      { q: "Cihaz kaç raf ile gelir?", a: "Standart olarak iki paslanmaz çelik raf ile gelir. İlave raflar ayrıca sipariş edilebilir." },
      { q: "Kalibrasyon sertifikası verilir mi?", a: "Kurulum sırasında sıcaklık doğrulaması yapılır. Akredite kalibrasyon talebinizi teklif aşamasında iletmeniz yeterlidir." },
      { q: "Montaj ve eğitim dahil mi?", a: "Ankara içi siparişlerde yerinde kurulum ve kullanım eğitimi fiyata dahildir; diğer şehirler için teklif formunda belirtilir." },
    ],
  },
  oven: {
    description:
      "Kurutma, sterilizasyon ve ısıl işlem için geliştirilen etüv, zorlanmış hava dolaşımıyla hazne içinde homojen sıcaklık dağılımı sağlar. Dijital kontrol paneli, zamanlayıcı ve bağımsız aşırı sıcaklık emniyeti standarttır. Boyalı çelik gövde ve paslanmaz çelik iç hazne, yoğun laboratuvar kullanımına göre tasarlanmıştır.",
    highlights: ["Zorlanmış hava sirkülasyonu", "Dijital sıcaklık ve zaman kontrolü", "Aşırı sıcaklık emniyet termostatı", "Paslanmaz çelik iç hazne"],
    faq: [
      { q: "Maksimum çalışma sıcaklığı nedir?", a: "Teknik özellikler sekmesinde modele ait aralık yer alır. Farklı bir aralık gerekiyorsa teklif formunda belirtin." },
      { q: "Rafların yük kapasitesi nedir?", a: "Her raf eşit dağılımlı yükte yaklaşık 20 kg taşımak üzere tasarlanmıştır." },
      { q: "Cihaz gece boyunca çalıştırılabilir mi?", a: "Evet. Sürekli çalışmaya uygundur; ancak uzun süreli çalışmada hazne içine yanıcı madde konulmamalıdır." },
    ],
  },
  furnace: {
    description:
      "Kül tayini, yakma ve yüksek sıcaklık uygulamaları için tasarlanan kül fırını, seramik elyaf yalıtımlı haznesi ve programlanabilir kontrolcüsüyle çok adımlı ısıtma programlarını çalıştırır. Düşük dış yüzey sıcaklığı ve duman çıkış bacası standarttır.",
    highlights: ["Çok adımlı programlanabilir kontrolcü", "Seramik elyaf yalıtım", "Duman çıkış bacası", "Kapı açılınca otomatik enerji kesme"],
    faq: [
      { q: "Kroze ile birlikte gelir mi?", a: "Hayır, krozeler ayrıca temin edilir. Porselen kategorimizden seçebilirsiniz." },
      { q: "Havalandırma gerekir mi?", a: "Evet. Yanma gazlarının tahliyesi için çeker ocak altına veya havalandırmalı bir alana yerleştirilmesi önerilir." },
    ],
  },
  hood: {
    description:
      "Çeker ocak, zararlı buhar, gaz ve toz ile çalışırken operatörü korur. Kimyasal dayanımlı iç yüzeyler, ayarlanabilir ön cam (sash), entegre aydınlatma ve düşük gürültülü egzoz fanı ile birlikte gelir. Kurulum, kanal bağlantısı ve hava debisi ölçümü Nükleon mühendislerince yapılır.",
    highlights: ["Kimyasala dayanıklı iç yüzey ve çalışma tezgahı", "Ayarlanabilir güvenlik camı", "Entegre LED aydınlatma ve egzoz fanı", "Kurulum ve debi ölçümü dahil"],
    faq: [
      { q: "Egzoz kanalı fiyata dahil mi?", a: "Cihaz fiyatına dahil değildir. Kanal projesi ve montajı keşif sonrası ayrıca teklif edilir." },
      { q: "Su ve gaz bağlantıları var mı?", a: "Standart modelde lavabo ve musluk bulunur. Gaz musluğu seçeneği teklif sırasında eklenir." },
      { q: "Özel ölçü üretilir mi?", a: "Evet. Laboratuvar planınıza göre özel ölçülü üretim yapılabilir." },
    ],
  },
  cabinet: {
    description:
      "Numune ve çalışanı koruyan, filtre sistemiyle çalışma alanına temiz hava sağlayan kabin. HEPA filtre, kapalı çevrim hava akışı ve UV lambası ile steril çalışma ortamı oluşturur. Dijital panel filtre ömrünü ve hava hızını gösterir.",
    highlights: ["HEPA filtreli hava akışı", "UV lambası ve entegre aydınlatma", "Paslanmaz çelik çalışma yüzeyi", "Filtre ömrü göstergesi"],
    faq: [
      { q: "HEPA filtre ne sıklıkla değişir?", a: "Kullanım yoğunluğuna bağlı olarak 2-3 yılda bir. Panel, filtre ömrünü uyarı olarak gösterir." },
      { q: "Sertifikasyon testi yapılıyor mu?", a: "Kurulumda hava hızı ve filtre sızdırmazlık testleri yapılır; yıllık periyodik test hizmeti sunulur." },
    ],
  },
  storage: {
    description:
      "Asit, baz ve çözücülerin güvenli saklanması için üretilen dolap; havalandırma çıkışı, sızdırmaz raflar ve kilitli kapılarla çalışanlarınızı ve kimyasallarınızı korur.",
    highlights: ["Sızıntı tutucu raflar", "Havalandırma bağlantı çıkışı", "Kilitli çift kapı", "Kimyasal dayanımlı boya"],
    faq: [{ q: "Yanıcı maddeler için uygun mu?", a: "Genel kimyasal saklama için tasarlanmıştır. Yanıcı madde saklama için yangına dayanıklı sınıf talebinizi belirtin." }],
  },
  bath: {
    description:
      "Numune ısıtma, çözme ve reaksiyon kontrolünde kullanılan su banyosu, paslanmaz çelik tankı ve hassas sıcaklık kontrolüyle ısıyı homojen dağıtır. Kapaklı yapı buharlaşmayı azaltır; düşük su seviyesi koruması standarttır.",
    highlights: ["Paslanmaz çelik tank", "Dijital sıcaklık kontrolü", "Düşük su seviyesi koruması", "Buharlaşmayı azaltan kapak"],
    faq: [
      { q: "Saf su kullanmak zorunlu mu?", a: "Kireçlenmeyi önlemek için saf veya deiyonize su tavsiye edilir." },
      { q: "Raf veya sehpa ile gelir mi?", a: "Standart olarak delikli bir tüp rafı ile gelir." },
    ],
  },
  analysis: {
    description:
      "Gıda, tarım, çevre ve kalite kontrol laboratuvarlarında rutin analizleri standartlara uygun, tekrarlanabilir şekilde yürütmek için tasarlanmış analiz cihazı. Kullanım kılavuzu ve metot önerileriyle birlikte teslim edilir, kurulumda kullanıcı eğitimi verilir.",
    highlights: ["Standart analiz yöntemlerine uygun", "Kolay temizlenir yapı", "Kullanıcı eğitimi", "Yedek parça ve servis desteği"],
    faq: [
      { q: "Hangi standartlara uygun?", a: "Uygulama standardı ürüne göre değişir. Kullanacağınız metodu bildirirseniz uygunluğu teyit ederiz." },
      { q: "Sarf malzemeleri de sağlanıyor mu?", a: "Evet, cihazla birlikte kullanılan sarf malzemelerini de temin ediyoruz." },
    ],
  },
  auxiliary: {
    description:
      "Günlük laboratuvar işlerini kolaylaştıran, sağlam ve bakımı kolay yardımcı ekipman. Stoktan hızlı sevk edilir; Türkiye geneline kargolanır.",
    highlights: ["Stoktan hızlı sevkiyat", "Sağlam ve bakımı kolay yapı", "Garanti ve servis desteği"],
    faq: [{ q: "Kargo ücreti nedir?", a: "Sepet tutarı 25.000 ₺ ve üzerindeki siparişlerde kargo ücretsizdir." }],
  },
  setup: {
    description:
      "Laboratuvarınızın planlamasından montajına kadar anahtar teslim hizmet. Tezgah sistemleri, çeker ocak yerleşimi, havalandırma ve tesisat birlikte projelendirilir.",
    highlights: ["Keşif, proje ve uygulama tek elden", "Kimyasal dayanımlı tezgah yüzeyleri", "Yerinde montaj ve devreye alma"],
    faq: [{ q: "Keşif ücretli mi?", a: "Ankara ve çevresinde ilk keşif ücretsizdir." }],
  },
};

type Spec = Partial<TechnicalSpecifications>;

interface Seed {
  slug: string;
  sku: string;
  name: string;
  category: string;
  brand?: string;
  type?: Product["type"];
  family: keyof typeof FAMILIES;
  tagline: string;
  short: string;
  photos: string[];
  model3d?: boolean;
  price?: number | null;
  stock?: number;
  lead?: number;
  featured?: boolean;
  isNew?: boolean;
  spec: Spec;
  created: string;
  highlights?: string[];
}

const mk = (s: Seed): Product => {
  const fam = FAMILIES[s.family];
  return {
    id: `p-${s.slug}`,
    name: s.name,
    slug: s.slug,
    sku: s.sku,
    category: s.category,
    brand: s.brand ?? "nukleon",
    type: s.type ?? "Cihaz",
    tagline: s.tagline,
    shortDescription: s.short,
    description: fam.description,
    highlights: s.highlights ?? fam.highlights,
    price: s.price ?? null,
    stock: s.stock ?? 0,
    leadTimeDays: s.lead ?? 21,
    images: s.photos,
    model3d: s.model3d === false ? null : `/models/${s.slug}.glb`,
    technicalSpecifications: { voltage: "230 V / 50 Hz", warrantyMonths: 24, ...s.spec },
    documents: [GENERAL_CATALOG],
    certificates: [],
    videos: [],
    faq: fam.faq,
    featured: s.featured ?? false,
    isNew: s.isNew ?? false,
    specsDraft: true,
    createdAt: s.created,
  };
};

const SEEDS: Seed[] = [
  // ---------------------------------------------------------- inkübatörler
  {
    slug: "nin-110", sku: "NIN-110", name: "İnkübatör NIN-110", category: "inkubatorler", family: "incubator",
    tagline: "Laboratuvar Tipi İnkübatör", short: "110 L, 25–80 °C, PID kontrol, paslanmaz çelik hazne.",
    photos: [P + "Inkubator--NIN--resim-230.jpg"], model3d: true, featured: true, isNew: true, stock: 6, lead: 10, created: "2026-09-18",
    spec: { volumeL: 110, tempMinC: 25, tempMaxC: 80, powerW: 800, control: "Mikroişlemcili PID, LED ekran", innerMm: [480, 560, 410], outerMm: [560, 780, 520], weightKg: 48, extra: [{ label: "Sıcaklık çözünürlüğü", value: "0,1 °C" }, { label: "Raf sayısı", value: "2 (ayarlanabilir)" }] },
  },
  {
    slug: "nsi-250", sku: "NSI-250", name: "Soğutmalı İnkübatör NSI-250", category: "inkubatorler", family: "incubator",
    tagline: "Soğutmalı Laboratuvar İnkübatörü", short: "250 L, 0–60 °C, kompresörlü soğutma, BOD uygulamalarına uygun.",
    photos: [P + "Sogutmali-Inkubator--resim-584.png"], model3d: true, featured: true, stock: 2, lead: 21, created: "2026-08-02",
    spec: { volumeL: 250, tempMinC: 0, tempMaxC: 60, powerW: 1200, control: "Mikroişlemcili PID, çift ekran", innerMm: [560, 900, 500], outerMm: [640, 1100, 620], weightKg: 95, extra: [{ label: "Soğutma", value: "Kompresörlü, CFC'siz gaz" }] },
  },
  {
    slug: "nci-100", sku: "NCI-100", name: "Çalkamalı İnkübatör NCI-100", category: "inkubatorler", family: "incubator",
    tagline: "Çalkalama Platformlu İnkübatör", short: "100 L, 5–60 °C, 20–300 rpm çalkalama platformu.",
    photos: [P + "Calkamali-Inkubator-resim-1307.png"], model3d: true, stock: 0, lead: 28, created: "2026-07-14",
    spec: { volumeL: 100, tempMinC: 5, tempMaxC: 60, powerW: 900, control: "Mikroişlemcili PID, rpm ayarı", innerMm: [480, 520, 400], outerMm: [620, 820, 600], weightKg: 70, extra: [{ label: "Çalkalama hızı", value: "20–300 rpm" }, { label: "Çalkalama genliği", value: "25 mm" }] },
  },
  {
    slug: "nit-250", sku: "NIT-250", name: "İklimlendirme Test Kabini NIT-250", category: "inkubatorler", family: "incubator",
    tagline: "Sıcaklık ve Nem Kontrollü Test Kabini", short: "250 L, -10…+60 °C, %20–95 bağıl nem programlanabilir.",
    photos: [P + "Iklimlendirme-Test-Kabini--NIT--resim-1294.jpg"], model3d: true, featured: true, stock: 0, lead: 35, created: "2026-06-21",
    spec: { volumeL: 250, tempMinC: -10, tempMaxC: 60, powerW: 2200, control: "Dokunmatik programlanabilir kontrolcü", innerMm: [600, 1100, 450], outerMm: [720, 1700, 760], weightKg: 160, extra: [{ label: "Nem aralığı", value: "%20–95 bağıl nem" }, { label: "Program belleği", value: "99 adım" }] },
  },
  {
    slug: "nbk-300", sku: "NBK-300", name: "Bitki Büyütme Kabini NBK-300", category: "inkubatorler", family: "incubator",
    tagline: "LED Aydınlatmalı Bitki Büyütme Kabini", short: "300 L, 10–45 °C, ayarlanabilir LED aydınlatma ve foto-periyot.",
    photos: [P + "Bitki-Buyutme-Kabini-resim-312.png"], model3d: true, stock: 1, lead: 30, created: "2026-05-30",
    spec: { volumeL: 300, tempMinC: 10, tempMaxC: 45, powerW: 1500, control: "Mikroişlemcili PID, foto-periyot zamanlayıcı", innerMm: [580, 1200, 480], outerMm: [700, 1750, 720], weightKg: 140, extra: [{ label: "Aydınlatma", value: "Ayarlanabilir LED, 0–30.000 lux" }] },
  },
  {
    slug: "jsr-iklimlendirme", sku: "JSR-IK", name: "İklimlendirme Kabini Serisi", category: "inkubatorler", family: "incubator", brand: "nukleon",
    tagline: "Yürüyebilir ve Çoklu Hazneli Seri", short: "Büyük ölçekli ürün testleri için çoklu hazneli iklimlendirme odaları.",
    photos: [P + "jsr-iklimlendirme-kabini-556.jpg"], stock: 0, lead: 60, created: "2026-03-12",
    spec: { tempMinC: -40, tempMaxC: 150, control: "Programlanabilir dokunmatik kontrolcü", extra: [{ label: "Hacim", value: "Projeye özel" }] },
  },

  // ---------------------------------------------------------------- etüvler
  {
    slug: "nst-120", sku: "NST-120", name: "Etüv NST-120", category: "etuvler", family: "oven",
    tagline: "Zorlanmış Havalı Laboratuvar Etüvü", short: "120 L, 30–250 °C, zorlanmış hava, dijital kontrol.",
    photos: [P + "Etuv--NST--resim-1364.jpg"], model3d: true, featured: true, stock: 8, lead: 10, created: "2026-09-02",
    spec: { volumeL: 120, tempMinC: 30, tempMaxC: 250, powerW: 1500, control: "Dijital PID, zamanlayıcı", innerMm: [520, 480, 480], outerMm: [660, 720, 620], weightKg: 52, extra: [{ label: "Raf sayısı", value: "2" }] },
  },
  {
    slug: "nst-400", sku: "NST-400", name: "Büyük Hacimli Etüv NST-400", category: "etuvler", family: "oven",
    tagline: "Büyük Hacimli Etüv", short: "400 L, 30–250 °C, ağır yük için güçlendirilmiş raflar.",
    photos: [P + "Buyuk-Hacimli-Etuv-resim-508.png"], model3d: true, stock: 1, lead: 24, created: "2026-04-05",
    spec: { volumeL: 400, tempMinC: 30, tempMaxC: 250, powerW: 3000, control: "Dijital PID, zamanlayıcı", innerMm: [700, 1100, 520], outerMm: [900, 1550, 780], weightKg: 130, extra: [{ label: "Raf sayısı", value: "4" }] },
  },
  {
    slug: "nve-50", sku: "NVE-50", name: "Vakum Etüv NVE-50", category: "etuvler", family: "oven",
    tagline: "Vakumlu Kurutma Etüvü", short: "50 L, 30–200 °C, vakum göstergeli, düşük sıcaklıkta kurutma.",
    photos: [P + "Vakum-Etuv-resim-1305.png"], model3d: true, stock: 3, lead: 21, created: "2026-02-20",
    spec: { volumeL: 50, tempMinC: 30, tempMaxC: 200, powerW: 1600, control: "Dijital PID, vakum göstergesi", innerMm: [415, 345, 345], outerMm: [540, 600, 560], weightKg: 62, extra: [{ label: "Vakum seviyesi", value: "≤ 10 mbar (pompa ile)" }] },
  },

  // ----------------------------------------------------------------- fırınlar
  {
    slug: "nkf-12", sku: "NKF-12", name: "Kül Fırını NKF-12", category: "firinlar", family: "furnace",
    tagline: "Programlanabilir Kül Fırını", short: "12 L, 100–1100 °C, çok adımlı program, duman bacası.",
    photos: [P + "Kul-Firini--NKF--resim-228.jpg"], model3d: true, featured: true, stock: 4, lead: 14, created: "2026-08-19",
    spec: { volumeL: 12, tempMinC: 100, tempMaxC: 1100, powerW: 3000, control: "Programlanabilir PID, 8 adım", innerMm: [230, 200, 270], outerMm: [420, 460, 500], weightKg: 38, extra: [{ label: "Isıtma hızı", value: "10 °C/dk (maks.)" }] },
  },

  // ----------------------------------------------------------- çeker ocaklar
  {
    slug: "nco-t", sku: "NCO-T", name: "Çeker Ocak Masaüstü NCO-T", category: "ceker-ocaklar", family: "hood",
    tagline: "Masaüstü Çeker Ocak", short: "90 cm, tezgah üstü kurulum, entegre fan ve LED aydınlatma.",
    photos: [P + "guvenlik-serisi-cekerocak-430.jpg"], model3d: true, featured: true, isNew: true, stock: 3, lead: 21, created: "2026-09-25",
    spec: { powerW: 350, control: "Elektronik fan hız ayarı", innerMm: [800, 650, 520], outerMm: [900, 900, 620], weightKg: 85, extra: [{ label: "Yüz hızı", value: "0,4–0,6 m/s" }, { label: "Egzoz bağlantısı", value: "Ø 200 mm" }] },
  },
  {
    slug: "nco-s", sku: "NCO-S", name: "Çekerocak NCO-S", category: "ceker-ocaklar", family: "hood",
    tagline: "Standart Çeker Ocak", short: "120 cm, alt dolaplı, lavabolu, epoksi tezgah.",
    photos: [P + "Cekerocak-resim-227.png"], model3d: true, featured: true, stock: 0, lead: 28, created: "2026-07-01",
    spec: { powerW: 450, control: "Fan hız ayarı, aydınlatma anahtarı", innerMm: [1000, 1000, 700], outerMm: [1200, 2200, 800], weightKg: 210, extra: [{ label: "Tezgah", value: "Epoksi reçine" }, { label: "Yüz hızı", value: "0,4–0,6 m/s" }] },
  },
  {
    slug: "nco-p", sku: "NCO-P", name: "Profesyonel Çeker Ocak NCO-P", category: "ceker-ocaklar", family: "hood",
    tagline: "Profesyonel Çeker Ocak", short: "150 cm, çift cam, gaz ve su bağlantılı, kontrol paneli.",
    photos: [P + "Profesyonel-Cekerocak-resim-1297.png"], model3d: true, stock: 0, lead: 35, created: "2026-06-10",
    spec: { powerW: 600, control: "Dijital hava hızı göstergesi", innerMm: [1300, 1000, 700], outerMm: [1500, 2250, 800], weightKg: 260, extra: [{ label: "Bağlantılar", value: "Su, gaz, elektrik" }, { label: "Yüz hızı", value: "0,4–0,6 m/s" }] },
  },

  // ------------------------------------------------------ güvenlik kabinleri
  {
    slug: "ngk-120", sku: "NGK-120", name: "Biyolojik Güvenlik Kabini NGK-120", category: "guvenlik-kabinleri", family: "cabinet",
    tagline: "Sınıf II Biyolojik Güvenlik Kabini", short: "120 cm, HEPA filtre, UV lamba, dijital hava hızı göstergesi.",
    photos: [P + "Biyolojik-Guvenlik-Kabini-resim-633.jpg"], model3d: true, featured: true, stock: 2, lead: 28, created: "2026-08-28",
    spec: { powerW: 550, control: "Mikroişlemcili, filtre ömrü göstergesi", innerMm: [1100, 600, 650], outerMm: [1200, 1720, 750], weightKg: 190, extra: [{ label: "Filtre", value: "HEPA H14" }, { label: "Sınıf", value: "Sınıf II" }] },
  },
  {
    slug: "nlf-90", sku: "NLF-90", name: "Laminar Flow Kabini NLF-90", category: "guvenlik-kabinleri", family: "cabinet",
    tagline: "Dikey Laminar Akışlı Kabin", short: "90 cm, steril çalışma alanı, HEPA filtreli dikey akış.",
    photos: [P + "Laminar-Hava-Kabini-resim-232.png"], model3d: true, stock: 5, lead: 14, created: "2026-05-18",
    spec: { powerW: 420, control: "Fan hız ayarı, UV zamanlayıcı", innerMm: [800, 600, 600], outerMm: [900, 1720, 750], weightKg: 150, extra: [{ label: "Filtre", value: "HEPA H14" }] },
  },
  {
    slug: "nlh-120", sku: "NLH-120", name: "Laminar Hava Kabini NLH-120", category: "guvenlik-kabinleri", family: "cabinet",
    tagline: "Tezgâh Tipi Laminar Hava Kabini", short: "120 cm, tekerlekli taşıyıcılı, steril ortam.",
    photos: [P + "JSCB-1200SL-634.jpg"], stock: 2, lead: 21, created: "2026-04-22",
    spec: { powerW: 500, control: "Fan hız ayarı", innerMm: [1100, 600, 600], outerMm: [1200, 1700, 760], weightKg: 170, extra: [{ label: "Filtre", value: "HEPA H14" }] },
  },
  {
    slug: "nks-2", sku: "NKS-2", name: "Kimyasal Saklama Dolabı NKS-2", category: "guvenlik-kabinleri", family: "storage",
    tagline: "Kimyasal Saklama Dolabı", short: "Çift kapılı, havalandırmalı, sızıntı tutucu raflı dolap.",
    photos: [P + "Kimyasal-Saklama-Dolabi-resim-619.png"], model3d: true, price: 38500, stock: 7, lead: 7, created: "2026-03-30",
    spec: { powerW: 0, control: "Mekanik kilit", outerMm: [900, 1800, 450], weightKg: 78, extra: [{ label: "Raf", value: "4, ayarlanabilir" }, { label: "Havalandırma", value: "Ø 100 mm çıkış" }] },
  },

  // ------------------------------------------------------------ su banyoları
  {
    slug: "nsb-12", sku: "NSB-12", name: "Su Banyosu NSB-12", category: "su-banyolari", family: "bath",
    tagline: "Standart Su Banyosu", short: "12 L, ortam +5…100 °C, paslanmaz çelik tank.",
    photos: [P + "Su-Banyosu-Standart--resim-1025.png"], model3d: true, price: 21900, stock: 9, lead: 7, featured: true, created: "2026-09-08",
    spec: { volumeL: 12, tempMinC: 25, tempMaxC: 100, powerW: 1000, control: "Dijital PID", innerMm: [300, 150, 250], outerMm: [500, 200, 340], weightKg: 9, extra: [{ label: "Hassasiyet", value: "±0,5 °C" }] },
  },
  {
    slug: "nss-20", sku: "NSS-20", name: "Sirkülasyonlu Su Banyosu NSS-20", category: "su-banyolari", family: "bath",
    tagline: "Sirkülasyonlu Su Banyosu", short: "20 L, pompa ile sirkülasyon, ±0,1 °C stabilite.",
    photos: [P + "Sirkulasyonlu-Su-Banyosu-resim-1026.png"], model3d: true, stock: 3, lead: 14, created: "2026-07-24",
    spec: { volumeL: 20, tempMinC: 25, tempMaxC: 100, powerW: 1500, control: "Dijital PID, zamanlayıcı", innerMm: [500, 150, 300], outerMm: [620, 240, 400], weightKg: 14, extra: [{ label: "Stabilite", value: "±0,1 °C" }] },
  },
  {
    slug: "nbs-20", sku: "NBS-20", name: "Soğutmalı Su Banyosu NBS-20", category: "su-banyolari", family: "bath",
    tagline: "Soğutmalı Sirkülasyon Banyosu", short: "20 L, -20…100 °C, kompresörlü soğutma.",
    photos: [P + "Sogutmali-Su-Banyosu--NBS--resim-1027.jpg"], model3d: true, stock: 0, lead: 21, created: "2026-06-03",
    spec: { volumeL: 20, tempMinC: -20, tempMaxC: 100, powerW: 1800, control: "Dijital PID, sirkülasyon pompası", innerMm: [300, 300, 220], outerMm: [580, 680, 420], weightKg: 38, extra: [{ label: "Soğutma", value: "Kompresörlü" }] },
  },
  {
    slug: "nub-6", sku: "NUB-6", name: "Ultrasonik Su Banyosu NUB-6", category: "su-banyolari", family: "bath",
    tagline: "Ultrasonik Temizleme Banyosu", short: "6 L, 40 kHz, ısıtmalı, zamanlayıcılı.",
    photos: [P + "ultrasonic-su-banyosu-laboratuvar-firmalari-1028.jpg"], price: 12900, stock: 12, lead: 5, created: "2026-02-11",
    spec: { volumeL: 6, tempMinC: 25, tempMaxC: 80, powerW: 300, control: "Analog / zamanlayıcı", innerMm: [300, 150, 150], outerMm: [330, 270, 175], weightKg: 5, extra: [{ label: "Frekans", value: "40 kHz" }] },
  },

  // ------------------------------------------------------------- santrifüjler
  {
    slug: "nsf-60", sku: "NSF-60", name: "Masaüstü Santrifüj NSF-60", category: "santrifujler", family: "analysis",
    tagline: "Masaüstü Laboratuvar Santrifüjü", short: "6.000 rpm, 6 × 50 ml rotor, dijital hız ve zaman.",
    photos: [R + "nsf-60.png"], model3d: true, isNew: true, stock: 0, lead: 21, created: "2026-10-01",
    spec: { powerW: 300, control: "Dijital hız / zaman / RCF", outerMm: [560, 360, 620], weightKg: 28, extra: [{ label: "Maks. hız", value: "6.000 rpm" }, { label: "Rotor", value: "6 × 50 ml (sallanır başlıklı)" }] },
  },

  // -------------------------------------------------------- sterilizasyon
  {
    slug: "nuv-c", sku: "NUV-C", name: "UV-C Hava Sterilizasyon Cihazı", category: "sterilizasyon-cihazlari", family: "analysis",
    tagline: "Mikrop Kırıcı UV-C Hava Sterilizasyonu", short: "Ortam havasındaki mikroorganizmaları UV-C ile etkisiz hale getirir.",
    photos: [P + "UV-C-HAVA-STERILIZASYON-CIHAZI--MIKROP-KIRICI--resim-1354.jpg"], stock: 5, lead: 7, created: "2026-01-15",
    spec: { powerW: 120, control: "Zamanlayıcı", extra: [{ label: "Dalga boyu", value: "254 nm (UV-C)" }] },
  },
  {
    slug: "nuv-h", sku: "NUV-H", name: "Ultraviyole El Dezenfektanı", category: "sterilizasyon-cihazlari", family: "auxiliary", type: "Yardımcı Ekipman",
    tagline: "Temassız El Dezenfeksiyon Ünitesi", short: "Sensörlü, temassız el dezenfeksiyon istasyonu.",
    photos: [P + "Ultraviyole-El-Dezenfektani-resim-1355.jpeg"], price: 18900, stock: 6, lead: 7, created: "2026-01-12",
    spec: { powerW: 60, control: "Sensörlü", outerMm: [380, 1500, 320], weightKg: 15 },
  },

  // ----------------------------------------------------------------- ölçüm
  {
    slug: "ntb-1", sku: "NTB-1", name: "Türbidimetre (Bulanıklık Ölçer)", category: "olcum-cihazlari", family: "auxiliary", type: "Ölçüm Aleti",
    tagline: "Taşınabilir Bulanıklık Ölçer", short: "0–1000 NTU, taşınabilir, 3 noktalı kalibrasyon.",
    photos: [P + "Turbidimetre--Bulaniklik-Olcer--1082.jpg"], price: 14900, stock: 10, lead: 5, created: "2026-03-03",
    spec: { control: "LCD ekran, pil", weightKg: 0.5, extra: [{ label: "Ölçüm aralığı", value: "0–1000 NTU" }, { label: "Kalibrasyon", value: "3 noktalı" }] },
  },
  {
    slug: "ndb-1", sku: "NDB-1", name: "Dijital Büret", category: "olcum-cihazlari", family: "auxiliary", type: "Ölçüm Aleti",
    tagline: "Şişe Üstü Dijital Büret", short: "50 ml, 0,01 ml çözünürlük, titrasyon için.",
    photos: [P + "Buret--Dijital-buret--345.jpg"], price: 26500, stock: 4, lead: 7, created: "2026-02-27",
    spec: { control: "Dijital, tekerlek", weightKg: 0.7, extra: [{ label: "Hacim", value: "50 ml" }, { label: "Çözünürlük", value: "0,01 ml" }] },
  },

  // ----------------------------------------------------------------- analiz
  {
    slug: "nap-6", sku: "NAP-6", name: "Azot Protein Tayin Cihazı NAP", category: "analiz-cihazlari", family: "analysis",
    tagline: "Kjeldahl Azot Protein Tayin Sistemi", short: "Kjeldahl yöntemiyle azot ve protein tayini, gıda ve yem analizi.",
    photos: [P + "azot-protein-cihazi-231.jpg"], stock: 0, lead: 35, featured: true, created: "2026-04-14",
    spec: { powerW: 2800, control: "Programlanabilir", extra: [{ label: "Yöntem", value: "Kjeldahl" }, { label: "Numune kapasitesi", value: "6 tüp" }] },
  },
  {
    slug: "nyc-100", sku: "NYC-100", name: "Yağ Tayin Cihazı NYC-100 (Soxhlet)", category: "analiz-cihazlari", family: "analysis",
    tagline: "Soxhlet Yağ Ekstraksiyon Sistemi", short: "4'lü Soxhlet ekstraksiyon, çözücü geri kazanımlı.",
    photos: [P + "yag-tayin-capraz-1133.jpg"], stock: 2, lead: 21, created: "2026-03-22",
    spec: { powerW: 1200, control: "Dijital sıcaklık", extra: [{ label: "Numune", value: "4 adet" }, { label: "Yöntem", value: "Soxhlet" }] },
  },
  {
    slug: "ngy-10", sku: "NGY-10", name: "Gluten Yıkama Cihazı NGY-10", category: "analiz-cihazlari", family: "analysis",
    tagline: "Otomatik Gluten Yıkama", short: "Un ve buğday analizi için çift hazneli otomatik yıkama.",
    photos: [P + "DSC-3895-1302.jpg"], stock: 1, lead: 21, created: "2026-02-05",
    spec: { powerW: 150, control: "Zamanlı program", extra: [{ label: "Hazne", value: "2" }] },
  },
  {
    slug: "ntc-01", sku: "NTC-01", name: "Termoreaktör NTC-01", category: "analiz-cihazlari", family: "analysis",
    tagline: "COD Termoreaktör", short: "COD ve toplam fosfor için 25 pozisyonlu termoreaktör.",
    photos: [P + "TERMOREAKTOR--NTC-01--resim-1304.png"], stock: 3, lead: 14, created: "2026-01-30",
    spec: { tempMinC: 30, tempMaxC: 150, powerW: 600, control: "Dijital zaman/sıcaklık", extra: [{ label: "Pozisyon", value: "25" }] },
  },
  {
    slug: "nsd-4", sku: "NSD-4", name: "Sedimantasyon Test Cihazı", category: "analiz-cihazlari", family: "analysis",
    tagline: "Sedimantasyon Test Düzeneği", short: "Çökelme hızı testleri için çift stasyonlu düzenek.",
    photos: [P + "Sedimantasyon-Test-Cihazi-resim-1303.png"], stock: 1, lead: 21, created: "2025-12-18",
    spec: { powerW: 100, control: "Zamanlayıcı" },
  },
  {
    slug: "rayto-rt-9200", sku: "RT-9200", name: "Spektrofotometre Rayto RT-9200", category: "analiz-cihazlari", brand: "rayto", family: "analysis",
    tagline: "Yarı Otomatik Biyokimya Analizörü", short: "Klinik ve araştırma uygulamaları için fotometre.",
    photos: [P + "Spektrofotometre-Rayto-RT-9200-1000.jpg"], stock: 2, lead: 14, created: "2025-11-26",
    spec: { powerW: 100, control: "Dokunmatik tuş takımı, yazıcı", extra: [{ label: "Dalga boyu", value: "340–700 nm" }] },
  },
  {
    slug: "uv-vis-u5100", sku: "U-5100", name: "Spektrofotometre UV-VIS U-5100", category: "analiz-cihazlari", family: "analysis", brand: "nukleon",
    tagline: "Çift Işık Yollu UV-VIS Spektrofotometre", short: "190–1100 nm, bilgisayar bağlantılı UV-VIS spektrofotometre.",
    photos: [P + "Spektrofotometre-UV-VIS-U-5100-1004.jpg"], featured: true, stock: 1, lead: 21, created: "2026-05-05",
    spec: { powerW: 150, control: "Yazılımlı PC kontrol", extra: [{ label: "Dalga boyu", value: "190–1100 nm" }, { label: "Bant genişliği", value: "1 nm" }] },
  },
  {
    slug: "nbo-1", sku: "NBO-1", name: "Bitki Öğütme Değirmeni NBO", category: "analiz-cihazlari", family: "analysis",
    tagline: "Bitki ve Tahıl Öğütme Değirmeni", short: "Numune hazırlamada tahıl ve bitki öğütme, ayarlanabilir elek.",
    photos: [P + "degirmen-1300.jpg"], stock: 2, lead: 14, created: "2025-12-02",
    spec: { powerW: 750, control: "Hız ayarı", weightKg: 32 },
  },
  {
    slug: "nsu-1", sku: "NSU-1", name: "Ultra Saf Su Cihazı", category: "analiz-cihazlari", family: "analysis",
    tagline: "Tip 1 Ultra Saf Su Sistemi", short: "18,2 MΩ·cm, ters ozmoz ve deiyonizasyon, 10 L/saat.",
    photos: [P + "Ultra-Saf-Su-Cihazi-957.jpg"], stock: 1, lead: 21, created: "2026-01-08",
    spec: { powerW: 120, control: "İletkenlik göstergesi", extra: [{ label: "Su kalitesi", value: "18,2 MΩ·cm" }, { label: "Debi", value: "10 L/saat" }] },
  },
  {
    slug: "retsch-as200", sku: "AS-200", name: "Elek Sarsma Cihazı RETSCH", category: "analiz-cihazlari", brand: "retsch", family: "analysis",
    tagline: "Titreşimli Elek Sarsma Cihazı", short: "Tane boyutu analizi için dijital ayarlı elek sarsıcı.",
    photos: [P + "Elek-Sarsma-Cihazi-RETSCH-487.jpg"], stock: 1, lead: 30, created: "2025-10-16",
    spec: { powerW: 100, control: "Dijital genlik ve zaman", extra: [{ label: "Elek çapı", value: "200 mm" }] },
  },

  // ----------------------------------------------------------- yardımcı
  {
    slug: "nhp-1", sku: "NHP-1", name: "Isıtıcı Tabla NHP", category: "yardimci-ekipmanlar", family: "auxiliary", type: "Yardımcı Ekipman",
    tagline: "Büyük Yüzeyli Isıtıcı Tabla", short: "Seramik kaplı yüzey, 350 °C'ye kadar, hassas ayar.",
    photos: [P + "Isitici-Tabla-resim-1306.png"], price: 17800, stock: 6, lead: 7, created: "2026-02-02",
    spec: { tempMinC: 25, tempMaxC: 350, powerW: 2000, control: "Analog termostat", outerMm: [300, 120, 500], weightKg: 8 },
  },
  {
    slug: "nmk-1", sku: "NMK-1", name: "Mekanik Karıştırıcı", category: "yardimci-ekipmanlar", family: "auxiliary", type: "Yardımcı Ekipman",
    tagline: "Üstten Tahrikli Karıştırıcı", short: "Statif dahil, 50–2000 rpm, viskoz çözeltiler için.",
    photos: [P + "mekanik-karistirici-1296.jpg"], price: 16400, stock: 5, lead: 7, created: "2026-02-04",
    spec: { powerW: 100, control: "Devir ayarı", weightKg: 4, extra: [{ label: "Devir", value: "50–2000 rpm" }] },
  },
  {
    slug: "nbi-1", sku: "NBI-1", name: "Balon Isıtıcı (Isotek)", category: "yardimci-ekipmanlar", brand: "isotek", family: "auxiliary", type: "Yardımcı Ekipman",
    tagline: "Balon Isıtıcı Manto", short: "1000 ml balon için ısıtıcı manto, regülatörlü.",
    photos: [P + "balon-isitici-isotek-277.jpg"], price: 7950, stock: 14, lead: 5, created: "2026-01-05",
    spec: { tempMaxC: 450, powerW: 250, control: "Enerji regülatörü" },
  },
  {
    slug: "npp-1", sku: "NPP-1", name: "Peristaltik Pompa", category: "yardimci-ekipmanlar", family: "auxiliary", type: "Yardımcı Ekipman",
    tagline: "Dijital Peristaltik Pompa", short: "Hassas dozaj ve sirkülasyon, değiştirilebilir hortum başlığı.",
    photos: [P + "peristaltik-pompa-1299.jpg"], price: 48900, stock: 3, lead: 10, created: "2026-03-01",
    spec: { powerW: 60, control: "Dijital kontrol, ekran", extra: [{ label: "Debi", value: "0,1–380 ml/dk" }] },
  },
  {
    slug: "as-30", sku: "AS-30", name: "Vakum Pompası AS 30", category: "yardimci-ekipmanlar", family: "auxiliary", type: "Yardımcı Ekipman",
    tagline: "Yağsız Laboratuvar Vakum Pompası", short: "Yağsız diyafram pompa, 30 L/dk, filtrasyon ve vakum etüv için.",
    photos: [P + "AS30BLUE-1101.jpg"], price: 9450, stock: 15, lead: 5, featured: true, created: "2026-09-12",
    spec: { powerW: 180, control: "Açma/kapama", weightKg: 7, extra: [{ label: "Debi", value: "30 L/dk" }, { label: "Son vakum", value: "−0,085 MPa" }] },
  },

  // ------------------------------------------------------------ sarf / kurulum
  {
    slug: "elek-seti", sku: "ELK-1", name: "Laboratuvar Elekleri", category: "sarf-malzemeleri", family: "auxiliary", type: "Sarf Malzeme",
    tagline: "Paslanmaz Çelik Test Elekleri", short: "Çeşitli göz açıklığında, Ø 200 mm test elekleri.",
    photos: [P + "ELEK-1270.jpg"], price: 2150, stock: 40, lead: 3, created: "2025-12-08",
    spec: { extra: [{ label: "Çap", value: "Ø 200 mm" }, { label: "Malzeme", value: "Paslanmaz çelik tel örgü" }] },
  },
  {
    slug: "tezgah-sistemleri", sku: "NTS-1", name: "Laboratuvar Tezgâh Sistemleri", category: "laboratuvar-kurulumu", family: "setup", type: "Kurulum Sistemi",
    tagline: "Modüler Tezgâh Sistemi", short: "Kimyasal dayanımlı yüzey, modüler dolap ve raf sistemi.",
    photos: [P + "Tezgah-Sistemleri-resim-1075.png"], stock: 0, lead: 45, featured: true, created: "2026-04-01",
    spec: { control: "Projeye özel", extra: [{ label: "Yüzey", value: "Epoksi reçine / seramik" }, { label: "Modül", value: "Projeye özel" }] },
  },
];

export const PRODUCTS: Product[] = SEEDS.map(mk);
