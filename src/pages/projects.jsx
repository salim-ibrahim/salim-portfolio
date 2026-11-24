import {
    analyticsProjects,
    featuredProject,
    reconSections,
    webAppProjects,
    websiteProjects,
} from "../data/projects";
import { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUpRight,
    Code2,
    X,
    Download,
    FileText,
} from "lucide-react";
import vintageBackground from "../assets/projects/vintage_background.jpg";
import FlexCarousel from "../components/FlexCarousel";
import { supabase } from "../lib/supabase";

function AutoVideo({ src, label }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting && e.intersectionRatio >= 0.35) { el.play().catch(() => { }); } else { el.pause(); } });
        }, { threshold: [0, 0.35, 0.6, 1] });
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return (<video ref={ref} src={src} muted loop playsInline preload="metadata" disablePictureInPicture disableRemotePlayback controlsList="nodownload noplaybackrate nofullscreen" onContextMenu={(e) => e.preventDefault()} aria-label={label || "Project video"} className="w-full aspect-video object-cover" />);
}
function MediaBlock({ type, src, label, caption }) {
    if (!src) return null;
    return (
        <div className="my-6 flex justify-start">
            <div className="w-full overflow-hidden rounded-2xl border border-black/15 bg-white/40 sm:w-4/9">
                {type === "video" ? (<AutoVideo src={src} label={label} />) : (<img src={src} alt={label || "Project visual"} className="w-full object-contain bg-white" />)}
                {(label || caption) && (<div className="px-4 py-3">{label && <p className="text-sm font-semibold text-[#050504]">{label}</p>}{caption && <p className="mt-1 text-xs leading-5 text-[#050504]/70">{caption}</p>}</div>)}
            </div>
        </div>
    );
}
function Paras({ items }) { if (!items) return null; return items.map((p, i) => <p key={i} className="mt-3 text-sm leading-7 text-[#050504]">{p}</p>); }
function Bullets({ items }) { if (!items) return null; return (<ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white">{items.map((b, i) => <li key={i}>{b}</li>)}</ul>); }
function Numbered({ items }) { if (!items) return null; return (<ol className="mt-3 list-decimal space-y-4 pl-5 text-sm leading-7 text-white">{items.map((b, i) => <li key={i}>{typeof b === "string" ? b : b.text}{b && b.media ? <MediaBlock {...b.media} /> : null}</li>)}</ol>); }
function TableBlock({ rows }) {
    if (!rows) return null;
    return (<div className="mt-4 overflow-hidden rounded-2xl border border-black/15"><table className="w-full text-left text-sm"><tbody>{rows.map(([k, v]) => (<tr key={k} className="border-b border-white/15 last:border-0"><td className="px-4 py-3 font-medium text-white/80">{k}</td><td className="px-4 py-3 font-semibold text-white">{v}</td></tr>))}</tbody></table></div>);
}
function BodySection({ section, index }) {
    return (
        <div className="mt-8">
            {section.heading && <h4 className="flex items-center gap-2 text-lg font-bold text-[#A87C2F]">{section.icon ? <FileText size={18} className="text-[#A87C2F]" /> : null}{section.heading}</h4>}
            <Paras items={section.paras} />
            <Bullets items={section.bullets} />
            {section.numbered ? <Numbered items={section.numbered} /> : null}
            {section.approachSteps ? section.approachSteps.map((step, i) => (<div key={i}><p className="mt-4 text-sm leading-7 text-[#050504]"><span className="mr-2 font-bold text-[#A87C2F]">{i + 1}.</span>{step.text}</p>{step.media && <MediaBlock {...step.media} />}</div>)) : null}
            {section.table ? <TableBlock rows={section.table} /> : null}
            {section.media ? section.media.map((m, i) => <MediaBlock key={i} {...m} />) : null}
            {section.charts ? section.charts.map((c, i) => <MediaBlock key={i} type="image" src={c.src} label={c.label} caption={c.caption} />) : null}
        </div>
    );
}


const STYLE = `
@keyframes cc-title { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cc-leave { from { opacity: 1; } to { opacity: 0; } }
@keyframes cc-reveal { from { opacity: 0; } to { opacity: 1; } }
`;
const TILES = 8, OVERLAP = 2.5, DRAG_THRESHOLD = 5, SPRING = 118, SETTLE_SPEED = 9, CAPTION_SPACE = 76, SWAP_LENGTH = 700, SWAP_SPREAD = 420, TO_RAD = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrap = d => ((((d + 180) % 360) + 360) % 360) - 180;
const easeOut = t => 1 - Math.pow(1 - t, 4);
const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
const rotateX = (p, d) => { const r = d * TO_RAD, c = Math.cos(r), s = Math.sin(r); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; };
const rotateY = (p, d) => { const r = d * TO_RAD, c = Math.cos(r), s = Math.sin(r); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; };
const INTRO_LENGTH = { assemble: 1500, rise: 1400, spin: 1800, none: 0 };
const LAYOUT = { axis: 'y', tilt: -5, perspective: 2500, curve: 1, spread: 1, inward: false, billboard: false, backfaces: true, window: 0 };
function CircularCarousel({ items = [], preset = 'cylinder', intro = 'rise', cardWidth = 230, aspectRatio = 1.62, gap = 18, curve, tilt, perspective, autoplay = 'drift', speed = 14, interval = 3, direction = 'left', draggable = true, momentum = 0.6, snap = true, pauseOnHover = false, focusOnClick = true, parallax = 0.3, stretch = 0.5, depthFade = 0.55, fadeColor = '#6B4A3A', innerShade = 0.6, cornerRadius = 12, captions = false, onChange, onItemClick, className = '', style }) {
    const [list, setList] = useState(items); const [leaving, setLeaving] = useState(null);
    const count = list.length, axis = 'y', tiltValue = tilt ?? LAYOUT.tilt, curveValue = clamp(curve ?? LAYOUT.curve, 0, 1);
    const cardW = Math.max(40, cardWidth), cardH = cardW / clamp(aspectRatio, 0.2, 5), along = cardW, step = 360 / Math.max(count, 1);
    const radius = useMemo(() => { const n = Math.max(count, 3), pitch = (along + gap) * LAYOUT.spread, chord = pitch / (2 * Math.sin(Math.PI / n)), arc = (n * pitch) / (2 * Math.PI); return Math.max(chord + (arc - chord) * curveValue, along * 0.6); }, [count, along, gap, curveValue]);
    const tiles = useMemo(() => { const total = curveValue > 0.001 ? TILES : 1, length = along / total, bend = curveValue > 0.001 ? radius / curveValue : 0; return Array.from({ length: total }, (_, i) => { const start = i * length - (i > 0 ? OVERLAP / 2 : 0), end = (i + 1) * length + (i < total - 1 ? OVERLAP / 2 : 0), center = (start + end) / 2 - along / 2, alpha = bend ? center / bend : 0, shift = bend ? bend * Math.sin(alpha) : center, sink = bend ? bend * (1 - Math.cos(alpha)) : 0, depth = -sink, turn = (alpha * 180) / Math.PI; return { index: i, total, start, end, size: end - start, move: `translate3d(${shift}px,0px,${depth}px) rotateY(${turn}deg)` }; }); }, [along, curveValue, radius]);
    const rootRef = useRef(null), stageRef = useRef(null), cameraRef = useRef(null), ringRef = useRef(null), cardRefs = useRef([]), wakeRef = useRef(() => { }), measureRef = useRef(() => { }), activeRef = useRef(0);
    const [active, setActive] = useState(0), [ready, setReady] = useState(false), [dragging, setDragging] = useState(false); const readyRef = useRef(false); readyRef.current = ready;
    const stateRef = useRef({ angle: 0, velocity: 0, target: null, dir: -1, press: null, drag: false, hover: false, pointer: { inside: false, x: 0, y: 0 }, yaw: 0, pitch: 0, intro: null, introDone: false, holdUntil: 0, stepAt: 0, suppressClick: false, wheelTimer: 0, fit: 1, shift: 0, drop: 0, last: 0 });
    const settings = { count, step, radius, layout: LAYOUT, axis, tilt: tiltValue, perspective: perspective ?? LAYOUT.perspective, cardW, cardH, intro: intro in INTRO_LENGTH ? intro : 'rise', autoplay, speed, interval: Math.max(0.5, interval), draggable, momentum: clamp(momentum, 0, 1), snap, pauseOnHover, parallax: clamp(parallax, 0, 1), stretch: clamp(stretch, 0, 1), depthFade: clamp(depthFade, 0, 1), captions };
    const settingsRef = useRef(settings); settingsRef.current = settings;
    const onChangeRef = useRef(onChange); onChangeRef.current = onChange;
    const directionSign = (direction === 'right' ? 1 : -1);
    useEffect(() => { stateRef.current.dir = directionSign; wakeRef.current(); }, [directionSign]);
    const sourcesKey = items.map(i => i.src).join('|');
    useEffect(() => { let cancelled = false; const next = items; const smooth = readyRef.current && next.length === list.length; if (!smooth) { setReady(false); setLeaving(null); setList(next); } const load = src => new Promise(res => { const im = new Image(); im.onload = () => im.decode ? im.decode().then(res, res) : res(); im.onerror = res; im.src = src; }); Promise.race([Promise.all(next.slice(0, 16).map(i => load(i.src))), new Promise(r => setTimeout(r, 2400))]).then(() => { if (cancelled) return; const st = stateRef.current; if (smooth) { const prev = list; if (prev !== next) { setLeaving({ id: Date.now(), items: prev, delays: prev.map((_, ix) => (Math.abs(wrap(ix * settingsRef.current.step + st.angle)) / 180) * SWAP_SPREAD) }); } setList(next); wakeRef.current(); return; } st.introDone = false; st.intro = null; setReady(true); wakeRef.current(); }); return () => { cancelled = true; }; }, [sourcesKey]);
    useEffect(() => { if (!leaving) return; const t = setTimeout(() => setLeaving(null), SWAP_LENGTH + SWAP_SPREAD + 80); return () => clearTimeout(t); }, [leaving]);
    useLayoutEffect(() => {
        const root = rootRef.current, stage = stageRef.current, camera = cameraRef.current, ring = ringRef.current; if (!root || !stage || !camera || !ring) return;
        const state = stateRef.current; let raf = 0, visible = true;
        const nearest = a => Math.round(a / settingsRef.current.step) * settingsRef.current.step;
        const measure = () => { const s = settingsRef.current, rect = root.getBoundingClientRect(); if (!rect.width || !rect.height) return; const room = s.captions ? CAPTION_SPACE : 0, width = rect.width * 0.94, height = (rect.height - room) * 0.92, P = s.perspective; let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity; const corners = [[-s.cardW / 2, -s.cardH / 2], [s.cardW / 2, -s.cardH / 2], [-s.cardW / 2, s.cardH / 2], [s.cardW / 2, s.cardH / 2]]; for (let a = -180; a <= 180; a += 15) { for (const [cx, cy] of corners) { let p = rotateX(rotateY([cx, cy, s.radius], a), s.tilt); p = [p[0], p[1], p[2] - s.radius]; if (p[2] >= P * 0.95) continue; const k = P / (P - p[2]); minX = Math.min(minX, p[0] * k); maxX = Math.max(maxX, p[0] * k); minY = Math.min(minY, p[1] * k); maxY = Math.max(maxY, p[1] * k); } } const fit = Math.min(1, width / Math.max(maxX - minX, 1), height / Math.max(maxY - minY, 1)); state.fit = fit; state.shift = -((minY + maxY) / 2) * fit - room / 2; state.drop = (rect.height / fit) * 0.55 + s.cardH; stage.style.perspective = `${P}px`; stage.style.transform = `translate3d(0,${state.shift}px,0) scale(${fit})`; };
        measureRef.current = measure;
        const introCard = (elapsed, landing) => { if (!state.intro) return { radius: 1, lift: 0 }; const type = state.intro.type, reach = Math.abs(wrap(landing + state.angle)); if (type === 'assemble') { const d = (reach / 180) * 420, p = easeOut(clamp((elapsed - d) / 1080, 0, 1)); return { radius: 1 + 0.6 * (1 - p), lift: 0 }; } if (type === 'rise') { const d = (reach / 180) * 480, p = easeOutQuint(clamp((elapsed - d) / 900, 0, 1)); return { radius: 1, lift: (1 - p) * state.drop }; } if (type === 'spin') { const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1)); return { radius: 1 + 0.28 * (1 - p), lift: 0 }; } return { radius: 1, lift: 0 }; };
        const advance = (s, dt, now) => { if (!state.introDone && readyRef.current) { if (!state.intro) { if (s.intro === 'none') state.introDone = true; else state.intro = { type: s.intro, start: now }; } if (state.intro && now - state.intro.start >= INTRO_LENGTH[state.intro.type]) { state.intro = null; state.introDone = true; } } const paused = (s.pauseOnHover && state.hover) || state.drag || now < state.holdUntil; const cruise = s.autoplay === 'drift' && !paused && !state.intro ? s.speed * state.dir : 0; let busy = Boolean(state.intro) || state.drag; if (state.drag || state.intro) { state.velocity = state.drag ? state.velocity : 0; } else if (state.target !== null) { let rem = dt; const damp = 2 * Math.sqrt(SPRING); while (rem > 0) { const h = Math.min(rem, 1 / 240), acc = SPRING * (state.target - state.angle) - damp * state.velocity; state.velocity += acc * h; state.angle += state.velocity * h; rem -= h; } if (Math.abs(state.target - state.angle) < 0.004 && Math.abs(state.velocity) < 0.03) { state.angle = state.target; state.velocity = 0; state.target = null; } busy = true; } else { const tau = 0.18 + s.momentum * 1.5; state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau)); state.angle += state.velocity * dt; if (cruise === 0 && s.snap && Math.abs(state.velocity) < SETTLE_SPEED) state.target = nearest(state.angle); busy = busy || cruise !== 0 || Math.abs(state.velocity) > 0.01 || state.target !== null; } if (s.autoplay === 'step' && !paused && !state.intro && state.introDone) { if (!state.stepAt) state.stepAt = now + s.interval * 1000; if (now >= state.stepAt) { state.target = (state.target ?? nearest(state.angle)) + s.step * state.dir; state.stepAt = now + s.interval * 1000; } busy = true; } else state.stepAt = 0; if (now < state.holdUntil) busy = true; const ease = 1 - Math.exp(-dt / 0.35), ay = state.pointer.inside ? state.pointer.x * s.parallax * 9 : 0, ap = state.pointer.inside ? -state.pointer.y * s.parallax * 6 : 0; state.yaw += (ay - state.yaw) * ease; state.pitch += (ap - state.pitch) * ease; if (Math.abs(ay - state.yaw) > 0.01 || Math.abs(ap - state.pitch) > 0.01) busy = true; return busy; };
        const render = (s, now) => { const elapsed = state.intro ? now - state.intro.start : 0, swell = 1 + s.stretch * 0.12 * Math.min(1, Math.abs(state.velocity) / 420); let spinOffset = 0; if (state.intro?.type === 'spin') { const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1)); spinOffset = -300 * state.dir * (1 - p); } else if (state.intro?.type === 'assemble') { const p = easeOut(clamp(elapsed / INTRO_LENGTH.assemble, 0, 1)); spinOffset = -32 * state.dir * (1 - p); } const angle = state.angle + spinOffset, R = s.radius * swell; camera.style.transform = `translate3d(0,0,${-R}px) rotateX(${s.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`; ring.style.transform = `rotateY(${angle}deg)`; for (let ix = 0; ix < s.count; ix++) { const card = cardRefs.current[ix]; if (!card) continue; const base = ix * s.step, mod = introCard(elapsed, base), r = R * mod.radius; let tr = `rotateY(${base}deg) translateZ(${r}px)`; if (mod.lift) tr += ` translateY(${mod.lift}px)`; card.style.transform = tr; const world = wrap(base + angle), facing = Math.cos(world * TO_RAD), fade = s.depthFade * Math.pow((1 - facing) / 2, 1.25); card.style.setProperty('--cc-depth', fade.toFixed(3)); } const idx = ((Math.round(-state.angle / s.step) % s.count) + s.count) % s.count || 0; if (idx !== activeRef.current) { activeRef.current = idx; setActive(idx); onChangeRef.current?.(idx); } };
        const frame = now => { raf = 0; const s = settingsRef.current, dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 1 / 60; state.last = now; const busy = advance(s, dt, now); render(s, now); if (busy && visible && !document.hidden) raf = requestAnimationFrame(frame); else state.last = 0; };
        const wake = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }; wakeRef.current = wake;
        const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; state.last = 0; } else wake(); };
        const resize = new ResizeObserver(() => { measure(); wake(); }); resize.observe(root);
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); else { cancelAnimationFrame(raf); raf = 0; state.last = 0; } }); io.observe(root);
        const onWheel = e => { const s = settingsRef.current; if (!s.draggable) return; const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0; if (!delta) return; e.preventDefault(); const per = 180 / (Math.PI * s.radius * state.fit); state.target = null; state.angle -= delta * per; state.velocity = -delta * per * 30; state.holdUntil = performance.now() + 1600; clearTimeout(state.wheelTimer); state.wheelTimer = setTimeout(() => { if (settingsRef.current.snap) state.target = nearest(state.angle + state.velocity * 0.12); wake(); }, 140); wake(); };
        root.addEventListener('wheel', onWheel, { passive: false }); document.addEventListener('visibilitychange', onVis);
        measure(); render(settingsRef.current, performance.now()); wake();
        return () => { cancelAnimationFrame(raf); resize.disconnect(); io.disconnect(); clearTimeout(state.wheelTimer); root.removeEventListener('wheel', onWheel); document.removeEventListener('visibilitychange', onVis); };
    }, []);
    useLayoutEffect(() => { measureRef.current(); wakeRef.current(); }, [radius, cardW, cardH, tiltValue, perspective, preset, captions, count]);
    useEffect(() => { wakeRef.current(); });
    const focusIndex = useCallback(ix => { const st = stateRef.current, s = settingsRef.current; let t = -ix * s.step; t += 360 * Math.round((st.angle - t) / 360); st.target = t; st.holdUntil = performance.now() + 2800; wakeRef.current(); }, []);
    const stepBy = useCallback(d => { const st = stateRef.current, s = settingsRef.current, base = st.target ?? Math.round(st.angle / s.step) * s.step; st.target = base - d * s.step; st.holdUntil = performance.now() + 2800; wakeRef.current(); }, []);
    const updatePointer = e => { const r = rootRef.current.getBoundingClientRect(), p = stateRef.current.pointer; p.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1); p.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1); };
    const down = e => { const st = stateRef.current; st.suppressClick = false; if (!draggable || e.button !== 0) return; st.press = { id: e.pointerId, x: e.clientX, y: e.clientY, angle: st.angle, moved: false, origin: 0, samples: [{ time: performance.now(), angle: st.angle }] }; };
    const move = e => { const st = stateRef.current; if (e.pointerType === 'mouse') { st.pointer.inside = true; updatePointer(e); } const pr = st.press; if (!pr || pr.id !== e.pointerId) { wakeRef.current(); return; } const s = settingsRef.current, delta = e.clientX - pr.x, cross = e.clientY - pr.y; if (!pr.moved) { if (Math.abs(delta) < DRAG_THRESHOLD) return; if (Math.abs(cross) > Math.abs(delta) * 1.2 && e.pointerType !== 'mouse') { st.press = null; return; } pr.moved = true; pr.origin = delta; st.drag = true; st.target = null; st.velocity = 0; setDragging(true); try { rootRef.current.setPointerCapture(e.pointerId); } catch { } } const per = 180 / (Math.PI * s.radius * st.fit); st.angle = pr.angle + (delta - pr.origin) * per; const now = performance.now(); pr.samples.push({ time: now, angle: st.angle }); while (pr.samples.length > 2 && now - pr.samples[0].time > 110) pr.samples.shift(); wakeRef.current(); };
    const up = e => { const st = stateRef.current, pr = st.press; if (!pr || pr.id !== e.pointerId) return; st.press = null; if (!pr.moved) return; st.drag = false; setDragging(false); st.suppressClick = true; const s = settingsRef.current, first = pr.samples[0], last = pr.samples[pr.samples.length - 1], span = (last.time - first.time) / 1000, vel = span > 0.008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0; st.velocity = vel; if (Math.abs(vel) > 60) st.dir = Math.sign(vel); const coasting = s.autoplay === 'drift' && !(s.pauseOnHover && st.hover && e.pointerType === 'mouse'); if (s.snap && !coasting) { const tau = 0.18 + s.momentum * 1.5; st.target = Math.round((st.angle + vel * tau * 0.55) / s.step) * s.step; } wakeRef.current(); };
    const click = e => { const st = stateRef.current; if (st.suppressClick) { st.suppressClick = false; return; } const card = e.target.closest?.('[data-cc-index]'); if (!card) return; const ix = Number(card.getAttribute('data-cc-index')); if (focusOnClick) focusIndex(ix); onItemClick?.(list[ix], ix); };
    const key = e => { if (e.key === 'ArrowRight') stepBy(1); else if (e.key === 'ArrowLeft') stepBy(-1); else if (e.key === 'Home') focusIndex(0); else if (e.key === 'End') focusIndex(count - 1); else if (e.key === 'Enter' || e.key === ' ') onItemClick?.(list[activeRef.current], activeRef.current); else return; e.preventDefault(); };
    const current = list[active] || list[0], label = current ? current.title || current.alt || `Image ${active + 1}` : '';
    const renderTile = (item, tile, back, ix) => { const strip = back ? tile.total - 1 - tile.index : tile.index, first = strip === 0, last = strip === tile.total - 1, r = 'var(--cc-radius)', fr = `${first ? r : 0} ${last ? r : 0} ${last ? r : 0} ${first ? r : 0}`, offset = back ? along - tile.end : tile.start, box = { left: -tile.size / 2, top: -cardH / 2, width: tile.size, height: cardH }, photo = { left: -offset, top: 0, width: cardW, height: cardH }, flip = ' rotateY(180deg)', gone = leaving?.items[ix]; return (<div key={`${back ? 'b' : 'f'}${tile.index}`} className="absolute [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [outline:1px_solid_transparent]" style={{ ...box, transform: tile.move + (back ? flip : '') }} aria-hidden="true"><div className="absolute left-0 top-0 w-full overflow-hidden" style={{ height: cardH, borderRadius: fr }}><img className="pointer-events-none absolute block max-w-none select-none object-cover [-webkit-user-drag:none]" src={item.src} alt="" draggable={false} decoding="async" style={photo} />{gone && (<img key={`leaving-${leaving.id}`} className="pointer-events-none absolute block max-w-none select-none object-cover [-webkit-user-drag:none] animate-[cc-leave_700ms_cubic-bezier(0.33,1,0.68,1)_both]" src={gone.src} alt="" draggable={false} decoding="async" style={{ ...photo, animationDelay: `${Math.round(leaving.delays[ix])}ms` }} />)}{back && <div className="pointer-events-none absolute inset-0 bg-black opacity-[var(--cc-inner)]" />}<div className="pointer-events-none absolute inset-0 bg-[var(--cc-fade)] opacity-[var(--cc-depth,0)]" /></div></div>); };
    return (<div ref={rootRef} className={`group/cc relative h-full w-full touch-pan-y select-none overflow-hidden outline-none [-webkit-tap-highlight-color:transparent] focus-visible:shadow-[inset_0_0_0_2px_rgba(128,128,140,0.55)] data-[draggable]:cursor-grab data-[dragging]:cursor-grabbing ${className}`.trim()} style={{ ...style, '--cc-fade': fadeColor, '--cc-radius': `${Math.max(0, cornerRadius)}px`, '--cc-inner': (1 - clamp(innerShade, 0, 1)).toFixed(3) }} role="region" aria-roledescription="carousel" aria-label="Image carousel" tabIndex={0} data-axis={axis} data-shape="cylinder" data-ready={ready ? '' : undefined} data-draggable={draggable ? '' : undefined} data-dragging={dragging ? '' : undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerEnter={e => { if (e.pointerType !== 'mouse') return; stateRef.current.hover = true; wakeRef.current(); }} onPointerLeave={e => { const st = stateRef.current; if (e.pointerType === 'mouse') { st.hover = false; st.pointer.inside = false; } wakeRef.current(); }} onClick={click} onKeyDown={key}>
        <div className="absolute inset-0"><div ref={stageRef} className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 ease-[ease] group-data-[ready]/cc:opacity-100 motion-reduce:transition-none"><div ref={cameraRef} className="relative h-0 w-0 [transform-style:preserve-3d]"><div ref={ringRef} className="absolute left-0 top-0 h-0 w-0 [transform-style:preserve-3d]">{list.map((item, ix) => (<div key={ix} ref={el => { cardRefs.current[ix] = el; }} className="absolute left-0 top-0 h-0 w-0 [transform-style:preserve-3d]" data-cc-index={ix} role="group" aria-roledescription="slide" aria-label={`${item.title || item.alt || `Image ${ix + 1}`}, ${ix + 1} of ${count}`}>{tiles.map(t => renderTile(item, t, false, ix))}{LAYOUT.backfaces && tiles.map(t => renderTile(item, t, true, ix))}</div>))}</div></div></div></div>
        {captions && current && (<div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 px-4 text-center animate-[cc-reveal_900ms_ease_both] motion-reduce:animate-none" aria-hidden="true"><span key={active} className="flex max-w-full flex-col items-center text-sm font-medium leading-[1.35] animate-[cc-title_520ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none">{current.title || current.alt}{current.subtitle && <span className="font-normal opacity-60">{current.subtitle}</span>}</span><span className="inline-flex items-center gap-1 text-xs leading-none tabular-nums opacity-50"><span>{String(active + 1).padStart(2, '0')}</span><span className="opacity-60">/</span><span>{String(count).padStart(2, '0')}</span></span></div>)}
        <style>{STYLE}</style><div className="sr-only" aria-live="polite" aria-atomic="true">{`${label}, ${active + 1} of ${count}`}</div></div>);
}
function AnalyticsCylinder({ projects, onSelect }) {
    const [active, setActive] = useState(0);
    const items = projects.map((p) => ({ src: p.front, alt: p.title, title: p.title, subtitle: p.category }));
    return (<div>
        <div style={{ width: "100%", height: 300, position: "relative" }}>
            <CircularCarousel items={items} preset="cylinder" intro="rise" cardWidth={230} aspectRatio={1.62} speed={14} captions={false} gap={18} tilt={-5} curve={1} perspective={2500} autoplay="drift" interval={3} direction="left" momentum={0.6} snap pauseOnHover={false} focusOnClick draggable parallax={0.3} stretch={0.5} fadeColor="#6B4A3A" depthFade={0.55} innerShade={0.6} cornerRadius={12} onChange={setActive} onItemClick={(_, index) => onSelect(projects[index])} />
        </div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {projects.map((_, i) => (<button key={i} aria-label={`Go to project ${i + 1}`} onClick={() => setActive(i)} style={{ height: 6, width: active === i ? 24 : 6, borderRadius: 999, background: active === i ? "#D9B878" : "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", transition: "width 0.3s ease" }} />))}
        </div></div>);
}
// WEB APP DEVELOPMENT CAROUSEL


function WebAppCarousel({ projects = [], onSelect }) {
    const items = projects.map((project) => ({
        src: project.front,
        alt: project.title,
        title: project.title,
    }));

    return (
        <FlexCarousel
            items={items}
            preset="liquid"
            intro="rise"
            cardHeight={0.72}
            gap={14}
            radius={16}
            fit="natural"
            autoplay={true}
            interval={4}
            captions={true}
            focusOnClick={true}
            onSelect={(index) => onSelect?.(projects[index])}
            className="h-full w-full"
        />
    );
}




// WEBSITE DEVELOPMENT 3D COVERFLOW CAROUSEL

function WebsiteCoverflow({ projects = [], onSelect }) {
    const [active, setActive] = useState(0);
    const touchStart = useRef(null);
    const touchEnd = useRef(null);
    const dragStart = useRef(null);

    useEffect(() => {
        if (projects.length <= 1) return;

        const timer = setInterval(() => {
            setActive((prev) => (prev + 1) % projects.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [projects.length]);

    if (!projects.length) return null;

    const changeCard = (direction) => {
        setActive((prev) =>
            (prev + direction + projects.length) % projects.length
        );
    };

    const handleTouchStart = (e) => {
        touchStart.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStart.current === null) return;

        touchEnd.current = e.changedTouches[0].clientX;
        const distance = touchStart.current - touchEnd.current;

        if (Math.abs(distance) > 45) {
            changeCard(distance > 0 ? 1 : -1);
        }

        touchStart.current = null;
        touchEnd.current = null;
    };

    const handlePointerDown = (e) => {
        if (e.pointerType === "touch") return;
        dragStart.current = e.clientX;
    };

    const handlePointerUp = (e) => {
        if (dragStart.current === null) return;

        const distance = dragStart.current - e.clientX;

        if (Math.abs(distance) > 45) {
            changeCard(distance > 0 ? 1 : -1);
        }

        dragStart.current = null;
    };

    return (
        <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden touch-pan-y [perspective:1200px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
                dragStart.current = null;
            }}
        >
            {projects.map((project, index) => {
                let offset = index - active;

                if (offset > projects.length / 2) {
                    offset -= projects.length;
                }

                if (offset < -projects.length / 2) {
                    offset += projects.length;
                }

                const isActive = offset === 0;

                return (
                    <motion.div
                        key={project.id}
                        animate={{
                            x: offset * 105,
                            rotateY: offset * -32,
                            scale: isActive ? 1 : 0.78,
                            opacity:
                                Math.abs(offset) > 1
                                    ? 0
                                    : isActive
                                        ? 1
                                        : 0.55,
                            z: isActive ? 100 : -80,
                        }}
                        transition={{
                            duration: 0.65,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        onClick={() => {
                            if (!isActive) {
                                setActive(index);
                                return;
                            }

                            onSelect?.(project);
                        }}
                        className="absolute flex h-[88%] aspect-[9/16] w-auto cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-black/50 shadow-2xl"
                        style={{
                            transformStyle: "preserve-3d",
                            zIndex: 10 - Math.abs(offset),
                        }}
                    >
                        <img
                            src={project.front}
                            alt={project.title}
                            className="h-full w-full object-cover"
                            draggable={false}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}

async function fetchPublishedProjectCollections() {
    const [
        projectsResult,
        assignmentsResult,
        placementsResult,
    ] = await Promise.all([
        supabase
            .from("projects")
            .select("*")
            .eq("is_published", true)
            .order("sort_order", { ascending: true }),

        supabase
            .from("project_placement_assignments")
            .select("project_id, placement_id"),

        supabase
            .from("project_placements")
            .select("id, placement_key"),
    ]);

    if (projectsResult.error) throw projectsResult.error;
    if (assignmentsResult.error) throw assignmentsResult.error;
    if (placementsResult.error) throw placementsResult.error;

    const rows = projectsResult.data || [];

    if (rows.length === 0) {
        throw new Error("Supabase returned no published projects.");
    }

    const mediaIds = [
        ...new Set(
            rows.flatMap((row) => [
                row.cover_media_id,
                row.report_media_id,
                row.demo_video_media_id,
            ].filter(Boolean))
        ),
    ];

    let mediaById = new Map();

    if (mediaIds.length > 0) {
        const mediaResult = await supabase
            .from("media_assets")
            .select("id, file_path")
            .in("id", mediaIds);

        if (mediaResult.error) throw mediaResult.error;

        mediaById = new Map(
            (mediaResult.data || []).map((asset) => [
                asset.id,
                asset.file_path,
            ])
        );
    }

    const getMediaUrl = (mediaId) => {
        if (!mediaId) return null;

        const filePath = mediaById.get(mediaId);
        if (!filePath) return null;

        return supabase.storage
            .from("portfolio-media")
            .getPublicUrl(filePath).data.publicUrl;
    };

    const placementKeys = new Map(
        (placementsResult.data || []).map((placement) => [
            placement.id,
            placement.placement_key,
        ])
    );

    const placementsByProject = new Map();

    (assignmentsResult.data || []).forEach((assignment) => {
        const key = placementKeys.get(assignment.placement_id);
        if (!key) return;

        if (!placementsByProject.has(assignment.project_id)) {
            placementsByProject.set(assignment.project_id, new Set());
        }

        placementsByProject.get(assignment.project_id).add(key);
    });

    const staticProjects = [
        ...analyticsProjects,
        ...webAppProjects,
        ...websiteProjects,
        featuredProject,
    ];

    const projects = rows.map((row) => {
        const sections = Array.isArray(row.content_blocks)
            ? row.content_blocks
            : [];

        const details = sections.find(
            (section) => section.heading === "Project Details"
        ) || {};

        const staticProject = staticProjects.find(
            (project) => project.title === row.title
        ) || {};

        const dataSource = row.data_source_label || row.data_source_url
            ? {
                label: row.data_source_label || "",
                url: row.data_source_url || "",
            }
            : staticProject.dataSource;

        return {
            ...staticProject,
            id: row.project_key,
            dbId: row.id,
            projectKey: row.project_key,
            title: row.title,
            category: row.category || "",
            subtitle: row.subtitle || "",
            overview: row.description || details.paras?.[0] || "",
            technologies: Array.isArray(row.technologies)
                ? row.technologies
                : [],
            number: row.project_number != null
                ? String(row.project_number).padStart(2, "0")
                : "",
            front: getMediaUrl(row.cover_media_id) || staticProject.front || null,
            report: getMediaUrl(row.report_media_id) || staticProject.report || null,
            video: getMediaUrl(row.demo_video_media_id) || staticProject.video || null,
            github: row.github_url || "",
            live: row.live_url || "",
            dataSource,
            sections,
            features: details.bullets || staticProject.features || [],
            contribution: details.contribution || staticProject.contribution || [],
            challenges: details.challenges || staticProject.challenges || [],
            icon: staticProject.icon,
            isFeatured: row.is_featured,
            isPublished: row.is_published,
            placements: [
                ...(placementsByProject.get(row.id) || []),
            ],
        };
    });

    const inPlacement = (project, key) =>
        project.placements.includes(key);

    return {
        featuredProject:
            projects.find((project) => project.isFeatured) || featuredProject,

        webAppProjects: projects.filter((project) =>
            inPlacement(project, "web-applications")
        ),

        websiteProjects: projects.filter((project) =>
            inPlacement(project, "websites")
        ),

        analyticsProjects: projects.filter((project) =>
            inPlacement(project, "data-analytics-projects")
        ),
    };
}

export default function Projects() {
    const [selected, setSelected] = useState(null);
    const [collections, setCollections] = useState({
        webAppProjects,
        websiteProjects,
        analyticsProjects,
        featuredProject,
    });

    useEffect(() => {
        let cancelled = false;

        async function loadProjects() {
            try {
                const result = await fetchPublishedProjectCollections();

                if (!cancelled) {
                    setCollections(result);
                }
            } catch (error) {
                console.error(
                    "Could not load published projects from Supabase. Using static fallback.",
                    error
                );
            }
        }

        loadProjects();

        return () => {
            cancelled = true;
        };
    }, []);
    useEffect(() => { document.body.style.overflow = selected ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [selected]);
    const openRecon = () => setSelected({
        ...featuredProject,
        isFeatured: true,
        sections: reconSections,
    });
    return (
        <section id="projects" className="relative overflow-hidden bg-[#6B4A3A]">
            {/* DIRTY-BLACK SEPARATOR - v1, same as Skills / Experience */}
            <div aria-hidden="true" className="relative h-[76px] w-full overflow-hidden" style={{ background: "linear-gradient(to bottom, #050504 0%, #140E0A 28%, #2E1C14 55%, #4E3122 78%, #6B4A3A 100%)" }}>
                <div className="absolute inset-0" style={{ background: "radial-gradient(120% 130% at 50% -20%, rgba(5,5,4,0.95) 0%, rgba(20,14,10,0.65) 38%, rgba(107,74,58,0) 72%)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(5,5,4,0.88) 0%, rgba(5,5,4,0.25) 18%, rgba(5,5,4,0) 42%, rgba(5,5,4,0) 58%, rgba(5,5,4,0.25) 82%, rgba(5,5,4,0.88) 100%)" }} />
                <div className="absolute inset-x-0 bottom-0 h-[22px]" style={{ background: "linear-gradient(to bottom, rgba(107,74,58,0) 0%, rgba(107,74,58,0.55) 55%, #6B4A3A 100%)", filter: "blur(2px)" }} />
            </div>
            <div className="container mx-auto max-w-7xl px-6 pb-10 pt-10 sm:pb-12 sm:pt-12 lg:px-10">
                <div className="mb-4"><h2 className="text-3xl font-bold tracking-tight text-[#2B1D17] sm:text-5xl">Projects</h2></div>
                <p className="mt-3 max-w-3xl text-base leading-7 text-[#D9B878]">From practical software applications to business data and economic research,<br />these projects turn technology and analytical thinking into meaningful solutions. </p>
                <div className="mb-6 border-t-4 border-[#2B1D17]" aria-hidden="true" />
                <div className="mb-6 grid items-center gap-4 md:grid-cols-3">

                    {/* LEFT â€” WEB APP DEVELOPMENT */}
                    <div className="h-[264px] overflow-hidden">
                        <WebAppCarousel
                            projects={collections.webAppProjects}
                            onSelect={(project) =>
                                setSelected(
                                    project.title === featuredProject.title
                                        ? {
                                            ...project,
                                            isFeatured: true,
                                            sections: project.sections?.length
                                                ? project.sections
                                                : reconSections,
                                        }
                                        : project
                                )
                            }
                        />
                    </div>

                    {/* CENTRE â€” SECTION TITLE */}
                    <div className="md:pl-8">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#F3EAD9]/80">
                            01 / Build and Develop
                        </p>

                        <h3 className="text-2xl font-bold text-[#D9B878] sm:text-3xl">
                            Software Development
                        </h3>
                    </div>

                    {/* RIGHT â€” WEBSITE DEVELOPMENT */}
                    <div className="h-[264px] overflow-hidden">
                        <WebsiteCoverflow
                            projects={collections.websiteProjects}
                            onSelect={setSelected}
                        />
                    </div>

                </div>
                <div className="my-6 border-t-4 border-[#2B1D17]" aria-hidden="true" />
                <div className="grid items-center gap-6 lg:grid-cols-3">
                    <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#F3EAD9]/80">02 / Analyse and Discover</p><h3 className="text-2xl font-bold text-[#D9B878] sm:text-3xl">Data Analytics and Research</h3></div>
                    <div className="lg:col-span-2"><AnalyticsCylinder projects={collections.analyticsProjects} onSelect={setSelected} /></div>
                </div>
            </div>
            <AnimatePresence>{selected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-8" onClick={() => setSelected(null)}>
                    <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.98 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="relative my-8 w-full max-w-4xl overflow-hidden rounded-3xl border border-black/15 bg-cover bg-center bg-no-repeat p-6 sm:p-10" style={{ backgroundImage: `url(${vintageBackground})` }}>
                        <button onClick={() => setSelected(null)} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/40 text-[#050504] hover:bg-white/60"><X size={18} /></button>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2B1D17]">{selected.category}</p>
                        <h3 className="mt-3 pr-12 text-3xl font-bold text-[#D9B878] sm:text-4xl">{selected.title}</h3>
                        {selected.subtitle && <p className="mt-3 text-sm font-medium text-[#2B1D17]">{selected.subtitle}</p>}
                        {selected.id === "salim-portfolio" && selected.video && (
                            <div className="mt-6 overflow-hidden rounded-xl">
                                <video
                                    src={selected.video}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    className="h-auto w-full rounded-xl"
                                />
                            </div>
                        )}
                        {selected.overview && (
                            <div className="mt-6">
                                <h4 className="text-lg font-bold text-[#A87C2F]">Project Overview</h4>
                                <p className="mt-3 text-sm leading-7 text-[#050504]">
                                    {selected.overview}
                                </p>
                            </div>
                        )}

                        {selected.technologies?.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-lg font-bold text-[#A87C2F]">Technologies Used</h4>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selected.technologies.map((technology, i) => (
                                        <span
                                            key={i}
                                            className="rounded-full border border-[#2B1D17]/30 bg-white/30 px-3 py-2 text-xs font-semibold text-[#2B1D17]"
                                        >
                                            {technology}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selected.features?.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-lg font-bold text-[#A87C2F]">Key Features</h4>
                                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/85">
                                    {selected.features.map((feature, i) => (
                                        <li key={i}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {selected.contribution?.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-lg font-bold text-[#A87C2F]">My Contribution</h4>
                                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/85">
                                    {selected.contribution.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {selected.challenges?.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-lg font-bold text-[#A87C2F]">Challenges & Solutions</h4>
                                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-white/85">
                                    {selected.challenges.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {selected.live && <a href={selected.live} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-[#2B1D17] underline">Live Application: {selected.live}</a>}
                        {selected.dataSource && (<p className="mt-3 text-sm leading-7 text-white/85"><span className="font-semibold">Data source: </span>{selected.dataSource.url ? <a href={selected.dataSource.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#A87C2F] underline">{selected.dataSource.label}</a> : selected.dataSource.label}</p>)}
                        {selected.sections && selected.sections.map((section, i) => <BodySection key={i} section={section} index={i} />)}
                        <div className="mt-8 flex flex-wrap gap-3">
                            {selected.live && <a href={selected.live} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#2B1D17]/40 px-5 py-3 text-sm font-semibold text-[#2B1D17]">Open Live App<ArrowUpRight size={16} /></a>}
                            {selected.report && <a href={selected.report} download className="inline-flex items-center gap-2 rounded-xl bg-[#A87C2F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8F6A28]"><Download size={17} />Download Full Report</a>}
                            {selected.github && <a href={selected.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#2B1D17] px-5 py-3 text-sm font-semibold text-[#F3EAD9] hover:bg-[#1A1A1F]"><Code2 size={17} />View on GitHub<ArrowUpRight size={16} /></a>}
                        </div>
                    </motion.div>
                </motion.div>)}
            </AnimatePresence>
        </section>
    );
}

