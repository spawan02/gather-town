import z from "zod"

export const signUpSchema =z.object({
    username: z.string(),
    password: z.string(),
    type: z.enum(['admin', 'user'])

})

export const signInSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const updateMetadataSchema = z.object({
    avatarId: z.string()
})

export const createSpaceSchema = z.object({
  name: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  mapId: z.string().optional()
})

export const deleteElementSchema = z.object({
    id: z.string()
})

export const addElementSchema = z.object({
  elementId:z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number()

})

export const adminCreateElement = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean()
})

export const createElement = z.object({
  imageUrl: z.string()
})

export const createAvatar=z.object({
  imageUrl: z.string(),
  name: z.string()
})

export const createMap = z.object({
  thumbnail: z.string(),
  dimensions: z.string(),
  name: z.string(),
  defaultElements: z.array(z.object({
    elementId: z.string(),
    x: z.number(),
    y: z.number()
  })
)})

declare global {
    namespace Express {
      export interface Request {
        role?: "Admin" | "User";
        userId?: string;
      }
    }
}