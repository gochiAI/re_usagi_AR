
var main = document.getElementById('main');
var canvas = document.createElement('canvas');
var video = document.createElement('video');
async function addBA(id,func){
    await document.getElementById(id).addEventListener('click',function(){
        func();
    });
}
addBA('button_setting',()=>{fetch_page('start.html');});
addBA('button_help',()=>{fetch_page('help.html');});
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

class chara_sprite{
    constructor(){
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.src = '';
        this.sprite_name = '';
    }
    set_chara_sprite(x,y,width,height,src,sprite_name){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.src = src;
        this.sprite_name = sprite_name;
    }
    load_chara_config(sprite_name){
        datum=localStorage.getItem("sprites_config");
        this.sprite_name = sprite_name;
        if(datum){
            datum=JSON.parse(datum);
            if(datum[this.sprite_name]){
                this.x = datum[this.sprite_name].x;
                this.y = datum[this.sprite_name].y;
                this.width = datum[this.sprite_name].width;
                this.height = datum[this.sprite_name].height;
                this.src = datum[this.sprite_name].src;
            }
        }
    }
}

function fetch_page(url){
    fetch(url)
    .then(response => response.text())
    .then(data => {
        main.innerHTML = data;
    });

}
set_cAv = new set_cAv();
set_cAv.get_device_size();
set_cAv.set_canvas();
set_cAv.set_video();
