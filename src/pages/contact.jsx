import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { contactData, contactLinks } from "../data/contact";
import { supabase } from "../lib/supabase";

// ---- THREADS BACKGROUND — fished from the help code, only the perfect part ----
const LINE_VERTEX = `#version 300 es
precision highp float;
in vec2 aPoint;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFrame;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
uniform float uCount;
uniform float uThickness;
uniform float uSoftness;
uniform float uWaves;
uniform float uSplit;
uniform float uFray;
uniform float uSeed;
uniform vec2 uTurn;
uniform vec4 uPart;
uniform float uTaper;
out float vEdge;
out float vBand;
out float vDraw;
out float vAlpha;
out float vIndex;
float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y) * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}
void main() {
  float perc = float(gl_InstanceID) / uCount;
  float x = aPoint.x;
  float pixel = 1.0 / max(uResolution.x, uResolution.y);
  float splitPoint = uSplit + perc * uFray;
  float amplitudeNormal = smoothstep(splitPoint, max(0.7, splitPoint + 0.2), x);
  float finalAmplitude = amplitudeNormal * 0.5 * uAmplitude * (1.0 + (uMouse.y - 0.5) * 0.2);
  float timeScaled = uTime / 10.0 + (uMouse.x - 0.5);
  float blur = smoothstep(splitPoint, splitPoint + 0.05, x) * perc;
  float xnoise = mix(
    Perlin2D(vec2(timeScaled * 2.5 + uSeed, (x * uWaves + perc) * 2.5)),
    Perlin2D(vec2(timeScaled * 3.5 + uSeed, (x * uWaves + timeScaled) * 3.5)) / 1.5,
    x * 0.3
  );
  float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;
  vec2 local = vec2((x - 0.5) * uFrame.x, (y - 0.5) * uFrame.y);
  if (uPart.z > 0.0) {
    vec2 delta = local - uPart.xy;
    float reach = uPart.w;
    float pull = exp(-dot(delta, delta) / (reach * reach));
    local.y += delta.y * pull * uPart.z;
  }
  float width = 7.0 * uThickness * pixel * (1.0 - perc);
  float band = (width / 2.0 + 10.0 * uSoftness * pixel * blur) * uFrame.y;
  float draw = max(band, 1.0);
  local.y += aPoint.y * draw;
  vec2 turned = vec2(local.x * uTurn.x - local.y * uTurn.y, local.x * uTurn.y + local.y * uTurn.x);
  gl_Position = vec4(turned / (uResolution * 0.5), 0.0, 1.0);
  vEdge = aPoint.y * draw;
  vBand = band;
  vDraw = draw;
  vAlpha = 1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3)) * uTaper;
  vIndex = perc;
}`;
const LINE_FRAGMENT = `#version 300 es
precision highp float;
in float vEdge;
in float vBand;
in float vDraw;
in float vAlpha;
in float vIndex;
uniform vec3 uColor;
uniform vec3 uAccent;
out vec4 outColor;
void main() {
  float coverage = (1.0 - smoothstep(0.0, vDraw, abs(vEdge))) * (vBand / vDraw) * vAlpha;
  outColor = vec4(mix(uColor, uAccent, vIndex) * coverage, coverage);
}`;
const SCREEN_VERTEX = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;
const SCREEN_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uLines;
uniform vec2 uResolution;
uniform float uFade;
uniform float uOpacity;
uniform float uCurve;
out vec4 outColor;
float smootherstep(float edge, float x) {
  float t = clamp(x / edge, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
void main() {
  vec4 lines = texture(uLines, vUv);
  float alpha = lines.a;
  vec3 color = alpha > 0.0001 ? lines.rgb / alpha : vec3(0.0);
  float mask = uOpacity;
  if (uFade > 0.0) {
    vec2 px = vUv * uResolution;
    float edge = uFade * min(uResolution.x, uResolution.y) * 0.5;
    mask *= smootherstep(edge, px.x) * smootherstep(edge, uResolution.x - px.x);
    mask *= smootherstep(edge, px.y) * smootherstep(edge, uResolution.y - px.y);
  }
  outColor = vec4(color * pow(alpha, uCurve), alpha) * mask;
}`;

function ThreadsBackground({
    color = "#6b4a3a",
    lineCount = 90,
    thickness = 0.6,
    softness = 1.3,
    amplitude = 1.7,
    distance = 0.4,
    waves = 1.05,
    speed = 0.6,
    split = 0.04,
    fray = 0.5,
    angle = 25,
    taper = 0.85,
    brightness = 1.4,
    opacity = 1,
}) {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        const gl = canvas?.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
        if (!container || !canvas || !gl) return;

        const compile = (type, src) => {
            const sh = gl.createShader(type);
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
        };
        const linkProg = (vs, fs) => {
            const v = compile(gl.VERTEX_SHADER, vs);
            const f = compile(gl.FRAGMENT_SHADER, fs);
            const p = gl.createProgram();
            if (!v || !f || !p) return null;
            gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
            gl.deleteShader(v); gl.deleteShader(f);
            return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
        };
        const lineProgram = linkProg(LINE_VERTEX, LINE_FRAGMENT);
        const screenProgram = linkProg(SCREEN_VERTEX, SCREEN_FRAGMENT);
        if (!lineProgram || !screenProgram) return;

        const lineUniforms = {};
        ["uTime", "uResolution", "uFrame", "uAmplitude", "uDistance", "uMouse", "uCount", "uThickness", "uSoftness", "uWaves", "uSplit", "uFray", "uSeed", "uTurn", "uPart", "uTaper", "uColor", "uAccent"].forEach(n => lineUniforms[n] = gl.getUniformLocation(lineProgram, n));
        const screenUniforms = {};
        ["uLines", "uResolution", "uFade", "uOpacity", "uCurve"].forEach(n => screenUniforms[n] = gl.getUniformLocation(screenProgram, n));

        const lineVao = gl.createVertexArray();
        const lineBuffer = gl.createBuffer();
        gl.bindVertexArray(lineVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
        const aPoint = gl.getAttribLocation(lineProgram, "aPoint");
        gl.enableVertexAttribArray(aPoint);
        gl.vertexAttribPointer(aPoint, 2, gl.FLOAT, false, 0, 0);

        const screenVao = gl.createVertexArray();
        const screenBuffer = gl.createBuffer();
        gl.bindVertexArray(screenVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, screenBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(screenProgram, "aPosition");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);

        const target = gl.createTexture();
        const fb = gl.createFramebuffer();
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const probe = document.createElement("canvas");
        probe.width = 1; probe.height = 1;
        const pCtx = probe.getContext("2d", { willReadFrequently: true });
        const toRgb = (v) => {
            if (Array.isArray(v)) return v;
            if (!pCtx) return [1, 1, 1];
            pCtx.clearRect(0, 0, 1, 1);
            pCtx.fillStyle = "#fff";
            pCtx.fillStyle = String(v);
            pCtx.fillRect(0, 0, 1, 1);
            const [r, g, b] = pCtx.getImageData(0, 0, 1, 1).data;
            return [r / 255, g / 255, b / 255];
        };
        const col = toRgb(color);

        let time = 0, last = 0, raf = 0, alive = true, visible = true, segs = 0;
        const state = { w: 1, h: 1, mouse: [0.5, 0.5] };

        const buildStrip = (segments) => {
            if (segments === segs) return; segs = segments;
            const pts = new Float32Array((segments + 1) * 4);
            for (let i = 0; i <= segments; i++) { const u = i / segments; pts.set([u, -1, u, 1], i * 4); }
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
        };

        const resize = () => {
            const w = Math.max(1, container.clientWidth);
            const h = Math.max(1, container.clientHeight);
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            state.w = w; state.h = h;
            gl.bindTexture(gl.TEXTURE_2D, target);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            buildStrip(Math.max(96, Math.min(640, Math.round(w / 3))));
            render();
        };

        const render = () => {
            const w = canvas.width, h = canvas.height;
            const rad = (angle * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad);
            const len = Math.abs(w * c) + Math.abs(h * s);
            const across = Math.abs(w * s) + Math.abs(h * c);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.viewport(0, 0, w, h);
            gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.useProgram(lineProgram);
            gl.uniform1f(lineUniforms.uTime, time);
            gl.uniform2f(lineUniforms.uResolution, w, h);
            gl.uniform2f(lineUniforms.uFrame, len, across);
            gl.uniform1f(lineUniforms.uAmplitude, amplitude);
            gl.uniform1f(lineUniforms.uDistance, distance);
            gl.uniform2f(lineUniforms.uMouse, state.mouse[0], state.mouse[1]);
            gl.uniform1f(lineUniforms.uCount, lineCount);
            gl.uniform1f(lineUniforms.uThickness, thickness);
            gl.uniform1f(lineUniforms.uSoftness, softness);
            gl.uniform1f(lineUniforms.uWaves, waves);
            gl.uniform1f(lineUniforms.uSplit, split);
            gl.uniform1f(lineUniforms.uFray, fray);
            gl.uniform1f(lineUniforms.uSeed, 0);
            gl.uniform2f(lineUniforms.uTurn, c, s);
            gl.uniform4f(lineUniforms.uPart, 0, 0, 0, Math.min(w, h) * 0.16);
            gl.uniform1f(lineUniforms.uTaper, taper);
            gl.uniform3f(lineUniforms.uColor, col[0], col[1], col[2]);
            gl.uniform3f(lineUniforms.uAccent, col[0], col[1], col[2]);
            gl.bindVertexArray(lineVao);
            gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (segs + 1) * 2, lineCount);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, w, h);
            gl.disable(gl.BLEND); gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(screenProgram);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, target);
            gl.uniform1i(screenUniforms.uLines, 0);
            gl.uniform2f(screenUniforms.uResolution, w, h);
            gl.uniform1f(screenUniforms.uFade, 0);
            gl.uniform1f(screenUniforms.uOpacity, opacity);
            gl.uniform1f(screenUniforms.uCurve, 2 / brightness);
            gl.bindVertexArray(screenVao);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.bindVertexArray(null);
        };

        const frame = (now) => {
            if (!alive || !visible || document.hidden) return;
            const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60; last = now;
            time += dt * speed;
            render();
            raf = requestAnimationFrame(frame);
        };

        const ro = new ResizeObserver(resize);
        ro.observe(container);
        const io = new IntersectionObserver((e) => { visible = e.some(en => en.isIntersecting); if (visible) { last = 0; if (!raf) raf = requestAnimationFrame(frame); } });
        io.observe(container);
        resize();
        raf = requestAnimationFrame(frame);

        return () => {
            alive = false; cancelAnimationFrame(raf);
            ro.disconnect(); io.disconnect();
            gl.deleteFramebuffer(fb); gl.deleteTexture(target);
            gl.deleteBuffer(lineBuffer); gl.deleteBuffer(screenBuffer);
            gl.deleteVertexArray(lineVao); gl.deleteVertexArray(screenVao);
            gl.deleteProgram(lineProgram); gl.deleteProgram(screenProgram);
        };
    }, [color, lineCount, thickness, softness, amplitude, distance, waves, speed, split, fray, angle, taper, brightness, opacity]);

    return (
        <div ref={containerRef} className="absolute inset-0 h-full w-full">
            <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
        </div>
    );
}

// ---- YOUR CONTACT — SAME AS BEFORE, ONLY BACKGROUND CHANGED ----
export default function Contact() {
    const [profile, setProfile] = useState(contactData);
    const [links, setLinks] = useState(contactLinks);

    useEffect(() => {
        let isMounted = true;

        async function loadContactContent() {
            const [profileResult, linksResult] = await Promise.all([
                supabase
                    .from("contact_profile")
                    .select("*")
                    .eq("is_published", true)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(),

                supabase
                    .from("contact_links")
                    .select("*")
                    .eq("is_enabled", true)
                    .order("sort_order", { ascending: true }),
            ]);

            if (!isMounted) return;

            if (profileResult.error) {
                console.error("Error loading contact profile:", profileResult.error);
            }

            if (linksResult.error) {
                console.error("Error loading contact links:", linksResult.error);
            }

            const profileRecord = profileResult.data;
            const linkRecords = linksResult.data || [];

            const mediaIds = [
                profileRecord?.profile_media_id,
                ...linkRecords.map((link) => link.media_id),
            ].filter(Boolean);

            let mediaMap = {};

            if (mediaIds.length > 0) {
                const { data: media, error: mediaError } = await supabase
                    .from("media_assets")
                    .select("id, file_path, bucket_name")
                    .in("id", [...new Set(mediaIds)]);

                if (mediaError) {
                    console.error("Error loading contact images:", mediaError);
                } else {
                    mediaMap = Object.fromEntries(
                        media.map((asset) => [
                            asset.id,
                            supabase.storage
                                .from(asset.bucket_name || "portfolio-media")
                                .getPublicUrl(asset.file_path).data.publicUrl,
                        ])
                    );
                }
            }

            if (!isMounted) return;

            if (profileRecord) {
                setProfile({
                    name: profileRecord.name,
                    image:
                        mediaMap[profileRecord.profile_media_id] ||
                        contactData.image,
                });
            }

            if (!linksResult.error) {
                setLinks(
                    linkRecords.map((link) => {
                        const fallback = contactLinks.find(
                            (item) => item.name === link.name
                        );

                        return {
                            name: link.name,
                            href: link.href,
                            img:
                                mediaMap[link.media_id] ||
                                fallback?.img ||
                                "",
                        };
                    })
                );
            }
        }

        loadContactContent();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section id="contact" className="relative overflow-hidden bg-[#050504] py-16 sm:py-20">
            {/* Threads background — mocha on super black, exactly like your reference */}
            <ThreadsBackground
                color="#6b4a3a"
                lineCount={90}
                thickness={0.6}
                softness={1.3}
                amplitude={1.7}
                distance={0.4}
                waves={1.05}
                speed={0.6}
                split={0.04}
                fray={0.5}
                angle={25}
                taper={0.85}
                brightness={1.4}
                opacity={1}
            />
            {/* subtle vignette so icons + THANK YOU pop, same as reference darkness */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

            <div className="relative z-10 container mx-auto max-w-7xl px-6 lg:px-10">
                <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                    {/* LEFT - CONTACT ME + circle + icon column beside it */}
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="shrink-0">
                        <p className="mb-4 pl-1 text-left text-[11px] font-bold uppercase tracking-[0.35em] text-white">Contact Me</p>
                        <div className="flex items-center gap-8 sm:gap-10">
                            <div>
                                <div className="h-[187px] w-[187px] overflow-hidden rounded-full border-4 border-white/20 sm:h-[240px] sm:w-[240px]">
                                    <img src={profile.image} alt={profile.name} className="h-full w-full object-cover object-[center_20%]" />
                                </div>
                                <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-white">{profile.name}</p>
                            </div>
                            {/* ICONS - own vertical column beside the circle */}
                            <div className="flex flex-col justify-start gap-6 self-start pt-1 sm:gap-8">
                                {links.map((l) => (
                                    <a key={l.name} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" title={l.name} className="group flex items-center gap-2.5">
                                        <span className="h-[32px] w-[32px] shrink-0 overflow-hidden rounded-full border-2 border-white/25 bg-white shadow-lg transition group-hover:scale-110 group-hover:border-white sm:h-[36px] sm:w-[36px]">
                                            <img src={l.img} alt={l.name} className="h-full w-full object-cover" />
                                        </span>
                                        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em] text-white">{l.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                    {/* RIGHT - THANK YOU, one line, top-right */}
                    <motion.div initial={{ opacity: 0, x: 25 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex flex-1 items-center justify-center self-start pt-2 lg:items-start lg:justify-end">
                        <h2 className="whitespace-nowrap text-center text-[52px] font-black leading-none tracking-tight text-white sm:text-[72px] lg:text-[88px]">THANK YOU</h2>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
