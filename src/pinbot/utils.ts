export function checkImageURL(urlString:string):boolean {
    let isImage = false;
    let urlType = urlString.substring(urlString.length - 4);
    switch (urlType) {
        case ".png":
            isImage = true;
            break;
        case ".jpg":
            isImage = true;
            break;
        case ".gif":
            isImage = true;
            break;
    }
    return isImage;
}