export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// const url_params = new URLSearchParams(window.location.search);
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function blobToDataURL(blob: Blob, callback: Function): void {
  const a = new FileReader();
  a.onload = function (e) {
    callback(e.target?.result);
  };
  a.readAsDataURL(blob);
}
