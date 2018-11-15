// https://github.com/developit/greenlet/blob/master/greenlet.js
// v1.0.1
// with added importScripts handling

BerryTweaks.lib['greenlet'] = (function(){
'use strict';

/** Move an async function into its own thread.
 *  @param {Function} asyncFunction  An (async) function to run in a Worker.
 *  @public
 */
function greenlet(asyncFunction, imports) {
    // A simple counter is used to generate worker-global unique ID's for RPC:
    // The value -1 is reserved for importScripts errors
    let currentId = 0;

    // Outward-facing promises store their "controllers" (`[request, reject]`) here:
    const promises = {};

    // Stores the error if importScripts fails:
    let importError = null;

    // Create code for loading imports, if any:
    const importer = imports ? `
        try {
            importScripts(...${JSON.stringify(imports)});
        } catch(e) {
            postMessage([-1, 1, e]);
            throw e;
        }
    ` : '';

    // Create an "inline" worker (1:1 at definition time)
    const worker = new Worker(
        // Use a data URI for the worker's src. It inlines the target function and an RPC handler:
        'data:,'+importer+'$$='+asyncFunction+';onmessage='+(e => {
            /* global $$ */

            Promise.resolve(e.data[1]).then(
                v => $$.apply($$, v)
            ).then(
                d => {
                    postMessage([e.data[0], 0, d], [d].filter(x => (
                        (x instanceof ArrayBuffer) ||
                        (x instanceof MessagePort) ||
                        (x instanceof ImageBitmap)
                    )));
                },
                er => { postMessage([e.data[0], 1, '' + er]); }
            );
        })
    );

    /** Handle RPC results/errors coming back out of the worker.
     *  Messages coming from the worker take the form `[id, status, result]`:
     *    id     - counter-based unique ID for the RPC call
     *    status - 0 for success, 1 for failure
     *    result - the result or error, depending on `status`
     */
    worker.onmessage = e => {
        // Handle importScripts error
        if (e.data[0] === -1) {
            importError = e.data[2];

            // Call reject() on all promises
            for (const promise of Object.values(promises)) {
                promise[1](importError);
            }
            promises = {};

            return;
        }

        // invoke the promise's resolve() or reject() depending on whether there was an error.
        promises[e.data[0]][e.data[1]](e.data[2]);

        // ... then delete the promise controller
        promises[e.data[0]] = null;
    };

    // Return a proxy function that forwards calls to the worker & returns a promise for the result.
    return function (args) {
        args = [].slice.call(arguments);
        return new Promise(function (resolve, reject) {
            // Reject early if importScripts failed
            if (importError !== null) {
                reject(importError);
                return;
            }

            // Add the promise controller to the registry
            promises[++currentId] = arguments;

            // Send an RPC call to the worker - call(id, params)
            // The filter is to provide a list of transferables to send zero-copy
            worker.postMessage([currentId, args], args.filter(x => (
                (x instanceof ArrayBuffer) ||
                (x instanceof MessagePort) ||
                (x instanceof ImageBitmap)
            )));
        });
    };
}

return greenlet;

})();
