document.addEventListener('DOMContentLoaded', () => {
    startIntro();
});

async function startIntro() {
    try {
        const filesRes = await fetch('/api/i18n-files');
        const files = await filesRes.json();

        const userLang = navigator.language ? navigator.language.toLowerCase() : 'en-us';
        let targetFile = files.find(f => f.toLowerCase().includes(userLang));

        if (!targetFile) {
            const shortLang = userLang.split('-')[0];
            targetFile = files.find(f => f.toLowerCase().startsWith(shortLang));
        }

        if (!targetFile && files.length > 0) {
            targetFile = files[Math.floor(Math.random() * files.length)];
        }

        if (targetFile) {
            const contentRes = await fetch(`/api/i18n/${targetFile}`);
            const text = await contentRes.text();

            const introEl = document.getElementById('intro-text');
            await scrambleText(introEl, text);

            await new Promise(r => setTimeout(r, 2000));

            const container = document.getElementById('intro-container');
            container.style.opacity = '0';

            await new Promise(r => setTimeout(r, 500));
            container.style.display = 'none';

            startCodeLoop();
        } else {
            startCodeLoop();
        }
    } catch (e) {
        console.error(e);
        startCodeLoop();
    }
}

async function startCodeLoop() {
    const container = document.getElementById('code-container');
    container.classList.remove('hidden');
    container.style.opacity = '1';

    try {
        const filesRes = await fetch('/api/code-files');
        const files = await filesRes.json();

        if (files.length === 0) return;

        while (true) {
            const randomFile = files[Math.floor(Math.random() * files.length)];
            document.getElementById('file-name').textContent = `> DECRYPTING: ${randomFile}`;

            const contentRes = await fetch(`/api/code/${randomFile}`);
            const code = await contentRes.text();

            const codeEl = document.getElementById('code-content');
            codeEl.innerHTML = '';

            const lang = getLanguageFromExtension(randomFile);
            await renderCodeLines(codeEl, code, lang);

            await new Promise(r => setTimeout(r, 2000));
        }
    } catch (e) {
        console.error(e);
    }
}

function getLanguageFromExtension(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
        'js': 'javascript',
        'ts': 'typescript',
        'py': 'python',
        'rb': 'ruby',
        'rs': 'rust',
        'go': 'go',
        'c': 'c',
        'cpp': 'cpp',
        'h': 'c',
        'hpp': 'cpp',
        'java': 'java',
        'cs': 'csharp',
        'php': 'php',
        'sh': 'bash',
        'html': 'xml',
        'css': 'css',
        'json': 'json',
        'sql': 'sql',
        'asm': 'x86asm',
        'dart': 'dart',
        'f90': 'fortran',
        'hs': 'haskell',
        'jl': 'julia',
        'kt': 'kotlin',
        'kts': 'kotlin',
        'lua': 'lua',
        'm': 'objectivec',
        'matlab': 'matlab',
        'mk': 'makefile',
        'ml': 'ocaml',
        'pas': 'delphi',
        'pl': 'perl',
        'r': 'r',
        'scala': 'scala',
        'scm': 'scheme',
        'swift': 'swift',
        'vb': 'vbnet',
    };
    return map[ext] || 'plaintext';
}

function scrambleText(element, text) {
    return new Promise(resolve => {
        let getChar;
        if (/[\u3040-\u30ff]/.test(text)) {
            getChar = () => {
                const r = Math.random();
                if (r < 0.4) return String.fromCharCode(0x3040 + Math.floor(Math.random() * (0x309f - 0x3040)));
                if (r < 0.8) return String.fromCharCode(0x30a0 + Math.floor(Math.random() * (0x30ff - 0x30a0)));
                return String.fromCharCode(0x4e00 + Math.floor(Math.random() * (0x9fa5 - 0x4e00)));
            };
        } else if (/[\u4e00-\u9fa5]/.test(text)) {
            getChar = () => String.fromCharCode(0x4e00 + Math.floor(Math.random() * (0x9fa5 - 0x4e00)));
        } else {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
            getChar = () => chars[Math.floor(Math.random() * chars.length)];
        }

        const targetText = text.split('');
        let currentText = targetText.map(c => c === '\n' ? '\n' : getChar());

        element.textContent = currentText.join('');

        let index = 0;

        const interval = setInterval(() => {
            for (let i = index; i < targetText.length; i++) {
                if (targetText[i] !== '\n' && targetText[i] !== ' ') {
                    if (Math.random() > 0.5) {
                        currentText[i] = getChar();
                    }
                }
            }

            if (index < targetText.length) {
                currentText[index] = targetText[index];
                index++;
                while (index < targetText.length && (targetText[index] === ' ' || targetText[index] === '\n')) {
                    currentText[index] = targetText[index];
                    index++;
                }
            }

            element.textContent = currentText.join('');

            if (index >= targetText.length) {
                clearInterval(interval);
                resolve();
            }
        }, 30);
    });
}

function renderCodeLines(element, code, lang) {
    return new Promise(resolve => {
        const lines = code.split('\n');
        let lineIndex = 0;

        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        element.appendChild(cursor);

        function nextLine() {
            if (lineIndex < lines.length) {
                const line = lines[lineIndex];
                const lineEl = document.createElement('span');
                lineEl.className = 'code-line';

                try {
                    if (lang && hljs.getLanguage(lang)) {
                        lineEl.innerHTML = hljs.highlight(line, { language: lang }).value + '\n';
                    } else {
                        lineEl.innerHTML = hljs.highlightAuto(line).value + '\n';
                    }
                } catch (e) {
                    lineEl.textContent = line + '\n';
                }

                element.insertBefore(lineEl, cursor);

                window.scrollTo(0, document.body.scrollHeight);

                lineIndex++;
                setTimeout(() => requestAnimationFrame(nextLine), 20);
            } else {
                resolve();
            }
        }
        nextLine();
    });
}

