function initializeTranslation(currentLanguage: string = 'en') {
    Alpine.store('language', {
        currentLanguage,
        en: {
            
        },
        de: {
            
        },
    });

    return (index: string, lanuageOverride: string | null) => {
        return Alpine.store('language')[lanuageOverride ?? Alpine.store('language').currentLanguage][index] ?? index;
    }
}