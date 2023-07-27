export interface DiceRequest {
    result: {
        sides: number,
        count: number,
        time: number,
        rolls: number[]
    },
    signature: string
}