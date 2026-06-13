/* =========================================================
         FIGURAL SVG HELPERS
      ========================================================= */
function shapePoints(shape, size) {
    const c = 50, s = size / 2;
    switch (shape) {
        case 'square': return `${c - s},${c - s} ${c + s},${c - s} ${c + s},${c + s} ${c - s},${c + s}`;
        case 'triangle': return `${c},${c - s} ${c + s},${c + s} ${c - s},${c + s}`;
        case 'arrow': return `${c - s},${c - s * 0.4} ${c + s * 0.2},${c - s * 0.4} ${c + s * 0.2},${c - s} ${c + s},${c} ${c + s * 0.2},${c + s} ${c + s * 0.2},${c + s * 0.4} ${c - s},${c + s * 0.4}`;
        case 'pentagon': {
            let pts = [];
            for (let k = 0; k < 5; k++) {
                const ang = -Math.PI / 2 + k * 2 * Math.PI / 5;
                pts.push((c + s * Math.cos(ang)).toFixed(1) + ',' + (c + s * Math.sin(ang)).toFixed(1));
            }
            return pts.join(' ');
        }
        case 'star': {
            let pts = [];
            for (let k = 0; k < 10; k++) {
                const r = k % 2 === 0 ? s : s * 0.45;
                const ang = -Math.PI / 2 + k * Math.PI / 5;
                pts.push((c + r * Math.cos(ang)).toFixed(1) + ',' + (c + r * Math.sin(ang)).toFixed(1));
            }
            return pts.join(' ');
        }
        case 'L': {
            return `${c - s},${c - s} ${c - s * 0.2},${c - s} ${c - s * 0.2},${c + s * 0.2} ${c + s},${c + s * 0.2} ${c + s},${c + s} ${c - s},${c + s}`;
        }
    }
    return '';
}
function svgFigure(shape, rot, color, size = 44, dim = 90, mirror = false) {
    let body;
    if (shape === 'circle') {
        body = `<circle cx="50" cy="50" r="${size / 2}" fill="${color}"/>`;
    } else {
        body = `<polygon points="${shapePoints(shape, size)}" fill="${color}"/>`;
    }
    const scaleX = mirror ? -1 : 1;
    return `<svg viewBox="0 0 100 100" width="${dim}" height="${dim}"><g transform="rotate(${rot} 50 50) scale(${scaleX},1) translate(${mirror ? -100 : 0},0)">${body}</g></svg>`;
}
function svgGrid(cells, dim = 160) {
    // cells: array of 9 {shape,rot,color,empty}
    let html = `<svg viewBox="0 0 180 180" width="${dim}" height="${dim}">`;
    html += `<rect x="0" y="0" width="180" height="180" fill="none" stroke="#2A2E3A" stroke-width="2"/>`;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const idx = r * 3 + c;
            const cell = cells[idx];
            const x = c * 60, y = r * 60;
            html += `<rect x="${x}" y="${y}" width="60" height="60" fill="none" stroke="#2A2E3A" stroke-width="1"/>`;
            if (cell.empty) {
                html += `<text x="${x + 30}" y="${y + 38}" font-size="28" fill="#9CA3AF" text-anchor="middle" font-weight="700">?</text>`;
            } else {
                const body = cell.shape === 'circle' ? `<circle cx="0" cy="0" r="${cell.size / 2}" fill="${cell.color}"/>` : `<polygon points="${shapePointsZero(cell.shape, cell.size)}" fill="${cell.color}"/>`;
                html += `<g transform="translate(${x + 30},${y + 30}) rotate(${cell.rot})">${body}</g>`;
            }
        }
    }
    html += `</svg>`;
    return html;
}
function shapePointsZero(shape, size) {
    const s = size / 2;
    switch (shape) {
        case 'square': return `${-s},${-s} ${s},${-s} ${s},${s} ${-s},${s}`;
        case 'triangle': return `0,${-s} ${s},${s} ${-s},${s}`;
        case 'pentagon': {
            let pts = [];
            for (let k = 0; k < 5; k++) {
                const ang = -Math.PI / 2 + k * 2 * Math.PI / 5;
                pts.push((s * Math.cos(ang)).toFixed(1) + ',' + (s * Math.sin(ang)).toFixed(1));
            }
            return pts.join(' ');
        }
        case 'star': {
            let pts = [];
            for (let k = 0; k < 10; k++) {
                const r = k % 2 === 0 ? s : s * 0.45;
                const ang = -Math.PI / 2 + k * Math.PI / 5;
                pts.push((r * Math.cos(ang)).toFixed(1) + ',' + (r * Math.sin(ang)).toFixed(1));
            }
            return pts.join(' ');
        }
    }
    return '';
}
const COLORS = ['#22C55E', '#3B82F6', '#FACC15', '#EF4444', '#A855F7', '#F97316'];
const SHAPES = ['square', 'triangle', 'circle', 'pentagon', 'star'];

/* generic option wrapper for figural */
function figOpt(svg) { return `<span class="fig-box">${svg}</span>`; }
/* =========================================================
         QUESTION GENERATORS
      ========================================================= */

// ---------- helper to rotate array (deterministic shuffle) ----------
function rotateArr(arr, n) {
    const k = ((n % arr.length) + arr.length) % arr.length;
    return arr.slice(k).concat(arr.slice(0, k));
}
function difficulty(i, total) {
    const r = i / total;
    if (r < 0.2) return 'Mudah';
    if (r < 0.7) return 'Sedang';
    return 'Sulit';
}
/* ---------------- NUMERIK (60) ---------------- */
function genNumerik() {
    const qs = [];
    let n = 0;

    // 1) Deret angka (10) - arithmetic & geometric sequences
    for (let i = 0; i < 10; i++) {
        let seq, answer, expl;
        if (i % 2 === 0) {
            const start = 2 + i, diff = 3 + (i % 4);
            seq = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff];
            answer = start + 5 * diff;
            expl = `Deret aritmetika dengan beda tetap +${diff}. Suku terakhir ${seq[4]} + ${diff} = ${answer}.`;
        } else {
            const start = 2 + (i % 3), ratio = 2;
            seq = [start, start * ratio, start * ratio * ratio, start * Math.pow(ratio, 3), start * Math.pow(ratio, 4)];
            answer = start * Math.pow(ratio, 5);
            expl = `Deret geometri dengan rasio x${ratio}. Suku terakhir ${seq[4]} x ${ratio} = ${answer}.`;
        }
        const opts = rotateArr([answer, answer + (i + 1), answer - (i + 2), answer + (2 * i + 3)], i % 4);
        qs.push(mkQ('numerik', 'Deret Angka', `Lanjutan dari deret berikut adalah...\n${seq.join(', ')}, ...?`, opts.map(String), opts.indexOf(answer), expl, difficulty(n++, 60)));
    }

    // 2) Aritmetika (8)
    for (let i = 0; i < 8; i++) {
        const harga = 12000 + i * 1500;
        const jumlah = 4 + (i % 5);
        const bayar = harga * jumlah;
        const kembali = (50000 + i * 1000) - bayar;
        const opts = rotateArr([kembali, kembali + 1000, kembali - 1000, kembali + 2000], i % 4);
        qs.push(mkQ('numerik', 'Aritmetika', `Andi membeli ${jumlah} buku dengan harga Rp${harga.toLocaleString('id-ID')} per buku. Ia membayar dengan uang Rp${(50000 + i * 1000).toLocaleString('id-ID')}. Berapa uang kembalian Andi?`,
            opts.map(v => 'Rp' + v.toLocaleString('id-ID')), opts.indexOf(kembali),
            `Total harga = ${jumlah} x Rp${harga.toLocaleString('id-ID')} = Rp${bayar.toLocaleString('id-ID')}. Kembalian = Rp${(50000 + i * 1000).toLocaleString('id-ID')} - Rp${bayar.toLocaleString('id-ID')} = Rp${kembali.toLocaleString('id-ID')}.`, difficulty(n++, 60)));
    }

    // 3) Persentase (8)
    for (let i = 0; i < 8; i++) {
        const harga = 80000 + i * 10000;
        const diskon = 10 + (i % 4) * 5;
        const potongan = harga * diskon / 100;
        const hargaAkhir = harga - potongan;
        const opts = rotateArr([hargaAkhir, hargaAkhir + 5000, hargaAkhir - 5000, hargaAkhir + 10000], i % 4);
        qs.push(mkQ('numerik', 'Persentase', `Sebuah baju berharga Rp${harga.toLocaleString('id-ID')} mendapat diskon ${diskon}%. Berapa harga baju setelah diskon?`,
            opts.map(v => 'Rp' + v.toLocaleString('id-ID')), opts.indexOf(hargaAkhir),
            `Diskon = ${diskon}% x Rp${harga.toLocaleString('id-ID')} = Rp${potongan.toLocaleString('id-ID')}. Harga akhir = Rp${harga.toLocaleString('id-ID')} - Rp${potongan.toLocaleString('id-ID')} = Rp${hargaAkhir.toLocaleString('id-ID')}.`, difficulty(n++, 60)));
    }

    // 4) Perbandingan (8)
    for (let i = 0; i < 8; i++) {
        const m = 2 + (i % 4), k = 3 + (i % 5);
        const total = (m + k) * (10 + i);
        const bagianA = total * m / (m + k);
        const opts = rotateArr([bagianA, bagianA + 10, bagianA - 10, bagianA + 20], i % 4);
        qs.push(mkQ('numerik', 'Perbandingan', `Uang Andi dan Budi memiliki perbandingan ${m}:${k}. Jika jumlah uang mereka adalah Rp${(total * 1000).toLocaleString('id-ID')}, berapa jumlah uang Andi?`,
            opts.map(v => 'Rp' + (v * 1000).toLocaleString('id-ID')), opts.indexOf(bagianA),
            `Bagian Andi = ${m}/(${m}+${k}) x Rp${(total * 1000).toLocaleString('id-ID')} = Rp${(bagianA * 1000).toLocaleString('id-ID')}.`, difficulty(n++, 60)));
    }

    // 5) Kecepatan, jarak, waktu (8)
    for (let i = 0; i < 8; i++) {
        const jarak = 90 + i * 15;
        const waktu = 2 + (i % 3);
        const kecepatan = jarak / waktu;
        const opts = rotateArr([kecepatan, kecepatan + 5, kecepatan - 5, kecepatan + 10], i % 4);
        qs.push(mkQ('numerik', 'Kecepatan, Jarak, Waktu', `Sebuah mobil menempuh jarak ${jarak} km dalam waktu ${waktu} jam. Berapa kecepatan rata-rata mobil tersebut?`,
            opts.map(v => v + ' km/jam'), opts.indexOf(kecepatan),
            `Kecepatan = Jarak / Waktu = ${jarak} km / ${waktu} jam = ${kecepatan} km/jam.`, difficulty(n++, 60)));
    }

    // 6) Aljabar dasar (9)
    for (let i = 0; i < 9; i++) {
        const a = 2 + (i % 4), b = 5 + i, c = 3 * a + b + (i % 3); // 3x + b = c  -> solve for x where coefficient = a... we'll design: a*x + b = c
        const x = (c - b) / a;
        const opts = rotateArr([x, x + 1, x - 1, x + 2], i % 4);
        qs.push(mkQ('numerik', 'Aljabar Dasar', `Jika ${a}x + ${b} = ${c}, maka nilai x adalah...?`,
            opts.map(String), opts.indexOf(x),
            `${a}x + ${b} = ${c}  →  ${a}x = ${c} - ${b} = ${c - b}  →  x = ${c - b} / ${a} = ${x}.`, difficulty(n++, 60)));
    }

    // 7) Logika angka (9)
    for (let i = 0; i < 9; i++) {
        const a = 4 + i, b = 2 + (i % 3);
        const result = a * a - b * b;
        const opts = rotateArr([result, result + 2, result - 2, result + 4], i % 4);
        qs.push(mkQ('numerik', 'Logika Angka', `Jika a = ${a} dan b = ${b}, berapakah nilai dari a² - b²?`,
            opts.map(String), opts.indexOf(result),
            `a² - b² = ${a}² - ${b}² = ${a * a} - ${b * b} = ${result}.`, difficulty(n++, 60)));
    }

    return qs;
}

/* ---------------- VERBAL (60) ---------------- */
function genVerbal() {
    const qs = [];
    let n = 0;
    const distractorPool = ['Meja', 'Lemari', 'Gelas', 'Pohon', 'Awan', 'Sepatu', 'Jalan', 'Kursi', 'Lampu', 'Pintu', 'Batu', 'Sungai', 'Burung', 'Pasir', 'Kertas', 'Topi', 'Cermin', 'Layar', 'Roda', 'Piring'];

    function buildChoice(correct, idx) {
        const ds = [];
        for (let k = 0; k < 3; k++) { ds.push(distractorPool[(idx * 3 + k + 7) % distractorPool.length]); }
        const opts = rotateArr([correct, ...ds], idx % 4);
        return { opts, answer: opts.indexOf(correct) };
    }

    // Sinonim (10)
    const sinonim = [
        ['Pandai', 'Cerdas'], ['Bahagia', 'Gembira'], ['Cepat', 'Lekas'], ['Indah', 'Elok'],
        ['Mulai', 'Awal'], ['Agung', 'Mulia'], ['Kuat', 'Tegar'], ['Diam', 'Bisu'],
        ['Lambat', 'Pelan'], ['Murah', 'Terjangkau']
    ];
    sinonim.forEach(([word, syn], i) => {
        const { opts, answer } = buildChoice(syn, i);
        qs.push(mkQ('verbal', 'Sinonim', `Sinonim dari kata "${word}" adalah...?`, opts, answer,
            `"${word}" memiliki arti yang sama atau hampir sama dengan "${syn}".`, difficulty(n++, 60)));
    });

    // Antonim (10)
    const antonim = [
        ['Panas', 'Dingin'], ['Tinggi', 'Rendah'], ['Cepat', 'Lambat'], ['Gelap', 'Terang'],
        ['Kaya', 'Miskin'], ['Tertawa', 'Menangis'], ['Maju', 'Mundur'], ['Buka', 'Tutup'],
        ['Lebar', 'Sempit'], ['Baru', 'Lama']
    ];
    antonim.forEach(([word, ant], i) => {
        const { opts, answer } = buildChoice(ant, i + 5);
        qs.push(mkQ('verbal', 'Antonim', `Antonim (lawan kata) dari kata "${word}" adalah...?`, opts, answer,
            `"${word}" berlawanan makna dengan "${ant}".`, difficulty(n++, 60)));
    });

    // Analogi (10)
    const analogi = [
        ['Dokter', 'Pasien', 'Guru', 'Murid', 'Hubungan pemberi layanan dan penerima layanan.'],
        ['Pena', 'Menulis', 'Pisau', 'Memotong', 'Alat dan fungsinya.'],
        ['Ikan', 'Air', 'Burung', 'Udara', 'Makhluk hidup dan habitatnya.'],
        ['Buku', 'Perpustakaan', 'Baju', 'Lemari', 'Benda dan tempat penyimpanannya.'],
        ['Petani', 'Sawah', 'Nelayan', 'Laut', 'Profesi dan tempat kerjanya.'],
        ['Roda', 'Mobil', 'Sayap', 'Pesawat', 'Bagian dan keseluruhan alat transportasi.'],
        ['Gula', 'Manis', 'Cabai', 'Pedas', 'Benda dan rasa yang dihasilkannya.'],
        ['Jam', 'Waktu', 'Termometer', 'Suhu', 'Alat ukur dan yang diukurnya.'],
        ['Awan', 'Hujan', 'Api', 'Asap', 'Sebab dan akibat yang dihasilkannya.'],
        ['Telur', 'Ayam', 'Biji', 'Pohon', 'Bentuk awal dan bentuk dewasa suatu makhluk.']
    ];
    analogi.forEach(([a, b, c, d, expl], i) => {
        const { opts, answer } = buildChoice(d, i + 1);
        qs.push(mkQ('verbal', 'Analogi', `${a} : ${b} = ${c} : ...?`, opts, answer, expl, difficulty(n++, 60)));
    });

    // Hubungan kata (10)
    const hubungan = [
        ['Api', 'Panas', 'Hubungan benda dengan sifat yang ditimbulkannya.'],
        ['Es', 'Dingin', 'Hubungan benda dengan sifat yang ditimbulkannya.'],
        ['Matahari', 'Siang', 'Matahari identik dengan waktu siang.'],
        ['Bulan', 'Malam', 'Bulan identik dengan waktu malam.'],
        ['Dokter', 'Stetoskop', 'Profesi dengan alat yang digunakannya.'],
        ['Guru', 'Papan tulis', 'Profesi dengan alat yang digunakannya.'],
        ['Singa', 'Hutan', 'Hewan dengan habitat aslinya.'],
        ['Paus', 'Laut', 'Hewan dengan habitat aslinya.'],
        ['Padi', 'Sawah', 'Tanaman dengan tempat tumbuhnya.'],
        ['Anggur', 'Kebun', 'Tanaman dengan tempat tumbuhnya.']
    ];
    const hubunganPairs = [
        ['Air', 'dingin atau cair'], ['Salju', 'dingin atau putih'], ['Pagi', 'terbit'], ['Bintang', 'gelap'],
        ['Perawat', 'jarum suntik'], ['Murid', 'buku tulis'], ['Kebun', 'pohon'], ['Gurun', 'pasir'],
        ['Ladang', 'jagung'], ['Rumah', 'tanaman hias']
    ];
    hubungan.forEach(([w1, w2, expl], i) => {
        const distractors = [hubunganPairs[i][0], hubunganPairs[(i + 1) % 10][0], hubunganPairs[(i + 2) % 10][0]];
        const opts = rotateArr([w2, ...distractors], i + 2);
        qs.push(mkQ('verbal', 'Hubungan Kata', `Kata "${w1}" memiliki hubungan paling erat dengan kata...?`, opts, opts.indexOf(w2), expl, difficulty(n++, 60)));
    });

    // Makna istilah (10)
    const istilah = [
        ['Empati', 'Kemampuan merasakan dan memahami perasaan orang lain', ['Sikap acuh terhadap orang lain', 'Kemampuan menghitung dengan cepat', 'Sikap menonjolkan diri sendiri']],
        ['Konsisten', 'Tetap dan tidak berubah-ubah dalam bertindak', ['Selalu berubah sesuai keadaan', 'Cepat dalam mengambil keputusan', 'Mudah dipengaruhi orang lain']],
        ['Objektif', 'Berdasarkan kenyataan tanpa dipengaruhi pendapat pribadi', ['Berdasarkan perasaan pribadi semata', 'Selalu memihak satu pihak', 'Sulit dipahami orang lain']],
        ['Asumsi', 'Anggapan dasar yang dianggap benar tanpa pembuktian', ['Kesimpulan akhir yang sudah terbukti', 'Data hasil penelitian lapangan', 'Pertanyaan yang belum terjawab']],
        ['Kontradiksi', 'Pernyataan yang saling bertentangan', ['Pernyataan yang saling mendukung', 'Penjelasan tambahan suatu topik', 'Ringkasan dari banyak data']],
        ['Relevan', 'Berkaitan langsung dan sesuai dengan topik', ['Tidak berkaitan dengan topik', 'Sudah ketinggalan zaman', 'Bersifat rahasia']],
        ['Efisien', 'Mencapai hasil maksimal dengan usaha seminimal mungkin', ['Menghabiskan banyak sumber daya', 'Membutuhkan waktu yang sangat lama', 'Hasilnya selalu sempurna']],
        ['Skeptis', 'Bersikap ragu dan tidak mudah percaya', ['Mudah percaya tanpa bukti', 'Selalu optimis terhadap segala hal', 'Bersikap pasrah terhadap keadaan']],
        ['Inisiatif', 'Kemampuan bertindak lebih dulu tanpa diminta', ['Kemampuan menunggu perintah', 'Kemampuan mengikuti aturan ketat', 'Kemampuan menolak tugas baru']],
        ['Toleransi', 'Sikap menghargai perbedaan pendapat atau keyakinan', ['Sikap memaksakan pendapat sendiri', 'Sikap mengabaikan orang lain', 'Sikap selalu setuju dengan atasan']]
    ];
    istilah.forEach(([word, def, wrong], i) => {
        const opts = rotateArr([def, ...wrong], i + 3);
        qs.push(mkQ('verbal', 'Makna Istilah', `Makna dari istilah "${word}" yang paling tepat adalah...?`, opts, opts.indexOf(def),
            `Istilah "${word}" berarti ${def.toLowerCase()}.`, difficulty(n++, 60)));
    });

    // Pemahaman bacaan (10) - 2 short paragraphs x 5 questions
    const paragraf1 = `Pertumbuhan ekonomi suatu negara sangat dipengaruhi oleh tingkat pendidikan masyarakatnya. Negara yang memiliki tingkat literasi tinggi cenderung memiliki tenaga kerja yang lebih produktif. Selain itu, investasi dalam bidang pendidikan juga mendorong inovasi dan perkembangan teknologi. Oleh karena itu, banyak negara berkembang mulai memprioritaskan anggaran pendidikan sebagai bagian dari strategi pembangunan jangka panjang.`;
    const paragraf2 = `Perubahan iklim menjadi salah satu isu global yang mendesak untuk ditangani. Peningkatan suhu rata-rata bumi menyebabkan es di kutub mencair lebih cepat, yang berdampak pada kenaikan permukaan air laut. Banyak negara kepulauan menghadapi risiko tenggelamnya wilayah pesisir. Para ilmuwan menyarankan pengurangan emisi karbon sebagai langkah utama untuk memperlambat dampak perubahan iklim tersebut.`;

    const bacaan1 = [
        ['Apa yang menjadi gagasan utama paragraf di atas?', 'Hubungan antara pendidikan dan pertumbuhan ekonomi', ['Sejarah pendidikan dunia', 'Daftar negara maju', 'Cara meningkatkan literasi anak'], 'Paragraf membahas keterkaitan tingkat pendidikan dengan pertumbuhan ekonomi suatu negara.'],
        ['Menurut paragraf, apa dampak literasi tinggi terhadap tenaga kerja?', 'Tenaga kerja menjadi lebih produktif', ['Tenaga kerja menjadi lebih sedikit', 'Tenaga kerja beralih ke sektor pertanian', 'Tenaga kerja menuntut gaji lebih rendah'], 'Disebutkan bahwa negara dengan literasi tinggi cenderung memiliki tenaga kerja yang lebih produktif.'],
        ['Apa yang mendorong inovasi dan perkembangan teknologi menurut paragraf?', 'Investasi dalam bidang pendidikan', ['Investasi di sektor pertambangan', 'Penurunan jumlah penduduk', 'Pengurangan anggaran negara'], 'Paragraf menyatakan investasi pendidikan mendorong inovasi dan perkembangan teknologi.'],
        ['Mengapa negara berkembang memprioritaskan anggaran pendidikan?', 'Sebagai bagian dari strategi pembangunan jangka panjang', ['Karena tuntutan organisasi internasional', 'Karena anggaran lain sudah habis', 'Karena jumlah sekolah berkurang'], 'Paragraf menyebutkan pendidikan diprioritaskan sebagai strategi pembangunan jangka panjang.'],
        ['Simpulan yang paling tepat dari paragraf tersebut adalah...', 'Pendidikan berperan penting dalam kemajuan ekonomi suatu bangsa', ['Pendidikan tidak berpengaruh pada ekonomi', 'Ekonomi maju tanpa perlu pendidikan', 'Pendidikan hanya penting bagi negara maju'], 'Keseluruhan paragraf menekankan pentingnya pendidikan bagi kemajuan ekonomi.']
    ];
    bacaan1.forEach(([q, correct, wrong, expl], i) => {
        const opts = rotateArr([correct, ...wrong], i);
        qs.push(mkQ('verbal', 'Pemahaman Bacaan', `${paragraf1}\n\n${q}`, opts, opts.indexOf(correct), expl, difficulty(n++, 60)));
    });
    const bacaan2 = [
        ['Apa topik utama yang dibahas dalam paragraf di atas?', 'Dampak perubahan iklim terhadap permukaan air laut', ['Cara membangun rumah di pesisir', 'Sejarah negara kepulauan', 'Manfaat es di kutub'], 'Paragraf membahas perubahan iklim dan dampaknya terhadap kenaikan permukaan air laut.'],
        ['Apa penyebab naiknya permukaan air laut menurut paragraf?', 'Es di kutub mencair lebih cepat akibat suhu bumi meningkat', ['Curah hujan yang menurun', 'Penggunaan air tanah berlebih', 'Pertumbuhan penduduk pesisir'], 'Disebutkan bahwa peningkatan suhu menyebabkan es di kutub mencair lebih cepat.'],
        ['Siapa yang memberikan saran terkait penanganan perubahan iklim?', 'Para ilmuwan', ['Para petani', 'Pemerintah daerah pesisir', 'Organisasi pariwisata'], 'Paragraf menyebutkan bahwa para ilmuwan menyarankan pengurangan emisi karbon.'],
        ['Wilayah mana yang paling berisiko terdampak menurut paragraf?', 'Wilayah pesisir negara kepulauan', ['Wilayah pegunungan', 'Wilayah gurun', 'Wilayah perkotaan pedalaman'], 'Paragraf menyatakan negara kepulauan menghadapi risiko tenggelamnya wilayah pesisir.'],
        ['Langkah utama yang disarankan untuk memperlambat dampak perubahan iklim adalah...', 'Mengurangi emisi karbon', ['Membangun lebih banyak gedung', 'Meningkatkan penangkapan ikan', 'Memperluas wilayah pesisir'], 'Paragraf menyebutkan pengurangan emisi karbon sebagai langkah utama.']
    ];
    bacaan2.forEach(([q, correct, wrong, expl], i) => {
        const opts = rotateArr([correct, ...wrong], i + 2);
        qs.push(mkQ('verbal', 'Pemahaman Bacaan', `${paragraf2}\n\n${q}`, opts, opts.indexOf(correct), expl, difficulty(n++, 60)));
    });

    return qs;
}

/* ---------------- FIGURAL (60) ---------------- */
function genFigural() {
    const qs = [];
    let n = 0;

    // 1) Pola gambar - rotation sequence (10)
    for (let i = 0; i < 10; i++) {
        const shape = SHAPES[i % SHAPES.length];
        const step = 30 + (i % 3) * 15;
        const r0 = 0, r1 = step, r2 = step * 2, r3 = step * 3;
        const color = COLORS[i % COLORS.length];
        const seqHtml = [r0, r1, r2].map(r => figOpt(svgFigure(shape, r, color))).join('');
        const correct = r3 % 360;
        const opts = [correct, (correct + step) % 360, (correct - step + 360) % 360, (correct + 2 * step) % 360];
        const optsR = rotateArr(opts, i % 4);
        qs.push(mkQ('figural', 'Pola Gambar', `Perhatikan urutan gambar berikut. Gambar manakah yang tepat untuk melanjutkan pola rotasi tersebut?`,
            optsR.map(r => figOpt(svgFigure(shape, r, color))), optsR.indexOf(correct),
            `Pola berputar searah jarum jam sebesar ${step}° pada setiap langkah. Setelah ${r2}°, gambar berikutnya berputar menjadi ${correct}°.`,
            difficulty(n++, 60), `<div class="q-figural">${seqHtml}<span style="font-size:24px;color:var(--muted)">→ ?</span></div>`));
    }

    // 2) Rotasi (10) - single shape rotated, find matching rotated version
    for (let i = 0; i < 10; i++) {
        const shape = SHAPES[(i + 1) % SHAPES.length];
        const color = COLORS[(i + 2) % COLORS.length];
        const baseRot = (i % 4) * 20;
        const targetRot = (baseRot + 90) % 360;
        const opts = [targetRot, (targetRot + 45) % 360, (targetRot - 45 + 360) % 360, (targetRot + 180) % 360];
        const optsR = rotateArr(opts, i % 4);
        qs.push(mkQ('figural', 'Rotasi', `Gambar di bawah ini diputar 90° searah jarum jam. Manakah hasil rotasi yang tepat?`,
            optsR.map(r => figOpt(svgFigure(shape, r, color))), optsR.indexOf(targetRot),
            `Bentuk asli diputar 90° searah jarum jam, sehingga sudut rotasi berubah dari ${baseRot}° menjadi ${targetRot}°.`,
            difficulty(n++, 60), `<div class="q-figural">${figOpt(svgFigure(shape, baseRot, color))}</div>`));
    }

    // 3) Cermin (10) - mirror image of asymmetric shape (arrow / L)
    for (let i = 0; i < 10; i++) {
        const shape = (i % 2 === 0) ? 'arrow' : 'L';
        const color = COLORS[(i + 3) % COLORS.length];
        const rot = (i % 4) * 30;
        const correctSvg = svgFigure(shape, rot, color, 44, 90, true);
        const wrong1 = svgFigure(shape, rot, color, 44, 90, false);
        const wrong2 = svgFigure(shape, (rot + 90) % 360, color, 44, 90, true);
        const wrong3 = svgFigure(shape, (rot + 180) % 360, color, 44, 90, false);
        const opts = [correctSvg, wrong1, wrong2, wrong3];
        const optsR = rotateArr(opts, i % 4);
        qs.push(mkQ('figural', 'Cermin', `Manakah gambar yang merupakan hasil pencerminan (mirror) dari gambar di bawah ini terhadap sumbu vertikal?`,
            optsR.map(s => figOpt(s)), optsR.indexOf(correctSvg),
            `Pencerminan terhadap sumbu vertikal membalik posisi kiri-kanan bentuk asli tanpa mengubah orientasi atasnya.`,
            difficulty(n++, 60), `<div class="q-figural">${figOpt(svgFigure(shape, rot, color))}</div>`));
    }

    // 4) Matriks gambar (10) - 3x3 with rotation pattern across row, last cell empty
    for (let i = 0; i < 10; i++) {
        const shape = SHAPES[(i + 2) % SHAPES.length];
        const colors = [COLORS[i % COLORS.length], COLORS[(i + 1) % COLORS.length], COLORS[(i + 2) % COLORS.length]];
        const step = 45;
        const cells = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (r === 2 && c === 2) { cells.push({ empty: true }); continue; }
                cells.push({ shape, rot: (c * step) % 360, color: colors[r], size: 30 });
            }
        }
        const correctRot = (2 * step) % 360;
        const correctColor = colors[2];
        const correctSvg = `<svg viewBox="0 0 60 60" width="60" height="60"><g transform="translate(30,30) rotate(${correctRot})">${(shape === 'circle') ? `<circle cx="0" cy="0" r="15" fill="${correctColor}"/>` : `<polygon points="${shapePointsZero(shape, 30)}" fill="${correctColor}"/>`}</g></svg>`;
        const wrongRot1 = `<svg viewBox="0 0 60 60" width="60" height="60"><g transform="translate(30,30) rotate(${(correctRot + 90) % 360})">${(shape === 'circle') ? `<circle cx="0" cy="0" r="15" fill="${correctColor}"/>` : `<polygon points="${shapePointsZero(shape, 30)}" fill="${correctColor}"/>`}</g></svg>`;
        const wrongColor = `<svg viewBox="0 0 60 60" width="60" height="60"><g transform="translate(30,30) rotate(${correctRot})">${(shape === 'circle') ? `<circle cx="0" cy="0" r="15" fill="${colors[0]}"/>` : `<polygon points="${shapePointsZero(shape, 30)}" fill="${colors[0]}"/>`}</g></svg>`;
        const wrongShape = `<svg viewBox="0 0 60 60" width="60" height="60"><g transform="translate(30,30) rotate(${correctRot})"><circle cx="0" cy="0" r="15" fill="${correctColor}"/></g></svg>`;
        const opts = [correctSvg, wrongRot1, wrongColor, wrongShape];
        const optsR = rotateArr(opts, i % 4);
        qs.push(mkQ('figural', 'Matriks Gambar', `Perhatikan matriks gambar 3x3 berikut. Gambar apa yang tepat untuk mengisi kotak yang kosong (tanda tanya)?`,
            optsR.map(s => figOpt(s)), optsR.indexOf(correctSvg),
            `Setiap baris menggunakan warna yang sama dan rotasi bertambah ${step}° dari kiri ke kanan. Pada baris ketiga, warna ${correctColor === '#22C55E' ? 'hijau' : correctColor === '#3B82F6' ? 'biru' : correctColor === '#FACC15' ? 'kuning' : correctColor === '#EF4444' ? 'merah' : correctColor === '#A855F7' ? 'ungu' : 'oranye'} dengan rotasi ${correctRot}° adalah jawaban yang tepat.`,
            difficulty(n++, 60), `<div class="q-figural">${figOpt(svgGrid(cells))}</div>`));
    }

    // 5) Bentuk hilang (10) - sequence of shapes, one missing in middle, find pattern (size increasing)
    for (let i = 0; i < 10; i++) {
        const shape = SHAPES[(i + 4) % SHAPES.length];
        const color = COLORS[(i + 1) % COLORS.length];
        const sizes = [26, 34, 42, 50, 58];
        const missingIdx = 2;
        const seqHtml = sizes.map((s, idx) => idx === missingIdx ? figOpt(`<svg viewBox="0 0 100 100" width="90" height="90"><text x="50" y="60" font-size="40" fill="#9CA3AF" text-anchor="middle" font-weight="700">?</text></svg>`) : figOpt(svgFigure(shape, 0, color, s))).join('');
        const correctSize = sizes[missingIdx];
        const opts = [correctSize, correctSize - 8, correctSize + 8, correctSize - 16];
        const optsR = rotateArr(opts, i % 4);
        qs.push(mkQ('figural', 'Bentuk Hilang', `Perhatikan urutan gambar berikut. Pilih gambar yang tepat untuk mengisi bagian yang hilang (?), berdasarkan pola ukuran yang berubah secara teratur.`,
            optsR.map(s => figOpt(svgFigure(shape, 0, color, s))), optsR.indexOf(correctSize),
            `Ukuran gambar bertambah secara konsisten sebesar 8 satuan pada setiap langkah: ${sizes.join(', ')}. Bagian yang hilang berukuran ${correctSize}.`,
            difficulty(n++, 60), `<div class="q-figural">${seqHtml}</div>`));
    }

    // 6) Hubungan visual (10) - A:B = C:? based on shape + rotation transform
    for (let i = 0; i < 10; i++) {
        const shapeA = SHAPES[i % SHAPES.length];
        const shapeC = SHAPES[(i + 2) % SHAPES.length];
        const colorA = COLORS[i % COLORS.length];
        const colorC = COLORS[(i + 1) % COLORS.length];
        const transformRot = 90;
        const shapeB_svg = svgFigure(shapeA, transformRot, colorA);
        const correctSvg = svgFigure(shapeC, transformRot, colorC);
        const wrong1 = svgFigure(shapeC, 0, colorC);
        const wrong2 = svgFigure(shapeC, 180, colorC);
        const wrong3 = svgFigure(shapeA, transformRot, colorC);
        const opts = [correctSvg, wrong1, wrong2, wrong3];
        const optsR = rotateArr(opts, i % 4);
        qs.push(mkQ('figural', 'Hubungan Visual', `Perhatikan hubungan antara gambar pertama dan kedua. Terapkan hubungan yang sama pada gambar ketiga untuk menemukan gambar keempat (?).`,
            optsR.map(s => figOpt(s)), optsR.indexOf(correctSvg),
            `Hubungan antara gambar pertama dan kedua adalah rotasi sebesar ${transformRot}° dengan bentuk dan warna tetap. Hubungan yang sama diterapkan pada gambar ketiga: bentuk dan warna tetap, namun diputar ${transformRot}°.`,
            difficulty(n++, 60), `<div class="q-figural">${figOpt(svgFigure(shapeA, 0, colorA))}<span style="color:var(--muted)">:</span>${figOpt(shapeB_svg)}<span style="color:var(--muted)">=</span>${figOpt(svgFigure(shapeC, 0, colorC))}<span style="color:var(--muted)">: ?</span></div>`));
    }

    return qs;
}

/* ---------------- PENALARAN LOGIS (60) ---------------- */
function genLogika() {
    const qs = [];
    let n = 0;

    // 1) Silogisme (10)
    const triples = [
        ['kucing', 'mamalia', 'hewan berdarah panas'],
        ['mawar', 'bunga', 'tumbuhan'],
        ['perawat', 'tenaga medis', 'pekerja rumah sakit'],
        ['segitiga', 'bangun datar', 'objek geometri'],
        ['gitar', 'alat musik', 'benda yang menghasilkan suara'],
        ['salmon', 'ikan', 'hewan air'],
        ['novel', 'buku', 'media tulisan'],
        ['sepeda', 'kendaraan', 'alat transportasi'],
        ['dokter gigi', 'dokter', 'tenaga kesehatan'],
        ['apel', 'buah', 'sumber vitamin']
    ];
    triples.forEach(([a, b, c], i) => {
        const correct = `Semua ${a} adalah ${c}`;
        const wrong = [`Sebagian ${a} adalah ${c}`, `Tidak ada ${a} yang merupakan ${c}`, `Semua ${c} adalah ${a}`];
        const opts = rotateArr([correct, ...wrong], i);
        qs.push(mkQ('logika', 'Silogisme', `Premis 1: Semua ${a} adalah ${b}.\nPremis 2: Semua ${b} adalah ${c}.\nKesimpulan yang tepat adalah...?`,
            opts, opts.indexOf(correct),
            `Karena semua ${a} termasuk dalam ${b}, dan semua ${b} termasuk dalam ${c}, maka secara logis semua ${a} pasti termasuk dalam ${c}.`, difficulty(n++, 60)));
    });

    // 2) Logika deduktif (10)
    const deduktif = [
        ['pegawai yang datang terlambat', 'dikenakan potongan gaji', 'Rian datang terlambat hari ini', 'Rian dikenakan potongan gaji'],
        ['mahasiswa yang lulus ujian', 'mendapatkan sertifikat', 'Sari lulus ujian', 'Sari mendapatkan sertifikat'],
        ['kendaraan yang melebihi batas kecepatan', 'ditilang polisi', 'Mobil itu melebihi batas kecepatan', 'Mobil itu ditilang polisi'],
        ['anggota yang tidak membayar iuran', 'dikeluarkan dari klub', 'Budi tidak membayar iuran', 'Budi dikeluarkan dari klub'],
        ['produk yang tidak lolos uji kualitas', 'tidak akan dipasarkan', 'Produk X tidak lolos uji kualitas', 'Produk X tidak akan dipasarkan'],
        ['siswa yang mengikuti olimpiade', 'mendapat poin tambahan', 'Tasya mengikuti olimpiade', 'Tasya mendapat poin tambahan'],
        ['karyawan yang menyelesaikan pelatihan', 'berhak naik jabatan', 'Dimas menyelesaikan pelatihan', 'Dimas berhak naik jabatan'],
        ['warga yang terdaftar', 'berhak memilih dalam pemilu', 'Pak Joko terdaftar', 'Pak Joko berhak memilih dalam pemilu'],
        ['buku yang dipinjam lebih dari 2 minggu', 'dikenakan denda', 'Buku itu dipinjam lebih dari 2 minggu', 'Buku itu dikenakan denda'],
        ['pelamar yang lolos tes wawancara', 'akan menjalani tes kesehatan', 'Ani lolos tes wawancara', 'Ani akan menjalani tes kesehatan']
    ];
    deduktif.forEach(([cond, result, fact, concl], i) => {
        const wrong = [`Tidak dapat dipastikan apakah ${concl.toLowerCase()}`, `${concl} hanya jika ada keputusan tambahan`, `Kesimpulan tidak dapat diambil dari premis di atas`];
        const opts = rotateArr([concl, ...wrong], i + 1);
        qs.push(mkQ('logika', 'Logika Deduktif', `Aturan: Setiap ${cond} akan ${result}.\nFakta: ${fact}.\nKesimpulan yang paling tepat adalah...?`,
            opts, opts.indexOf(concl),
            `Karena fakta menyatakan kondisi pada aturan terpenuhi, maka konsekuensi dari aturan tersebut pasti berlaku, yaitu: ${concl.toLowerCase()}.`, difficulty(n++, 60)));
    });

    // 3) Logika induktif (10)
    const induktif = [
        ['setiap kali musim kemarau tiba, debit air sungai menurun', 'Musim kemarau telah diamati sebanyak 5 kali', 'debit air sungai akan menurun lagi saat musim kemarau berikutnya'],
        ['setiap pelanggan yang membeli produk A juga membeli produk B', 'Pola ini terlihat pada 50 transaksi terakhir', 'pelanggan baru yang membeli produk A cenderung juga membeli produk B'],
        ['setiap pegawai yang rutin berolahraga jarang mengambil cuti sakit', 'Data ini konsisten selama 1 tahun', 'pegawai yang rutin berolahraga kemungkinan besar akan lebih sedikit mengambil cuti sakit'],
        ['setiap kali harga BBM naik, harga sembako ikut naik', 'Hal ini terjadi pada 4 kenaikan BBM sebelumnya', 'kenaikan BBM berikutnya kemungkinan akan diikuti kenaikan harga sembako'],
        ['setiap siswa yang rutin membaca memiliki nilai ujian bahasa yang tinggi', 'Pola ini ditemukan pada 30 siswa yang diamati', 'siswa yang rutin membaca cenderung memperoleh nilai ujian bahasa yang tinggi'],
        ['setiap kali terjadi hujan deras, jalan tertentu mengalami banjir', 'Hal ini sudah terjadi 6 kali berturut-turut', 'jalan tersebut kemungkinan akan banjir lagi jika terjadi hujan deras'],
        ['setiap produk dari pabrik tersebut yang diperiksa lolos standar kualitas', 'Sudah 100 produk diperiksa dan semuanya lolos', 'produk berikutnya dari pabrik tersebut kemungkinan besar juga akan lolos standar kualitas'],
        ['setiap kali tim A bermain di kandang, mereka menang', 'Tercatat dalam 8 pertandingan kandang terakhir', 'tim A kemungkinan besar akan menang lagi saat bermain di kandang'],
        ['setiap pelanggan yang menggunakan kupon diskon kembali berbelanja dalam sebulan', 'Data ini ditemukan pada ratusan pelanggan', 'pelanggan yang menggunakan kupon diskon cenderung kembali berbelanja dalam waktu dekat'],
        ['setiap kali suhu ruangan server meningkat, kinerja sistem melambat', 'Hal ini teramati pada 10 kejadian', 'kinerja sistem kemungkinan akan melambat lagi jika suhu ruangan server meningkat']
    ];
    induktif.forEach(([obs, data, concl], i) => {
        const wrong = ['Kesimpulan tersebut pasti benar tanpa pengecualian', 'Tidak ada hubungan antara pengamatan dan kesimpulan', 'Kesimpulan tersebut tidak dapat digunakan untuk memprediksi apa pun'];
        const opts = rotateArr([concl, ...wrong], i + 2);
        qs.push(mkQ('logika', 'Logika Induktif', `Pengamatan: ${obs}.\n${data}.\nKesimpulan induktif yang paling tepat adalah...?`,
            opts, opts.indexOf(concl),
            `Penalaran induktif menggunakan pola yang berulang pada pengamatan sebelumnya untuk memprediksi kejadian serupa di masa depan, sehingga kesimpulan yang wajar adalah: ${concl}.`, difficulty(n++, 60)));
    });

    // 4) Sebab akibat (10)
    const sebabAkibat = [
        ['hujan turun dengan deras', 'jalanan menjadi banjir', 'Hujan turun dengan deras', 'Jalanan menjadi banjir'],
        ['seseorang kurang tidur', 'konsentrasi belajarnya menurun', 'Andi kurang tidur semalam', 'Konsentrasi belajar Andi menurun'],
        ['suhu udara meningkat tajam', 'es di dalam gelas mencair lebih cepat', 'Suhu udara meningkat tajam', 'Es di dalam gelas mencair lebih cepat'],
        ['harga bahan bakar naik', 'biaya transportasi ikut naik', 'Harga bahan bakar naik', 'Biaya transportasi ikut naik'],
        ['tanaman tidak disiram dalam waktu lama', 'tanaman tersebut menjadi layu', 'Tanaman tidak disiram selama seminggu', 'Tanaman tersebut menjadi layu'],
        ['lampu lalu lintas mati', 'terjadi kemacetan di perempatan', 'Lampu lalu lintas di perempatan itu mati', 'Terjadi kemacetan di perempatan tersebut'],
        ['seseorang rutin berolahraga', 'daya tahan tubuhnya meningkat', 'Rina rutin berolahraga setiap pagi', 'Daya tahan tubuh Rina meningkat'],
        ['jaringan internet terputus', 'transaksi online tidak dapat dilakukan', 'Jaringan internet di kantor terputus', 'Transaksi online tidak dapat dilakukan'],
        ['gula ditambahkan ke dalam air panas', 'gula tersebut larut', 'Gula ditambahkan ke dalam air panas', 'Gula tersebut larut'],
        ['seseorang tidak sarapan pagi', 'ia merasa lemas menjelang siang', 'Dimas tidak sarapan pagi ini', 'Dimas merasa lemas menjelang siang']
    ];
    sebabAkibat.forEach(([cause, effect, causeS, effectS], i) => {
        const wrong = [`${effectS} tidak ada hubungannya dengan kondisi tersebut`, `Kondisi tersebut menyebabkan hal yang sebaliknya terjadi`, `Tidak dapat disimpulkan apa pun dari pernyataan tersebut`];
        const opts = rotateArr([effectS, ...wrong], i + 3);
        qs.push(mkQ('logika', 'Sebab Akibat', `Jika ${cause}, maka ${effect}.\n${causeS}.\nAkibat yang paling mungkin terjadi adalah...?`,
            opts, opts.indexOf(effectS),
            `Berdasarkan hubungan sebab-akibat yang dinyatakan, jika sebab (${cause}) terjadi, maka akibat yang logis adalah: ${effectS.toLowerCase()}.`, difficulty(n++, 60)));
    });

    // 5) Pernyataan dan kesimpulan (10) - modus tollens
    const pernyataan = [
        ['Jika sebuah toko sedang tutup', 'maka lampu toko tersebut mati', 'lampu toko tersebut menyala', 'toko tersebut sedang buka'],
        ['Jika seseorang memiliki SIM', 'maka ia boleh mengendarai motor', 'seseorang tidak boleh mengendarai motor', 'orang tersebut tidak memiliki SIM'],
        ['Jika hujan turun', 'maka tanah menjadi basah', 'tanah tidak basah', 'hujan tidak turun'],
        ['Jika sebuah laptop dalam keadaan baik', 'maka laptop tersebut dapat menyala', 'laptop tersebut tidak dapat menyala', 'laptop tersebut tidak dalam keadaan baik'],
        ['Jika seseorang lulus tes kesehatan', 'maka ia dapat mendaftar sebagai pilot', 'seseorang tidak dapat mendaftar sebagai pilot', 'orang tersebut tidak lulus tes kesehatan'],
        ['Jika sebuah restoran memiliki izin usaha', 'maka restoran tersebut dapat beroperasi secara legal', 'sebuah restoran tidak dapat beroperasi secara legal', 'restoran tersebut tidak memiliki izin usaha'],
        ['Jika sebuah file terenkripsi', 'maka file tersebut membutuhkan kata sandi untuk dibuka', 'sebuah file tidak membutuhkan kata sandi untuk dibuka', 'file tersebut tidak terenkripsi'],
        ['Jika cuaca cerah', 'maka penerbangan tidak akan ditunda', 'sebuah penerbangan ditunda', 'cuaca tidak cerah'],
        ['Jika seorang atlet mengikuti program latihan dengan disiplin', 'maka staminanya akan meningkat', 'stamina seorang atlet tidak meningkat', 'atlet tersebut tidak mengikuti program latihan dengan disiplin'],
        ['Jika sebuah perangkat terhubung ke charger', 'maka baterainya akan terisi', 'baterai sebuah perangkat tidak terisi', 'perangkat tersebut tidak terhubung ke charger']
    ];
    pernyataan.forEach(([p, q, negQ, concl], i) => {
        const wrong = [`Tidak dapat ditentukan kesimpulannya`, `Pernyataan awal pasti salah`, `Kesimpulannya adalah kebalikan dari "${concl}"`];
        const opts = rotateArr([concl, ...wrong], i + 4);
        qs.push(mkQ('logika', 'Pernyataan dan Kesimpulan', `${p}, ${q}.\nKenyataannya, ${negQ}.\nKesimpulan yang paling tepat adalah...?`,
            opts, opts.indexOf(concl),
            `Ini merupakan bentuk penalaran modus tollens: jika P maka Q, dan Q tidak terjadi, maka dapat disimpulkan P juga tidak terjadi, yaitu: ${concl}.`, difficulty(n++, 60)));
    });

    // 6) Analisis argumen (10)
    const argumen = [
        ['Semua orang yang sukses bekerja keras. Tono bekerja keras. Jadi, Tono pasti sukses.', 'Argumen ini tidak valid karena bekerja keras tidak menjamin kesuksesan; ada faktor lain yang juga berpengaruh.'],
        ['Semua kucing adalah hewan. Semua hewan membutuhkan makanan. Jadi, semua kucing membutuhkan makanan.', 'Argumen ini valid karena kesimpulan mengikuti secara logis dari kedua premis yang diberikan.'],
        ['Sebagian siswa di kelas itu pandai matematika. Rian adalah siswa di kelas itu. Jadi, Rian pasti pandai matematika.', 'Argumen ini tidak valid karena premis hanya menyatakan "sebagian", bukan "semua" siswa.'],
        ['Jika anggaran ditambah, kualitas layanan akan meningkat. Anggaran tidak ditambah. Jadi, kualitas layanan tidak akan meningkat.', 'Argumen ini tidak valid karena kualitas layanan bisa meningkat akibat faktor lain selain penambahan anggaran.'],
        ['Semua peserta yang hadir mendapat sertifikat. Lina mendapat sertifikat. Jadi, Lina hadir.', 'Argumen ini tidak valid karena sertifikat mungkin didapat melalui cara lain, bukan hanya dengan hadir.'],
        ['Tidak ada burung yang bisa berenang seperti ikan. Penguin adalah burung. Jadi, penguin tidak bisa berenang seperti ikan.', 'Argumen ini valid secara struktur, meskipun premis pertamanya secara faktual dapat diperdebatkan.'],
        ['Semua karyawan baru mengikuti pelatihan. Beberapa karyawan mengikuti pelatihan. Jadi, mereka adalah karyawan baru.', 'Argumen ini tidak valid karena karyawan lama juga bisa mengikuti pelatihan yang sama.'],
        ['Jika harga naik, permintaan turun. Permintaan turun. Jadi, harga pasti naik.', 'Argumen ini tidak valid karena permintaan bisa turun akibat sebab lain, bukan hanya kenaikan harga.'],
        ['Semua dokter adalah lulusan kedokteran. Budi lulusan kedokteran. Jadi, Budi adalah dokter.', 'Argumen ini tidak valid karena lulusan kedokteran belum tentu berprofesi sebagai dokter.'],
        ['Setiap mesin yang dirawat secara rutin jarang mengalami kerusakan. Mesin ini dirawat secara rutin. Jadi, mesin ini jarang mengalami kerusakan.', 'Argumen ini valid karena kesimpulan langsung mengikuti dari penerapan aturan umum pada kasus khusus.']
    ];
    argumen.forEach(([arg, correctAnalysis], i) => {
        const wrongPool = [
            'Argumen ini valid karena semua premis pasti benar secara faktual.',
            'Argumen ini tidak dapat dianalisis karena tidak memiliki premis yang jelas.',
            'Argumen ini valid karena kesimpulan sama persis dengan salah satu premis.',
            'Argumen ini tidak valid karena tidak menggunakan data statistik.'
        ];
        const wrong = [wrongPool[i % 4], wrongPool[(i + 1) % 4], wrongPool[(i + 2) % 4]];
        const opts = rotateArr([correctAnalysis, ...wrong], i + 5);
        qs.push(mkQ('logika', 'Analisis Argumen', `Perhatikan argumen berikut:\n"${arg}"\n\nManakah analisis yang paling tepat mengenai validitas argumen tersebut?`,
            opts, opts.indexOf(correctAnalysis),
            correctAnalysis, difficulty(n++, 60)));
    });

    return qs;
}

function mkQ(category, type, text, options, answerIndex, explanation, diff, extraHtml) {
    return { category, type, text, options, answerIndex, explanation, diff, extraHtml: extraHtml || '' };
}
/* =========================================================
 BUILD QUESTION BANK
========================================================= */
const CAT_LABELS = { verbal: 'Verbal', numerik: 'Numerik', figural: 'Figural', logika: 'Penalaran Logis' };
const CAT_ORDER = ['verbal', 'numerik', 'figural', 'logika'];
let ALL_QUESTIONS = [];
function buildBank() {
    ALL_QUESTIONS = [
        ...genVerbal(),
        ...genNumerik(),
        ...genFigural(),
        ...genLogika()
    ];
}
buildBank();
const TOTAL_Q = ALL_QUESTIONS.length; // 240
