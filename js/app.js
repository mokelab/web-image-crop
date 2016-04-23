const SMALL_WIDTH = -1;
const SMALL_HEIGHT = -2;
class ImageCropper {
    readImageFile(file, frame) {
        return new Promise((resolve, reject) => {
            if (!/(jpg|png)$/.test(file.type)) {
                reject('file is not jpg/png');
            }
            var img = document.createElement('img');
            var fr = new FileReader();
            fr.onload = function () {
                img.src = this.result;
                img.onload = function () {
                    if (this.width < frame.clientWidth) {
                        reject({
                            code: SMALL_WIDTH,
                        });
                        return;
                    }
                    if (this.height < frame.clientHeight) {
                        reject({
                            code: SMALL_HEIGHT,
                        });
                        return;
                    }
                    resolve(this);
                };
            };
            fr.readAsDataURL(file);
        });
    }
    setEvents(frame, img, submit, cropHandler) {
        var top = 0;
        var left = 0;
        var frameWidth = frame.clientWidth;
        var frameHeight = frame.clientHeight;
        (() => {
            var startX;
            var startY;
            var clicked;
            img.style.position = 'relative';
            img.onmousedown = (e) => {
                startX = e.clientX;
                startY = e.clientY;
                clicked = true;
            };
            img.onmousemove = (e) => {
                if (!clicked) {
                    e.preventDefault();
                    return;
                }
                var diffX = e.clientX - startX;
                var diffY = e.clientY - startY;
                left += diffX;
                top += diffY;
                // adjust
                if (left > 0) {
                    left = 0;
                }
                if (left + img.width <= frameWidth) {
                    left = frameWidth - img.width;
                }
                if (top > 0) {
                    top = 0;
                }
                if (top + img.height <= frameHeight) {
                    top = frameHeight - img.height;
                }
                img.style.left = (left + 'px');
                img.style.top = (top + 'px');
                startX = e.clientX;
                startY = e.clientY;
                e.preventDefault();
            };
            img.onmouseup = (e) => {
                clicked = false;
                e.preventDefault();
            };
            submit.onclick = () => {
                var c = document.createElement('canvas');
                c.width = frameWidth;
                c.height = frameHeight;
                var context = c.getContext("2d");
                context.drawImage(img, -left, -top, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                cropHandler(c.toDataURL("image/jpeg"));
            };
        })();
    }
}
function fileChanged(e) {
    if (e.files != null && e.files.length == 0) {
        console.log('file not selected');
        return;
    }
    var file = e.files[0];
    var frame = document.querySelector('#crop_frame');
    var cropper = new ImageCropper();
    cropper.readImageFile(file, frame).then((img) => {
        frame.innerHTML = '';
        frame.appendChild(img);
        var submitButton = document.querySelector('#button_submit');
        submitButton.style.visibility = 'visible';
        cropper.setEvents(frame, img, submitButton, (data) => {
            // output
            var outputFrame = document.querySelector('#output');
            var outImage = document.createElement('img');
            outImage.src = data;
            outputFrame.innerHTML = '';
            outputFrame.appendChild(outImage);
        });
    }).catch((error) => {
        if (error.code == SMALL_WIDTH) {
            alert('width must be more than 200 px');
        }
        if (error.code == SMALL_HEIGHT) {
            alert('height must be more than 200 px');
        }
    });
}
window.onload = () => {
    var fileElement = document.querySelector('#button_file');
    fileElement.onchange = function () {
        fileChanged(this);
    };
};
