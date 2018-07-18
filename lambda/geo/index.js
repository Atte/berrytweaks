const wc = require('which-country');
const iso = require('iso-3166-1');

exports.handler = async (event) => {
    const alpha3 = wc([event.queryStringParameters.lng, event.queryStringParameters.lat]);
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Max-Age': '600',
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=60'
        },
        body: JSON.stringify(alpha3 && iso.whereAlpha3(alpha3) || null)
    };
};
