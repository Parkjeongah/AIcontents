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

  function onScroll(){
    nav.classList.toggle("scrolled", window.scrollY > 24);

    // active section
    var pos = window.scrollY + window.innerHeight*0.32;
    var current = sections[0];
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
})();
