const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const stopWords = new Set(`a an and are as at be been being but by can could did do does doing for from had has have he her hers him his how i if in into is it its itself just may me more most my no not of on once only or other our out over own same she should so some such than that the their them then there these they this those through to too under up very was we were what when where which while who why will with would you your`.split(' '));
const sampleText = `Attention changes with the task, the setting, and the way information is presented. When a page feels crowded or a sentence carries too many ideas, a reader may spend more energy finding their place than understanding the message.

Small adjustments can make reading more manageable. Comfortable text size, generous line spacing, and a clear reading goal reduce unnecessary effort. Reading a difficult section aloud can also expose its rhythm and make unfamiliar language easier to notice.

Understanding grows when readers work actively with ideas. Pause to predict what comes next, connect a new concept to something familiar, summarize a paragraph in your own words, or ask a question the text should answer.`;

const toolMetadata = {
  focus: { category: 'Reading tool', title: 'Focus & listen', description: 'Change how the page looks, keep your place, and listen sentence by sentence.' },
  bionic: { category: 'Reading tool', title: 'Word anchors', description: 'Emphasize the beginning of words with an adjustable amount of bold text.' },
  chunk: { category: 'Reading tool', title: 'Chunk reader', description: 'Break a long passage into smaller sections and move through them one at a time.' },
  pace: { category: 'Reading tool', title: 'Paced reader', description: 'Show one word at a time at a reading speed you control.' },
  clarity: { category: 'Writing tool', title: 'Clarity check', description: 'Review readability, long sentences, filler phrases, passive wording, and repetition.' },
  cleanup: { category: 'Writing tool', title: 'Text cleanup', description: 'Fix spacing, change letter case, or remove duplicate lines with a preview first.' },
  compare: { category: 'Writing tool', title: 'Compare drafts', description: 'See what was added or removed between two versions of a draft.' },
  study: { category: 'Study tool', title: 'Study pack', description: 'Extract important sentences, key terms, and active-recall questions.' },
  citation: { category: 'Source tool', title: 'Web citation', description: 'Format a common webpage citation in APA, MLA, or Chicago style.' }
};

const state = {
  tool: 'focus', saveTimer: null, toastTimer: null, sentenceIndex: 0, sentences: [], speaking: false,
  chunks: [], chunkIndex: 0, paceWords: [], paceIndex: 0, paceTimer: null, paceRunning: false,
  cleanupResult: '', studyPack: '', citation: ''
};

const sourceText = $('#sourceText');
const readerContent = $('#readerContent');
const readerPage = $('#readerPage');

function clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); }
function getWords(text) { return text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []; }
function getSentenceMatches(text) {
  return [...text.matchAll(/[^.!?\n]+(?:[.!?]+|(?=\n|$))/g)]
    .map(match => ({ text: match[0].trim(), start: match.index, end: match.index + match[0].length }))
    .filter(item => item.text);
}
function countSyllables(word) {
  let clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return clean.length ? 1 : 0;
  clean = clean.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/i, '').replace(/^y/, '');
  return Math.max(1, (clean.match(/[aeiouy]{1,2}/g) || []).length);
}
function calculateMetrics(text) {
  const words = getWords(text); const sentences = getSentenceMatches(text); const sentenceBase = Math.max(1, sentences.length);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const ease = words.length ? 206.835 - 1.015 * (words.length / sentenceBase) - 84.6 * (syllables / words.length) : 0;
  const grade = words.length ? 0.39 * (words.length / sentenceBase) + 11.8 * (syllables / words.length) - 15.59 : 0;
  return { words, sentences, wordCount: words.length, sentenceCount: text.trim() ? sentences.length : 0, ease, grade };
}

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  window.clearTimeout(state.toastTimer); state.toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2000);
}

async function copyText(text, message = 'Copied') {
  if (!text) return showToast('Nothing to copy');
  try { await navigator.clipboard.writeText(text); }
  catch {
    const helper = document.createElement('textarea'); helper.value = text; helper.style.position = 'fixed'; helper.style.opacity = '0';
    document.body.appendChild(helper); helper.select(); document.execCommand('copy'); helper.remove();
  }
  showToast(message);
}

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  $('#themeToggle').textContent = theme === 'dark' ? 'Light' : 'Dark';
}
const initialTheme = localStorage.getItem('readeasier-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(initialTheme);
$('#themeToggle').addEventListener('click', () => {
  const theme = document.body.classList.contains('dark') ? 'light' : 'dark'; applyTheme(theme); localStorage.setItem('readeasier-theme', theme);
});

function normalizedTool(value) {
  if (value === 'listen') return 'focus';
  return toolMetadata[value] ? value : 'focus';
}

function setTool(tool, updateUrl = true) {
  state.tool = normalizedTool(tool);
  stopSpeech(); stopPace();
  const meta = toolMetadata[state.tool];
  $('#toolCategory').textContent = meta.category; $('#toolTitle').textContent = meta.title; $('#toolDescription').textContent = meta.description;
  document.title = `${meta.title} — ReadEasier`;
  $$('[data-panel]').forEach(panel => { const active = panel.dataset.panel === state.tool; panel.hidden = !active; panel.classList.toggle('active', active); });
  $$('[data-tool]', $('#toolNav')).forEach(button => button.classList.toggle('active', button.dataset.tool === state.tool));
  $('#sourceCard').hidden = state.tool === 'citation';
  if (updateUrl) history.replaceState(null, '', `?tool=${state.tool}`);
  $('.tool-sidebar').classList.remove('open'); $('#sidebarToggle').setAttribute('aria-expanded', 'false');
  if (state.tool === 'focus') renderReader();
  if (state.tool === 'bionic') renderBionic();
  if (state.tool === 'clarity') updateClarity();
  if (state.tool === 'compare') $('#originalPreview').textContent = sourceText.value || 'Add the original draft above.';
}

$$('[data-tool]', $('#toolNav')).forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
$('#sidebarToggle').addEventListener('click', () => {
  const sidebar = $('.tool-sidebar'); const open = sidebar.classList.toggle('open'); $('#sidebarToggle').setAttribute('aria-expanded', String(open));
});

function scheduleSave() {
  const indicator = $('#saveStatus'); indicator.classList.add('saving'); indicator.lastChild.textContent = ' Saving…';
  clearTimeout(state.saveTimer); state.saveTimer = setTimeout(() => {
    try { localStorage.setItem('readeasier-draft', sourceText.value); }
    catch { indicator.lastChild.textContent = ' Save unavailable'; return; }
    indicator.classList.remove('saving'); indicator.lastChild.textContent = ' Saved locally';
  }, 400);
}

function updateSource() {
  const text = sourceText.value; const metrics = calculateMetrics(text);
  $('#wordCount').textContent = metrics.wordCount.toLocaleString(); $('#characterCount').textContent = text.length.toLocaleString();
  $('#sentenceCount').textContent = metrics.sentenceCount.toLocaleString(); $('#readTime').textContent = metrics.wordCount ? Math.max(1, Math.ceil(metrics.wordCount / 220)) : 0;
  $('#originalPreview').textContent = text || 'Add the original draft above.';
  renderReader(); renderBionic(); updateClarity(); updateGoal(metrics.wordCount); scheduleSave();
}
sourceText.addEventListener('input', updateSource);

$('#sampleButton').addEventListener('click', () => { sourceText.value = sampleText; updateSource(); showToast('Sample loaded'); });
$('#fileInput').addEventListener('change', event => {
  const file = event.target.files[0]; if (!file) return;
  if (file.size > 2_000_000) { showToast('Choose a text file under 2 MB'); event.target.value = ''; return; }
  const reader = new FileReader(); reader.onload = () => { sourceText.value = String(reader.result || ''); updateSource(); showToast(`${file.name} imported`); };
  reader.onerror = () => showToast('The file could not be read'); reader.readAsText(file); event.target.value = '';
});
$('#copySourceButton').addEventListener('click', () => copyText(sourceText.value, 'Text copied'));
$('#downloadButton').addEventListener('click', () => {
  if (!sourceText.value) return showToast('Nothing to export');
  const blob = new Blob([sourceText.value], { type: 'text/plain;charset=utf-8' }); const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = 'readeasier-text.txt'; link.click(); URL.revokeObjectURL(link.href); showToast('Text exported');
});
$('#clearButton').addEventListener('click', () => {
  if (!sourceText.value || confirm('Clear the saved text?')) { sourceText.value = ''; updateSource(); showToast('Text cleared'); }
});

function appendAnchoredText(parent, text, strength) {
  text.split(/(\s+)/).forEach(part => {
    if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(part)); return; }
    const match = part.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}’'\-]+)(.*)$/u);
    if (!match) { parent.appendChild(document.createTextNode(part)); return; }
    parent.appendChild(document.createTextNode(match[1])); const span = document.createElement('span'); span.className = 'word-anchor';
    const cut = Math.max(1, Math.ceil(match[2].length * strength)); const bold = document.createElement('b'); bold.textContent = match[2].slice(0, cut);
    span.append(bold, document.createTextNode(match[2].slice(cut))); parent.append(span, document.createTextNode(match[3]));
  });
}

function renderReader() {
  const sentences = getSentenceMatches(sourceText.value).map(item => item.text); state.sentences = sentences;
  state.sentenceIndex = clamp(state.sentenceIndex, 0, Math.max(0, sentences.length - 1)); readerContent.replaceChildren();
  if (!sentences.length) { const p = document.createElement('p'); p.className = 'empty-copy'; p.textContent = 'Add text above to start reading.'; readerContent.appendChild(p); $('#readerProgress')?.style.setProperty('width','0'); return; }
  const anchors = $('#focusAnchors').checked;
  sentences.forEach((sentence, index) => {
    const span = document.createElement('span'); span.className = `reader-sentence${index === state.sentenceIndex ? ' current' : ''}`; span.dataset.sentence = index;
    if (anchors) appendAnchoredText(span, sentence, .42); else span.textContent = sentence;
    readerContent.append(span, document.createTextNode(index === sentences.length - 1 ? '' : ' '));
  });
}

function updateSentence(scroll = true) {
  $$('.reader-sentence', readerContent).forEach((item, index) => item.classList.toggle('current', index === state.sentenceIndex));
  const current = $(`.reader-sentence[data-sentence="${state.sentenceIndex}"]`, readerContent);
  if (scroll && current) current.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
}

function populateVoices() {
  if (!('speechSynthesis' in window)) return; const select = $('#voiceSelect'); const chosen = select.value; select.replaceChildren();
  const fallback = document.createElement('option'); fallback.value = ''; fallback.textContent = 'Device default'; select.appendChild(fallback);
  speechSynthesis.getVoices().forEach(voice => { const option = document.createElement('option'); option.value = voice.voiceURI; option.textContent = `${voice.name} (${voice.lang})`; select.appendChild(option); });
  if ([...select.options].some(option => option.value === chosen)) select.value = chosen;
}
populateVoices(); if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', populateVoices);
function setSpeechLabel(label, symbol = '▶') { const button = $('#playSpeech'); button.replaceChildren(); const icon = document.createElement('span'); icon.textContent = symbol; button.append(icon, document.createTextNode(` ${label}`)); }
function selectedVoice() { return speechSynthesis.getVoices().find(voice => voice.voiceURI === $('#voiceSelect').value); }
function speakCurrent() {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return showToast('Read aloud is unavailable on this device');
  if (!state.sentences.length) return showToast('Add text first'); speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(state.sentences[state.sentenceIndex]); utterance.rate = Number($('#speechRate').value); const voice = selectedVoice(); if (voice) utterance.voice = voice;
  utterance.onstart = () => { state.speaking = true; setSpeechLabel('Pause', 'Ⅱ'); updateSentence(true); };
  utterance.onend = () => { if (!state.speaking) return; if (state.sentenceIndex < state.sentences.length - 1) { state.sentenceIndex += 1; speakCurrent(); } else { state.speaking = false; setSpeechLabel('Read again', '↺'); } };
  utterance.onerror = event => { if (!['canceled','interrupted'].includes(event.error)) showToast('Read aloud stopped'); state.speaking = false; setSpeechLabel('Read aloud'); };
  speechSynthesis.speak(utterance);
}
function stopSpeech() { state.speaking = false; if ('speechSynthesis' in window) speechSynthesis.cancel(); if ($('#playSpeech')) setSpeechLabel('Read aloud'); }
function toggleSpeech() { if (!state.speaking) return speakCurrent(); if (speechSynthesis.paused) { speechSynthesis.resume(); setSpeechLabel('Pause','Ⅱ'); } else { speechSynthesis.pause(); setSpeechLabel('Resume'); } }
function moveSentence(direction) { const wasSpeaking = state.speaking; stopSpeech(); state.sentenceIndex = clamp(state.sentenceIndex + direction, 0, Math.max(0,state.sentences.length - 1)); updateSentence(true); if (wasSpeaking) speakCurrent(); }
$('#playSpeech').addEventListener('click', toggleSpeech); $('#previousSentence').addEventListener('click', () => moveSentence(-1)); $('#nextSentence').addEventListener('click', () => moveSentence(1));

function bindRange(id, outputId, formatter, callback) { const range = $(id); const output = $(outputId); const update = () => { output.textContent = formatter(range.value); callback(range.value); }; range.addEventListener('input', update); update(); }
bindRange('#fontSize','#fontSizeOutput',value=>`${value}px`,value=>readerContent.style.fontSize=`${value}px`);
bindRange('#lineHeight','#lineHeightOutput',value=>(Number(value)/10).toFixed(1),value=>readerContent.style.lineHeight=String(Number(value)/10));
bindRange('#lineWidth','#lineWidthOutput',value=>`${value}px`,value=>readerContent.style.maxWidth=`${value}px`);
$$('[data-reader-theme]').forEach(button => button.addEventListener('click', () => { readerPage.dataset.readerTheme = button.dataset.readerTheme; $$('[data-reader-theme]').forEach(item => item.classList.toggle('active',item===button)); localStorage.setItem('readeasier-reader-theme',button.dataset.readerTheme); }));
$('#rulerToggle').addEventListener('change', event => readerPage.classList.toggle('ruler-active',event.target.checked)); readerPage.addEventListener('pointermove', event => readerPage.style.setProperty('--ruler-y',`${event.clientY}px`));
$('#focusAnchors').addEventListener('change', renderReader);

function renderBionic() {
  const output = $('#bionicOutput'); output.replaceChildren(); const text = sourceText.value; if (!text.trim()) { const p=document.createElement('p'); p.className='empty-copy'; p.textContent='Your formatted text will appear here.'; output.appendChild(p); return; }
  appendAnchoredText(output,text,Number($('#anchorStrength').value)/100);
}
bindRange('#anchorStrength','#anchorStrengthOutput',value=>`${value}%`,renderBionic);
$('#copyBionic').addEventListener('click', async () => {
  if (!sourceText.value) return showToast('Nothing to copy');
  try {
    if (window.ClipboardItem && navigator.clipboard.write) {
      const html = new Blob([$('#bionicOutput').innerHTML],{type:'text/html'}); const plain = new Blob([sourceText.value],{type:'text/plain'});
      await navigator.clipboard.write([new ClipboardItem({'text/html':html,'text/plain':plain})]); showToast('Formatted text copied'); return;
    }
  } catch {}
  copyText(sourceText.value,'Plain text copied');
});

function buildChunks() {
  const words = sourceText.value.trim().split(/\s+/).filter(Boolean); if (!words.length) return showToast('Add text first'); const size = Number($('#chunkSize').value);
  state.chunks=[]; for(let i=0;i<words.length;i+=size) state.chunks.push(words.slice(i,i+size).join(' ')); state.chunkIndex=0; displayChunk();
}
function displayChunk() { const total=state.chunks.length; $('#chunkText').textContent=total?state.chunks[state.chunkIndex]:'Build sections to read a smaller piece at a time.'; $('#chunkText').classList.toggle('empty-copy',!total); $('#chunkPosition').textContent=`Section ${total?state.chunkIndex+1:0} of ${total}`; $('#chunkProgress').style.width=`${total?((state.chunkIndex+1)/total)*100:0}%`; }
bindRange('#chunkSize','#chunkSizeOutput',value=>value,()=>{}); $('#buildChunks').addEventListener('click',buildChunks); $('#previousChunk').addEventListener('click',()=>{if(state.chunkIndex>0){state.chunkIndex--;displayChunk();}}); $('#nextChunk').addEventListener('click',()=>{if(state.chunkIndex<state.chunks.length-1){state.chunkIndex++;displayChunk();}});

function paceLabel() { $('#startPace').textContent = state.paceRunning ? 'Ⅱ Pause' : state.paceIndex ? '▶ Continue' : '▶ Start'; }
function displayPaceWord() { const total=state.paceWords.length; $('#paceWord').textContent=total?(state.paceWords[Math.min(state.paceIndex,total-1)]||'Done'):'Ready'; $('#pacePosition').textContent=`${Math.min(state.paceIndex+1,total)} / ${total}`; $('#paceProgress').style.width=`${total?(state.paceIndex/total)*100:0}%`; }
function schedulePace() { clearTimeout(state.paceTimer); if(!state.paceRunning)return; if(state.paceIndex>=state.paceWords.length){state.paceRunning=false;$('#paceWord').textContent='Done';$('#paceProgress').style.width='100%';paceLabel();return;} displayPaceWord(); const word=state.paceWords[state.paceIndex]; state.paceIndex++; const base=60000/Number($('#paceSpeed').value); const multiplier=/[.!?]$/.test(word)?2.2:/[,;:]$/.test(word)?1.45:1; state.paceTimer=setTimeout(schedulePace,base*multiplier); }
function togglePace(){if(!state.paceWords.length||state.paceIndex>=state.paceWords.length){state.paceWords=sourceText.value.trim().split(/\s+/).filter(Boolean);state.paceIndex=0;if(!state.paceWords.length)return showToast('Add text first');}state.paceRunning=!state.paceRunning;paceLabel();if(state.paceRunning)schedulePace();else clearTimeout(state.paceTimer);}
function stopPace(){clearTimeout(state.paceTimer);state.paceRunning=false;if($('#startPace'))paceLabel();} function resetPace(){stopPace();state.paceWords=[];state.paceIndex=0;displayPaceWord();}
bindRange('#paceSpeed','#paceSpeedOutput',value=>`${value} wpm`,()=>{if(state.paceRunning)schedulePace();}); $('#startPace').addEventListener('click',togglePace); $('#resetPace').addEventListener('click',resetPace);

function analyzeIssues(text,metrics){const issues=[];let long=0,filler=0,passive=0,repeated=0;const passivePattern=/\b(?:am|is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?\w+(?:ed|en)\b/i;const fillerPattern=/\b(?:really|very|quite|basically|actually|perhaps|maybe|somewhat|just|in order to|due to the fact that)\b/gi;
  metrics.sentences.forEach(sentence=>{const count=getWords(sentence.text).length;if(count>25){long++;issues.push({title:`${count}-word sentence`,detail:'Consider separating one idea.',excerpt:sentence.text,start:sentence.start,end:sentence.end});}if(passivePattern.test(sentence.text)){passive++;issues.push({title:'Possible passive phrasing',detail:'Naming who did the action may be clearer.',excerpt:sentence.text,start:sentence.start,end:sentence.end});}});
  for(const match of text.matchAll(fillerPattern)){filler++;if(filler<=4)issues.push({title:`Review “${match[0]}”`,detail:'Remove it once and check whether the meaning changes.',excerpt:text.slice(Math.max(0,match.index-30),Math.min(text.length,match.index+match[0].length+45)),start:match.index,end:match.index+match[0].length});}
  const freq=new Map();metrics.words.forEach(word=>{const clean=word.toLowerCase();if(clean.length>4&&!stopWords.has(clean))freq.set(clean,(freq.get(clean)||0)+1);});[...freq.entries()].filter(([,count])=>count>=4&&count/Math.max(1,metrics.wordCount)>.025).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([word,count])=>{repeated++;const start=text.toLowerCase().indexOf(word);issues.push({title:`“${word}” appears ${count} times`,detail:'Check whether every repetition is needed.',excerpt:word,start,end:start+word.length});});return{issues:issues.slice(0,14),counts:[long,filler,passive,repeated]};}
function clarityText(score){if(score>=85)return'Clear and easy to follow.';if(score>=70)return'Mostly clear. Review the flagged lines.';if(score>=55)return'Some sentences may need more space.';return'Try shorter sentences and familiar words.';}
function updateClarity(){const text=sourceText.value,metrics=calculateMetrics(text),analysis=analyzeIssues(text,metrics);const penalty=analysis.counts[0]*4+analysis.counts[1]+analysis.counts[2]*2+analysis.counts[3]*2;const score=metrics.wordCount?clamp(Math.round(58+(clamp(metrics.ease,0,100)-50)*.7-penalty),18,98):0;$('#clarityScore').textContent=metrics.wordCount?score:'—';$('#clarityLabel').textContent=metrics.wordCount?clarityText(score):'Add text to begin.';$('#gradeLevel').textContent=metrics.wordCount?`Grade ${Math.max(1,Math.round(metrics.grade))}`:'—';$$('#issueSummary span').forEach((span,index)=>span.querySelector('b').textContent=analysis.counts[index]);const list=$('#issueList');list.replaceChildren();if(!metrics.wordCount||!analysis.issues.length){const empty=document.createElement('div');empty.className='empty-state';empty.innerHTML=metrics.wordCount?'<span>✓</span><p>No obvious friction found.</p><small>Read it aloud once for rhythm and context.</small>':'<span>✓</span><p>Specific feedback will appear here.</p><small>These are patterns to review, not automatic corrections.</small>';list.appendChild(empty);return;}analysis.issues.forEach((issue,index)=>{const button=document.createElement('button');button.type='button';button.className='issue-item';button.dataset.start=issue.start;button.dataset.end=issue.end;const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');const body=document.createElement('div');const title=document.createElement('b');title.textContent=issue.title;const detail=document.createElement('p');detail.textContent=`${issue.detail} ${issue.excerpt}`;body.append(title,detail);const arrow=document.createElement('i');arrow.textContent='↗';button.append(number,body,arrow);list.appendChild(button);});}
$('#issueList').addEventListener('click',event=>{const item=event.target.closest('.issue-item');if(!item)return;sourceText.focus();sourceText.setSelectionRange(Number(item.dataset.start),Number(item.dataset.end));sourceText.scrollIntoView({behavior:'smooth',block:'center'});});
function updateGoal(wordCount=calculateMetrics(sourceText.value).wordCount){const goal=clamp(Number($('#wordGoal').value)||500,50,20000);$('#goalCount').textContent=wordCount.toLocaleString();$('#goalProgress').style.width=`${clamp((wordCount/goal)*100,0,100)}%`;}
$('#wordGoal').addEventListener('input',()=>{updateGoal();localStorage.setItem('readeasier-word-goal',$('#wordGoal').value);});

function sentenceCase(text){return text.replace(/(^|[.!?]\s+|\n+)([a-z])/g,(match,prefix,letter)=>prefix+letter.toUpperCase());}
function titleCase(text){const minor=new Set('a an and as at but by for in nor of on or per the to vs via'.split(' '));return text.toLowerCase().replace(/\b[\w’'-]+\b/g,(word,index)=>index===0||!minor.has(word)?word.charAt(0).toUpperCase()+word.slice(1):word);}
function cleanup(type,text){if(type==='spacing')return text.replace(/[\t ]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').replace(/ +([,.;!?])/g,'$1').trim();if(type==='sentence')return sentenceCase(text);if(type==='lower')return text.toLowerCase();if(type==='upper')return text.toUpperCase();if(type==='title')return titleCase(text);if(type==='duplicates'){const seen=new Set();return text.split('\n').filter(line=>{const key=line.trim();if(!key)return true;if(seen.has(key))return false;seen.add(key);return true;}).join('\n');}return text;}
$('#cleanupActions').addEventListener('click',event=>{const button=event.target.closest('[data-cleanup]');if(!button)return;if(!sourceText.value)return showToast('Add text first');$$('[data-cleanup]',$('#cleanupActions')).forEach(item=>item.classList.toggle('active',item===button));state.cleanupResult=cleanup(button.dataset.cleanup,sourceText.value);$('#cleanupOutput').textContent=state.cleanupResult;$('#applyCleanup').disabled=false;});
$('#applyCleanup').addEventListener('click',()=>{if(!state.cleanupResult)return;sourceText.value=state.cleanupResult;updateSource();showToast('Text replaced');});

function tokenDiff(original,revised){let a=original.trim().split(/\s+/).filter(Boolean),b=revised.trim().split(/\s+/).filter(Boolean);let sentenceMode=false;if(a.length*b.length>400000){a=getSentenceMatches(original).map(item=>item.text);b=getSentenceMatches(revised).map(item=>item.text);sentenceMode=true;}const rows=a.length+1,cols=b.length+1;const matrix=Array.from({length:rows},()=>new Uint16Array(cols));for(let i=1;i<rows;i++)for(let j=1;j<cols;j++)matrix[i][j]=a[i-1]===b[j-1]?matrix[i-1][j-1]+1:Math.max(matrix[i-1][j],matrix[i][j-1]);const parts=[];let i=a.length,j=b.length,added=0,removed=0;while(i>0||j>0){if(i>0&&j>0&&a[i-1]===b[j-1]){parts.push({type:'same',text:a[i-1]});i--;j--;}else if(j>0&&(i===0||matrix[i][j-1]>=matrix[i-1][j])){parts.push({type:'add',text:b[j-1]});added++;j--;}else{parts.push({type:'remove',text:a[i-1]});removed++;i--;}}return{parts:parts.reverse(),added,removed,sentenceMode};}
$('#compareButton').addEventListener('click',()=>{const original=sourceText.value,revised=$('#revisedText').value;if(!original.trim()||!revised.trim())return showToast('Add both drafts first');const diff=tokenDiff(original,revised);const output=$('#diffOutput');output.replaceChildren();diff.parts.forEach(part=>{const element=part.type==='add'?document.createElement('ins'):part.type==='remove'?document.createElement('del'):document.createElement('span');element.textContent=part.text;output.append(element,document.createTextNode(' '));});$('#compareStats').textContent=`${diff.added} added · ${diff.removed} removed${diff.sentenceMode?' · large drafts compared by sentence':''}`;localStorage.setItem('readeasier-revised',$('#revisedText').value);});

function getKeywords(text,limit=10){const freq=new Map();getWords(text).forEach(word=>{const clean=word.toLowerCase();if(clean.length<5||stopWords.has(clean)||/^\d+$/.test(clean))return;freq.set(clean,(freq.get(clean)||0)+1);});return[...freq.entries()].sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length).slice(0,limit).map(([word])=>word);}
function makeSummary(text,limit){const sentences=getSentenceMatches(text);if(sentences.length<=limit)return sentences.map(item=>item.text);const keywords=getKeywords(text,24),weights=new Map(keywords.map((word,index)=>[word,keywords.length-index]));return sentences.map((sentence,index)=>{const words=getWords(sentence.text).map(word=>word.toLowerCase());return{...sentence,index,score:words.reduce((sum,word)=>sum+(weights.get(word)||0),0)/Math.max(8,words.length)};}).sort((a,b)=>b.score-a.score).slice(0,limit).sort((a,b)=>a.index-b.index).map(item=>item.text);}
function buildStudy(){const text=sourceText.value.trim(),metrics=calculateMetrics(text);if(metrics.wordCount<35||metrics.sentenceCount<2)return showToast('Add at least a few sentences');const summary=makeSummary(text,Number($('#summaryLength').value)),keywords=getKeywords(text,10),questions=['What is the central idea? Explain it without looking back.',keywords[0]?`What does “${keywords[0]}” mean in this context?`:'Which term carries the most meaning?',keywords[1]?`How are “${keywords[0]}” and “${keywords[1]}” connected?`:'What evidence supports the main point?','What is one question the text leaves unanswered?'];const summaryOut=$('#summaryOutput');summaryOut.replaceChildren();const summaryP=document.createElement('p');summaryP.textContent=summary.join(' ');summaryOut.appendChild(summaryP);const keyOut=$('#keywordOutput');keyOut.replaceChildren();keywords.forEach(word=>{const chip=document.createElement('b');chip.textContent=word;keyOut.appendChild(chip);});const recall=$('#recallOutput');recall.replaceChildren();questions.forEach(question=>{const li=document.createElement('li');li.textContent=question;recall.appendChild(li);});state.studyPack=`READEASIER STUDY PACK\n\nSUMMARY\n${summary.join(' ')}\n\nKEY TERMS\n${keywords.join(', ')}\n\nACTIVE RECALL\n${questions.map((q,i)=>`${i+1}. ${q}`).join('\n')}\n\nNOTES\n${$('#studyNotes').value}`;$('#copyStudy').disabled=false;showToast('Study pack built');}
bindRange('#summaryLength','#summaryLengthOutput',value=>`${value} ${value==='1'?'sentence':'sentences'}`,()=>{});$('#buildStudy').addEventListener('click',buildStudy);$('#copyStudy').addEventListener('click',()=>copyText(state.studyPack,'Study pack copied'));$('#studyNotes').addEventListener('input',()=>localStorage.setItem('readeasier-notes',$('#studyNotes').value));

const monthsLong=['January','February','March','April','May','June','July','August','September','October','November','December'];const monthsShort=['Jan.','Feb.','Mar.','Apr.','May','June','July','Aug.','Sept.','Oct.','Nov.','Dec.'];
function parseDate(value){if(!value)return null;const [year,month,day]=value.split('-').map(Number);return{year,month:month-1,day};}function initials(name){return name?name.trim().split(/\s+/).map(part=>`${part[0].toUpperCase()}.`).join(' '):'';}
function formatCitation(){const style=$('#citationStyle').value,first=$('#authorFirst').value.trim(),last=$('#authorLast').value.trim(),title=$('#pageTitle').value.trim(),site=$('#siteTitle').value.trim(),published=parseDate($('#publishDate').value),accessed=parseDate($('#accessDate').value),url=$('#pageUrl').value.trim();if(!title)return'';let result='';
  if(style==='apa'){const author=last?`${last}, ${initials(first)}`:first||'';const date=published?`(${published.year}, ${monthsLong[published.month]} ${published.day}).`:'(n.d.).';result=[author,date,title+(title.endsWith('.')?'':'.'),site+(site&& !site.endsWith('.')?'.':''),url].filter(Boolean).join(' ');}
  if(style==='mla'){const author=last?`${last}, ${first}`:first;const date=published?`${published.day} ${monthsShort[published.month]} ${published.year}`:'';const access=accessed?`Accessed ${accessed.day} ${monthsShort[accessed.month]} ${accessed.year}.`:'';result=[author?`${author}.`:'',`“${title.replace(/[.]$/,'')}.”`,site?`${site},`:'',date?`${date},`:'',url?`${url.replace(/[.]$/,'')}.`:'',access].filter(Boolean).join(' ');}
  if(style==='chicago'){const author=last?`${last}, ${first}`:first;const date=published?`${monthsLong[published.month]} ${published.day}, ${published.year}.`:'';result=[author?`${author}.`:'',`“${title.replace(/[.]$/,'')}.”`,site?`${site}.`:'',date,url?`${url.replace(/[.]$/,'')}.`:''].filter(Boolean).join(' ');}return result.replace(/\s+/g,' ').trim();}
$('#citationForm').addEventListener('submit',event=>{event.preventDefault();state.citation=formatCitation();if(!state.citation)return showToast('Add the page title');$('#citationOutput').textContent=state.citation;$('#copyCitation').disabled=false;});$('#copyCitation').addEventListener('click',()=>copyText(state.citation,'Citation copied'));

function runCurrentTool(){if(state.tool==='focus')toggleSpeech();else if(state.tool==='bionic')renderBionic();else if(state.tool==='chunk')buildChunks();else if(state.tool==='pace')togglePace();else if(state.tool==='clarity')updateClarity();else if(state.tool==='compare')$('#compareButton').click();else if(state.tool==='study')buildStudy();else if(state.tool==='citation')$('#citationForm').requestSubmit();}
sourceText.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();runCurrentTool();}});

function restore(){try{sourceText.value=localStorage.getItem('readeasier-draft')||'';$('#revisedText').value=localStorage.getItem('readeasier-revised')||'';$('#studyNotes').value=localStorage.getItem('readeasier-notes')||'';$('#wordGoal').value=localStorage.getItem('readeasier-word-goal')||'500';const readerTheme=localStorage.getItem('readeasier-reader-theme')||'paper';readerPage.dataset.readerTheme=readerTheme;$$('[data-reader-theme]').forEach(button=>button.classList.toggle('active',button.dataset.readerTheme===readerTheme));}catch{}const today=new Date();$('#accessDate').value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;updateSource();const params=new URLSearchParams(location.search);setTool(normalizedTool(params.get('tool')),false);if(params.get('settings')==='1')setTimeout(()=>$('#fontSize').focus(),0);}
restore();
