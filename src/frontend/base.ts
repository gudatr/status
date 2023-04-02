var Alpine: {
    store(store: string, data: any): void
    store(store: string): any
};

const _global = (window || global) as any

function getCookie(name: string): string | undefined {
    return document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))?.pop();
}

function basicPost() {
    return {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Authorization': document.cookie
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
