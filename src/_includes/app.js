(function () {

    var faceCanvas = document.getElementById('face');
    var handsCanvas = document.getElementById('hands');
    var faceCtx = faceCanvas.getContext('2d');
    var handsCtx = handsCanvas.getContext('2d');
    var digital = document.getElementById('digital');

    var cssW = 0, cssH = 0, dpr = 1;

    function resize(force) {

        var w = document.documentElement.clientWidth || window.innerWidth;
        var h = document.documentElement.clientHeight || window.innerHeight;
        var ndpr = window.devicePixelRatio || 1;

        if (!w || !h) return false;

        // If not forced and nothing changed, return false (no action needed)
        if (!force && w === cssW && h === cssH && ndpr === dpr) return false;

        cssW = w;
        cssH = h;
        dpr = ndpr;

        [faceCanvas, handsCanvas].forEach(function (c) {
            c.style.width = cssW + 'px';
            c.style.height = cssH + 'px';
            c.width = Math.floor(cssW * dpr);
            c.height = Math.floor(cssH * dpr);
        });

        faceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        handsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Immediate face redraw on resize/dimension change
        drawFace();

        return true;
    }

    function drawHand(ctx, cx, cy, angle, len, width, color) {

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(angle) * len,
            cy + Math.sin(angle) * len
        );
        ctx.stroke();
    }

    function pad(n) {
        return (n < 10 ? '0' : '') + n;
    }

    function getMetrics() {
        var w = cssW;
        var h = cssH;
        var digitalSpace = h * 0.28;
        var r = Math.min(w, h - digitalSpace) * 0.45;
        var cx = w / 2;
        var cy = (h - digitalSpace) / 2;
        return { w: w, h: h, r: r, cx: cx, cy: cy };
    }

    function drawFace() {
        var m = getMetrics();
        var ctx = faceCtx;

        ctx.clearRect(0, 0, m.w, m.h);

        ctx.fillStyle = '#F0F3F5';
        ctx.beginPath();
        ctx.arc(m.cx, m.cy, m.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#222';
        ctx.lineWidth = m.r * 0.03;
        ctx.beginPath();
        ctx.arc(m.cx, m.cy, m.r, 0, Math.PI * 2);
        ctx.stroke();

        for (var i = 0; i < 60; i++) {
            var a = (i / 60) * Math.PI * 2 - Math.PI / 2;
            var cosA = Math.cos(a);
            var sinA = Math.sin(a);

            if (i % 5 === 0) {
                var inner = m.r * 0.82;
                var outer = m.r * 0.98;
                ctx.strokeStyle = '#222';
                ctx.lineWidth = m.r * 0.02;
                ctx.beginPath();
                ctx.moveTo(m.cx + cosA * inner, m.cy + sinA * inner);
                ctx.lineTo(m.cx + cosA * outer, m.cy + sinA * outer);
                ctx.stroke();
            } else {
                var inner2 = m.r * 0.90;
                var outer2 = m.r * 0.98;
                ctx.strokeStyle = '#888';
                ctx.lineWidth = m.r * 0.008;
                ctx.beginPath();
                ctx.moveTo(m.cx + cosA * inner2, m.cy + sinA * inner2);
                ctx.lineTo(m.cx + cosA * outer2, m.cy + sinA * outer2);
                ctx.stroke();
            }
        }

        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = Math.floor(m.r * 0.18) + 'px monospace';

        for (var n = 1; n <= 12; n++) {
            var sec = n * 5;
            var a2 = (sec / 60) * Math.PI * 2 - Math.PI / 2;
            var rr = m.r * 0.68;
            ctx.fillText(String(sec), m.cx + Math.cos(a2) * rr, m.cy + Math.sin(a2) * rr);
        }
    }

    function drawHands(now) {
        var m = getMetrics();
        if (!m.w || !m.h) return; // Guard against uninitialized metrics

        var ctx = handsCtx;
        ctx.clearRect(0, 0, m.w, m.h);

        var seconds = (now.getTime() / 1000) % 60;
        var base = (seconds / 60) * Math.PI * 2 - Math.PI / 2;

        var handLen = m.r * 0.92;
        var width = m.r * 0.055;

        drawHand(ctx, m.cx, m.cy, base, handLen, width, '#E53935');
        drawHand(ctx, m.cx, m.cy, base + Math.PI / 2, handLen, width, '#43A047');
        drawHand(ctx, m.cx, m.cy, base + Math.PI, handLen, width, '#1E88E5');
        drawHand(ctx, m.cx, m.cy, base + 3 * Math.PI / 2, handLen, width, '#FFD600');

        ctx.fillStyle = '#00d4e5';
        ctx.beginPath();
        ctx.arc(m.cx, m.cy, m.r * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }

    function loop() {
        // Only trigger resize check if needed
        resize(false);

        var now = new Date();
        drawHands(now);

        /* digital clock */
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var secs = now.getSeconds();

        var ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        if (hours === 0) hours = 12;

        digital.textContent =
            hours + ":" + pad(minutes) + ":" + pad(secs) + " " + ampm;

        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', function () { resize(true); });

    // Initial setup and first draw
    setTimeout(function () {
        if (resize(true)) {
            requestAnimationFrame(loop);
        }
    }, 0);

})();
