var main = document.getElementById('main');
var canvas = document.createElement('canvas');
var video = document.createElement('video');

class set_header {
    constructor() {
        this.header = document.createElement('header');
        main.insertAdjacentElement('beforebegin', this.header);
    }
    set_header() {
        //footerには二種類のボタンとサービスロゴを追加する。css内でflexしているので、横に並ぶ。
        //手前から設定ボタン,サービスロゴ,ヘルプボタン
        var service_logo = document.createElement('img');
        service_logo.src = './usagi_AR.svg';
        

        this.header.appendChild(new make_button('material-symbols:settings', () => this.open_setting()).make_button());
        this.header.appendChild(service_logo);
        this.header.appendChild(new make_button('material-symbols:help', () => { }).make_button());
    }
    open_setting() {
        //create setting
        var setting = document.createElement('div');
        setting.id = 'setting';
        setting.style.width = window.innerWidth  + 'px';
        setting.style.height = window.innerHeight + 'px';
        //create setting content
        var setting_content = document.createElement('div');
        setting_content.id = 'setting_content';
        setting.appendChild(setting_content);
        setting.appendChild(new make_button('material-symbols:close', () => setting.remove()).make_button());
        main.appendChild(setting);

    }
}
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
class set_footer {
    constructor() {
        this.footer = document.createElement('footer');
        main.insertAdjacentElement('afterend', this.footer);
    }
    set_footer() {
        //footerには三種類のボタンを追加する。css内でflexしているので、横に並ぶ。
        //手前から画像操作ボタン,撮影ボタン,カメラ切り替えボタン
        this.footer.appendChild(new make_button('material-symbols:person-edit-rounded', () => { }).make_button());
        this.footer.appendChild(new make_button('material-symbols:camera',  () => this.take_photo()).make_button());
        this.footer.appendChild(new make_button('material-symbols:flip-camera-android', () =>  this.switch_camera()).make_button());
    }
    switch_camera() {
        if (cAv.CONSTRAINTS.video.facingMode == 'user') {
            cAv.CONSTRAINTS.video.facingMode = 'environment';
        } else {
            cAv.CONSTRAINTS.video.facingMode = 'user';
        }   
}
take_photo() {
    var ctx = cAv.canvas.getContext('2d');
    ctx.drawImage(cAv.video, 0, 0, cAv.device_width, cAv.device_height);
    var img = cAv.canvas.toDataURL('image/png');

}
}

class make_button {
    constructor(src, func) {
        this.button = document.createElement('button');
        this.button.type = 'button';
        //srcにはiconifyのアイコンのnameを入れる
        let icon = document.createElement('iconify-icon');
        icon.setAttribute('icon', src);
        this.button.appendChild(icon);
        this.button.src = src;
        this.button.addEventListener('click', func);
    }
    make_button() {
        return this.button;
    }

}
var cAv = new set_cAv();
cAv.get_device_size();
cAv.set_canvas();
cAv.set_video();

var header = new set_header();
header.set_header();
var footer = new set_footer();
footer.set_footer();

window.addEventListener('resize', () => {
    cAv.get_device_size();
    cAv.set_canvas();
    cAv.set_video();
});
