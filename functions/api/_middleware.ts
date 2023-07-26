export const onRequest: PagesFunction<unknown> = async (context) => {
    try {
        // time function execution
        const start = Date.now();

        const res = await context.next();

        // log function execution time
        const end = Date.now();
        console.log(`Function execution time: ${end - start}ms`);

        return res;
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }
};