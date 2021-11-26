<link rel="stylesheet" href="/dist/APlayer.min.css">
<div id="aplayer"></div>
<script type="text/javascript" src="/dist/APlayer.min.js"></script>
<script type="text/javascript" src="/dist/music.js"></script>
const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    audio: [
      {
        name: "花岡拓也、鶴山尚史 - 王の愛は民のために",
        artist: '花岡拓也、鶴山尚史',
        url: '/mp3/花岡拓也、鶴山尚史 - 王の愛は民のために.mp3',
        cover: 'https://z3.ax1x.com/2021/11/26/oV3kM8.jpg',
      },
        {
            name: 'HEATS',
            artist: 'V.A.',
            url: '/mp3/HEATS.mp3',
            cover: 'https://z3.ax1x.com/2021/11/26/oVt0bT.jpg',
        },
      {
        name: 'UNTRUE CRYSTAL',
        artist: '花岡拓也、鶴山尚史',
        url: '/mp3/UNTRUE CRYSTAL.mp3',
        cover: 'https://z3.ax1x.com/2021/11/26/oVt2x1.jpg',
      },
        {
            name: '天の金剛',
            artist: '花岡拓也、鶴山尚史',
            url: '/mp3/天の金剛.mp3',
            cover: 'https://s3.bmp.ovh/imgs/2021/11/c117848e5ac3403e.jpg',
        },

    ]
});