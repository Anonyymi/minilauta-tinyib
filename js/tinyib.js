var newRepliesCount = 0;
var newRepliesNotice = [];
var originalTitle = "";
var blinkTitle = false;

function setVal(key, val) {
    window.localStorage.setItem(key, val);
}

function getVal(key) {
    return window.localStorage.getItem(key);
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setStylesheet(style) {
    document.cookie = 'tinyib_style=' + style + '; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/; SameSite=Strict';
    location.reload();
}

function reloadCAPTCHA() {
    $("#captcha").val("").focus();
    $("#captchaimage").attr("src", $("#captchaimage").attr("src") + "#new")

    return false;
}

function quotePost(postID) {
    $("#message").val($("#message").val() + '>>' + postID + "\n").focus();

    return false;
}

function expandFile(e, id) {
    if (e == undefined || e.which == undefined || e.which == 1) {
        if ($("#thumbfile" + id).attr('expanded') != 'true') {
            $("#thumbfile" + id).attr('expanded', 'true');
            $("#file" + id).html(decodeURIComponent($("#expand" + id).text())).css("visibility", "hidden");
            setTimeout(function (id) {
                return function () {
                    $("#thumbfile" + id).hide();
                    $("#file" + id).css("visibility", "visible").show();
                }
            }(id), 100);
        } else {
            $("#file" + id).hide().html('');
            $("#thumbfile" + id).show().attr('expanded', 'false').scrollintoview();
        }

        return false;
    }

    return true;
}

function updateTitle() {
    if (originalTitle == "") {
        originalTitle = document.title;
    }

    if (!blinkTitle) {
        document.title = originalTitle;
        return;
    }

    if (document.title == originalTitle) {
        document.title = "(" + newRepliesCount + " new)";
    } else {
        document.title = originalTitle;
    }

    setTimeout(updateTitle, 1000);
}

function autoRefresh() {
    $.ajax("../imgboard.php?posts=" + autoRefreshThreadID + "&since=" + autoRefreshPostID)
        .done(function (d) {
            try {
                data = JSON.parse(d);
            } catch (e) {
                console.log("Failed to auto-refresh thread: " + e);
                return;
            }

            if (Object.keys(data).length == 0) {
                return
            }

            posts = $("#posts");

            if (newRepliesNotice.length > 0) {
                if (!newRepliesNotice.is(":visible")) {
                    newRepliesNotice.appendTo(posts);
                    newRepliesNotice.show();
                }
            } else {
                newRepliesNotice = $("<div>", {
                    "id": "newreplies"
                });
                newRepliesNotice.text('New');
                posts.append(newRepliesNotice);
            }

            Object.keys(data).forEach(function (key) {
                posts.append(data[key]);

                setPostAttributes('#post' + key, true);

                autoRefreshPostID = key;
                newRepliesCount++;
            });

            if (!document.hasFocus() && !blinkTitle) {
                blinkTitle = true;
                updateTitle();
            }
        })
        .fail(function () {
            console.log("Failed to auto-refresh thread.");
        })
        .always(function () {
            setTimeout(autoRefresh, autoRefreshDelay * 1000);
        });
}

window.addEventListener('DOMContentLoaded', function (e) {
    $('#switchStylesheet').on('change', function () {
        if (this.value == "") {
            return;
        }

        setStylesheet(this.value);
        this.value = "";
    });

    // backup postform data in-case of error
    $('#message').on('blur', function (e) {
        setVal('postform/message', e.target.value);
    });

    // restore postform data in-case of error
    if (getVal('postform/restore') === 'true') {
        document.getElementById('message').value = getVal('postform/message');
        setVal('postform/restore', 'false');
    }

    // reset postform data so it can't be leaked
    setVal('postform/message', '');

    var newpostpassword = $("#newpostpassword");
    if (newpostpassword) {
        newpostpassword.change(function () {
            var newpostpassword = $("#newpostpassword");
            if (newpostpassword) {
                var expiration_date = new Date();
                expiration_date.setFullYear(expiration_date.getFullYear() + 7);
                document.cookie = "tinyib_password=" + encodeURIComponent(newpostpassword.val()) + "; path=/; expires=" + expiration_date.toGMTString();
            }
        });
    }

    var password = getCookie("tinyib_password");
    if (password && password != "") {
        if (newpostpassword) {
            newpostpassword.val(password);
        }

        var deletepostpassword = $("#deletepostpassword");
        if (deletepostpassword) {
            deletepostpassword.val(password);
        }
    }

    if (window.location.hash) {
        if (window.location.hash.match(/^#q[0-9]+$/i) !== null) {
            var quotePostID = window.location.hash.match(/^#q[0-9]+$/i)[0].substr(2);
            if (quotePostID != '') {
                quotePost(quotePostID);
            }
        }
    }

    if (typeof autoRefreshDelay !== 'undefined' && typeof autoRefreshPostID !== 'undefined' && typeof autoRefreshThreadID !== 'undefined') {
        setTimeout(autoRefresh, autoRefreshDelay * 1000);
    }
});

$(window).focus(function () {
    newRepliesCount = 0;
    blinkTitle = false;
});

$(window).blur(function () {
    if (newRepliesNotice.length == 0) {
        return;
    }

    newRepliesCount = 0;
    newRepliesNotice.hide();
});

$(document).ready(function () {
    setPostAttributes(document, false);
});

var mouseX;
var mouseY;
$(document).mousemove( function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
});

var downloaded_posts = [];
function setPostAttributes(element, autorefresh) {
    var base_url = './imgboard.php?';
    if (window.location.href.includes('/res/')) {
        base_url = '../imgboard.php?res&';
    }
    base_url += 'preview=';
    $('a', element).each(function () {
        var m = null;
        if ($(this).attr('href')) {
            m = $(this).attr('href').match(/.*\/[0-9]+?#([0-9]+)/i);
        }
        if (m == null && $(this).attr('href')) {
            m = $(this).attr('href').match(/\#([0-9]+)/i);
        }
        if (m == null) {
            return;
        }

        if ($(this).html() == 'No.') {
            $(element).attr('postID', m[1]).attr('postLink', $(this).attr('href')).addClass('post');
        } else if ($(this).attr('refID') == undefined) {
            var m2 = $(this).html().match(/^\&gt\;\&gt\;[0-9]+/i);
            if (m2 == null) {
                return;
            }

            if (enablebacklinks && autorefresh) {
                backlinks = $('#backlinks' + m[1]);
                if (backlinks) {
                    if (backlinks.html() == '') {
                        backlinks.append('&nbsp;');
                    } else {
                        backlinks.append(', ');
                    }
                    backlinks.append('<a href="' + $(element).attr('postLink') + '">&gt;&gt;' + $(element).attr('postID') + '<a>');
                    setPostAttributes(backlinks, false);
                }
            }

            $(this).attr('refID', m[1]);
            $(this).hover(function (e) {
                var preview = document.getElementById('ref' + $(this).attr('refID'));
                if (!preview) {
                    var refBoard = $(this).attr('refBoard') || '';
                    var refID = $(this).attr('refID');
                    var combinedID = refBoard + refID;

                    var preview = document.createElement('div');
                    preview.id = 'ref' + combinedID;
                    preview.style.position = 'absolute';
                    preview.style.textAlign = 'left';

                    $(preview).attr('refBoard', refBoard);
                    $(preview).attr('refID', refID);

                    var refpost = $('#post' + combinedID);

                    if (downloaded_posts[combinedID]) {
                        preview.className = 'hoverpost';
                        $(preview).html(downloaded_posts[combinedID]);
                        if ($(preview).find('div:first').hasClass('reply')) {
                            $(preview).addClass('reply');
                        }
                    } else if (refpost.html() && refpost.html() != undefined) {
                        preview.className = 'hoverpost';
                        $(preview).html(refpost.html());
                        if (refpost.prop("tagName").toLowerCase() == 'td') {
                            $(preview).addClass('reply');
                        }
                    } else {
                        extraclasses = '';
                        if ($(this).hasClass('refreply')) {
                            extraclasses = ' reply';
                        }
                        $(preview).html('<div class="hoverpost' + extraclasses + '" style="padding: 14px;">Loading...</div>');
                        $(preview).fadeIn(125);
                        $.ajax({
                            url: (refBoard.length !== 0 ? '/' + refBoard + '/imgboard.php?refboard=' + refBoard + '&preview=' : base_url) + refID,
                            success: function (response) {
                                downloaded_posts[combinedID] = response;
                                preview.className = 'hoverpost';
                                $(preview).html(response);
                                if ($(preview).find('div:first').hasClass('reply')) {
                                    $(preview).addClass('reply');
                                }
                            },
                            dataType: 'html'
                        });
                    }

                    $(document.body).append(preview);
                }
                $(preview).css('left', mouseX+14).css('top', mouseY+7);
            }, function (e) {
                var refBoard = $(this).attr('refBoard') || '';
                var refID = $(this).attr('refID');
                var combinedID = refBoard + refID;
                
                $('#ref' + combinedID).remove();
            });
        }
    });
}

/*
 * jQuery scrollintoview() plugin and :scrollable selector filter
 *
 * Version 1.8 (14 Jul 2011)
 * Requires jQuery 1.4 or newer
 *
 * Copyright (c) 2011 Robert Koritnik
 * Licensed under the terms of the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */
(function (f) {
    var c = {
        vertical: {x: false, y: true},
        horizontal: {x: true, y: false},
        both: {x: true, y: true},
        x: {x: true, y: false},
        y: {x: false, y: true}
    };
    var b = {duration: "fast", direction: "both"};
    var e = /^(?:html)$/i;
    var g = function (k, j) {
        j = j || (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(k, null) : k.currentStyle);
        var i = document.defaultView && document.defaultView.getComputedStyle ? true : false;
        var h = {
            top: (parseFloat(i ? j.borderTopWidth : f.css(k, "borderTopWidth")) || 0),
            left: (parseFloat(i ? j.borderLeftWidth : f.css(k, "borderLeftWidth")) || 0),
            bottom: (parseFloat(i ? j.borderBottomWidth : f.css(k, "borderBottomWidth")) || 0),
            right: (parseFloat(i ? j.borderRightWidth : f.css(k, "borderRightWidth")) || 0)
        };
        return {
            top: h.top,
            left: h.left,
            bottom: h.bottom,
            right: h.right,
            vertical: h.top + h.bottom,
            horizontal: h.left + h.right
        }
    };
    var d = function (h) {
        var j = f(window);
        var i = e.test(h[0].nodeName);
        return {
            border: i ? {top: 0, left: 0, bottom: 0, right: 0} : g(h[0]),
            scroll: {top: (i ? j : h).scrollTop(), left: (i ? j : h).scrollLeft()},
            scrollbar: {
                right: i ? 0 : h.innerWidth() - h[0].clientWidth,
                bottom: i ? 0 : h.innerHeight() - h[0].clientHeight
            },
            rect: (function () {
                var k = h[0].getBoundingClientRect();
                return {
                    top: i ? 0 : k.top,
                    left: i ? 0 : k.left,
                    bottom: i ? h[0].clientHeight : k.bottom,
                    right: i ? h[0].clientWidth : k.right
                }
            })()
        }
    };
    f.fn.extend({
        scrollintoview: function (j) {
            j = f.extend({}, b, j);
            j.direction = c[typeof (j.direction) === "string" && j.direction.toLowerCase()] || c.both;
            var n = "";
            if (j.direction.x === true) {
                n = "horizontal"
            }
            if (j.direction.y === true) {
                n = n ? "both" : "vertical"
            }
            var l = this.eq(0);
            var i = l.closest(":scrollable(" + n + ")");
            if (i.length > 0) {
                i = i.eq(0);
                var m = {e: d(l), s: d(i)};
                var h = {
                    top: m.e.rect.top - (m.s.rect.top + m.s.border.top),
                    bottom: m.s.rect.bottom - m.s.border.bottom - m.s.scrollbar.bottom - m.e.rect.bottom,
                    left: m.e.rect.left - (m.s.rect.left + m.s.border.left),
                    right: m.s.rect.right - m.s.border.right - m.s.scrollbar.right - m.e.rect.right
                };
                var k = {};
                if (j.direction.y === true) {
                    if (h.top < 0) {
                        k.scrollTop = m.s.scroll.top + h.top
                    } else {
                        if (h.top > 0 && h.bottom < 0) {
                            k.scrollTop = m.s.scroll.top + Math.min(h.top, -h.bottom)
                        }
                    }
                }
                if (j.direction.x === true) {
                    if (h.left < 0) {
                        k.scrollLeft = m.s.scroll.left + h.left
                    } else {
                        if (h.left > 0 && h.right < 0) {
                            k.scrollLeft = m.s.scroll.left + Math.min(h.left, -h.right)
                        }
                    }
                }
                if (!f.isEmptyObject(k)) {
                    if (e.test(i[0].nodeName)) {
                        i = f("html,body")
                    }
                    i.animate(k, j.duration).eq(0).queue(function (o) {
                        f.isFunction(j.complete) && j.complete.call(i[0]);
                        o()
                    })
                } else {
                    f.isFunction(j.complete) && j.complete.call(i[0])
                }
            }
            return this
        }
    });
    var a = {auto: true, scroll: true, visible: false, hidden: false};
    f.extend(f.expr[":"], {
        scrollable: function (k, i, n, h) {
            var m = c[typeof (n[3]) === "string" && n[3].toLowerCase()] || c.both;
            var l = (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(k, null) : k.currentStyle);
            var o = {
                x: a[l.overflowX.toLowerCase()] || false,
                y: a[l.overflowY.toLowerCase()] || false,
                isRoot: e.test(k.nodeName)
            };
            if (!o.x && !o.y && !o.isRoot) {
                return false
            }
            var j = {
                height: {scroll: k.scrollHeight, client: k.clientHeight},
                width: {scroll: k.scrollWidth, client: k.clientWidth},
                scrollableX: function () {
                    return (o.x || o.isRoot) && this.width.scroll > this.width.client
                },
                scrollableY: function () {
                    return (o.y || o.isRoot) && this.height.scroll > this.height.client
                }
            };
            return m.y && j.scrollableY() || m.x && j.scrollableX()
        }
    })
})(jQuery);
