
const text = "This is inline $x^2$ and this is block $$y^2$$ math.";

function testRegex(t) {
    console.log("Testing text:", t);

    // Current implementation
    const currentParts = t.split(/\$([^$]+)\$/g);
    console.log("Current split:", currentParts);

    // Simulation of rendering
    const currentRender = currentParts.map((part, i) => {
        if (i % 2 === 1) {
            return `[MATH: ${part}]`;
        }
        return part;
    }).join("");
    console.log("Current render:", currentRender);

    // Proposed implementation
    // Regex to match $$...$$ OR $...$
    // We use capturing group for the whole match to keep it in the split result
    const newRegex = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
    const newParts = t.split(newRegex);
    console.log("New split:", newParts);

    const newRender = newParts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            return `[BLOCK: ${part.slice(2, -2)}]`;
        } else if (part.startsWith('$') && part.endsWith('$')) {
            return `[INLINE: ${part.slice(1, -1)}]`;
        } else {
            return part;
        }
    }).join("");
    console.log("New render:", newRender);
}

testRegex("This is inline $x^2$ and this is block $$y^2$$ math.");
testRegex("$$x$$");
testRegex("A $$ x $$ B");
