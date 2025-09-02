# Panduan Instalasi AL ANSHOR LIVE STREAM di VPS

Panduan ini akan memandu Anda melalui proses instalasi dan deployment aplikasi AL ANSHOR LIVE STREAM di server VPS (Virtual Private Server), seperti Contabo, dan membuatnya dapat diakses melalui IP publik.

## Prasyarat

1.  **Server VPS**: Server yang menjalankan sistem operasi Linux (disarankan Ubuntu 22.04 atau lebih baru).
2.  **Akses Root**: Anda harus memiliki akses `root` atau pengguna dengan hak `sudo`.
3.  **IP Publik**: VPS Anda harus memiliki alamat IP publik yang statis.
4.  **Kunci API Google Gemini**: Anda memerlukan kunci API yang valid dari Google AI Studio untuk fitur AI, yang akan dimasukkan melalui UI aplikasi.

---

## Langkah 1: Persiapan Server Awal

Masuk ke VPS Anda melalui SSH:
```bash
ssh root@ALAMAT_IP_VPS_ANDA
```

Perbarui daftar paket dan tingkatkan paket yang ada:
```bash
sudo apt update && sudo apt upgrade -y
```

## Langkah 2: Instalasi Node.js dan Manajer Proses

Aplikasi ini berjalan di lingkungan Node.js. Kami akan menginstal Node.js dan PM2 (manajer proses untuk menjaga aplikasi tetap berjalan).

1.  **Instal Node.js (versi 18.x direkomendasikan)**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

2.  **Verifikasi Instalasi Node.js dan npm**:
    ```bash
    node -v
    npm -v
    ```
    Anda akan melihat versi yang terinstal.

3.  **Instal PM2 secara global**:
    ```bash
    sudo npm install pm2 -g
    ```

## Langkah 3: Dapatkan Kode Aplikasi

1.  **Instal Git** (jika belum terinstal):
    ```bash
    sudo apt install git -y
    ```

2.  **Clone Repositori Aplikasi** (gantilah URL dengan URL repo Anda yang sebenarnya):
    ```bash
    # Ganti dengan URL repositori Git Anda yang sebenarnya
    git clone https://github.com/placeholder/al-anshor-livestream.git
    ```

3.  **Masuk ke direktori aplikasi**:
    ```bash
    cd al-anshor-livestream
    ```

## Langkah 4: Menjalankan Aplikasi dengan PM2

Karena ini adalah aplikasi frontend statis (HTML, JS, CSS), kita perlu server web sederhana untuk menyajikannya. Kita akan menggunakan paket `serve`.

1.  **Instal `serve` secara global**:
    ```bash
    sudo npm install -g serve
    ```

2.  **Jalankan aplikasi menggunakan `pm2` dan `serve`**:
    Dari dalam direktori aplikasi Anda, jalankan perintah berikut:
    ```bash
    pm2 start serve -s . -l 3000 --name "al-anshor-frontend"
    ```
    Penjelasan:
    - `pm2 start serve`: Memulai `serve` dengan PM2.
    - `-s .`: Memberitahu `serve` untuk menyajikan konten dari direktori saat ini (`.`).
    - `-l 3000`: Menjalankan server di port 3000.
    - `--name "al-anshor-frontend"`: Memberi nama proses di PM2.

3.  **Simpan konfigurasi PM2** agar aplikasi otomatis berjalan setelah server reboot:
    ```bash
    pm2 save
    pm2 startup
    ```
    Ikuti instruksi yang ditampilkan di terminal untuk menyelesaikan setup startup.

Sekarang, aplikasi Anda seharusnya berjalan di `http://ALAMAT_IP_VPS_ANDA:3000`. Kunci API Gemini dapat dikonfigurasi melalui menu Pengaturan di dalam aplikasi.

---

## Langkah 5 (Opsional tapi Direkomendasikan): Konfigurasi Nginx sebagai Reverse Proxy

Agar aplikasi dapat diakses langsung melalui IP publik Anda (tanpa mengetik `:3000`), kita akan menggunakan Nginx sebagai reverse proxy.

1.  **Instal Nginx**:
    ```bash
    sudo apt install nginx -y
    ```

2.  **Buat file konfigurasi Nginx baru**:
    ```bash
    sudo nano /etc/nginx/sites-available/alanshor
    ```

3.  **Tempel konfigurasi berikut** ke dalam file. Ganti `ALAMAT_IP_VPS_ANDA` dengan IP publik Anda.
    ```nginx
    server {
        listen 80;
        listen [::]:80;

        server_name ALAMAT_IP_VPS_ANDA;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

4.  **Aktifkan konfigurasi** dengan membuat symbolic link:
    ```bash
    sudo ln -s /etc/nginx/sites-available/alanshor /etc/nginx/sites-enabled/
    ```

5.  **Hapus link default Nginx** (jika ada):
    ```bash
    sudo rm /etc/nginx/sites-enabled/default
    ```

6.  **Uji konfigurasi Nginx**:
    ```bash
    sudo nginx -t
    ```
    Jika outputnya `syntax is ok` dan `test is successful`, lanjutkan.

7.  **Restart Nginx**:
    ```bash
    sudo systemctl restart nginx
    ```

Sekarang, aplikasi Anda dapat diakses langsung melalui `http://ALAMAT_IP_VPS_ANDA`.