import bcrypt from "bcrypt"
import { randomBytes } from "crypto"

 
export const hashPassword = async (password:string) => {
    const salt = randomBytes(16).toString('hex')
    const hashValue = await bcrypt.hash(password,salt)
    return hashValue

}

export const comparePassword = async(password:string, hashedPassword:string)=>{
    const value = await bcrypt.compare(password,hashedPassword)
    return value
}


