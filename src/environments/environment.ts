export const environment = {
  production: false,
  apiUrl: "http://localhost:8002/api",
  // apiUrl: 'https://coestudycenter.com.ng/phoenix/Phoenix-api/public/api',
  // apiUrl: 'https://aandbcleaner.org/phoenix/Phoenix-api/public/api',
  analytics: {
    // Set to true once the GA4 property and Meta Pixel exist. Left off in dev
    // so local traffic never pollutes campaign data.
    enabled: false,
    ga4MeasurementId: "",
    metaPixelId: "",
  },
  pusher: {
    key: "45cde359e2dec89841a7",
    cluster: "mt1",
  },
};
