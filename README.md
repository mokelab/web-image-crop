# web-image-crop
Image crop demo

# How to implement this feature

(Javascript part is written in TypeScript)

1. Read local image file.

Add the following HTML tag.

```html
<input type="file" id="button_file"/>
```

Add `onchange` event to `input type=file` element.

```javascript
var fileElement = document.querySelector('#button_file');
(<any>fileElement).onchange = function() {
    fileChanged(this);
};
```

Get selected file and read it with `FileReader`

```javascript
function fileChanged(e : any) {
    if (e.files != null && e.files.length == 0) {
        console.log('file not selected');
        return;
    }
    var file = e.files[0];
    var fr = new FileReader();
    fr.onload = function () {
        // write later
    };
    fr.readAsDataURL(file);
}
```

2. Add `<img>` element

```
fr.onload = function () {
    var img = <HTMLImageElement>document.createElement('img');
    img.src = this.result;
    img.onload = function () {
        var frame = <HTMLElement>document.querySelector('#crop_frame');
        frame.innerHTML = ''; // clear
        frame.appendChild(img);
    };
};
```

3. Implement drag feature

Add the following element to display crop frame.

```html
<div id="crop_frame" style="width:200px;height:200px;overflow:hidden;"></div>
```

`overflow:hidden` is the key style to provide a crop frame.

Add `mouseEvent` to loaded `<img>` element.

```javascript
// crop 200x100 px
// img : loaded image
// submit : submit button
var top = 0;
var left = 0;
var frameWidth = 200;
var frameHeight = 100;
(() => {
    var startX;
    var startY;
    var clicked : boolean; 
    img.style.position = 'relative';
    img.onmousedown = (e : MouseEvent) => {
        startX = e.clientX;
        startY = e.clientY;
        clicked = true;
    };

    img.onmousemove = (e : MouseEvent) => {
        if (!clicked) { 
            e.preventDefault();
            return;
        }
        var diffX = e.clientX - startX;
        var diffY = e.clientY - startY;
        left += diffX;
        top += diffY;
        // adjust
        if (left > 0) { left = 0; }
        if (left + img.width <= frameWidth) { left = frameWidth - img.width; }
        if (top > 0) { top = 0; }
        if (top + img.height <= frameHeight) { top = frameHeight - img.height; }
        img.style.left = (left + 'px');
        img.style.top = (top + 'px');
        startX = e.clientX;
        startY = e.clientY;
        e.preventDefault();
    };

    img.onmouseup = (e : MouseEvent) => {
        clicked = false;
        e.preventDefault();
    }

    submit.onclick = () => {
        var c : any = document.createElement('canvas');
        c.width = frameWidth;
        c.height = frameHeight;
        var context = c.getContext("2d");
        context.drawImage(img, -left, -top, frameWidth, frameHeight,
                          0, 0, frameWidth, frameHeight);
        cropHandler(c.toDataURL("image/jpeg"));
    };
})();
```

Cropping process is the following

```javascript
var c : any = document.createElement('canvas');
c.width = frameWidth;
c.height = frameHeight;
var context = c.getContext("2d");
context.drawImage(img, -left, -top, frameWidth, frameHeight,
                  0, 0, frameWidth, frameHeight);
var croppedImage = c.toDataURL("image/jpeg");
```

Created `<canvas>` element is `300x150px` so we need to set cropped size. 

```
var c : any = document.createElement('canvas');
c.width = frameWidth;
c.height = frameHeight;
```

Draw!

```
var context = c.getContext("2d");
context.drawImage(img, -left, -top, frameWidth, frameHeight,
                  0, 0, frameWidth, frameHeight);
```

Convert drawn image to image data.

```
var croppedImage = c.toDataURL("image/jpeg");
```