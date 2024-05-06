// Utility for local storage operations
const LocalStorageUtility = {
    saveData: (sprite_name, data) => {
        const loaddata = localStorage.getItem("sprites_config");
        loaddata[sprite_name] = data;
        localStorage.setItem("sprites_config", loaddata);
    },
    loadData: (sprite_name) => {
        const data = localStorage.getItem("sprites_config");
        return data[sprite_name];
    },
    clearData: () => {
        localStorage.clear();
    }
};

var CharacterDatas = ["alarm/chino_0","alarm/chiya_0","alarm/cocoa_0","alarm/rize_0","alarm/syaro_0",
"lessar/chino_0","lessar/chiya_0","lessar/cocoa_0","lessar/rize_0","lessar/syaro_0","lessar/maya_0","lessar/megu_0","lessar/fuyu_0",
"ekimemo/chino_usual","ekimemo/chino_smile","ekimemo/chino_angry","ekimemo/chino_dovey","ekimemo/chino_tired",
"ekimemo/chiya_usual","ekimemo/chiya_smile","ekimemo/chiya_angry","ekimemo/chiya_dovey","ekimemo/chiya_tired",
"ekimemo/cocoa_usual","ekimemo/cocoa_smile","ekimemo/cocoa_angry","ekimemo/cocoa_dovey","ekimemo/cocoa_tired",
"ekimemo/rize_usual","ekimemo/rize_smile","ekimemo/rize_angry","ekimemo/rize_dovey","ekimemo/rize_tired",
"ekimemo/syaro_usual","ekimemo/syaro_smile","ekimemo/syaro_angry","ekimemo/syaro_dovey","ekimemo/syaro_tired",
"ekimemo/maya_usual","ekimemo/maya_smile","ekimemo/maya_angry","ekimemo/maya_dovey","ekimemo/maya_tired",
"ekimemo/megu_usual","ekimemo/megu_smile","ekimemo/megu_angry","ekimemo/megu_dovey","ekimemo/megu_tired",
];

var main = document.getElementById('main');
var canvas = document.createElement('canvas');
var video = document.createElement('video');

class set_cAv {
    constructor() {
        this.canvas = canvas;
        this.video = video;
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
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.src = '';
        this.sprite_name = '';
    }
    set_chara_sprite(x, y, width, height, src, sprite_name) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.src = src;
        this.sprite_name = sprite_name;
    }
    load_chara_config(sprite_name) {
        var sprites_config = localStorage.getItem("sprites_config");
        //データの例　{"lessar/chino_0":{X:0,Y:0,ZoomRate:1},"alarm/rize_0":{X:0,Y:0,ZoomRate:1.2},"ekimemo/cocoa_smile":{X:0,Y:0,ZoomRate:1}}
        this.sprite_name = sprite_name;
        this.x = sprites_config[sprite_name].X;
        this.y = sprites_config[sprite_name].Y;
        this.width = sprites_config[sprite_name].Width;
        this.height = sprites_config[sprite_name].Height;
    }
}

var get_stand_src= function(sprite_name) {
    var src = sprite_name.split('/');
    if (src[src.length - 1] == 0) {
        src.pop();
        src.push('.png');
    } else {
        src.push('_' + src[src.length - 1] + '.png');
    }
    return "./core_sys/img/stand_sprites/"+src;
}

set_cAv = new set_cAv();
set_cAv.get_device_size();
set_cAv.set_canvas();
set_cAv.set_video();
