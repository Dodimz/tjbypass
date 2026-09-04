# Desain Frontend — tjbypass

Dokumen ini merangkum sistem desain frontend aplikasi: stack, tema/warna, layout, komponen, dan konvensi penulisan halaman.

---

## 1. Stack Frontend

| Teknologi | Versi | Peran |
|---|---|---|
| React | 19 | Library UI |
| TypeScript | 5.7 | Type safety |
| Inertia (React) | v3 | SPA tanpa API terpisah |
| Vite | 8 | Bundler + dev server (`npm run dev`) |
| TailwindCSS | 4 | Styling utility-first (config via CSS `@theme`, bukan `tailwind.config.js`) |
| Radix UI + shadcn-style | — | Komponen aksesibel (dialog, dropdown, tabs, dll.) |
| lucide-react | — | Ikon |
| Tiptap 3 | — | Rich text editor (deskripsi course/service) |
| Recharts | — | Grafik dashboard admin |
| Plyr | — | Video player materi kursus |
| sonner | — | Toast notification |
| Wayfinder | — | Generate fungsi TS dari route Laravel (`resources/js/routes/`) |

## 2. Struktur Direktori

```
resources/js/
├── app.tsx                  # Entry point Inertia
├── pages/                   # Halaman global (bukan module)
│   ├── auth/                # Login, register, reset password
│   ├── dashboard/           # Dashboard utama user
│   ├── intro/               # Landing page
│   ├── inner/               # Halaman CMS dinamis
│   ├── student/             # Area siswa (course saya, dll.)
│   └── job-circulars/
├── layouts/
│   ├── landing.tsx          # Layout landing page (navbar + footer dinamis)
│   ├── main.tsx             # Layout umum
│   ├── auth.tsx             # Layout halaman login/register
│   ├── navbar/              # Navbar publik + editor custom
│   ├── footer/              # Footer publik + editor custom
│   ├── dashboard/           # Layout dashboard (sidebar + header)
│   │   ├── layout.tsx
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── partials/routes.tsx   # Definisi menu sidebar
│   └── partials/            # Landing navbar/footer
├── components/
│   ├── ui/                  # Komponen dasar shadcn-style (button, card, dialog...)
│   ├── icons/               # Ikon kustom
│   └── *.tsx                # Komponen gabungan (actions-dropdown, heading, combobox...)
├── routes/                  # Hasil generate Wayfinder (JANGAN edit manual)
│   ├── services/guest/index.ts
│   └── ...
├── actions/                 # Hasil generate Wayfinder per-controller
└── types/                   # Tipe data global (User, Paginator, dst.)
```

Halaman module hidup di dalam module masing-masing:

```
modules/<nama-module>/resources/js/pages/
└── service/
    ├── index.tsx            # /services (katalog publik)
    ├── show.tsx             # /services/{uuid}
    ├── my-orders.tsx        # /my/services
    └── dashboard/
        ├── index.tsx        # /dashboard/services
        ├── create-edit.tsx  # create + edit (satu file, dua mode)
        └── orders.tsx       # /dashboard/services/orders
```

## 3. Tema & Warna

Didefinisikan di `resources/css/app.css` dengan CSS variables + `@theme inline` (Tailwind 4).

- **Font:** Inter (`--font-sans`)
- **Radius dasar:** `0.625rem` (rounded-lg)
- **Mode:** light & dark via class `.dark` pada `<html>` (toggle di komponen Appearance)

### Palet inti

| Token | Light | Keterangan |
|---|---|---|
| `--background` | putih | Latar halaman |
| `--foreground` | hampir hitam | Teks utama |
| `--primary` | biru gelap (oklch 0.265) | Warna merek utama; punya skala 50–900 (`bg-primary-100` dst.) |
| `--secondary` | hijau transparan 10% | Aksen kedua; skala 50–900 juga tersedia |
| `--muted` | abu sangat terang | Latar sekunder/kartu redup |
| `--destructive` | merah | Tombol hapus/error |
| `--border` / `--input` / `--ring` | netral | Border form & focus ring |

Dark mode membalik background/foreground; skala primary/secondary dihitung ulang dengan `color-mix(in oklch, ...)`.

**Aturan pakai warna:** selalu lewat token Tailwind (`bg-background`, `text-muted-foreground`, `border-border`) — jangan hardcode hex/rgb.

## 4. Layout Halaman

Ada 4 kelompok layout:

1. **Landing/publik** (`landing.tsx`) — navbar + footer yang isinya bisa diedit admin (disimpan sebagai Setting). Dipakai halaman intro, katalog service, detail service.
2. **Auth** (`auth.tsx`) — layar penuh sederhana untuk login/register.
3. **Dashboard** (`dashboard/layout.tsx`) — sidebar kiri (menu per-role) + header atas (breadcrumb, notifikasi, avatar user). Semua halaman `/dashboard/*` dan `/my/*` memakai ini.
4. **Inner** — halaman CMS statis hasil catch-all route.

## 5. Komponen UI Inti (`components/ui/`)

Semua berbasis Radix + CVA (class-variance-authority), gaya shadcn/ui:

`accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, dialog, drawer, dropdown-menu, hover-card, input, input-otp, label, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle, tooltip`

Komponen gabungan yang sering dipakai:

- `actions-dropdown.tsx` — menu titik-tiga di tabel (hanya support method `get | put | delete`; untuk POST gunakan `<Button>` + `router.post()`)
- `heading.tsx` — judul + subjudul halaman dashboard
- `combobox.tsx`, `datetime-picker.tsx`, `chunked-uploader.tsx` — input kompleks
- `app-logo.tsx`, `appearance.tsx` — branding & dark mode toggle

## 6. Konvensi Menulis Halaman

### Nama komponen = path Inertia

Controller: `Inertia::render('Service/dashboard/index')`
→ File: `modules/service/resources/js/pages/dashboard/index.tsx`

### Props langsung jadi parameter

```tsx
interface PageProps {
    services: Paginator<Service>;
}

export default function Index({ services }: PageProps) { ... }
```

Tipe data didefinisikan di file yang sama atau `types/`.

### Navigasi & submit selalu via Inertia

```tsx
// Link antar halaman
<Link href={guestShow.show.url(service.uuid)}>Detail</Link>

// Submit form
router.post(servicesStore(), data, {
    onSuccess: () => toast.success('Service created'),
});

// Hapus
router.delete(servicesDestroy(service.uuid));
```

URL **tidak pernah ditulis manual** — selalu import dari `@/routes/...` (Wayfinder).

### Pola halaman dashboard standar

1. `<Heading title="..." description="..." />`
2. Filter/search via query string (`router.get(url, { search })`, preserve state)
3. Tabel `<Table>` + pagination server-side
4. Aksi baris via `ActionsDropdown`

### Pola halaman publik standar

1. Grid kartu responsif: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`
2. Search bar yang update URL query string
3. Kartu: thumbnail (aspect-video), badge status/kategori, harga, CTA

### Form pattern (create-edit)

Satu file untuk create & edit — bedakan via prop `service?: Service`:

```tsx
const isEdit = Boolean(service?.uuid);
const [processing, setProcessing] = useState(false);

function submit(e: FormEvent) {
    e.preventDefault();
    isEdit
        ? router.put(servicesUpdate(service.uuid), data, options)
        : router.post(servicesStore(), data, options);
}
```

## 7. Alur Data Singkat

```
User klik → router.post() → Laravel controller → validasi Request
→ ServiceClass (logika bisnis) → DB → redirect / render ulang
→ Inertia kirim props baru → React re-render otomatis
```

State global minim: auth user & setting situs datang dari `HandleInertiaRequests` middleware (shared props), bukan Redux/Zustand.

## 8. Landing Page

### Alur render

```
GET / → HomeController@index (app/Http/Controllers/HomeController.php)
→ cek system.fields['frontend'] (mode page-builder eksternal → Frontend/index)
→ baca Setting 'home_page' (field page_id) → tabel pages
→ Inertia::render('intro/{slug}')   // slug: home-1 ... home-5
+ props dari PageService::getPageSections()
```

### Varian halaman

Ada 5 varian landing page; yang aktif ditentukan slug pada tabel `pages` (bisa diganti lewat admin):

| File | Karakteristik |
|---|---|
| `pages/intro/home-1.tsx` | Hero + katalog lengkap (10 section) |
| `pages/intro/home-2.tsx` | Ada CTA sebelum hero (`cta-prev`) |
| `pages/intro/home-3.tsx` | Fokus features + category-courses |
| `pages/intro/home-4.tsx` | Ada overview + single top-course |
| `pages/intro/home-5.tsx` | Ada statistics + instructor tunggal |

### Struktur file

```
resources/js/pages/intro/
├── home-1.tsx ... home-5.tsx     # Entry per varian
└── partials/
    ├── layout.tsx                # Wrapper: LandingLayout + mode customize
    └── home-1/ ... home-5/       # Satu folder partials per varian
        ├── hero.tsx
        ├── top-courses.tsx
        ├── testimonials.tsx
        └── ...
```

### Mekanisme sections

Controller mengirim `page.sections` (model `Page`, urut kolom `sort`). Tiap `home-X.tsx` memfilter section aktif lalu mapping slug → komponen via switch-case:

```tsx
sections.filter((s) => s.active).map((section) => {
    switch (section.slug) {
        case 'hero': components.push(Hero); break;
        case 'top_categories': components.push(TopCategories); break;
        case 'top_courses': components.push(TopCourses); break;
        // ...
    }
});
// Komponen dirender sesuai urutan sort
{components.map((Component, i) => <Component key={i} />)}
```

Slug section yang dikenal: `hero`, `partners`, `top_categories`, `top_courses`, `overview`, `new_courses`, `top_instructors`, `faqs`, `blogs`, `call_to_action`, `category_courses`, `top_course`.

### Props data dinamis

Dari `PageService::getPageSections()` — dipakai ulang di partials, jangan hardcode:

| Prop | Isi |
|---|---|
| `courses`, `categories`, `instructors` | Data umum |
| `topCourses`, `topCategories` | Item pilihan admin (by id) |
| `newCourses`, `topInstructors` | Terbaru / instruktur unggulan |
| `blogs` | Blog terbaru |
| `categoryTopCourses` | Kursus per-kategori |
| `instructor` | Instruktur pertama (testimonial) |
| `heroCourses`, `topCourse` | Untuk hero & single-course varian 4/5 |

### Mode customize

Jika prop `customize` ada (admin preview), `partials/layout.tsx` menampilkan tombol floating dengan `DataSortModal` untuk mengurutkan section dan toggle active/nonaktif per section — tersimpan ke DB via route `pageSection.update()` / `pageSection.sort()`.

### Mengganti desain

1. Cek varian aktif: slug pada tabel `pages` yang dirujuk Setting `home_page`.
2. Edit markup partials di `partials/home-X/` sesuai desain — tetap konsumsi props dinamis di atas.
3. Header/footer global diubah lewat `layouts/landing.tsx` (+ `layouts/navbar/`, `layouts/footer/`).
4. Section baru = buat partial + daftarkan slug di switch-case `home-X.tsx` + baris baru di tabel `sections`.
