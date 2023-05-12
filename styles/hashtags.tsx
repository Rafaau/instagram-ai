import reactStringReplace from "react-string-replace";

export function parseHashtags(text: string) {
    return text.split(' ').map(word => {
        if (word.startsWith('#')) {
            return `<span class="text-blue-500 cursor-pointer">${word}</span>`
        } else {
            return word
        }
    }).join(' ')
}

export function parseHashtagsFixed(text: string) {
    return reactStringReplace(text, /#(\w+)/g, (match, i) => (
        <span key={i} className="text-blue-500 cursor-pointer">#{match}</span>
    ));
}


