class LocalStorageUtility {
    getStorage(key = null) {
        const data = JSON.parse(localStorage.getItem('sprites_config')) || {};
        return key ? data[key] : data;
    }

    setStorage(key, value) {
        const data = this.getStorage();
        data[key] = value;
        localStorage.setItem('sprites_config', JSON.stringify(data));
    }

    removeData(key) {
        const data = this.getStorage();
        delete data[key];
        this.setStorage(key, null);
    }

    getAllKeys() {
        return Object.keys(this.getStorage());
    }
}

var CopilotLS = new LocalStorageUtility();

var CharacterDatas = ["alarm/chino_0", "alarm/chiya_0", "alarm/cocoa_0", "alarm/rize_0", "alarm/syaro_0",
    "lessar/chino_0", "lessar/chiya_0", "lessar/cocoa_0", "lessar/rize_0", "lessar/syaro_0", "lessar/maya_0", "lessar/megu_0", "lessar/fuyu_0",
    "ekimemo/chino_usual", "ekimemo/chino_smile", "ekimemo/chino_angry", "ekimemo/chino_dovey", "ekimemo/chino_tired",
    "ekimemo/chiya_usual", "ekimemo/chiya_smile", "ekimemo/chiya_angry", "ekimemo/chiya_dovey", "ekimemo/chiya_tired",
    "ekimemo/cocoa_usual", "ekimemo/cocoa_smile", "ekimemo/cocoa_angry", "ekimemo/cocoa_dovey", "ekimemo/cocoa_tired",
    "ekimemo/rize_usual", "ekimemo/rize_smile", "ekimemo/rize_angry", "ekimemo/rize_dovey", "ekimemo/rize_tired",
    "ekimemo/syaro_usual", "ekimemo/syaro_smile", "ekimemo/syaro_angry", "ekimemo/syaro_dovey", "ekimemo/syaro_tired",
    "ekimemo/maya_usual", "ekimemo/maya_smile", "ekimemo/maya_angry", "ekimemo/maya_dovey", "ekimemo/maya_tired",
    "ekimemo/megu_usual", "ekimemo/megu_smile", "ekimemo/megu_angry", "ekimemo/megu_dovey", "ekimemo/megu_tired",
];

var main = document.getElementById('main');
var canvas = document.createElement('canvas');
var video = document.createElement('video');

class set_cAv {
    constructor() {
        this.canvas = canvas;
        this.video = video;
        this.ctx = this.canvas.getContext('2d');
        this.set_canvas();
        this.set_video();
    }
    get_device_size() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    set_canvas() {
        const { width, height } = this.get_device_size();
        this.canvas.width = width;
        this.canvas.height = height;
        main.appendChild(this.canvas);
    }
    set_video() {
        const { width, height } = this.get_device_size();
        this.video.width = width;
        this.video.height = height;
        this.video.autoplay = true;
        this.CONSTRAINTS = {
            audio: false,
            video: {
                width: { ideal: this.video.width },
                height: { ideal: this.video.height },
                aspectRatio: { ideal: 16 / 9 },
                facingMode: null,
            },
        };

        main.appendChild(this.video);
    }
}
class video_stream {
    constructor(video, CONSTRAINTS) {
        this.video = video;
        this.CONSTRAINTS = CONSTRAINTS;
        this.curSTREAM = null;
        this.initCamera();
        this.syncCamera();
    }
    syncCamera(is_front = false) {
        this.CONSTRAINTS.video.facingMode = is_front
            ? "user"
            : { exact: "environment" };

        if (this.curSTREAM !== null) {
            this.curSTREAM.getVideoTracks().forEach((camera) => {
                camera.stop();
            });
        }
    }
    //カメラの初期設定
    async initCamera() {
        try {
            this.curSTREAM = await navigator.mediaDevices.getUserMedia(this.CONSTRAINTS);
            this.video.srcObject = this.curSTREAM;

            this.video.onloadeddata = (e) => {
                this.video.play();
            };
        } catch (error) {
            console.error("Error accessing the camera: ", error);
        }
    }
}

class chara_sprite {
    constructor(sprite_name) {
        const spriteData = CopilotLS.getStorage(sprite_name) || {};
        this.sprite_name = sprite_name;
        this.src = new get_src().get_stand_src(sprite_name);
        this.x = spriteData.X;
        this.y = spriteData.Y;
        this.width = 300;
        this.height = 500;
        this.ZoomRate = spriteData.ZoomRate;
    }
    set_sprite() {
        this.img = new Image();
        this.img.src = this.src;
        this.img.onload = () => {
            set_cAv.ctx.drawImage(this.img, this.x, this.y, this.width * this.ZoomRate, this.height * this.ZoomRate);
        }
    }
}
class get_src {
    sprite_ID(sprite_name) {
        if (sprite_name.endsWith("_0")) {
            sprite_name = sprite_name.replace("_0", ".png");
        } else {
            sprite_name = sprite_name + '.png';
        }
        return sprite_name;
    }

    get_stand_src(sprite_name) {
        return `./core_sys/img/stand_sprites/${this.sprite_ID(sprite_name)}`;
    }

    get_thumb_src(sprite_name) {
        return `./core_sys/img/thumb_sprites/${this.sprite_ID(sprite_name)}`;
    }

    get_stand_size(sprite_name) {
        return new Promise((resolve, reject) => {
            var src = this.get_stand_src(sprite_name);
            var img = new Image();
            img.src = src;
            img.onload = function () {
                var width = img.width;
                var height = img.height;
                resolve([width, height]);
            }
            img.onerror = reject;
        });
    }
}

// 名前空間を作成
var App = {};

App.editSprite = function (button, sprite_name) {
    if (button.classList.contains("selected")) {
        button.classList.remove("selected");
        console.log("Unselected Sprite:", sprite_name);
    } else {
        document.querySelectorAll("#tab_sprite button").forEach((btn) => {
            btn.classList.remove("selected");
        });
        button.classList.add("selected");
        console.log("Selected Sprite:", sprite_name);
    }
}

App.createButtonWithImage = function (imagePath, sprite_name) {
    return `
    <button onclick="App.editSprite(this,'${sprite_name}')">
        <img id="spriteImage" src="${imagePath}" alt="sprite" />
    </button>
`;
}

CopilotLS.getAllKeys().forEach((sprite_name) => {
    const thumbSrc = new get_src().get_thumb_src(sprite_name);
    const button = App.createButtonWithImage(thumbSrc, sprite_name);
    document.getElementById("tab_sprite").innerHTML += button;
});




var standby = new set_cAv();
var videoStream = new video_stream(standby.video, standby.CONSTRAINTS);