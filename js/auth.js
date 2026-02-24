import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { auth } from './firebase-config.js';

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const loginBtn = document.getElementById('loginBtn');

// Cek jika user sudah login, langsung lempar ke dashboard
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

// Proses Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah form reload halaman
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Ubah teks tombol jadi loading
    loginBtn.textContent = "Memproses...";
    loginBtn.disabled = true;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Login berhasil, onAuthStateChanged di atas akan otomatis memindahkan ke dashboard.html
    } catch (error) {
        // Tangani error (password salah, email tidak ada, dll)
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-credential') {
            errorMsg.textContent = "Email atau Password salah!";
        } else if (errorCode === 'auth/too-many-requests') {
            errorMsg.textContent = "Terlalu banyak percobaan. Coba lagi nanti.";
        } else {
            errorMsg.textContent = "Gagal login. Periksa koneksi Anda.";
        }
        
        // Kembalikan tombol seperti semula
        loginBtn.textContent = "Masuk Dashboard";
        loginBtn.disabled = false;
    }
});