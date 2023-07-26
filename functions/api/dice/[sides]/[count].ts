// "Rolls dice" with the specified number of sides
// Returns the array of dice rolls plus a digital signature
// the request count, sides, and request time, and result array are signed with the private key
// the client can verify the signature with the public key 
export const onRequest: PagesFunction<unknown> = async (context) => {
    const sides: number = parseInt(context.params.sides as string);
    const count: number = parseInt(context.params.count as string);

    if (isNaN(sides) || sides < 1 || sides > 999) return new Response('Bad Request', { status: 400 });
    if (isNaN(count) || count < 1 || count > 999) return new Response('Bad Request', { status: 400 });

    // roll the dice
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const result = {
        count: count,
        sides: sides,
        time: Date.now(),
        rolls: rolls
    }

    // sign the result
    const signature = await sign(result);

    // return the result and signature
    return new Response(JSON.stringify({ result, signature }));
};

// sign the result with the private key
async function sign(result: any): Promise<string> {
    
    // TODO: implement signing

    return '';
}