(function(f, e) {
    function c(a, b) {
        function d(a, b) {
            return function() {
                return a.apply(b, arguments)
            }
        }
        b = b || {};
        this.trackingClick = !1;
        this.trackingClickStart = 0;
        this.targetElement = null;
        this.lastTouchIdentifier = this.touchStartY = this.touchStartX = 0;
        this.touchBoundary = b.touchBoundary || 10;
        this.layer = a;
        this.tapDelay = b.tapDelay || 200;
        this.tapTimeout = b.tapTimeout || 700;
        if (!c.notNeeded(a)) {
            for (var l = "onMouse onClick onTouchStart onTouchMove onTouchEnd onTouchCancel".split(" "), e = 0, f = l.length; e < f; e++)
                this[l[e]] = d(this[l[e]], this);
            h && (a.addEventListener("mouseover", this.onMouse, !0), a.addEventListener("mousedown", this.onMouse, !0), a.addEventListener("mouseup", this.onMouse, !0));
            a.addEventListener("click", this.onClick, !0);
            a.addEventListener("touchstart", this.onTouchStart, !1);
            a.addEventListener("touchmove", this.onTouchMove, !1);
            a.addEventListener("touchend", this.onTouchEnd, !1);
            a.addEventListener("touchcancel", this.onTouchCancel, !1);
            Event.prototype.stopImmediatePropagation || (a.removeEventListener = function(b, d, c) {
                var e = Node.prototype.removeEventListener;
                "click" === b ? e.call(a, b, d.hijacked || d, c) : e.call(a, b, d, c)
            }, a.addEventListener = function(b, d, c) {
                var e = Node.prototype.addEventListener;
                "click" === b ? e.call(a, b, d.hijacked || (d.hijacked = function(a) {
                    a.propagationStopped || d(a)
                }), c) : e.call(a, b, d, c)
            });
            if ("function" === typeof a.onclick) {
                var g = a.onclick;
                a.addEventListener("click", function(a) {
                    g(a)
                }, !1);
                a.onclick = null
            }
        }
    }
    var k = navigator.userAgent,
        m = 0 <= k.indexOf("Windows Phone"),
        h = 0 < k.indexOf("Android") && !m,
        g = /iP(ad|hone|od)/.test(k) && !m,
        n = g && /OS 4_\d(_\d)?/.test(k),
        p = g && /OS [6-7]_\d/.test(k),
        q = 0 < k.indexOf("BB10");
    c.prototype.needsClick = function(a) {
        switch (a.nodeName.toLowerCase()) {
        case "button":
        case "select":
        case "textarea":
            if (a.disabled)
                return !0;
            break;
        case "input":
            if (g && "file" === a.type || a.disabled)
                return !0;
            break;
        case "label":
        case "iframe":
        case "video":
            return !0
        }
        return /\bneedsclick\b/.test(a.className)
    };
    c.prototype.needsFocus = function(a) {
        switch (a.nodeName.toLowerCase()) {
        case "textarea":
            return !0;
        case "select":
            return !h;
        case "input":
            switch (a.type) {
            case "button":
            case "checkbox":
            case "file":
            case "image":
            case "radio":
            case "submit":
                return !1
            }
            return !a.disabled && !a.readOnly;
        default:
            return /\bneedsfocus\b/.test(a.className)
        }
    };
    c.prototype.sendClick = function(a, b) {
        e.activeElement && e.activeElement !== a && e.activeElement.blur();
        var d = b.changedTouches[0];
        var c = e.createEvent("MouseEvents");
        c.initMouseEvent(this.determineEventType(a), !0, !0, f, 1, d.screenX, d.screenY, d.clientX, d.clientY, !1, !1, !1, !1, 0, null);
        c.forwardedTouchEvent = !0;
        a.dispatchEvent(c)
    };
    c.prototype.determineEventType = function(a) {
        return h && "select" === a.tagName.toLowerCase() ? "mousedown" : "click"
    };
    c.prototype.focus = function(a) {
        if (g && a.setSelectionRange && 0 !== a.type.indexOf("date") && "time" !== a.type && "month" !== a.type && "email" !== a.type) {
            var b = a.value.length;
            a.setSelectionRange(b, b)
        } else
            a.focus()
    };
    c.prototype.updateScrollParent = function(a) {
        var b = a.fastClickScrollParent;
        if (!b || !b.contains(a)) {
            var d = a;
            do {
                if (d.scrollHeight > d.offsetHeight) {
                    b = d;
                    a.fastClickScrollParent = d;
                    break
                }
                d = d.parentElement
            } while (d)
        }
        b && (b.fastClickLastScrollTop = b.scrollTop)
    };
    c.prototype.getTargetElementFromEventTarget = function(a) {
        return a.nodeType === Node.TEXT_NODE ? a.parentNode : a
    };
    c.prototype.onTouchStart = function(a) {
        if (1 < a.targetTouches.length)
            return !0;
        var b = this.getTargetElementFromEventTarget(a.target);
        var d = a.targetTouches[0];
        if (g) {
            var c = f.getSelection();
            if (c.rangeCount && !c.isCollapsed)
                return !0;
            if (!n) {
                if (d.identifier && d.identifier === this.lastTouchIdentifier)
                    return a.preventDefault(), !1;
                this.lastTouchIdentifier = d.identifier;
                this.updateScrollParent(b)
            }
        }
        this.trackingClick = !0;
        this.trackingClickStart = a.timeStamp;
        this.targetElement = b;
        this.touchStartX = d.pageX;
        this.touchStartY = d.pageY;
        a.timeStamp - this.lastClickTime < this.tapDelay && a.preventDefault();
        return !0
    };
    c.prototype.touchHasMoved = function(a) {
        a = a.changedTouches[0];
        var b = this.touchBoundary;
        return Math.abs(a.pageX - this.touchStartX) > b || Math.abs(a.pageY - this.touchStartY) > b ? !0 : !1
    };
    c.prototype.onTouchMove = function(a) {
        if (!this.trackingClick)
            return !0;
        if (this.targetElement !== this.getTargetElementFromEventTarget(a.target) || this.touchHasMoved(a))
            this.trackingClick = !1, this.targetElement = null;
        return !0
    };
    c.prototype.findControl = function(a) {
        return void 0 !== a.control ? a.control : a.htmlFor ? e.getElementById(a.htmlFor) : a.querySelector("button,input:not([type=hidden]),keygen,meter,output,progress,select,textarea")
    };
    c.prototype.onTouchEnd = function(a) {
        var b = this.targetElement;
        if (!this.trackingClick)
            return !0;
        if (a.timeStamp - this.lastClickTime < this.tapDelay)
            return this.cancelNextClick = !0;
        if (a.timeStamp - this.trackingClickStart > this.tapTimeout)
            return !0;
        this.cancelNextClick = !1;
        this.lastClickTime = a.timeStamp;
        var d = this.trackingClickStart;
        this.trackingClick = !1;
        this.trackingClickStart = 0;
        if (p) {
            var c = a.changedTouches[0];
            b = e.elementFromPoint(c.pageX - f.pageXOffset, c.pageY - f.pageYOffset) || b;
            b.fastClickScrollParent = this.targetElement.fastClickScrollParent
        }
        c = b.tagName.toLowerCase();
        if ("label" === c) {
            if (d = this.findControl(b)) {
                this.focus(b);
                if (h)
                    return !1;
                b = d
            }
        } else if (this.needsFocus(b)) {
            if (100 < a.timeStamp - d || g && f.top !== f && "input" === c)
                return this.targetElement = null, !1;
            this.focus(b);
            this.sendClick(b, a);
            g && "select" === c || (this.targetElement = null, a.preventDefault());
            return !1
        }
        if (g && !n && (d = b.fastClickScrollParent) && d.fastClickLastScrollTop !== d.scrollTop)
            return !0;
        this.needsClick(b) || (a.preventDefault(), this.sendClick(b, a));
        return !1
    };
    c.prototype.onTouchCancel = function() {
        this.trackingClick = !1;
        this.targetElement = null
    };
    c.prototype.onMouse = function(a) {
        return this.targetElement && !a.forwardedTouchEvent && a.cancelable ? !this.needsClick(this.targetElement) || this.cancelNextClick ? (a.stopImmediatePropagation ? a.stopImmediatePropagation() : a.propagationStopped = !0, a.stopPropagation(), a.preventDefault(), !1) : !0 : !0
    };
    c.prototype.onClick = function(a) {
        if (this.trackingClick)
            return this.targetElement = null, this.trackingClick = !1, !0;
        if ("submit" === a.target.type && 0 === a.detail)
            return !0;
        a = this.onMouse(a);
        a || (this.targetElement = null);
        return a
    };
    c.prototype.destroy = function() {
        var a = this.layer;
        h && (a.removeEventListener("mouseover", this.onMouse, !0), a.removeEventListener("mousedown", this.onMouse, !0), a.removeEventListener("mouseup", this.onMouse, !0));
        a.removeEventListener("click", this.onClick, !0);
        a.removeEventListener("touchstart", this.onTouchStart, !1);
        a.removeEventListener("touchmove", this.onTouchMove, !1);
        a.removeEventListener("touchend", this.onTouchEnd, !1);
        a.removeEventListener("touchcancel", this.onTouchCancel, !1)
    };
    c.notNeeded = function(a) {
        var b,
            c;
        if ("undefined" === typeof f.ontouchstart)
            return !0;
        if (c = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1])
            if (h) {
                if ((b = e.querySelector("meta[name=viewport]")) && (-1 !== b.content.indexOf("user-scalable=no") || 31 < c && e.documentElement.scrollWidth <= f.outerWidth))
                    return !0
            } else
                return !0;
        return q && (b = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/), 10 <= b[1] && 3 <= b[2] && (b = e.querySelector("meta[name=viewport]")) && (-1 !== b.content.indexOf("user-scalable=no") || e.documentElement.scrollWidth <= f.outerWidth)) || "none" === a.style.msTouchAction || "manipulation" === a.style.touchAction || 27 <= +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1] && (b = e.querySelector("meta[name=viewport]")) && (-1 !== b.content.indexOf("user-scalable=no") || e.documentElement.scrollWidth <= f.outerWidth) ? !0 : "none" === a.style.touchAction || "manipulation" === a.style.touchAction ? !0 : !1
    };
    c.attach = function(a, b) {
        return new c(a, b)
    };
    f.FastClick = c
})(window, document);
(function(a) {
    "use strict";
    var b = a.documentElement,
        c = b.classList;
    navigator.userAgent.indexOf("Cydia") != -1 ? (a.title.indexOf(" \u00b7 ") != -1 ? a.title = a.title.split(" \u00b7 ")[0] : void 0, c.add("cydia")) : c.remove("cydia", "depiction");
    if (window.devicePixelRatio > 1) {
        var d = a.createElement("div");
        d.style.border = ".5px solid transparent";
        b.appendChild(d);
        if (d.offsetHeight)
            c.add("has-subpixel");
        b.removeChild(d);
        if (devicePixelRatio >= 3)
            c.add("has-subpixel-3x")
    }
    if (window.FastClick)
        a.addEventListener("DOMContentLoaded", function() {
            FastClick.attach(a.body)
        })
}(document));
(function(document) {
    "use strict";
    var promo = document.querySelector("#promo");
    if (promo) {
        var promos = document.querySelectorAll("#promo li");
        var chosenOne = Math.floor(Math.random() * promos.length);
        for (var i = 0; i < promos.length; i++) {
            if (i != chosenOne) {
                promo.removeChild(promos[i]);
            }
        }
        promo.classList.add("show");
    }
    if (document.documentElement.classList.contains("cydia")) {
        var base = document.createElement("base");
        base.target = "_open";
        document.head.appendChild(base);
    }
    function parseVersionString(version) {
        var bits = version.split(".");
        return [bits[0], bits[1] ? bits[1] : 0, bits[2] ? bits[2] : 0];
    }
    function compareVersions(ours, theirs) {
        for (var i = 0; i < 4; i++) {
            var a = Number(theirs[i]),
                b = Number(ours[i]);
            if (a > b) {
                return 1;
            } else if (a < b) {
                return -1;
            }
        }
        return 0;
    }
    var prerequisite = document.querySelector(".prerequisite"),
        version = navigator.appVersion.match(/CPU (iPhone )?OS (\d+)_(\d+)(_(\d+))? like/i);
    if (!prerequisite || !version) {
        return;
    }
    var osVersion = [version[2], version[3], version[5] ? version[5] : 0],
        osString = osVersion[0] + "." + osVersion[1] + (osVersion[2] && osVersion[2] != 0 ? "." + osVersion[2] : ""),
        minString = prerequisite.dataset.minIos,
        maxString = prerequisite.dataset.maxIos,
        minVersion = parseVersionString(minString),
        maxVersion = maxString ? parseVersionString(maxString) : null,
        message = "supported",
        map = [];
    if (compareVersions(minVersion, osVersion) == -1) {
        message = "needs-upgrade";
        map = [minString];
    } else if (maxVersion != null && compareVersions(osVersion, maxVersion) == -1) {
        if ("unsupported" in prerequisite.dataset) {
            message = "unsupported";
            map = [minString, maxString];
        } else {
            message = "unconfirmed";
            map = [osString];
        }
    }
    var i = 0;
    prerequisite.querySelector("p").innerHTML = document.querySelector("#prerequisite-" + message).innerText.replace(/%s/g, function() {
        return map[i++];
    });
    prerequisite.classList.add("show");
}(document));
