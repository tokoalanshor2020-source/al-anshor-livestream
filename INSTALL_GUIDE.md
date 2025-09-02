# Panduan Deployment AL ANSHOR LIVE STREAM di VPS

Panduan ini dirancang untuk mendeploy antarmuka (frontend) aplikasi ini di server Anda menggunakan metode modern yang andal dan ringan, sesuai untuk lingkungan VPS.

---

## 1. Arsitektur Proyek: Frontend vs. Backend (Penting!)

Repositori ini hanya berisi **Frontend** (panel kontrol web). Ini adalah antarmuka pengguna grafis (GUI) tempat Anda mengelola streaming secara visual.

-   **Frontend (Kode ini):** Sebuah aplikasi React yang berjalan di browser pengguna. Tugasnya adalah mengirim perintah ke backend Anda.
-   **Backend (Tanggung Jawab Anda):** Ini adalah "mesin" yang berjalan di VPS Anda, yang harus Anda bangun secara terpisah. Backend akan menerima perintah dari Frontend (misalnya, melalui API) dan melakukan pekerjaan berat:
    -   Menjalankan `ffmpeg` untuk memproses dan menyiarkan video.
    -   Menggunakan `tmux` untuk menjaga proses streaming tetap berjalan di latar belakang.
    -   Semua ini idealnya juga dikelola dalam kontainer **Docker** terpisah untuk backend.

Panduan ini akan fokus pada cara menjalankan **Frontend** dengan benar dan efisien di VPS Anda.

---

## 2. Metode Deployment: Docker (Sangat Direkomendasikan)

Ini adalah cara terbaik dan termudah. Docker mengisolasi aplikasi Anda, memastikannya berjalan secara konsisten, aman, dan tidak mengganggu layanan lain di server.

### Prasyarat

Anda perlu menginstal Docker dan Docker Compose di VPS Anda. Jika belum terinstal, jalankan perintah berikut:

```bash
# Perbarui daftar paket Anda
sudo apt update

# Instal paket yang diperlukan untuk mengizinkan apt menggunakan repositori melalui HTTPS
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Tambahkan GPG key resmi Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Tambahkan repositori Docker ke sumber APT
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instal Docker Engine dan Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```
Verifikasi instalasi dengan menjalankan: `sudo docker --version` dan `docker compose version`.

### Langkah-langkah Deployment

1.  **Salin Semua File Aplikasi**:
    Pastikan semua file dari repositori ini (termasuk `Dockerfile`, `docker-compose.yml`, dan `nginx.conf` yang baru) berada dalam satu folder di VPS Anda, misalnya di `/home/user/alanshor-livestream`.

2.  **Jalankan Aplikasi dengan Docker Compose**:
    Masuk ke direktori aplikasi Anda, lalu jalankan satu perintah ini. Perintah ini akan membangun gambar Docker, membuat kontainer, dan menjalankannya di latar belakang.
    ```bash
    cd /home/user/alanshor-livestream
    docker compose up -d
    ```
    - `-d` berarti *detached*, jadi proses berjalan permanen di latar belakang.

Aplikasi Anda sekarang berjalan di dalam kontainer Docker pada port **3000**. Anda bisa memeriksanya dengan perintah `docker ps`.

---

## 3. Konfigurasi Nginx sebagai Reverse Proxy (Akses Publik)

Langkah ini sangat penting agar Anda dapat mengakses aplikasi melalui alamat IP publik VPS Anda (atau nama domain) tanpa perlu mengetik `:3000` di akhir URL.

1.  **Instal Nginx** (jika belum terinstal):
    ```bash
    sudo apt update && sudo apt install nginx -y
    ```

2.  **Buat file konfigurasi Nginx baru**:
    ```bash
    sudo nano /etc/nginx/sites-available/alanshor-livestream
    ```

3.  **Tempel konfigurasi berikut ke dalam file**:
    Ganti `ALAMAT_IP_VPS_ANDA` dengan IP publik VPS Anda atau domain yang Anda miliki.

    ```nginx
    server {
        # Nginx akan mendengarkan di port 80 (HTTP standar)
        listen 80;
        server_name ALAMAT_IP_VPS_ANDA; # Ganti dengan IP atau domain Anda

        # Semua permintaan akan diteruskan ke aplikasi frontend
        location / {
            # Arahkan lalu lintas ke aplikasi yang berjalan di port 3000
            # (port yang diekspos oleh kontainer Docker kita)
            proxy_pass http://127.0.0.1:3000;
            
            # Header penting untuk memastikan komunikasi yang benar
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
    ```

4.  **Aktifkan Konfigurasi**:
    ```bash
    # Buat tautan simbolis dari sites-available ke sites-enabled
    sudo ln -s /etc/nginx/sites-available/alanshor-livestream /etc/nginx/sites-enabled/
    
    # Hapus konfigurasi default Nginx agar tidak bentrok (jika ada)
    sudo rm /etc/nginx/sites-enabled/default
    
    # Uji konfigurasi Nginx untuk memastikan tidak ada kesalahan
    sudo nginx -t
    
    # Jika pengujian berhasil, muat ulang Nginx untuk menerapkan perubahan
    sudo systemctl restart nginx
    ```

## Selesai!

Sekarang Anda dapat membuka browser web dan menavigasi ke `http://ALAMAT_IP_VPS_ANDA`. Anda akan melihat antarmuka AL ANSHOR LIVE STREAM, yang disajikan dengan aman dan efisien oleh Nginx dari dalam kontainer Docker yang ringan.