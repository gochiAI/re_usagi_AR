/*ローカルストレージに対し様々な操作を行う*/
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
                facingMode: "user",
            },
        };

        main.appendChild(this.video);
    }
}
class video_stream {
    constructor() {
        this.is_front = true;
        this.video = new set_cAv().video;
        this.CONSTRAINTS = new set_cAv().CONSTRAINTS || { video: {} };
        this.curSTREAM = null;
        this.initCamera();
        this.syncCamera();
    }
    syncCamera() {
        this.CONSTRAINTS.video.facingMode = this.is_front
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

class set_ASW {
    constructor() {
        this.CharacterDatas = new system_data().CharacterDatas;
        this.Events = new system_data().Events;
        this.Character = new system_data().Character;
        this.Cards = document.getElementById('Sprites_List');
        this.eventFilter = document.getElementById('Event_filter');
        this.characterFilter = document.getElementById('Character_filter');
        this.optionCreates(this.eventFilter, this.Events);
        this.optionCreates(this.characterFilter, this.Character);
        this.filterList();
        this.displayCh(this.CharacterDatas);
    }
    optionCreates = (f, value) => {
        value.forEach((v) => {
            const option = document.createElement('option');
            option.value = v;
            option.text = v;
            f.appendChild(option);
        });
    }
    filterList = () => {
        const selectedEvent = this.eventFilter.value;
        const selectedCharacter = this.characterFilter.value;

        const filterList = this.CharacterDatas.filter(sprite_name => {
            if (selectedEvent === "全て" && selectedCharacter === "全て") return true;
            if (selectedEvent === "全て") return sprite_name.includes(selectedCharacter);
            if (selectedCharacter === "全て") return sprite_name.includes(selectedEvent);
            return sprite_name.includes(selectedEvent) && sprite_name.includes(selectedCharacter);
        });
        this.Cards.innerHTML = "";
        this.displayCh(filterList);
    }
    createButton = (iconSrc, onClick) => {
        const button = document.createElement('button');
        const icon = document.createElement('img');
        icon.src = iconSrc;
        button.appendChild(icon);
        button.onclick = onClick;
        return button;
    }
    displayCh = (CharacterDatas) => {
        CharacterDatas.forEach(sprite_name => {
            const newDiv = document.createElement('div');
            newDiv.classList.add("SpriteCard");

            const img = document.createElement('img');
            img.src = new get_src().get_thumb_src(sprite_name);

            newDiv.appendChild(img);

            const CardButtons = document.createElement('div');
            CardButtons.id = "CardButtons";

            const imgZoom_Button = this.createButton("./core_sys/img/ui/img_zoom.svg", function () {
                const Img_Modal = document.createElement('div');
                Img_Modal.id = "Img_Modal";
                Img_Modal.onclick = function () { Img_Modal.remove(); };
                const img = document.createElement('img');
                img.src = new get_src().get_stand_src(sprite_name);
                Img_Modal.appendChild(img);
                document.body.appendChild(Img_Modal);
            });

            const selectSprite_Button = this.createButton(CopilotLS.getStorage(sprite_name) ? "./core_sys/img/ui/user_remove.svg" : "./core_sys/img/ui/user_add.svg", function () {
                const selectSprite_icon = this.firstChild; // Add this line
                if (newDiv.classList.contains('selected')) {
                    selectSprite_icon.src = "./core_sys/img/ui/user_add.svg";
                    CopilotLS.removeData(sprite_name);
                    newDiv.classList.remove('selected');
                } else {
                    selectSprite_icon.src = "./core_sys/img/ui/user_remove.svg";
                    CopilotLS.setStorage(sprite_name, { "X": 0, "Y": 0, "ZoomRate": 1.0 });
                    newDiv.classList.add('selected');
                }
            });

            if (CopilotLS.getStorage(sprite_name)) newDiv.classList.add('selected');

            CardButtons.appendChild(imgZoom_Button);
            CardButtons.appendChild(selectSprite_Button);
            newDiv.appendChild(CardButtons);
            this.Cards.appendChild(newDiv);
        });

    }
}
/*tab_spriteに対しての処理
1.localstorageからデータを取得
2.データを元に必要なボタンを作成
3.ボタンをクリックした時の処理を記述
*/
var p=document.getElementById('tab_sprite');
CopilotLS.getAllKeys().forEach(sprite_name => {
    const newDiv = document.createElement('button');
    const img = document.createElement('img');
    img.src = new get_src().get_thumb_src(sprite_name);
    newDiv.appendChild(img);
    newDiv.onclick = function () {
        
    };
    p.appendChild(newDiv);
    });
//各ボタンに対応する処理を追加
// クリックイベントのハンドラを設定する関数
function setClickHandler(id, callback) {
    document.getElementById(id).onclick = callback;
}

// クラスを追加/削除する関数
function toggleClass(id, className) {
    const element = document.getElementById(id);
    element.classList.contains(className) ? element.classList.remove(className) : element.classList.add(className);
}

// クリックイベントのハンドラを設定
setClickHandler('button_help_close', () => document.getElementById('help').classList.remove('show'));
setClickHandler('button_help', () => document.getElementById('help').classList.add('show'));
setClickHandler('button_edit', () => toggleClass('edit_tab', 'show'));
setClickHandler('button_add', () => {
    document.getElementById('add_sprite').classList.add('show');
    const AddSpriteWindow = new set_ASW();
    AddSpriteWindow.eventFilter.onchange = AddSpriteWindow.filterList;
    AddSpriteWindow.characterFilter.onchange = AddSpriteWindow.filterList;
    AddSpriteWindow.displayCh(AddSpriteWindow.CharacterDatas);
});

// 'close_add_sprite'クラスを持つすべての要素に対してハンドラを設定
Array.from(document.getElementsByClassName('close_add_sprite')).forEach(element => {
    element.onclick = () => document.getElementById('add_sprite').classList.remove('show');
});
let s_cAv = new set_cAv();
let m_video = new video_stream();
document.getElementById('button_flip').onclick = function () {
    m_video.is_front = !m_video.is_front;
    m_video.syncCamera();
    m_video.initCamera();
}
document.getElementById('button_camera').onclick = function () {
    //canvasとvideoをそれぞれ一時的なcanvasに描画
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = s_cAv.canvas.width;
    tempCanvas.height = s_cAv.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(s_cAv.video, 0, 0, s_cAv.canvas.width, s_cAv.canvas.height);
    tempCtx.drawImage(s_cAv.canvas, 0, 0, s_cAv.canvas.width, s_cAv.canvas.height);
    //一時的なcanvasを画像に変換
    const img = new Image();
    img.src = tempCanvas.toDataURL("image/png");
    //一時的なcanvasを削除
    tempCanvas.remove();
    //画像をモーダルで表示
    const Img_Modal = document.createElement('div');
    Img_Modal.id = "Img_Modal";
    Img_Modal.onclick = function () { Img_Modal.remove(); };
    Img_Modal.appendChild(img);
    document.body.appendChild(Img_Modal);
}