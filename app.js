class CopilotLS {
    static getStorage({ target = 'sprites_config', key }) {
        const data = JSON.parse(localStorage.getItem(target)) || {};
        return key ? data[key] : data;
    }

    static setStorage({ target = 'sprites_config', key, value }) {
        const data = CopilotLS.getStorage({ target });
        data[key] = value;
        localStorage.setItem(target, JSON.stringify(data));
    }

    static removeStorage({ target = 'sprites_config', key }) {
        const data = CopilotLS.getStorage({ target });
        delete data[key];
        localStorage.setItem(target, JSON.stringify(data));
    }

    static getAllKeys(target = 'sprites_config') {
        return Object.keys(CopilotLS.getStorage({ target }));
    }
}

class system_data {
    CharacterDatas = ["alarm/chino_0", "alarm/chiya_0", "alarm/cocoa_0", "alarm/rize_0", "alarm/syaro_0",
        "lessar/chino_0", "lessar/chiya_0", "lessar/cocoa_0", "lessar/rize_0", "lessar/syaro_0", "lessar/maya_0", "lessar/megu_0", "lessar/fuyu_0",
        "ekimemo/chino_usual", "ekimemo/chino_smile", "ekimemo/chino_angry", "ekimemo/chino_dovey", "ekimemo/chino_tired",
        "ekimemo/chiya_usual", "ekimemo/chiya_smile", "ekimemo/chiya_angry", "ekimemo/chiya_dovey", "ekimemo/chiya_tired",
        "ekimemo/cocoa_usual", "ekimemo/cocoa_smile", "ekimemo/cocoa_angry", "ekimemo/cocoa_dovey", "ekimemo/cocoa_tired",
        "ekimemo/rize_usual", "ekimemo/rize_smile", "ekimemo/rize_angry", "ekimemo/rize_dovey", "ekimemo/rize_tired",
        "ekimemo/syaro_usual", "ekimemo/syaro_smile", "ekimemo/syaro_angry", "ekimemo/syaro_dovey", "ekimemo/syaro_tired",
        "ekimemo/maya_usual", "ekimemo/maya_smile", "ekimemo/maya_angry", "ekimemo/maya_dovey", "ekimemo/maya_tired",
        "ekimemo/megu_usual", "ekimemo/megu_smile", "ekimemo/megu_angry", "ekimemo/megu_dovey", "ekimemo/megu_tired",
    ];

    Events = ['全て', 'ekimemo', 'alarm', 'lessar'];

    Character = ['全て', 'chino', 'cocoa', 'rize', 'chiya', 'syaro', 'maya', 'megu', 'fuyu'];
}
class SetCanvasAndVideo {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.video = document.createElement('video');
        this.ctx = this.canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        this.setCanvas();
        this.setVideo();

    }

    getDeviceSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    setCanvas() {
        const { width, height } = this.getDeviceSize();
        this.canvas.width = width;
        this.canvas.height = height;
        document.getElementById('main').appendChild(this.canvas);
    }

    setVideo() {
        const { width, height } = this.getDeviceSize();
        this.video.width = width;
        this.video.height = height;
        this.video.autoplay = true;
        this.CONSTRAINTS = {
            audio: false,
            video: {
                width: { ideal: this.video.width },
                height: { ideal: this.video.height },
                aspectRatio: { ideal: 16 / 9 },
                facingMode: "user"
            }
        };
        document.getElementById('main').appendChild(this.video);
    }
}

class VideoStream extends SetCanvasAndVideo {
    constructor() {
        super();
        this.isFront = true;
        this.curStream = null;

        this.initCamera();
        this.syncCamera();
    }

    syncCamera() {
        this.CONSTRAINTS.video.facingMode = this.isFront ? "user" : { exact: "environment" };
        if (this.curStream) {
            this.curStream.getVideoTracks().forEach(track => track.stop());
        }
    }

    async initCamera() {
        try {
            this.curStream = await navigator.mediaDevices.getUserMedia(this.CONSTRAINTS);
            this.video.srcObject = this.curStream;
            this.video.onloadeddata = () => this.video.play();
        } catch (error) {
            console.error("Error accessing the camera: ", error);
        }
    }
}


class GetSrc extends CopilotLS {
    constructor() {
        super();
    }
    spriteID(spriteName) {
        return spriteName.endsWith("_0") ? spriteName.replace("_0", ".png") : spriteName + '.png';
    }

    getStandSrc(spriteName) {
        return `./core_sys/img/stand_sprites/${this.spriteID(spriteName)}`;
    }

    getThumbSrc(spriteName) {
        return `./core_sys/img/thumb_sprites/${this.spriteID(spriteName)}`;
    }

    getStandSize(spriteName) {
        return new Promise((resolve, reject) => {
            const src = this.getStandSrc(spriteName);
            const img = new Image();
            img.src = src;
            img.onload = () => resolve([img.width, img.height]);
            img.onerror = reject;
        });
    }
}

class CharaButton extends GetSrc {
    constructor(spriteName, onToggle) {
        super();
        this.spriteName = spriteName;
        this.onToggle = onToggle;
        this.card = this.createCard();
    }

    createCard() {
        const card = document.createElement('div');
        card.classList.add("chara_card");

        const img = new Image();
        img.width = 100;
        img.height = 100;
        img.src = this.getThumbSrc(this.spriteName);
        card.appendChild(img);

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add("button-container");

        const enlargeButton = document.createElement('button');
        enlargeButton.innerText = "拡大";
        enlargeButton.onclick = () => this.enlargeSprite();
        buttonContainer.appendChild(enlargeButton);

        const selectButton = document.createElement('button');
        selectButton.innerText = "選択";
        selectButton.onclick = () => this.toggleSpriteSelection(card);
        buttonContainer.appendChild(selectButton);

        card.appendChild(buttonContainer);

        return card;
    }

    enlargeSprite() {
        const fullImageSrc = this.getStandSrc(this.spriteName);

        const overlay = document.createElement('div');
        overlay.id = 'Img_Modal';
        const fullImage = new Image();
        fullImage.src = fullImageSrc;
        overlay.appendChild(fullImage);

        overlay.onclick = (event) => {
            if (event.target === overlay) {
                document.body.removeChild(overlay);
            }
        };

        document.body.appendChild(overlay);
    }

    toggleSpriteSelection() {
        const spriteNames = CopilotLS.getAllKeys('sprites_config');
        if (!spriteNames.includes(this.spriteName)) {
            CopilotLS.setStorage({ target: 'sprites_config', key: this.spriteName, value: { X: 0, Y: 0, ZoomRate: 0.6 } });
            this.card.style.borderColor = 'red';
        } else {
            CopilotLS.removeStorage({ target: 'sprites_config', key: this.spriteName });
            this.card.style.borderColor = '#ccc';
        }

        if (this.onToggle) {
            this.onToggle(this.spriteName);
        }
    }

    updateSelectionStyle() {
        const spriteNames = CopilotLS.getAllKeys('sprites_config');
        this.card.style.borderColor = spriteNames.includes(this.spriteName) ? 'red' : '#ccc';
    }

    getCard() {
        return this.card;
    }
}
class SpriteEditTabManager extends GetSrc {
    constructor() {
        super();
        this.buttonsContainer = document.getElementById('SpriteEditTab');
        this.initializeButtons();
    }

    initializeButtons() {
        this.clearButtons();
        const spriteNames = CopilotLS.getAllKeys('sprites_config');
        spriteNames.forEach(spriteName => {
            const spriteButton = this.createSpriteButton(spriteName);
            this.buttonsContainer.appendChild(spriteButton);
        });
        this.addNewSpriteButton();
    }

    clearButtons() {
        while (this.buttonsContainer.firstChild) {
            this.buttonsContainer.removeChild(this.buttonsContainer.firstChild);
        }
    }

    createSpriteButton(spriteName) {
        const button = document.createElement('button');
        button.classList.add("sprite_btn");

        const img = new Image();
        img.src = this.getThumbSrc(spriteName);
        img.width = 40;
        img.height = 40;
        button.appendChild(img);

        button.onclick = () => {
            const operableSprite = CopilotLS.getStorage({ target: 'operable_sprite', key: "operable_sprite" });
            if (operableSprite === spriteName) {
                CopilotLS.setStorage({ target: 'operable_sprite', key: "operable_sprite", value: '' });
                button.classList.remove('selected');
            } else {
                CopilotLS.setStorage({ target: 'operable_sprite', key: "operable_sprite", value: spriteName });
                this.updateSelectedButton(button);
            }
        };

        return button;
    }

    addNewSpriteButton() {
        const addSpriteButton = document.createElement('button');
        addSpriteButton.id = 'add_sprite_button';
        addSpriteButton.innerText = '追加';
        addSpriteButton.onclick = () => {
            const spriteAddWindow = new SpriteAddWindow();
            spriteAddWindow.show();
        };
        this.buttonsContainer.appendChild(addSpriteButton);
    }

    updateSelectedButton(selectedButton) {
        const buttons = this.buttonsContainer.querySelectorAll('.sprite_btn');
        buttons.forEach(button => {
            if (button === selectedButton) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }
}

class CharaSprite extends GetSrc {
    constructor(sprite_name) {
        super();
        const spriteData = CopilotLS.getStorage({ key: sprite_name }) || {};
        this.sprite_name = sprite_name;
        this.src = this.getStandSrc(this.sprite_name);
        this.x = spriteData.X || 0;
        this.y = spriteData.Y || 0;
        this.ZoomRate = spriteData.ZoomRate || 1;
        this.width = 0;
        this.height = 0;
        this.img = null;
    }

    async loadSprite() {
        return new Promise((resolve, reject) => {
            this.img = new Image();
            this.img.src = this.src;
            this.img.onload = () => {
                this.width = this.img.width;
                this.height = this.img.height;
                resolve();
            };
            this.img.onerror = reject;
        });
    }

    draw(ctx) {
        if (this.img) {
            ctx.drawImage(
                this.img,
                this.x,
                this.y,
                this.width * this.ZoomRate,
                this.height * this.ZoomRate
            );
        }
    }
}

class SpriteManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sprites = [];
        this.selectedSprite = null;
        this.isTouching = false;
        this.lastTouch = null;
        this.initialDistance = 0;
        this.initialZoom = 1;
        this.loadAllSprites().then(() => this.drawAllSprites());
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        this.canvas.addEventListener('mousedown', (event) => this.handleTouchStart(event), { passive: false });
        this.canvas.addEventListener('mousemove', (event) => this.handleTouchMove(event), { passive: false });
        this.canvas.addEventListener('mouseup', () => this.handleTouchEnd(), { passive: false });

        this.canvas.addEventListener('touchstart', (event) => this.handleTouchStart(event), { passive: false });
        this.canvas.addEventListener('touchmove', (event) => this.handleTouchMove(event), { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd(), { passive: false });
    }

    handleTouchStart(event) {
        event.preventDefault();
        const isEditTabOpen = document.getElementById('SpriteEditTab').style.display === 'flex';

        if (event.touches.length === 2 && isEditTabOpen) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            this.initialDistance = this.getDistance(touch1, touch2);
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            this.selectedSprite = this.getSpriteAtPosition(centerX, centerY);
            if (this.selectedSprite) {
                this.initialZoom = this.selectedSprite.ZoomRate;
            }
        } else {
            const touch = event.touches ? event.touches[0] : event;


            const tappedSprite = this.getSpriteAtPosition(touch.clientX, touch.clientY);
            const operableSprite = CopilotLS.getStorage({ target: 'operable_sprite', key: 'operable_sprite' });
            

            if (tappedSprite && (isEditTabOpen && tappedSprite.sprite_name === operableSprite)) {
                this.selectedSprite = tappedSprite;
                this.isTouching = true;
                this.lastTouch = touch;

            } else {
                this.selectedSprite = null;

            }
        }
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 2 && this.selectedSprite) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const currentDistance = this.getDistance(touch1, touch2);
            const scale = currentDistance / this.initialDistance;
            const newZoom = this.initialZoom * scale;

            // ズーム率の制限（例: 0.5倍から2倍まで）
            this.selectedSprite.ZoomRate = Math.max(0.5, Math.min(2, newZoom));

            const spriteConfig = CopilotLS.getStorage({ target: 'sprites_config', key: this.selectedSprite.sprite_name }) || {};
            spriteConfig.ZoomRate = this.selectedSprite.ZoomRate;
            CopilotLS.setStorage({ target: 'sprites_config', key: this.selectedSprite.sprite_name, value: spriteConfig });

            this.redrawSprites();
        } else {
            const touch = event.touches ? event.touches[0] : event;
            const deltaX = touch.clientX - this.lastTouch.clientX;
            const deltaY = touch.clientY - this.lastTouch.clientY;

            const spriteConfig = CopilotLS.getStorage({ target: 'sprites_config', key: this.selectedSprite.sprite_name }) || {};
            spriteConfig.X = (spriteConfig.X || 0) + deltaX;
            spriteConfig.Y = (spriteConfig.Y || 0) + deltaY;
            CopilotLS.setStorage({ target: 'sprites_config', key: this.selectedSprite.sprite_name, value: spriteConfig });

            this.selectedSprite.x = spriteConfig.X;
            this.selectedSprite.y = spriteConfig.Y;

            this.redrawSprites();

            this.lastTouch = touch;


        }
    }

    handleTouchEnd() {
        this.isTouching = false;
        this.selectedSprite = null;

    }

    getSpriteAtPosition(x, y) {
        return this.sprites.find(sprite => {
            return x >= sprite.x && x <= sprite.x + sprite.width * sprite.ZoomRate &&
                y >= sprite.y && y <= sprite.y + sprite.height * sprite.ZoomRate;
        }) || null;
    }

    redrawSprites() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.sprites.forEach(sprite => sprite.draw(this.ctx));
    }
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    async loadAllSprites() {
        const spriteNames = CopilotLS.getAllKeys('sprites_config');
        this.sprites = await Promise.all(spriteNames.map(async name => {
            const spriteConfig = CopilotLS.getStorage({ target: 'sprites_config', key: name }) || {};
            const sprite = new CharaSprite(name);
            sprite.x = spriteConfig.X || 0;
            sprite.y = spriteConfig.Y || 0;
            sprite.ZoomRate = spriteConfig.ZoomRate || 1;
            await sprite.loadSprite();
            return sprite;
        }));

    }

    drawAllSprites() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.sprites.forEach(sprite => sprite.draw(this.ctx));
    }
}


class SpriteAddWindow extends CopilotLS {
    constructor() {
        super();
        this.characterDatas = new system_data().CharacterDatas;
        this.events = new system_data().Events;
        this.characters = new system_data().Character;
        this.filteredData = this.characterDatas;
        this.createWindow();
        this.setupFilters();
        this.renderSprites();
    }

    createWindow() {
        this.window = document.getElementById('SpriteAddWindow');
        if (!this.window) {
            this.window = document.createElement('div');
            this.window.id = 'SpriteAddWindow';
            this.window.style.display = 'none';

            const closeButtonTop = this.createCloseButton();
            this.window.appendChild(closeButtonTop);

            this.filterContainer = document.createElement('div');
            this.filterContainer.classList.add('filter-container');
            this.window.appendChild(this.filterContainer);

            this.spriteContainer = document.createElement('div');
            this.spriteContainer.classList.add('sprite-container');
            this.window.appendChild(this.spriteContainer);

            const closeButtonBottom = this.createCloseButton();
            this.window.appendChild(closeButtonBottom);

            document.body.appendChild(this.window);
        } else {
            this.filterContainer = this.window.querySelector('.filter-container');
            this.spriteContainer = this.window.querySelector('.sprite-container');
        }
    }

    createCloseButton() {
        const closeButton = document.createElement('button');
        closeButton.classList.add('close_add_sprite');
        closeButton.innerText = '閉じる';
        closeButton.onclick = () => this.hide();
        return closeButton;
    }

    setupFilters() {
        this.filterContainer.innerHTML = '';

        const eventFilter = this.createFilterSelect(this.events);
        eventFilter.onchange = () => this.applyFilters();
        this.filterContainer.appendChild(eventFilter);

        const characterFilter = this.createFilterSelect(this.characters);
        characterFilter.onchange = () => this.applyFilters();
        this.filterContainer.appendChild(characterFilter);
    }

    createFilterSelect(options) {
        const select = document.createElement('select');
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.innerText = optionValue;
            select.appendChild(option);
        });
        return select;
    }

    applyFilters() {
        const eventFilter = this.filterContainer.children[0].value;
        const characterFilter = this.filterContainer.children[1].value;

        this.filteredData = this.characterDatas.filter(data => {
            const [event, character] = data.split('/');
            return (eventFilter === '全て' || event === eventFilter) &&
                (characterFilter === '全て' || character.includes(characterFilter));
        });

        this.renderSprites();
    }

    renderSprites() {
        this.spriteContainer.innerHTML = '';
        this.filteredData.forEach(spriteName => {
            const spriteCard = new CharaButton(spriteName, () => {
                initializeSprites(); // スプライトを再描画
                this.renderSprites(); // スプライトのリストを再描画
            });
            spriteCard.updateSelectionStyle(); // 選択状態を反映
            this.spriteContainer.appendChild(spriteCard.getCard());
        });
    }

    show() {
        this.filterContainer.children[0].value = '全て';
        this.filterContainer.children[1].value = '全て';
        this.applyFilters();
        this.window.style.display = 'block';
    }

    hide() {
        this.window.style.display = 'none';
        new SpriteEditTabManager();
        initializeSprites();
    }
}

const m_video = new VideoStream();
const spriteManager = new SpriteManager(document.getElementsByTagName('canvas')[0]);

async function initializeSprites() {
    spriteManager.sprites = CopilotLS.getAllKeys('sprites_config').map(name => new CharaSprite(name));
    await Promise.all(spriteManager.sprites.map(sprite => sprite.loadSprite()));
    spriteManager.drawAllSprites();
}
initializeSprites();



// DOM elements cache
const elements = {
    main: document.getElementById('main'),
    spriteAddWindow: document.getElementById('SpriteAddWindow'),
    spriteEditTab: document.getElementById('SpriteEditTab'),
    helpWindow: document.getElementById('HelpWindow'),
    buttonEdit: document.getElementById('button_edit'),
    buttonHelp: document.getElementById('button_help'),
    buttonFlip: document.getElementById('button_flip'),
    buttonCamera: document.getElementById('button_camera'),
    closeButtons: Array.from(document.getElementsByClassName('close_add_sprite'))
};
function setupEventListeners() {
    elements.closeButtons.forEach(button => {
        button.onclick = () => elements.spriteAddWindow.classList.remove('show');
    });
    elements.buttonEdit.onclick = toggleEditTab;
    elements.buttonHelp.onclick = toggleHelpWindow;
    elements.buttonFlip.onclick = toggleCamera;
    elements.buttonCamera.onclick = captureAndDisplayImage;
}

// Toggle functions
function toggleEditTab() {
    const isVisible = elements.spriteEditTab.style.display === 'flex';
    elements.spriteEditTab.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
        new SpriteEditTabManager();
    }
    CopilotLS.setStorage({ target: 'operable_sprite', key: "operable_sprite", value: isVisible ? '' : null });
}

function toggleHelpWindow() {
    const isVisible = elements.helpWindow.style.display === 'block';
    elements.helpWindow.style.display = isVisible ? 'none' : 'block';
}

function toggleCamera() {
    m_video.isFront = !m_video.isFront;
    m_video.syncCamera();
    m_video.initCamera();
}

// Capture and display image
function captureAndDisplayImage() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = s_cAv.canvas.width;
    tempCanvas.height = s_cAv.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(s_cAv.video, 0, 0, s_cAv.canvas.width, s_cAv.canvas.height);
    tempCtx.drawImage(s_cAv.canvas, 0, 0, s_cAv.canvas.width, s_cAv.canvas.height);
    const img = new Image();
    img.src = tempCanvas.toDataURL("image/png");
    CopilotLS.setStorage({ target: 'captured_image', key: 'captured_image', value: img.src });
    tempCanvas.remove();
    displayModalImage(img);
}

// Display modal image
function displayModalImage(img) {
    const imgModal = document.createElement('div');
    imgModal.id = "Img_Modal";
    imgModal.onclick = () => imgModal.remove();
    imgModal.appendChild(img);
    document.body.appendChild(imgModal);
}

// Initialize
initializeSprites();
setupEventListeners();