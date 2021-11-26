const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
      {
        name: "花岡拓也、鶴山尚史 - 王の愛は民のために",
        artist: '花岡拓也、鶴山尚史',
        url: '/mp3/花岡拓也、鶴山尚史 - 王の愛は民のために.mp3',
        cover: 'http://img.ytmp3.cn/image/52.jpg',
      },
      {
        name: '一百万个可能(Live)',
        artist: '摩登兄弟',
        url: 'http://www.ytmp3.cn/down/52772.mp3',
        cover: 'http://img.ytmp3.cn/image/53.jpg',
      },

    ]
});