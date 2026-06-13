const daftarSlotWaktu = [
    { mulai: "08:00", selesai: "09:00" }, { mulai: "09:00", selesai: "10:00" },
    { mulai: "10:00", selesai: "11:00" }, { mulai: "11:00", selesai: "12:00" },
    { mulai: "13:00", selesai: "14:00" }, { mulai: "14:00", selesai: "15:00" },
    { mulai: "15:00", selesai: "16:00" }, { mulai: "16:00", selesai: "17:00" }
];

let slotTerpilih = [];
const inputRuangan = document.getElementById('pilihan-ruangan');
const inputTanggal = document.getElementById('tanggal');
const waktuContainer = document.getElementById('waktu-container');
const jadwalGrid = document.getElementById('jadwal-grid');

const updateTabelWaktu = () => {
    const [ruangan, tanggal] = [inputRuangan.value, inputTanggal.value];

    if (!ruangan || !tanggal) return waktuContainer.classList.remove('aktif');

    jadwalGrid.innerHTML = "";
    slotTerpilih = [];
    waktuContainer.classList.add('aktif');

    const databaseReservasi = JSON.parse(localStorage.getItem("dataReservasi")) || [];

    daftarSlotWaktu.forEach((slot, index) => {
        const tombol = document.createElement("div");
        tombol.className = "slot-btn";
        tombol.innerText = slot.mulai;

        const isBooked = databaseReservasi.some(b => 
            b.kodeRuangan === ruangan && b.tanggal === tanggal && slot.mulai >= b.waktu && slot.mulai < b.waktuSelesai
        );

        if (isBooked) {
            tombol.classList.add("booked");
        } else {
            tombol.addEventListener("click", () => {
                const posisiDaftar = slotTerpilih.indexOf(index);

                if (posisiDaftar > -1) {
                    slotTerpilih = slotTerpilih.filter(i => i !== index);
                    tombol.classList.remove("selected");
                } else {
                    if (slotTerpilih.length > 0) {
                        const minIndex = Math.min(...slotTerpilih);
                        const maxIndex = Math.max(...slotTerpilih);
                        
                        if (index !== minIndex - 1 && index !== maxIndex + 1) {
                            alert("Silakan pilih slot waktu yang berurutan!");
                            return;
                        }
                    }
                    slotTerpilih.push(index);
                    slotTerpilih.sort((a, b) => a - b);
                    tombol.classList.add("selected");
                }
            });
        }
        jadwalGrid.appendChild(tombol);
    });
};

inputRuangan.addEventListener("change", updateTabelWaktu);
inputTanggal.addEventListener("change", updateTabelWaktu);

window.addEventListener("DOMContentLoaded", () => {
    const ruangParam = new URLSearchParams(window.location.search).get('ruang');
    if (ruangParam) {
        inputRuangan.value = ruangParam;
        updateTabelWaktu();
    }
});

document.getElementById('form-reservasi').addEventListener('submit', (e) => {
    e.preventDefault();

    if (slotTerpilih.length === 0) return alert("Silakan pilih minimal satu slot waktu!");

    const [nama, email, catatan] = ['nama', 'email', 'catatan'].map(id => document.getElementById(id).value);
    const ruanganText = inputRuangan.options[inputRuangan.selectedIndex].text;

    const slotAwal = daftarSlotWaktu[slotTerpilih[0]];
    const slotAkhir = daftarSlotWaktu[slotTerpilih[slotTerpilih.length - 1]];

    const dataBaru = {
        id: `RT-${Math.floor(1000 + Math.random() * 9000)}`,
        nama, email,
        kodeRuangan: inputRuangan.value,
        ruangan: ruanganText,
        tanggal: inputTanggal.value,
        waktu: slotAwal.mulai,
        waktuSelesai: slotAkhir.selesai,
        durasi: `${slotAwal.mulai} - ${slotAkhir.selesai}`,
        catatan: catatan || "-"
    };

    const databaseReservasi = JSON.parse(localStorage.getItem("dataReservasi")) || [];
    databaseReservasi.push(dataBaru);
    localStorage.setItem("dataReservasi", JSON.stringify(databaseReservasi));

    alert(`Reservasi Berhasil untuk ${dataBaru.ruangan} pada jam ${dataBaru.durasi}`);
    window.location.href = "riwayat.html";
});