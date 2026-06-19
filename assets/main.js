
const q=document.querySelector('#search');
const entries=[...document.querySelectorAll('.entry')];
function filter(term){term=(term||'').toLowerCase().trim();entries.forEach(e=>{e.classList.toggle('hidden', term && !e.dataset.text.includes(term));});}
q?.addEventListener('input',e=>filter(e.target.value));
document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{q.value=b.dataset.keyword;filter(q.value);window.scrollTo({top:document.querySelector('.toolbar').offsetTop,behavior:'smooth'});}));
