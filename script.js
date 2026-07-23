/* ============================================================
   박정아 · JEONG — 개인 홈 인터랙션
   나침반 · 네비게이션 · 테마 토글 · 스크롤 등장
   ============================================================ */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Year ----- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ----- Compass ticks ----- */
  var ticksG = document.getElementById("ticks");
  var svgNS = "http://www.w3.org/2000/svg";
  for(var i=0;i<72;i++){
    var major = i % 9 === 0;
    var a = (i/72)*Math.PI*2;
    var r1 = 96, r2 = major ? 84 : 90;
    var cx=120, cy=120;
    var line = document.createElementNS(svgNS,"line");
    line.setAttribute("x1", cx + r1*Math.sin(a));
    line.setAttribute("y1", cy - r1*Math.cos(a));
    line.setAttribute("x2", cx + r2*Math.sin(a));
    line.setAttribute("y2", cy - r2*Math.cos(a));
    line.setAttribute("class", "tick" + (major?" major":""));
    line.setAttribute("stroke-width", major?"1.4":".8");
    ticksG.appendChild(line);
  }

  /* ----- Nav scroll state + active link + compass needle ----- */
  var nav = document.getElementById("nav");
  var links = Array.prototype.slice.call(document.querySelectorAll("nav.links a"));
  var sections = links.map(function(a){ return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  var topSection = document.getElementById("top");

  function onScroll(){
    nav.classList.toggle("scrolled", window.scrollY > 24);

    // active section
    var pos = window.scrollY + window.innerHeight*0.32;
    var current = topSection;
    sections.forEach(function(s){ if(s.offsetTop <= pos) current = s; });
    links.forEach(function(a){
      a.classList.toggle("active", a.getAttribute("href") === "#"+ (current && current.id));
    });
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ----- Mobile menu ----- */
  var menuBtn = document.getElementById("menu");
  var linksNav = document.getElementById("links");
  function closeMenu(){
    linksNav.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded","false");
  }
  menuBtn.addEventListener("click", function(){
    var open = linksNav.classList.toggle("open");
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open?"true":"false");
  });
  links.forEach(function(a){ a.addEventListener("click", closeMenu); });

  /* ----- Theme toggle ----- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme");
  var icon = document.getElementById("theme-icon");
  var sun = '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
  var moon = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  function applyTheme(t){
    root.setAttribute("data-theme", t);
    icon.innerHTML = t === "light" ? moon : sun;
  }
  applyTheme("dark");
  themeBtn.addEventListener("click", function(){
    applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  });

  /* ----- Reveal on scroll ----- */
  if(reduce){
    document.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, {threshold:0.12, rootMargin:"0px 0px -8% 0px"});
    document.querySelectorAll(".reveal").forEach(function(el, i){
      el.style.transitionDelay = ((i % 4) * 70) + "ms";
      io.observe(el);
    });
  }

  /* ----- PDF book viewer modal ----- */
  var pdfModal = document.getElementById("pdfModal");
  var pdfFrame = document.getElementById("pdfModalFrame");
  var pdfImg = document.getElementById("pdfModalImg");
  var pdfTitle = document.getElementById("pdfModalTitle");
  var pdfOpenNew = document.getElementById("pdfModalOpenNew");
  var pdfLastFocus = null;
  var imageExt = /\.(png|jpe?g|gif|webp|svg)$/i;

  function openPdfModal(src, title){
    pdfLastFocus = document.activeElement;
    if(imageExt.test(src)){
      pdfFrame.hidden = true; pdfFrame.src = "";
      pdfImg.hidden = false; pdfImg.src = src; pdfImg.alt = title || "";
    } else {
      pdfImg.hidden = true; pdfImg.src = "";
      pdfFrame.hidden = false; pdfFrame.src = src;
    }
    pdfOpenNew.href = src;
    pdfTitle.textContent = title || "";
    pdfModal.classList.add("open");
    pdfModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("pdf-modal-active");
  }
  function closePdfModal(){
    pdfModal.classList.remove("open");
    pdfModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("pdf-modal-active");
    pdfFrame.src = "";
    pdfImg.src = "";
    if(pdfLastFocus){ pdfLastFocus.focus(); }
  }

  document.querySelectorAll("[data-pdf-open]").forEach(function(btn){
    btn.addEventListener("click", function(){
      openPdfModal(btn.getAttribute("data-pdf-open"), btn.getAttribute("data-pdf-title"));
    });
  });
  document.querySelectorAll("[data-pdf-close]").forEach(function(el){
    el.addEventListener("click", closePdfModal);
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && pdfModal.classList.contains("open")){ closePdfModal(); }
  });

  /* ----- Lecture archive QR popup ----- */
  function openQR(url, title){
    var qrSrc = "https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=12&data=" + encodeURIComponent(url);
    var win = window.open("", "lecture-qr", "width=560,height=760");
    if(!win){ return; }
    win.document.write(
      '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>' + (title || "QR 코드") + '</title>' +
      '<style>' +
      'body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;' +
      'background:#0B172E;color:#F3EEE2;font-family:"Noto Sans KR",system-ui,sans-serif;text-align:center;padding:32px;box-sizing:border-box;}' +
      'h1{margin:0 0 26px;max-width:400px;font-size:1.2rem;font-weight:400;letter-spacing:-.01em;}' +
      '.qr-box{padding:20px;background:#FBF8F0;border-radius:16px;box-shadow:0 22px 60px rgba(0,0,0,.4);}' +
      'img{display:block;width:min(70vw,420px);height:auto;}' +
      'button{margin-top:26px;padding:10px 18px;border:1px solid #C8A24B;border-radius:100px;background:none;color:#F3EEE2;font-size:.82rem;cursor:pointer;}' +
      '</style></head><body>' +
      '<h1>' + (title || "QR 코드를 스캔하세요") + '</h1>' +
      '<div class="qr-box"><img src="' + qrSrc + '" alt="QR 코드"></div>' +
      '<button type="button" onclick="window.close()">닫기</button>' +
      '</body></html>'
    );
    win.document.close();
  }
  document.querySelectorAll("[data-qr-open]").forEach(function(btn){
    btn.addEventListener("click", function(){
      openQR(btn.getAttribute("data-qr-open"), btn.getAttribute("data-qr-title"));
    });
  });
})();
