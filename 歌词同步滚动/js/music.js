// 音乐播放器模块
let mPlayerModule = (() => {

    // 获取 DOM 元素
    let root = document.querySelector("#root"),
        dom$cover = root.querySelectorAll(".cover img")[0],
        dom$songName = root.querySelectorAll(".song-name")[0],
        dom$songSinger = root.querySelectorAll(".song-singer")[0],
        dom$songAlbum = root.querySelectorAll(".song-album")[0],
        dom$lrcCurtain = root.querySelectorAll(".lrc-curtain")[0]
    dom$lrcCurtainUl = dom$lrcCurtain.querySelectorAll("ul")[0],
        dom$lrcCurtainLis = null,
        dom$btn = root.querySelectorAll(".btn")[0],
        dom$infoName = root.querySelectorAll(".name")[0],
        dom$infoTime = root.querySelectorAll(".time")[0],
        dom$mPbar = root.querySelectorAll(".play-bar .p-bar")[0],
        dom$mIbar = root.querySelectorAll(".play-bar .i-bar")[0],
        dom$mSlider = root.querySelectorAll(".play-bar .slider")[0],
        dom$mPlay = dom$btn.querySelectorAll(".play")[0],
        dom$download = root.querySelector("#download-link"),
        dom$volume = root.querySelectorAll('.volume')[0],
        dom$vIvolume = root.querySelectorAll('.i-volume')[0],
        dom$vPbar = root.querySelectorAll(".i-volume .p-bar")[0],
        dom$vIbar = root.querySelectorAll(".i-volume .i-bar")[0],
        dom$vSlider = root.querySelectorAll(".i-volume .slider")[0],
        dom$media = null,
        dom$lrcList = null,
        lrcList = null,
        index = 0,
        cur = null,
        target = null,
        _target = null,
        _data = null;

    // 生成视频标签
    let _createMediaNode = function _createMediaNode() {

        let vVideo = document.createElement('video');
        vVideo.setAttribute('name', 'media');
        vVideo.setAttribute('preload', 'auto');
        vVideo.setAttribute('controls', 'true');
        vVideo.style.display = 'none';
        let vSource = document.createElement('source');
        vSource.setAttribute('src', ''),
            vSource.setAttribute('id', 'source');
        vSource.setAttribute('type', 'audio/mp4');
        vVideo.appendChild(vSource);
        dom$media = root.appendChild(vVideo);
    };

    // 渲染
    let _render = function _render(data) {

        let { cover, songname, singername, albumname, m4a, lrc } = data;
        cur = data;
        // 渲染歌曲封面
        dom$cover.src = cover;
        // 渲染歌曲名称
        dom$songName.innerText = `歌曲名: ${songname}`;
        // 渲染歌手名称
        dom$songSinger.innerText = `歌手名: ${singername}`;
        // 渲染专辑名称
        dom$songAlbum.innerText = `专辑名: ${albumname}`;
        // 渲染歌词
        let lyric = 0;
        lrc = lrc.substring(/\[\d{2}:\d{2}\.\d{2}\]/.exec(lrc).index, lrc.length).split('\n');
        lrc = utilsModule._formatLrc(lrc);
        lrcList = lrc;
        dom$lrcCurtainLis = utilsModule._createLrcNode(lrc, dom$lrcCurtainUl);
        dom$lrcList = dom$lrcCurtainUl.querySelectorAll('li');

        lrcList = lrcList.map((item, index) => {


            let height = Number.parseFloat(window.getComputedStyle(dom$lrcList[index], null)['height']);
            let mb = Number.parseFloat(window.getComputedStyle(dom$lrcList[index], null)['margin-bottom']);

            item.offset = height + mb;
            return item;
        });



        // 渲染音频
        dom$media.setAttribute('src', data.m4a);
        dom$media.load();
        dom$media.pause();
        // 渲染控制条文字说明部分
        dom$infoName.innerText = `${songname} - ${singername}`;
        dom$media.addEventListener('durationchange', function () {
            dom$lrcCurtain.style.cssText = `
                transition: all 0.5s ease 0s;
            `;
            dom$infoTime.innerText = `${utilsModule._formatTime(dom$media.currentTime)} - ${utilsModule._formatTime(dom$media.duration)}`;
        }, false);
    };

    // 订阅数据
    let _subscribe = function _subscribe(data) {
        _data = data;
        // 初始渲染
        if (data && data.length !== 0) {
            _render(data[0]);
            _eventRegister();
        } else {
            // ...
        }

    };

    // 加载数据
    let _initData = async function _initData() {
        let res = await utilsModule._getJSON('../assets/data.json');
        if (res.status == 0) { // 成功获取数据
            _subscribe(res.songs);
            return;
        }

        // 获取数据失败
        alert('很抱歉数据获取失败, 请检查网络配置并确保当前项目运行在服务器上 ~');
    };


    // 事件中心
    let _eventRegister = function _eventRegister() {

        let cursor = 0;
        // 处理上/下一首和播放与暂停 
        dom$btn.addEventListener('click', function (ev) {
            ev = ev || window.event;
            let target = ev.target || window.srcElement;
            if (target.classList.contains('play')) {
                if (dom$media.paused) {
                    setTimeout(() => {

                        dom$media.play();
                    }, 1000);
                    target.innerHTML = '&#xe653;';
                } else {
                    setTimeout(() => {

                        dom$media.pause();
                    }, 0);
                    target.innerHTML = '&#xe625;';
                }
            }
            if (target.classList.contains('next')) {
                cursor++;
                if (cursor >= _data.length) {
                    cursor = 0;
                }
                dom$mPlay.innerHTML = '&#xe625;';
                index = 0;
                dom$mIbar.style.width = `0px`;
                dom$mSlider.style.left = `0px`;
                _render(_data[cursor]);
            }
            if (target.classList.contains('prev')) {
                cursor--;
                if (cursor < 0) {
                    cursor = _data.length - 1;
                }
                dom$mPlay.innerHTML = '&#xe625;';
                index = 0;
                dom$mIbar.style.width = `0px`;
                dom$mSlider.style.left = `0px`;
                _render(_data[cursor]);

            }
        }, false);

        // 处理歌词同步
        // let index = 0;
        let prevNode = null;
        dom$media.addEventListener('timeupdate', function () {

            // 歌词同步滚动
            let node = dom$lrcList[index];

            if (this.currentTime >= lrcList[index].t) {
                if (prevNode) {
                    prevNode.classList.remove('active');
                }

                node.classList.add('active');

                let val = 0;
                for (let i = 0; i < lrcList.length; i++) {
                    if (i < index) {
                        val += lrcList[i].offset;
                    }
                }

                dom$lrcCurtain.style.cssText = `
                    transform: translateY(-${ val}px);
                `;
                if (lrcList[index]) {
                    index++;
                    !lrcList[index] ? index-- : null;
                }
                prevNode = node;
            }
            dom$infoTime.innerText = `${utilsModule._formatTime(dom$media.currentTime)} - ${utilsModule._formatTime(dom$media.duration)}`;

            // 进度同步
            let progress = (dom$mPbar.offsetWidth * this.currentTime) / this.duration;
            dom$mIbar.style.width = `${progress}px`;
            dom$mSlider.style.left = `${progress}px`;
        }, false);

        dom$media.addEventListener('ended', function () {
            index = 0;
            dom$mPlay.innerHTML = '&#xe625;';
            dom$mIbar.style.width = `0px`;
            dom$mSlider.style.left = `0px`;
            dom$lrcCurtain.offsetLeft;
            dom$lrcCurtain.style.cssText = `
                transition-duration: 0s;
                transform: translateY(0px);
            `;
            dom$infoTime.innerText = `${utilsModule._formatTime(0)} - ${utilsModule._formatTime(dom$media.duration)}`;
        }, false);


        // 测试区域
        let min = utilsModule._getPos(dom$mPbar),
            max = min + dom$mPbar.offsetWidth,
            x = 0;
        dom$mIbar.style.width = `0px`;
        let move = function (ev, x) {
            x = ev.pageX;
            dom$mSlider.style.left = `${x - min}px`;
            if (x < min) {
                dom$mSlider.style.left = `${0}px`;
            }

            if (x > max) {
                dom$mSlider.style.left = `${dom$mPbar.offsetWidth - 10}px`;
            }
        };

        dom$mSlider.addEventListener('mousedown', function (ev) {
            ev.stopPropagation();
            x = ev.pageX;
            target = ev.target || ev.srcElement;
            dom$media.pause();
            window.addEventListener('mousemove', move, false);
            window.addEventListener('mouseup', function () {
                if (target.classList.contains('slider') && target.classList.contains('music')) {
                    window.removeEventListener('mousemove', move);
                    let t = (dom$mSlider.offsetLeft * dom$media.duration) / dom$mPbar.offsetWidth;
                    dom$media.currentTime = t;

                    // 更改 index
                    let values = [];
                    lrcList.forEach((item, index) => {
                        let val = Math.abs(dom$media.currentTime - lrcList[index].t);
                        values.push(val);

                    });
                    let _min = Math.min(...values);
                    let i = values.indexOf(_min);
                    index = i;
                    setTimeout(() => {

                        dom$media.play();
                    }, 0);
                }


            }, false);
        }, false);

        dom$mPbar.addEventListener('click', function (ev) {
            x = ev.pageX;
            dom$mSlider.style.left = `${x - min}px`;
            // 计算时间
            let t = ((x - min) * dom$media.duration) / dom$mPbar.offsetWidth;
            dom$media.currentTime = t;

            // 更改 index
            let values = [];
            lrcList.forEach((item, index) => {
                let val = Math.abs(dom$media.currentTime - lrcList[index].t);
                values.push(val);

            });
            let _min = Math.min(...values);
            let i = values.indexOf(_min);
            index = i;
        }, false);

        window.addEventListener('mousedown', function (ev) {
            target = _target = ev.target || ev.srcElement;

        }, false);

        dom$media.volume = 0.5;
        dom$vIbar.style.width = `${dom$vPbar.offsetWidth / 2}px`;
        dom$vSlider.style.left = `${dom$vPbar.offsetWidth / 2}px`;

        dom$volume.addEventListener('click', function () {

            if (dom$media.muted) { // 静音
                dom$media.muted = false; // 取消静音
                dom$volume.innerHTML = '&#xe662;';

            } else { // 有音量

                dom$media.muted = true; // 静音
                dom$volume.innerHTML = '&#xe65e;';
            }
        }, false);

        let offset = utilsModule._getPos(dom$vPbar);
        dom$vPbar.addEventListener('click', function (ev) {
            let x = ev.pageX;
            let val = x - offset;
            let volume = Math.abs(val) / this.offsetWidth;
            dom$media.volume = volume > 1 ? 1 : volume;
            dom$vIbar.style.width = `${val}px`;
            dom$vSlider.style.left = `${val}px`;

            if (dom$media.muted) {
                dom$volume.innerHTML = '&#xe65e;';
            } else {
                dom$volume.innerHTML = '&#xe662;';
            }

        }, false);

        function _move(ev) {
            let x = ev.pageX;
            let val = x - offset;
            if (val < 0) {
                val = 0;
            }
            if (val > dom$vPbar.offsetWidth) {
                val = dom$vPbar.offsetWidth;
            }
            let volume = Math.abs(val) / dom$vPbar.offsetWidth;
            dom$media.volume = volume > 1 ? 1 : volume;
            dom$vIbar.style.width = `${val}px`;
            dom$vSlider.style.left = `${val}px`;
        }

        dom$vSlider.addEventListener('mousedown', function (ev) {
            _target = ev.target || ev.srcElement;
            dom$vIvolume.addEventListener('mousemove', _move, false);
            window.addEventListener('mouseup', function (ev) {
                if (_target.classList.contains('s-volume')) {

                    if (dom$media.volume <= 0) {
                        dom$volume.innerHTML = '&#xe65e;';
                    } else {
                        dom$volume.innerHTML = '&#xe662;';
                    }
                    dom$vIvolume.removeEventListener('mousemove', _move);
                }

            }, false);
        }, false);

        dom$download.addEventListener('click', function () {
            alert(`很抱歉由于本页面未提供后端服务所以导致无法进行文件下载, 因为播放源指向的是其他域, 所以借助 a 标签的 download 以及 ajax 也无法实现, 所以如需下载则提供后台服务即可 !`);
        }, false);

    };

    return {
        // 调度中心
        init() {
            _createMediaNode();
            _initData();
        },
    };
})();

// 调度音乐播放器执行
mPlayerModule.init();