import React from 'react'
import Image from 'next/image'
import SignInFormClient from '@/modules/auth/components/sign-in-form-client'
const page = () => {
  return (
    <>
    <Image src={"/login.svg"} alt='Input-Login' height={300} width={300}/>
    <SignInFormClient/>
    </>
  )
}

export default page