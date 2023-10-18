import * as Alert from './Alert.js';
const isDev = false;

const mainDiv = document.getElementsByClassName('root')[0];

function addRangeInput(name, value, min, max, onChange) {
    setting.appendChild((() => {
        let span = document.createElement('span');
        span.innerText = name + ': ';
        span.classList.add('colorLabel');

        return span
    })())
    setting.appendChild((() => {
        let input = document.createElement('input');
        input.setAttribute('type', 'range')
        input.setAttribute('max', max)
        input.setAttribute('min', min)

        input.value = value

        input.addEventListener('change', (e) => {
            onChange(e);
        })

        return input;
    })())
    setting.appendChild((() => {
        return document.createElement('br');
    })())
}


let setting = document.createElement('div');


setting.classList.add('setting')
setting.appendChild((() => {
    return document.createTextNode('camera: ');
})())

let select = document.createElement('select');
select.addEventListener('input', () => {
    getSteam(deviceDatas[Number(select.value)].deviceId);
})

setting.appendChild(select)




let saveButton = document.createElement('button');
saveButton.innerText = '촬영'
setting.appendChild(saveButton)

const saveATag = document.createElement('a');
saveATag.download = 'image.png';

saveButton.addEventListener('click', () => {
    saveATag.href = canvas.toDataURL('image/png')
    saveATag.click();
})

setting.appendChild((() => {
    return document.createElement('br');
})())


const width = 1920;
const height = 1080;
//rgb
const colormarginsLabel = ['red', 'green', 'blue']
const colormargins = [30, 100, 30];
const greenColors = [0, 0, 0]


// setting.appendChild((() => {
//     let div = document.createElement('div');
//     div.innerText = 'color sensitivity'
//     return div;
// })())

// for (let i = 0; i < colormargins.length; i++) {
//     const id = i;
//     addRangeInput(colormarginsLabel[i], colormargins[i], 0, 255, (e) => {
//         colormargins[id] = Number(e.target.value)
//     })
// }

let gifIndex = 0;
let gifFrames = [];
let gifFramesNum = 3
let gifFramesLoadCount = 0;
let speed = 3;

for (let i = 0; i < gifFramesNum; i++) {
    let img = document.createElement('img');
    img.addEventListener('load', () => {
        gifFramesLoadCount++;

        if(gifFramesLoadCount === gifFramesNum) {
            onLoadFrames();
        }
    })
    // img.src = `./frame-${i + 1}.png`;
    img.src = `./img-${i + 1}.png`;
    // document.body.appendChild(img)
    gifFrames.push(img);
}

setting.appendChild((() => {
    return document.createElement('br');
})())

addRangeInput('speed', speed, 1, 60, (e) => {
    speed = Number(e.target.value)
    console.log(speed)
})

function gifNextFrame() {
    gifIndex++
    if(gifIndex >= 3) {
        gifIndex = 0;
    }

    setTimeout(gifNextFrame, 1000 / speed)
}

function onLoadFrames() {
    gifNextFrame();
    // getGifCenterColor();
    draw();
}



function getGifCenterColor() {
    const canvas = document.createElement('canvas')
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(gifFrames[0], 0, 0)

    let center = ctx.getImageData(width / 2, height / 2, 1, 1);

    greenColors[0] = center.data[0]
    greenColors[1] = center.data[1]
    greenColors[2] = center.data[2]

    console.log('set green color: ', greenColors)
}


const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');
mainDiv.appendChild(canvas);

const camVideo = document.createElement('video');
camVideo.setAttribute('autoplay', '');
if(isDev) {
    document.body.appendChild(camVideo)
    window.camVideo = camVideo;
}


mainDiv.appendChild(setting)




window.addEventListener('DOMContentLoaded', () => {
    init()
})

function init() {
    select.innerHTML = null
    getDevice();
    getSteam();

    document.documentElement.scrollTop = 0;
}



let deviceDatas = [];
let isPermission = true;
function getDevice() {
    deviceDatas = [];

    select.innerHTML = null
    select.appendChild((() => {
        let op = document.createElement('option');
        op.innerText = '-- select camera --'
        op.setAttribute('disabled', '')
        op.setAttribute('selected', '')
        return op
    })())

    try {
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                let count = 0;
                for (let i = 0; i < devices.length; i++) {

                    if (devices[i].kind !== 'videoinput') {
                        continue;
                    }
                    if (devices[i].deviceId.length === 0) {
                        isPermission = false;
                        console.log('isPermission', isPermission)
                        return;
                    }

                    deviceDatas.push(devices[i])
                }

                if (!isPermission) { return; }

                for (let i = 0; i < deviceDatas.length; i++) {
                    select.appendChild((() => {
                        let option = document.createElement('option');
                        option.innerText = deviceDatas[i].label;
                        option.value = count
                        count++;
                        return option;
                    })())
                }
            })
            .catch((e) => {
                console.log(e)
                Alert.print('장치목록을 가져오지 못했습니다.\n' + e)
            });
    } catch (error) {
        console.log(error)
        Alert.print('장치목록을 가져오지 못했습니다.\n' + error)
    }
}


let tracks;
function getSteam(deviceId) {
    if(typeof tracks !== 'undefined') {
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }
    }
    const option = {}

    if (typeof deviceId === 'string') {
        option.deviceId = deviceId;
    }

    navigator.mediaDevices.getUserMedia({
        video: option
    })
    .then( (stream) => {
        tracks = stream.getTracks();
        console.log('tracks', tracks)
        
        console.log('getUserMedia')
        if (!isPermission) {
            init();
            isPermission = true;
            return;
        }


        camVideo.onloadedmetadata = () => {
            camVideo.load();
            camVideo.play();
            camVideo.onloadedmetadata = undefined
        };
        camVideo.srcObject = stream;
    })
    .catch(e => {
        console.log(e);
        Alert.print('카메라 소스를 가져오지 못했습니다. \n' + e);
    })

}

const camCavnas = document.createElement('canvas');
camCavnas.width = width;
camCavnas.height = height;
const camContext = camCavnas.getContext('2d');
if(isDev) {
    document.body.appendChild(camCavnas)
}

/*
function draw() {
    ctx.clearRect(0, 0, width, height);


    ctx.drawImage(
        gifFrames[gifIndex], 
        0, 0, 
        width, height, 
        0, 0,
        width, height
    )
    let imgdata = ctx.getImageData(0, 0, width, height);

    ctx.clearRect(0, 0, width, height);

    if (!camVideo.paused) {
        let newHeight = camVideo.videoHeight * (width / camVideo.videoWidth);
        camContext.drawImage(
            camVideo, 

            0, 0, 
            camVideo.videoWidth, camVideo.videoHeight, 

            0,
            (height - newHeight) / 2,

            width, newHeight
        )
        let videoImageData = camContext.getImageData(0, 0, width, height);
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < width * height * 4; i += 4) {
            if (
                ((greenColors[0] - colormargins[0]) <= imgdata.data[i + 0]) &&
                (imgdata.data[i + 0] <= (greenColors[0] + colormargins[0])) &&

                ((greenColors[1] - colormargins[1]) <= imgdata.data[i + 1]) &&
                (imgdata.data[i + 1] <= (greenColors[1] + colormargins[1])) &&

                ((greenColors[2] - colormargins[2]) <= imgdata.data[i + 2]) &&
                (imgdata.data[i + 2] <= (greenColors[2] + colormargins[2]))
            ) {
                imgdata.data[i + 0] = videoImageData.data[i + 0]
                imgdata.data[i + 1] = videoImageData.data[i + 1]
                imgdata.data[i + 2] = videoImageData.data[i + 2]
            }
        }
    }


    ctx.putImageData(imgdata, 0, 0)

    requestAnimationFrame(draw);
}
if(isDev) {
    window.draw = draw;
}
*/

function draw() {
    ctx.clearRect(0, 0, width, height); 
    if (!camVideo.paused) {

        let newHeight = camVideo.videoHeight * (width / camVideo.videoWidth);
        
        ctx.drawImage(
            camVideo, 

            0, 0, 
            camVideo.videoWidth, camVideo.videoHeight, 

            0,
            (height - newHeight) / 2,

            width, newHeight
        )
    }

    ctx.drawImage(
        gifFrames[gifIndex], 
        0, 0, 
        width, height, 
        0, 0,
        width, height
    )

    requestAnimationFrame(draw);
}