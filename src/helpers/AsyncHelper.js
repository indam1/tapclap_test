export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sleepWhen(fn, pauseBetweenTrys = 100, timeout = 5000, message = 'Timed out waiting') {
    const start = Date.now();
    // eslint-disable-next-line no-await-in-loop
    while (!(await fn())) {
        if (start + timeout < Date.now()) {
            console.error(message);
        }

        // eslint-disable-next-line no-await-in-loop
        await sleep(pauseBetweenTrys);
    }
}
