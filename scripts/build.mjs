import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import MarkdownIt from 'markdown-it';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const book=JSON.parse(fs.readFileSync(path.join(root,'book.json'),'utf8'));
const out=path.join(root,'dist');
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md=new MarkdownIt({html:false,typographer:true});
const slugify=v=>v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
const chapters=book.chapters.map((c,index)=>{const source=fs.readFileSync(path.join(root,'chapters',c.file),'utf8');const tokens=md.parse(source,{}),headings=[],seen=new Map();for(let i=0;i<tokens.length;i++){if(tokens[i].type==='heading_open'){const title=tokens[i+1].content,base=slugify(title),n=seen.get(base)||0;seen.set(base,n+1);const id=base+(n?`-${n}`:'');tokens[i].attrSet('id',id);headings.push({title,id});}if(tokens[i].type==='paragraph_open'&&tokens[i+1]?.content.startsWith('**Field note:'))tokens[i].attrSet('class','field-note');}const words=source.split(/\s+/).length;return{...c,index,source,headings,html:md.renderer.render(tokens,md.options,{}),words,minutes:Math.ceil(words/220)};});
const totalWords=chapters.reduce((n,c)=>n+c.words,0),href=c=>`${book.base}${c.slug}/`;
const bookSchema={'@context':'https://schema.org','@type':'Book','@id':book.origin+book.base+'#book',name:book.title,alternativeHeadline:book.subtitle,inLanguage:'en',image:book.origin+'/skiing/assets/cover-illustrated.jpg',bookEdition:book.edition,datePublished:book.date,dateModified:book.date,isAccessibleForFree:true,author:{'@type':'Organization',name:'MAX VERT',url:book.origin},publisher:{'@type':'Organization',name:'DidThey LLC'},url:book.origin+book.base,hasPart:chapters.map(c=>({'@type':'Chapter',name:c.seo,url:book.origin+href(c),position:c.index+1}))};
const masthead = `<nav class="site-nav mv-masthead" aria-label="Main navigation">
  <a class="mv-wordmark" href="/" aria-label="Max Vert home">MAX VERT<sup>™</sup></a>
  <div class="mv-sections">
    <a href="/#game">The Game</a><a href="/data/resorts/">Resorts</a>
    <a href="/data/">Plan a Day</a><a href="/skiing/" aria-current="location">The Book</a>
  </div>
</nav>`;

function page({title,description,url,body,schema=bookSchema,chapter='',noindex=false}){const full=book.origin+url;return`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} | The Long Season · Max Vert™</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${full}">${noindex?'<meta name="robots" content="noindex,follow">':''}<meta name="theme-color" content="#101e20"><meta property="og:type" content="${chapter?'article':'website'}"><meta property="og:site_name" content="MAX VERT™"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${full}"><meta property="og:image" content="${book.origin}/skiing/assets/cover-illustrated.jpg"><meta property="og:image:alt" content="The Long Season: A Field Guide to Skiing book cover"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${book.origin}/skiing/assets/cover-illustrated.jpg"><link rel="icon" href="/icons/icon-192.png"><link rel="stylesheet" href="/masthead.css?v=1"><link rel="stylesheet" href="/skiing/assets/book.css?v=4"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script></head><body${chapter?` data-chapter="${chapter}"`:''}><a class="skip" href="#main">Skip to content</a><div class="shell">${masthead}${body}<footer><div>© 2026 DidThey LLC · MAX VERT™ is a trademark of DidThey LLC.<br>U.S. trademark application pending.</div><div><a href="/skiing/copyright/">Copyright</a><a href="/skiing/skiing-resources/#about-this-edition">About this edition</a><a href="/privacy/">Privacy</a><a href="https://github.com/snoberserker/max-vert-ski-book/issues">Corrections</a></div></footer></div><script src="/skiing/assets/book.js?v=2" defer></script><script src="/analytics.js?v=2" async></script><script src="/analytics-events.js?v=2" defer></script></body></html>\n`;}
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(path.join(out,'assets'),{recursive:true});for(const asset of ['book.css','book.js','cover-screen.webp','cover-illustrated.webp','cover-illustrated.jpg'])fs.copyFileSync(path.join(root,'assets',asset),path.join(out,'assets',asset));
function write(url,html){const dir=path.join(out,url.slice(book.base.length));fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html);}
fs.cpSync(path.join(root,'assets/plates'),path.join(out,'assets/plates'),{recursive:true});
fs.cpSync(path.join(root,'assets/previews'),path.join(out,'assets/previews'),{recursive:true});
const copyright = `<p><em>The Long Season: A Field Guide to Skiing</em></p><p>Copyright © 2026 DidThey LLC. All rights reserved.</p><p>Published by DidThey LLC. Illustrated edition, November 2026. MAX VERT™ is a trademark of DidThey LLC.</p><p>The illustrations are original AI-generated interpretations. Historical and scientific sources appear alongside the text.</p>`;
const closing = `<p>At the bottom of a run you sometimes have time for one more chair. Here are two ways to take it.</p><p>For a day on real snow, visit the Max Vert website. Find a mountain, look up its forecast, or read the latest story from the journal.</p><p><a href="https://www.playmaxvert.com/">www.playmaxvert.com</a></p><p>For an evening indoors, play MAX VERT™, the skiing card game. Draw your hand, choose a run, and see how much vertical you can bring home.</p><p><a href="https://www.playmaxvert.com/play/">www.playmaxvert.com/play/</a></p>`;
for (const [slug,title,description,content,next,label] of [
  ['copyright','Copyright','Publication and illustration credits for The Long Season.',copyright,href(chapters[0]),'Begin chapter one'],
  ['after-the-last-run','After the last run','Continue from The Long Season to the Max Vert website and skiing card game.',closing,book.base,'Return to the book']
]) {
  const url = book.base + slug + '/';
  write(url,page({title,description,url,body:`<main id="main" class="publication prose"><h1>${title}</h1>${content}<p><a href="${next}">${label} →</a></p></main>`}));
}
const chapterNumber = c => String(c.index + 1).padStart(2, '0');
const parts = [...new Set(chapters.map(c => c.part))];
const contents = parts.map((part, index) => {
  const [number, title] = part.split(' · ');
  const entries = chapters.filter(c => c.part === part);
  return `<section class="chapter-group" data-chapter-group aria-labelledby="book-part-${index + 1}">
    <h3 id="book-part-${index + 1}"><span>Part ${esc(number)}</span>${esc(title)}</h3>
    <ol class="chapter-list" start="${entries[0].index + 1}">${entries.map(c => `
      <li class="chapter-item" data-chapter="${esc(c.tag)}">
        <a class="chapter-link" href="${href(c)}">
          <span class="num" aria-hidden="true">${chapterNumber(c)}</span>
          <strong>${esc(c.title)}</strong>
          <span class="desc">${esc(c.description)}</span>
          <small>${c.minutes} min</small>
        </a>
      </li>`).join('')}
    </ol>
  </section>`;
}).join('');

const features = [
  [chapters[0], 'tow', 'Ski history'],
  [chapters[2], 'night', 'Season planning'],
  [chapters[7], 'boot', 'Equipment & fit'],
];

write(book.base, page({
  title: 'The Long Season: A Free Skiing Book',
  description: 'A free illustrated skiing book: history, industry trends, season planning, fitness, healthy ski days, travel, gear, mountain skills, and a skiing glossary.',
  url: book.base,
  body: `<main id="main" class="book-home">
    <header class="cover">
      <div class="cover-title">
        <p class="eyebrow">A field guide to skiing</p>
        <h1>The Long <em>Season</em></h1>
      </div>
      <div class="cover-copy">
        <p class="lede">From the first rope tows to reading a snow forecast, The Long Season explores how skiing got here and how to make more of your own winter.</p>
        <div class="actions"><a class="button" href="${href(chapters[0])}">Start reading</a>
          <a class="cover-contents" href="#contents">All chapters</a></div>
        <a data-resume hidden href="/skiing/">Continue reading</a>
        <p class="edition">${esc(book.edition)} · Free to read</p>
      </div>
      <figure class="cover-art"><img src="/skiing/assets/cover-screen.webp" width="560" height="896"
        alt="The Long Season cover: a lone skier traces a winding line below a copper sun" fetchpriority="high"></figure>
    </header>
    <section class="featured" aria-labelledby="featured-title">
      <h2 id="featured-title">From the book</h2>
      <div class="feature-grid">${features.map(([c, plate, theme]) => `
        <a href="${href(c)}" class="feature-link">
          <img src="/skiing/assets/previews/${plate}.webp" width="420" height="280" alt="" loading="lazy">
          <div><small>${esc(theme)}</small><strong>${esc(c.title)}</strong></div>
        </a>`).join('')}
      </div>
    </section>
    <section id="contents" aria-labelledby="contents-title">
      <div class="section-head">
        <h2 id="contents-title">Contents</h2>
        <label class="search-label" data-enhance hidden>Find a chapter
          <input data-chapter-search type="search" placeholder="Try training, history, gear…"></label>
      </div>
      <p class="edition" data-search-count role="status">${chapters.length} chapters</p>
      ${contents}
    </section>
    <nav class="utility" aria-label="Book tools">
      <a href="/skiing/season-planner/"><strong>Season planner</strong><span>Set your goals and work out what a ski day will cost.</span></a>
      <a href="/skiing/skiing-glossary/"><strong>Skiing glossary</strong><span>Look up terrain, snow, gear, and technique.</span></a>
      <a href="/skiing/print/"><strong>Print edition</strong><span>Read the whole book on one page or save it as a PDF.</span></a>
    </nav>
    <p class="edition book-source">An AI-assisted revised edition, grounded in linked sources. General education, with a North American recreational skiing focus.
      <a href="/skiing/skiing-resources/#about-this-edition">Read the editorial scope and source notes.</a></p>
  </main>`,
}));

for (const c of chapters) {
  const prev = chapters[c.index - 1], next = chapters[c.index + 1];
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {'@type':'Chapter', name:c.seo, headline:c.title, description:c.description, url:book.origin+href(c), position:c.index+1, inLanguage:'en', datePublished:book.date, dateModified:book.date, isAccessibleForFree:true, author:{'@type':'Organization',name:'MAX VERT'}, publisher:{'@type':'Organization',name:'DidThey LLC'}, isPartOf:{'@type':'Book','@id':book.origin+book.base+'#book',name:book.title,url:book.origin+book.base}},
      {'@type':'BreadcrumbList', itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:book.origin+'/'},{'@type':'ListItem',position:2,name:book.title,item:book.origin+book.base},{'@type':'ListItem',position:3,name:c.seo,item:book.origin+href(c)}]},
    ],
  };
  const sidebar = `<aside class="sidebar" aria-label="Book navigation">
    <details class="on-page">
      <summary>In this chapter</summary>
      <nav aria-label="In this chapter">${c.headings.map(h => `<a href="#${h.id}">${esc(h.title)}</a>`).join('')}</nav>
    </details>
    <details class="chapter-menu">
      <summary>All chapters</summary>
      <ol>${chapters.map(x => `<li><a href="${href(x)}"${x === c ? ' aria-current="page"' : ''}><span>${chapterNumber(x)}</span>${esc(x.title)}</a></li>`).join('')}</ol>
    </details>
  </aside>`;
  const glossary = c.slug === 'skiing-glossary' ? `<div class="glossary-tools" data-enhance hidden>
    <label class="search-label">Find a skiing term<input data-glossary-search type="search" placeholder="Try camber, corn, or couloir…"></label>
    <p class="edition" data-glossary-count role="status"></p>
  </div>` : '';
  write(href(c), page({
    title: c.seo,
    description: c.description,
    url: href(c),
    schema,
    chapter: c.slug,
    body: `<main id="main" class="reader-page">
      <header class="chapter-head">
        <a class="book-back" href="/skiing/#contents">The Long Season</a>
        <p class="eyebrow">${esc(c.part)}</p>
        <h1>${esc(c.title)}</h1>
        <p class="deck">${esc(c.description)}</p>
        <div class="chapter-meta"><span>Chapter ${c.index + 1} of ${chapters.length}</span>
          <span>${c.minutes} min read</span><button data-print data-enhance type="button" hidden>Print chapter</button></div>
      </header>
      <div class="reader-layout">${sidebar}
        <article>${glossary}<div class="prose chapter-prose">${c.html}</div>
          <nav class="chapter-pager" aria-label="Chapter pagination">
            <a href="${prev ? href(prev) : '/skiing/#contents'}"><small>${prev ? 'Previous chapter' : 'Back to contents'}</small>${esc(prev?.title || 'The Long Season')}</a>
            <a href="${next ? href(next) : '/skiing/after-the-last-run/'}"><small>${next ? 'Next chapter' : 'Closing page'}</small>${esc(next?.title || 'After the last run')}</a>
          </nav>
        </article>
      </div>
    </main>`,
  }));
}
const planner=fs.readFileSync(path.join(root,'assets/planner.html'),'utf8');
write('/skiing/season-planner/',page({title:'Ski Season Planner & Budget Worksheet',description:'Plan your ski season with goals, realistic days, a pass break-even calculator, complete season costs, and a printable worksheet you can save on your device.',url:'/skiing/season-planner/',schema:{'@context':'https://schema.org','@type':'WebPage',name:'Ski Season Planner',url:book.origin+'/skiing/season-planner/'},body:planner}));
write('/skiing/print/',page({title:'The Long Season — Complete Print Edition',description:'Read all fourteen chapters of The Long Season in one continuous edition, with a print layout for paper or your browser’s Save as PDF option.',url:'/skiing/print/',noindex:true,body:`<main id="main" class="full-book"><header class="print-title"><p class="eyebrow">Print edition</p><h1>The Long Season</h1><p class="subtitle">A Field Guide to Skiing</p><img src="/skiing/assets/cover-illustrated.webp" width="800" height="1280" alt="The Long Season cover"><p>${book.edition} · DidThey LLC</p><div class="actions"><button data-print type="button">Print / Save as PDF</button><a class="button secondary" href="/skiing/">Back to the book</a></div><p class="edition">General education. See the final chapter for editorial scope, sources, and health and safety boundaries.</p></header><section class="print-chapter publication"><h2>Copyright</h2>${copyright}</section><section class="print-chapter"><h2>Contents</h2><ol>${chapters.map(c=>`<li><a href="#print-${c.slug}">${esc(c.title)}</a></li>`).join('')}</ol></section>${chapters.map(c=>`<section class="print-chapter" id="print-${c.slug}"><p class="eyebrow">${esc(c.part)} / Chapter ${c.index+1}</p><h2>${esc(c.title)}</h2><div class="prose">${c.html.replace(/id="([^"]+)"/g,`id="${c.slug}-$1"`)}</div></section>`).join('')}<section class="print-chapter publication"><h2>After the last run</h2>${closing}</section></main>`}));
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({title:book.title,date:book.date,totalWords,chapters:chapters.map(c=>({slug:c.slug,title:c.title,words:c.words,minutes:c.minutes})),pages:['/skiing/',...chapters.map(href),'/skiing/season-planner/','/skiing/copyright/','/skiing/after-the-last-run/']},null,2));
fs.writeFileSync(path.join(out,'sitemap-fragment.xml'),['/skiing/',...chapters.map(href),'/skiing/season-planner/','/skiing/copyright/','/skiing/after-the-last-run/'].map(url=>`<url><loc>${book.origin}${url}</loc><lastmod>${book.date}</lastmod></url>`).join('\n')+'\n');
console.log(`Built ${chapters.length} chapters, ${totalWords.toLocaleString()} words; 19 HTML pages → ${out}`);
