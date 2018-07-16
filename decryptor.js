#!/usr/bin/env node
var CryptoJS = CryptoJS || function (e, a) {
    var t = {}
        , o = t.lib = {}
        , i = o.Base = function () {
        function e() {
        }

        return {
            extend: function (a) {
                e.prototype = this;
                var t = new e;
                return a && t.mixIn(a),
                    t.$super = this,
                    t
            },
            create: function () {
                var e = this.extend();
                return e.init.apply(e, arguments),
                    e
            },
            init: function () {
            },
            mixIn: function (e) {
                for (var a in e)
                    e.hasOwnProperty(a) && (this[a] = e[a]);
                e.hasOwnProperty("toString") && (this.toString = e.toString)
            },
            clone: function () {
                return this.$super.extend(this)
            }
        }
    }()
        , n = o.WordArray = i.extend({
        init: function (e, a) {
            e = this.words = e || [],
                this.sigBytes = void 0 != a ? a : 4 * e.length
        },
        toString: function (e) {
            return (e || s).stringify(this)
        },
        concat: function (e) {
            var a = this.words
                , t = e.words
                , o = this.sigBytes
                , e = e.sigBytes;
            if (this.clamp(),
            o % 4)
                for (var i = 0; i < e; i++)
                    a[o + i >>> 2] |= (t[i >>> 2] >>> 24 - i % 4 * 8 & 255) << 24 - (o + i) % 4 * 8;
            else if (65535 < t.length)
                for (i = 0; i < e; i += 4)
                    a[o + i >>> 2] = t[i >>> 2];
            else
                a.push.apply(a, t);
            return this.sigBytes += e,
                this
        },
        clamp: function () {
            var a = this.words
                , t = this.sigBytes;
            a[t >>> 2] &= 4294967295 << 32 - t % 4 * 8,
                a.length = e.ceil(t / 4)
        },
        clone: function () {
            var e = i.clone.call(this);
            return e.words = this.words.slice(0),
                e
        },
        random: function (a) {
            for (var t = [], o = 0; o < a; o += 4)
                t.push(4294967296 * e.random() | 0);
            return n.create(t, a)
        }
    })
        , r = t.enc = {}
        , s = r.Hex = {
        stringify: function (e) {
            for (var a = e.words, e = e.sigBytes, t = [], o = 0; o < e; o++) {
                var i = a[o >>> 2] >>> 24 - o % 4 * 8 & 255;
                t.push((i >>> 4).toString(16)),
                    t.push((15 & i).toString(16))
            }
            return t.join("")
        },
        parse: function (e) {
            for (var a = e.length, t = [], o = 0; o < a; o += 2)
                t[o >>> 3] |= parseInt(e.substr(o, 2), 16) << 24 - o % 8 * 4;
            return n.create(t, a / 2)
        }
    }
        , l = r.Latin1 = {
        stringify: function (e) {
            for (var a = e.words, e = e.sigBytes, t = [], o = 0; o < e; o++)
                t.push(String.fromCharCode(a[o >>> 2] >>> 24 - o % 4 * 8 & 255));
            return t.join("")
        },
        parse: function (e) {
            for (var a = e.length, t = [], o = 0; o < a; o++)
                t[o >>> 2] |= (255 & e.charCodeAt(o)) << 24 - o % 4 * 8;
            return n.create(t, a)
        }
    }
        , d = r.Utf8 = {
        stringify: function (e) {
            try {
                return decodeURIComponent(escape(l.stringify(e)))
            } catch (e) {
                throw Error("Malformed UTF-8 data")
            }
        },
        parse: function (e) {
            return l.parse(unescape(encodeURIComponent(e)))
        }
    }
        , c = o.BufferedBlockAlgorithm = i.extend({
        reset: function () {
            this._data = n.create(),
                this._nDataBytes = 0
        },
        _append: function (e) {
            "string" == typeof e && (e = d.parse(e)),
                this._data.concat(e),
                this._nDataBytes += e.sigBytes
        },
        _process: function (a) {
            var t = this._data
                , o = t.words
                , i = t.sigBytes
                , r = this.blockSize
                , s = i / (4 * r)
                , a = (s = a ? e.ceil(s) : e.max((0 | s) - this._minBufferSize, 0)) * r
                , i = e.min(4 * a, i);
            if (a) {
                for (var l = 0; l < a; l += r)
                    this._doProcessBlock(o, l);
                l = o.splice(0, a),
                    t.sigBytes -= i
            }
            return n.create(l, i)
        },
        clone: function () {
            var e = i.clone.call(this);
            return e._data = this._data.clone(),
                e
        },
        _minBufferSize: 0
    });
    o.Hasher = c.extend({
        init: function () {
            this.reset()
        },
        reset: function () {
            c.reset.call(this),
                this._doReset()
        },
        update: function (e) {
            return this._append(e),
                this._process(),
                this
        },
        finalize: function (e) {
            return e && this._append(e),
                this._doFinalize(),
                this._hash
        },
        clone: function () {
            var e = c.clone.call(this);
            return e._hash = this._hash.clone(),
                e
        },
        blockSize: 16,
        _createHelper: function (e) {
            return function (a, t) {
                return e.create(t).finalize(a)
            }
        },
        _createHmacHelper: function (e) {
            return function (a, t) {
                return p.HMAC.create(e, t).finalize(a)
            }
        }
    });
    var p = t.algo = {};
    return t
}(Math);
!function () {
    var e = CryptoJS
        , a = e.lib.WordArray;
    e.enc.Base64 = {
        stringify: function (e) {
            var a = e.words
                , t = e.sigBytes
                , o = this._map;
            e.clamp();
            for (var e = [], i = 0; i < t; i += 3)
                for (var n = (a[i >>> 2] >>> 24 - i % 4 * 8 & 255) << 16 | (a[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255) << 8 | a[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255, r = 0; 4 > r && i + .75 * r < t; r++)
                    e.push(o.charAt(n >>> 6 * (3 - r) & 63));
            if (a = o.charAt(64))
                for (; e.length % 4;)
                    e.push(a);
            return e.join("")
        },
        parse: function (e) {
            var t = (e = e.replace(/\s/g, "")).length
                , o = this._map;
            (i = o.charAt(64)) && -1 != (i = e.indexOf(i)) && (t = i);
            for (var i = [], n = 0, r = 0; r < t; r++)
                if (r % 4) {
                    var s = o.indexOf(e.charAt(r - 1)) << r % 4 * 2
                        , l = o.indexOf(e.charAt(r)) >>> 6 - r % 4 * 2;
                    i[n >>> 2] |= (s | l) << 24 - n % 4 * 8,
                        n++
                }
            return a.create(i, n)
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }
}(),
    function (e) {
        function a(e, a, t, o, i, n, r) {
            return ((e = e + (a & t | ~a & o) + i + r) << n | e >>> 32 - n) + a
        }

        function t(e, a, t, o, i, n, r) {
            return ((e = e + (a & o | t & ~o) + i + r) << n | e >>> 32 - n) + a
        }

        function o(e, a, t, o, i, n, r) {
            return ((e = e + (a ^ t ^ o) + i + r) << n | e >>> 32 - n) + a
        }

        function i(e, a, t, o, i, n, r) {
            return ((e = e + (t ^ (a | ~o)) + i + r) << n | e >>> 32 - n) + a
        }

        var n = CryptoJS
            , r = (s = n.lib).WordArray
            , s = s.Hasher
            , l = n.algo
            , d = [];
        !function () {
            for (var a = 0; 64 > a; a++)
                d[a] = 4294967296 * e.abs(e.sin(a + 1)) | 0
        }(),
            l = l.MD5 = s.extend({
                _doReset: function () {
                    this._hash = r.create([1732584193, 4023233417, 2562383102, 271733878])
                },
                _doProcessBlock: function (e, n) {
                    for (u = 0; 16 > u; u++) {
                        s = e[r = n + u];
                        e[r] = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8)
                    }
                    for (var r = this._hash.words, s = r[0], l = r[1], c = r[2], p = r[3], u = 0; 64 > u; u += 4)
                        16 > u ? (s = a(s, l, c, p, e[n + u], 7, d[u]),
                            p = a(p, s, l, c, e[n + u + 1], 12, d[u + 1]),
                            c = a(c, p, s, l, e[n + u + 2], 17, d[u + 2]),
                            l = a(l, c, p, s, e[n + u + 3], 22, d[u + 3])) : 32 > u ? (s = t(s, l, c, p, e[n + (u + 1) % 16], 5, d[u]),
                            p = t(p, s, l, c, e[n + (u + 6) % 16], 9, d[u + 1]),
                            c = t(c, p, s, l, e[n + (u + 11) % 16], 14, d[u + 2]),
                            l = t(l, c, p, s, e[n + u % 16], 20, d[u + 3])) : 48 > u ? (s = o(s, l, c, p, e[n + (3 * u + 5) % 16], 4, d[u]),
                            p = o(p, s, l, c, e[n + (3 * u + 8) % 16], 11, d[u + 1]),
                            c = o(c, p, s, l, e[n + (3 * u + 11) % 16], 16, d[u + 2]),
                            l = o(l, c, p, s, e[n + (3 * u + 14) % 16], 23, d[u + 3])) : (s = i(s, l, c, p, e[n + 3 * u % 16], 6, d[u]),
                            p = i(p, s, l, c, e[n + (3 * u + 7) % 16], 10, d[u + 1]),
                            c = i(c, p, s, l, e[n + (3 * u + 14) % 16], 15, d[u + 2]),
                            l = i(l, c, p, s, e[n + (3 * u + 5) % 16], 21, d[u + 3]));
                    r[0] = r[0] + s | 0,
                        r[1] = r[1] + l | 0,
                        r[2] = r[2] + c | 0,
                        r[3] = r[3] + p | 0
                },
                _doFinalize: function () {
                    var e = this._data
                        , a = e.words
                        , t = 8 * this._nDataBytes
                        , o = 8 * e.sigBytes;
                    for (a[o >>> 5] |= 128 << 24 - o % 32,
                             a[14 + (o + 64 >>> 9 << 4)] = 16711935 & (t << 8 | t >>> 24) | 4278255360 & (t << 24 | t >>> 8),
                             e.sigBytes = 4 * (a.length + 1),
                             this._process(),
                             e = this._hash.words,
                             a = 0; 4 > a; a++)
                        t = e[a],
                            e[a] = 16711935 & (t << 8 | t >>> 24) | 4278255360 & (t << 24 | t >>> 8)
                }
            }),
            n.MD5 = s._createHelper(l),
            n.HmacMD5 = s._createHmacHelper(l)
    }(Math),
    function () {
        var e = CryptoJS
            , a = e.lib
            , t = a.Base
            , o = a.WordArray
            , i = (a = e.algo).EvpKDF = t.extend({
            cfg: t.extend({
                keySize: 4,
                hasher: a.MD5,
                iterations: 1
            }),
            init: function (e) {
                this.cfg = this.cfg.extend(e)
            },
            compute: function (e, a) {
                for (var t = (s = this.cfg).hasher.create(), i = o.create(), n = i.words, r = s.keySize, s = s.iterations; n.length < r;) {
                    l && t.update(l);
                    var l = t.update(e).finalize(a);
                    t.reset();
                    for (var d = 1; d < s; d++)
                        l = t.finalize(l),
                            t.reset();
                    i.concat(l)
                }
                return i.sigBytes = 4 * r,
                    i
            }
        });
        e.EvpKDF = function (e, a, t) {
            return i.create(t).compute(e, a)
        }
    }(),
CryptoJS.lib.Cipher || function (e) {
    var a = (g = CryptoJS).lib
        , t = a.Base
        , o = a.WordArray
        , i = a.BufferedBlockAlgorithm
        , n = g.enc.Base64
        , r = g.algo.EvpKDF
        , s = a.Cipher = i.extend({
        cfg: t.extend(),
        createEncryptor: function (e, a) {
            return this.create(this._ENC_XFORM_MODE, e, a)
        },
        createDecryptor: function (e, a) {
            return this.create(this._DEC_XFORM_MODE, e, a)
        },
        init: function (e, a, t) {
            this.cfg = this.cfg.extend(t),
                this._xformMode = e,
                this._key = a,
                this.reset()
        },
        reset: function () {
            i.reset.call(this),
                this._doReset()
        },
        process: function (e) {
            return this._append(e),
                this._process()
        },
        finalize: function (e) {
            return e && this._append(e),
                this._doFinalize()
        },
        keySize: 4,
        ivSize: 4,
        _ENC_XFORM_MODE: 1,
        _DEC_XFORM_MODE: 2,
        _createHelper: function (e) {
            return {
                encrypt: function (a, t, o) {
                    return ("string" == typeof t ? h : u).encrypt(e, a, t, o)
                },
                decrypt: function (a, t, o) {
                    return ("string" == typeof t ? h : u).decrypt(e, a, t, o)
                }
            }
        }
    });
    a.StreamCipher = s.extend({
        _doFinalize: function () {
            return this._process(!0)
        },
        blockSize: 1
    });
    var l = g.mode = {}
        , d = a.BlockCipherMode = t.extend({
        createEncryptor: function (e, a) {
            return this.Encryptor.create(e, a)
        },
        createDecryptor: function (e, a) {
            return this.Decryptor.create(e, a)
        },
        init: function (e, a) {
            this._cipher = e,
                this._iv = a
        }
    })
        , l = l.CBC = function () {
        function a(a, t, o) {
            var i = this._iv;
            i ? this._iv = e : i = this._prevBlock;
            for (var n = 0; n < o; n++)
                a[t + n] ^= i[n]
        }

        var t = d.extend();
        return t.Encryptor = t.extend({
            processBlock: function (e, t) {
                var o = this._cipher
                    , i = o.blockSize;
                a.call(this, e, t, i),
                    o.encryptBlock(e, t),
                    this._prevBlock = e.slice(t, t + i)
            }
        }),
            t.Decryptor = t.extend({
                processBlock: function (e, t) {
                    var o = this._cipher
                        , i = o.blockSize
                        , n = e.slice(t, t + i);
                    o.decryptBlock(e, t),
                        a.call(this, e, t, i),
                        this._prevBlock = n
                }
            }),
            t
    }()
        , c = (g.pad = {}).Pkcs7 = {
        pad: function (e, a) {
            for (var t = 4 * a, i = (t = t - e.sigBytes % t) << 24 | t << 16 | t << 8 | t, n = [], r = 0; r < t; r += 4)
                n.push(i);
            t = o.create(n, t),
                e.concat(t)
        },
        unpad: function (e) {
            e.sigBytes -= 255 & e.words[e.sigBytes - 1 >>> 2]
        }
    };
    a.BlockCipher = s.extend({
        cfg: s.cfg.extend({
            mode: l,
            padding: c
        }),
        reset: function () {
            s.reset.call(this);
            var e = (a = this.cfg).iv
                , a = a.mode;
            if (this._xformMode == this._ENC_XFORM_MODE)
                var t = a.createEncryptor;
            else
                t = a.createDecryptor,
                    this._minBufferSize = 1;
            this._mode = t.call(a, this, e && e.words)
        },
        _doProcessBlock: function (e, a) {
            this._mode.processBlock(e, a)
        },
        _doFinalize: function () {
            var e = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
                e.pad(this._data, this.blockSize);
                var a = this._process(!0)
            } else
                a = this._process(!0),
                    e.unpad(a);
            return a
        },
        blockSize: 4
    });
    var p = a.CipherParams = t.extend({
        init: function (e) {
            this.mixIn(e)
        },
        toString: function (e) {
            return (e || this.formatter).stringify(this)
        }
    })
        , l = (g.format = {}).OpenSSL = {
        stringify: function (e) {
            var a = e.ciphertext;
            return a = (a = ((e = e.salt) ? o.create([1398893684, 1701076831]).concat(e).concat(a) : a).toString(n)).replace(/(.{64})/g, "$1\n")
        },
        parse: function (e) {
            var a = (e = n.parse(e)).words;
            if (1398893684 == a[0] && 1701076831 == a[1]) {
                var t = o.create(a.slice(2, 4));
                a.splice(0, 4),
                    e.sigBytes -= 16
            }
            return p.create({
                ciphertext: e,
                salt: t
            })
        }
    }
        , u = a.SerializableCipher = t.extend({
        cfg: t.extend({
            format: l
        }),
        encrypt: function (e, a, t, o) {
            var o = this.cfg.extend(o)
                , a = (i = e.createEncryptor(t, o)).finalize(a)
                , i = i.cfg;
            return p.create({
                ciphertext: a,
                key: t,
                iv: i.iv,
                algorithm: e,
                mode: i.mode,
                padding: i.padding,
                blockSize: e.blockSize,
                formatter: o.format
            })
        },
        decrypt: function (e, a, t, o) {
            return o = this.cfg.extend(o),
                a = this._parse(a, o.format),
                e.createDecryptor(t, o).finalize(a.ciphertext)
        },
        _parse: function (e, a) {
            return "string" == typeof e ? a.parse(e) : e
        }
    })
        , g = (g.kdf = {}).OpenSSL = {
        compute: function (e, a, t, i) {
            return i || (i = o.random(8)),
                e = r.create({
                    keySize: a + t
                }).compute(e, i),
                t = o.create(e.words.slice(a), 4 * t),
                e.sigBytes = 4 * a,
                p.create({
                    key: e,
                    iv: t,
                    salt: i
                })
        }
    }
        , h = a.PasswordBasedCipher = u.extend({
        cfg: u.cfg.extend({
            kdf: g
        }),
        encrypt: function (e, a, t, o) {
            return o = this.cfg.extend(o),
                t = o.kdf.compute(t, e.keySize, e.ivSize),
                o.iv = t.iv,
                (e = u.encrypt.call(this, e, a, t.key, o)).mixIn(t),
                e
        },
        decrypt: function (e, a, t, o) {
            return o = this.cfg.extend(o),
                a = this._parse(a, o.format),
                t = o.kdf.compute(t, e.keySize, e.ivSize, a.salt),
                o.iv = t.iv,
                u.decrypt.call(this, e, a, t.key, o)
        }
    })
}(),
    function () {
        var e = CryptoJS
            , a = e.lib.BlockCipher
            , t = e.algo
            , o = []
            , i = []
            , n = []
            , r = []
            , s = []
            , l = []
            , d = []
            , c = []
            , p = []
            , u = [];
        !function () {
            for (var e = [], a = 0; 256 > a; a++)
                e[a] = 128 > a ? a << 1 : a << 1 ^ 283;
            for (var t = 0, g = 0, a = 0; 256 > a; a++) {
                var h = (h = g ^ g << 1 ^ g << 2 ^ g << 3 ^ g << 4) >>> 8 ^ 255 & h ^ 99;
                o[t] = h,
                    i[h] = t;
                var f = e[t]
                    , _ = e[f]
                    , y = e[_]
                    , v = 257 * e[h] ^ 16843008 * h;
                n[t] = v << 24 | v >>> 8,
                    r[t] = v << 16 | v >>> 16,
                    s[t] = v << 8 | v >>> 24,
                    l[t] = v,
                    v = 16843009 * y ^ 65537 * _ ^ 257 * f ^ 16843008 * t,
                    d[h] = v << 24 | v >>> 8,
                    c[h] = v << 16 | v >>> 16,
                    p[h] = v << 8 | v >>> 24,
                    u[h] = v,
                    t ? (t = f ^ e[e[e[y ^ f]]],
                        g ^= e[e[g]]) : t = g = 1
            }
        }();
        var g = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54]
            , t = t.AES = a.extend({
            _doReset: function () {
                for (var e = (t = this._key).words, a = t.sigBytes / 4, t = 4 * ((this._nRounds = a + 6) + 1), i = this._keySchedule = [], n = 0; n < t; n++)
                    if (n < a)
                        i[n] = e[n];
                    else {
                        var r = i[n - 1];
                        n % a ? 6 < a && 4 == n % a && (r = o[r >>> 24] << 24 | o[r >>> 16 & 255] << 16 | o[r >>> 8 & 255] << 8 | o[255 & r]) : (r = r << 8 | r >>> 24,
                            r = o[r >>> 24] << 24 | o[r >>> 16 & 255] << 16 | o[r >>> 8 & 255] << 8 | o[255 & r],
                            r ^= g[n / a | 0] << 24),
                            i[n] = i[n - a] ^ r
                    }
                for (e = this._invKeySchedule = [],
                         a = 0; a < t; a++)
                    n = t - a,
                        r = a % 4 ? i[n] : i[n - 4],
                        e[a] = 4 > a || 4 >= n ? r : d[o[r >>> 24]] ^ c[o[r >>> 16 & 255]] ^ p[o[r >>> 8 & 255]] ^ u[o[255 & r]]
            },
            encryptBlock: function (e, a) {
                this._doCryptBlock(e, a, this._keySchedule, n, r, s, l, o)
            },
            decryptBlock: function (e, a) {
                var t = e[a + 1];
                e[a + 1] = e[a + 3],
                    e[a + 3] = t,
                    this._doCryptBlock(e, a, this._invKeySchedule, d, c, p, u, i),
                    t = e[a + 1],
                    e[a + 1] = e[a + 3],
                    e[a + 3] = t
            },
            _doCryptBlock: function (e, a, t, o, i, n, r, s) {
                for (var l = this._nRounds, d = e[a] ^ t[0], c = e[a + 1] ^ t[1], p = e[a + 2] ^ t[2], u = e[a + 3] ^ t[3], g = 4, h = 1; h < l; h++)
                     var f = o[d >>> 24] ^ i[c >>> 16 & 255] ^ n[p >>> 8 & 255] ^ r[255 & u] ^ t[g++]
                         , _ = o[c >>> 24] ^ i[p >>> 16 & 255] ^ n[u >>> 8 & 255] ^ r[255 & d] ^ t[g++]
                         , y = o[p >>> 24] ^ i[u >>> 16 & 255] ^ n[d >>> 8 & 255] ^ r[255 & c] ^ t[g++]
                         , u = o[u >>> 24] ^ i[d >>> 16 & 255] ^ n[c >>> 8 & 255] ^ r[255 & p] ^ t[g++]
                         , d = f
                         , c = _
                         , p = y;
                f = (s[d >>> 24] << 24 | s[c >>> 16 & 255] << 16 | s[p >>> 8 & 255] << 8 | s[255 & u]) ^ t[g++],
                    _ = (s[c >>> 24] << 24 | s[p >>> 16 & 255] << 16 | s[u >>> 8 & 255] << 8 | s[255 & d]) ^ t[g++],
                    y = (s[p >>> 24] << 24 | s[u >>> 16 & 255] << 16 | s[d >>> 8 & 255] << 8 | s[255 & c]) ^ t[g++],
                    u = (s[u >>> 24] << 24 | s[d >>> 16 & 255] << 16 | s[c >>> 8 & 255] << 8 | s[255 & p]) ^ t[g++],
                    e[a] = f,
                    e[a + 1] = _,
                    e[a + 2] = y,
                    e[a + 3] = u
            },
            keySize: 8
        });
        e.AES = a._createHelper(t)
    }();
try {
    var p = CryptoJS.enc.Base64.parse("Z0AxbiEoZjEjci4wJCkmJQ==");
    var h = CryptoJS.enc.Base64.parse("YXNkIUAjIUAjQCExMjMxMg==");


    var program = require('commander');

    program
        .arguments('<msg>')
        .action(function (msg) {
            d = CryptoJS.AES.decrypt(msg, p, {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
                iv: h
            });
            console.log(d.toString(CryptoJS.enc.Utf8));
        })
        .parse(process.argv);
} catch (e) {
    console.log(e);
}