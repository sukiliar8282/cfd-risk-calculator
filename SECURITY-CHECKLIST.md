# CFD Risk Calculator — Security Checklist

## Status

Tanggal audit: 2026-09-24

---

## 1. Keamanan Dasar

- [x] HTTPS GitHub Pages aktif.
- [x] Website dijalankan melalui HTTPS saat production.
- [ ] CAPTCHA untuk mencegah bot.
  - Belum wajib karena traffic dan form masih sederhana.
- [x] Tidak menggunakan CMS, plugin, atau backend sendiri.
- [x] Tidak menggunakan password broker.
- [x] Tidak menggunakan API key broker.
- [x] Tidak menggunakan database sendiri.
- [x] Source code dapat diaudit melalui GitHub.
- [ ] Backup tambahan repository.
  - Disarankan mengaktifkan backup atau mirror repository.

---

## 2. Authentication dan Access

- [x] Login menggunakan Supabase Auth.
- [x] Email verification diaktifkan.
- [x] User dapat Login.
- [x] User dapat Register.
- [x] User dapat Logout.
- [x] Guest dapat menggunakan calculator tanpa Login.
- [x] Password tidak disimpan di localStorage.
- [x] Secret key tidak digunakan di frontend.
- [x] Hanya menggunakan Supabase Publishable key.
- [ ] Multi-Factor Authentication.
  - Dapat ditambahkan jika akun user menjadi lebih sensitif.
- [ ] Custom login throttling.
  - Gunakan rate limit dan Attack Protection dari Supabase.
- [x] Redirect URL Supabase dibatasi ke localhost dan GitHub Pages.
- [x] Site URL Supabase sudah diarahkan ke website production.

---

## 3. API Key dan Secret

- [x] Project URL boleh digunakan di frontend.
- [x] Supabase Publishable key boleh digunakan di frontend.
- [ ] Pastikan tidak ada `sb_secret_` di repository.
- [ ] Pastikan tidak ada `service_role` di repository.
- [ ] Pastikan tidak ada password database di repository.
- [ ] Pastikan tidak ada token admin di repository.
- [ ] Jika secret pernah ter-upload, segera revoke dan rotate.

---

## 4. Perlindungan Frontend

- [x] Content Security Policy tersedia.
- [x] `object-src 'none'` digunakan.
- [x] `base-uri 'self'` digunakan.
- [x] `form-action 'self'` digunakan.
- [x] Referrer Policy tersedia.
- [x] HTTPS upgrade aktif.
- [x] Input menggunakan validasi angka.
- [x] Hasil tidak menampilkan `NaN`.
- [x] Hasil tidak menampilkan `Infinity`.
- [x] Hasil tidak menampilkan `undefined`.
- [x] Output utama ditampilkan dengan `textContent`.
- [ ] Hindari penggunaan `innerHTML` untuk data dari user.
- [x] Tidak ada koneksi ke broker.
- [x] Tidak ada upload file user.

---

## 5. Supabase Database

Saat ini calculator belum menyimpan data calculator ke database.

- [x] Tidak ada tabel user custom yang digunakan.
- [x] Tidak ada data trading user yang dikirim ke database.
- [ ] Jika nanti membuat tabel, aktifkan Row Level Security (RLS).
- [ ] Buat policy agar user hanya dapat mengakses datanya sendiri.
- [ ] Jangan memberikan akses database publik tanpa policy.
- [ ] Jangan menyimpan password secara manual.

---

## 6. Hosting dan Deployment

- [x] `index.html` berada di root repository.
- [x] `style.css` berada di root repository.
- [x] `script.js` berada di root repository.
- [x] `supabase-config.js` berada di root repository.
- [x] Logo berada di folder `assets`.
- [x] GitHub Pages menggunakan branch `main`.
- [x] GitHub Pages menggunakan folder root.
- [x] Website dapat dibuka melalui HTTPS.
- [ ] Setiap perubahan lokal sudah di-upload ke GitHub.
- [ ] Setelah update, lakukan hard refresh dan test ulang.

---

## 7. Backup

- [x] Source code tersimpan di GitHub.
- [ ] Buat salinan repository di lokasi terpisah.
- [ ] Simpan backup `index.html`.
- [ ] Simpan backup `style.css`.
- [ ] Simpan backup `script.js`.
- [ ] Simpan backup `supabase-config.js`.
- [ ] Jangan menyimpan secret key di dalam backup.

---

## 8. Monitoring

- [x] Error JavaScript dapat diperiksa melalui Browser Console.
- [x] Supabase menyediakan log Authentication.
- [ ] Periksa Auth Logs secara berkala.
- [ ] Periksa failed login secara berkala.
- [ ] Periksa perubahan repository melalui GitHub history.
- [ ] Tambahkan monitoring tambahan jika traffic meningkat.

---

## 9. Komponen yang Tidak Relevan untuk Project Static

Komponen berikut tidak digunakan karena website tidak memakai CMS atau server sendiri:

- [N/A] Update CMS.
- [N/A] Update plugin.
- [N/A] Update tema CMS.
- [N/A] Patch OS server sendiri.
- [N/A] Mengubah URL `/wp-admin`.
- [N/A] File permission server.
- [N/A] `.htaccess`.
- [N/A] `config.php`.
- [N/A] Web server pribadi.
- [N/A] Database server pribadi.

---

## 10. Final Security Rules

- Jangan commit secret key.
- Jangan commit password.
- Jangan menyimpan password user sendiri.
- Jangan meminta password broker.
- Jangan meminta API key broker.
- Jangan mengirim data trading ke server tanpa alasan jelas.
- Gunakan Publishable key untuk frontend.
- Gunakan Secret key hanya di server.
- Aktifkan RLS jika database mulai digunakan.
- Selalu test Login, Logout, dan email verification setelah deployment.
