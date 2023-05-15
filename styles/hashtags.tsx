import reactStringReplace from "react-string-replace";

export function parseHashtags(text: string) {
    return text.split(' ').map(word => {
        if (word.startsWith('#')) {
            return `<span class="htag">${word}</span>`
        } else {
            return word
        }
    }).join(' ')
}

export function parseHashtagsFixed(text: string) {
    return reactStringReplace(text, /#(\w+)/g, (match, i) => (
        <span key={i} className="htag">#{match}</span>
    ));
}


