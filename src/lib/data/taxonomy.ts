import type { Brand, Category } from "../types";

export const GROUPS: { id: Category["group"]; name: string }[] = [
  { id: "cihazlar", name: "Laboratuvar Cihazları" },
  { id: "olcum", name: "Ölçüm ve Analiz" },
  { id: "gerecler", name: "Laboratuvar Gereçleri" },
  { id: "kimyasal", name: "Kimyasal Ürünler" },
  { id: "kurulum", name: "Laboratuvar Kurulumu" },
];

const P = "/img/products/";

export const CATEGORIES: Category[] = [
  { id: "c1", slug: "inkubatorler", name: "İnkübatörler", group: "cihazlar", order: 1, image: P + "Inkubator--NIN--resim-230.jpg", description: "Mikrobiyoloji, biyoteknoloji ve kalite kontrol için hassas sıcaklık dengesi sağlayan yerli üretim inkübatörler, soğutmalı ve çalkamalı seçenekler ve iklimlendirme test kabinleri." },
  { id: "c2", slug: "etuvler", name: "Etüvler", group: "cihazlar", order: 2, image: P + "Etuv--NST--resim-1364.jpg", description: "Kurutma, sterilizasyon ve ısıl işlem uygulamaları için standart, büyük hacimli ve vakumlu etüvler." },
  { id: "c3", slug: "firinlar", name: "Fırınlar", group: "cihazlar", order: 3, image: P + "Kul-Firini--NKF--resim-228.jpg", description: "Kül tayini ve yüksek sıcaklık uygulamaları için programlanabilir kül fırınları." },
  { id: "c4", slug: "ceker-ocaklar", name: "Çeker Ocaklar", group: "cihazlar", order: 4, image: P + "Profesyonel-Cekerocak-resim-1297.png", description: "Zararlı buhar ve gazlara karşı operatör güvenliği sağlayan masaüstü, standart ve profesyonel çeker ocaklar." },
  { id: "c5", slug: "guvenlik-kabinleri", name: "Güvenlik Kabinleri", group: "cihazlar", order: 5, image: P + "Biyolojik-Guvenlik-Kabini-resim-633.jpg", description: "Biyolojik güvenlik kabinleri, laminar flow kabinleri ve kimyasal saklama dolapları." },
  { id: "c6", slug: "su-banyolari", name: "Su Banyoları", group: "cihazlar", order: 6, image: P + "Sogutmali-Su-Banyosu--NBS--resim-1027.jpg", description: "Standart, sirkülasyonlu, soğutmalı ve ultrasonik su banyoları." },
  { id: "c7", slug: "santrifujler", name: "Santrifüjler", group: "cihazlar", order: 7, image: "/img/renders/nsf-60.png", description: "Rutin laboratuvar ayırma işlemleri için masaüstü santrifüjler." },
  { id: "c8", slug: "sterilizasyon-cihazlari", name: "Sterilizasyon Cihazları", group: "cihazlar", order: 8, image: P + "UV-C-HAVA-STERILIZASYON-CIHAZI--MIKROP-KIRICI--resim-1354.jpg", description: "UV-C hava sterilizasyonu ve el dezenfeksiyon çözümleri." },

  { id: "c9", slug: "olcum-cihazlari", name: "Ölçüm Cihazları", group: "olcum", order: 9, image: P + "Turbidimetre--Bulaniklik-Olcer--1082.jpg", description: "Bulanıklık, hacim ve fiziksel büyüklük ölçümü için laboratuvar ölçüm cihazları." },
  { id: "c10", slug: "analiz-cihazlari", name: "Analiz Cihazları", group: "olcum", order: 10, image: P + "Spektrofotometre-UV-VIS-U-5100-1004.jpg", description: "Spektrofotometre, Kjeldahl, Soxhlet, gluten ve termoreaktör gibi analiz sistemleri." },
  { id: "c11", slug: "sicaklik", name: "Sıcaklık", group: "olcum", order: 11, image: null, description: "Sıcaklık ölçüm ve kayıt cihazları." },
  { id: "c12", slug: "nem", name: "Nem", group: "olcum", order: 12, image: null, description: "Nem ölçüm ve kontrol cihazları." },
  { id: "c13", slug: "ph", name: "pH", group: "olcum", order: 13, image: null, description: "pH metre ve elektrotlar." },
  { id: "c14", slug: "terazi", name: "Terazi", group: "olcum", order: 14, image: null, description: "Analitik ve hassas teraziler." },

  { id: "c15", slug: "cam-malzemeler", name: "Cam Malzemeler", group: "gerecler", order: 15, image: null, description: "Beher, balon, mezür ve laboratuvar cam malzemeleri." },
  { id: "c16", slug: "plastik-malzemeler", name: "Plastik Malzemeler", group: "gerecler", order: 16, image: null, description: "Tüp, pipet ucu, kap ve plastik sarf malzemeler." },
  { id: "c17", slug: "porselen", name: "Porselen", group: "gerecler", order: 17, image: null, description: "Krozeler, havanlar ve porselen laboratuvar gereçleri." },
  { id: "c18", slug: "sarf-malzemeleri", name: "Sarf Malzemeleri", group: "gerecler", order: 18, image: P + "ELEK-1270.jpg", description: "Elekler ve günlük laboratuvar kullanımına yönelik sarf malzemeler." },

  { id: "c19", slug: "kimyasal-urunler", name: "Kimyasal Ürünler", group: "kimyasal", order: 19, image: null, description: "Analitik saflıkta çözücüler, reaktifler ve standartlar." },
  { id: "c21", slug: "yardimci-ekipmanlar", name: "Yardımcı Ekipmanlar", group: "cihazlar", order: 21, image: P + "Isitici-Tabla-resim-1306.png", description: "Isıtıcı tablalar, karıştırıcılar, pompalar ve günlük laboratuvar işlerini kolaylaştıran yardımcı ekipmanlar." },
  { id: "c20", slug: "laboratuvar-kurulumu", name: "Laboratuvar Kurulumu", group: "kurulum", order: 20, image: P + "Tezgah-Sistemleri-resim-1075.png", description: "Tezgah sistemleri, çeker ocak yerleşimi ve anahtar teslim laboratuvar projeleri." },
];

export const BRANDS: Brand[] = [
  { id: "b1", slug: "nukleon", name: "Nükleon", country: "Türkiye", own: true, description: "Ankara İvedik OSB'deki tesisinde üretilen, Nükleon'un kendi cihaz markası." },
  { id: "b2", slug: "rayto", name: "Rayto", country: "Çin", description: "Spektrofotometre ve klinik analiz cihazları üreticisi." },
  { id: "b3", slug: "retsch", name: "Retsch", country: "Almanya", description: "Eleme, öğütme ve numune hazırlama cihazları." },
  { id: "b4", slug: "hanna", name: "Hanna", country: "Romanya", description: "pH, iletkenlik ve sıcaklık ölçüm cihazları." },
  { id: "b5", slug: "merck", name: "Merck", country: "Almanya", description: "Analitik kimyasallar ve reaktifler." },
  { id: "b6", slug: "isotek", name: "Isotek", country: "Türkiye", description: "Isıtıcı ve ısıtmalı karıştırıcı ürünleri." },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const brandBySlug = (slug: string) => BRANDS.find((b) => b.slug === slug);
