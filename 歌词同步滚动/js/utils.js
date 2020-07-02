let utilsModule = (() => {

    // 获取 json 数据
    let _getJSON = function _getJSON(url) {
        return new Promise((resolve, reject) => {

            let xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);

            xhr.addEventListener('readystatechange', function () {
                if (xhr.readyState === 4) {
                    if (/^[23]\d{2}$/.test(xhr.status)) {
                        resolve(JSON.parse(xhr.responseText));
                    }
                }
            }, false);

            xhr.addEventListener('error', function (err) {
                reject(err);
            }, false)

            xhr.send();
        });
    };

    function computedTime(time, tag) {

        return Math.floor(time / tag);
    }

    function computedMS(time) {
        let temp = 0,
            minute = 0,
            second = 0;
        temp = computedTime(time, 60);
        minute = temp;
        time = time - minute * 60;
        second = time;
        return [minute, second];
    }

    function complementZero(time) {
        time = `${time}`;
        return time.length < 2 ? `0${time}` : time;
    }

    // 格式化时间
    let _formatTime = function _formatTime(time) {
        let str = time.toString();
        if (str.includes('.')) {
            time = Math.trunc(time); // 忽略毫秒
        }
        // 格式化
        let hour = 0,
            minute = 0,
            second = 0,
            temp = computedTime(time, 3600);
        if (temp > 0) {
            hour = temp;
            time = time - hour * 3600;
            [minute, second] = computedMS(time);
        } else {
            [minute, second] = computedMS(time);
        }
        console.log(hour, minute, second);
        hour = complementZero(hour);
        minute = complementZero(minute);
        second = complementZero(second);
        return hour > 0 ? `${hour}:${minute}:${second}` : `${minute}:${second}`;
    };

    // 格式化歌词
    let _formatLrc = function _formatLrc(lrc) {
        let times = [];
        lrc = lrc.map(item => {
            let res = /\[(\d{2}:\d{2}\.\d{2})\]/.exec(item)[0];
            times.push(res);
            item = item.replace(res, '');
            // minute to second

            /\[(\d{2}):(\d{2}\.\d{2})/.exec(res);
            let tempMinute = Number.parseFloat(RegExp['$1']);
            let tempSecond = Number.parseFloat(RegExp['$2']);

            return {
                t: tempMinute * 60 + tempSecond,
                lrc: item,
            };
        });;
        return lrc;
    };

    // 生成填充歌词的 DOM 结构
    let _createLrcNode = function _createLrcNode(lrc, container) {
        let str = '';
        // dom$lrcCurtainUl
        
        lrc.forEach((item, index) => {
            console.log(item.lrc);
            
            let flag = item.lrc.length === 0 || /^\s+$/.test(item.lrc);
            str += `<li ${flag ? "style='color: transparent;'" : ""}>${!flag ? item.lrc : "~"}</li>`;
        });
        container.innerHTML = str;
        return document.querySelectorAll('.lrc-curtain ul li');
    };

    // 
    let _getPos = function _getPos(node) {

        let parent = node.offsetParent;
        let l = node.offsetLeft;
        while (parent !== null) {
            if (/MSIE 8/.test(navigator.userAgent)) {
                l += parent.clientLeft;
            }
            l += parent.clientLeft;
            l += parent.offsetLeft;
            parent = parent.offsetParent;
        }

        return l;
    };

    return {
        _getPos,
        _getJSON,
        _formatLrc,
        _formatTime,
        _createLrcNode,
    };
})();