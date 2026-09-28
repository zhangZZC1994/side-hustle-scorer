const fs = require('fs');
const path = require('path');

const here = __dirname;
const root = path.resolve(here, '..');
const data = JSON.parse(fs.readFileSync(path.join(here, 'data.json'), 'utf8'));

const DIMS = [
  { k: 'cost',     n: '启动成本低', w: 1.0 },
  { k: 'skill',    n: '技能匹配度', w: 1.5 },
  { k: 'time',     n: '时间弹性',   w: 1.0 },
  { k: 'demand',   n: '市场需求',   w: 1.5 },
  { k: 'compound', n: '复利潜力',   w: 2.0 },
  { k: 'compete',  n: '竞争强度',   w: 1.0 },
  { k: 'speed',    n: '变现速度',   w: 1.0 },
  { k: 'sustain',  n: '可持续性',   w: 1.0 }
];
const WSUM = DIMS.reduce((a, d) => a + d.w, 0);

function score(it) {
  const raw = DIMS.reduce((a, d) => a + (it.s[d.k] || 0) * d.w, 0) / WSUM;
  return Math.round(raw * 20);
}
function grade(v) {
  if (v >= 80) return ['A', '值得投入'];
  if (v >= 65) return ['B', '可以做'];
  if (v >= 50) return ['C', '谨慎'];
  if (v >= 35) return ['D', '不推荐'];
  return ['E', '回避'];
}

const CSS = `:root{--bg:#F7F6F3;--card:#fff;--line:#E5E3DD;--txt:#2C2C2A;--txt2:#5F5E5A;--ac:#1D9E75;--acbg:#E1F5EE;--warn:#BA7517;--warnbg:#FAEEDA;--bad:#A32D2D;--badbg:#FCEBEB}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--txt);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;line-height:1.7;padding:24px 16px 48px;font-size:15px}
.wrap{max-width:760px;margin:0 auto}
a{color:var(--ac)}
h1{font-size:26px;font-weight:600;line-height:1.35;margin-bottom:10px}
h2{font-size:18px;font-weight:600;margin:28px 0 12px;padding-left:10px;border-left:4px solid var(--ac)}
h3{font-size:15px;font-weight:600;margin:18px 0 8px}
.lead{font-size:15px;color:var(--txt2);margin-bottom:20px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px 24px;margin-bottom:16px}
.hero{background:var(--acbg);border:1px solid #9FE1CB}
.bigrow{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.big{font-size:48px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums}
.g{display:inline-block;font-size:14px;padding:4px 14px;border-radius:999px;background:var(--ac);color:#fff;font-weight:500}
.verdict{font-size:15px;flex:1;min-width:240px}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:7px 6px;border-bottom:1px solid var(--line)}
th{color:var(--txt2);font-weight:500;font-size:13px}
td.n{text-align:right;font-variant-numeric:tabular-nums;width:44px}
.bw{background:#F1EFE8;border-radius:3px;overflow:hidden;width:110px}
.bar{height:6px;background:var(--ac);border-radius:3px}
.kv{display:grid;grid-template-columns:96px 1fr;gap:8px 14px;font-size:14px}
.kv dt{color:var(--txt2)}
ul{margin:0 0 0 18px}
li{margin-bottom:8px}
.pit li{color:var(--bad)}
.box-warn{background:var(--warnbg);border:1px solid var(--warn);border-radius:12px;padding:16px 20px;margin:16px 0;font-size:14px}
.cta{background:#fff;border:1px solid var(--ac);text-align:center;padding:24px}
.btn{display:inline-block;background:var(--ac);color:#fff;padding:11px 24px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:500;margin:6px}
.btn.gh{background:transparent;color:var(--ac)}
.note{font-size:13px;color:var(--txt2);margin-top:10px}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.tag{font-size:13px;padding:5px 12px;border:1px solid var(--line);border-radius:999px;background:#fff;text-decoration:none;color:var(--txt)}
.tag:hover{border-color:var(--ac);color:var(--ac)}
footer{font-size:13px;color:var(--txt2);text-align:center;margin-top:32px;line-height:1.9}
@media(max-width:520px){h1{font-size:22px}.big{font-size:40px}.card{padding:16px 18px}}`;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function page(it, others) {
  const v = score(it);
  const [g, glabel] = grade(v);
  const url = `${data.site}guides/${it.slug}.html`;
  const title = `${it.h1}？8 维度实测评估（${v} 分 · ${g} 级）`;

  const dimRows = DIMS.map(d => {
    const s = it.s[d.k];
    return `<tr><td>${d.n}${d.w === 2.0 ? ' <span style="color:var(--ac);font-size:12px">×2 权重</span>' : ''}</td><td class="n">${s}</td><td><div class="bw"><div class="bar" style="width:${s * 20}%"></div></div></td></tr>`;
  }).join('\n');

  const links = others.map(o => `<a class="tag" href="${o.slug}.html">${o.name} ${score(o)} 分</a>`).join('');

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: it.desc,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
    author: { '@type': 'Person', name: '独立开发者' }
  };

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(it.desc)}">
<meta name="keywords" content="${esc(it.kw.join(','))}">
<link rel="canonical" href="${url}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${CSS}</style>
</head>
<body>
<div class="wrap">

<h1>${esc(it.h1)}？8 维度实测评估</h1>
<p class="lead">${esc(it.desc)}</p>

<div class="card hero">
  <div class="bigrow">
    <div><div style="font-size:13px;color:var(--txt2)">加权总分</div><div class="big">${v}</div></div>
    <div><div style="font-size:13px;color:var(--txt2);margin-bottom:6px">评级</div><span class="g">${g} · ${glabel}</span></div>
    <div class="verdict">${esc(it.verdict)}</div>
  </div>
</div>

<div class="card">
  <h2 style="margin-top:0">8 维度打分</h2>
  <table>
    <thead><tr><th>维度</th><th style="text-align:right">得分</th><th style="width:110px">强度</th></tr></thead>
    <tbody>
${dimRows}
    </tbody>
  </table>
  <p class="note">评分 1–5 分。「复利潜力」占双倍权重，因为它是区分资产与时薪的唯一关键维度。</p>
</div>

<div class="card">
  <h2 style="margin-top:0">关键数据</h2>
  <dl class="kv">
    <dt>启动成本</dt><dd>${esc(it.startup)}</dd>
    <dt>时间投入</dt><dd>${esc(it.hours)}</dd>
    <dt>收入区间</dt><dd>${esc(it.income)}</dd>
  </dl>
  <p class="note">收入区间为公开可见经验范围的估计，非承诺。个体差异极大，分布通常是右偏的——中位数远低于你看到的成功案例。</p>
</div>

<div class="card">
  <h2 style="margin-top:0">三个真实的坑</h2>
  <ul class="pit">
${it.pitfalls.map(p => `    <li>${esc(p)}</li>`).join('\n')}
  </ul>
</div>

<div class="card">
  <h2 style="margin-top:0">谁适合，谁不适合</h2>
  <h3>适合</h3><p>${esc(it.fit)}</p>
  <h3>不适合</h3><p>${esc(it.unfit)}</p>
</div>

<div class="box-warn">
  <strong>关键一问：我停手一个月，它还在赚钱吗？</strong><br>
  ${esc(it.compound)}
</div>

<div class="card cta">
  <p style="font-size:16px;font-weight:500">通用评分只能给方向，具体问题需要具体诊断。</p>
  <p style="font-size:14px;color:var(--txt2)">把你的候选项目、现有技能、可投入时间发给我，我做一次书面评估并给出改进建议。<strong>48 小时内交付。</strong></p>
  <a class="btn" href="${data.talk}">定制评估 · ¥99</a>
  <a class="btn gh" href="${data.site}">先免费自测我的项目</a>
  <p class="note">自测工具永久免费、无需注册、数据不上传。定制评估含：维度诊断 + 卡点定位 + 可执行的下一步。</p>
</div>

<div class="card">
  <h2 style="margin-top:0">其他副业评估</h2>
  <div class="tags">
${links}
  </div>
</div>

<footer>
  基于 8 维度加权模型 · 复利潜力占双倍权重<br>
  <a href="${data.site}">副业评估器</a> · <a href="${data.repo}">GitHub 开源</a> · <a href="./">全部副业评估</a>
</footer>
</div>
</body>
</html>`;
}

function indexPage() {
  const items = data.items.slice().sort((a, b) => score(b) - score(a));
  const rows = items.map(it => {
    const v = score(it);
    const [g] = grade(v);
    return `<tr><td><a href="${it.slug}.html">${esc(it.name)}</a></td><td class="n">${v}</td><td>${g}</td><td>${esc(it.verdict.slice(0, 34))}…</td></tr>`;
  }).join('\n');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>20 种副业横向评估对照表 · 8 维度打分</title>
<meta name="description" content="20 种常见副业的 8 维度加权评分对照表，含启动成本、时间投入、收入区间与复利诊断。一次看清哪个值得做。">
<link rel="canonical" href="${data.site}guides/">
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<h1>20 种副业横向评估对照表</h1>
<p class="lead">同一套 8 维度模型下的横向对比。按加权总分从高到低排列。分数高的不一定适合你——先看「谁适合」那一栏。</p>
<div class="card">
<table>
<thead><tr><th>副业</th><th style="text-align:right">总分</th><th>评级</th><th>一句话结论</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</div>
<div class="card cta">
  <p>有具体项目要判断？</p>
  <a class="btn" href="${data.talk}">定制评估 · ¥99</a>
  <a class="btn gh" href="${data.site}">免费自测</a>
</div>
<footer><a href="${data.site}">副业评估器</a> · <a href="${data.repo}">GitHub 开源</a></footer>
</div>
</body>
</html>`;
}

const outDir = path.join(root, 'guides');
fs.mkdirSync(outDir, { recursive: true });

data.items.forEach((it, i) => {
  const others = data.items.filter((_, j) => j !== i);
  fs.writeFileSync(path.join(outDir, `${it.slug}.html`), page(it, others), 'utf8');
});
fs.writeFileSync(path.join(outDir, 'index.html'), indexPage(), 'utf8');

const today = '2026-09-28';
const urls = [data.site, `${data.site}guides/`]
  .concat(data.items.map(it => `${data.site}guides/${it.slug}.html`));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u === data.site ? '1.0' : '0.7'}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap, 'utf8');
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${data.site}sitemap.xml\n`, 'utf8');

console.log('generated', data.items.length, 'pages + index + sitemap + robots');
data.items.slice().sort((a, b) => score(b) - score(a)).forEach(it => {
  const v = score(it); const [g] = grade(v);
  console.log(String(v).padStart(3), g, it.name);
});
