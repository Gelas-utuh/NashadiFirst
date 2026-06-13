/* =========================================================
         STATE MANAGEMENT
      ========================================================= */
const TOTAL_TIME = 180 * 60;
let state = {
    current: 0,
    answers: {}, // index -> option index
    marked: {},  // index -> true
    timeLeft: TOTAL_TIME,
    started: false,
    finished: false,
    startedAt: null
};
let timerInterval = null;

function saveState() {
    localStorage.setItem('tpa_state', JSON.stringify(state));
}
function loadState() {
    const raw = localStorage.getItem('tpa_state');
    if (raw) {
        try { const s = JSON.parse(raw); if (s && s.started && !s.finished) return s; } catch (e) { }
    }
    return null;
}
function clearState() {
    localStorage.removeItem('tpa_state');
}

/* =========================================================
   INIT / START SCREEN
========================================================= */
const screenStart = document.getElementById('screen-start');
const screenTest = document.getElementById('screen-test');
const screenResult = document.getElementById('screen-result');
const timerDisplay = document.getElementById('timer-display');
const progressWrap = document.getElementById('progress-wrap');
const progressBar = document.getElementById('progress-bar');
const btnReset = document.getElementById('btn-reset');

function init() {
    const saved = loadState();
    if (saved) {
        document.getElementById('btn-resume').classList.remove('hidden');
    }
    renderHistory();
    document.getElementById('btn-start').addEventListener('click', () => {
        if (saved && !confirm('Memulai tes baru akan menghapus progres tes yang sedang berjalan. Lanjutkan?')) {
            return;
        }
        startNewTest();
    });
    document.getElementById('btn-resume').addEventListener('click', () => {
        state = saved;
        enterTest();
    });
    document.getElementById('btn-sound').addEventListener('click', toggleSound);
    document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
    btnReset.addEventListener('click', resetTest);
    document.getElementById('btn-jump').addEventListener('click', jumpToInput);
    document.getElementById('jump-input').addEventListener('keydown', e => { if (e.key === 'Enter') jumpToInput(); });
    updateSoundBtn();
}
function updateSoundBtn() {
    document.getElementById('btn-sound').textContent = soundOn ? '🔊 Suara' : '🔇 Suara';
}
function toggleSound() {
    soundOn = !soundOn;
    localStorage.setItem('tpa_sound', soundOn ? 'on' : 'off');
    updateSoundBtn();
    beep(800, 0.06);
}
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
    } else {
        document.exitFullscreen();
    }
}
function startNewTest() {
    clearState();
    state = { current: 0, answers: {}, marked: {}, timeLeft: TOTAL_TIME, started: true, finished: false, startedAt: Date.now() };
    saveState();
    enterTest();
}
function resetTest() {
    if (confirm('Reset tes akan menghapus seluruh progres saat ini. Lanjutkan?')) {
        clearState();
        if (timerInterval) clearInterval(timerInterval);
        location.reload();
    }
}
function enterTest() {
    screenStart.classList.add('hidden');
    screenResult.classList.add('hidden');
    screenTest.classList.remove('hidden');
    timerDisplay.classList.remove('hidden');
    progressWrap.classList.remove('hidden');
    btnReset.classList.remove('hidden');
    renderNav();
    renderQuestion(false);
    startTimer();
}

/* =========================================================
   TIMER
========================================================= */
function startTimer() {
    updateTimerDisplay();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        state.timeLeft--;
        if (state.timeLeft <= 0) {
            state.timeLeft = 0;
            updateTimerDisplay();
            clearInterval(timerInterval);
            finishTest(true);
            return;
        }
        updateTimerDisplay();
        if (state.timeLeft % 10 === 0) saveState();
    }, 1000);
}
function updateTimerDisplay() {
    const m = Math.floor(state.timeLeft / 60);
    const s = state.timeLeft % 60;
    timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    timerDisplay.classList.remove('warn', 'danger');
    if (state.timeLeft <= 5 * 60) timerDisplay.classList.add('danger');
    else if (state.timeLeft <= 15 * 60) timerDisplay.classList.add('warn');
}

/* =========================================================
   QUESTION RENDERING
========================================================= */
const qCard = document.getElementById('q-card');

function renderQuestion(animate = true) {
    const q = ALL_QUESTIONS[state.current];
    const idx = state.current;
    const selected = state.answers[idx];
    const marked = !!state.marked[idx];

    let optionsHtml = q.options.map((opt, i) => {
        const isSel = selected === i;
        const label = String.fromCharCode(65 + i);
        return `<div class="option ${isSel ? 'selected' : ''}" data-idx="${i}">
      <div class="opt-label">${label}</div>
      <div class="option-text">${opt}</div>
    </div>`;
    }).join('');

    const html = `
    <div class="q-meta">
      <span class="q-tag">${CAT_LABELS[q.category]} · ${q.type}</span>
      <span class="q-number">Soal ${idx + 1} dari ${TOTAL_Q}</span>
    </div>
    <div class="q-text">${q.text}</div>
    ${q.extraHtml}
    <div class="options">${optionsHtml}</div>
    <div class="q-controls">
      <div class="q-controls-left">
        <button class="btn-nav" id="btn-prev" ${idx === 0 ? 'disabled' : ''}>← Sebelumnya</button>
        <button class="btn-nav ${marked ? 'active-mark' : ''}" id="btn-mark">${marked ? '★ Ditandai' : '☆ Tandai untuk ditinjau'}</button>
      </div>
      <div class="q-controls-right">
        ${idx === TOTAL_Q - 1 ? `<button class="btn-nav btn-finish" id="btn-finish">Selesai &amp; Lihat Hasil</button>` : `<button class="btn-nav" id="btn-next" style="background:var(--green);color:#0b1f12;">Selanjutnya →</button>`}
      </div>
    </div>
  `;

    if (animate) {
        qCard.classList.add('fade-out');
        setTimeout(() => {
            qCard.innerHTML = html;
            qCard.classList.remove('fade-out');
            qCard.classList.add('fade-in');
            setTimeout(() => qCard.classList.remove('fade-in'), 350);
            bindQuestionEvents();
        }, 150);
    } else {
        qCard.innerHTML = html;
        bindQuestionEvents();
    }
}

function bindQuestionEvents() {
    const idx = state.current;
    qCard.querySelectorAll('.option').forEach(el => {
        el.addEventListener('click', () => {
            const optIdx = parseInt(el.dataset.idx);
            state.answers[idx] = optIdx;
            saveState();
            beep(700, 0.05);
            qCard.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            el.classList.add('selected');
            renderNav();
        });
    });
    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) btnPrev.addEventListener('click', () => { goTo(state.current - 1); });
    const btnNext = document.getElementById('btn-next');
    if (btnNext) btnNext.addEventListener('click', () => { goTo(state.current + 1); });
    const btnFinish = document.getElementById('btn-finish');
    if (btnFinish) btnFinish.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mengakhiri tes dan melihat hasil?')) finishTest(false);
    });
    const btnMark = document.getElementById('btn-mark');
    if (btnMark) btnMark.addEventListener('click', () => {
        state.marked[idx] = !state.marked[idx];
        saveState();
        beep(state.marked[idx] ? 900 : 500, 0.06);
        renderQuestion(false);
        renderNav();
    });
}

function goTo(i) {
    if (i < 0 || i >= TOTAL_Q) return;
    state.current = i;
    saveState();
    beep(650, 0.04);
    renderQuestion(true);
    renderNav();
}
function jumpToInput() {
    const v = parseInt(document.getElementById('jump-input').value);
    if (v >= 1 && v <= TOTAL_Q) { goTo(v - 1); }
}

/* =========================================================
   NAVIGATION PANEL
========================================================= */
const navContainer = document.getElementById('nav-container');
function renderNav() {
    let html = '';
    let offset = 0;
    CAT_ORDER.forEach(cat => {
        const count = ALL_QUESTIONS.filter(q => q.category === cat).length;
        html += `<div class="cat-section"><h4>${CAT_LABELS[cat]} (${offset + 1}-${offset + count})</h4><div class="nav-grid">`;
        for (let i = offset; i < offset + count; i++) {
            let cls = 'nav-btn';
            if (i === state.current) cls += ' active';
            else if (state.marked[i]) cls += ' marked';
            else if (state.answers[i] !== undefined) cls += ' answered';
            html += `<button class="${cls}" data-idx="${i}">${i + 1}</button>`;
        }
        html += `</div></div>`;
        offset += count;
    });
    navContainer.innerHTML = html;
    navContainer.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => goTo(parseInt(btn.dataset.idx)));
    });
    // progress bar
    const answeredCount = Object.keys(state.answers).length;
    progressBar.style.width = (answeredCount / TOTAL_Q * 100) + '%';
}

/* =========================================================
   FINISH TEST & SCORING
========================================================= */
function finishTest(timeUp) {
    if (timerInterval) clearInterval(timerInterval);
    state.finished = true;
    saveState();

    const catStats = {};
    CAT_ORDER.forEach(c => catStats[c] = { benar: 0, salah: 0, kosong: 0, total: 0 });

    ALL_QUESTIONS.forEach((q, i) => {
        catStats[q.category].total++;
        const ans = state.answers[i];
        if (ans === undefined) { catStats[q.category].kosong++; }
        else if (ans === q.answerIndex) { catStats[q.category].benar++; }
        else { catStats[q.category].salah++; }
    });

    let totalBenar = 0, totalSalah = 0, totalKosong = 0;
    CAT_ORDER.forEach(c => {
        totalBenar += catStats[c].benar;
        totalSalah += catStats[c].salah;
        totalKosong += catStats[c].kosong;
        catStats[c].akurasi = catStats[c].total ? Math.round(catStats[c].benar / catStats[c].total * 1000) / 10 : 0;
    });

    const score = Math.round(totalBenar / TOTAL_Q * 1000);
    let level;
    if (score < 300) level = 'Sangat Rendah';
    else if (score < 500) level = 'Rendah';
    else if (score < 700) level = 'Sedang';
    else if (score < 900) level = 'Tinggi';
    else level = 'Sangat Tinggi';

    // strongest / weakest
    let strongest = CAT_ORDER[0], weakest = CAT_ORDER[0];
    CAT_ORDER.forEach(c => {
        if (catStats[c].akurasi > catStats[strongest].akurasi) strongest = c;
        if (catStats[c].akurasi < catStats[weakest].akurasi) weakest = c;
    });

    const result = {
        date: new Date().toISOString(),
        timeUp,
        catStats, totalBenar, totalSalah, totalKosong, score, level, strongest, weakest,
        timeUsed: TOTAL_TIME - state.timeLeft
    };

    saveHistory(result);
    clearState();
    renderResult(result);

    screenTest.classList.add('hidden');
    timerDisplay.classList.add('hidden');
    progressWrap.classList.add('hidden');
    btnReset.classList.add('hidden');
    screenResult.classList.remove('hidden');
    screenResult.scrollIntoView({ behavior: 'smooth' });
}

function saveHistory(result) {
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem('tpa_history') || '[]'); } catch (e) { }
    hist.unshift(result);
    if (hist.length > 10) hist = hist.slice(0, 10);
    localStorage.setItem('tpa_history', JSON.stringify(hist));
}

const RECOMMENDATIONS = {
    verbal: 'Perbanyak membaca artikel, latih kosakata baru (sinonim & antonim), dan biasakan mengerjakan soal analogi kata serta pemahaman bacaan secara rutin.',
    numerik: 'Latih operasi hitung dasar setiap hari, kuatkan pemahaman persentase, perbandingan, dan aljabar dengan banyak latihan soal cerita.',
    figural: 'Latih kemampuan visualisasi spasial dengan mengerjakan soal rotasi, pencerminan, dan pola gambar secara bertahap dari yang sederhana ke kompleks.',
    logika: 'Latih penalaran dengan mengerjakan soal silogisme, sebab-akibat, dan analisis argumen, serta biasakan menyusun premis dan kesimpulan secara sistematis.'
};

function renderResult(result) {
    const { catStats, totalBenar, totalSalah, totalKosong, score, level, strongest, weakest, timeUsed } = result;
    const timeUsedStr = `${Math.floor(timeUsed / 60)} menit ${timeUsed % 60} detik`;

    let catCardsHtml = '';
    CAT_ORDER.forEach(c => {
        const cs = catStats[c];
        catCardsHtml += `
      <div class="cat-result-card">
        <h4>${CAT_LABELS[c]}</h4>
        <div class="row"><span>Benar</span><b style="color:var(--green)">${cs.benar}</b></div>
        <div class="row"><span>Salah</span><b style="color:var(--red)">${cs.salah}</b></div>
        <div class="row"><span>Kosong</span><b style="color:var(--muted)">${cs.kosong}</b></div>
        <div class="row"><span>Akurasi</span><b>${cs.akurasi}%</b></div>
      </div>`;
    });

    let chartBenarHtml = '', chartAkurasiHtml = '';
    CAT_ORDER.forEach(c => {
        const cs = catStats[c];
        const pctBenar = Math.round(cs.benar / cs.total * 100);
        chartBenarHtml += `<div class="chart-row"><div class="lbl">${CAT_LABELS[c]}</div><div class="chart-track"><div class="chart-fill" style="width:${pctBenar}%"></div></div><div class="chart-val">${cs.benar}/${cs.total}</div></div>`;
        chartAkurasiHtml += `<div class="chart-row"><div class="lbl">${CAT_LABELS[c]}</div><div class="chart-track"><div class="chart-fill" style="width:${cs.akurasi}%"></div></div><div class="chart-val">${cs.akurasi}%</div></div>`;
    });

    let historyHtml = '';
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem('tpa_history') || '[]'); } catch (e) { }
    if (hist.length) {
        historyHtml = hist.map(h => {
            const d = new Date(h.date);
            return `<div class="history-item"><span>${d.toLocaleString('id-ID')}</span><span class="h-score">Skor ${h.score} · ${h.level}</span></div>`;
        }).join('');
    } else {
        historyHtml = '<p style="color:var(--muted); font-size:13px;">Belum ada riwayat tes.</p>';
    }

    // Review section (only correct answers shown after test finishes)
    let reviewHtml = '';
    CAT_ORDER.forEach(cat => {
        reviewHtml += `<h3 style="margin-top:18px; color:var(--green);">${CAT_LABELS[cat]}</h3>`;
        ALL_QUESTIONS.forEach((q, i) => {
            if (q.category !== cat) return;
            const userAns = state.answers[i];
            let optsHtml = '';
            q.options.forEach((opt, oi) => {
                let cls = 'review-opt';
                if (oi === q.answerIndex) cls += ' correct';
                else if (oi === userAns) cls += ' wrong';
                optsHtml += `<div class="${cls}">${String.fromCharCode(65 + oi)}. ${opt} ${oi === q.answerIndex ? '(Jawaban Benar)' : (oi === userAns ? '(Jawaban Anda)' : '')}</div>`;
            });
            reviewHtml += `<div class="review-item">
        <div class="review-q"><b>Soal ${i + 1}</b> (${q.type}): ${q.text.replace(/\n/g, '<br>')}</div>
        ${q.extraHtml}
        ${optsHtml}
        <div class="review-expl"><b>Pembahasan:</b> ${q.explanation}</div>
      </div>`;
        });
    });

    screenResult.innerHTML = `
    <div class="result-card">
      <h2>Hasil Tes TPA</h2>
      <div class="score-hero">
        <div class="score-num">${score}</div>
        <div class="score-label">Skor Skala 0–1000 · Waktu digunakan: ${timeUsedStr}${result.timeUp ? ' · <span style="color:var(--red)">Waktu Habis</span>' : ''}</div>
        <div class="score-level">Prediksi Kemampuan: ${level}</div>
      </div>
      <div class="stat-grid">
        <div class="stat-box"><div class="num">${TOTAL_Q}</div><div class="lbl">Total Soal</div></div>
        <div class="stat-box"><div class="num" style="color:var(--green)">${totalBenar}</div><div class="lbl">Total Benar</div></div>
        <div class="stat-box"><div class="num" style="color:var(--red)">${totalSalah}</div><div class="lbl">Total Salah</div></div>
        <div class="stat-box"><div class="num" style="color:var(--muted)">${totalKosong}</div><div class="lbl">Total Kosong</div></div>
      </div>
      <div class="stat-grid" style="grid-template-columns:1fr;">
        <div class="stat-box"><div class="num">${Math.round((totalBenar) / TOTAL_Q * 1000) / 10}%</div><div class="lbl">Akurasi Keseluruhan</div></div>
      </div>
    </div>

    <div class="result-card">
      <h2>Hasil per Kategori</h2>
      <div class="cat-result-grid">${catCardsHtml}</div>
    </div>

    <div class="result-card">
      <h2>Grafik Jumlah Jawaban Benar per Kategori</h2>
      <div class="chart">${chartBenarHtml}</div>
      <h2 style="margin-top:20px;">Grafik Akurasi per Kategori (%)</h2>
      <div class="chart">${chartAkurasiHtml}</div>
    </div>

    <div class="result-card">
      <h2>Analisis Hasil</h2>
      <div class="analysis-box">
        <h4>Kategori Terkuat</h4>
        <p>${CAT_LABELS[strongest]} — dengan akurasi ${catStats[strongest].akurasi}%. Pertahankan dan terus tingkatkan performa pada kategori ini.</p>
      </div>
      <div class="analysis-box">
        <h4>Kategori Terlemah</h4>
        <p>${CAT_LABELS[weakest]} — dengan akurasi ${catStats[weakest].akurasi}%. Kategori ini memerlukan perhatian dan latihan tambahan.</p>
      </div>
      <div class="analysis-box">
        <h4>Rekomendasi Belajar</h4>
        <p>${RECOMMENDATIONS[weakest]}</p>
      </div>
    </div>

    <div class="result-card" id="btn-history-section">
      <h2>Riwayat Hasil Tes Sebelumnya</h2>
      ${historyHtml}
    </div>

    <div class="result-card">
      <div class="result-actions">
        <button class="btn-primary" id="btn-print">🖨️ Cetak Hasil</button>
        <button class="btn-primary" id="btn-pdf">📄 Ekspor ke PDF</button>
        <button class="btn-secondary" id="btn-reset-final">↺ Mulai Tes Baru</button>
      </div>
    </div>

    <div class="result-card">
      <h2>Pembahasan Lengkap (Kunci Jawaban &amp; Penjelasan)</h2>
      ${reviewHtml}
    </div>
  `;

    document.getElementById('btn-print').addEventListener('click', () => window.print());
    document.getElementById('btn-pdf').addEventListener('click', () => window.print());
    document.getElementById('btn-reset-final').addEventListener('click', () => {
        location.reload();
    });

    // animate charts after paint
    requestAnimationFrame(() => {
        document.querySelectorAll('.chart-fill').forEach(el => {
            const w = el.style.width;
            el.style.width = '0%';
            setTimeout(() => { el.style.width = w; }, 50);
        });
    });
}

/* =========================================================
   HISTORY ON START SCREEN
========================================================= */
function renderHistory() {
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem('tpa_history') || '[]'); } catch (e) { }
    const el = document.getElementById('history-section');
    if (!hist.length) { el.innerHTML = ''; return; }
    let html = `<h3 style="font-size:15px; color:var(--green); margin-bottom:8px;">Riwayat Tes Sebelumnya</h3>`;
    hist.slice(0, 5).forEach(h => {
        const d = new Date(h.date);
        html += `<div class="history-item"><span>${d.toLocaleString('id-ID')}</span><span class="h-score">Skor ${h.score} · ${h.level}</span></div>`;
    });
    el.innerHTML = html;
}

/* =========================================================
   START
========================================================= */
init();