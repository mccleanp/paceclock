(function () {

    var faceCanvas = document.getElementById('face');
    var handsCanvas = document.getElementById('hands');
    var faceCtx = faceCanvas.getContext('2d');
    var handsCtx = handsCanvas.getContext('2d');
    var digital = document.getElementById('digital');
    var dateEl = document.getElementById('date');

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var cssW = 0, cssH = 0, dpr = 1;
    var faceNeedsRedraw = true;

    function resize(force) {

        var w = document.documentElement.clientWidth || window.innerWidth;
        var h = document.documentElement.clientHeight || window.innerHeight;
        var ndpr = window.devicePixelRatio || 1;

        if (!w || !h) return false;
        if (!force && w === cssW && h === cssH && ndpr === dpr) return true;

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

        faceNeedsRedraw = true;
        return true;
    }

    function drawHand(ctx, cx, cy, angle, len, color) {
        var baseWidth = len * 0.15;
        var shoulderWidth = len * 0.05;
        var shoulderPos = len * 0.92;
        var tipWidth = len * 0.02;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, baseWidth / 2);
        ctx.lineTo(shoulderPos, shoulderWidth / 2);
        ctx.lineTo(len, tipWidth / 2);
        ctx.lineTo(len, -tipWidth / 2);
        ctx.lineTo(shoulderPos, -shoulderWidth / 2);
        ctx.lineTo(0, -baseWidth / 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
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
        if (!faceNeedsRedraw) return;

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

            if (i % 5 === 0) {
                ctx.save();
                ctx.translate(m.cx, m.cy);
                ctx.rotate(a);
                ctx.fillStyle = '#222';
                ctx.beginPath();
                ctx.moveTo(m.r * 0.97, -m.r * 0.04);
                ctx.lineTo(m.r * 0.97, m.r * 0.04);
                ctx.lineTo(m.r * 0.81, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else {
                var cosA = Math.cos(a);
                var sinA = Math.sin(a);
                var inner2 = m.r * 0.89;
                var outer2 = m.r * 0.97;
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
            var rr = m.r * 0.685;
            ctx.fillText(String(sec), m.cx + Math.cos(a2) * rr, m.cy + Math.sin(a2) * rr);
        }

        faceNeedsRedraw = false;
    }

    function drawHands(now) {
        var m = getMetrics();
        var ctx = handsCtx;

        ctx.clearRect(0, 0, m.w, m.h);

        var seconds = (now.getTime() / 1000) % 60;
        var base = (seconds / 60) * Math.PI * 2 - Math.PI / 2;

        var handLen = m.r * 0.90;

        drawHand(ctx, m.cx, m.cy, base, handLen, '#E53935');
        drawHand(ctx, m.cx, m.cy, base + Math.PI / 2, handLen, '#43A047');
        drawHand(ctx, m.cx, m.cy, base + Math.PI, handLen, '#1E88E5');
        drawHand(ctx, m.cx, m.cy, base + 3 * Math.PI / 2, handLen, '#FFD600');

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(m.cx, m.cy, m.r * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }

    function draw(now) {
        if (!resize(false)) return;

        drawFace();
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

        /* date */
        var dayName = days[now.getDay()];
        var monthName = months[now.getMonth()];
        var dateStr = dayName + ", " + now.getDate() + " " + monthName + " " + now.getFullYear();
        dateEl.textContent = dateStr;
    }

    function loop() {
        var now = new Date();
        draw(now);
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', function () { resize(true); });

    setTimeout(function () { resize(true); }, 0);
    setTimeout(function () { resize(true); }, 200);
    setTimeout(function () { resize(true); }, 1000);

    requestAnimationFrame(loop);

})();
