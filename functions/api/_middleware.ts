export const onRequest: PagesFunction<unknown> = async (context) => {
    try {
        return await context.next();
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }
};