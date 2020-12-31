export function escapeForBash(cmd) {
    return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
};

export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element
export function getCanvasWordWrapLines(context, text, maxWidth) {
    const paragraphs = text.split("\n");
    const paraSplit = paragraphs.map(t => {
        var words = t.split(" ");
        var lines = [];
        var currentLine = words[0];
    
        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = context.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    });
    return paraSplit.flat();
}