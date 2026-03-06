/* ============================================================
   Compound Interest Calculator — script.js
   Pure vanilla JS: calculations, donut chart, bar chart, table
   ============================================================ */

(() => {
  "use strict";

  const translations = {
    en: {
      pageTitle: "Compound Interest Calculator — Grow Your Wealth",
      pageDesc:
        "Free compound interest calculator. See how your investments grow over time with interactive charts and detailed breakdowns.",
      heroTitle:
        'Compound Interest <span class="gradient-text">Calculator</span>',
      heroSubtitle:
        "See how your money grows over time with the power of compound interest.",
      invDetailsTitle: "Investment Details",
      initialDepositLabel: "Initial Deposit",
      monthlyContribLabel: "Monthly Contribution",
      annualRateLabel: "Annual Interest Rate",
      invPeriodLabel: "Investment Period",
      yearsSuffix: "years",
      compoundFreqLabel: "Compounding Frequency",
      freqAnnually: "Annually",
      freqQuarterly: "Quarterly",
      freqMonthly: "Monthly",
      freqDaily: "Daily",
      calculateBtn: "Calculate",
      resultsTitle: "Results",
      futureValueLabel: "Future Value",
      totalContribLabel: "Total Contributions",
      totalInterestLabel: "Total Interest Earned",
      donutInterestSub: "interest",
      legendContributions: "Contributions",
      legendInterest: "Interest",
      growthChartTitle: "Growth Over Time",
      tableTitle: "Year-by-Year Breakdown",
      thYear: "Year",
      thDeposits: "Deposits",
      thInterest: "Interest",
      thBalance: "Balance",
      footerText: "Built with ♥ — host anywhere as a static site.",
      chartYearAxis: "Year",
    },
    pt: {
      pageTitle: "Calculadora de Juros Compostos",
      pageDesc:
        "Calculadora de juros compostos gratuita. Veja como seus investimentos crescem.",
      heroTitle:
        'Calculadora de <span class="gradient-text">Juros Compostos</span>',
      heroSubtitle:
        "Veja como o seu dinheiro cresce ao longo do tempo com o poder dos juros compostos.",
      invDetailsTitle: "Detalhes do Investimento",
      initialDepositLabel: "Depósito Inicial",
      monthlyContribLabel: "Contribuição Mensal",
      annualRateLabel: "Taxa de Juros Anual",
      invPeriodLabel: "Período (Anos)",
      yearsSuffix: "anos",
      compoundFreqLabel: "Capitalização",
      freqAnnually: "Anual",
      freqQuarterly: "Trimestral",
      freqMonthly: "Mensal",
      freqDaily: "Diária",
      calculateBtn: "Calcular",
      resultsTitle: "Resultados",
      futureValueLabel: "Valor Futuro",
      totalContribLabel: "Total de Contribuições",
      totalInterestLabel: "Total de Juros Ganhos",
      donutInterestSub: "juros",
      legendContributions: "Contribuições",
      legendInterest: "Juros",
      growthChartTitle: "Crescimento ao Longo do Tempo",
      tableTitle: "Detalhamento Ano a Ano",
      thYear: "Ano",
      thDeposits: "Depósitos",
      thInterest: "Juros",
      thBalance: "Saldo",
      footerText: "Feito com ♥ — hospede em qualquer lugar como site estático.",
      chartYearAxis: "Ano",
    },
  };

  let currentLang = localStorage.getItem("calcLang") || "pt";

  // ── DOM refs ─────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const initialDeposit = $("initialDeposit");
  const monthlyContribution = $("monthlyContribution");
  const annualRate = $("annualRate");
  const years = $("years");
  const compoundFreq = $("compoundFreq");
  const calculateBtn = $("calculateBtn");

  const futureValueEl = $("futureValue");
  const totalContribEl = $("totalContributions");
  const totalInterestEl = $("totalInterest");
  const interestPctEl = $("interestPct");

  const donutCanvas = $("donutChart");
  const growthCanvas = $("growthChart");
  const tableBody = document.querySelector("#breakdownTable tbody");

  // ── Helpers ──────────────────────────────────────────
  const fmt = (n) => {
    if (currentLang === "pt") {
      return n.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      });
    }
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  };

  // ── Core Calculation ─────────────────────────────────
  function computeSchedule(P, PMT, rAnnual, n, t) {
    // P   = initial principal
    // PMT = monthly contribution
    // rAnnual = annual rate (decimal)
    // n   = compounding periods per year
    // t   = total years
    const schedule = [];
    let balance = P;
    let totalDeposits = P;

    for (let year = 1; year <= t; year++) {
      let yearInterest = 0;
      for (let period = 0; period < 12; period++) {
        // Add monthly contribution at the start of each month
        balance += PMT;
        totalDeposits += PMT;

        // Apply compounding for this month
        // Monthly rate = annual / n, compounding n/12 times per month
        const periodsThisMonth = n / 12;
        for (let p = 0; p < periodsThisMonth; p++) {
          const interest = balance * (rAnnual / n);
          yearInterest += interest;
          balance += interest;
        }
      }

      schedule.push({
        year,
        deposits: totalDeposits,
        interest: balance - totalDeposits,
        balance,
        yearInterest,
      });
    }
    return schedule;
  }

  // ── Draw donut chart (pure canvas) ───────────────────
  function drawDonut(contribRatio, interestRatio) {
    const ctx = donutCanvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 200;
    donutCanvas.width = size * dpr;
    donutCanvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 72;
    const lineWidth = 22;

    ctx.clearRect(0, 0, size, size);

    // Contributions arc
    const contribEnd = -Math.PI / 2 + contribRatio * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, contribEnd);
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Interest arc
    if (interestRatio > 0.001) {
      const interestEnd = contribEnd + interestRatio * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, contribEnd, interestEnd);
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }

  // ── Draw bar chart (pure canvas) ─────────────────────
  function drawBarChart(schedule) {
    const ctx = growthCanvas.getContext("2d");
    const container = growthCanvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    growthCanvas.width = w * dpr;
    growthCanvas.height = h * dpr;
    growthCanvas.style.width = w + "px";
    growthCanvas.style.height = h + "px";
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (!schedule.length) return;

    const padTop = 36;
    const padBottom = 48;
    const padLeft = 70;
    const padRight = 20;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const maxVal = schedule[schedule.length - 1].balance;
    const barCount = schedule.length;
    const gap = Math.max(2, Math.min(6, (chartW / barCount) * 0.15));
    const barW = Math.max(4, (chartW - gap * (barCount + 1)) / barCount);

    // Y-axis gridlines
    const gridLines = 5;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "11px Inter, sans-serif";
    for (let i = 0; i <= gridLines; i++) {
      const val = (maxVal / gridLines) * i;
      const y = padTop + chartH - chartH * (val / maxVal);
      // Grid line
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
      // Label
      ctx.fillStyle = "#64748b";
      const label =
        val >= 1000000
          ? "$" + (val / 1000000).toFixed(1) + "M"
          : val >= 1000
            ? "$" + (val / 1000).toFixed(0) + "K"
            : "$" + val.toFixed(0);
      ctx.fillText(label, padLeft - 10, y);
    }

    // Bars
    schedule.forEach((row, i) => {
      const x = padLeft + gap + i * (barW + gap);

      // Contribution portion
      const contribH = (row.deposits / maxVal) * chartH;
      const totalH = (row.balance / maxVal) * chartH;
      const interestH = totalH - contribH;

      // Contribution bar
      ctx.fillStyle = "#6366f1";
      ctx.beginPath();
      ctx.roundRect(
        x,
        padTop + chartH - contribH,
        barW,
        contribH,
        [0, 0, 3, 3],
      );
      ctx.fill();

      // Interest bar (stacked on top)
      if (interestH > 0) {
        ctx.fillStyle = "#34d399";
        ctx.beginPath();
        ctx.roundRect(
          x,
          padTop + chartH - totalH,
          barW,
          interestH,
          [3, 3, 0, 0],
        );
        ctx.fill();
      }

      // X-axis labels (show every nth year to avoid overlap)
      const labelEvery = barCount <= 10 ? 1 : barCount <= 25 ? 2 : 5;
      if (row.year % labelEvery === 0 || row.year === 1) {
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "center";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText(row.year, x + barW / 2, padTop + chartH + 20);
      }
    });

    // X-axis label
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.font = "12px Inter, sans-serif";
    const xLabel = translations[currentLang]?.chartYearAxis || "Year";
    ctx.fillText(xLabel, padLeft + chartW / 2, h - 6);
  }

  // ── Populate table ──────────────────────────────────
  function fillTable(schedule) {
    tableBody.innerHTML = "";
    schedule.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.year}</td>
        <td>${fmt(row.deposits)}</td>
        <td>${fmt(row.interest)}</td>
        <td>${fmt(row.balance)}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // ── Main calculate ──────────────────────────────────
  function calculate() {
    const P = Math.max(0, parseFloat(initialDeposit.value) || 0);
    const PMT = Math.max(0, parseFloat(monthlyContribution.value) || 0);
    const r = Math.max(0, parseFloat(annualRate.value) || 0) / 100;
    const t = Math.max(1, parseInt(years.value) || 1);
    const n = parseInt(compoundFreq.value);

    const schedule = computeSchedule(P, PMT, r, n, t);
    const last = schedule[schedule.length - 1];
    const totalDeposits = last.deposits;
    const totalInterest = last.interest;
    const futureValue = last.balance;

    // Update summary
    futureValueEl.textContent = fmt(futureValue);
    totalContribEl.textContent = fmt(totalDeposits);
    totalInterestEl.textContent = fmt(totalInterest);

    const pct = futureValue > 0 ? (totalInterest / futureValue) * 100 : 0;
    interestPctEl.textContent = pct.toFixed(0) + "%";

    // Draw charts
    const contribRatio = futureValue > 0 ? totalDeposits / futureValue : 1;
    const interestRatio = futureValue > 0 ? totalInterest / futureValue : 0;
    drawDonut(contribRatio, interestRatio);
    drawBarChart(schedule);

    // Fill table
    fillTable(schedule);

    // Animate results card
    const resultsCard = $("resultsCard");
    resultsCard.style.animation = "none";
    resultsCard.offsetHeight; // trigger reflow
    resultsCard.style.animation = "fadeUp 0.4s ease-out both";
  }

  // ── Language Setup ──────────────────────────────────
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("calcLang", lang);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[currentLang][key]) {
        if (el.tagName === "META") {
          el.setAttribute("content", translations[currentLang][key]);
        } else if (key === "pageTitle") {
          document.title = translations[currentLang][key];
        } else {
          el.innerHTML = translations[currentLang][key]; // This handles span HTML inside heroTitle gracefully
        }
      }
    });

    const isPt = lang === "pt";
    document.querySelectorAll(".prefix-currency").forEach((el) => {
      el.textContent = isPt ? "R$" : "$";
    });

    calculate();
  }

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  // ── Event listeners ─────────────────────────────────
  calculateBtn.addEventListener("click", calculate);

  // Also recalculate on Enter key in any input
  document.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") calculate();
    });
    // Live recalculation on change
    el.addEventListener("input", calculate);
    el.addEventListener("change", calculate);
  });

  // Handle resize for chart
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(calculate, 150);
  });

  // Initial setup
  setLanguage(currentLang);

  // ── PIX Modal Logic ─────────────────────────────────
  const pixModal = document.getElementById("pixModal");
  const openDonationBtn = document.getElementById("openDonationBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const copyPixBtn = document.getElementById("copyPixBtn");
  const pixCode = document.getElementById("pixCode");

  // Open modal
  if (openDonationBtn) {
    openDonationBtn.addEventListener("click", () => {
      pixModal.classList.add("active");
    });
  }

  // Close modal with button
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      pixModal.classList.remove("active");
    });
  }

  // Copy PIX Code
  if (copyPixBtn && pixCode) {
    copyPixBtn.addEventListener("click", () => {
      pixCode.select();
      pixCode.setSelectionRange(0, 99999); // For mobile devices

      try {
        navigator.clipboard.writeText(pixCode.value).then(() => {
          const originalText = copyPixBtn.innerHTML;
          copyPixBtn.innerHTML =
            '<span class="btn-icon">✅</span> Código Copiado!';
          copyPixBtn.style.background = "#22c55e"; // Green success color

          setTimeout(() => {
            copyPixBtn.innerHTML = originalText;
            copyPixBtn.style.background = ""; // Reset to default CSS
          }, 3000);
        });
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    });
  }
})();
