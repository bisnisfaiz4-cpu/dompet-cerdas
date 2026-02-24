import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, getDoc, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

// ==========================================
// 1. PROTEKSI HALAMAN & LOGOUT
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "index.html";
    else document.getElementById('userEmail').textContent = user.email;
});

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try { await signOut(auth); } 
        catch (error) { alert("Gagal keluar."); }
    });
}

// ==========================================
// 2. LOGIKA BUKA/TUTUP MODAL & STATE EDIT
// ==========================================
const modal = document.getElementById("modalTransaksi");
const btnTambah = document.getElementById("btnTambahTransaksi");
const btnClose = document.querySelector(".close-modal");
const btnCancel = document.querySelector(".btn-cancel");
const btnSimpan = document.getElementById('btnSimpan');
const modalTitle = document.querySelector('.modal-header h2');

let isEditMode = false;
let editDocId = "";

if(btnTambah) {
    btnTambah.addEventListener("click", () => {
        isEditMode = false;
        editDocId = "";
        modalTitle.textContent = "Tambah Transaksi";
        btnSimpan.textContent = "Simpan Transaksi";
        
        // Set tanggal default ke hari ini
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('tanggalInput').value = today;
        
        modal.style.display = "flex";
    });
}

const closeModal = () => {
    modal.style.display = "none";
    document.getElementById("formTambahTransaksi").reset();
    document.getElementById("fieldFreelance").style.display = "none";
    document.getElementById("laba").value = "0";
    isEditMode = false;
    editDocId = "";
};

btnClose.addEventListener("click", closeModal);
btnCancel.addEventListener("click", closeModal);
window.addEventListener("click", (e) => { if (e.target == modal) closeModal(); });

// ==========================================
// 3. LOGIKA FORM DINAMIS & HITUNG LABA
// ==========================================
const selectJenis = document.getElementById('jenisTransaksi');
const fieldFreelance = document.getElementById('fieldFreelance');

selectJenis.addEventListener('change', (e) => {
    fieldFreelance.style.display = e.target.value === 'Freelance' ? 'block' : 'none';
});

const inputsKeuangan = ['hargaAwal', 'modal', 'diskon', 'cashback'];
inputsKeuangan.forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        const hargaAwal = parseFloat(document.getElementById('hargaAwal').value) || 0;
        const modalHarga = parseFloat(document.getElementById('modal').value) || 0;
        const diskon = parseFloat(document.getElementById('diskon').value) || 0;
        const cashback = parseFloat(document.getElementById('cashback').value) || 0;

        const laba = (hargaAwal - modalHarga - diskon) + cashback;
        const outputLaba = document.getElementById('laba');
        outputLaba.value = laba;
        outputLaba.style.color = laba < 0 ? '#ef4444' : '#047857';
    });
});

// ==========================================
// 4. SIMPAN / UPDATE DATA KE FIREBASE
// ==========================================
const formTambahTransaksi = document.getElementById('formTambahTransaksi');

formTambahTransaksi.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnSimpan.textContent = "Memproses...";
    btnSimpan.disabled = true;

    const jenis = document.getElementById('jenisTransaksi').value;
    const tglValue = document.getElementById('tanggalInput').value;
    const tanggalObj = new Date(tglValue);

    const dataTransaksi = {
        tanggal: Timestamp.fromDate(tanggalObj),
        jenis: jenis,
        nama: document.getElementById('namaPembeli').value,
        nomor_akun: document.getElementById('nomorAkun').value,
        keterangan: document.getElementById('keterangan').value,
        harga_awal: parseFloat(document.getElementById('hargaAwal').value) || 0,
        modal: parseFloat(document.getElementById('modal').value) || 0,
        diskon: parseFloat(document.getElementById('diskon').value) || 0,
        cashback: parseFloat(document.getElementById('cashback').value) || 0,
        omset: parseFloat(document.getElementById('hargaAwal').value) || 0,
        laba: parseFloat(document.getElementById('laba').value) || 0
    };

    if (jenis === 'Freelance') {
        dataTransaksi.sub_jenis = document.getElementById('subJenis').value;
        dataTransaksi.password_akun = document.getElementById('passwordAkun').value;
    } else {
        dataTransaksi.sub_jenis = "";
        dataTransaksi.password_akun = "";
    }

    try {
        if (isEditMode) {
            await updateDoc(doc(db, "transactions", editDocId), dataTransaksi);
            alert("Berhasil diperbarui!");
        } else {
            await addDoc(collection(db, "transactions"), dataTransaksi);
            alert("Berhasil disimpan!");
        }
        closeModal();
        loadTransaksi();
    } catch (error) {
        console.error(error);
        alert("Gagal memproses.");
    } finally {
        btnSimpan.textContent = "Simpan Transaksi";
        btnSimpan.disabled = false;
    }
});

// ==========================================
// 5. MENAMPILKAN DATA (URUT BERDASARKAN TANGGAL)
// ==========================================
const tabelTransaksi = document.getElementById('tabelTransaksi');
const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

async function loadTransaksi(startDate = null, endDate = null) {
    try {
        let q;
        const colRef = collection(db, "transactions");
        
        if (startDate && endDate) {
            q = query(colRef, where("tanggal", ">=", startDate), where("tanggal", "<=", endDate), orderBy("tanggal", "desc"));
        } else {
            q = query(colRef, orderBy("tanggal", "desc"));
        }

        const querySnapshot = await getDocs(q);
        tabelTransaksi.innerHTML = ""; 
        let tOmset = 0, tModal = 0, tLaba = 0, tCashback = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tOmset += data.omset || 0;
            tModal += data.modal || 0;
            tLaba += data.laba || 0;
            tCashback += data.cashback || 0;

            const tgl = data.tanggal ? data.tanggal.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${tgl}</td>
                <td>${data.jenis} <br><small style="color:gray">${data.sub_jenis || ''}</small></td>
                <td>${data.nama}</td>
                <td>${data.nomor_akun}</td>
                <td>${formatRupiah(data.omset)}</td>
                <td style="color: ${data.laba >= 0 ? '#047857' : '#ef4444'}; font-weight: bold;">${formatRupiah(data.laba)}</td>
                <td>
                    <button class="btn-action btn-edit" data-id="${doc.id}">Edit</button>
                    <button class="btn-action btn-delete" data-id="${doc.id}">Hapus</button>
                </td>
            `;
            tabelTransaksi.appendChild(tr);
        });

        document.getElementById('cardOmset').textContent = formatRupiah(tOmset);
        document.getElementById('cardModal').textContent = formatRupiah(tModal);
        document.getElementById('cardLaba').textContent = formatRupiah(tLaba);
        document.getElementById('cardCashback').textContent = formatRupiah(tCashback);

        if(querySnapshot.empty) tabelTransaksi.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Tidak ada data di periode ini.</td></tr>";
    } catch (error) { 
        console.error("Gagal memuat data:", error); 
    }
}

loadTransaksi();

// ==========================================
// 6. ACTION HAPUS & EDIT
// ==========================================
tabelTransaksi.addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    if (e.target.classList.contains('btn-delete')) {
        if (confirm("Hapus transaksi ini?")) {
            try {
                await deleteDoc(doc(db, "transactions", id));
                loadTransaksi();
            } catch (error) { alert("Gagal menghapus."); }
        }
    }
    
    if (e.target.classList.contains('btn-edit')) {
        try {
            const docSnap = await getDoc(doc(db, "transactions", id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                isEditMode = true;
                editDocId = id;
                
                if (data.tanggal) {
                    const date = data.tanggal.toDate();
                    document.getElementById('tanggalInput').value = date.toISOString().split('T')[0];
                }

                document.getElementById('jenisTransaksi').value = data.jenis;
                document.getElementById('jenisTransaksi').dispatchEvent(new Event('change'));
                
                if(data.jenis === 'Freelance') {
                    document.getElementById('subJenis').value = data.sub_jenis || '';
                    document.getElementById('passwordAkun').value = data.password_akun || '';
                }

                document.getElementById('namaPembeli').value = data.nama || '';
                document.getElementById('nomorAkun').value = data.nomor_akun || '';
                document.getElementById('keterangan').value = data.keterangan || '';
                document.getElementById('hargaAwal').value = data.harga_awal || 0;
                document.getElementById('modal').value = data.modal || 0;
                document.getElementById('diskon').value = data.diskon || 0;
                document.getElementById('cashback').value = data.cashback || 0;
                
                const eventInput = new Event('input');
                document.getElementById('hargaAwal').dispatchEvent(eventInput);
                
                modalTitle.textContent = "Edit Transaksi";
                btnSimpan.textContent = "Update Transaksi";
                modal.style.display = "flex";
            }
        } catch (error) { alert("Gagal mengambil data."); }
    }
});

// ==========================================
// 7. FILTER PERIODE
// ==========================================
document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const filter = e.target.textContent.trim();
        const now = new Date();
        let s, d;

        if (filter === 'Hari Ini') {
            s = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        } else if (filter === 'Minggu Ini') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
            s = new Date(now.setDate(diff)); s.setHours(0,0,0,0);
            d = new Date(s); d.setDate(s.getDate() + 6); d.setHours(23,59,59,999);
        } else if (filter === 'Bulan Ini') {
            s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            d = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        } else if (filter === 'Custom') {
            const tglMulai = prompt("Masukkan tanggal MULAI (YYYY-MM-DD):");
            const tglAkhir = prompt("Masukkan tanggal AKHIR (YYYY-MM-DD):");
            if(tglMulai && tglAkhir) {
                s = new Date(tglMulai + "T00:00:00");
                d = new Date(tglAkhir + "T23:59:59");
            } else { loadTransaksi(); return; }
        } else {
            loadTransaksi(); return;
        }
        loadTransaksi(Timestamp.fromDate(s), Timestamp.fromDate(d));
    });
});