import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";
import { db } from './firebase-config.js'; // Asumsi db sudah di-export

async function simpanTransaksi(event) {
    event.preventDefault();

    const jenis = document.getElementById('jenisTransaksi').value;
    
    // Siapkan object data
    const transactionData = {
        tanggal: serverTimestamp(), // Gunakan timestamp server agar akurat
        jenis: jenis,
        sub_jenis: document.getElementById('subJenis').value,
        nama: document.getElementById('namaPembeli').value,
        nomor_akun: document.getElementById('nomorAkun').value,
        keterangan: document.getElementById('keterangan').value,
        harga_awal: parseFloat(document.getElementById('hargaAwal').value) || 0,
        modal: parseFloat(document.getElementById('modal').value) || 0,
        cashback: parseFloat(document.getElementById('cashback').value) || 0,
        diskon: parseFloat(document.getElementById('diskon').value) || 0,
        omset: parseFloat(document.getElementById('hargaAwal').value) || 0, // Sesuai requirement
        laba: parseFloat(document.getElementById('laba').value) || 0
    };

    // Tambahkan field khusus jika jenisnya Freelance
    if (jenis === 'Freelance') {
        transactionData.password_akun = document.getElementById('passwordAkun').value;
    }

    try {
        const docRef = await addDoc(collection(db, "transactions"), transactionData);
        alert("Transaksi berhasil disimpan!");
        // Tutup modal dan reset form di sini
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Gagal menyimpan transaksi.");
    }
}

document.getElementById('formTambahTransaksi').addEventListener('submit', simpanTransaksi);