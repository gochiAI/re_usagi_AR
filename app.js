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
    constructor(spriteName) {
        super();
        this.spriteName = spriteName;
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
        selectButton.onclick = () => this.selectSprite(card);
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

    selectSprite(card) {
        const selectedSprites = CopilotLS.getStorage({ target: 'selected_sprites', key: "selected_sprites" }) || [];
        const spriteIndex = selectedSprites.indexOf(this.spriteName);
        if (spriteIndex > -1) {
            selectedSprites.splice(spriteIndex, 1);
            card.style.borderColor = '#ccc';
        } else {
            selectedSprites.push(this.spriteName);
            card.style.borderColor = 'red';
        }
        CopilotLS.setStorage({ target: 'selected_sprites', key: "selected_sprites", value: selectedSprites });
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
        const selectedSprites = CopilotLS.getStorage({ target: 'selected_sprites', key: "selected_sprites" }) || [];
        selectedSprites.forEach(spriteName => {
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
        this.hammer = new Hammer(canvas);
        this.setupHammerEvents();
        this.sprites = [];
        this.selectedSprite = null;
        this.loadAllSprites().then(() => this.drawAllSprites());

        // PCのクリックイベントを追加
        this.canvas.addEventListener('click', (event) => this.handleClick(event));
    }

    setupHammerEvents() {
        this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        this.hammer.get('pinch').set({ enable: true });

        this.hammer.on('tap', (event) => this.handleTap(event));
        this.hammer.on('pan', (event) => this.handlePan(event));
        // ピンチイベントはPCでは不要なので削除
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.handleTap({ center: { x, y } });
    }

    handleTap(event) {
        const tappedSprite = this.getSpriteAtPosition(event.center.x, event.center.y);
        const operableSprite = CopilotLS.getStorage({ target: 'operable_sprite', key: 'operable_sprite' });

        if (tappedSprite && tappedSprite.sprite_name === operableSprite) {
            this.selectedSprite = tappedSprite;
        } else {
            this.selectedSprite = null;
        }
    }

    handlePan(event) {
        if (this.selectedSprite) {
            const operableSprite = CopilotLS.getStorage({ target: 'operable_sprite', key: 'operable_sprite' });
            if (this.selectedSprite.sprite_name === operableSprite) {
                const spriteConfig = CopilotLS.getStorage({ key: this.selectedSprite.sprite_name });
                spriteConfig.X += event.deltaX;
                spriteConfig.Y += event.deltaY;
                CopilotLS.setStorage({ key: this.selectedSprite.sprite_name, value: spriteConfig });
                this.redrawSprites();
            }
        }
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

    async loadAllSprites() {
        const spriteNames = CopilotLS.getAllKeys();
        this.sprites = spriteNames.map(name => new CharaSprite(name));
        await Promise.all(this.sprites.map(sprite => sprite.loadSprite()));
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
        const selectedSprites = CopilotLS.getStorage({ target: 'selected_sprites', key: "selected_sprites" }) || [];
        this.filteredData.forEach(spriteName => {
            const spriteCard = new CharaButton(spriteName);
            if (selectedSprites.includes(spriteName)) {
                spriteCard.getCard().style.borderColor = 'red';
            }
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
const s_cAv = new SetCanvasAndVideo();
const m_video = new VideoStream();
const spriteManager = new SpriteManager(s_cAv.canvas);

async function initializeSprites() {
    const selectedSprites = CopilotLS.getStorage({ target: 'selected_sprites', key: "selected_sprites" }) || [];
    spriteManager.sprites = selectedSprites.map(name => new CharaSprite(name));
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