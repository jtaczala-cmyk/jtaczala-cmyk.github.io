/* © 2026 Stop60 – category filter (progressive: without JS all games are shown) */
(function(){var f=document.querySelector('.filters');if(!f)return;f.hidden=false;
var cards=[].slice.call(document.querySelectorAll('.cards .card'));
function set(c){[].forEach.call(f.querySelectorAll('button'),function(b){b.setAttribute('aria-pressed',b.dataset.c===c)});
cards.forEach(function(el){el.hidden=!(c==='all'||el.dataset.cat.split(' ').indexOf(c)>-1)});
if(history.replaceState)history.replaceState(null,'',c==='all'?location.pathname:'#'+c);}
f.addEventListener('click',function(e){var b=e.target.closest('button');if(b)set(b.dataset.c)});
var h=location.hash.slice(1);if(f.querySelector('[data-c="'+h+'"]'))set(h);})();
