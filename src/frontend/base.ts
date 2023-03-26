var Alpine: {
    store(store: string, data: any): void
    store(store: string): any
};

const _global = (window || global) as any

let basicPost: any = () => {
    return {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'auth-token': Alpine.store('credentials').password
        }
    };
}

function collapse(id: string) {
    let element = document.getElementById(id);

    if (!element) return;

    if (element.classList.contains("show")) {
        element.classList.remove("show")
    }
    else {
        element.classList.add("show")
    }
}

type Dictionary<T> = { [key: string]: T }
