const fontFile = document.getElementById('fontFile');
const previewText = document.querySelector('.preview-text');
const fontSize = document.getElementById('fontSize');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');
const resetText = document.getElementById('resetText');
const copyText = document.getElementById('copyText');
const currentFont = document.getElementById('currentFont');
const fontStats = document.getElementById('fontStats');
const fontList = document.getElementById('fontList');
const MAX_FONTS = 5;
let loadedFonts = [];

const defaultText = `what the font!?`;

let currentFontFamily = null;

fontFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        if (loadedFonts.length >= MAX_FONTS) {
            showNotification('Maximum fonts reached (5). Remove some first.', 'error');
            return;
        }

        try {
            const fontFamily = `font-${Date.now()}`;
            showNotification('Loading font...', 'loading');
            
            const font = new FontFace(fontFamily, await file.arrayBuffer());
            previewText.style.opacity = '0.5';
            
            await font.load();
            document.fonts.add(font);
            
            loadedFonts.push({
                name: file.name,
                family: fontFamily,
                size: file.size
            });
            
            updateFontList();
            switchFont(fontFamily);
            
            showNotification('Font loaded successfully!', 'success');
        } catch (error) {
            showNotification('Error loading font', 'error');
        }
    }
});

fontSize.addEventListener('input', (e) => {
    const size = e.target.value;
    previewText.style.fontSize = `${size}px`;
    fontSizeDisplay.textContent = `${size}px`;
});

resetText.addEventListener('click', () => {
    previewText.textContent = defaultText;
});

copyText.addEventListener('click', () => {
    navigator.clipboard.writeText(previewText.textContent)
        .then(() => showNotification('Text copied!', 'success'))
        .catch(() => showNotification('Failed to copy text', 'error'));
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = document.createElement('i');
    switch(type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            notification.style.background = '#28a745';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            notification.style.background = '#dc3545';
            break;
        case 'loading':
            icon.className = 'fas fa-spinner fa-spin';
            notification.style.background = '#17a2b8';
            break;
    }
    
    notification.appendChild(icon);
    notification.appendChild(document.createTextNode(message));
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateFontList() {
    fontList.innerHTML = '';
    loadedFonts.forEach(font => {
        const button = document.createElement('button');
        button.className = `font-button ${font.family === currentFontFamily ? 'active' : ''}`;
        
        button.innerHTML = `
            ${font.name}
            <span class="remove" title="Remove font">
                <i class="fas fa-times"></i>
            </span>
        `;
        
        button.addEventListener('click', (e) => {
            if (!e.target.closest('.remove')) {
                switchFont(font.family);
            }
        });
        
        button.querySelector('.remove').addEventListener('click', () => {
            removeFont(font.family);
        });
        
        fontList.appendChild(button);
    });
}

function switchFont(fontFamily) {
    previewText.style.fontFamily = fontFamily;
    currentFontFamily = fontFamily;
    
    const font = loadedFonts.find(f => f.family === fontFamily);
    if (font) {
        currentFont.textContent = `Current Font: ${font.name}`;
        fontStats.textContent = `Size: ${(font.size / 1024).toFixed(1)}KB`;
    }
    
    updateFontList();
}

function removeFont(fontFamily) {
    loadedFonts = loadedFonts.filter(f => f.family !== fontFamily);
    
    if (currentFontFamily === fontFamily) {
        const lastFont = loadedFonts[loadedFonts.length - 1];
        if (lastFont) {
            switchFont(lastFont.family);
        } else {
            previewText.style.fontFamily = '';
            currentFontFamily = null;
            currentFont.textContent = 'No font loaded';
            fontStats.textContent = '';
        }
    }
    
    updateFontList();
    showNotification('Font removed', 'success');
}