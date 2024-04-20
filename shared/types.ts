import { InferType, object, string } from 'yup';

export * from '../durable_objects/src/types';

export type RandomRequest = {
	secret: string;
};

export const RandomResponseSchema = object({
	result: object({
		hash: string().required().length(32),
		nonce: string().required().length(32)
	}),
	signature: string().required()
});

export type RandomResponse = InferType<typeof RandomResponseSchema>;
