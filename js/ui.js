// Ambil elemen dari DOM
const selectJenis = document.getElementById('jenisTransaksi');
const fieldFreelance = document.getElementById('fieldFreelance'); // Div pembungkus khusus freelance
const inputHargaAwal = document.getElementById('hargaAwal');
const inputModal = document.getElementById('modal');
const inputDiskon = document.getElementById('diskon');
const inputCashback = document.getElementById('cashback');
const outputLaba = document.getElementById('laba');

// 1. Logika Tampil/Sembunyi Field Freelance
selectJenis.addEventListener('change', (e) => {
    if (e.target.value === 'Freelance') {
        fieldFreelance.style.display = 'block';
        // Bisa tambahkan required ke input di dalamnya jika perlu
    } else {
        fieldFreelance.style.display = 'none';
    }
});

// 2. Fungsi Hitung Laba Realtime
// Rumus: Laba = (Harga Awal - Modal - Diskon) + Cashback
function hitungLaba() {
    const hargaAwal = parseFloat(inputHargaAwal.value) || 0;
    const modal = parseFloat(inputModal.value) || 0;
    const diskon = parseFloat(inputDiskon.value) || 0;
    const cashback = parseFloat(inputCashback.value) || 0;

    const laba = (hargaAwal - modal - diskon) + cashback;
    
    outputLaba.value = laba; // Tampilkan ke input/teks
    
    // Opsional: Ubah warna teks jika rugi
    if(laba < 0) {
        outputLaba.style.color = 'red';
    } else {
        outputLaba.style.color = 'green';
    }
}

// Pasang event listener 'input' agar berubah secara realtime saat diketik
[inputHargaAwal, inputModal, inputDiskon, inputCashback].forEach(input => {
    input.addEventListener('input', hitungLaba);
});