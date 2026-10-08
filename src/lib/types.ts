export type CategoryGroup = "cihazlar" | "olcum" | "gerecler" | "kimyasal" | "kurulum";

export interface Category {
  id: string;
  slug: string;
  name: string;
  group: CategoryGroup;
  image: string | null;
  description: string;
  order: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  country: string;
  description: string;
  own?: boolean;
}

export interface TechnicalSpecifications {
  volumeL?: number;
  tempMinC?: number;
  tempMaxC?: number;
  powerW?: number;
  voltage?: string;
  control?: string;
  innerMm?: [number, number, number]; // w × h × d
  outerMm?: [number, number, number];
  weightKg?: number;
  warrantyMonths?: number;
  /** anything that doesn't fit the fixed fields: shown in the spec table */
  extra?: { label: string; value: string }[];
}

export interface ProductDocument {
  title: string;
  url: string;
  sizeKb?: number;
  kind: "katalog" | "kullanim-kilavuzu" | "teknik-sartname" | "diger";
}
export interface ProductCertificate {
  title: string;
  issuer?: string;
  url?: string;
}
export interface ProductVideo {
  title: string;
  youtubeId: string;
}

export type ProductType = "Cihaz" | "Ölçüm Aleti" | "Yardımcı Ekipman" | "Kurulum Sistemi" | "Sarf Malzeme";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string; // category slug
  brand: string; // brand slug
  type: ProductType;
  tagline: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  /** TRY, excl. VAT. null → quote only ("Teklif Al") */
  price: number | null;
  stock: number;
  /** days to ship when made to order */
  leadTimeDays: number;
  images: string[];
  model3d: string | null;
  technicalSpecifications: TechnicalSpecifications;
  documents: ProductDocument[];
  certificates: ProductCertificate[];
  videos: ProductVideo[];
  faq: { q: string; a: string }[];
  featured: boolean;
  isNew: boolean;
  /** true while values are placeholders awaiting the manufacturer's data sheet */
  specsDraft: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string | null;
  readingMinutes: number;
  publishedAt: string;
  body: string[]; // paragraphs; lines starting with "## " are sub-headings
  relatedProducts?: string[];
}

export interface CartLine {
  slug: string;
  qty: number;
}

export interface QuoteRequest {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  taxNo: string;
  product: string;
  qty: number;
  message: string;
  status: "yeni" | "inceleniyor" | "teklif-gonderildi" | "kapandi";
  createdAt: string;
}

export interface OrderLine {
  slug: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
}
export interface Order {
  id: string;
  number: string;
  customerId?: string;
  customer: { name: string; company: string; email: string; phone: string; taxOffice: string; taxNo: string };
  shipping: { line1: string; district: string; city: string; zip: string };
  billingSame: boolean;
  lines: OrderLine[];
  subtotal: number;
  vat: number;
  shippingCost: number;
  total: number;
  payment: "iyzico" | "havale";
  paymentStatus: "bekliyor" | "odendi" | "basarisiz";
  paymentRef?: string;
  status: "alindi" | "hazirlaniyor" | "kargoda" | "teslim-edildi" | "iptal";
  note: string;
  createdAt: string;
}

export interface Address {
  id: string;
  title: string;
  name: string;
  phone: string;
  line1: string;
  district: string;
  city: string;
  zip: string;
}
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  passwordHash: string;
  addresses: Address[];
  createdAt: string;
}
