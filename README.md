# Portfolio — Tran Thi Thuy Vy

Website portfolio cá nhân, **toàn bộ tiếng Anh**, dựng bằng **Next.js 14 + Tailwind CSS + Framer Motion**, deploy thẳng lên **Vercel**.
Có **trang quản trị riêng** (đăng nhập bằng mật khẩu) để bạn tự thêm hoạt động, sửa số liệu,
đổi ảnh và sửa chữ — không cần đụng vào code, không cần deploy lại.

---

## Mục lục

1. [Các trang](#các-trang)
2. [Chạy thử trên máy](#1-chạy-thử-trên-máy)
3. [Deploy lên Vercel](#2-deploy-lên-vercel)
4. [Bật trang quản trị (Supabase)](#3-bật-trang-quản-trị-supabase)
5. [Trang quản trị](#4-trang-quản-trị--admin)
6. [Thay ảnh](#5-thay-ảnh)
7. [Sửa chữ](#6-sửa-chữ)
8. [Đổi màu, font, hiệu ứng](#7-đổi-màu-font-hiệu-ứng)
9. [Sổ lưu bút (đang ẩn)](#8-sổ-lưu-bút-đang-ẩn)
10. [Cấu trúc thư mục](#cấu-trúc-thư-mục)

---

## Các trang

| Đường dẫn | Là gì |
|---|---|
| `/` | **Home** — tên bạn viết tay hiện dần, câu hook, đoạn giới thiệu, ba từ khoá (bấm được), số liệu, nút sang Portfolio |
| `/portfolio` | **Portfolio** — trang tổng hợp: 3 thẻ từ khoá + thanh lọc 5 chuyên mục; tab *Everything* nhóm theo chuyên mục |
| `/portfolio/excellence`<br>`/portfolio/leadership`<br>`/portfolio/entrepreneurship` | **Trang riêng của mỗi từ khoá** — chỉ hiện những chuyên mục bạn gán cho từ khoá đó |
| `/archive` | **Archive** — công khai, liệt kê *mọi* hoạt động theo năm, kể cả mục không đưa lên Portfolio |
| `/contact` | **Contact** — email, điện thoại, LinkedIn, Facebook, tình trạng hiện tại |
| `/admin` | **Kho riêng của bạn** (có mật khẩu) — 5 khu: Activities · Sections & keywords · Numbers · Images · Text |
| `/guestbook` | Sổ lưu bút — đã dựng xong nhưng **đang ẩn khỏi menu** cho tới gần ngày tốt nghiệp |

### Năm chuyên mục

`Academic` · `Leadership` · `Extracurricular` · `Work Experience` · `Competitions & Awards`

Mỗi chuyên mục được **gán vào một từ khoá** (sửa trong `/admin` → *Sections & keywords*).
Mặc định: Excellence ← Academic · Leadership ← Leadership + Extracurricular ·
Entrepreneurship ← Work Experience + Competitions & Awards.
Chuyên mục nào để trống từ khoá thì vẫn hiện trên Portfolio, chỉ là nằm phía dưới.

### Portfolio và Archive khác nhau chỗ nào

- **Archive** = tất cả hoạt động đã công khai.
- **Portfolio** = những mục bạn bật *Show on portfolio*.
Trong `/admin` → *Activities*, mỗi mục có hai công tắc: **Visible** (công khai hay không) và
**On portfolio / Archive only** (có lên trang Portfolio hay chỉ nằm ở Archive).

---

## Thiết kế

Bảng màu **trắng · xanh dịu · navy**:

| Token | Hex | Dùng ở đâu |
|---|---|---|
| `paper` | `#FCFDFF` | nền chính |
| `paper-100` | `#F7FAFE` | panel sáng nhất |
| `paper-200` | `#F0F6FD` | nền phụ, phân tách section |
| `paper-300` | `#E4EFFB` | thẻ, chip |
| `paper-400` | `#D6E6F7` | đường kẻ, viền |
| `navy` | `#16365F` | chữ chính |
| `navy-soft` | `#5B7896` | chữ phụ |
| `navy-deep` | `#0F2947` | các khối đảo màu |
| `azure` | `#1D63D2` | link, số liệu (đủ tương phản trên nền trắng) |
| `azure-bright` | `#3B82F6` | vệt sáng trang trí |
| `azure-light` | `#8FBBF9` | màu nhấn trên nền navy |

Font:

- **Ephesis** — chữ ký viết tay, dùng cho tên bạn (dự phòng: Great Vibes)
- **Instrument Serif** *nghiêng* — ba từ khoá và các tiêu đề lớn, nét cong mềm
- **Inter** — thân bài, nhãn, nút

### Chuyển động

| Hiệu ứng | Ở đâu |
|---|---|
| Tên viết dần ra như đang ký | Home |
| Cuộn có quán tính (Lenis) | toàn trang |
| Con trỏ tuỳ biến — chấm + vòng bám theo, đổi thành huy hiệu trên ảnh | máy tính có chuột |
| Chữ trồi lên từng từ qua khung che | mọi tiêu đề lớn |
| Ảnh lộ dần từ dưới lên | ảnh bìa các trang |
| Parallax | ảnh nền Home, chân dung, ảnh bìa Portfolio |
| Dải số liệu chạy ngang, tăng tốc theo tốc độ cuộn | dưới ảnh bìa Home |
| Số đếm từ 0 lên | Home và mỗi chuyên mục Portfolio |
| Ảnh bay ra bám con trỏ khi rê vào một mục | Portfolio |
| Cửa sổ nổi trượt lên khi bấm vào một mục | Portfolio · Archive · trang từ khoá |
| Bấm từ khoá ở Home → mở trang riêng của từ khoá đó | Home |
| Nút hút nhẹ về phía con trỏ | các nút chính |
| Vệt sáng xanh trôi chậm ở nền | Home, Portfolio, Contact |

Tất cả tự tắt khi người xem bật **"giảm chuyển động"** trong hệ điều hành.

---

## 1. Chạy thử trên máy

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## 2. Deploy lên Vercel

**Nhanh nhất (không cần Git):**

```bash
npm i -g vercel
vercel        # bản preview
vercel --prod # bản chính thức
```

**Chuẩn hơn (khuyến nghị — sau này chỉ cần `git push`):**

1. Đẩy thư mục này lên một repo GitHub.
2. Vào vercel.com → **Add New → Project** → chọn repo → **Deploy**.

> Website chạy bình thường ngay cả khi chưa có Supabase: 13 hoạt động lấy từ CV và toàn bộ chữ
> mặc định nằm sẵn trong code. Supabase cần cho `/admin` — thêm hoạt động, sửa số liệu, sửa chữ,
> upload ảnh.

---

## 3. Bật trang quản trị (Supabase)

Làm một lần, khoảng 10 phút.

### Bước 1 — Tạo project

1. Vào [supabase.com](https://supabase.com) → **Start your project** → đăng nhập bằng GitHub.
2. **New project**, chọn region Singapore, đặt mật khẩu database rồi lưu lại.
3. Đợi ~2 phút.

### Bước 2 — Tạo bảng và kho ảnh

1. Mở **SQL Editor** → **New query**.
2. Copy toàn bộ file `supabase/schema.sql` trong thư mục này, dán vào, bấm **Run**.
3. Vào **Table Editor** thấy `portfolio_entries`, `site_settings` và `guestbook_entries`;
   vào **Storage** thấy bucket `portfolio-images` là xong.
   (Chạy lại file này lần nữa cũng an toàn — nó chỉ thêm những gì còn thiếu.)

### Bước 3 — Lấy khoá

**Project Settings → API** lấy **Project URL** → `SUPABASE_URL`

**Project Settings → API Keys** lấy **secret key** (bắt đầu bằng `sb_secret_`) → `SUPABASE_SERVICE_ROLE_KEY`

Supabase đã đổi tên khoá từ 2025: `sb_secret_…` chính là bản thay thế của `service_role` cũ.
Code nhận cả hai tên biến `SUPABASE_SERVICE_ROLE_KEY` và `SUPABASE_SECRET_KEY`, đặt tên nào cũng chạy.

Khoá `sb_publishable_…` và `SUPABASE_JWKS_URL` **không cần** cho project này.

> ⚠️ Khoá secret bỏ qua mọi Row Level Security — ai có nó thì toàn quyền với database.
> Chỉ dán thẳng vào ô Environment Variables trên Vercel; **không** gửi qua chat, email hay tin nhắn,
> và **không bao giờ** đặt vào biến có tiền tố `NEXT_PUBLIC_`.
> Lỡ để lộ thì vào **Project Settings → API Keys → Revoke** rồi tạo khoá mới.

### Bước 4 — Khai báo biến môi trường

**Trên máy:** copy `.env.example` thành `.env.local` rồi điền:

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxxxxx
ADMIN_PASSWORD=mat-khau-ban-tu-dat
```

**Trên Vercel:** project → **Settings → Environment Variables** → thêm đúng ba biến trên
(tick cả Production, Preview, Development) → **Redeploy**.

---

## 4. Trang quản trị — `/admin`

Vào **`tenmien.com/admin`** (hoặc bấm chữ *Admin* rất nhỏ ở góc dưới bên phải mọi trang),
rồi nhập `ADMIN_PASSWORD`.

> Nếu chưa khai báo xong ba biến môi trường ở mục 3, trang này sẽ **hiện danh sách những gì
> còn thiếu** thay vì ô nhập mật khẩu — cứ làm theo đúng danh sách đó.
>
> Sau khi thêm biến trên Vercel **phải bấm Redeploy**; Vercel chỉ nạp biến mới ở lần deploy kế tiếp.

Có năm khu:

### Activities — kho hoạt động của bạn

Thêm, sửa, ẩn, xoá từng hoạt động.

| Ô | Ý nghĩa |
|---|---|
| **Title** | Tên tổ chức hoặc chương trình — chữ lớn nhất trên thẻ |
| **Section** | Chọn 1 trong 5 chuyên mục |
| **Role / subtitle** | Vai trò của bạn, hiện bằng chữ nghiêng |
| **Period** | Thời gian dạng chữ, ví dụ `Dec 2024 – Dec 2025` |
| **Start date** | Chỉ dùng để sắp xếp — mới nhất lên trước |
| **Summary** | Một hai dòng hiện trên thẻ |
| **Story** | Đoạn dài hiện trong cửa sổ nổi |
| **Highlights** | Mỗi dòng là một gạch đầu dòng |
| **Photographs** | Upload nhiều ảnh — chính là ảnh bay ra khi rê chuột và ảnh trong cửa sổ nổi. Để trống cũng được: mục không có ảnh thì rê chuột vẫn bình thường, chỉ là không có ảnh nào hiện ra |
| **Links** | Nhãn + đường dẫn |
| **Published** | Bỏ tick để giấu hẳn khỏi web |
| **Show on portfolio** | Bỏ tick thì mục chỉ nằm ở Archive |

> **Không cần bấm gì để bắt đầu.** Lần đầu bạn đăng nhập `/admin` với database còn trống,
> 13 hoạt động lấy từ CV (`lib/seed-entries.js`) tự được chép vào database để bạn sửa được ngay.
> Việc này chỉ xảy ra đúng một lần: hoạt động nào bạn xoá sau đó sẽ không quay lại.

**Nếu một hoạt động hiện lặp lại nhiều lần trên web:** mở `/admin`, tab Activities sẽ tự hiện
khung **"Remove duplicates"** kèm số bản thừa. Bấm một lần là xong — bản đầu tiên của mỗi hoạt
động được giữ lại cùng mọi chỉnh sửa bạn đã làm trên nó. (Cách khác: chạy lại
`supabase/schema.sql` trong SQL Editor của Supabase — phần 5 ở cuối file làm đúng việc này.)

### Sections & keywords

Đổi tên và mô tả 5 chuyên mục, sửa ba từ khoá (chữ, câu một dòng, đoạn dẫn ở trang riêng),
và **gán chuyên mục vào từ khoá** — hoặc để trống nếu chưa muốn gán.

### Numbers

Sửa các con số ở Home và ở mỗi chuyên mục, **thêm** số mới bằng nút *+ Add a number*, hoặc bỏ
bớt bằng dấu `×`. Viết đúng như muốn hiện: `2,000+`, `3.69/4.0`, `100%` đều chạy được — hiệu
ứng đếm tự nhận ra phần số.

### Images

Ô đầu tiên là **Your photo → Photo of you**: ảnh chân dung của bạn cạnh đoạn giới thiệu ở
trang Home. Bên dưới là nền Home, bìa Portfolio, nền Contact và các ô ảnh của từng hoạt động.

- Ô nào còn gắn nhãn **Empty** nghĩa là chưa có ảnh — trên web nó không hiện gì cả.
- Nút **Remove** trả một ô về trạng thái trống, dùng khi bạn muốn một hoạt động không có ảnh.

Ảnh lưu trên Supabase Storage, hiện với tất cả mọi người, không cần deploy lại.

### Text

**Toàn bộ chữ trên web**, chia theo từng trang: tên viết tay ở trang bìa, câu hook, đoạn giới
thiệu, dải số liệu chạy ngang, chữ trên các nút, tiêu đề nhỏ của từng khu, chữ trang Portfolio /
Archive / Contact, và thông tin liên hệ kể cả link LinkedIn / Facebook. Không còn nhãn nào phải
sửa trong code.

> Mọi thay đổi ở bốn khu sau đều bấm **Save changes** ở cuối trang mới có hiệu lực.
> Nếu database trống hoặc chưa cấu hình, web tự dùng giá trị mặc định trong `lib/content.js`.

## 5. Thay ảnh

Hai loại ảnh:

- **Ảnh bố cục** — nền Home, chân dung, ảnh bìa Portfolio, nền Contact.
- **Ảnh của từng mục** — bay ra bám con trỏ khi rê vào, và lấp đầy thư viện trong cửa sổ nổi.
  Mục thêm qua `/admin` dùng ảnh bạn upload; 13 mục gốc dùng các ô ảnh khai báo trong `lib/images.js`.

### Cách 1 — Chỉnh ngay trên web

1. Bấm **`Ctrl + E`** (Mac: **`⌘ + E`**), hoặc thêm `?edit` vào cuối đường dẫn.
2. Chọn ô ảnh trong bảng bên phải (đã chia sẵn theo nhóm), hoặc bấm thẳng vào ảnh trên trang.
3. **Choose an image** → **kéo trực tiếp trên ảnh** để dời khung nhìn, hoặc dùng ba thanh trượt.
4. `Esc` để đóng.

> Ảnh ở bước này chỉ lưu trong trình duyệt của bạn.

### Cách 2 — Chốt bản chính thức

Trong bảng, phần *Make it permanent*:

1. **Download the photos** → tải về `hero.jpg`, `sihub-1.jpg`, …
2. **Download the config** → được `IMAGE_SLOTS.txt`.
3. Chép ảnh vào `public/images/`, dán config vào `lib/images.js`, `git push`.

### Gắn ảnh cho một mục gốc

Trong `lib/seed-entries.js`, mỗi mục có dòng `photos`:

```js
photos: ["sihub-1", "sihub-2"],
```

Tên phải khớp `key` khai báo trong `lib/images.js`. Muốn thêm ảnh thứ ba thì thêm một `key` mới ở
`lib/images.js` rồi bổ sung vào mảng. Tối đa 3 ảnh mỗi mục thì hiệu ứng còn đẹp.

---

## 6. Sửa chữ

Cách nhanh nhất là vào `/admin` → *Text*. Nếu muốn sửa trong code:

- **`lib/content.js`** → `defaultSettings`: thông tin cá nhân, trang Home, ba từ khoá,
  5 chuyên mục và số liệu, trang Contact. Đây là **giá trị mặc định** — những gì bạn lưu
  trong `/admin` sẽ đè lên chúng.
- **`lib/content.js`** → `defaultSettings.ui`: chữ trên nút, tiêu đề mục, thông báo — tất cả
  đều sửa được trong `/admin` → *Text*, đây chỉ là giá trị mặc định.
- **`lib/seed-entries.js`** — 13 hoạt động lấy từ CV, chỉ dùng khi database còn trống.

**Một chỗ nhớ sửa:** `metadataBase` trong `app/layout.js` — đổi thành tên miền thật khi đã có.

---

## 7. Đổi màu, font, hiệu ứng

- **Màu:** `tailwind.config.js` → `colors` (`paper`, `navy`, `azure`). Sửa hex là đổi tông cả web.
- **Font:** `app/layout.js` (thẻ `<link>` Google Fonts) và `app/globals.css`
  (`--font-sans`, `--font-display`, `--font-script`).
  Không thích chữ ký Ephesis thì đổi `--font-script` sang `Great Vibes`, `Parisienne`,
  `Sacramento` hoặc `Style Script` — nhớ sửa cả tên font trong link Google Fonts.
- **Chuyển động:** tất cả nằm trong `components/Motion.jsx`
  (`Reveal`, `Words`, `Signature`, `MaskImage`, `Parallax`, `CountUp`, `Magnetic`, `Orbs`).
  Muốn tắt một hiệu ứng ở đâu thì bỏ component bọc ở chỗ đó.
- **Tốc độ cuộn mượt:** `components/SmoothScroll.jsx` → `lerp`. Số càng **lớn** thì trang càng
  bám sát con lăn (`0.14` là mặc định); càng nhỏ thì càng trôi, càng dễ có cảm giác nặng.
  Muốn tắt hẳn: `/admin` → *Text* → **Motion** → bỏ tick *Smooth scrolling*.

  > ⚠️ **Không bao giờ đặt `scroll-behavior: smooth` cho `html` trong `app/globals.css`.**
  > Lenis đặt vị trí cuộn mới mỗi khung hình; nếu CSS cũng tự làm mượt từng lần đặt đó thì hai
  > bên đánh nhau: Lenis chạy tới trước còn trang bò theo sau, và web có cảm giác như bị đơ dù
  > bạn lăn chuột mạnh cỡ nào. Đây từng là lỗi làm trang cuộn cực chậm.
- **Con trỏ:** `components/Cursor.jsx`. Thêm `data-cursor="VIEW"` vào phần tử nào thì con trỏ đổi
  thành huy hiệu có chữ đó.

### Khi web có rất nhiều ảnh

Web được dựng để chịu được hàng trăm ảnh mà vẫn nhẹ. Bốn cơ chế chạy sẵn:

1. **Mỗi ảnh upload thành hai bản.** Bản đầy đủ (cạnh dài tối đa 1800px, ~300 KB) và bản xem
   trước 640px (~60 KB) lưu ngay cạnh nó với đuôi `-thumb`. Ảnh bay ra khi rê chuột, lưới ảnh
   trong cửa sổ nổi, mọi danh sách — tất cả dùng bản nhỏ.
2. **Bản đầy đủ chỉ tải khi bạn bấm vào ảnh.** Trong cửa sổ nổi, bấm một ảnh là nó mở toàn màn
   hình (bấm nền hoặc `Esc` để đóng). Trước đó trình duyệt chưa hề tải file lớn.
3. **Ảnh chỉ tải khi cuộn tới** (`loading="lazy"`). Trang có 12 dải ảnh lớn mở nhanh ngang trang
   có 1 dải.
4. **Ảnh mẫu không được tính là ảnh.** Ô nào chưa thay thì trên web không hiện gì cả.

**Dung lượng.** Gói miễn phí của Supabase cho **1 GB lưu trữ** và **5 GB truyền dữ liệu mỗi
tháng**. Với ~300 KB một ảnh: 100 ảnh ≈ 30 MB, 500 ảnh ≈ 150 MB — còn rất xa mức 1 GB. Phần dễ
chạm trần hơn là băng thông, nhưng vì khách chủ yếu thấy bản `-thumb` 60 KB nên một lượt xem
trang thường chỉ tốn dưới 1 MB. Muốn theo dõi: Supabase → Reports → Storage / Egress. Nếu có ngày
vượt, gói Pro (25 USD/tháng) nâng lên 100 GB lưu trữ và 250 GB băng thông.

### Dải ảnh lớn giữa nội dung

`/admin` → *Images* → **Photo bands**. Mỗi dải là một ảnh khổ lớn nằm giữa các khu của trang, kèm
chú thích tuỳ chọn. Bạn chọn: đặt ở trang **Home** hay **Portfolio**, dải **cao** hay **rộng**,
tràn **sát mép màn hình** hay **nằm trong lề**, và kéo ba thanh trượt để căn khung. Nút *Move
up / Move down* đổi thứ tự. Thêm bao nhiêu dải cũng được.

### Nếu thấy web nặng

Cách nhanh nhất: `/admin` → *Text* → **Motion** → bỏ tick *Smooth scrolling* và/hoặc
*Custom cursor*, lưu lại. Trang trở về cuộn như mọi web bình thường.

Ngoài ra, cuộn mượt và con trỏ tuỳ biến **tự tắt** ở `/admin`, trên thiết bị cảm ứng, và khi máy bật
"giảm chuyển động" (Windows: Settings → Accessibility → Visual effects; macOS: System Settings →
Accessibility → Display → Reduce motion). Bật tuỳ chọn đó là cách nhanh nhất để xem web ở chế độ
tĩnh hoàn toàn.

Ảnh bạn upload qua `/admin` được **thu nhỏ ngay trong trình duyệt** trước khi gửi đi
(`lib/resize-image.js`, cạnh dài tối đa 1800px). Ảnh 5 MB chụp từ điện thoại sẽ thành khoảng
300 KB — đây là yếu tố ảnh hưởng tốc độ nhiều nhất khi bạn thay hết ảnh thật.

---

## 8. Sổ lưu bút (đang ẩn)

Trang `/guestbook` và trang duyệt `/guestbook/admin` đã dựng xong và dùng chung database. Hiện nó
**không xuất hiện trong menu**. Gần ngày tốt nghiệp, mở `lib/content.js` và bỏ dấu chú thích ở dòng
này trong mảng `nav`:

```js
// { href: "/guestbook", label: "Guestbook" },
```

Mọi lời nhắn gửi lên đều ở trạng thái chờ duyệt; vào `/guestbook/admin` (cùng `ADMIN_PASSWORD`)
bấm cho hiện thì mới lên tường. Form có bẫy bot ẩn và giới hạn độ dài.

---

## Cấu trúc thư mục

```
app/
  layout.js                    khung chung: font, cuộn mượt, con trỏ, menu
  page.js                      Home
  portfolio/page.jsx           Portfolio
  portfolio/[keyword]/page.jsx trang riêng của mỗi từ khoá
  archive/page.jsx             Archive
  contact/page.jsx             Contact
  admin/page.jsx               kho riêng (có mật khẩu)
  guestbook/                   sổ lưu bút (đang ẩn) + trang duyệt
  api/entries/                 đọc / thêm / sửa / xoá hoạt động
  api/settings/                đọc / lưu cấu hình toàn site
  api/upload/                  upload ảnh lên Supabase Storage
  api/guestbook/               đọc / ghi / duyệt lời nhắn
components/
  HomeScreen · PortfolioScreen · KeywordScreen · ArchiveScreen · ContactScreen
  AdminScreen                  5 khu quản trị
  EntryList · EntryCard        danh sách hoạt động
  EntryModal                   cửa sổ nổi xem chi tiết
  HoverPhotos                  ảnh bay ra bám con trỏ
  Motion.jsx                   bộ hiệu ứng dùng chung
  Cursor · SmoothScroll · Marquee · Nav · Footer
  SiteProvider · EditableImage · EditPanel   chế độ chỉnh ảnh nhanh (Ctrl+E)
lib/
  content.js                   giá trị mặc định + nhãn cố định
  settings.js                  gộp cấu hình database lên mặc định
  data.js                      đọc dữ liệu phía máy chủ
  seed-entries.js              13 hoạt động lấy từ CV
  images.js                    khai báo các ô ảnh
  supabase.js                  kết nối database (chỉ chạy phía máy chủ)
supabase/schema.sql            SQL tạo bảng + bucket ảnh
public/images/                 file ảnh
```
