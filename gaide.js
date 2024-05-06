const driver = window.driver.js.driver;

const stepDescriptions = {
    ja: {
        set_summon: 'ここを押すとキャラクターを追加するページに飛びます。',
        chara: 'ここに追加できるすべてのキャラクターがいます<br\>移動の操作の限界から3枚まで選べるようにしています。',
        main: 'キャラを追加して戻ると、このような感じになります。<br/>画像を移動させることができます。',
        camera_toggle: 'このボタンを押すとカメラが変わります。(まだうまくいかないときのほうが多いです。)',
        set_setting: 'ここを押すとクレジットなどが見れます。<br/>ヘルプをもう一度見たい時もここから',
        shutter: '写真を撮りたいときはここを押してね',
        nextBtnText: '次へ',
        prevBtnText: '前へ'
    },
    en: {
        set_summon: 'Click here to go to the page where you can add characters.',
        chara: 'All available characters for adding are listed here. You can select up to 3 cards to move beyond the limit of operation.',
        main: 'After adding characters and returning, it will look like this. You can move the images around.',
        camera_toggle: 'Click this button to switch the camera. (It often doesn\'t work properly yet.)',
        set_setting: 'Click here to view credits and more. You can also access Help again from here.',
        shutter: 'Click here when you want to take a photo.',
        nextBtnText: 'NEXT',
        prevBtnText: 'Previous'
    }
};

const driverObj = driver({
    nextBtnText: stepDescriptions[userLanguage].nextBtnText,
    prevBtnText: stepDescriptions[userLanguage].prevBtnText,
    showProgress: true
});