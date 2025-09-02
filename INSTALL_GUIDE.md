# Panduan Deployment AL ANSHOR LIVE STREAM di VPS (Metode PM2)

Panduan ini dirancang untuk mendeploy antarmuka (frontend) aplikasi ini di server Anda menggunakan metode yang stabil, ringan, dan andal, sangat cocok untuk lingkungan VPS.

---

## 1. Arsitektur Proyek: Frontend vs. Backend (Penting!)

Repositori ini hanya berisi **Frontend** (panel kontrol web). Ini adalah antarmuka pengguna grafis (GUI) tempat Anda mengelola streaming secara visual.

-   **Frontend (Kode ini):** Sebuah aplikasi React yang berjalan di browser pengguna. Tugasnya adalah mengirim perintah ke backend Anda.
-   **Backend (Tanggung Jawab Anda):** Ini adalah "mesin" yang berjalan di VPS Anda, yang harus Anda bangun secara terpisah. Backend akan menerima perintah dari Frontend (misalnya, melalui API) dan melakukan pekerjaan berat:
    -   Menjalankan `ffmpeg` untuk memproses dan menyiarkan video.
    -   Menggunakan `tmux` untuk menjaga proses streaming tetap berjalan di latar belakang.
    -   Idealnya, semua ini juga dikelola dalam kontainer **Docker** terpisah untuk backend.

Panduan ini akan fokus pada cara menjalankan **Frontend** dengan benar dan efisien di VPS Anda.

---

## 2. Metode Deployment: `pm2` + `serve` (Stabil & Ringan)

Metode ini menggunakan alat standar industri untuk menjalankan aplikasi berbasis JavaScript/Node.js secara permanen.

-   **`serve`**: Server statis yang sangat ringan untuk menyajikan file aplikasi Anda.
-   **`pm2`**: Manajer proses yang akan menjaga aplikasi Anda tetap berjalan 24/7 dan secara otomatis me-restart jika terjadi crash.

### Prasyarat

-   **Node.js dan NPM**: Anda memerlukan Node.js (versi 16 atau lebih baru) dan npm. Jika belum terinstal:
    ```bash
    curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

### Langkah 1: Siapkan File Aplikasi

1.  Salin semua file aplikasi ke direktori di VPS Anda, misalnya `/home/user/alanshor-livestream`. Cara termudah adalah menggunakan `git`:
    ```bash
    # Ganti URL dengan URL repositori Anda jika perlu
    git clone https://github.com/username/repo.git /home/user/alanshor-livestream
    cd /home/user/alanshor-livestream
    ```

### Langkah 2: Instal Alat yang Diperlukan

Instal `serve` dan `pm2` secara global menggunakan `npm`.
```bash
npm install -g serve pm2
```

### Langkah 3: Jalankan Aplikasi dengan PM2

Sekarang, dari dalam direktori aplikasi Anda (`/home/user/alanshor-livestream`), jalankan perintah berikut untuk memulai aplikasi Anda dan menjaganya tetap berjalan:

```bash
pm2 start "npx serve -s . -l 3000" --name "alanshor-livestream-frontend"
```

Penjelasan Perintah:
-   `pm2 start "..."`: Memulai proses yang didefinisikan dalam tanda kutip.
-   `npx serve`: Menjalankan server `serve`.
-   `-s`: Mode *single-page application*. Ini sangat penting; ini memastikan bahwa semua permintaan akan diarahkan ke `index.html`, yang memungkinkan routing di sisi klien React berfungsi dengan benar.
-   `.`: Menyajikan file dari direktori saat ini.
-   `-l 3000`: Menjalankan server di port 3000.
-   `--name "..."`: Memberi nama proses di `pm2` agar mudah diidentifikasi.

Untuk memastikan aplikasi Anda akan otomatis berjalan lagi setelah VPS di-reboot, jalankan:
```bash
pm2 startup
# Salin dan jalankan perintah yang diberikan oleh pm2
pm2 save
```

### Langkah 4: Konfigurasi Nginx sebagai Reverse Proxy (Akses Publik)

Langkah ini penting agar Anda dapat mengakses aplikasi melalui IP publik VPS Anda (atau domain) tanpa perlu mengetik `:3000`.

1.  **Instal Nginx**:
    ```bash
    sudo apt update && sudo apt install nginx -y
    ```

2.  **Buat file konfigurasi Nginx baru**:
    ```bash
    sudo nano /etc/nginx/sites-available/alanshor-livestream
    ```

3.  **Tempel konfigurasi berikut**:
    Ganti `ALAMAT_IP_VPS_ANDA` dengan IP publik VPS Anda.

    ```nginx
    server {
        listen 80;
        server_name ALAMAT_IP_VPS_ANDA; # Ganti dengan IP atau domain Anda

        location / {
            # Teruskan lalu lintas ke aplikasi yang berjalan di port 3000
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

4.  **Aktifkan Konfigurasi**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/alanshor-livestream /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default # Hapus konfigurasi default jika ada
    sudo nginx -t # Uji konfigurasi
    sudo systemctl restart nginx # Muat ulang Nginx
    ```

## Selesai!

Sekarang buka browser dan navigasikan ke `http://ALAMAT_IP_VPS_ANDA`. Anda akan melihat antarmuka AL ANSHOR LIVE STREAM, yang disajikan oleh Nginx dari aplikasi yang berjalan stabil di bawah `pm2`.

### Perintah PM2 yang Berguna

-   **Melihat status semua aplikasi**: `pm2 list`
-   **Melihat log aplikasi**: `pm2 logs alanshor-livestream-frontend`
-   **Me-restart aplikasi**: `pm2 restart alanshor-livestream-frontend`
-   **Menghentikan aplikasi**: `pm2 stop alanshor-livestream-frontend`
