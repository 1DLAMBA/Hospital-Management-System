export const environment = {
    production: true,
    // apiUrl: 'http://localhost:8080/api',
    apiUrl: 'https://phoenixapi.coestudycenter.com.ng/api',  
    // apiUrl: 'https://aandbcleaner.org/phoenix/Phoenix-api/public/api',
    analytics: {
        // Fill these in from Google Analytics (Admin > Data Streams) and
        // Meta Events Manager, then set enabled to true to start collecting.
        enabled: false,
        ga4MeasurementId: '',
        metaPixelId: '',
    },
    pusher: {
        key: '45cde359e2dec89841a7',
        cluster: 'mt1'
    }
}   