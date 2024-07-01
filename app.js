class LocalStorageUtility {
    getStorage({ target = 'sprites_config', key }) {
        const data = JSON.parse(localStorage.getItem(target)) || {};
        return key ? data[key] : data;
    }

    setStorage({ target = 'sprites_config', key, value }) {
        const data = this.getStorage({ target });
        data[key] = value;
        localStorage.setItem(target, JSON.stringify(data));
    }

    removeStorage({ target = 'sprites_config', key }) {
        const data = this.getStorage({ target });
        delete data[key];
        localStorage.setItem(target, JSON.stringify(data));
    }

    getAllKeys(target = 'sprites_config') {
        return Object.keys(this.getStorage({ target }));
    }
}


var main = document.getElementById('main');
var canvas = document.createElement('canvas');
var video = document.createElement('video');
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
class VideoStream {
    constructor() {
        this.isFront = true;
        this.video = s_cAv.video;
        this.CONSTRAINTS = s_cAv.CONSTRAINTS || { video: {} };
        this.curStream = null;
        this.initCamera();
        this.syncCamera();
    }

    syncCamera() {
        this.CONSTRAINTS.video.facingMode = this.isFront ? "user" : { exact: "environment" };
        if (this.curStream !== null) {
            this.curStream.getVideoTracks().forEach(camera => camera.stop());
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

class CharaSprite {
    constructor(sprite_name) {
        const spriteData = CopilotLS.getStorage({ key: sprite_name }) || {};
        this.sprite_name = sprite_name;
        this.imgInfo = new GetSrc();
        this.src = this.imgInfo.getStandSrc(this.sprite_name);
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

class GetSrc {
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

class CharaButton {
    constructor(spriteName) {
        this.spriteName = spriteName;
        this.button = this.createButton();
        this.setImage();
    }

    createButton() {
        const button = document.createElement('button');
        button.classList.add("chara_btn");
        return button;
    }

    setImage() {
        const img = new Image();
        img.width = 100;
        img.height = 100;
        img.src = new GetSrc().getThumbSrc(this.spriteName);
        img.onclick = () => {
            if (CopilotLS.getStorage({ target: 'operable_sprite', "operable_sprite": this.spriteName }) === this.spriteName) {
                CopilotLS.removeStorage({ target: 'operable_sprite', "operable_sprite": this.spriteName });
            } else {
                CopilotLS.setStorage({ target: 'operable_sprite', key: "operable_sprite", value: this.spriteName });
            }
        };
        this.button.appendChild(img);
    }

    getButton() {
        return this.button;
    }
}

class SpriteEditTabManager {
    constructor() {
        this.buttonsContainer = document.getElementById('SpriteEditTab');
        this.clearButtons();
        this.initializeButtons();
    }

    clearButtons() {
        while (this.buttonsContainer.firstChild) {
            this.buttonsContainer.removeChild(this.buttonsContainer.firstChild);
        }
    }

    initializeButtons() {
        const spriteData = CopilotLS.getAllKeys();
        spriteData.forEach(spriteName => {
            const charaButton = new CharaButton(spriteName);
            this.buttonsContainer.appendChild(charaButton.getButton());
        });
        this.addNewSpriteButton();
    }

    addNewSpriteButton() {
        const addSpriteButton = document.createElement('button');
        addSpriteButton.id = 'add_sprite_button';
        addSpriteButton.onclick = () => {
            // SpriteAddWindowのインスタンス化と初期化
            const spriteAddWindow = new SpriteAddWindow();
            spriteAddWindow.show();
        };
        this.buttonsContainer.insertBefore(addSpriteButton, this.buttonsContainer.firstChild);
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
    }

    setupHammerEvents() {
        this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        this.hammer.get('pinch').set({ enable: true });

        this.hammer.on('tap', (event) => this.handleTap(event));
        this.hammer.on('pan', (event) => this.handlePan(event));
        this.hammer.on('pinch', (event) => this.handlePinch(event));
    }

    handleTap(event) {
        const tappedSprite = this.getSpriteAtPosition(event.center.x, event.center.y);
        if (tappedSprite) {
            const operableSprite = CopilotLS.getStorage({ target: 'operable_sprite', key: 'operable_sprite' });
            if (tappedSprite.spriteName === operableSprite) {
                this.selectedSprite = tappedSprite;
            } else {
                this.selectedSprite = null;
            }
        } else {
            this.selectedSprite = null;
        }
    }

    handlePan(event) {
        if (this.selectedSprite) {
            const spriteConfig = CopilotLS.getStorage({ key: this.selectedSprite.spriteName });
            spriteConfig.X += event.deltaX;
            spriteConfig.Y += event.deltaY;
            CopilotLS.setStorage({ key: this.selectedSprite.spriteName, value: spriteConfig });
            this.redrawSprites();
        }
    }

    handlePinch(event) {
        if (this.selectedSprite) {
            const spriteConfig = CopilotLS.getStorage({ key: this.selectedSprite.spriteName });
            spriteConfig.ZoomRate *= event.scale;
            CopilotLS.setStorage({ key: this.selectedSprite.spriteName, value: spriteConfig });
            this.redrawSprites();
        }
    }

    getSpriteAtPosition(x, y) {
        const sprites = CopilotLS.getAllKeys().map(spriteName => {
            const spriteConfig = CopilotLS.getStorage({ key: spriteName });
            return new CharaSprite(spriteName, spriteConfig);
        });

        return sprites.find(sprite => {
            const spriteConfig = CopilotLS.getStorage({ key: sprite.sprite_name });
            return x >= spriteConfig.X && x <= spriteConfig.X + sprite.width * spriteConfig.ZoomRate &&
                y >= spriteConfig.Y && y <= spriteConfig.Y + sprite.height * spriteConfig.ZoomRate;
        }) || null;
    }

    redrawSprites() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        CopilotLS.getAllKeys().forEach(spriteName => {
            const spriteConfig = CopilotLS.getStorage({ key: spriteName });
            const sprite = new CharaSprite(spriteName);
            sprite.x = spriteConfig.X;
            sprite.y = spriteConfig.Y;
            sprite.ZoomRate = spriteConfig.ZoomRate;
            sprite.set_sprite();
        });
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
const CopilotLS = new LocalStorageUtility();
const s_cAv = new SetCanvasAndVideo();
const m_video = new VideoStream();
const spriteManager = new SpriteManager(s_cAv.canvas);

async function initializeSprites() {
    await spriteManager.loadAllSprites();
    spriteManager.drawAllSprites();
}
initializeSprites();



// DOM elements cache
const elements = {
    spriteAddWindow: document.getElementById('SpriteAddWindow'),
    spriteEditTab: document.getElementById('SpriteEditTab'),
    helpWindow: document.getElementById('HelpWindow'),
    buttonEdit: document.getElementById('button_edit'),
    buttonHelp: document.getElementById('button_help'),
    buttonFlip: document.getElementById('button_flip'),
    buttonCamera: document.getElementById('button_camera')
};
function setupEventListeners() {
    Array.from(document.getElementsByClassName('close_add_sprite')).forEach(element => {
        element.onclick = () => elements.spriteAddWindow.classList.remove('show');
    });
    elements.buttonEdit.onclick = toggleEditTab;
    elements.buttonHelp.onclick = toggleHelpWindow;
    elements.buttonFlip.onclick = toggleCamera;
    elements.buttonCamera.onclick = captureAndDisplayImage;
}

function toggleEditTab() {
    const displayStyle = elements.spriteEditTab.style.display;
    elements.spriteEditTab.style.display = displayStyle === 'flex' ? 'none' : 'flex';
    if (displayStyle === 'flex') {
        CopilotLS.removeStorage({ target: 'operable_sprite' });
    } else {
        new SpriteEditTabManager();
    }
}

function toggleHelpWindow() {
    const displayStyle = elements.helpWindow.style.display;
    elements.helpWindow.style.display = displayStyle === 'block' ? 'none' : 'block';
}

function toggleCamera() {
    m_video.isFront = !m_video.isFront;
    m_video.syncCamera();
    m_video.initCamera();
}
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

function displayModalImage(img) {
    const imgModal = document.createElement('div');
    imgModal.id = "Img_Modal";
    imgModal.onclick = () => imgModal.remove();
    imgModal.appendChild(img);
    document.body.appendChild(imgModal);
}

setupEventListeners();