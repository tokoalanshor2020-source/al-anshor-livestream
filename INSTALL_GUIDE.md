# Panduan Instalasi AL ANSHOR LIVE STREAM di VPS (Diperbaiki)

Panduan ini telah diperbarui dengan proses build yang benar untuk aplikasi React/TypeScript. Mengikuti langkah-langkah ini akan mengatasi masalah layar kosong.

## Konsep Kunci: Proses Build

Aplikasi ini ditulis dalam TypeScript (TSX), yang tidak dapat dijalankan langsung oleh browser. Kita harus menggunakan "build tool" (seperti Vite) untuk mengkompilasi dan membundel kode sumber menjadi file HTML, JavaScript, dan CSS statis yang siap untuk produksi. Panduan ini menambahkan langkah build yang hilang tersebut.

---

## Langkah 1: Prasyarat

1.  **Server VPS**: Server yang menjalankan Ubuntu 22.04 atau lebih baru.
2.  **Akses Root/Sudo**: Hak akses administratif di server Anda.
3.  **Node.js dan npm**: Diperlukan untuk build process dan menjalankan server.
    - Jika belum terinstal, jalankan:
      ```bash
      curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
      sudo apt-get install -y nodejs
      ```

---

## Langkah 2: Dapatkan Kode Aplikasi dan Konfigurasi Proyek

1.  **Instal Git dan Clone Repositori**:
    ```bash
    sudo apt update && sudo apt install git -y
    # Ganti dengan URL repositori Git Anda
    git clone https://github.com/tokoalanshor2020-source/al-anshor-livestream.git
    cd al-anshor-livestream
    ```

2.  **Buat file `package.json`**:
    Ini adalah file paling penting yang mendefinisikan proyek, dependensi, dan skrip. Buat file bernama `package.json` di root proyek:
    ```bash
    nano package.json
    ```
    Tempel konten berikut ke dalam file:
    ```json
    {
      "name": "al-anshor-livestream",
      "private": true,
      "version": "0.0.0",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      },
      "dependencies": {
        "@google/genai": "^1.16.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      "devDependencies": {
        "@types/react": "^18.2.37",
        "@types/react-dom": "^18.2.15",
        "@vitejs/plugin-react": "^4.2.0",
        "typescript": "^5.2.2",
        "vite": "^5.0.0"
      }
    }
    ```

3.  **Buat file `vite.config.ts`**:
    Ini adalah file konfigurasi untuk build tool Vite. Buat file bernama `vite.config.ts`:
    ```bash
    nano vite.config.ts
    ```
    Tempel konten berikut:
    ```typescript
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
      server: {
        host: '0.0.0.0'
      }
    })
    ```
    
4.  **Buat file `tsconfig.json`**:
    File ini mengkonfigurasi bagaimana TypeScript mengkompilasi kode Anda. Buat file `tsconfig.json`:
    ```bash
    nano tsconfig.json
    ```
    Tempel konten berikut:
    ```json
    {
      "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "skipLibCheck": true,

        /* Bundler mode */
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",

        /* Linting */
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true
      },
      "include": ["."],
      "references": [{ "path": "./tsconfig.node.json" }]
    }
    ```

5.  **Buat file `tsconfig.node.json`**:
    ```bash
    nano tsconfig.node.json
    ```
    Tempel konten berikut:
    ```json
    {
      "compilerOptions": {
        "composite": true,
        "skipLibCheck": true,
        "module": "ESNext",
        "moduleResolution": "bundler",
        "allowSyntheticDefaultImports": true
      },
      "include": ["vite.config.ts"]
    }
    ```

---

## Langkah 3: Instal Dependensi dan Build Aplikasi

Sekarang setelah proyek dikonfigurasi dengan benar, kita dapat menginstal paket yang diperlukan dan membuat file produksi.

1.  **Instal semua dependensi** dari `package.json`:
    ```bash
    npm install
    ```

2.  **Jalankan proses build**:
    ```bash
    npm run build
    ```
    Perintah ini akan membuat direktori baru bernama `dist` yang berisi semua file HTML, JS, dan CSS yang telah dioptimalkan dan siap untuk disajikan.

---

## Langkah 4: Jalankan Aplikasi dengan PM2

Kita akan menyajikan konten dari folder `dist`, bukan dari root proyek.

1.  **Instal `serve` dan `pm2`** (jika belum):
    ```bash
    sudo npm install -g serve pm2
    ```

2.  **Jalankan aplikasi dari folder `dist`**:
    ```bash
    pm2 start serve -s dist -l 3000 --name "al-anshor-frontend"
    ```
    - `-s dist`: Memberitahu `serve` untuk menyajikan konten dari folder `dist`.

3.  **Simpan konfigurasi PM2** untuk restart otomatis:
    ```bash
    pm2 save
    pm2 startup
    ```
    Ikuti instruksi di terminal. Aplikasi Anda sekarang berjalan di `http://ALAMAT_IP_VPS_ANDA:3000`.

---

## Langkah 5 (Opsional): Konfigurasi Nginx sebagai Reverse Proxy

Langkah ini tetap sama dan akan membuat aplikasi Anda dapat diakses di port 80 (HTTP default).

1.  **Instal Nginx**: `sudo apt install nginx -y`
2.  **Buat file konfigurasi**: `sudo nano /etc/nginx/sites-available/alanshor`
3.  **Tempel konfigurasi berikut** (tidak ada perubahan dari sebelumnya):
    ```nginx
    server {
        listen 80;
        server_name ALAMAT_IP_VPS_ANDA; # Ganti dengan IP Anda

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
4.  **Aktifkan situs dan restart Nginx**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/alanshor /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    ```

Aplikasi Anda sekarang harus dapat diakses dan berjalan dengan benar di `http://ALAMAT_IP_VPS_ANDA`.