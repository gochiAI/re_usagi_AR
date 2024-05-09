// Utility for local storage operations
class LocalStorageUtility {
    //一つのローカルストレージにすべてのデータを保存する
    //データはJSON形式で保存されるため、JSON.parse()で取り出す
    getStorage = function () {
        return JSON.parse(localStorage.getItem('sprites_config')) || {};
    }
    setStorage = function (data) {
        localStorage.setItem('sprites_config', JSON.stringify(data));
    }

    //データを保存する
    saveData(key, value) {
        let data = this.getStorage();
        //setdefaultのような動きをする
        data[key] = value;
        this.setStorage(data);
    }
    //データを取得する
    getData(key) {
        let data = this.getStorage();
        return data[key];
    }
    //データを削除する
    removeData(key) {
        let data = this.getStorage();
        delete data[key];
        this.setStorage(data);
    }

    getAllKeys() {
        let data = this.getStorage();
        return Object.keys(data);

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

    }
    get_device_size() {
        this.device_width = window.innerWidth;
        this.device_height = window.innerHeight;
    }
    set_canvas() {
        this.canvas.width = this.device_width;
        this.canvas.height = this.device_height;
        main.appendChild(this.canvas);
    }
    set_video() {
        this.video.width = this.device_width;
        this.video.height = this.device_height;
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

class chara_sprite {
    constructor(sprite_name) {
        this.sprite_name = sprite_name;
        this.src = new get_src().get_stand_src(sprite_name);
        console.log(this.src);
        this.x = CopilotLS.getData(sprite_name).X;
        this.y = CopilotLS.getData(sprite_name).Y;
        this.width = 300;
        this.height = 500;
        this.ZoomRate = CopilotLS.getData(sprite_name).ZoomRate;
    }
    set_sprite() {
        this.img = new Image();
        this.img.src = this.src;
        let self = this; // thisを保存
        this.img.onload = function () {
            set_cAv.ctx.drawImage(self.img, self.x, self.y, self.width * self.ZoomRate, self.height * self.ZoomRate);
        }
    }

}
class get_src {
    constructor() {
        this.sprite_name = "";
    }
    sprite_ID = function (sprite_name) {
        if (sprite_name.endsWith("_0")) {
            sprite_name = sprite_name.replace("_0", ".png");
        } else {
            // 二番目のスラッシュをアンダーバーに置換する
            sprite_name = sprite_name + '.png';
        }
        return sprite_name;
    };

    get_stand_src = function (sprite_name) {
        return `./core_sys/img/stand_sprites/${this.sprite_ID(sprite_name)}`;
    }
    get_thumb_src = function (sprite_name) {
        return `./core_sys/img/thumb_sprites/${this.sprite_ID(sprite_name)}`;
    }
}



var get_stand_size = function (sprite_name) {
    var src = new get_src().get_stand_src(sprite_name);
    var img = new Image();
    img.src = src;
    img.onload = function () {
        var width = img.width;
        var height = img.height;
        return [width, height];
    }
}
CopilotLS.getAllKeys().forEach(function (key) {
    var chara = new chara_sprite(key);
    chara.set_sprite();
})


document.getElementById('button_edit').addEventListener('click', function () {
    var editTab = document.getElementById('edit_tab');
    if (editTab.classList.contains('show')) {
        editTab.classList.remove('show');
    } else {
        editTab.classList.add('show');
    }
});
window.editSprite = function(button, sprite_name) {
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
function createButtonWithImage(imagePath, sprite_name) {
    return `
    <button onclick="editSprite(this,'${sprite_name}')">
        <img id="spriteImage" src="${imagePath}" alt="sprite" />
    </button>
`;
}

CopilotLS.getAllKeys().forEach(function (key) {
    var img = new Image();
    img.src = new get_src().get_thumb_src(key);
    img.onload = function () {
        var button = createButtonWithImage(img.src, key);
        document.getElementById('tab_sprite').innerHTML += button;
    }
}
);
set_cAv = new set_cAv();
set_cAv.get_device_size();
set_cAv.set_canvas();
set_cAv.set_video();
