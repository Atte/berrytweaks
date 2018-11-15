// https://github.com/developit/greenlet/blob/master/greenlet.js
// v1.0.1
// with added setupFunction handling

BerryTweaks.lib['greenlet'] = (function(){
'use strict';

/** Move an async function into its own thread.
 *  @param {Function} asyncFunction  An (async) function to run in a Worker.
 *  @param {Function} [setupFunction]  A synchronous function to run at Worker initialization.
 *  @public
 */
function greenlet(asyncFunction, setupFunction) {
    // A simple counter is used to generate worker-global unique ID's for RPC:
    // The value -1 is reserved for setupFunction exceptions
    let currentId = 0;

    // Outward-facing promises store their "controllers" (`[request, reject]`) here:
    const promises = {};

    // Stores the exception if setupFunction fails:
    let setupException = undefined;

    // Create code for invoking setupFunction, if one was given:
    const setupSnippet = setupFunction ? `
        try {
            (${setupFunction})();
        }
        catch (e) {
            postMessage([-1, 1, e]);
            throw e;
        }
    ` : '';

    // Create an "inline" worker (1:1 at definition time)
    const worker = new Worker(
        // Use a data URI for the worker's src. It inlines the setup and target functions and an RPC handler:
        'data:'+setupSnippet+',$$='+asyncFunction+';onmessage='+(e => {
            /* global $$ */

            /* Invoking within then() captures exceptions in the supplied async function as rejections */
            Promise.resolve(e.data[1]).then(
                v => $$.apply($$, v)
            ).then(
                /* success handler - callback(id, SUCCESS(0), result) */
                /* if `d` is transferable transfer zero-copy */
                d => {
                    postMessage([e.data[0], 0, d], [d].filter(x => (
                        (x instanceof ArrayBuffer) ||
                        (x instanceof MessagePort) ||
                        (x instanceof ImageBitmap)
                    )));
                },
                /* error handler - callback(id, ERROR(1), error) */
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
        // Handle setupFunction error
        if (e.data[0] === -1) {
            // Store exception for future invocations
            setupException = e.data[2];

            // Call reject() on all promises, then delete them
            for (const key of Object.keys(promises)) {
                promises[key][1](setupException);
                delete promises[key];
            }

            return;
        }

        // invoke the promise's resolve() or reject() depending on whether there was an error.
        promises[e.data[0]][e.data[1]](e.data[2]);

        // ... then delete the promise controller
        delete promises[e.data[0]];
    };

    // Return a proxy function that forwards calls to the worker & returns a promise for the result.
    return function (args) {
        args = [].slice.call(arguments);
        return new Promise(function (resolve, reject) {
            // Reject early if setupFunction failed
            if (setupException !== undefined) {
                reject(setupException);
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
