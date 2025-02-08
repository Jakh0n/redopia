'use server'

import { axiosClient } from '@/http/axios'
import { authOptions } from '@/lib/auth-options'
import { generateToken } from '@/lib/generate-token'
import { actionClient } from '@/lib/safe-action'
import {
	idSchema,
	searchParamsSchema,
	updateUserSchema,
} from '@/lib/validation'
import { ReturnActionType } from '@/types'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'

export const getProducts = actionClient
	.schema(searchParamsSchema)
	.action<ReturnActionType>(async ({ parsedInput }) => {
		const { data } = await axiosClient.get('/api/user/products', {
			params: parsedInput,
		})
		return JSON.parse(JSON.stringify(data))
	})

export const getProduct = actionClient
	.schema(idSchema)
	.action<ReturnActionType>(async ({ parsedInput }) => {
		const { data } = await axiosClient.get(
			`/api/user/product/${parsedInput.id}`
		)

		return JSON.parse(JSON.stringify(data))
	})

export const addFavorite = actionClient
	.schema(idSchema)
	.action<ReturnActionType>(async ({ parsedInput }) => {
		const session = await getServerSession(authOptions)
		if (!session?.currentUser)
			return { failure: 'You must be logged in to add a favorite' }
		const token = await generateToken(session?.currentUser?._id)
		const { data } = await axiosClient.post(
			'/api/user/add-favorite',
			{ productId: parsedInput.id },
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		return JSON.parse(JSON.stringify(data))
	})
export const updateUser = actionClient
	.schema(updateUserSchema)
	.action<ReturnActionType>(async ({ parsedInput }) => {
		const session = await getServerSession(authOptions)
		if (!session?.currentUser)
			return { failure: 'You must be logged in to add a favorite' }
		const token = await generateToken(session?.currentUser?._id)
		const { data } = await axiosClient.put(
			'/api/user/update-profile',
			parsedInput,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		)
		revalidatePath('/dashboard')
		return JSON.parse(JSON.stringify(data))
	})
