export const pastelColors = [
    0xffb3ba, 0xffdfba, 0xffffba, 0xbaffc9, 0xbae1ff,
    0xd4a5a5, 0x9dc888, 0xfdfd96, 0x84b6f4, 0xfdcae1
];

export const getColor = (x, z) => {
    const index = Math.abs(Math.floor(x * 3 + z * 7)) % pastelColors.length;
    return pastelColors[index];
};

export const makeTextTexture = (text, bgColor, textColor) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // We cannot return CanvasTexture here cleanly in React render because it needs context.
    // So we return the canvas itself, and component will create `new CanvasTexture(canvas)`
    return canvas;
};
