const aws = require('aws-sdk');
const fetch = require('node-fetch');
const xml2js = require('xml2js-es6-promise');

const UPSTREAM = 'http://map.berrytube.tv/phpsqlajax_genxml.php';
const TABLE = 'btmap';

const db = new aws.DynamoDB.DocumentClient();

async function setCacheData(data) {
    await db.put({
        TableName: TABLE,
        Item: {
            key: 'cache-data',
            data: data
        }
    }).promise();
    await db.put({
        TableName: TABLE,
        Item: {
            key: 'cache-time',
            data: new Date().getTime()
        }
    }).promise();
}

async function getCacheTime() {
    const result = await db.get({
        TableName: TABLE,
        Key: {
            key: 'cache-time'
        }
    }).promise();
    return result.Item.data;
}

async function getCacheData() {
    const result = await db.get({
        TableName: TABLE,
        Key: {
            key: 'cache-data'
        }
    }).promise();
    return result.Item.data;
}

exports.handler = async (event) => {
    let results = null;

    try {
        if (new Date().getTime() - await getCacheTime() < 1000 * 60 * 60) {
            results = await getCacheData();
        }
    } catch(e) {
        console.error(e);
    }

    if (results === null) {
        try {
            const resp = await fetch(UPSTREAM, { timeout: 1000 * 3 });
            const data = await xml2js(await resp.text());
            results = {};
            for (const el of data.markers.marker) {
                const user = el['$'];
                results[user.name.toLowerCase()] = {
                    lat: parseFloat(user.lat),
                    lng: parseFloat(user.lng),
                };
            }
            try {
                await setCacheData(results);
            } catch(e) {
                console.error(e);
            }
        } catch(e) {
            console.error(e);
            results = await getCacheData();
        }
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Max-Age': '600',
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=60'
        },
        body: JSON.stringify(results)
    };
};
